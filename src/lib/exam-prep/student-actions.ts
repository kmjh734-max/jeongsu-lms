"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { isExamPrepEnabled } from "@/lib/academy-features";
import {
  gradeBlanks,
  gradeChoiceAnswer,
  gradeComprehensionCheck,
  gradeOrder,
  gradeShortAnswer,
  gradeWriting,
  type GradeResult,
} from "@/lib/exam-prep/grade";
import {
  aiResultToGradeResult,
  extractModelAnswerText,
  extractStudentText,
  gradeWritingAnswersWithAi,
  type WritingGradeInput,
} from "@/lib/exam-prep/grade-writing-ai";
import { saveDraftSchema, submitAttemptSchema } from "@/lib/exam-prep/schemas";
import { CREDIT_FEATURES, debitFeatureCredits } from "@/lib/credits";
import type { ExamWorkbookQuestion } from "@/lib/exam-prep/types";
import { createAdminClient } from "@/lib/supabase/admin";

async function requireStudent() {
  if (!isExamPrepEnabled()) {
    return { ok: false as const, message: "기능을 사용할 수 없습니다." };
  }
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== "student") {
    return { ok: false as const, message: "권한이 없습니다." };
  }
  return { ok: true as const, profile };
}

export async function startOrResumeAttemptAction(
  assignmentStudentId: string,
  stepId: string
) {
  const auth = await requireStudent();
  if (!auth.ok) return auth;
  const supabase = await createClient();

  const { data: asRow } = await supabase
    .from("exam_assignment_students")
    .select("*, exam_assignments!inner(due_at, settings, start_at)")
    .eq("id", assignmentStudentId)
    .eq("student_id", auth.profile.id)
    .maybeSingle();
  if (!asRow) return { ok: false as const, message: "배정을 찾을 수 없습니다." };

  const { data: step } = await supabase
    .from("exam_workbook_steps")
    .select("*")
    .eq("id", stepId)
    .maybeSingle();
  if (!step) return { ok: false as const, message: "단계 없음" };

  // sequential unlock
  if (step.sequential_unlock && step.step_order > 1) {
    const { data: prevSteps } = await supabase
      .from("exam_workbook_steps")
      .select("id, passing_score, step_order")
      .eq("workbook_id", step.workbook_id)
      .lt("step_order", step.step_order)
      .order("step_order", { ascending: true });
    for (const prev of prevSteps ?? []) {
      const { data: best } = await supabase
        .from("exam_attempts")
        .select("score, status")
        .eq("assignment_student_id", assignmentStudentId)
        .eq("step_id", prev.id)
        .eq("status", "submitted")
        .order("score", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (!best || (best.score ?? 0) < (prev.passing_score ?? 0)) {
        return {
          ok: false as const,
          message: "이전 단계를 통과해야 열립니다.",
        };
      }
    }
  }

  const { data: existing } = await supabase
    .from("exam_attempts")
    .select("*")
    .eq("assignment_student_id", assignmentStudentId)
    .eq("step_id", stepId)
    .eq("status", "in_progress")
    .order("attempt_number", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (existing) {
    return { ok: true as const, attempt: existing };
  }

  const { count } = await supabase
    .from("exam_attempts")
    .select("id", { count: "exact", head: true })
    .eq("assignment_student_id", assignmentStudentId)
    .eq("step_id", stepId);
  const attemptNumber = (count ?? 0) + 1;
  if (attemptNumber > (step.max_attempts ?? 3)) {
    return { ok: false as const, message: "재응시 횟수를 초과했습니다." };
  }

  const { data: attempt, error } = await supabase
    .from("exam_attempts")
    .insert({
      academy_id: asRow.academy_id,
      assignment_student_id: assignmentStudentId,
      step_id: stepId,
      attempt_number: attemptNumber,
      status: "in_progress",
      draft_answers: {},
    })
    .select("*")
    .single();
  if (error || !attempt) {
    return { ok: false as const, message: error?.message ?? "응시 시작 실패" };
  }

  await supabase
    .from("exam_assignment_students")
    .update({
      status: "in_progress",
      started_at: asRow.started_at ?? new Date().toISOString(),
      current_step_id: stepId,
      last_studied_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", assignmentStudentId);

  return { ok: true as const, attempt };
}

export async function saveDraftAnswersAction(raw: unknown) {
  const auth = await requireStudent();
  if (!auth.ok) return auth;
  const parsed = saveDraftSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false as const, message: "임시저장 데이터 오류" };
  }
  const data = parsed.data;
  const supabase = await createClient();

  const { data: asRow } = await supabase
    .from("exam_assignment_students")
    .select("id")
    .eq("id", data.assignment_student_id)
    .eq("student_id", auth.profile.id)
    .maybeSingle();
  if (!asRow) return { ok: false as const, message: "권한 없음" };

  let attemptId = data.attempt_id;
  if (!attemptId) {
    const started = await startOrResumeAttemptAction(
      data.assignment_student_id,
      data.step_id
    );
    if (!started.ok || !("attempt" in started)) return started;
    attemptId = started.attempt.id;
  }

  const { error } = await supabase
    .from("exam_attempts")
    .update({ draft_answers: data.draft_answers })
    .eq("id", attemptId)
    .eq("status", "in_progress");
  if (error) return { ok: false as const, message: error.message };

  await supabase
    .from("exam_assignment_students")
    .update({ last_studied_at: new Date().toISOString() })
    .eq("id", data.assignment_student_id);

  return { ok: true as const, attemptId };
}

function gradeOne(
  q: ExamWorkbookQuestion,
  answer: unknown
): ReturnType<typeof gradeChoiceAnswer> {
  const points = Number(q.points) || 1;
  const type = q.question_type;
  const data = (q.question_data ?? {}) as Record<string, unknown>;

  if (type === "comprehension") {
    const confirmed =
      typeof answer === "object" &&
      answer !== null &&
      "confirmed" in answer
        ? Boolean((answer as { confirmed: unknown }).confirmed)
        : answer === true;
    return gradeComprehensionCheck(confirmed, points);
  }
  if (type === "grammar_vocab_choice") {
    const optionId =
      typeof answer === "object" &&
      answer !== null &&
      "optionId" in answer
        ? String((answer as { optionId: unknown }).optionId)
        : typeof answer === "string"
          ? answer
          : null;
    return gradeChoiceAnswer(optionId, q.correct_answer, points);
  }
  if (type === "english_blank" || type === "korean_blank" || type === "verb_form") {
    const blanks =
      typeof answer === "object" &&
      answer !== null &&
      "blanks" in answer
        ? ((answer as { blanks: Record<string, string> }).blanks ?? {})
        : (answer as Record<string, string>) ?? {};
    return gradeBlanks(blanks, data, q.correct_answer, points);
  }
  if (type === "translation_practice") {
    const text =
      typeof answer === "object" &&
      answer !== null &&
      "text" in answer
        ? String((answer as { text: unknown }).text ?? "")
        : typeof answer === "string"
          ? answer
          : "";
    // 해석이 있으면 정규화 일치, 없으면 강사 검토
    const hasModel =
      (typeof q.correct_answer === "object" &&
        q.correct_answer !== null &&
        "text" in q.correct_answer &&
        String((q.correct_answer as { text: unknown }).text ?? "").trim()) ||
      (Array.isArray(q.acceptable_answers) &&
        q.acceptable_answers.some(
          (a) => typeof a === "string" && a.trim().length > 0
        ));
    if (!hasModel) {
      return {
        isCorrect: null,
        score: 0,
        gradingStatus: "needs_review",
        normalizedAnswer: { text },
        feedback: "모범 해석이 없어 강사 확인이 필요합니다.",
      };
    }
    const exact = gradeShortAnswer(
      text,
      q.correct_answer,
      q.acceptable_answers,
      points
    );
    if (exact.isCorrect) return exact;
    return {
      isCorrect: null,
      score: 0,
      gradingStatus: "needs_review",
      normalizedAnswer: { text },
      feedback: "의미 일치 여부는 강사가 확인합니다.",
    };
  }
  if (type === "error_correction") {
    const text =
      typeof answer === "object" &&
      answer !== null &&
      "text" in answer
        ? String((answer as { text: unknown }).text ?? "")
        : typeof answer === "string"
          ? answer
          : "";
    return gradeWriting(text, q.correct_answer, q.acceptable_answers, points);
  }
  if (type === "sentence_order" || type === "paragraph_order") {
    const order =
      typeof answer === "object" &&
      answer !== null &&
      "order" in answer
        ? ((answer as { order: string[] }).order ?? [])
        : Array.isArray(answer)
          ? (answer as string[])
          : [];
    const correct =
      (data.correctOrder as string[]) ??
      (typeof q.correct_answer === "object" &&
      q.correct_answer !== null &&
      "order" in q.correct_answer
        ? ((q.correct_answer as { order: string[] }).order ?? [])
        : []);
    return gradeOrder(order, correct, points);
  }
  if (type === "writing") {
    const text =
      typeof answer === "object" &&
      answer !== null &&
      "text" in answer
        ? String((answer as { text: unknown }).text ?? "")
        : typeof answer === "string"
          ? answer
          : "";
    return gradeWriting(text, q.correct_answer, q.acceptable_answers, points);
  }
  if (typeof answer === "string") {
    return gradeShortAnswer(
      answer,
      q.correct_answer,
      q.acceptable_answers,
      points
    );
  }
  return gradeShortAnswer(
    "",
    q.correct_answer,
    q.acceptable_answers,
    points
  );
}

export async function submitStepAttemptAction(raw: unknown) {
  const auth = await requireStudent();
  if (!auth.ok) return auth;
  const parsed = submitAttemptSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false as const, message: "제출 데이터 오류" };
  }
  const data = parsed.data;
  const supabase = await createClient();

  const { data: asRow } = await supabase
    .from("exam_assignment_students")
    .select("*")
    .eq("id", data.assignment_student_id)
    .eq("student_id", auth.profile.id)
    .maybeSingle();
  if (!asRow) return { ok: false as const, message: "권한 없음" };

  const { data: attempt } = await supabase
    .from("exam_attempts")
    .select("*")
    .eq("id", data.attempt_id)
    .eq("assignment_student_id", data.assignment_student_id)
    .eq("status", "in_progress")
    .maybeSingle();
  if (!attempt) return { ok: false as const, message: "응시 세션 없음" };

  const { data: step } = await supabase
    .from("exam_workbook_steps")
    .select("*")
    .eq("id", data.step_id)
    .maybeSingle();
  if (!step) return { ok: false as const, message: "단계 없음" };

  const { data: questions } = await supabase
    .from("exam_workbook_questions")
    .select("*")
    .eq("step_id", data.step_id)
    .eq("is_active", true)
    .order("question_order", { ascending: true });

  const qs = (questions ?? []) as ExamWorkbookQuestion[];
  let totalScore = 0;
  let maxScore = 0;
  let correctCount = 0;
  const results: Array<{
    questionId: string;
    isCorrect: boolean | null;
    score: number;
    gradingStatus: string;
    showAnswer: boolean;
    correctAnswer?: unknown;
    explanation?: string | null;
  }> = [];

  const showAnswer =
    step.show_answer_policy === "after_submit" ||
    step.show_answer_policy === "immediate";

  type Pending = {
    q: ExamWorkbookQuestion;
    ans: unknown;
    graded: GradeResult;
  };
  const pending: Pending[] = [];
  const aiCandidates: WritingGradeInput[] = [];

  for (const q of qs) {
    maxScore += Number(q.points) || 1;
    const ans = data.answers[q.id];
    const graded = gradeOne(q, ans);

    const writingLike =
      q.question_type === "writing" ||
      q.question_type === "translation_practice" ||
      q.question_type === "error_correction";

    if (graded.gradingStatus === "needs_review" && writingLike) {
      const studentText = extractStudentText(ans);
      const model = extractModelAnswerText(q.correct_answer);
      if (studentText.trim()) {
        aiCandidates.push({
          questionId: q.id,
          questionType: q.question_type,
          prompt: q.question_text ?? "",
          modelAnswer: model,
          studentAnswer: studentText,
          points: Number(q.points) || 1,
        });
      }
    }

    pending.push({ q, ans, graded });
  }

  if (aiCandidates.length > 0) {
    let allowAi = false;
    try {
      const admin = createAdminClient();
      await debitFeatureCredits(admin, {
        academyId: asRow.academy_id,
        featureKey: CREDIT_FEATURES.exam_prep_grade_writing,
        actorId: auth.profile.id,
        idempotencyKey: `exam_prep_write:${attempt.id}`,
        quantity: aiCandidates.length,
        metadata: {
          attemptId: attempt.id,
          count: aiCandidates.length,
        },
      });
      allowAi = true;
    } catch {
      allowAi = false;
    }

    if (allowAi) {
      const aiResults = await gradeWritingAnswersWithAi(aiCandidates);
      if (aiResults) {
        const byId = new Map(aiResults.map((r) => [r.questionId, r]));
        for (const row of pending) {
          const ai = byId.get(row.q.id);
          if (!ai) continue;
          const next = aiResultToGradeResult(ai, Number(row.q.points) || 1);
          row.graded = {
            ...next,
            normalizedAnswer: row.graded.normalizedAnswer,
          };
        }
      }
    }
  }

  for (const { q, ans, graded } of pending) {
    totalScore += graded.score;
    if (graded.isCorrect === true) correctCount += 1;

    await supabase.from("exam_answers").upsert(
      {
        academy_id: asRow.academy_id,
        attempt_id: attempt.id,
        question_id: q.id,
        student_answer: ans ?? null,
        normalized_answer: graded.normalizedAnswer ?? null,
        is_correct: graded.isCorrect,
        score: graded.score,
        grading_status: graded.gradingStatus,
        ai_feedback: graded.feedback ?? null,
        answered_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: "attempt_id,question_id" }
    );

    if (graded.isCorrect === false) {
      const { data: existingWrong } = await supabase
        .from("exam_wrong_answers")
        .select("id, wrong_count")
        .eq("student_id", auth.profile.id)
        .eq("question_id", q.id)
        .eq("assignment_student_id", data.assignment_student_id)
        .maybeSingle();
      if (existingWrong) {
        await supabase
          .from("exam_wrong_answers")
          .update({
            wrong_count: (existingWrong.wrong_count ?? 1) + 1,
            last_wrong_at: new Date().toISOString(),
            is_mastered: false,
            mastered_at: null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingWrong.id);
      } else {
        await supabase.from("exam_wrong_answers").insert({
          academy_id: asRow.academy_id,
          student_id: auth.profile.id,
          assignment_student_id: data.assignment_student_id,
          question_id: q.id,
          sentence_id: q.sentence_id,
          error_category: q.question_type,
          wrong_count: 1,
        });
      }
    } else if (graded.isCorrect === true) {
      await supabase
        .from("exam_wrong_answers")
        .update({
          is_mastered: true,
          mastered_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("student_id", auth.profile.id)
        .eq("question_id", q.id)
        .eq("assignment_student_id", data.assignment_student_id)
        .eq("is_mastered", false);
    }

    results.push({
      questionId: q.id,
      isCorrect: graded.isCorrect,
      score: graded.score,
      gradingStatus: graded.gradingStatus,
      showAnswer,
      correctAnswer: showAnswer ? q.correct_answer : undefined,
      explanation: showAnswer ? q.explanation : undefined,
    });
  }

  const percent =
    maxScore > 0 ? Math.round((totalScore / maxScore) * 1000) / 10 : 0;
  const passed = percent >= Number(step.passing_score ?? 0);

  await supabase
    .from("exam_attempts")
    .update({
      status: "submitted",
      score: percent,
      correct_count: correctCount,
      total_count: qs.length,
      submitted_at: new Date().toISOString(),
      draft_answers: data.answers,
    })
    .eq("id", attempt.id);

  // progress across steps
  const { data: allSteps } = await supabase
    .from("exam_workbook_steps")
    .select("id, passing_score")
    .eq("workbook_id", step.workbook_id)
    .order("step_order", { ascending: true });

  let passedSteps = 0;
  for (const st of allSteps ?? []) {
    const { data: best } = await supabase
      .from("exam_attempts")
      .select("score")
      .eq("assignment_student_id", data.assignment_student_id)
      .eq("step_id", st.id)
      .eq("status", "submitted")
      .order("score", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (best && (best.score ?? 0) >= (st.passing_score ?? 0)) {
      passedSteps += 1;
    }
  }
  const progressRate =
    (allSteps?.length ?? 0) > 0
      ? Math.round((passedSteps / (allSteps?.length ?? 1)) * 1000) / 10
      : 0;
  const completed = passedSteps === (allSteps?.length ?? 0);

  // average score
  const { data: submitted } = await supabase
    .from("exam_attempts")
    .select("score")
    .eq("assignment_student_id", data.assignment_student_id)
    .eq("status", "submitted");
  const scores = (submitted ?? [])
    .map((s) => Number(s.score) || 0)
    .filter((n) => n >= 0);
  const avg =
    scores.length > 0
      ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) /
        10
      : null;

  const nextStep =
    passed && !completed
      ? (allSteps ?? []).find(
          (st) =>
            !(
              /* already passed checked above — find first not passed */
              false
            )
        )
      : null;

  let nextStepId: string | null = asRow.current_step_id;
  if (passed) {
    const idx = (allSteps ?? []).findIndex((s) => s.id === step.id);
    nextStepId = (allSteps ?? [])[idx + 1]?.id ?? step.id;
  }

  await supabase
    .from("exam_assignment_students")
    .update({
      progress_rate: progressRate,
      total_score: avg,
      status: completed
        ? "completed"
        : passed
          ? "in_progress"
          : "needs_retry",
      completed_at: completed ? new Date().toISOString() : null,
      current_step_id: nextStepId,
      last_studied_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", data.assignment_student_id);

  revalidatePath("/student/exam-prep");
  revalidatePath(`/student/exam-prep/${data.assignment_student_id}`);
  revalidatePath("/admin/exam-prep/progress");
  revalidatePath("/teacher/exam-prep/progress");

  return {
    ok: true as const,
    percent,
    passed,
    correctCount,
    totalCount: qs.length,
    results,
    progressRate,
    completed,
    nextStepId: nextStep?.id ?? nextStepId,
  };
}

/** 오답 노트에서 변형 연습 제출 → 맞으면 숙달 */
export async function submitWrongPracticeAction(raw: {
  wrongAnswerId: string;
  answer: unknown;
  transform?: boolean;
}) {
  const auth = await requireStudent();
  if (!auth.ok) return auth;
  const supabase = await createClient();

  const { data: wrong } = await supabase
    .from("exam_wrong_answers")
    .select("id, question_id, assignment_student_id, wrong_count")
    .eq("id", raw.wrongAnswerId)
    .eq("student_id", auth.profile.id)
    .maybeSingle();
  if (!wrong) return { ok: false as const, message: "오답을 찾을 수 없습니다." };

  const { data: q } = await supabase
    .from("exam_workbook_questions")
    .select("*")
    .eq("id", wrong.question_id)
    .maybeSingle();
  if (!q) return { ok: false as const, message: "문항 없음" };

  const { transformWrongQuestionForPractice } = await import(
    "@/lib/exam-prep/transform-wrong-question"
  );
  const practice = transformWrongQuestionForPractice(
    q as ExamWorkbookQuestion,
    raw.transform === false ? "same" : "transform"
  );

  const graded = gradeOne(
    {
      ...(q as ExamWorkbookQuestion),
      question_type: practice.practice_type,
      question_data: {
        ...practice.question_data,
        // 채점용 blanks 복원
        ...(practice._correct_answer &&
        typeof practice._correct_answer === "object" &&
        practice._correct_answer !== null &&
        "blanks" in practice._correct_answer
          ? {
              blanks: (practice._correct_answer as { blanks: unknown }).blanks,
            }
          : {}),
      },
      correct_answer: practice._correct_answer,
      acceptable_answers: practice._acceptable_answers,
    },
    raw.answer
  );

  if (graded.isCorrect === true) {
    await supabase
      .from("exam_wrong_answers")
      .update({
        is_mastered: true,
        mastered_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", wrong.id);
  } else if (graded.isCorrect === false) {
    await supabase
      .from("exam_wrong_answers")
      .update({
        wrong_count: (wrong.wrong_count ?? 1) + 1,
        last_wrong_at: new Date().toISOString(),
        is_mastered: false,
        mastered_at: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", wrong.id);
  }

  revalidatePath("/student/exam-prep/wrong");
  revalidatePath(`/student/exam-prep/wrong/${wrong.id}`);

  return {
    ok: true as const,
    isCorrect: graded.isCorrect,
    score: graded.score,
    gradingStatus: graded.gradingStatus,
    feedback: graded.feedback ?? null,
    mastered: graded.isCorrect === true,
    correctAnswer:
      graded.isCorrect === false ? practice._correct_answer : undefined,
  };
}
