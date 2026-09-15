"use server";

import { revalidatePath } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  actionError,
  actionSuccess,
  type ActionResult,
} from "@/lib/vocab/actions-shared";
import {
  buildStage3Questions,
  scoreStage4,
  stage4QuestionSeed,
  type Stage3QuestionType,
} from "@/lib/vocab/build-stage3-questions";
import {
  buildExampleBlankQuestions,
  gradeExampleBlankAnswer,
} from "@/lib/vocab/example-blank";
import {
  cleanMeaningFeedback,
  gradeMeaningWithAi,
  type MeaningGradeInput,
} from "@/lib/vocab/grade-meaning-ai";
import { gradeSpellingAnswer } from "@/lib/vocab/grade-spelling";
import { loadStageProgress } from "@/lib/vocab/load-stage-progress";
import {
  MAX_LIST_LENGTH,
  cleanAnswer,
  loadSetItems,
  recordStage1Batch,
  recordStage2Batch,
  recordStage3Batch,
  studentSetContext,
  type PracticeAttempt,
  type Stage1Response,
  type Stage1Result,
} from "@/lib/vocab/student-study-writes";
import { ensureExamCompactStageSkip } from "@/lib/question-generator/exam-vocab";
import type { VocabItem } from "@/types/database";

/*
 * 학생 단어학습 쓰기는 모두 서버에서만 한다.
 * 학생 계정에는 진행·점수 테이블 쓰기 권한이 없다(마이그레이션 130).
 * 로그인한 학생 본인인지, 이 단어장을 배정받았는지 확인한 뒤 service role로 쓴다
 * (확인·기록 로직은 lib/vocab/student-study-writes.ts).
 * 문제를 푸는 동안의 기록은 /api/student/vocab/record 로 모아서 보내고,
 * 단계를 끝낼 때만 아래 서버 액션을 부른다.
 */

export type SubmitStage4Result = ActionResult & { attemptId?: string };
/** @deprecated SubmitStage4Result 사용 */
export type SubmitStage3Result = SubmitStage4Result;

export interface PracticeAnswer {
  itemId: string;
  answer: string;
}

function revalidateSet(setId: string) {
  revalidatePath("/student/vocab");
  revalidatePath(`/student/vocab/${setId}`);
}

/* ------------------------------------------------------------------------ */
/* 1단계 · 뜻 익히기                                                          */
/* ------------------------------------------------------------------------ */

export type { Stage1Result };

/** 1단계 카드 기록 (마지막 묶음을 보낼 때 쓴다 — 완료되면 화면 캐시를 새로 고친다) */
export async function recordStage1Items(
  setId: string,
  responses: Stage1Response[],
  seenIds?: string[]
): Promise<Stage1Result> {
  const { ctx, error } = await studentSetContext(setId);
  if (error) return error;
  const result = await recordStage1Batch(ctx, setId, responses, seenIds);
  if (result.ok && result.completed) revalidateSet(setId);
  return result;
}

/** @deprecated recordStage1Items 사용 */
export async function recordStage1Item(
  setId: string,
  itemId: string,
  known: boolean,
  seenIds?: string[]
): Promise<ActionResult> {
  return recordStage1Items(setId, [{ itemId, known }], seenIds);
}

/* ------------------------------------------------------------------------ */
/* 2단계 · 스펠링                                                            */
/* ------------------------------------------------------------------------ */

/** 스펠링 입력 기록 (마지막 묶음) — 정답 여부는 서버가 다시 채점한다 */
export async function recordStage2Attempts(
  setId: string,
  attempts: PracticeAttempt[]
): Promise<ActionResult> {
  const { ctx, error } = await studentSetContext(setId);
  if (error) return error;
  return recordStage2Batch(ctx, setId, attempts);
}

/**
 * 2단계 완료. 지금 단어장의 모든 단어를 한 번은 맞혔는지 서버가 확인한다
 * (이번 화면에서 맞힌 답 + 이미 저장된 정답 기록).
 */
