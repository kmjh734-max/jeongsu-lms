"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { isExamPrepEnabled } from "@/lib/academy-features";
import {
  STAGE7_DEFAULT_THRESHOLDS,
  canCompleteStage7,
  categoryFeedbackForSubs,
  computeStage7Score,
  gradeStage7Candidate,
  stage7GuideText,
  toStudentStage7Candidate,
  type ExamStage7Candidate,
  type ExamStage7Progress,
  type Stage7AnswerState,
} from "@/lib/exam-prep/stage7-types";

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
      "id, title, school_level, grade, source, exam_name, passage_number, stage7_published, stage7_required_error_count, stage7_content_version"
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
  for (const n of [2, 3, 4, 5, 6] as const) {
    const { data } = await admin
      .from("exam_stage2_progress")
      .select("completed_at")
      .eq("assignment_student_id", assignmentStudentId)
      .eq("stage_number", n)
      .maybeSingle();
    if (!data?.completed_at) {
      return { ok: false as const, code: (`stage${n}_required` as const) };
    }
  }
  return { ok: true as const };
}

async function loadCandidates(passageId: string): Promise<ExamStage7Candidate[]> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("exam_stage_blanks")
    .select("*")
    .eq("passage_id", passageId)
    .eq("stage_number", 7)
    .order("blank_order", { ascending: true });
  return (data ?? []) as ExamStage7Candidate[];
}

function parseAnswers(raw: unknown): Record<string, Stage7AnswerState> {
  if (!raw || typeof raw !== "object") return {};
  const out: Record<string, Stage7AnswerState> = {};
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    if (!v || typeof v !== "object") continue;
    const o = v as Record<string, unknown>;
    out[k] = {
      selected: Boolean(o.selected),
      correctionValue: String(o.correctionValue ?? ""),
      selectionCorrect:
        o.selectionCorrect === true
          ? true
          : o.selectionCorrect === false
            ? false
            : null,
      correctionCorrect:
        o.correctionCorrect === true
          ? true
          : o.correctionCorrect === false
            ? false
            : null,
      result:
        typeof o.result === "string"
          ? (o.result as Stage7AnswerState["result"])
          : null,
      attempts: Number(o.attempts) || 0,
      hintUsed: Boolean(o.hintUsed),
      positionRevealed: Boolean(o.positionRevealed),
      answerRevealed: Boolean(o.answerRevealed),
      hintText: typeof o.hintText === "string" ? o.hintText : null,
      revealedCorrection:
        typeof o.revealedCorrection === "string" ? o.revealedCorrection : null,
      categoryFeedback:
        typeof o.categoryFeedback === "string" ? o.categoryFeedback : null,
    };
  }
  return out;
}

function sanitizeProgress(row: ExamStage7Progress): ExamStage7Progress {
  const answers: Record<string, Stage7AnswerState> = {};
  for (const [id, a] of Object.entries(parseAnswers(row.answers))) {
    answers[id] = {
      ...a,
      revealedCorrection: a.answerRevealed ? a.revealedCorrection ?? null : null,
      hintText: a.hintUsed ? a.hintText ?? null : null,
      categoryFeedback:
        a.result === "correct_selection_wrong_correction" ||
        a.result === "wrong_selection"
          ? a.categoryFeedback ?? null
          : null,
    };
  }
  return { ...row, answers };
}

