"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { isExamPrepEnabled } from "@/lib/academy-features";
import { compareEnglishBlankAnswer } from "@/lib/exam-prep/english-blank-normalize";
import {
  STAGE5_DEFAULT_THRESHOLDS,
  grammarCategoryFeedback,
  toPublicStage5Item,
  type ExamStage5Item,
  type ExamStage5Progress,
  type Stage5ItemAnswerState,
} from "@/lib/exam-prep/stage5-types";

async function requireStudent() {
  if (!isExamPrepEnabled()) {
    return { ok: false as const, message: "기능을 사용할 수 없습니다." };
  }
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== "student" || !profile.academy_id) {
    return { ok: false as const, message: "권한이 없습니다." };
  }
  return { ok: true as const, profile };
}

async function assertAssignmentOwned(
  assignmentStudentId: string,
  studentId: string
) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("exam_assignment_students")
    .select("id, academy_id, assignment_id")
    .eq("id", assignmentStudentId)
    .eq("student_id", studentId)
    .maybeSingle();
  return data;
}

async function loadPassageForAssignment(assignmentId: string) {
  const admin = createAdminClient();
  const { data: assignment } = await admin
    .from("exam_assignments")
    .select("id, workbook_id")
    .eq("id", assignmentId)
    .maybeSingle();
  if (!assignment?.workbook_id) return null;
  const { data: workbook } = await admin
    .from("exam_workbooks")
    .select("id, passage_id")
    .eq("id", assignment.workbook_id)
    .maybeSingle();
  if (!workbook?.passage_id) return null;
  const { data: passage } = await admin
    .from("exam_passages")
    .select(
      "id, title, school_level, grade, source, exam_name, passage_number, stage5_published"
    )
    .eq("id", workbook.passage_id)
    .maybeSingle();
  return passage ? { passage, workbookId: workbook.id as string } : null;
}

async function assertPriorStages(assignmentStudentId: string) {
  const admin = createAdminClient();
  const { data: s1 } = await admin
    .from("exam_stage1_progress")
    .select("completed_at")
    .eq("assignment_student_id", assignmentStudentId)
    .eq("stage_number", 1)
    .maybeSingle();
  if (!s1?.completed_at) {
    return { ok: false as const, code: "stage1_required" as const };
  }
  for (const n of [2, 3, 4] as const) {
    const { data } = await admin
      .from("exam_stage2_progress")
      .select("completed_at")
      .eq("assignment_student_id", assignmentStudentId)
      .eq("stage_number", n)
      .maybeSingle();
    if (!data?.completed_at) {
      return {
        ok: false as const,
        code: (`stage${n}_required` as const),
      };
    }
  }
  return { ok: true as const };
}

async function loadItemsAdmin(passageId: string): Promise<ExamStage5Item[]> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("exam_stage_blanks")
    .select("*")
    .eq("passage_id", passageId)
    .eq("stage_number", 5)
    .order("blank_order", { ascending: true });
  return (data ?? []) as ExamStage5Item[];
}

function parseAnswers(raw: unknown): Record<string, Stage5ItemAnswerState> {
  if (!raw || typeof raw !== "object") return {};
  const out: Record<string, Stage5ItemAnswerState> = {};
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    if (!v || typeof v !== "object") continue;
    const o = v as Record<string, unknown>;
    out[k] = {
      value: String(o.value ?? ""),
      isCorrect:
        o.isCorrect === true ? true : o.isCorrect === false ? false : null,
      attempts: Number(o.attempts) || 0,
      hintUsed: Boolean(o.hintUsed),
      answerRevealed: Boolean(o.answerRevealed),
      revealedAnswer:
        typeof o.revealedAnswer === "string" ? o.revealedAnswer : null,
      hintText: typeof o.hintText === "string" ? o.hintText : null,
      categoryFeedback:
        typeof o.categoryFeedback === "string" ? o.categoryFeedback : null,
    };
  }
  return out;
}

function sanitizeProgressForClient(
  row: ExamStage5Progress
): ExamStage5Progress {
  const answers: Record<string, Stage5ItemAnswerState> = {};
  for (const [id, a] of Object.entries(parseAnswers(row.answers))) {
    answers[id] = {
      value: a.value,
      isCorrect: a.isCorrect,
      attempts: a.attempts,
      hintUsed: a.hintUsed,
      answerRevealed: a.answerRevealed,
      revealedAnswer: a.answerRevealed ? a.revealedAnswer ?? null : null,
      hintText: a.hintUsed ? a.hintText ?? null : null,
      categoryFeedback:
        a.isCorrect === false ? a.categoryFeedback ?? null : null,
    };
  }
  return { ...row, answers };
}

