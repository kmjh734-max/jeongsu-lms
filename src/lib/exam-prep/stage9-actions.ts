"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { isExamPrepEnabled } from "@/lib/academy-features";
import {
  STAGE9_DEFAULT_THRESHOLDS,
  STAGE9_ROLE_LABELS,
  canCompleteStage9,
  flowHintForAttempt,
  gradeBlockOrder,
  parseCohesionClues,
  parseSentenceIds,
  toStudentStage9Problem,
  validateSubmittedOrder,
  type ExamStage9Block,
  type ExamStage9Progress,
  type Stage9AnswerMode,
  type Stage9AnswerState,
  type Stage9TeacherRole,
} from "@/lib/exam-prep/stage9-types";

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
      "id, title, school_level, grade, source, exam_name, passage_number, stage9_published, stage9_content_version, stage9_fixed_prefix, stage9_fixed_suffix, stage9_answer_mode, stage9_structure_hint"
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
  for (const n of [2, 3, 4, 5, 6, 7, 8] as const) {
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

function mapBlock(row: Record<string, unknown>): ExamStage9Block {
  return {
    id: String(row.id),
    academy_id: String(row.academy_id),
    passage_id: String(row.passage_id),
    sentence_id: String(row.sentence_id),
    stage_number: 9,
    blank_order: Number(row.blank_order) || 1,
    answer_text: String(row.answer_text ?? ""),
    selected_text: String(row.selected_text ?? row.answer_text ?? ""),
    answer_snapshot: String(row.answer_snapshot ?? ""),
    sentence_ids: parseSentenceIds(row.sentence_ids),
    display_label: String(row.display_label ?? "A"),
    teacher_role: (row.teacher_role as Stage9TeacherRole | null) ?? null,
    cohesion_clues: parseCohesionClues(row.cohesion_clues),
    hint: (row.hint as string | null) ?? null,
    explanation: (row.explanation as string | null) ?? null,
    is_required: row.is_required !== false,
    created_at: String(row.created_at ?? ""),
    updated_at: String(row.updated_at ?? ""),
  };
}

async function loadBlocksAdmin(passageId: string): Promise<ExamStage9Block[]> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("exam_stage_blanks")
    .select("*")
    .eq("passage_id", passageId)
    .eq("stage_number", 9)
    .order("blank_order", { ascending: true });
  return (data ?? []).map((r) => mapBlock(r as Record<string, unknown>));
}

function parseAnswer(raw: unknown): Stage9AnswerState {
  if (!raw || typeof raw !== "object") {
    return {
      orderedBlockIds: [],
      selectedLabels: [],
      attempts: 0,
      isCorrect: null,
      hintUsed: false,
      answerRevealed: false,
      usedHintTypes: [],
      attemptHistory: [],
    };
  }
  const o = raw as Record<string, unknown>;
  // support nested under "main" if ever wrapped
  const src =
    o.orderedBlockIds != null
      ? o
      : ((o.main as Record<string, unknown> | undefined) ?? o);
  return {
    orderedBlockIds: Array.isArray(src.orderedBlockIds)
      ? src.orderedBlockIds.map(String)
      : [],
    selectedLabels: Array.isArray(src.selectedLabels)
      ? src.selectedLabels.map(String)
      : [],
    attempts: Number(src.attempts) || 0,
    isCorrect:
      src.isCorrect === true ? true : src.isCorrect === false ? false : null,
    hintUsed: Boolean(src.hintUsed),
    answerRevealed: Boolean(src.answerRevealed),
    hintText: typeof src.hintText === "string" ? src.hintText : null,
    revealedLabels: Array.isArray(src.revealedLabels)
      ? src.revealedLabels.map(String)
      : null,
    usedHintTypes: Array.isArray(src.usedHintTypes)
      ? src.usedHintTypes.map(String)
      : [],
    attemptHistory: Array.isArray(src.attemptHistory)
      ? (src.attemptHistory as Stage9AnswerState["attemptHistory"])
      : [],
    contentVersion: Number(src.contentVersion) || undefined,
  };
}