export async function completeStage2(
  setId: string,
  correctAnswers: PracticeAnswer[] = []
): Promise<ActionResult> {
  const { ctx, error } = await studentSetContext(setId);
  if (error) return error;
  const { admin, studentId } = ctx;

  const progress = await loadStageProgress(admin, studentId, setId, {
    createIfMissing: false,
    fields: "hub",
  });
  if (!progress.id || !progress.stage1_completed) {
    return actionError("1단계를 먼저 끝내 주세요.");
  }

  if (!progress.stage2_completed) {
    const [items, { data: savedCorrect }] = await Promise.all([
      loadSetItems<{ id: string; word: string }>(admin, setId, "id, word"),
      admin
        .from("vocab_spelling_attempts")
        .select("item_id")
        .eq("student_id", studentId)
        .eq("set_id", setId)
        .eq("is_correct", true),
    ]);
    if (items.length < 1) return actionError("단어가 없어요.");

    const covered = new Set(
      (savedCorrect ?? []).map((r) => r.item_id as string)
    );
    const wordById = new Map(items.map((i) => [i.id, i.word]));
    for (const a of Array.isArray(correctAnswers)
      ? correctAnswers.slice(0, MAX_LIST_LENGTH)
      : []) {
      const word = wordById.get(a?.itemId);
      if (word && gradeSpellingAnswer(word, cleanAnswer(a.answer))) {
        covered.add(a.itemId);
      }
    }
    if (items.some((i) => !covered.has(i.id))) {
      return actionError(
        "아직 맞히지 않은 단어가 있어요. 2단계를 처음부터 다시 풀어 주세요."
      );
    }

    const now = new Date().toISOString();
    await admin
      .from("vocab_stage_progress")
      .update({
        stage2_completed: true,
        stage2_completed_at: now,
        updated_at: now,
      })
      .eq("id", progress.id)
      .eq("stage2_completed", false);
  }

  if (ctx.examCompact) {
    await ensureExamCompactStageSkip(studentId, setId);
  }

  revalidateSet(setId);
  return actionSuccess(
    progress.stage2_completed ? "2단계는 이미 완료했어요." : "2단계를 완료했어요."
  );
}

/* ------------------------------------------------------------------------ */
/* 3단계 · 예문 빈칸                                                          */
/* ------------------------------------------------------------------------ */

type ExampleItem = Pick<
  VocabItem,
  "id" | "word" | "example_sentence" | "example_meaning"
>;

const EXAMPLE_COLUMNS = "id, word, example_sentence, example_meaning";

/** 예문 빈칸 입력 기록 (마지막 묶음) — 정답 여부는 서버가 다시 채점한다 */
export async function recordStage3Attempts(
  setId: string,
  attempts: PracticeAttempt[]
): Promise<ActionResult> {
  const { ctx, error } = await studentSetContext(setId);
  if (error) return error;
  return recordStage3Batch(ctx, setId, attempts);
}

/** 3단계 완료. 예문이 있는 모든 단어를 한 번은 맞혔는지 서버가 확인한다. */
export async function completeStage3(
  setId: string,
  correctAnswers: PracticeAnswer[] = []
): Promise<ActionResult> {
  const { ctx, error } = await studentSetContext(setId);
  if (error) return error;
  const { admin, studentId } = ctx;

  const progress = await loadStageProgress(admin, studentId, setId, {
    createIfMissing: false,
    fields: "hub",
  });
  if (!progress.id || !progress.stage2_completed) {
    return actionError("2단계를 먼저 끝내 주세요.");
  }

  if (progress.stage3_completed) {
    revalidateSet(setId);
    return actionSuccess("3단계는 이미 완료했어요.");
  }

  const [items, { data: savedCorrect }] = await Promise.all([
    loadSetItems<ExampleItem>(admin, setId, EXAMPLE_COLUMNS),
    admin
      .from("vocab_example_attempts")
      .select("item_id")
      .eq("student_id", studentId)
      .eq("set_id", setId)
      .eq("is_correct", true),
  ]);
  if (items.length < 1) return actionError("단어가 없어요.");

  const questions = buildExampleBlankQuestions(items as unknown as VocabItem[]);
  const covered = new Set((savedCorrect ?? []).map((r) => r.item_id as string));
  const questionById = new Map(questions.map((q) => [q.itemId, q]));
  for (const a of Array.isArray(correctAnswers)
    ? correctAnswers.slice(0, MAX_LIST_LENGTH)
    : []) {
    const q = questionById.get(a?.itemId);
    if (q && gradeExampleBlankAnswer(q.acceptedAnswers, cleanAnswer(a.answer))) {
      covered.add(q.itemId);
    }
  }
  if (questions.some((q) => !covered.has(q.itemId))) {
    return actionError(
      "아직 맞히지 않은 문제가 있어요. 3단계를 처음부터 다시 풀어 주세요."
    );
  }

  const now = new Date().toISOString();
  await admin
    .from("vocab_stage_progress")
    .update({
      stage3_completed: true,
      stage3_completed_at: now,
      updated_at: now,
    })
    .eq("id", progress.id)
    .eq("stage3_completed", false);

  revalidateSet(setId);
  return actionSuccess("3단계를 완료했어요. 종합테스트를 시작할 수 있어요.");
}

