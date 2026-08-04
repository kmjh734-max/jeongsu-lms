"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { isExamPrepEnabled } from "@/lib/academy-features";
import { compareEnglishBlankAnswer } from "@/lib/exam-prep/english-blank-normalize";
import {
  STAGE3_DEFAULT_THRESHOLDS,
  toPublicStage3Blank,
  type ExamStage3Blank,
  type ExamStage3Progress,
  type Stage3BlankAnswerState,
} from "@/lib/exam-prep/stage3-types";

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
    .select("id, passage_id, status")
    .eq("id", assignment.workbook_id)
    .maybeSingle();
  if (!workbook?.passage_id) return null;
  const { data: passage } = await admin
    .from("exam_passages")
    .select(
      "id, title, school_level, grade, source, exam_name, passage_number, stage2_published, stage3_published"
    )
    .eq("id", workbook.passage_id)
    .maybeSingle();
  return passage
    ? { passage, workbookId: workbook.id as string }
    : null;
}

async function assertStageComplete(
  assignmentStudentId: string,
  stageNumber: 1 | 2
) {
  const admin = createAdminClient();
  if (stageNumber === 1) {
    const { data } = await admin
      .from("exam_stage1_progress")
      .select("completed_at")
      .eq("assignment_student_id", assignmentStudentId)
      .eq("stage_number", 1)
      .maybeSingle();
    return Boolean(data?.completed_at);
  }
  const { data } = await admin
    .from("exam_stage2_progress")
    .select("completed_at")
    .eq("assignment_student_id", assignmentStudentId)
    .eq("stage_number", 2)
    .maybeSingle();
  return Boolean(data?.completed_at);
}

async function loadBlanksAdmin(passageId: string): Promise<ExamStage3Blank[]> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("exam_stage_blanks")
    .select("*")
    .eq("passage_id", passageId)
    .eq("stage_number", 3)
    .order("blank_order", { ascending: true });
  return (data ?? []) as ExamStage3Blank[];
}

function parseAnswers(raw: unknown): Record<string, Stage3BlankAnswerState> {
  if (!raw || typeof raw !== "object") return {};
  const out: Record<string, Stage3BlankAnswerState> = {};
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
    };
  }
  return out;
}

function sanitizeProgressForClient(
  row: ExamStage3Progress
): ExamStage3Progress {
  const answers: Record<string, Stage3BlankAnswerState> = {};
  for (const [id, a] of Object.entries(parseAnswers(row.answers))) {
    answers[id] = {
      value: a.value,
      isCorrect: a.isCorrect,
      attempts: a.attempts,
      hintUsed: a.hintUsed,
      answerRevealed: a.answerRevealed,
      revealedAnswer: a.answerRevealed ? a.revealedAnswer ?? null : null,
      hintText: a.hintUsed ? a.hintText ?? null : null,
    };
  }
  return { ...row, answers };
}