function sanitizeProgress(row: ExamStage9Progress): ExamStage9Progress {
  const a = parseAnswer(row.answers);
  return {
    ...row,
    answers: {
      orderedBlockIds: a.orderedBlockIds,
      selectedLabels: a.selectedLabels,
      attempts: a.attempts,
      isCorrect: a.isCorrect,
      hintUsed: a.hintUsed,
      answerRevealed: a.answerRevealed,
      hintText: a.hintUsed ? a.hintText ?? null : null,
      revealedLabels: a.answerRevealed ? a.revealedLabels ?? null : null,
      usedHintTypes: a.usedHintTypes ?? [],
      attemptHistory: a.attemptHistory ?? [],
      contentVersion: a.contentVersion,
    },
  };
}

export async function loadStage9StudentDataAction(input: {
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
      stage7_required: "7단계 어색한 곳 찾아 고쳐 쓰기를 먼저 완료해 주세요.",
      stage8_required: "8단계 순서 배열하기를 먼저 완료해 주세요.",
    };
    return {
      ok: false as const,
      message: messages[prior.code] ?? "이전 단계를 먼저 완료해 주세요.",
      code: prior.code,
      passage: {
        id: ctx.passage.id,
        title: ctx.passage.title,
        school_level: ctx.passage.school_level,
        grade: ctx.passage.grade,
        source: ctx.passage.source,
        exam_name: ctx.passage.exam_name,
        passage_number: ctx.passage.passage_number,
      },
    };
  }

  if (!ctx.passage.stage9_published) {
    return {
      ok: false as const,
      message: "9단계가 아직 공개되지 않았습니다.",
      code: "not_published" as const,
      passage: {
        id: ctx.passage.id,
        title: ctx.passage.title,
      },
    };
  }

  const blocks = await loadBlocksAdmin(ctx.passage.id);
  if (blocks.length < 2) {
    return {
      ok: false as const,
      message: "9단계 문제가 준비되지 않았습니다.",
      code: "no_items" as const,
      passage: { id: ctx.passage.id, title: ctx.passage.title },
    };
  }

  const contentVersion = Number(ctx.passage.stage9_content_version) || 1;
  const problem = toStudentStage9Problem(
    {
      fixedPrefix: String(ctx.passage.stage9_fixed_prefix ?? ""),
      fixedSuffix: String(ctx.passage.stage9_fixed_suffix ?? ""),
      answerMode: (ctx.passage.stage9_answer_mode as Stage9AnswerMode) ||
        "label_sequence",
      structureHint: (ctx.passage.stage9_structure_hint as string | null) ?? null,
      contentVersion,
      published: true,
    },
    blocks
  );

  const supabase = await createClient();
  const { data: progressRow } = await supabase
    .from("exam_stage2_progress")
    .select("*")
    .eq("assignment_student_id", input.assignmentStudentId)
    .eq("stage_number", 9)
    .maybeSingle();

  let answer = parseAnswer(progressRow?.answers);
  if (!answer.contentVersion) {
    answer = { ...answer, contentVersion };
  }

  if (
    answer.contentVersion &&
    answer.contentVersion !== contentVersion &&
    !progressRow?.completed_at
  ) {
    return {
      ok: false as const,
      message:
        "문제 구성이 변경되었습니다. 강사에게 문의하거나 새로고침 후 다시 시작해 주세요.",
      code: "version_mismatch" as const,
      passage: { id: ctx.passage.id, title: ctx.passage.title },
    };
  }

  if (!progressRow) {
    await supabase.from("exam_stage2_progress").upsert(
      {
        academy_id: asRow.academy_id ?? auth.profile.academy_id,
        assignment_student_id: input.assignmentStudentId,
        passage_id: ctx.passage.id,
        stage_number: 9,
        answers: { ...answer, contentVersion },
        revision: 1,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "assignment_student_id,stage_number" }
    );
  }

  return {
    ok: true as const,
    passage: {
      id: ctx.passage.id,
      title: ctx.passage.title,
      school_level: ctx.passage.school_level,
      grade: ctx.passage.grade,
      source: ctx.passage.source,
      exam_name: ctx.passage.exam_name,
      passage_number: ctx.passage.passage_number,
    },
    problem,
    progress: progressRow
      ? sanitizeProgress({
          ...(progressRow as ExamStage9Progress),
          answers: answer,
        })
      : ({
          answers: answer,
          correct_blank_ids: [],
          incorrect_blank_ids: [],
          completed_blank_ids: [],
          attempt_count: 0,
          hint_used_blank_ids: [],
          revealed_answer_blank_ids: [],
          score: 0,
          progress_percent: 0,
          revision: 1,
          completed_at: null,
        } as unknown as ExamStage9Progress),
    thresholds: STAGE9_DEFAULT_THRESHOLDS,
  };
}