export async function loadStage5StudentDataAction(input: {
  assignmentStudentId: string;
}) {
  const auth = await requireStudent();
  if (!auth.ok) return auth;

  const asRow = await assertAssignmentOwned(
    input.assignmentStudentId,
    auth.profile.id
  );
  if (!asRow) {
    return {
      ok: false as const,
      message: "배정을 찾을 수 없습니다.",
      code: "no_assignment" as const,
    };
  }

  const ctx = await loadPassageForAssignment(asRow.assignment_id);
  if (!ctx) {
    return {
      ok: false as const,
      message: "지문을 찾을 수 없습니다.",
      code: "no_passage" as const,
    };
  }

  const prior = await assertPriorStages(input.assignmentStudentId);
  if (!prior.ok) {
    const messages: Record<string, string> = {
      stage1_required: "1단계 지문 익히기를 먼저 완료해 주세요.",
      stage2_required: "2단계 우리말 빈칸 완성하기를 먼저 완료해 주세요.",
      stage3_required: "3단계 영문 빈칸 완성하기를 먼저 완료해 주세요.",
      stage4_required: "4단계 해석 연습하기를 먼저 완료해 주세요.",
    };
    return {
      ok: false as const,
      message: messages[prior.code] ?? "이전 단계를 먼저 완료해 주세요.",
      code: prior.code,
      passage: ctx.passage,
    };
  }

  if (!ctx.passage.stage5_published) {
    return {
      ok: false as const,
      message: "5단계가 아직 공개되지 않았습니다.",
      code: "not_published" as const,
      passage: ctx.passage,
    };
  }

  const items = await loadItemsAdmin(ctx.passage.id);
  if (items.filter((i) => i.is_required).length < 1 && items.length < 1) {
    return {
      ok: false as const,
      message: "5단계 동사형 문제가 준비되지 않았습니다.",
      code: "no_items" as const,
      passage: ctx.passage,
    };
  }

  const admin = createAdminClient();
  const { data: sentences } = await admin
    .from("exam_passage_sentences")
    .select(
      "id, sentence_order, english_text, korean_text, paragraph_number, is_paragraph_start"
    )
    .eq("passage_id", ctx.passage.id)
    .order("sentence_order", { ascending: true });

  const supabase = await createClient();
  const { data: progressRow } = await supabase
    .from("exam_stage2_progress")
    .select("*")
    .eq("assignment_student_id", input.assignmentStudentId)
    .eq("stage_number", 5)
    .maybeSingle();

  return {
    ok: true as const,
    passage: ctx.passage,
    sentences: sentences ?? [],
    items: items.map(toPublicStage5Item),
    progress: progressRow
      ? sanitizeProgressForClient(progressRow as ExamStage5Progress)
      : null,
    thresholds: STAGE5_DEFAULT_THRESHOLDS,
  };
}

export async function saveStage5DraftAction(input: {
  assignmentStudentId: string;
  passageId: string;
  answers: Record<string, string>;
  expectedRevision?: number;
}) {
  const auth = await requireStudent();
  if (!auth.ok) return auth;
  const asRow = await assertAssignmentOwned(
    input.assignmentStudentId,
    auth.profile.id
  );
  if (!asRow) return { ok: false as const, message: "배정을 찾을 수 없습니다." };

  const prior = await assertPriorStages(input.assignmentStudentId);
  if (!prior.ok) {
    return { ok: false as const, message: "이전 단계를 먼저 완료해 주세요." };
  }

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("exam_stage2_progress")
    .select("*")
    .eq("assignment_student_id", input.assignmentStudentId)
    .eq("stage_number", 5)
    .maybeSingle();

  if (
    existing &&
    input.expectedRevision != null &&
    Number(existing.revision) > input.expectedRevision
  ) {
    return {
      ok: false as const,
      message: "다른 기기에서 더 최근 답안이 저장되었습니다. 새로고침해 주세요.",
      code: "stale" as const,
      progress: sanitizeProgressForClient(existing as ExamStage5Progress),
    };
  }

  const prevAnswers = parseAnswers(existing?.answers);
  const nextAnswers: Record<string, Stage5ItemAnswerState> = { ...prevAnswers };
  for (const [itemId, value] of Object.entries(input.answers)) {
    const prev = nextAnswers[itemId];
    if (prev?.isCorrect === true) continue;
    if (value.length > 500) {
      return { ok: false as const, message: "입력값이 너무 깁니다." };
    }
    nextAnswers[itemId] = {
      value,
      isCorrect: prev?.isCorrect ?? null,
      attempts: prev?.attempts ?? 0,
      hintUsed: prev?.hintUsed ?? false,
      answerRevealed: prev?.answerRevealed ?? false,
      revealedAnswer: prev?.revealedAnswer ?? null,
      hintText: prev?.hintText ?? null,
      categoryFeedback: prev?.categoryFeedback ?? null,
    };
  }

  const { data, error } = await supabase
    .from("exam_stage2_progress")
    .upsert(
      {
        academy_id: asRow.academy_id ?? auth.profile.academy_id,
        assignment_student_id: input.assignmentStudentId,
        passage_id: input.passageId,
        stage_number: 5,
        answers: nextAnswers,
        revision: (Number(existing?.revision) || 0) + 1,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "assignment_student_id,stage_number" }
    )
    .select("*")
    .single();

  if (error) return { ok: false as const, message: error.message };
  return {
    ok: true as const,
    progress: sanitizeProgressForClient(data as ExamStage5Progress),
  };
}

