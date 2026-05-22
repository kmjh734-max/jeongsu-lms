"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  actionError,
  actionSuccess,
  type ActionResult,
} from "@/lib/vocab/actions-shared";
import {
  STAGE3_PASS_SCORE,
  type Stage3QuestionType,
} from "@/lib/vocab/build-stage3-questions";
import {
  fallbackMeaningFeedback,
  gradeMeaningFallback,
  gradeMeaningWithAi,
  type MeaningGradeInput,
} from "@/lib/vocab/grade-meaning-ai";
import { gradeSpellingAnswer } from "@/lib/vocab/grade-spelling";
import { loadStageProgress } from "@/lib/vocab/load-stage-progress";
import { gradeVocabTestSubmission } from "@/lib/vocab/grade-test";
import { isVocabTestType, type VocabTestType } from "@/lib/vocab/test-types";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import type { VocabItem } from "@/types/database";

export type SubmitStage3Result = ActionResult & { attemptId?: string };

async function requireStudent() {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== "student") {
    return { profile: null, error: actionError("학생 권한이 필요합니다.") };
  }
  return { profile, error: null };
}

async function assertAssignedSet(
  supabase: Awaited<ReturnType<typeof createClient>>,
  studentId: string,
  setId: string
) {
  const { data } = await supabase
    .from("vocab_sets")
    .select("id")
    .eq("id", setId)
    .single();
  if (!data) return actionError("단어장을 찾을 수 없습니다.");
  return null;
}

export async function recordStage1Item(
  setId: string,
  itemId: string,
  known: boolean
): Promise<ActionResult> {
  const { profile, error } = await requireStudent();
  if (error) return error;

  const supabase = await createClient();
  const assignErr = await assertAssignedSet(supabase, profile!.id, setId);
  if (assignErr) return assignErr;

  const progress = await loadStageProgress(supabase, profile!.id, setId);
  if (progress.stage1_completed) {
    return actionSuccess("1단계는 이미 완료되었습니다.");
  }

  const seen = new Set(progress.stage1_seen_item_ids ?? []);
  seen.add(itemId);

  const { data: existing } = await supabase
    .from("vocab_progress")
    .select("id, studied_count")
    .eq("student_id", profile!.id)
    .eq("item_id", itemId)
    .maybeSingle();

  const status = known ? "known" : "review";
  const now = new Date().toISOString();

  if (existing) {
    await supabase
      .from("vocab_progress")
      .update({
        status,
        studied_count: (existing.studied_count ?? 0) + 1,
        last_studied_at: now,
      })
      .eq("id", existing.id);
  } else {
    await supabase.from("vocab_progress").insert({
      student_id: profile!.id,
      item_id: itemId,
      status,
      studied_count: 1,
      last_studied_at: now,
    });
  }

  const { data: items } = await supabase
    .from("vocab_items")
    .select("id")
    .eq("set_id", setId);

  const total = (items ?? []).length;
  const seenIds = [...seen];
  const allSeen = total > 0 && seenIds.length >= total;

  await supabase
    .from("vocab_stage_progress")
    .update({
      stage1_seen_item_ids: seenIds,
      stage1_completed: allSeen,
      stage1_completed_at: allSeen ? now : null,
      updated_at: now,
    })
    .eq("id", progress.id);

  revalidatePath("/student/vocab");
  revalidatePath(`/student/vocab/${setId}`);

  if (allSeen) {
    return actionSuccess("1단계를 완료했습니다. 2단계를 시작할 수 있습니다.");
  }
  return actionSuccess(known ? "알아요로 기록했습니다." : "몰라요로 기록했습니다.");
}

export async function recordStage2Attempt(
  setId: string,
  itemId: string,
  studentAnswer: string,
  isCorrect: boolean,
  attemptRound: number
): Promise<ActionResult> {
  const { profile, error } = await requireStudent();
  if (error) return error;

  const supabase = await createClient();
  const progress = await loadStageProgress(supabase, profile!.id, setId);

  if (!progress.stage1_completed) {
    return actionError("1단계를 먼저 완료해 주세요.");
  }
  if (progress.stage2_completed) {
    return actionSuccess("2단계는 이미 완료되었습니다.");
  }

  await supabase.from("vocab_spelling_attempts").insert({
    student_id: profile!.id,
    set_id: setId,
    item_id: itemId,
    student_answer: studentAnswer,
    is_correct: isCorrect,
    attempt_round: attemptRound,
  });

  return actionSuccess(isCorrect ? "정답입니다." : "오답입니다. 다시 연습합니다.");
}

