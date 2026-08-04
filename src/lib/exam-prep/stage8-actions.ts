"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { isExamPrepEnabled } from "@/lib/academy-features";
import {
  STAGE8_DEFAULT_THRESHOLDS,
  canCompleteStage8,
  computeStage8Score,
  gradeChunkOrder,
  parseReorderChunks,
  structureHintForAttempt,
  toStudentStage8Group,
  type ExamStage8Group,
  type ExamStage8Progress,
  type Stage8AnswerState,
} from "@/lib/exam-prep/stage8-types";

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
      "id, title, school_level, grade, source, exam_name, passage_number, stage8_published, stage8_content_version"
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
  for (const n of [2, 3, 4, 5, 6, 7] as const) {
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

async function loadGroupsAdmin(passageId: string): Promise<ExamStage8Group[]> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("exam_stage_blanks")
    .select("*")
    .eq("passage_id", passageId)
    .eq("stage_number", 8)
    .order("blank_order", { ascending: true });
  return (data ?? []).map((row) => ({
    ...(row as ExamStage8Group),
    stage_number: 8 as const,
    reorder_chunks: parseReorderChunks(
      (row as { reorder_chunks: unknown }).reorder_chunks
    ),
  }));
}

function parseAnswers(raw: unknown): Record<string, Stage8AnswerState> {
  if (!raw || typeof raw !== "object") return {};
  const out: Record<string, Stage8AnswerState> = {};
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    if (!v || typeof v !== "object") continue;
    const o = v as Record<string, unknown>;
    out[k] = {
      studentOrder: Array.isArray(o.studentOrder)
        ? o.studentOrder.map(String)
        : [],
      initialOrder: Array.isArray(o.initialOrder)
        ? o.initialOrder.map(String)
        : [],
      isCorrect:
        o.isCorrect === true ? true : o.isCorrect === false ? false : null,
      attempts: Number(o.attempts) || 0,
      hintUsed: Boolean(o.hintUsed),
      answerRevealed: Boolean(o.answerRevealed),
      hintText: typeof o.hintText === "string" ? o.hintText : null,
      revealedOrder: Array.isArray(o.revealedOrder)
        ? o.revealedOrder.map(String)
        : null,
    };
  }
  return out;
}

function sanitizeProgressForClient(
  row: ExamStage8Progress
): ExamStage8Progress {
  const answers: Record<string, Stage8AnswerState> = {};
  for (const [id, a] of Object.entries(parseAnswers(row.answers))) {
    answers[id] = {
      studentOrder: a.studentOrder,
      initialOrder: a.initialOrder,
      isCorrect: a.isCorrect,
      attempts: a.attempts,
      hintUsed: a.hintUsed,
      answerRevealed: a.answerRevealed,
      hintText: a.hintUsed ? a.hintText ?? null : null,
      // 정답 확인 후 일시 공개만 허용 — 클라이언트에는 이미 기록된 값만
      revealedOrder: a.answerRevealed ? a.revealedOrder ?? null : null,
    };
  }
  return { ...row, answers };
}

function ensureInitialOrder(
  group: ExamStage8Group,
  state: Stage8AnswerState | undefined,
  assignmentStudentId: string
): string[] {
  if (state?.initialOrder?.length) return state.initialOrder;
  return toStudentStage8Group(
    group,
    `${assignmentStudentId}:${group.id}:1`
  ).initialOrder;
}