export async function saveStage9DraftAction(input: {
  assignmentStudentId: string;
  passageId: string;
  orderedBlockIds: string[];
  selectedLabels: string[];
  expectedRevision?: number;
  contentVersion?: number;
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

  const blocks = await loadBlocksAdmin(input.passageId);
  const idSet = new Set(blocks.map((b) => b.id));
  for (const id of input.orderedBlockIds) {
    if (!idSet.has(id)) {
      return { ok: false as const, message: "유효하지 않은 문단입니다." };
    }
  }
  if (new Set(input.orderedBlockIds).size !== input.orderedBlockIds.length) {
    return { ok: false as const, message: "같은 문단을 두 번 사용할 수 없습니다." };
  }

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("exam_stage2_progress")
    .select("*")
    .eq("assignment_student_id", input.assignmentStudentId)
    .eq("stage_number", 9)
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
      progress: sanitizeProgress(existing as ExamStage9Progress),
    };
  }

  if (existing?.completed_at) {
    return {
      ok: false as const,
      message: "이미 9단계를 완료했습니다.",
      progress: sanitizeProgress(existing as ExamStage9Progress),
    };
  }

  const prev = parseAnswer(existing?.answers);
  if (prev.isCorrect === true) {
    return {
      ok: true as const,
      progress: sanitizeProgress({
        ...(existing as ExamStage9Progress),
        answers: prev,
      }),
    };
  }

  const next: Stage9AnswerState = {
    ...prev,
    orderedBlockIds: input.orderedBlockIds,
    selectedLabels: input.selectedLabels,
    isCorrect: null,
    contentVersion: input.contentVersion ?? prev.contentVersion,
  };

  const { data, error } = await supabase
    .from("exam_stage2_progress")
    .upsert(
      {
        academy_id: asRow.academy_id ?? auth.profile.academy_id,
        assignment_student_id: input.assignmentStudentId,
        passage_id: input.passageId,
        stage_number: 9,
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
    progress: sanitizeProgress(data as ExamStage9Progress),
  };
}