export async function gradeStage5Action(input: {
  assignmentStudentId: string;
  passageId: string;
  itemIds?: string[];
  answers: Record<string, string>;
}) {
  const auth = await requireStudent();
  if (!auth.ok) return auth;
  const asRow = await assertAssignmentOwned(
    input.assignmentStudentId,
    auth.profile.id
  );
  if (!asRow) return { ok: false as const, message: "배정을 찾을 수 없습니다." };

  const prior = await assertPriorStages(input.assignmentStudentId);
  if (!prior.ok) {
    return { ok: false as const, message: "이전 단계를 먼저 완료해 주세요." };
  }

  const ctx = await loadPassageForAssignment(asRow.assignment_id);
  if (!ctx?.passage.stage5_published) {
    return { ok: false as const, message: "5단계가 공개되지 않았습니다." };
  }

  const items = await loadItemsAdmin(input.passageId);
  const targetIds = new Set(
    input.itemIds?.length ? input.itemIds : items.map((b) => b.id)
  );
  const byId = new Map(items.map((b) => [b.id, b]));

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("exam_stage2_progress")
    .select("*")
    .eq("assignment_student_id", input.assignmentStudentId)
    .eq("stage_number", 5)
    .maybeSingle();

  if (existing?.completed_at) {
    return {
      ok: false as const,
      message: "이미 5단계를 완료했습니다.",
      progress: sanitizeProgressForClient(existing as ExamStage5Progress),
    };
  }

  const nextAnswers = parseAnswers(existing?.answers);
  const correctIds = new Set<string>(
    (existing?.correct_blank_ids as string[] | undefined) ?? []
  );
  const incorrectIds = new Set<string>(
    (existing?.incorrect_blank_ids as string[] | undefined) ?? []
  );
  const completedIds = new Set<string>(
    (existing?.completed_blank_ids as string[] | undefined) ?? []
  );

  for (const itemId of targetIds) {
    const item = byId.get(itemId);
    if (!item) continue;
    const prev = nextAnswers[itemId];
    if (prev?.isCorrect === true) continue;

    const value = input.answers[itemId] ?? prev?.value ?? "";
    if (value.length > 500) continue;

    const ok = compareEnglishBlankAnswer(
      value,
      item.answer_text,
      item.accepted_answers ?? [],
      {
        caseSensitive: item.case_sensitive,
        ignoreExtraSpaces: item.ignore_extra_spaces,
        ignorePunctuation: item.ignore_punctuation,
      }
    );
    const attempts = (prev?.attempts ?? 0) + (value.trim() ? 1 : 0);
    const categoryFb =
      value.trim() && !ok
        ? grammarCategoryFeedback(item.grammar_category ?? [])
        : null;

    nextAnswers[itemId] = {
      value,
      isCorrect: value.trim() ? ok : null,
      attempts: value.trim() ? attempts : prev?.attempts ?? 0,
      hintUsed: prev?.hintUsed ?? false,
      answerRevealed: prev?.answerRevealed ?? false,
      revealedAnswer: prev?.revealedAnswer ?? null,
      hintText: prev?.hintText ?? null,
      categoryFeedback: categoryFb,
    };

    if (!value.trim()) {
      incorrectIds.delete(itemId);
      correctIds.delete(itemId);
      completedIds.delete(itemId);
      continue;
    }
    if (ok) {
      correctIds.add(itemId);
      incorrectIds.delete(itemId);
      completedIds.add(itemId);
    } else {
      incorrectIds.add(itemId);
      correctIds.delete(itemId);
      completedIds.delete(itemId);
    }
  }

  const required = items.filter((b) => b.is_required);
  const requiredCorrect = required.filter((b) => correctIds.has(b.id)).length;
  const score =
    required.length === 0
      ? 0
      : Math.round((requiredCorrect / required.length) * 100);

  const { data, error } = await supabase
    .from("exam_stage2_progress")
    .upsert(
      {
        academy_id: asRow.academy_id ?? auth.profile.academy_id,
        assignment_student_id: input.assignmentStudentId,
        passage_id: input.passageId,
        stage_number: 5,
        answers: nextAnswers,
        correct_blank_ids: [...correctIds],
        incorrect_blank_ids: [...incorrectIds],
        completed_blank_ids: [...completedIds],
        hint_used_blank_ids:
          (existing?.hint_used_blank_ids as string[] | undefined) ?? [],
        revealed_answer_blank_ids:
          (existing?.revealed_answer_blank_ids as string[] | undefined) ?? [],
        attempt_count: (Number(existing?.attempt_count) || 0) + 1,
        score,
        progress_percent: score,
        revision: (Number(existing?.revision) || 0) + 1,
        last_attempt_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: "assignment_student_id,stage_number" }
    )
    .select("*")
    .single();

  if (error) return { ok: false as const, message: error.message };
  return {
    ok: true as const,
    progress: sanitizeProgressForClient(data as ExamStage5Progress),
    score,
  };
}

