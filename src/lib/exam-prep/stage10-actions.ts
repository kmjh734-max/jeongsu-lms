"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  assertPublishedPriorStages,
  STAGE_GATE_MESSAGES,
} from "@/lib/exam-prep/stage-gates";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { isExamPrepEnabled } from "@/lib/academy-features";
import {
  STAGE10_DEFAULT_THRESHOLDS,
  analyzeTokenDiff,
  assembleSegmentStudentValue,
  canCompleteStage10,
  computeStage10Score,
  feedbackForDiff,
  gradeItem,
  gradeSegment,
  parseSentenceIds,
  parseWritingCues,
  parseWritingSegments,
  toStudentStage10Item,
  tokenizeAnswerText,
  writingHintForAttempt,
  type ExamStage10Item,
  type ExamStage10Progress,
  type Stage10BlankDisplayMode,
  type Stage10InputMode,
  type Stage10ItemAnswerState,
} from "@/lib/exam-prep/stage10-types";

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
      "id, title, school_level, grade, source, exam_name, passage_number, stage10_published, stage10_content_version"
    )
    .eq("id", workbook.passage_id)
    .maybeSingle();
  return passage ? { passage, workbookId: workbook.id as string } : null;
}

async function assertPriorStages(
  assignmentStudentId: string,
  passageId: string
) {
  return assertPublishedPriorStages(
    assignmentStudentId,
    passageId,
    10
  );
}


function mapItem(row: Record<string, unknown>): ExamStage10Item {
  return {
    id: String(row.id),
    academy_id: String(row.academy_id),
    passage_id: String(row.passage_id),
    sentence_id: String(row.sentence_id),
    stage_number: 10,
    blank_order: Number(row.blank_order) || 1,
    answer_text: String(row.answer_text ?? ""),
    selected_text: String(row.selected_text ?? ""),
    answer_snapshot: String(row.answer_snapshot ?? ""),
    accepted_answers: Array.isArray(row.accepted_answers)
      ? row.accepted_answers.map(String)
      : [],
    sentence_ids: parseSentenceIds(row.sentence_ids),
    writing_segments: parseWritingSegments(row.writing_segments),
    writing_cues: parseWritingCues(row.writing_cues),
    writing_input_mode:
      (row.writing_input_mode as Stage10InputMode) || "guided_segments",
    writing_blank_display_mode:
      (row.writing_blank_display_mode as Stage10BlankDisplayMode) ||
      "token_slots",
    hint: (row.hint as string | null) ?? null,
    explanation: (row.explanation as string | null) ?? null,
    is_required: row.is_required !== false,
    created_at: String(row.created_at ?? ""),
    updated_at: String(row.updated_at ?? ""),
  };
}

async function loadItemsAdmin(passageId: string): Promise<ExamStage10Item[]> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("exam_stage_blanks")
    .select("*")
    .eq("passage_id", passageId)
    .eq("stage_number", 10)
    .order("blank_order", { ascending: true });
  return (data ?? []).map((r) => mapItem(r as Record<string, unknown>));
}

function parseAnswers(raw: unknown): Record<string, Stage10ItemAnswerState> {
  if (!raw || typeof raw !== "object") return {};
  const out: Record<string, Stage10ItemAnswerState> = {};
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    if (!v || typeof v !== "object") continue;
    const o = v as Record<string, unknown>;
    const segs: Stage10ItemAnswerState["segmentAnswers"] = {};
    if (o.segmentAnswers && typeof o.segmentAnswers === "object") {
      for (const [sid, sv] of Object.entries(
        o.segmentAnswers as Record<string, unknown>
      )) {
        if (!sv || typeof sv !== "object") continue;
        const s = sv as Record<string, unknown>;
        segs[sid] = {
          inputMode: (s.inputMode as Stage10BlankDisplayMode) || "phrase_input",
          tokens: Array.isArray(s.tokens) ? s.tokens.map(String) : undefined,
          value: typeof s.value === "string" ? s.value : undefined,
          assembledValue:
            typeof s.assembledValue === "string" ? s.assembledValue : undefined,
          isCorrect:
            s.isCorrect === true ? true : s.isCorrect === false ? false : null,
        };
      }
    }
    out[k] = {
      segmentAnswers: segs,
      fullSentenceAnswer:
        typeof o.fullSentenceAnswer === "string"
          ? o.fullSentenceAnswer
          : undefined,
      attempts: Number(o.attempts) || 0,
      isCorrect:
        o.isCorrect === true ? true : o.isCorrect === false ? false : null,
      hintUsed: Boolean(o.hintUsed),
      answerRevealed: Boolean(o.answerRevealed),
      hintText: typeof o.hintText === "string" ? o.hintText : null,
      revealedText: typeof o.revealedText === "string" ? o.revealedText : null,
      usedHintTypes: Array.isArray(o.usedHintTypes)
        ? o.usedHintTypes.map(String)
        : [],
    };
  }
  return out;
}