export async function loadStage8StudentDataAction(input: {
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
    };
    return {
      ok: false as const,
      message: messages[prior.code] ?? "이전 단계를 먼저 완료해 주세요.",
      code: prior.code,
      passage: ctx.passage,
    };
  }

  if (!ctx.passage.stage8_published) {
    return {
      ok: false as const,
      message: "8단계가 아직 공개되지 않았습니다.",
      code: "not_published" as const,
      passage: ctx.passage,
    };
  }

  const groups = await loadGroupsAdmin(ctx.passage.id);
  if (groups.length < 1) {
    return {
      ok: false as const,
      message: "8단계 문제가 준비되지 않았습니다.",
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
    .eq("stage_number", 8)
    .maybeSingle();

  const answers = parseAnswers(progressRow?.answers);
  const publicGroups = groups.map((g) => {
    const initial = ensureInitialOrder(
      g,
      answers[g.id],
      input.assignmentStudentId
    );
    if (!answers[g.id]) {
      answers[g.id] = {
        studentOrder: [],
        initialOrder: initial,
        isCorrect: null,
        attempts: 0,
        hintUsed: false,
        answerRevealed: false,
      };
    } else if (!answers[g.id]!.initialOrder?.length) {
      answers[g.id]!.initialOrder = initial;
    }
    return toStudentStage8Group(
      g,
      `${input.assignmentStudentId}:${g.id}:1`,
      answers[g.id]!.initialOrder
    );
  });

  await supabase.from("exam_stage2_progress").upsert(
    {
      academy_id: asRow.academy_id ?? auth.profile.academy_id,
      assignment_student_id: input.assignmentStudentId,
      passage_id: ctx.passage.id,
      stage_number: 8,
      answers,
      revision: (Number(progressRow?.revision) || 0) + (progressRow ? 0 : 1),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "assignment_student_id,stage_number" }
  );

  return {
    ok: true as const,
    passage: ctx.passage,
    sentences: sentences ?? [],
    groups: publicGroups,
    contentVersion: Number(ctx.passage.stage8_content_version) || 1,
    progress: progressRow
      ? sanitizeProgressForClient({
          ...(progressRow as ExamStage8Progress),
          answers,
        })
      : ({
          answers,
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
        } as unknown as ExamStage8Progress),
    thresholds: STAGE8_DEFAULT_THRESHOLDS,
  };
}

export async function saveStage8DraftAction(input: {
  assignmentStudentId: string;
  passageId: string;
  orders: Record<string, string[]>;
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

  const groups = await loadGroupsAdmin(input.passageId);
  const byId = new Map(groups.map((g) => [g.id, g]));

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("exam_stage2_progress")
    .select("*")
    .eq("assignment_student_id", input.assignmentStudentId)
    .eq("stage_number", 8)
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
      progress: sanitizeProgressForClient(existing as ExamStage8Progress),
    };
  }

  const next = parseAnswers(existing?.answers);
  for (const [groupId, studentOrder] of Object.entries(input.orders)) {
    const group = byId.get(groupId);
    if (!group) continue;
    const prev = next[groupId];
    if (prev?.isCorrect === true) continue;
    const chunkIds = new Set(parseReorderChunks(group.reorder_chunks).map((c) => c.id));
    for (const id of studentOrder) {
      if (!chunkIds.has(id)) {
        return { ok: false as const, message: "유효하지 않은 카드입니다." };
      }
    }
    if (new Set(studentOrder).size !== studentOrder.length) {
      return { ok: false as const, message: "카드가 중복 배치되었습니다." };
    }
    const initial = ensureInitialOrder(
      group,
      prev,
      input.assignmentStudentId
    );
    next[groupId] = {
      studentOrder,
      initialOrder: initial,
      isCorrect: prev?.isCorrect ?? null,
      attempts: prev?.attempts ?? 0,
      hintUsed: prev?.hintUsed ?? false,
      answerRevealed: prev?.answerRevealed ?? false,
      hintText: prev?.hintText ?? null,
      revealedOrder: prev?.revealedOrder ?? null,
    };
  }

  const { data, error } = await supabase
    .from("exam_stage2_progress")
    .upsert(
      {
        academy_id: asRow.academy_id ?? auth.profile.academy_id,
        assignment_student_id: input.assignmentStudentId,
        passage_id: input.passageId,
        stage_number: 8,
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
    progress: sanitizeProgressForClient(data as ExamStage8Progress),
  };
}

export async function gradeStage8Action(input: {
  assignmentStudentId: string;
  passageId: string;
  groupIds?: string[];
  orders: Record<string, string[]>;
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
  if (!ctx?.passage.stage8_published) {
    return { ok: false as const, message: "8단계가 공개되지 않았습니다." };
  }

  const groups = await loadGroupsAdmin(input.passageId);
  const targetIds = new Set(
    input.groupIds?.length ? input.groupIds : groups.map((g) => g.id)
  );
  const byId = new Map(groups.map((g) => [g.id, g]));

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("exam_stage2_progress")
    .select("*")
    .eq("assignment_student_id", input.assignmentStudentId)
    .eq("stage_number", 8)
    .maybeSingle();

  if (existing?.completed_at) {
    return {
      ok: false as const,
      message: "이미 8단계를 완료했습니다.",
      progress: sanitizeProgressForClient(existing as ExamStage8Progress),
    };
  }

  const next = parseAnswers(existing?.answers);
  const correctIds = new Set<string>(
    (existing?.correct_blank_ids as string[] | undefined) ?? []
  );
  const incorrectIds = new Set<string>(
    (existing?.incorrect_blank_ids as string[] | undefined) ?? []
  );
  const completedIds = new Set<string>(
    (existing?.completed_blank_ids as string[] | undefined) ?? []
  );

  const feedback: Record<string, string | null> = {};

  for (const groupId of targetIds) {
    const group = byId.get(groupId);
    if (!group) continue;
    const prev = next[groupId];
    if (prev?.isCorrect === true) continue;

    const chunks = parseReorderChunks(group.reorder_chunks);
    const studentOrder =
      input.orders[groupId] ?? prev?.studentOrder ?? [];
    const chunkIdSet = new Set(chunks.map((c) => c.id));

    if (studentOrder.length === 0) {
      next[groupId] = {
        studentOrder: [],
        initialOrder: ensureInitialOrder(
          group,
          prev,
          input.assignmentStudentId
        ),
        isCorrect: null,
        attempts: prev?.attempts ?? 0,
        hintUsed: prev?.hintUsed ?? false,
        answerRevealed: prev?.answerRevealed ?? false,
        hintText: prev?.hintText ?? null,
        revealedOrder: prev?.revealedOrder ?? null,
      };
      incorrectIds.delete(groupId);
      correctIds.delete(groupId);
      completedIds.delete(groupId);
      feedback[groupId] = "카드를 모두 배치한 뒤 채점해 주세요.";
      continue;
    }

    if (studentOrder.length !== chunks.length) {
      next[groupId] = {
        studentOrder,
        initialOrder: ensureInitialOrder(
          group,
          prev,
          input.assignmentStudentId
        ),
        isCorrect: null,
        attempts: prev?.attempts ?? 0,
        hintUsed: prev?.hintUsed ?? false,
        answerRevealed: prev?.answerRevealed ?? false,
        hintText: prev?.hintText ?? null,
        revealedOrder: prev?.revealedOrder ?? null,
      };
      feedback[groupId] = "모든 카드를 완성 영역에 배치해 주세요.";
      continue;
    }

    for (const id of studentOrder) {
      if (!chunkIdSet.has(id)) {
        return {
          ok: false as const,
          message: "다른 구간의 카드가 포함되어 있습니다.",
        };
      }
    }
    if (new Set(studentOrder).size !== studentOrder.length) {
      return { ok: false as const, message: "카드가 중복 배치되었습니다." };
    }

    const ok = gradeChunkOrder(
      chunks,
      studentOrder,
      group.selected_text || group.answer_text
    );
    const attempts = (prev?.attempts ?? 0) + 1;
    const fb = ok
      ? null
      : group.hint?.trim() || structureHintForAttempt(attempts);

    next[groupId] = {
      studentOrder,
      initialOrder: ensureInitialOrder(
        group,
        prev,
        input.assignmentStudentId
      ),
      isCorrect: ok,
      attempts,
      hintUsed: prev?.hintUsed ?? false,
      answerRevealed: prev?.answerRevealed ?? false,
      hintText: prev?.hintText ?? null,
      revealedOrder: prev?.revealedOrder ?? null,
    };
    feedback[groupId] = fb;

    if (ok) {
      correctIds.add(groupId);
      incorrectIds.delete(groupId);
      completedIds.add(groupId);
    } else {
      incorrectIds.add(groupId);
      correctIds.delete(groupId);
      completedIds.delete(groupId);
    }
  }

  const score = computeStage8Score(groups, correctIds);

  const { data, error } = await supabase
    .from("exam_stage2_progress")
    .upsert(
      {
        academy_id: asRow.academy_id ?? auth.profile.academy_id,
        assignment_student_id: input.assignmentStudentId,
        passage_id: input.passageId,
        stage_number: 8,
        answers: next,
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
    progress: sanitizeProgressForClient(data as ExamStage8Progress),
    score,
    feedback,
  };
}

export async function requestStage8HintAction(input: {
  assignmentStudentId: string;
  groupId: string;
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
    .eq("stage_number", 8)
    .maybeSingle();

  const answers = parseAnswers(existing?.answers);
  const state = answers[input.groupId];
  if (!state || state.attempts < STAGE8_DEFAULT_THRESHOLDS.hintAfterWrong) {
    return {
      ok: false as const,
      message: `${STAGE8_DEFAULT_THRESHOLDS.hintAfterWrong}회 이상 오답 후 힌트를 볼 수 있습니다.`,
    };
  }

  const groups = await loadGroupsAdmin(String(existing?.passage_id ?? ""));
  const group = groups.find((g) => g.id === input.groupId);
  if (!group) return { ok: false as const, message: "항목을 찾을 수 없습니다." };

  const chunks = parseReorderChunks(group.reorder_chunks).sort(
    (a, b) => a.chunkOrder - b.chunkOrder
  );
  let hint =
    group.hint?.trim() || structureHintForAttempt(state.attempts);
  if (state.attempts >= 2 && chunks[0]) {
    hint = `문장의 첫 카드는 「${chunks[0].chunkText}」입니다.`;
  }

  const hintUsed = new Set<string>(
    (existing?.hint_used_blank_ids as string[] | undefined) ?? []
  );
  hintUsed.add(input.groupId);
  answers[input.groupId] = { ...state, hintUsed: true, hintText: hint };

  const { data, error } = await supabase
    .from("exam_stage2_progress")
    .update({
      answers,
      hint_used_blank_ids: [...hintUsed],
      revision: (Number(existing?.revision) || 0) + 1,
      updated_at: new Date().toISOString(),
    })
    .eq("assignment_student_id", input.assignmentStudentId)
    .eq("stage_number", 8)
    .select("*")
    .single();

  if (error) return { ok: false as const, message: error.message };
  return {
    ok: true as const,
    hint,
    progress: sanitizeProgressForClient(data as ExamStage8Progress),
  };
}

export async function requestStage8RevealAction(input: {
  assignmentStudentId: string;
  groupId: string;
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
    .eq("stage_number", 8)
    .maybeSingle();

  const answers = parseAnswers(existing?.answers);
  const state = answers[input.groupId];
  if (
    !state ||
    state.attempts < STAGE8_DEFAULT_THRESHOLDS.revealAfterWrong
  ) {
    return {
      ok: false as const,
      message: `${STAGE8_DEFAULT_THRESHOLDS.revealAfterWrong}회 이상 오답 후 정답 순서를 확인할 수 있습니다.`,
    };
  }

  const groups = await loadGroupsAdmin(String(existing?.passage_id ?? ""));
  const group = groups.find((g) => g.id === input.groupId);
  if (!group) return { ok: false as const, message: "항목을 찾을 수 없습니다." };

  const correctOrder = parseReorderChunks(group.reorder_chunks)
    .sort((a, b) => a.chunkOrder - b.chunkOrder)
    .map((c) => c.id);
  const correctTexts = parseReorderChunks(group.reorder_chunks)
    .sort((a, b) => a.chunkOrder - b.chunkOrder)
    .map((c) => c.chunkText);

  const revealed = new Set<string>(
    (existing?.revealed_answer_blank_ids as string[] | undefined) ?? []
  );
  revealed.add(input.groupId);
  answers[input.groupId] = {
    ...state,
    answerRevealed: true,
    revealedOrder: correctOrder,
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
    .eq("stage_number", 8)
    .select("*")
    .single();

  if (error) return { ok: false as const, message: error.message };
  return {
    ok: true as const,
    /** 일시 확인용 텍스트 — 자동 배치하지 않음 */
    orderTexts: correctTexts,
    progress: sanitizeProgressForClient(data as ExamStage8Progress),
  };
}

export async function completeStage8Action(input: {
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

  const groups = await loadGroupsAdmin(input.passageId);
  const required = groups.filter((g) => g.is_required);
  if (required.length < 1) {
    return { ok: false as const, message: "필수 배열 구간이 없습니다." };
  }

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("exam_stage2_progress")
    .select("*")
    .eq("assignment_student_id", input.assignmentStudentId)
    .eq("stage_number", 8)
    .maybeSingle();

  if (existing?.completed_at) {
    return {
      ok: true as const,
      message: "8단계 학습을 완료했습니다. 9단계를 시작할 수 있습니다.",
      alreadyCompleted: true,
    };
  }

  const answers = parseAnswers(existing?.answers);
  if (!canCompleteStage8(groups, answers)) {
    return {
      ok: false as const,
      message: "모든 필수 배열 구간을 맞혀야 완료할 수 있습니다.",
    };
  }

  const score = 100;

  await supabase.from("exam_stage2_progress").upsert(
    {
      academy_id: asRow.academy_id ?? auth.profile.academy_id,
      assignment_student_id: input.assignmentStudentId,
      passage_id: input.passageId,
      stage_number: 8,
      answers,
      correct_blank_ids: required.map((g) => g.id),
      completed_blank_ids: required.map((g) => g.id),
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
    message: "8단계 학습을 완료했습니다. 9단계를 시작할 수 있습니다.",
    stageCompleted: true,
  };
}