/* ------------------------------------------------------------------------ */
/* 종합테스트 (4단계 · 시험 연계 단어장은 3단계)                               */
/* ------------------------------------------------------------------------ */

type GradedRow = {
  itemId: string;
  questionType: Stage3QuestionType;
  questionText: string;
  correctAnswer: string;
  studentAnswer: string;
  isCorrect: boolean;
  aiFeedback: string | null;
};

async function latestAttemptId(
  admin: SupabaseClient,
  studentId: string,
  setId: string,
  excludeId?: string
): Promise<string | null> {
  let q = admin
    .from("vocab_final_test_attempts")
    .select("id")
    .eq("student_id", studentId)
    .eq("set_id", setId)
    .order("submitted_at", { ascending: false })
    .limit(1);
  if (excludeId) q = q.neq("id", excludeId);
  const { data } = await q.maybeSingle();
  return (data?.id as string | undefined) ?? null;
}

/**
 * 종합테스트 제출.
 * - 문항 구성은 서버가 (단어장 · 학생 · 응시 회차) 시드로 다시 만든다. 학생이 보낸 유형·정답은 믿지 않는다.
 * - 문항마다 답은 하나만(중복 itemId는 첫 번째만), 없는 답은 오답, 모르는 itemId는 무시.
 * - 점수 = 맞힌 수 / 전체 문항 수. 합격은 correct×100 ≥ 90×total.
 * - attemptNumber(화면을 연 시점의 응시 횟수)가 이미 지나갔으면 중복 제출로 보고 기존 결과를 돌려준다.
 */