export async function requestStage5HintAction(input: {
  assignmentStudentId: string;
  itemId: string;
}) {
  const auth = await requireStudent();
  if (!auth.ok) return auth;
  const asRow = await assertAssignmentOwned(
    input.assignmentStudentId,
    auth.profile.id
  );
  if (!asRow) return { ok: false as const, message: "배정을 찾을 수 없습니다." };

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("exam_stage2_progress")
    .select("*")
    .eq("assignment_student_id", input.assignmentStudentId)
    .eq("stage_number", 5)
    .maybeSingle();

  const answers = parseAnswers(existing?.answers);
  const state = answers[input.itemId];
  if (!state || state.attempts < STAGE5_DEFAULT_THRESHOLDS.hintAfterWrong) {
    return {
      ok: false as const,
      message: `${STAGE5_DEFAULT_THRESHOLDS.hintAfterWrong}회 이상 오답 후 힌트를 볼 수 있습니다.`,
    };
  }

  const items = await loadItemsAdmin(String(existing?.passage_id ?? ""));
  const item = items.find((b) => b.id === input.itemId);
  if (!item) return { ok: false as const, message: "항목을 찾을 수 없습니다." };

  let hint = item.hint?.trim() || "";
  if (!hint) {
    hint = grammarCategoryFeedback(item.grammar_category ?? []);
  }

  const hintUsed = new Set<string>(
    (existing?.hint_used_blank_ids as string[] | undefined) ?? []
  );
  hintUsed.add(input.itemId);
  answers[input.itemId] = { ...state, hintUsed: true, hintText: hint };

  const { data, error } = await supabase
    .from("exam_stage2_progress")
    .update({
      answers,
      hint_used_blank_ids: [...hintUsed],
      revision: (Number(existing?.revision) || 0) + 1,
      updated_at: new Date().toISOString(),
    })
    .eq("assignment_student_id", input.assignmentStudentId)
    .eq("stage_number", 5)
    .select("*")
    .single();

  if (error) return { ok: false as const, message: error.message };
  return {
    ok: true as const,
    hint,
    progress: sanitizeProgressForClient(data as ExamStage5Progress),
  };
}