export async function loadStage7StudentDataAction(input: {
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
      stage5_required: "5단계 동사형 연습하기를 먼저 완료해 주세요.",
      stage6_required: "6단계 어법·어휘 고르기를 먼저 완료해 주세요.",
    };
    return {
      ok: false as const,
      message: messages[prior.code] ?? "이전 단계를 먼저 완료해 주세요.",
      code: prior.code,
      passage: ctx.passage,
    };
  }

  if (!ctx.passage.stage7_published) {
    return {
      ok: false as const,
      message: "7단계가 아직 공개되지 않았습니다.",
      code: "not_published" as const,
      passage: ctx.passage,
    };
  }

  const candidates = await loadCandidates(ctx.passage.id);
  const errors = candidates.filter((c) => c.is_error);
  const required = Number(ctx.passage.stage7_required_error_count) || 3;
  if (errors.length < 1 || errors.length !== required) {
    return {
      ok: false as const,
      message: "7단계 문제가 준비되지 않았습니다.",
      code: "no_items" as const,
      passage: ctx.passage,
    };
  }

  const admin = createAdminClient();
  const { data: sentences } = await admin
    .from("exam_passage_sentences")
    .select(
      "id, sentence_order, stage7_display_text, paragraph_number, is_paragraph_start"
    )
    .eq("passage_id", ctx.passage.id)
    .order("sentence_order", { ascending: true });

  const publicSentences = (sentences ?? []).map((s) => ({
    id: s.id as string,
    sentence_order: Number(s.sentence_order),
    display_text: String(s.stage7_display_text ?? ""),
    paragraph_number: Number(s.paragraph_number) || 1,
    is_paragraph_start: Boolean(s.is_paragraph_start),
  }));

  if (publicSentences.some((s) => !s.display_text.trim())) {
    return {
      ok: false as const,
      message: "7단계 표시 문장이 없습니다.",
      code: "no_display" as const,
      passage: ctx.passage,
    };
  }

  const supabase = await createClient();
  const { data: progressRow } = await supabase
    .from("exam_stage2_progress")
    .select("*")
    .eq("assignment_student_id", input.assignmentStudentId)
    .eq("stage_number", 7)
    .maybeSingle();

  return {
    ok: true as const,
    passage: ctx.passage,
    requiredErrorCount: required,
    contentVersion: Number(ctx.passage.stage7_content_version) || 1,
    guideText: stage7GuideText(required),
    sentences: publicSentences,
    candidates: candidates.map(toStudentStage7Candidate),
    progress: progressRow
      ? sanitizeProgress(progressRow as ExamStage7Progress)
      : null,
    canComplete: progressRow
      ? canCompleteStage7(
          candidates,
          parseAnswers((progressRow as ExamStage7Progress).answers)
        )
      : false,
    thresholds: STAGE7_DEFAULT_THRESHOLDS,
  };
}

export async function saveStage7DraftAction(input: {
  assignmentStudentId: string;
  passageId: string;
  answers: Record<
    string,
    { selected: boolean; correctionValue: string }
  >;
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

  const candidates = await loadCandidates(input.passageId);
  const byId = new Map(candidates.map((c) => [c.id, c]));
  const ctx = await loadPassageForAssignment(asRow.assignment_id);
  const required = Number(ctx?.passage.stage7_required_error_count) || 3;

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("exam_stage2_progress")
    .select("*")
    .eq("assignment_student_id", input.assignmentStudentId)
    .eq("stage_number", 7)
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
      progress: sanitizeProgress(existing as ExamStage7Progress),
    };
  }

  const next = parseAnswers(existing?.answers);
  let selectedCount = 0;
  for (const [id, patch] of Object.entries(input.answers)) {
    if (!byId.has(id)) {
      return { ok: false as const, message: "유효하지 않은 후보입니다." };
    }
    const prev = next[id];
    if (prev?.result === "correct_selection_and_correction") continue;
    if (patch.correctionValue.length > 200) {
      return { ok: false as const, message: "수정 답안이 너무 깁니다." };
    }
    next[id] = {
      selected: patch.selected,
      correctionValue: patch.correctionValue,
      selectionCorrect: null,
      correctionCorrect: null,
      result: null,
      attempts: prev?.attempts ?? 0,
      hintUsed: prev?.hintUsed ?? false,
      positionRevealed: prev?.positionRevealed ?? false,
      answerRevealed: prev?.answerRevealed ?? false,
      hintText: prev?.hintText ?? null,
      revealedCorrection: prev?.revealedCorrection ?? null,
      categoryFeedback: prev?.categoryFeedback ?? null,
    };
  }
  for (const a of Object.values(next)) {
    if (a.selected) selectedCount++;
  }
  if (selectedCount > required) {
    return {
      ok: false as const,
      message: `어색한 곳은 ${required}개까지 선택할 수 있습니다.`,
    };
  }

  const { data, error } = await supabase
    .from("exam_stage2_progress")
    .upsert(
      {
        academy_id: asRow.academy_id ?? auth.profile.academy_id,
        assignment_student_id: input.assignmentStudentId,
        passage_id: input.passageId,
        stage_number: 7,
        answers: next,
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
    progress: sanitizeProgress(data as ExamStage7Progress),
  };
}