export async function gradeStage9Action(input: {
  assignmentStudentId: string;
  passageId: string;
  orderedBlockIds: string[];
  contentVersion?: number;
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
  if (!ctx?.passage.stage9_published) {
    return { ok: false as const, message: "9단계가 공개되지 않았습니다." };
  }

  const currentVersion = Number(ctx.passage.stage9_content_version) || 1;
  if (
    input.contentVersion != null &&
    input.contentVersion !== currentVersion
  ) {
    return {
      ok: false as const,
      message: "문제 버전이 다릅니다. 새로고침 후 다시 시도해 주세요.",
      code: "version_mismatch" as const,
    };
  }

  const blocks = await loadBlocksAdmin(input.passageId);
  const incomplete = validateSubmittedOrder(blocks, input.orderedBlockIds);
  if (incomplete) {
    return { ok: false as const, message: incomplete, code: "incomplete" as const };
  }

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("exam_stage2_progress")
    .select("*")
    .eq("assignment_student_id", input.assignmentStudentId)
    .eq("stage_number", 9)
    .maybeSingle();

  if (existing?.completed_at) {
    return {
      ok: false as const,
      message: "이미 9단계를 완료했습니다.",
      progress: sanitizeProgress(existing as ExamStage9Progress),
    };
  }

  const prev = parseAnswer(existing?.answers);
  const ok = gradeBlockOrder(blocks, input.orderedBlockIds);
  const attempts = (prev.attempts ?? 0) + 1;
  const labelById = new Map(blocks.map((b) => [b.id, b.display_label]));
  const selectedLabels = input.orderedBlockIds.map(
    (id) => labelById.get(id) ?? "?"
  );

  const history = [...(prev.attemptHistory ?? [])];
  history.push({
    attemptNumber: attempts,
    orderedBlockIds: input.orderedBlockIds,
    isCorrect: ok,
    submittedAt: new Date().toISOString(),
  });

  const feedback = ok
    ? "전체 문단의 순서를 정확히 완성했습니다."
    : flowHintForAttempt(attempts);

  const next: Stage9AnswerState = {
    orderedBlockIds: input.orderedBlockIds,
    selectedLabels,
    attempts,
    isCorrect: ok,
    hintUsed: prev.hintUsed,
    answerRevealed: prev.answerRevealed,
    hintText: prev.hintText,
    revealedLabels: prev.revealedLabels,
    usedHintTypes: prev.usedHintTypes,
    attemptHistory: history,
    contentVersion: currentVersion,
  };

  const score = ok ? 100 : 0;
  const { data, error } = await supabase
    .from("exam_stage2_progress")
    .upsert(
      {
        academy_id: asRow.academy_id ?? auth.profile.academy_id,
        assignment_student_id: input.assignmentStudentId,
        passage_id: input.passageId,
        stage_number: 9,
        answers: next,
        correct_blank_ids: ok ? blocks.map((b) => b.id) : [],
        incorrect_blank_ids: ok ? [] : blocks.map((b) => b.id),
        completed_blank_ids: ok ? blocks.map((b) => b.id) : [],
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
    progress: sanitizeProgress(data as ExamStage9Progress),
    score,
    isCorrect: ok,
    feedback: ok ? feedback : String(feedback),
  };
}

export async function requestStage9HintAction(input: {
  assignmentStudentId: string;
  hintType?: "structure" | "first_role" | "cohesion" | "edge";
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
    .eq("stage_number", 9)
    .maybeSingle();

  const answer = parseAnswer(existing?.answers);
  const attempts = answer.attempts ?? 0;

  const type =
    input.hintType ??
    (attempts >= STAGE9_DEFAULT_THRESHOLDS.cohesionHintAfter
      ? "cohesion"
      : attempts >= STAGE9_DEFAULT_THRESHOLDS.firstRoleHintAfter
        ? "first_role"
        : "structure");

  const need =
    type === "structure"
      ? STAGE9_DEFAULT_THRESHOLDS.structureHintAfter
      : type === "first_role"
        ? STAGE9_DEFAULT_THRESHOLDS.firstRoleHintAfter
        : type === "cohesion"
          ? STAGE9_DEFAULT_THRESHOLDS.cohesionHintAfter
          : STAGE9_DEFAULT_THRESHOLDS.edgeHintAfter;

  if (attempts < need) {
    return {
      ok: false as const,
      message: `${need}회 이상 오답 후 이 힌트를 볼 수 있습니다.`,
    };
  }

  const blocks = await loadBlocksAdmin(String(existing?.passage_id ?? ""));
  const sorted = [...blocks].sort((a, b) => a.blank_order - b.blank_order);
  const first = sorted[0];
  const last = sorted[sorted.length - 1];

  let hint = flowHintForAttempt(attempts);
  if (type === "structure") {
    const ctx = await loadPassageForAssignment(asRow.assignment_id);
    hint =
      String(ctx?.passage.stage9_structure_hint ?? "").trim() ||
      "문제 상황을 소개한 후 결과를 설명하고, 마지막에 해결책을 제안하는 흐름인지 확인해 보세요.";
  } else if (type === "first_role" && first?.teacher_role) {
    hint = `처음에는 「${STAGE9_ROLE_LABELS[first.teacher_role]}」 역할의 문단이 와야 합니다.`;
  } else if (type === "cohesion") {
    const withClue = sorted.find((b) => b.cohesion_clues.length > 0);
    const clue = withClue?.cohesion_clues[0];
    hint = clue
      ? `「${clue.text}」: ${clue.explanation || "앞 문단과의 연결을 확인해 보세요."}`
      : "앞 문단을 받는 지시어·접속 표현이 있는지 확인해 보세요.";
  } else if (type === "edge") {
    hint = `첫 문단 라벨은 「${first?.display_label}」, 마지막 문단 라벨은 「${last?.display_label}」입니다.`;
  }

  const used = new Set(answer.usedHintTypes ?? []);
  used.add(type);
  const next: Stage9AnswerState = {
    ...answer,
    hintUsed: true,
    hintText: hint,
    usedHintTypes: [...used],
  };

  const { data, error } = await supabase
    .from("exam_stage2_progress")
    .update({
      answers: next,
      hint_used_blank_ids: blocks.map((b) => b.id),
      revision: (Number(existing?.revision) || 0) + 1,
      updated_at: new Date().toISOString(),
    })
    .eq("assignment_student_id", input.assignmentStudentId)
    .eq("stage_number", 9)
    .select("*")
    .single();

  if (error) return { ok: false as const, message: error.message };
  return {
    ok: true as const,
    hint,
    progress: sanitizeProgress(data as ExamStage9Progress),
  };
}

export async function requestStage9RevealAction(input: {
  assignmentStudentId: string;
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
    .eq("stage_number", 9)
    .maybeSingle();

  const answer = parseAnswer(existing?.answers);
  if (answer.attempts < STAGE9_DEFAULT_THRESHOLDS.revealAfterWrong) {
    return {
      ok: false as const,
      message: `${STAGE9_DEFAULT_THRESHOLDS.revealAfterWrong}회 이상 오답 후 정답 순서를 확인할 수 있습니다.`,
    };
  }

  const blocks = await loadBlocksAdmin(String(existing?.passage_id ?? ""));
  const labels = [...blocks]
    .sort((a, b) => a.blank_order - b.blank_order)
    .map((b) => b.display_label);

  const next: Stage9AnswerState = {
    ...answer,
    answerRevealed: true,
    revealedLabels: labels,
  };

  const { data, error } = await supabase
    .from("exam_stage2_progress")
    .update({
      answers: next,
      revealed_answer_blank_ids: blocks.map((b) => b.id),
      revision: (Number(existing?.revision) || 0) + 1,
      updated_at: new Date().toISOString(),
    })
    .eq("assignment_student_id", input.assignmentStudentId)
    .eq("stage_number", 9)
    .select("*")
    .single();

  if (error) return { ok: false as const, message: error.message };
  return {
    ok: true as const,
    labels,
    progress: sanitizeProgress(data as ExamStage9Progress),
  };
}

export async function completeStage9Action(input: {
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

  const blocks = await loadBlocksAdmin(input.passageId);
  if (blocks.length < 2) {
    return { ok: false as const, message: "유효한 문단 블록이 없습니다." };
  }

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("exam_stage2_progress")
    .select("*")
    .eq("assignment_student_id", input.assignmentStudentId)
    .eq("stage_number", 9)
    .maybeSingle();

  if (existing?.completed_at) {
    return {
      ok: true as const,
      message: "9단계 학습을 완료했습니다. 10단계를 시작할 수 있습니다.",
      alreadyCompleted: true,
    };
  }

  const answer = parseAnswer(existing?.answers);
  if (!canCompleteStage9(blocks, answer)) {
    return {
      ok: false as const,
      message: "전체 문단 순서를 정확히 맞혀야 완료할 수 있습니다.",
    };
  }

  await supabase.from("exam_stage2_progress").upsert(
    {
      academy_id: asRow.academy_id ?? auth.profile.academy_id,
      assignment_student_id: input.assignmentStudentId,
      passage_id: input.passageId,
      stage_number: 9,
      answers: answer,
      correct_blank_ids: blocks.map((b) => b.id),
      completed_blank_ids: blocks.map((b) => b.id),
      incorrect_blank_ids: [],
      score: 100,
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
      submitAnswers[q.id as string] = { optionId: "completed" };
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
    message: "9단계 학습을 완료했습니다. 10단계를 시작할 수 있습니다.",
    stageCompleted: true,
  };
}