export async function requestStage5RevealAction(input: {
  assignmentStudentId: string;
  itemId: string;
}) {
  const auth = await requireStudent();
  if (!auth.ok) return auth;
  const asRow = await assertAssignmentOwned(
    input.assignmentStudentId,
    auth.profile.id
  );
  if (!asRow) return { ok: false as const, message: "배정을 찾을 수 없습니다." };

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("exam_stage2_progress")
    .select("*")
    .eq("assignment_student_id", input.assignmentStudentId)
    .eq("stage_number", 5)
    .maybeSingle();

  const answers = parseAnswers(existing?.answers);
  const state = answers[input.itemId];
  if (!state || state.attempts < STAGE5_DEFAULT_THRESHOLDS.revealAfterWrong) {
    return {
      ok: false as const,
      message: `${STAGE5_DEFAULT_THRESHOLDS.revealAfterWrong}회 이상 오답 후 정답을 확인할 수 있습니다.`,
    };
  }

  const items = await loadItemsAdmin(String(existing?.passage_id ?? ""));
  const item = items.find((b) => b.id === input.itemId);
  if (!item) return { ok: false as const, message: "항목을 찾을 수 없습니다." };

  const revealed = new Set<string>(
    (existing?.revealed_answer_blank_ids as string[] | undefined) ?? []
  );
  revealed.add(input.itemId);
  answers[input.itemId] = {
    ...state,
    answerRevealed: true,
    revealedAnswer: item.answer_text,
  };

  const { data, error } = await supabase
    .from("exam_stage2_progress")
    .update({
      answers,
      revealed_answer_blank_ids: [...revealed],
      revision: (Number(existing?.revision) || 0) + 1,
      updated_at: new Date().toISOString(),
    })
    .eq("assignment_student_id", input.assignmentStudentId)
    .eq("stage_number", 5)
    .select("*")
    .single();

  if (error) return { ok: false as const, message: error.message };
  return {
    ok: true as const,
    answer: item.answer_text,
    progress: sanitizeProgressForClient(data as ExamStage5Progress),
  };
}

export async function completeStage5Action(input: {
  assignmentStudentId: string;
  passageId: string;
  stepId: string;
}) {
  const auth = await requireStudent();
  if (!auth.ok) return auth;
  const asRow = await assertAssignmentOwned(
    input.assignmentStudentId,
    auth.profile.id
  );
  if (!asRow) return { ok: false as const, message: "배정을 찾을 수 없습니다." };

  const prior = await assertPriorStages(input.assignmentStudentId);
  if (!prior.ok) {
    return { ok: false as const, message: "이전 단계를 먼저 완료해 주세요." };
  }

  const items = await loadItemsAdmin(input.passageId);
  const required = items.filter((b) => b.is_required);
  if (required.length < 1) {
    return { ok: false as const, message: "필수 항목이 없습니다." };
  }

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("exam_stage2_progress")
    .select("*")
    .eq("assignment_student_id", input.assignmentStudentId)
    .eq("stage_number", 5)
    .maybeSingle();

  if (existing?.completed_at) {
    return {
      ok: true as const,
      message: "5단계 학습을 완료했습니다. 다음 단계는 준비 중입니다.",
      alreadyCompleted: true,
    };
  }

  const answers = parseAnswers(existing?.answers);
  for (const item of required) {
    if (answers[item.id]?.isCorrect !== true) {
      return {
        ok: false as const,
        message: "모든 필수 항목을 맞혀야 완료할 수 있습니다.",
      };
    }
  }

  const score = Math.round(
    (required.filter((b) => answers[b.id]?.isCorrect).length / required.length) *
      100
  );

  await supabase.from("exam_stage2_progress").upsert(
    {
      academy_id: asRow.academy_id ?? auth.profile.academy_id,
      assignment_student_id: input.assignmentStudentId,
      passage_id: input.passageId,
      stage_number: 5,
      answers,
      correct_blank_ids: required.map((b) => b.id),
      completed_blank_ids: required.map((b) => b.id),
      incorrect_blank_ids: [],
      score,
      progress_percent: 100,
      completed_at: new Date().toISOString(),
      revision: (Number(existing?.revision) || 0) + 1,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "assignment_student_id,stage_number" }
  );

  const admin = createAdminClient();
  const { startOrResumeAttemptAction, submitStepAttemptAction } = await import(
    "@/lib/exam-prep/student-actions"
  );
  const started = await startOrResumeAttemptAction(
    input.assignmentStudentId,
    input.stepId
  );
  if (started.ok && "attempt" in started && started.attempt) {
    const { data: questions } = await admin
      .from("exam_workbook_questions")
      .select("id")
      .eq("step_id", input.stepId)
      .eq("is_active", true);
    const submitAnswers: Record<string, unknown> = {};
    for (const q of questions ?? []) {
      submitAnswers[q.id as string] = { text: "completed" };
    }
    await submitStepAttemptAction({
      assignment_student_id: input.assignmentStudentId,
      step_id: input.stepId,
      attempt_id: started.attempt.id,
      answers: submitAnswers,
    });
  }

  revalidatePath(`/student/exam-prep/${input.assignmentStudentId}`);
  return {
    ok: true as const,
    message: "5단계 학습을 완료했습니다. 다음 단계는 준비 중입니다.",
    stageCompleted: true,
  };
}