export async function completeStage2(setId: string): Promise<ActionResult> {
  const { profile, error } = await requireStudent();
  if (error) return error;

  const supabase = await createClient();
  const progress = await loadStageProgress(supabase, profile!.id, setId);

  if (!progress.stage1_completed) {
    return actionError("1단계를 먼저 완료해 주세요.");
  }

  const now = new Date().toISOString();
  await supabase
    .from("vocab_stage_progress")
    .update({
      stage2_completed: true,
      stage2_completed_at: now,
      updated_at: now,
    })
    .eq("id", progress.id);

  revalidatePath("/student/vocab");
  revalidatePath(`/student/vocab/${setId}`);

  return actionSuccess("2단계를 완료했습니다. 종합테스트를 시작할 수 있습니다.");
}

export async function submitStage3(
  setId: string,
  answers: { itemId: string; studentAnswer: string; questionType: string }[]
): Promise<SubmitStage3Result> {
  const { profile, error } = await requireStudent();
  if (error) return error;

  const supabase = await createClient();
  const progress = await loadStageProgress(supabase, profile!.id, setId);

  if (!progress.stage2_completed) {
    return actionError("2단계를 먼저 완료해 주세요.");
  }

  const { data: items } = await supabase
    .from("vocab_items")
    .select("*")
    .eq("set_id", setId)
    .order("order_index")
    .order("created_at");

  const itemList = (items ?? []) as VocabItem[];
  if (itemList.length < 1) {
    return actionError("단어가 없습니다.");
  }

  const itemById = new Map(itemList.map((i) => [i.id, i]));

  type GradedRow = {
    itemId: string;
    questionType: Stage3QuestionType;
    questionText: string;
    correctAnswer: string;
    studentAnswer: string;
    isCorrect: boolean;
    aiFeedback: string | null;
  };

  const meaningPending: {
    answerIndex: number;
    input: MeaningGradeInput;
    row: Omit<GradedRow, "isCorrect" | "aiFeedback">;
  }[] = [];

  const graded: GradedRow[] = answers.map((a, answerIndex) => {
    const item = itemById.get(a.itemId);
    const studentAnswer = a.studentAnswer ?? "";
    const questionType: Stage3QuestionType =
      a.questionType === "spelling" ? "spelling" : "meaning";

    if (!item) {
      return {
        itemId: a.itemId,
        questionType,
        questionText: "",
        correctAnswer: "",
        studentAnswer,
        isCorrect: false,
        aiFeedback: null,
      };
    }

    if (questionType === "spelling") {
      const questionText = item.meaning.trim();
      const correctAnswer = item.word.trim();
      return {
        itemId: item.id,
        questionType: "spelling",
        questionText,
        correctAnswer,
        studentAnswer,
        isCorrect: gradeSpellingAnswer(correctAnswer, studentAnswer),
        aiFeedback: null,
      };
    }

    const questionText = item.word.trim();
    const correctAnswer = item.meaning.trim();
    const row = {
      itemId: item.id,
      questionType: "meaning" as const,
      questionText,
      correctAnswer,
      studentAnswer,
    };
    meaningPending.push({
      answerIndex,
      input: {
        word: item.word.trim(),
        correctMeaning: correctAnswer,
        studentAnswer,
      },
      row,
    });
    return {
      ...row,
      isCorrect: false,
      aiFeedback: null,
    };
  });

  if (meaningPending.length > 0) {
    const aiInputs = meaningPending.map((p) => p.input);
    const aiResult = await gradeMeaningWithAi(aiInputs);

    meaningPending.forEach((pending, i) => {
      let isCorrect = false;
      let aiFeedback: string | null = null;

      if (aiResult.ok) {
        const r = aiResult.results[i];
        isCorrect = r?.isCorrect ?? false;
        aiFeedback =
          r?.feedback ??
          (isCorrect
            ? "의미상 정답으로 볼 수 있습니다."
            : "정답과 의미가 다릅니다.");
      } else {
        isCorrect = gradeMeaningFallback(
          pending.input.correctMeaning,
          pending.input.studentAnswer
        );
        aiFeedback = `${fallbackMeaningFeedback(isCorrect)} (${aiResult.message})`;
      }

      graded[pending.answerIndex] = {
        ...pending.row,
        isCorrect,
        aiFeedback,
      };
    });
  }

  const correctCount = graded.filter((g) => g.isCorrect).length;
  const totalQuestions = graded.length;
  const score =
    totalQuestions > 0
      ? Math.round((correctCount / totalQuestions) * 100)
      : 0;
  const passed = score >= STAGE3_PASS_SCORE;
  const now = new Date().toISOString();

  const { data: attempt, error: attemptError } = await supabase
    .from("vocab_final_test_attempts")
    .insert({
      set_id: setId,
      student_id: profile!.id,
      score,
      total_questions: totalQuestions,
      correct_count: correctCount,
      passed,
      submitted_at: now,
    })
    .select("id")
    .single();

  if (attemptError || !attempt) {
    return actionError(attemptError?.message ?? "저장에 실패했습니다.");
  }

  const { error: answersError } = await supabase
    .from("vocab_final_test_answers")
    .insert(
      graded.map((g) => ({
        attempt_id: attempt.id,
        item_id: g.itemId,
        question_type: g.questionType,
        question_text: g.questionText,
        correct_answer: g.correctAnswer,
        student_answer: g.studentAnswer,
        is_correct: g.isCorrect,
        ai_feedback: g.aiFeedback,
      }))
    );

  if (answersError) {
    await supabase
      .from("vocab_final_test_attempts")
      .delete()
      .eq("id", attempt.id);
    return actionError(answersError.message);
  }

  const bestScore = Math.max(progress.stage3_best_score ?? 0, score);
  const attemptCount = (progress.stage3_attempt_count ?? 0) + 1;

  await supabase
    .from("vocab_stage_progress")
    .update({
      stage3_last_score: score,
      stage3_best_score: bestScore,
      stage3_attempt_count: attemptCount,
      stage3_passed: passed || progress.stage3_passed,
      stage3_passed_at:
        passed && !progress.stage3_passed_at
          ? now
          : progress.stage3_passed_at,
      updated_at: now,
    })
    .eq("id", progress.id);

  revalidatePath("/student/vocab");
  revalidatePath(`/student/vocab/${setId}`);

  return {
    ...actionSuccess(passed ? "합격입니다!" : "불합격입니다. 다시 도전해 보세요."),
    attemptId: attempt.id as string,
  };
}

