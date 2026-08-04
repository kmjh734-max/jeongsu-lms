"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { isExamPrepEnabled } from "@/lib/academy-features";
import {
  assignShuffledLabels,
  collectStage9Warnings,
  labelForIndex,
  parseCohesionClues,
  parseSentenceIds,
  renderBlockText,
  sortSentenceIdsByPassage,
  validateStage9Blocks,
  type ExamStage9Block,
  type Stage9AnswerMode,
  type Stage9BlockDraft,
  type Stage9ConfigDraft,
  type Stage9TeacherRole,
} from "@/lib/exam-prep/stage9-types";

async function requireStaff() {
  if (!isExamPrepEnabled()) {
    return { ok: false as const, message: "기능을 사용할 수 없습니다." };
  }
  const profile = await getCurrentProfile();
  if (
    !profile ||
    (profile.role !== "admin" && profile.role !== "teacher") ||
    !profile.academy_id
  ) {
    return { ok: false as const, message: "권한이 없습니다." };
  }
  return { ok: true as const, profile };
}

function revalidatePassage(passageId: string) {
  revalidatePath(`/admin/exam-prep/passages/${passageId}`);
  revalidatePath(`/teacher/exam-prep/passages/${passageId}`);
  revalidatePath("/student/exam-prep");
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

export async function saveStage9ConfigAction(
  passageId: string,
  draft: Stage9ConfigDraft,
  opts?: { reshuffleLabels?: boolean }
) {
  const auth = await requireStaff();
  if (!auth.ok) return auth;
  const supabase = await createClient();

  const { data: passage } = await supabase
    .from("exam_passages")
    .select("id, stage9_content_version, stage9_published")
    .eq("id", passageId)
    .eq("academy_id", auth.profile.academy_id)
    .maybeSingle();
  if (!passage) return { ok: false as const, message: "지문을 찾을 수 없습니다." };

  const { data: sentences } = await supabase
    .from("exam_passage_sentences")
    .select("id, english_text, sentence_order")
    .eq("passage_id", passageId)
    .eq("academy_id", auth.profile.academy_id)
    .order("sentence_order", { ascending: true });

  const orderedIds = (sentences ?? []).map((s) => s.id as string);
  const englishById = new Map(
    (sentences ?? []).map((s) => [
      s.id as string,
      String(s.english_text ?? ""),
    ])
  );

  const normalized: Stage9BlockDraft[] = draft.blocks.map((b, i) => ({
    ...b,
    sentence_ids: sortSentenceIdsByPassage(b.sentence_ids, orderedIds),
    blank_order: b.blank_order || i + 1,
  }));

  const err = validateStage9Blocks(orderedIds, normalized);
  if (err) return { ok: false as const, message: err };

  const warnings = collectStage9Warnings(orderedIds, normalized, draft);

  let labels = normalized.map(
    (b, i) => b.display_label?.trim() || labelForIndex(i)
  );
  if (opts?.reshuffleLabels || labels.every((l, i) => l === labelForIndex(i))) {
    labels = assignShuffledLabels(
      normalized.length,
      `${passageId}:v${(Number(passage.stage9_content_version) || 1) + 1}`
    );
  }
  if (new Set(labels).size !== labels.length) {
    return { ok: false as const, message: "displayLabel이 중복됩니다." };
  }

  const { data: existingRows } = await supabase
    .from("exam_stage_blanks")
    .select("id")
    .eq("passage_id", passageId)
    .eq("academy_id", auth.profile.academy_id)
    .eq("stage_number", 9);
  const existingIds = new Set((existingRows ?? []).map((r) => r.id as string));
  const keptIds = new Set(
    normalized.map((d) => d.id).filter((id): id is string => Boolean(id))
  );
  const toDelete = [...existingIds].filter((id) => !keptIds.has(id));
  if (toDelete.length > 0) {
    const { error: delErr } = await supabase
      .from("exam_stage_blanks")
      .delete()
      .in("id", toDelete)
      .eq("academy_id", auth.profile.academy_id);
    if (delErr) return { ok: false as const, message: delErr.message };
  }

  const byOrder = [...normalized].sort((a, b) => a.blank_order - b.blank_order);
  for (let i = 0; i < byOrder.length; i++) {
    const d = byOrder[i]!;
    const text = renderBlockText(d.sentence_ids, englishById);
    if (!text.trim()) {
      return { ok: false as const, message: "blockText가 비어 있습니다." };
    }
    const firstSentenceId = d.sentence_ids[0]!;
    const row = {
      academy_id: auth.profile.academy_id,
      passage_id: passageId,
      sentence_id: firstSentenceId,
      stage_number: 9,
      target_language: "en" as const,
      blank_order: d.blank_order,
      answer_text: text,
      accepted_answers: [],
      selected_text: text,
      answer_snapshot: text,
      sentence_ids: d.sentence_ids,
      display_label: labels[normalized.indexOf(d)] ?? labelForIndex(i),
      teacher_role: d.teacher_role ?? null,
      cohesion_clues: d.cohesion_clues ?? [],
      english_start: 0,
      english_end: Math.max(1, text.length),
      korean_start: null,
      korean_end: null,
      hint: d.hint?.trim() || null,
      explanation: d.explanation?.trim() || null,
      is_required: d.is_required ?? true,
      case_sensitive: false,
      ignore_extra_spaces: true,
      ignore_punctuation: false,
      created_by: auth.profile.id,
      updated_at: new Date().toISOString(),
    };

    // fix label index: use byOrder index for shuffled labels aligned to blank_order
    row.display_label = labels[i]!;

    if (d.id && existingIds.has(d.id)) {
      const { error } = await supabase
        .from("exam_stage_blanks")
        .update(row)
        .eq("id", d.id)
        .eq("academy_id", auth.profile.academy_id)
        .eq("stage_number", 9);
      if (error) return { ok: false as const, message: error.message };
    } else {
      const { error } = await supabase.from("exam_stage_blanks").insert(row);
      if (error) return { ok: false as const, message: error.message };
    }
  }

  const { error: pErr } = await supabase
    .from("exam_passages")
    .update({
      stage9_fixed_prefix: draft.fixedPrefix ?? "",
      stage9_fixed_suffix: draft.fixedSuffix ?? "",
      stage9_answer_mode: draft.answerMode || "label_sequence",
      stage9_structure_hint: draft.structureHint?.trim() || null,
      stage9_content_version: (Number(passage.stage9_content_version) || 1) + 1,
      updated_at: new Date().toISOString(),
    })
    .eq("id", passageId)
    .eq("academy_id", auth.profile.academy_id);

  if (pErr) return { ok: false as const, message: pErr.message };

  revalidatePassage(passageId);
  return {
    ok: true as const,
    count: byOrder.length,
    labels,
    warnings: [...new Set(warnings)],
    learningStudentsWarning: Boolean(passage.stage9_published),
  };
}

export async function setStage9PublishedAction(
  passageId: string,
  published: boolean
) {
  const auth = await requireStaff();
  if (!auth.ok) return auth;
  const supabase = await createClient();

  if (published) {
    const { data: items } = await supabase
      .from("exam_stage_blanks")
      .select(
        "id, blank_order, sentence_ids, display_label, selected_text, answer_text, sentence_id"
      )
      .eq("passage_id", passageId)
      .eq("academy_id", auth.profile.academy_id)
      .eq("stage_number", 9);

    if ((items ?? []).length < 2) {
      return {
        ok: false as const,
        message: "배열 블록이 최소 2개 있어야 공개할 수 있습니다.",
      };
    }

    const { data: sentences } = await supabase
      .from("exam_passage_sentences")
      .select("id")
      .eq("passage_id", passageId)
      .order("sentence_order", { ascending: true });
    const orderedIds = (sentences ?? []).map((s) => s.id as string);

    const drafts: Stage9BlockDraft[] = (items ?? []).map((r) => ({
      id: r.id as string,
      sentence_ids: parseSentenceIds(r.sentence_ids),
      blank_order: Number(r.blank_order) || 1,
      display_label: String(r.display_label ?? ""),
    }));
    const err = validateStage9Blocks(orderedIds, drafts);
    if (err) return { ok: false as const, message: `공개 전 오류: ${err}` };

    const labels = drafts.map((d) => d.display_label || "");
    if (new Set(labels).size !== labels.length) {
      return { ok: false as const, message: "공개 전 오류: 라벨이 중복됩니다." };
    }
    if (labels.every((l, i) => l === labelForIndex(i))) {
      // auto reshuffle on publish
      const shuffled = assignShuffledLabels(drafts.length, `${passageId}:publish`);
      for (let i = 0; i < drafts.length; i++) {
        const ordered = [...drafts].sort((a, b) => a.blank_order - b.blank_order);
        const block = ordered[i]!;
        await supabase
          .from("exam_stage_blanks")
          .update({ display_label: shuffled[i] })
          .eq("id", block.id!)
          .eq("academy_id", auth.profile.academy_id);
      }
    }
  }

  const { error } = await supabase
    .from("exam_passages")
    .update({
      stage9_published: published,
      updated_at: new Date().toISOString(),
    })
    .eq("id", passageId)
    .eq("academy_id", auth.profile.academy_id);

  if (error) return { ok: false as const, message: error.message };
  revalidatePassage(passageId);
  return { ok: true as const, published };
}

export async function listStage9BlocksAction(passageId: string) {
  const auth = await requireStaff();
  if (!auth.ok) return auth;
  const supabase = await createClient();
  const { data: passage } = await supabase
    .from("exam_passages")
    .select(
      "stage9_fixed_prefix, stage9_fixed_suffix, stage9_answer_mode, stage9_structure_hint, stage9_content_version, stage9_published"
    )
    .eq("id", passageId)
    .eq("academy_id", auth.profile.academy_id)
    .maybeSingle();

  const { data, error } = await supabase
    .from("exam_stage_blanks")
    .select("*")
    .eq("passage_id", passageId)
    .eq("academy_id", auth.profile.academy_id)
    .eq("stage_number", 9)
    .order("blank_order", { ascending: true });
  if (error) return { ok: false as const, message: error.message };

  return {
    ok: true as const,
    config: {
      fixedPrefix: String(passage?.stage9_fixed_prefix ?? ""),
      fixedSuffix: String(passage?.stage9_fixed_suffix ?? ""),
      answerMode:
        (passage?.stage9_answer_mode as Stage9AnswerMode) || "label_sequence",
      structureHint: (passage?.stage9_structure_hint as string | null) ?? null,
      contentVersion: Number(passage?.stage9_content_version) || 1,
      published: Boolean(passage?.stage9_published),
    },
    blocks: (data ?? []).map((r) => mapBlock(r as Record<string, unknown>)),
  };
}

export async function getStage9PassageStatsAction(passageId: string) {
  const auth = await requireStaff();
  if (!auth.ok) return auth;
  const supabase = await createClient();

  const { data: blocks } = await supabase
    .from("exam_stage_blanks")
    .select("id, display_label, blank_order")
    .eq("passage_id", passageId)
    .eq("academy_id", auth.profile.academy_id)
    .eq("stage_number", 9)
    .order("blank_order", { ascending: true });

  const { data: progressRows } = await supabase
    .from("exam_stage2_progress")
    .select(
      "score, completed_at, attempt_count, answers, hint_used_blank_ids, revealed_answer_blank_ids"
    )
    .eq("passage_id", passageId)
    .eq("academy_id", auth.profile.academy_id)
    .eq("stage_number", 9);

  const studentCount = (progressRows ?? []).length;
  let completedStudents = 0;
  let firstTryCorrect = 0;
  let scoreSum = 0;
  let attemptSum = 0;
  let hintUsers = 0;
  let revealUsers = 0;
  const wrongSequences = new Map<string, number>();
  let firstCorrect = 0;
  let lastCorrect = 0;
  const correctIds = (blocks ?? []).map((b) => b.id as string);
  const firstId = correctIds[0];
  const lastId = correctIds[correctIds.length - 1];

  for (const row of progressRows ?? []) {
    if (row.completed_at) completedStudents++;
    scoreSum += Number(row.score) || 0;
    attemptSum += Number(row.attempt_count) || 0;
    const ans = (row.answers ?? {}) as Record<string, unknown>;
    const ordered = Array.isArray(ans.orderedBlockIds)
      ? ans.orderedBlockIds.map(String)
      : [];
    const attempts = Number(ans.attempts) || 0;
    const isCorrect = ans.isCorrect === true;
    if (isCorrect && attempts === 1) firstTryCorrect++;
    if (Array.isArray(row.hint_used_blank_ids) && row.hint_used_blank_ids.length)
      hintUsers++;
    if (
      Array.isArray(row.revealed_answer_blank_ids) &&
      row.revealed_answer_blank_ids.length
    )
      revealUsers++;
    if (ordered[0] === firstId) firstCorrect++;
    if (ordered[ordered.length - 1] === lastId) lastCorrect++;
    if (ans.isCorrect === false && ordered.length === correctIds.length) {
      const key = ordered.join(">");
      wrongSequences.set(key, (wrongSequences.get(key) ?? 0) + 1);
    }
  }

  const topWrong = [...wrongSequences.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([seq, count]) => ({ sequence: seq, count }));

  return {
    ok: true as const,
    studentCount,
    completedStudents,
    avgScore: studentCount ? Math.round(scoreSum / studentCount) : 0,
    avgAttempts: studentCount
      ? Math.round((attemptSum / studentCount) * 10) / 10
      : 0,
    firstTryCorrectRate: studentCount
      ? Math.round((firstTryCorrect / studentCount) * 100)
      : 0,
    firstBlockCorrectRate: studentCount
      ? Math.round((firstCorrect / studentCount) * 100)
      : 0,
    lastBlockCorrectRate: studentCount
      ? Math.round((lastCorrect / studentCount) * 100)
      : 0,
    hintUsers,
    revealUsers,
    topWrongSequences: topWrong,
    correctLabelOrder: (blocks ?? []).map((b) => String(b.display_label)),
  };
}