function sanitizeProgress(row: ExamStage10Progress): ExamStage10Progress {
  const answers = parseAnswers(row.answers);
  const cleaned: Record<string, Stage10ItemAnswerState> = {};
  for (const [id, a] of Object.entries(answers)) {
    cleaned[id] = {
      ...a,
      hintText: a.hintUsed ? a.hintText ?? null : null,
      revealedText: a.answerRevealed ? a.revealedText ?? null : null,
    };
  }
  return { ...row, answers: cleaned };
}

export async function loadStage10StudentDataAction(input: {
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
  const prior = await assertPriorStages(input.assignmentStudentId, ctx.passage.id);
  if (!prior.ok) {
    const messages: Record<string, string> = {
      stage9_required: "9단계 문단 배열하기를 먼저 완료해 주세요.",
    };
    return {
      ok: false as const,
      message:
        messages[prior.code] ??
        (prior.code === "stage9_required"
          ? messages.stage9_required
          : "이전 단계를 먼저 완료해 주세요."),
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
  if (!ctx.passage.stage10_published) {
    return {
      ok: false as const,
      message: "10단계가 아직 공개되지 않았습니다.",
      code: "not_published" as const,
      passage: { id: ctx.passage.id, title: ctx.passage.title },
    };
  }
  const items = await loadItemsAdmin(ctx.passage.id);
  if (items.length < 1) {
    return {
      ok: false as const,
      message: "10단계 문제가 준비되지 않았습니다.",
      code: "no_items" as const,
      passage: { id: ctx.passage.id, title: ctx.passage.title },
    };
  }

  const supabase = await createClient();
  const { data: progressRow } = await supabase
    .from("exam_stage2_progress")
    .select("*")
    .eq("assignment_student_id", input.assignmentStudentId)
    .eq("stage_number", 10)
    .maybeSingle();

  const answers = parseAnswers(progressRow?.answers);
  if (!progressRow) {
    await supabase.from("exam_stage2_progress").upsert(
      {
        academy_id: asRow.academy_id ?? auth.profile.academy_id,
        assignment_student_id: input.assignmentStudentId,
        passage_id: ctx.passage.id,
        stage_number: 10,
        answers,
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
    items: items.map(toStudentStage10Item),
    contentVersion: Number(ctx.passage.stage10_content_version) || 1,
    progress: progressRow
      ? sanitizeProgress({
          ...(progressRow as ExamStage10Progress),
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
        } as unknown as ExamStage10Progress),
    thresholds: STAGE10_DEFAULT_THRESHOLDS,
  };
}

export async function saveStage10DraftAction(input: {
  assignmentStudentId: string;
  passageId: string;
  itemAnswers: Record<string, Stage10ItemAnswerState>;
  expectedRevision?: number;
}) {
  const auth = await requireStudent();
  if (!auth.ok) return auth;
  const asRow = await assertAssignmentOwned(
    input.assignmentStudentId,
    auth.profile.id
  );
  if (!asRow) return { ok: false as const, message: "배정을 찾을 수 없습니다." };
  const prior = await assertPriorStages(input.assignmentStudentId, input.passageId);
  if (!prior.ok) {
    return { ok: false as const, message: "이전 단계를 먼저 완료해 주세요." };
  }
  const items = await loadItemsAdmin(input.passageId);
  const byId = new Map(items.map((i) => [i.id, i]));

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("exam_stage2_progress")
    .select("*")
    .eq("assignment_student_id", input.assignmentStudentId)
    .eq("stage_number", 10)
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
      progress: sanitizeProgress(existing as ExamStage10Progress),
    };
  }
  if (existing?.completed_at) {
    return {
      ok: false as const,
      message: "이미 10단계를 완료했습니다.",
      progress: sanitizeProgress(existing as ExamStage10Progress),
    };
  }

  const next = parseAnswers(existing?.answers);
  for (const [itemId, state] of Object.entries(input.itemAnswers)) {
    const item = byId.get(itemId);
    if (!item) continue;
    if (next[itemId]?.isCorrect === true) continue;
    const segIds = new Set(
      parseWritingSegments(item.writing_segments)
        .filter((s) => s.segmentType === "answer_segment")
        .map((s) => s.id)
    );
    for (const sid of Object.keys(state.segmentAnswers ?? {})) {
      if (!segIds.has(sid)) {
        return { ok: false as const, message: "유효하지 않은 영작 구간입니다." };
      }
    }
    next[itemId] = {
      segmentAnswers: state.segmentAnswers ?? {},
      fullSentenceAnswer: state.fullSentenceAnswer,
      attempts: next[itemId]?.attempts ?? 0,
      isCorrect: next[itemId]?.isCorrect ?? null,
      hintUsed: next[itemId]?.hintUsed ?? false,
      answerRevealed: next[itemId]?.answerRevealed ?? false,
      hintText: next[itemId]?.hintText,
      revealedText: next[itemId]?.revealedText,
      usedHintTypes: next[itemId]?.usedHintTypes,
    };
  }

  const { data, error } = await supabase
    .from("exam_stage2_progress")
    .upsert(
      {
        academy_id: asRow.academy_id ?? auth.profile.academy_id,
        assignment_student_id: input.assignmentStudentId,
        passage_id: input.passageId,
        stage_number: 10,
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
    progress: sanitizeProgress(data as ExamStage10Progress),
  };
}

export async function gradeStage10Action(input: {
  assignmentStudentId: string;
  passageId: string;
  itemIds?: string[];
  itemAnswers: Record<string, Stage10ItemAnswerState>;
}) {
  const auth = await requireStudent();
  if (!auth.ok) return auth;
  const asRow = await assertAssignmentOwned(
    input.assignmentStudentId,
    auth.profile.id
  );
  if (!asRow) return { ok: false as const, message: "배정을 찾을 수 없습니다." };
  const prior = await assertPriorStages(input.assignmentStudentId, input.passageId);
  if (!prior.ok) {
    return { ok: false as const, message: "이전 단계를 먼저 완료해 주세요." };
  }
  const ctx = await loadPassageForAssignment(asRow.assignment_id);
  if (!ctx?.passage.stage10_published) {
    return { ok: false as const, message: "10단계가 공개되지 않았습니다." };
  }

  const items = await loadItemsAdmin(input.passageId);
  const targetIds = new Set(
    input.itemIds?.length ? input.itemIds : items.map((i) => i.id)
  );
  const byId = new Map(items.map((i) => [i.id, i]));

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("exam_stage2_progress")
    .select("*")
    .eq("assignment_student_id", input.assignmentStudentId)
    .eq("stage_number", 10)
    .maybeSingle();
  if (existing?.completed_at) {
    return {
      ok: false as const,
      message: "이미 10단계를 완료했습니다.",
      progress: sanitizeProgress(existing as ExamStage10Progress),
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

  for (const itemId of targetIds) {
    const item = byId.get(itemId);
    if (!item) continue;
    const prev = next[itemId];
    if (prev?.isCorrect === true) continue;

    const incoming = input.itemAnswers[itemId] ?? prev;
    const state: Stage10ItemAnswerState = {
      segmentAnswers: incoming?.segmentAnswers ?? {},
      fullSentenceAnswer: incoming?.fullSentenceAnswer ?? "",
      attempts: prev?.attempts ?? 0,
      isCorrect: null,
      hintUsed: prev?.hintUsed ?? false,
      answerRevealed: prev?.answerRevealed ?? false,
      hintText: prev?.hintText,
      revealedText: prev?.revealedText,
      usedHintTypes: prev?.usedHintTypes,
    };

    // incomplete check
    let incomplete = false;
    if (item.writing_input_mode === "full_sentence") {
      if (!String(state.fullSentenceAnswer ?? "").trim()) incomplete = true;
    } else {
      for (const seg of parseWritingSegments(item.writing_segments)) {
        if (seg.segmentType !== "answer_segment") continue;
        const val = assembleSegmentStudentValue(
          state.segmentAnswers[seg.id],
          item.writing_blank_display_mode
        );
        if (!val.trim()) {
          incomplete = true;
          break;
        }
      }
    }
    if (incomplete) {
      next[itemId] = { ...state, isCorrect: null };
      feedback[itemId] = "모든 영작 빈칸을 완성해 주세요.";
      incorrectIds.delete(itemId);
      correctIds.delete(itemId);
      completedIds.delete(itemId);
      continue;
    }

    const ok = gradeItem(item, state);
    const attempts = (prev?.attempts ?? 0) + 1;
    let fb: string | null = ok
      ? null
      : item.hint?.trim() || writingHintForAttempt(attempts);
    if (!ok && item.writing_blank_display_mode === "token_slots") {
      const firstAns = parseWritingSegments(item.writing_segments).find(
        (s) => s.segmentType === "answer_segment"
      );
      if (firstAns) {
        const expected =
          firstAns.answerTokens?.length
            ? firstAns.answerTokens
            : tokenizeAnswerText(firstAns.originalAnswerText ?? "");
        const actual =
          state.segmentAnswers[firstAns.id]?.tokens ??
          tokenizeAnswerText(
            assembleSegmentStudentValue(
              state.segmentAnswers[firstAns.id],
              "token_slots"
            )
          );
        fb = feedbackForDiff(analyzeTokenDiff(expected, actual));
      }
    }

    // mark segment correctness
    for (const [sid, sans] of Object.entries(state.segmentAnswers)) {
      const seg = parseWritingSegments(item.writing_segments).find(
        (s) => s.id === sid
      );
      if (!seg || seg.segmentType !== "answer_segment") continue;
      const val = assembleSegmentStudentValue(
        sans,
        item.writing_blank_display_mode
      );
      const segOk = ok
        ? true
        : gradeSegment(seg, val);
      state.segmentAnswers[sid] = { ...sans, isCorrect: segOk };
    }

    next[itemId] = {
      ...state,
      attempts,
      isCorrect: ok,
    };
    feedback[itemId] = fb;
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

  const score = computeStage10Score(items, correctIds);
  const { data, error } = await supabase
    .from("exam_stage2_progress")
    .upsert(
      {
        academy_id: asRow.academy_id ?? auth.profile.academy_id,
        assignment_student_id: input.assignmentStudentId,
        passage_id: input.passageId,
        stage_number: 10,
        answers: next,
        correct_blank_ids: [...correctIds],
        incorrect_blank_ids: [...incorrectIds],
        completed_blank_ids: [...completedIds],
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
    progress: sanitizeProgress(data as ExamStage10Progress),
    score,
    feedback,
  };
}

export async function requestStage10HintAction(input: {
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
    .eq("stage_number", 10)
    .maybeSingle();
  const answers = parseAnswers(existing?.answers);
  const state = answers[input.itemId];
  if (!state || state.attempts < STAGE10_DEFAULT_THRESHOLDS.grammarHintAfter) {
    return {
      ok: false as const,
      message: `${STAGE10_DEFAULT_THRESHOLDS.grammarHintAfter}회 이상 오답 후 힌트를 볼 수 있습니다.`,
    };
  }
  const items = await loadItemsAdmin(String(existing?.passage_id ?? ""));
  const item = items.find((i) => i.id === input.itemId);
  if (!item) return { ok: false as const, message: "문항을 찾을 수 없습니다." };

  let hint = item.hint?.trim() || writingHintForAttempt(state.attempts);
  if (state.attempts >= STAGE10_DEFAULT_THRESHOLDS.firstTokenHintAfter) {
    const first = parseWritingSegments(item.writing_segments).find(
      (s) => s.segmentType === "answer_segment"
    );
    const tok =
      first?.answerTokens?.[0] ??
      tokenizeAnswerText(first?.originalAnswerText ?? "")[0];
    if (tok) hint = `첫 단어는 ${tok}입니다.`;
  } else if (
    state.attempts >= STAGE10_DEFAULT_THRESHOLDS.functionWordHintAfter
  ) {
    hint = "be동사나 전치사 등 기능어가 빠지지 않았는지 확인해 보세요.";
  }

  const used = new Set(state.usedHintTypes ?? []);
  used.add("hint");
  answers[input.itemId] = {
    ...state,
    hintUsed: true,
    hintText: hint,
    usedHintTypes: [...used],
  };
  const { data, error } = await supabase
    .from("exam_stage2_progress")
    .update({
      answers,
      hint_used_blank_ids: [
        ...new Set([
          ...((existing?.hint_used_blank_ids as string[]) ?? []),
          input.itemId,
        ]),
      ],
      revision: (Number(existing?.revision) || 0) + 1,
      updated_at: new Date().toISOString(),
    })
    .eq("assignment_student_id", input.assignmentStudentId)
    .eq("stage_number", 10)
    .select("*")
    .single();
  if (error) return { ok: false as const, message: error.message };
  return {
    ok: true as const,
    hint,
    progress: sanitizeProgress(data as ExamStage10Progress),
  };
}

export async function requestStage10RevealAction(input: {
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
    .eq("stage_number", 10)
    .maybeSingle();
  const answers = parseAnswers(existing?.answers);
  const state = answers[input.itemId];
  if (
    !state ||
    state.attempts < STAGE10_DEFAULT_THRESHOLDS.fullRevealAfter
  ) {
    return {
      ok: false as const,
      message: `${STAGE10_DEFAULT_THRESHOLDS.fullRevealAfter}회 이상 오답 후 정답을 확인할 수 있습니다.`,
    };
  }
  const items = await loadItemsAdmin(String(existing?.passage_id ?? ""));
  const item = items.find((i) => i.id === input.itemId);
  if (!item) return { ok: false as const, message: "문항을 찾을 수 없습니다." };

  answers[input.itemId] = {
    ...state,
    answerRevealed: true,
    revealedText: item.answer_text,
  };
  const { data, error } = await supabase
    .from("exam_stage2_progress")
    .update({
      answers,
      revealed_answer_blank_ids: [
        ...new Set([
          ...((existing?.revealed_answer_blank_ids as string[]) ?? []),
          input.itemId,
        ]),
      ],
      revision: (Number(existing?.revision) || 0) + 1,
      updated_at: new Date().toISOString(),
    })
    .eq("assignment_student_id", input.assignmentStudentId)
    .eq("stage_number", 10)
    .select("*")
    .single();
  if (error) return { ok: false as const, message: error.message };
  return {
    ok: true as const,
    answer: item.answer_text,
    progress: sanitizeProgress(data as ExamStage10Progress),
  };
}

async function verifyAllStagesComplete(
  assignmentStudentId: string
): Promise<boolean> {
  const admin = createAdminClient();
  const { data: s1 } = await admin
    .from("exam_stage1_progress")
    .select("completed_at")
    .eq("assignment_student_id", assignmentStudentId)
    .eq("stage_number", 1)
    .maybeSingle();
  if (!s1?.completed_at) return false;
  for (const n of [2, 3, 4, 5, 6, 7, 8, 9, 10] as const) {
    const { data } = await admin
      .from("exam_stage2_progress")
      .select("completed_at")
      .eq("assignment_student_id", assignmentStudentId)
      .eq("stage_number", n)
      .maybeSingle();
    if (!data?.completed_at) return false;
  }
  return true;
}

export async function completeStage10Action(input: {
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
  const prior = await assertPriorStages(input.assignmentStudentId, input.passageId);
  if (!prior.ok) {
    return { ok: false as const, message: "이전 단계를 먼저 완료해 주세요." };
  }

  const items = await loadItemsAdmin(input.passageId);
  const required = items.filter((i) => i.is_required);
  if (required.length < 1) {
    return { ok: false as const, message: "필수 영작 문항이 없습니다." };
  }

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("exam_stage2_progress")
    .select("*")
    .eq("assignment_student_id", input.assignmentStudentId)
    .eq("stage_number", 10)
    .maybeSingle();

  const answers = parseAnswers(existing?.answers);
  if (!canCompleteStage10(items, answers)) {
    return {
      ok: false as const,
      message: "모든 필수 영작 문항을 맞혀야 완료할 수 있습니다.",
    };
  }

  if (!existing?.completed_at) {
    await supabase.from("exam_stage2_progress").upsert(
      {
        academy_id: asRow.academy_id ?? auth.profile.academy_id,
        assignment_student_id: input.assignmentStudentId,
        passage_id: input.passageId,
        stage_number: 10,
        answers,
        correct_blank_ids: required.map((i) => i.id),
        completed_blank_ids: required.map((i) => i.id),
        incorrect_blank_ids: [],
        score: 100,
        progress_percent: 100,
        completed_at: new Date().toISOString(),
        revision: (Number(existing?.revision) || 0) + 1,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "assignment_student_id,stage_number" }
    );
  }

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

  const allDone = await verifyAllStagesComplete(input.assignmentStudentId);
  if (allDone) {
    await supabase
      .from("exam_assignment_students")
      .update({
        status: "completed",
        progress_rate: 100,
        completed_at: new Date().toISOString(),
        last_studied_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", input.assignmentStudentId)
      .eq("student_id", auth.profile.id);
  }

  revalidatePath(`/student/exam-prep/${input.assignmentStudentId}`);
  revalidatePath("/student/exam-prep");
  return {
    ok: true as const,
    message: "10단계 학습을 모두 완료했습니다!",
    stageCompleted: true,
    overallCompleted: allDone,
  };
}

export async function loadStage10OverallSummaryAction(input: {
  assignmentStudentId: string;
}) {
  const auth = await requireStudent();
  if (!auth.ok) return auth;
  const asRow = await assertAssignmentOwned(
    input.assignmentStudentId,
    auth.profile.id
  );
  if (!asRow) return { ok: false as const, message: "배정을 찾을 수 없습니다." };

  const admin = createAdminClient();
  const stages: Array<{
    stage: number;
    completed: boolean;
    score: number | null;
    attempts: number;
  }> = [];

  const { data: s1 } = await admin
    .from("exam_stage1_progress")
    .select("completed_at, progress_percent")
    .eq("assignment_student_id", input.assignmentStudentId)
    .eq("stage_number", 1)
    .maybeSingle();
  stages.push({
    stage: 1,
    completed: Boolean(s1?.completed_at),
    score: s1?.progress_percent != null ? Number(s1.progress_percent) : null,
    attempts: 0,
  });

  for (const n of [2, 3, 4, 5, 6, 7, 8, 9, 10] as const) {
    const { data } = await admin
      .from("exam_stage2_progress")
      .select("completed_at, score, attempt_count")
      .eq("assignment_student_id", input.assignmentStudentId)
      .eq("stage_number", n)
      .maybeSingle();
    stages.push({
      stage: n,
      completed: Boolean(data?.completed_at),
      score: data?.score != null ? Number(data.score) : null,
      attempts: Number(data?.attempt_count) || 0,
    });
  }

  const { data: asFull } = await admin
    .from("exam_assignment_students")
    .select("status, completed_at, started_at, progress_rate")
    .eq("id", input.assignmentStudentId)
    .maybeSingle();

  const completedCount = stages.filter((s) => s.completed).length;
  return {
    ok: true as const,
    stages,
    completedStageCount: completedCount,
    totalStageCount: 10,
    overallStatus: asFull?.status ?? "in_progress",
    overallCompleted: asFull?.status === "completed" && completedCount === 10,
    startedAt: asFull?.started_at ?? null,
    completedAt: asFull?.completed_at ?? null,
    progressRate: Number(asFull?.progress_rate) || completedCount * 10,
  };
}