/** @deprecated VocabLearningSession 호환 */
export async function recordVocabProgress(
  itemId: string,
  known: boolean
): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: item } = await supabase
    .from("vocab_items")
    .select("set_id")
    .eq("id", itemId)
    .single();
  if (!item) return actionError("단어를 찾을 수 없습니다.");
  return recordStage1Item(item.set_id as string, itemId, known);
}

/** @deprecated 구 통합 세션 — 3단계 제출로 대체 */
export async function submitFinalExam(
  setId: string,
  answers: { itemId: string; studentAnswer: string; questionType: string }[]
): Promise<SubmitStage3Result> {
  return submitStage3(setId, answers);
}

/** @deprecated 구 테스트 러너용 — vocab_test_attempts에 저장 */
export async function submitVocabTest(
  setId: string,
  testType: string,
  answers: { itemId: string; studentAnswer: string }[],
  itemOrder: string[]
): Promise<SubmitStage3Result> {
  const { profile, error } = await requireStudent();
  if (error) return error;

  const supabase = await createClient();
  const { data: items } = await supabase
    .from("vocab_items")
    .select("*")
    .eq("set_id", setId);

  const itemList = (items ?? []) as VocabItem[];

  if (!isVocabTestType(testType) || testType === "final_exam") {
    return actionError("올바르지 않은 테스트 유형입니다.");
  }

  const typedTestType = testType as Exclude<VocabTestType, "final_exam">;
  const answerMap = new Map(answers.map((a) => [a.itemId, a.studentAnswer ?? ""]));
  const order = itemOrder.length > 0 ? itemOrder : itemList.map((i) => i.id);
  const { graded, correctCount, totalQuestions, score } = gradeVocabTestSubmission(
    itemList,
    typedTestType,
    answerMap,
    order
  );

  const now = new Date().toISOString();
  const { data: attempt, error: attemptError } = await supabase
    .from("vocab_test_attempts")
    .insert({
      set_id: setId,
      student_id: profile!.id,
      test_type: typedTestType,
      score,
      total_questions: totalQuestions,
      correct_count: correctCount,
      started_at: now,
      submitted_at: now,
    })
    .select("id")
    .single();

  if (attemptError || !attempt) {
    return actionError(attemptError?.message ?? "저장에 실패했습니다.");
  }

  await supabase.from("vocab_test_answers").insert(
    graded.map((g) => ({
      attempt_id: attempt.id,
      item_id: g.itemId,
      question_type: g.questionType,
      question_text: g.questionText,
      correct_answer: g.correctAnswer,
      student_answer: g.studentAnswer,
      is_correct: g.isCorrect,
      choices: g.choices,
    }))
  );

  revalidatePath("/student/vocab");
  return {
    ...actionSuccess("제출되었습니다."),
    attemptId: attempt.id as string,
  };
}