export async function gradeStage7Action(input: {
  assignmentStudentId: string;
  passageId: string;
  answers: Record<
    string,
    { selected: boolean; correctionValue: string }
  >;
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
  if (!ctx?.passage.stage7_published) {
    return { ok: false as const, message: "7단계가 공개되지 않았습니다." };
  }

  const candidates = await loadCandidates(input.passageId);
  const byId = new Map(candidates.map((c) => [c.id, c]));
  const required = Number(ctx.passage.stage7_required_error_count) || 3;

  const selectedIds = Object.entries(input.answers)
    .filter(([, a]) => a.selected)
    .map(([id]) => id);

  for (const id of selectedIds) {
    if (!byId.has(id)) {
      return { ok: false as const, message: "유효하지 않은 후보입니다." };
    }
  }
  if (selectedIds.length !== required) {
    return {
      ok: false as const,
      message: `어색한 곳을 ${required}개 선택해 주세요. 현재 ${selectedIds.length}개를 선택했습니다.`,
    };
  }
  for (const id of selectedIds) {
    if (!String(input.answers[id]?.correctionValue ?? "").trim()) {
      return {
        ok: false as const,
        message: "선택한 표현의 수정 답안을 모두 입력해 주세요.",
      };
    }
  }

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("exam_stage2_progress")
    .select("*")
    .eq("assignment_student_id", input.assignmentStudentId)
    .eq("stage_number", 7)
    .maybeSingle();

  if (existing?.completed_at) {
    return {
      ok: false as const,
      message: "이미 7단계를 완료했습니다.",
      progress: sanitizeProgress(existing as ExamStage7Progress),
    };
  }

  const next = parseAnswers(existing?.answers);
  const correctIds: string[] = [];
  const incorrectIds: string[] = [];
  const completedIds: string[] = [];

  for (const c of candidates) {
    const patch = input.answers[c.id] ?? {
      selected: next[c.id]?.selected ?? false,
      correctionValue: next[c.id]?.correctionValue ?? "",
    };
    const prev = next[c.id];
    if (prev?.result === "correct_selection_and_correction") {
      correctIds.push(c.id);
      completedIds.push(c.id);
      continue;
    }

    const graded = gradeStage7Candidate(
      c,
      patch.selected,
      patch.correctionValue
    );
    const attempts =
      (prev?.attempts ?? 0) + (patch.selected || prev?.selected ? 1 : 0);

    next[c.id] = {
      selected: patch.selected,
      correctionValue: patch.correctionValue,
      selectionCorrect: graded.selectionCorrect,
      correctionCorrect: graded.correctionCorrect,
      result: graded.result,
      attempts,
      hintUsed: prev?.hintUsed ?? false,
      positionRevealed: prev?.positionRevealed ?? false,
      answerRevealed: prev?.answerRevealed ?? false,
      hintText: prev?.hintText ?? null,
      revealedCorrection: prev?.revealedCorrection ?? null,
      categoryFeedback:
        graded.result === "correct_selection_wrong_correction" ||
        graded.result === "wrong_selection"
          ? categoryFeedbackForSubs(c.grammar_category ?? [])
          : null,
    };

    if (graded.result === "correct_selection_and_correction") {
      correctIds.push(c.id);
      completedIds.push(c.id);
    } else if (patch.selected || (c.is_error && !patch.selected)) {
      incorrectIds.push(c.id);
    }
  }

  const score = computeStage7Score(candidates, next);
  const missedErrors = candidates.filter(
    (c) => c.is_error && next[c.id]?.result === "not_selected"
  ).length;

  const { data, error } = await supabase
    .from("exam_stage2_progress")
    .upsert(
      {
        academy_id: asRow.academy_id ?? auth.profile.academy_id,
        assignment_student_id: input.assignmentStudentId,
        passage_id: input.passageId,
        stage_number: 7,
        answers: next,
        correct_blank_ids: correctIds,
        incorrect_blank_ids: incorrectIds,
        completed_blank_ids: completedIds,
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

  let message = `채점 완료 · ${score}점`;
  if (missedErrors > 0) {
    message += " · 아직 찾지 못한 어색한 부분이 있습니다.";
  }

  return {
    ok: true as const,
    progress: sanitizeProgress(data as ExamStage7Progress),
    score,
    canComplete: canCompleteStage7(candidates, next),
    message,
  };
}

export async function requestStage7HintAction(input: {
  assignmentStudentId: string;
  candidateId: string;
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
    .eq("stage_number", 7)
    .maybeSingle();

  const answers = parseAnswers(existing?.answers);
  const state = answers[input.candidateId];
  if (!state || state.attempts < STAGE7_DEFAULT_THRESHOLDS.hintAfterWrong) {
    return {
      ok: false as const,
      message: `${STAGE7_DEFAULT_THRESHOLDS.hintAfterWrong}회 이상 시도 후 힌트를 볼 수 있습니다.`,
    };
  }

  const candidates = await loadCandidates(String(existing?.passage_id ?? ""));
  const cand = candidates.find((c) => c.id === input.candidateId);
  if (!cand) return { ok: false as const, message: "후보를 찾을 수 없습니다." };

  const hint =
    cand.hint?.trim() ||
    categoryFeedbackForSubs(cand.grammar_category ?? []);

  const hintUsed = new Set(
    (existing?.hint_used_blank_ids as string[] | undefined) ?? []
  );
  hintUsed.add(input.candidateId);
  answers[input.candidateId] = { ...state, hintUsed: true, hintText: hint };

  const { data, error } = await supabase
    .from("exam_stage2_progress")
    .update({
      answers,
      hint_used_blank_ids: [...hintUsed],
      revision: (Number(existing?.revision) || 0) + 1,
      updated_at: new Date().toISOString(),
    })
    .eq("assignment_student_id", input.assignmentStudentId)
    .eq("stage_number", 7)
    .select("*")
    .single();

  if (error) return { ok: false as const, message: error.message };
  return {
    ok: true as const,
    hint,
    progress: sanitizeProgress(data as ExamStage7Progress),
  };
}

export async function requestStage7RevealAction(input: {
  assignmentStudentId: string;
  candidateId: string;
  mode: "position" | "answer";
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
    .eq("stage_number", 7)
    .maybeSingle();

  const answers = parseAnswers(existing?.answers);
  const state = answers[input.candidateId];
  const need =
    input.mode === "position"
      ? STAGE7_DEFAULT_THRESHOLDS.positionRevealAfterWrong
      : STAGE7_DEFAULT_THRESHOLDS.answerRevealAfterWrong;
  if (!state || state.attempts < need) {
    return {
      ok: false as const,
      message: `${need}회 이상 시도 후 확인할 수 있습니다.`,
    };
  }

  const candidates = await loadCandidates(String(existing?.passage_id ?? ""));
  const cand = candidates.find((c) => c.id === input.candidateId);
  if (!cand?.is_error) {
    return { ok: false as const, message: "확인할 수 없습니다." };
  }

  const revealed = new Set(
    (existing?.revealed_answer_blank_ids as string[] | undefined) ?? []
  );
  if (input.mode === "answer") revealed.add(input.candidateId);

  answers[input.candidateId] = {
    ...state,
    positionRevealed: true,
    answerRevealed: input.mode === "answer" ? true : state.answerRevealed,
    revealedCorrection:
      input.mode === "answer" ? cand.answer_text : state.revealedCorrection,
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
    .eq("stage_number", 7)
    .select("*")
    .single();

  if (error) return { ok: false as const, message: error.message };
  return {
    ok: true as const,
    isError: true,
    correction:
      input.mode === "answer" ? cand.answer_text : undefined,
    progress: sanitizeProgress(data as ExamStage7Progress),
  };
}

export async function completeStage7Action(input: {
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

  const candidates = await loadCandidates(input.passageId);
  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("exam_stage2_progress")
    .select("*")
    .eq("assignment_student_id", input.assignmentStudentId)
    .eq("stage_number", 7)
    .maybeSingle();

  if (existing?.completed_at) {
    return {
      ok: true as const,
      message: "7단계 학습을 완료했습니다. 다음 단계는 준비 중입니다.",
      alreadyCompleted: true,
    };
  }

  const answers = parseAnswers(existing?.answers);
  if (!canCompleteStage7(candidates, answers)) {
    return {
      ok: false as const,
      message:
        "모든 어색한 곳을 찾아 정확히 고쳐야 완료할 수 있습니다. 올바른 표현을 잘못 선택하지 않았는지도 확인하세요.",
    };
  }

  const score = computeStage7Score(candidates, answers);
  await supabase.from("exam_stage2_progress").upsert(
    {
      academy_id: asRow.academy_id ?? auth.profile.academy_id,
      assignment_student_id: input.assignmentStudentId,
      passage_id: input.passageId,
      stage_number: 7,
      answers,
      correct_blank_ids: candidates.filter((c) => c.is_error).map((c) => c.id),
      completed_blank_ids: candidates.filter((c) => c.is_error).map((c) => c.id),
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
    message: "7단계 학습을 완료했습니다. 다음 단계는 준비 중입니다.",
    stageCompleted: true,
  };
}