export async function submitStage4(
  setId: string,
  answers: { itemId: string; studentAnswer: string; questionType?: string }[],
  attemptNumber?: number
): Promise<SubmitStage4Result> {
  const { ctx, error } = await studentSetContext(setId);
  if (error) return error;
  const { admin, studentId, examCompact } = ctx;

  if (examCompact) {
    await ensureExamCompactStageSkip(studentId, setId);
  }

  const [progress, items] = await Promise.all([
    loadStageProgress(admin, studentId, setId, {
      createIfMissing: false,
      fields: "full",
    }),
    loadSetItems<Pick<VocabItem, "id" | "word" | "meaning">>(
      admin,
      setId,
      "id, word, meaning"
    ),
  ]);

  if (!progress.id || !progress.stage3_completed) {
    return actionError(
      examCompact ? "2단계를 먼저 끝내 주세요." : "3단계를 먼저 끝내 주세요."
    );
  }
  if (items.length < 1) return actionError("단어가 없어요.");

  const currentCount = progress.stage4_attempt_count ?? 0;
  if (typeof attemptNumber === "number" && attemptNumber !== currentCount) {
    if (attemptNumber < currentCount) {
      const existing = await latestAttemptId(admin, studentId, setId);
      if (existing) {
        return { ...actionSuccess("이미 제출한 시험이에요."), attemptId: existing };
      }
    }
    return actionError("시험 화면이 오래되었어요. 새로고침한 뒤 다시 풀어 주세요.");
  }

  // 서버가 아는 문항 구성 (화면과 같은 시드)
  const questions = buildStage3Questions(
    items,
    stage4QuestionSeed(setId, studentId, currentCount)
  );

  const answerByItem = new Map<string, string>();
  for (const a of Array.isArray(answers) ? answers.slice(0, MAX_LIST_LENGTH) : []) {
    if (!a || typeof a.itemId !== "string") continue;
    if (answerByItem.has(a.itemId)) continue;
    answerByItem.set(a.itemId, cleanAnswer(a.studentAnswer));
  }

  const meaningPending: { index: number; input: MeaningGradeInput }[] = [];
  const graded: GradedRow[] = questions.map((q, index) => {
    const studentAnswer = answerByItem.get(q.itemId) ?? "";
    if (q.questionType === "spelling") {
      return {
        itemId: q.itemId,
        questionType: "spelling",
        questionText: q.questionText,
        correctAnswer: q.correctAnswer,
        studentAnswer,
        isCorrect: gradeSpellingAnswer(q.correctAnswer, studentAnswer),
        aiFeedback: null,
      };
    }
    if (studentAnswer.trim()) {
      meaningPending.push({
        index,
        input: {
          word: q.questionText,
          correctMeaning: q.correctAnswer,
          studentAnswer,
        },
      });
    }
    return {
      itemId: q.itemId,
      questionType: "meaning",
      questionText: q.questionText,
      correctAnswer: q.correctAnswer,
      studentAnswer,
      isCorrect: false,
      aiFeedback: null,
    };
  });

  if (meaningPending.length > 0) {
    const result = await gradeMeaningWithAi(meaningPending.map((p) => p.input));
    const rows = result.ok ? result.results : [];
    meaningPending.forEach((pending, i) => {
      const r = rows[i];
      graded[pending.index] = {
        ...graded[pending.index]!,
        isCorrect: Boolean(r?.isCorrect),
        aiFeedback: cleanMeaningFeedback(r?.feedback),
      };
    });
  }

  const totalQuestions = graded.length;
  const correctCount = graded.filter((g) => g.isCorrect).length;
  const { score, passed } = scoreStage4(correctCount, totalQuestions);
  const now = new Date().toISOString();

  const { data: attempt, error: attemptError } = await admin
    .from("vocab_final_test_attempts")
    .insert({
      set_id: setId,
      student_id: studentId,
      score,
      total_questions: totalQuestions,
      correct_count: correctCount,
      passed,
      submitted_at: now,
    })
    .select("id")
    .single();

  if (attemptError || !attempt) {
    console.error("[vocab] stage4 attempt insert failed", attemptError);
    return actionError("저장하지 못했어요. 잠시 뒤 다시 제출해 주세요.");
  }
  const attemptId = attempt.id as string;

  const { error: answersError } = await admin
    .from("vocab_final_test_answers")
    .insert(
      graded.map((g) => ({
        attempt_id: attemptId,
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
    console.error("[vocab] stage4 answers insert failed", answersError);
    await admin.from("vocab_final_test_attempts").delete().eq("id", attemptId);
    return actionError("저장하지 못했어요. 잠시 뒤 다시 제출해 주세요.");
  }

  // 응시 횟수를 "지금 값일 때만" 올린다 — 같은 시험이 두 번 들어오면 하나만 남긴다
  const { data: claimed } = await admin
    .from("vocab_stage_progress")
    .update({
      stage4_last_score: score,
      stage4_best_score: Math.max(progress.stage4_best_score ?? 0, score),
      stage4_attempt_count: currentCount + 1,
      stage4_passed: passed || progress.stage4_passed,
      stage4_passed_at:
        passed && !progress.stage4_passed_at ? now : progress.stage4_passed_at,
      updated_at: now,
    })
    .eq("id", progress.id)
    .eq("stage4_attempt_count", currentCount)
    .select("id");

  if (!claimed || claimed.length === 0) {
    await admin.from("vocab_final_test_attempts").delete().eq("id", attemptId);
    const existing = await latestAttemptId(admin, studentId, setId, attemptId);
    if (existing) {
      return { ...actionSuccess("이미 제출한 시험이에요."), attemptId: existing };
    }
    return actionError("저장하지 못했어요. 잠시 뒤 다시 제출해 주세요.");
  }

  revalidateSet(setId);

  return {
    ...actionSuccess(passed ? "합격이에요!" : "아쉬워요. 다시 도전해 보세요."),
    attemptId,
  };
}