export async function loadStage3StudentDataAction(input: {
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

  if (!(await assertStageComplete(input.assignmentStudentId, 1))) {
    return {
      ok: false as const,
      message: "1단계 지문 익히기를 먼저 완료해 주세요.",
      code: "stage1_required" as const,
      passage: ctx.passage,
    };
  }

  if (!(await assertStageComplete(input.assignmentStudentId, 2))) {
    return {
      ok: false as const,
      message: "2단계 우리말 빈칸 완성하기를 먼저 완료해 주세요.",
      code: "stage2_required" as const,
      passage: ctx.passage,
    };
  }

  if (!ctx.passage.stage3_published) {
    return {
      ok: false as const,
      message: "3단계가 아직 공개되지 않았습니다.",
      code: "not_published" as const,
      passage: ctx.passage,
    };
  }

  const blanks = await loadBlanksAdmin(ctx.passage.id);
  if (blanks.length === 0) {
    return {
      ok: false as const,
      message: "3단계 빈칸이 준비되지 않았습니다.",
      code: "no_blanks" as const,
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
    .eq("stage_number", 3)
    .maybeSingle();

  return {
    ok: true as const,
    passage: ctx.passage,
    sentences: sentences ?? [],
    blanks: blanks.map(toPublicStage3Blank),
    progress: progressRow
      ? sanitizeProgressForClient(progressRow as ExamStage3Progress)
      : null,
    thresholds: STAGE3_DEFAULT_THRESHOLDS,
  };
}

export async function saveStage3DraftAction(input: {
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
  if (!asRow) {
    return { ok: false as const, message: "배정을 찾을 수 없습니다." };
  }
  if (!(await assertStageComplete(input.assignmentStudentId, 2))) {
    return {
      ok: false as const,
      message: "2단계 우리말 빈칸 완성하기를 먼저 완료해 주세요.",
    };
  }

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("exam_stage2_progress")
    .select("*")
    .eq("assignment_student_id", input.assignmentStudentId)
    .eq("stage_number", 3)
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
      progress: sanitizeProgressForClient(existing as ExamStage3Progress),
    };
  }

  const prevAnswers = parseAnswers(existing?.answers);
  const nextAnswers: Record<string, Stage3BlankAnswerState> = {
    ...prevAnswers,
  };
  for (const [blankId, value] of Object.entries(input.answers)) {
    const prev = nextAnswers[blankId];
    if (prev?.isCorrect === true) continue;
    nextAnswers[blankId] = {
      value,
      isCorrect: prev?.isCorrect ?? null,
      attempts: prev?.attempts ?? 0,
      hintUsed: prev?.hintUsed ?? false,
      answerRevealed: prev?.answerRevealed ?? false,
      revealedAnswer: prev?.revealedAnswer ?? null,
      hintText: prev?.hintText ?? null,
    };
  }

  const payload = {
    academy_id: asRow.academy_id ?? auth.profile.academy_id,
    assignment_student_id: input.assignmentStudentId,
    passage_id: input.passageId,
    stage_number: 3,
    answers: nextAnswers,
    revision: (Number(existing?.revision) || 0) + 1,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("exam_stage2_progress")
    .upsert(payload, { onConflict: "assignment_student_id,stage_number" })
    .select("*")
    .single();

  if (error) return { ok: false as const, message: error.message };
  return {
    ok: true as const,
    progress: sanitizeProgressForClient(data as ExamStage3Progress),
  };
}

export async function gradeStage3Action(input: {
  assignmentStudentId: string;
  passageId: string;
  blankIds?: string[];
  answers: Record<string, string>;
}) {
  const auth = await requireStudent();
  if (!auth.ok) return auth;

  const asRow = await assertAssignmentOwned(
    input.assignmentStudentId,
    auth.profile.id
  );
  if (!asRow) {
    return { ok: false as const, message: "배정을 찾을 수 없습니다." };
  }
  if (!(await assertStageComplete(input.assignmentStudentId, 2))) {
    return {
      ok: false as const,
      message: "2단계 우리말 빈칸 완성하기를 먼저 완료해 주세요.",
    };
  }

  const ctx = await loadPassageForAssignment(asRow.assignment_id);
  if (!ctx?.passage.stage3_published) {
    return { ok: false as const, message: "3단계가 공개되지 않았습니다." };
  }

  const blanks = await loadBlanksAdmin(input.passageId);
  const targetIds = new Set(
    input.blankIds?.length ? input.blankIds : blanks.map((b) => b.id)
  );
  const blankById = new Map(blanks.map((b) => [b.id, b]));

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("exam_stage2_progress")
    .select("*")
    .eq("assignment_student_id", input.assignmentStudentId)
    .eq("stage_number", 3)
    .maybeSingle();

  if (existing?.completed_at) {
    return {
      ok: false as const,
      message: "이미 3단계를 완료했습니다.",
      progress: sanitizeProgressForClient(existing as ExamStage3Progress),
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

  for (const blankId of targetIds) {
    const blank = blankById.get(blankId);
    if (!blank) continue;
    const prev = nextAnswers[blankId];
    if (prev?.isCorrect === true) continue;

    const value = input.answers[blankId] ?? prev?.value ?? "";
    const ok = compareEnglishBlankAnswer(
      value,
      blank.answer_text,
      blank.accepted_answers ?? [],
      {
        caseSensitive: blank.case_sensitive,
        ignoreExtraSpaces: blank.ignore_extra_spaces,
        ignorePunctuation: blank.ignore_punctuation,
      }
    );
    const attempts = (prev?.attempts ?? 0) + (value.trim() ? 1 : 0);
    nextAnswers[blankId] = {
      value,
      isCorrect: value.trim() ? ok : null,
      attempts: value.trim() ? attempts : prev?.attempts ?? 0,
      hintUsed: prev?.hintUsed ?? false,
      answerRevealed: prev?.answerRevealed ?? false,
      revealedAnswer: prev?.revealedAnswer ?? null,
      hintText: prev?.hintText ?? null,
    };

    if (!value.trim()) {
      incorrectIds.delete(blankId);
      correctIds.delete(blankId);
      completedIds.delete(blankId);
      continue;
    }

    if (ok) {
      correctIds.add(blankId);
      incorrectIds.delete(blankId);
      completedIds.add(blankId);
    } else {
      incorrectIds.add(blankId);
      correctIds.delete(blankId);
      completedIds.delete(blankId);
    }
  }

  const required = blanks.filter((b) => b.is_required);
  const requiredCorrect = required.filter((b) => correctIds.has(b.id)).length;
  const score =
    required.length === 0
      ? 0
      : Math.round((requiredCorrect / required.length) * 100);

  const payload = {
    academy_id: asRow.academy_id ?? auth.profile.academy_id,
    assignment_student_id: input.assignmentStudentId,
    passage_id: input.passageId,
    stage_number: 3,
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
  };

  const { data, error } = await supabase
    .from("exam_stage2_progress")
    .upsert(payload, { onConflict: "assignment_student_id,stage_number" })
    .select("*")
    .single();

  if (error) return { ok: false as const, message: error.message };
  return {
    ok: true as const,
    progress: sanitizeProgressForClient(data as ExamStage3Progress),
    score,
  };
}

export async function requestStage3HintAction(input: {
  assignmentStudentId: string;
  blankId: string;
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
    .eq("stage_number", 3)
    .maybeSingle();

  const answers = parseAnswers(existing?.answers);
  const state = answers[input.blankId];
  if (!state || state.attempts < STAGE3_DEFAULT_THRESHOLDS.hintAfterWrong) {
    return {
      ok: false as const,
      message: `${STAGE3_DEFAULT_THRESHOLDS.hintAfterWrong}회 이상 오답 후 힌트를 볼 수 있습니다.`,
    };
  }

  const blanks = await loadBlanksAdmin(
    (existing?.passage_id as string) || ""
  );
  const blank = blanks.find((b) => b.id === input.blankId);
  if (!blank?.hint?.trim()) {
    // 첫 글자만 서버에서 생성 (정답 전체 미전송)
    if (!blank) return { ok: false as const, message: "빈칸을 찾을 수 없습니다." };
    const first = blank.answer_text.trim()[0] ?? "";
    const hint = first ? `첫 글자: ${first}` : "";
    if (!hint) return { ok: false as const, message: "등록된 힌트가 없습니다." };

    const hintUsed = new Set<string>(
      (existing?.hint_used_blank_ids as string[] | undefined) ?? []
    );
    hintUsed.add(input.blankId);
    answers[input.blankId] = { ...state, hintUsed: true, hintText: hint };
    const { data, error } = await supabase
      .from("exam_stage2_progress")
      .update({
        answers,
        hint_used_blank_ids: [...hintUsed],
        revision: (Number(existing?.revision) || 0) + 1,
        updated_at: new Date().toISOString(),
      })
      .eq("assignment_student_id", input.assignmentStudentId)
      .eq("stage_number", 3)
      .select("*")
      .single();
    if (error) return { ok: false as const, message: error.message };
    return {
      ok: true as const,
      hint,
      progress: sanitizeProgressForClient(data as ExamStage3Progress),
    };
  }

  const hintUsed = new Set<string>(
    (existing?.hint_used_blank_ids as string[] | undefined) ?? []
  );
  hintUsed.add(input.blankId);
  answers[input.blankId] = {
    ...state,
    hintUsed: true,
    hintText: blank.hint,
  };

  const { data, error } = await supabase
    .from("exam_stage2_progress")
    .update({
      answers,
      hint_used_blank_ids: [...hintUsed],
      revision: (Number(existing?.revision) || 0) + 1,
      updated_at: new Date().toISOString(),
    })
    .eq("assignment_student_id", input.assignmentStudentId)
    .eq("stage_number", 3)
    .select("*")
    .single();

  if (error) return { ok: false as const, message: error.message };
  return {
    ok: true as const,
    hint: blank.hint,
    progress: sanitizeProgressForClient(data as ExamStage3Progress),
  };
}

export async function requestStage3RevealAction(input: {
  assignmentStudentId: string;
  blankId: string;
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
    .eq("stage_number", 3)
    .maybeSingle();

  const answers = parseAnswers(existing?.answers);
  const state = answers[input.blankId];
  if (!state || state.attempts < STAGE3_DEFAULT_THRESHOLDS.revealAfterWrong) {
    return {
      ok: false as const,
      message: `${STAGE3_DEFAULT_THRESHOLDS.revealAfterWrong}회 이상 오답 후 정답을 확인할 수 있습니다.`,
    };
  }

  const blanks = await loadBlanksAdmin(
    (existing?.passage_id as string) || ""
  );
  const blank = blanks.find((b) => b.id === input.blankId);
  if (!blank) return { ok: false as const, message: "빈칸을 찾을 수 없습니다." };

  const revealed = new Set<string>(
    (existing?.revealed_answer_blank_ids as string[] | undefined) ?? []
  );
  revealed.add(input.blankId);
  answers[input.blankId] = {
    ...state,
    answerRevealed: true,
    revealedAnswer: blank.answer_text,
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
    .eq("stage_number", 3)
    .select("*")
    .single();

  if (error) return { ok: false as const, message: error.message };
  return {
    ok: true as const,
    answer: blank.answer_text,
    progress: sanitizeProgressForClient(data as ExamStage3Progress),
  };
}

export async function completeStage3Action(input: {
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

  if (!(await assertStageComplete(input.assignmentStudentId, 1))) {
    return {
      ok: false as const,
      message: "1단계 지문 익히기를 먼저 완료해 주세요.",
    };
  }
  if (!(await assertStageComplete(input.assignmentStudentId, 2))) {
    return {
      ok: false as const,
      message: "2단계 우리말 빈칸 완성하기를 먼저 완료해 주세요.",
    };
  }

  const blanks = await loadBlanksAdmin(input.passageId);
  const required = blanks.filter((b) => b.is_required);
  if (required.length === 0) {
    return { ok: false as const, message: "필수 빈칸이 없습니다." };
  }

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("exam_stage2_progress")
    .select("*")
    .eq("assignment_student_id", input.assignmentStudentId)
    .eq("stage_number", 3)
    .maybeSingle();

  if (existing?.completed_at) {
    return {
      ok: true as const,
      message: "3단계 학습을 완료했습니다. 다음 단계는 준비 중입니다.",
      alreadyCompleted: true,
    };
  }

  const answers = parseAnswers(existing?.answers);
  const correctIds: string[] = [];
  for (const blank of required) {
    const st = answers[blank.id];
    const ok = compareEnglishBlankAnswer(
      st?.value ?? "",
      blank.answer_text,
      blank.accepted_answers ?? [],
      {
        caseSensitive: blank.case_sensitive,
        ignoreExtraSpaces: blank.ignore_extra_spaces,
        ignorePunctuation: blank.ignore_punctuation,
      }
    );
    if (!ok) {
      return {
        ok: false as const,
        message: "모든 필수 빈칸을 정답으로 맞춰야 완료할 수 있습니다.",
      };
    }
    correctIds.push(blank.id);
  }

  await supabase.from("exam_stage2_progress").upsert(
    {
      academy_id: asRow.academy_id ?? auth.profile.academy_id,
      assignment_student_id: input.assignmentStudentId,
      passage_id: input.passageId,
      stage_number: 3,
      answers,
      correct_blank_ids: correctIds,
      incorrect_blank_ids: [],
      completed_blank_ids: correctIds,
      score: 100,
      progress_percent: 100,
      completed_at: new Date().toISOString(),
      revision: (Number(existing?.revision) || 0) + 1,
      updated_at: new Date().toISOString(),
      last_attempt_at: new Date().toISOString(),
    },
    { onConflict: "assignment_student_id,stage_number" }
  );

  const { startOrResumeAttemptAction, submitStepAttemptAction } = await import(
    "@/lib/exam-prep/student-actions"
  );
  const started = await startOrResumeAttemptAction(
    input.assignmentStudentId,
    input.stepId
  );
  if (started.ok && "attempt" in started && started.attempt) {
    const admin = createAdminClient();
    const { data: questions } = await admin
      .from("exam_workbook_questions")
      .select("id, question_data, correct_answer")
      .eq("step_id", input.stepId)
      .eq("is_active", true);

    const submitAnswers: Record<string, unknown> = {};
    for (const q of questions ?? []) {
      const data = (q.question_data ?? {}) as Record<string, unknown>;
      const blanksFromQ = Array.isArray(data.blanks)
        ? (data.blanks as Array<{ id?: string; answer?: string }>)
        : [];
      const blankMap: Record<string, string> = {};
      for (const b of blanksFromQ) {
        if (b.id && b.answer) blankMap[b.id] = b.answer;
      }
      const ca = q.correct_answer as {
        blanks?: Array<{ id: string; answer: string }>;
      } | null;
      if (ca?.blanks) {
        for (const b of ca.blanks) {
          if (b.id && b.answer) blankMap[b.id] = b.answer;
        }
      }
      submitAnswers[q.id as string] = { blanks: blankMap };
    }

    await submitStepAttemptAction({
      assignment_student_id: input.assignmentStudentId,
      step_id: input.stepId,
      attempt_id: started.attempt.id,
      answers: submitAnswers,
    });
  }

  revalidatePath(`/student/exam-prep/${input.assignmentStudentId}`);
  revalidatePath("/student/exam-prep");
  return {
    ok: true as const,
    message: "3단계 학습을 완료했습니다. 다음 단계는 준비 중입니다.",
    stageCompleted: true,
  };
}
