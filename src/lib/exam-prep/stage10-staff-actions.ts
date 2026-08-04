"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { isExamPrepEnabled } from "@/lib/academy-features";
import {
  collectStage10Warnings,
  composeSegmentsToText,
  newCueId,
  newSegId,
  parseSentenceIds,
  parseWritingCues,
  parseWritingSegments,
  proposeFullSentenceSegments,
  tokenizeAnswerText,
  validateStage10Item,
  type ExamStage10Item,
  type Stage10BlankDisplayMode,
  type Stage10InputMode,
  type Stage10ItemDraft,
} from "@/lib/exam-prep/stage10-types";

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

export async function saveStage10ItemsAction(
  passageId: string,
  drafts: Stage10ItemDraft[]
) {
  const auth = await requireStaff();
  if (!auth.ok) return auth;
  const supabase = await createClient();

  const { data: passage } = await supabase
    .from("exam_passages")
    .select("id, stage10_content_version, stage10_published")
    .eq("id", passageId)
    .eq("academy_id", auth.profile.academy_id)
    .maybeSingle();
  if (!passage) return { ok: false as const, message: "지문을 찾을 수 없습니다." };

  const { data: sentences } = await supabase
    .from("exam_passage_sentences")
    .select("id, english_text, korean_text, sentence_order")
    .eq("passage_id", passageId)
    .eq("academy_id", auth.profile.academy_id)
    .order("sentence_order", { ascending: true });

  const byId = new Map((sentences ?? []).map((s) => [s.id as string, s]));
  const orderedIds = (sentences ?? []).map((s) => s.id as string);
  const warnings: string[] = [];

  for (const d of drafts) {
    for (const sid of d.sentence_ids) {
      if (!byId.has(sid)) {
        return { ok: false as const, message: "존재하지 않는 문장이 있습니다." };
      }
    }
    // contiguous check
    const idxs = d.sentence_ids.map((id) => orderedIds.indexOf(id)).sort((a, b) => a - b);
    for (let i = 1; i < idxs.length; i++) {
      if (idxs[i] !== idxs[i - 1]! + 1) {
        return {
          ok: false as const,
          message: "문항의 sourceSentenceIds가 비연속적입니다.",
        };
      }
    }
    const english = d.sentence_ids
      .map((id) => String(byId.get(id)?.english_text ?? ""))
      .join(" ");
    const korean =
      d.korean_prompt?.trim() ||
      d.sentence_ids
        .map((id) => String(byId.get(id)?.korean_text ?? ""))
        .filter(Boolean)
        .join(" ");
    const draft: Stage10ItemDraft = {
      ...d,
      korean_prompt: korean,
      full_english: english,
      writing_segments: parseWritingSegments(d.writing_segments),
      writing_cues: parseWritingCues(d.writing_cues),
    };
    const err = validateStage10Item(english, draft);
    if (err) return { ok: false as const, message: err };
    warnings.push(...collectStage10Warnings(english, draft));
  }

  const { data: existingRows } = await supabase
    .from("exam_stage_blanks")
    .select("id")
    .eq("passage_id", passageId)
    .eq("academy_id", auth.profile.academy_id)
    .eq("stage_number", 10);
  const existingIds = new Set((existingRows ?? []).map((r) => r.id as string));
  const keptIds = new Set(
    drafts.map((d) => d.id).filter((id): id is string => Boolean(id))
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

  for (let i = 0; i < drafts.length; i++) {
    const d = drafts[i]!;
    const english = d.sentence_ids
      .map((id) => String(byId.get(id)?.english_text ?? ""))
      .join(" ");
    const korean =
      d.korean_prompt?.trim() ||
      d.sentence_ids
        .map((id) => String(byId.get(id)?.korean_text ?? ""))
        .filter(Boolean)
        .join(" ");
    let segs = parseWritingSegments(d.writing_segments);
    if (segs.length < 1) segs = proposeFullSentenceSegments(english);
    segs = segs.map((s, idx) => ({
      ...s,
      id: s.id || newSegId(),
      segmentOrder: idx + 1,
      answerTokens:
        s.segmentType === "answer_segment"
          ? s.answerTokens?.length
            ? s.answerTokens
            : tokenizeAnswerText(s.originalAnswerText ?? "")
          : undefined,
    }));
    const cues = parseWritingCues(d.writing_cues).map((c, idx) => ({
      ...c,
      id: c.id || newCueId(),
      cueOrder: idx + 1,
    }));

    const row = {
      academy_id: auth.profile.academy_id,
      passage_id: passageId,
      sentence_id: d.sentence_ids[0]!,
      stage_number: 10,
      target_language: "en" as const,
      blank_order: d.blank_order || i + 1,
      answer_text: english,
      accepted_answers: d.accepted_answers ?? [],
      selected_text: korean,
      answer_snapshot: english,
      sentence_ids: d.sentence_ids,
      writing_segments: segs,
      writing_cues: cues,
      writing_input_mode: d.writing_input_mode || "guided_segments",
      writing_blank_display_mode: d.writing_blank_display_mode || "token_slots",
      english_start: 0,
      english_end: Math.max(1, english.length),
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

    if (d.id && existingIds.has(d.id)) {
      const { error } = await supabase
        .from("exam_stage_blanks")
        .update(row)
        .eq("id", d.id)
        .eq("academy_id", auth.profile.academy_id)
        .eq("stage_number", 10);
      if (error) return { ok: false as const, message: error.message };
    } else {
      const { error } = await supabase.from("exam_stage_blanks").insert(row);
      if (error) return { ok: false as const, message: error.message };
    }
  }

  await supabase
    .from("exam_passages")
    .update({
      stage10_content_version: (Number(passage.stage10_content_version) || 1) + 1,
      updated_at: new Date().toISOString(),
    })
    .eq("id", passageId)
    .eq("academy_id", auth.profile.academy_id!);

  revalidatePassage(passageId);
  return {
    ok: true as const,
    count: drafts.length,
    warnings: [...new Set(warnings)],
    learningStudentsWarning: Boolean(passage.stage10_published),
  };
}

export async function setStage10PublishedAction(
  passageId: string,
  published: boolean
) {
  const auth = await requireStaff();
  if (!auth.ok) return auth;
  const supabase = await createClient();

  if (published) {
    const { data: items } = await supabase
      .from("exam_stage_blanks")
      .select("*")
      .eq("passage_id", passageId)
      .eq("academy_id", auth.profile.academy_id)
      .eq("stage_number", 10);
    const required = (items ?? []).filter((r) => r.is_required);
    if (required.length < 1) {
      return {
        ok: false as const,
        message: "필수 영작 문항이 최소 1개 있어야 공개할 수 있습니다.",
      };
    }
    const { data: sentences } = await supabase
      .from("exam_passage_sentences")
      .select("id, english_text")
      .eq("passage_id", passageId);
    const enMap = new Map(
      (sentences ?? []).map((s) => [s.id as string, String(s.english_text ?? "")])
    );
    for (const row of required) {
      const ids = parseSentenceIds(row.sentence_ids);
      const english = ids.map((id) => enMap.get(id) ?? "").join(" ");
      const draft: Stage10ItemDraft = {
        blank_order: Number(row.blank_order) || 1,
        sentence_ids: ids,
        korean_prompt: String(row.selected_text ?? ""),
        full_english: english,
        writing_segments: parseWritingSegments(row.writing_segments),
        writing_cues: parseWritingCues(row.writing_cues),
        writing_input_mode:
          (row.writing_input_mode as Stage10InputMode) || "guided_segments",
        writing_blank_display_mode:
          (row.writing_blank_display_mode as Stage10BlankDisplayMode) ||
          "token_slots",
        accepted_answers: Array.isArray(row.accepted_answers)
          ? row.accepted_answers.map(String)
          : [],
      };
      const err = validateStage10Item(english || String(row.answer_text ?? ""), draft);
      if (err) return { ok: false as const, message: `공개 전 오류: ${err}` };
    }
  }

  const { error } = await supabase
    .from("exam_passages")
    .update({
      stage10_published: published,
      updated_at: new Date().toISOString(),
    })
    .eq("id", passageId)
    .eq("academy_id", auth.profile.academy_id);
  if (error) return { ok: false as const, message: error.message };
  revalidatePassage(passageId);
  return { ok: true as const, published };
}

export async function listStage10ItemsAction(passageId: string) {
  const auth = await requireStaff();
  if (!auth.ok) return auth;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("exam_stage_blanks")
    .select("*")
    .eq("passage_id", passageId)
    .eq("academy_id", auth.profile.academy_id)
    .eq("stage_number", 10)
    .order("blank_order", { ascending: true });
  if (error) return { ok: false as const, message: error.message };
  return {
    ok: true as const,
    items: (data ?? []).map((r) => mapItem(r as Record<string, unknown>)),
  };
}

export async function getStage10PassageStatsAction(passageId: string) {
  const auth = await requireStaff();
  if (!auth.ok) return auth;
  const supabase = await createClient();
  const { data: items } = await supabase
    .from("exam_stage_blanks")
    .select("id, blank_order, selected_text")
    .eq("passage_id", passageId)
    .eq("academy_id", auth.profile.academy_id)
    .eq("stage_number", 10)
    .order("blank_order", { ascending: true });
  const { data: progressRows } = await supabase
    .from("exam_stage2_progress")
    .select(
      "score, completed_at, attempt_count, correct_blank_ids, incorrect_blank_ids, hint_used_blank_ids, revealed_answer_blank_ids"
    )
    .eq("passage_id", passageId)
    .eq("academy_id", auth.profile.academy_id)
    .eq("stage_number", 10);

  const studentCount = (progressRows ?? []).length;
  let completedStudents = 0;
  let scoreSum = 0;
  let attemptSum = 0;
  const byItem: Record<string, { correct: number; incorrect: number }> = {};
  for (const it of items ?? []) {
    byItem[it.id as string] = { correct: 0, incorrect: 0 };
  }
  for (const row of progressRows ?? []) {
    if (row.completed_at) completedStudents++;
    scoreSum += Number(row.score) || 0;
    attemptSum += Number(row.attempt_count) || 0;
    for (const id of (row.correct_blank_ids as string[]) ?? []) {
      if (byItem[id]) byItem[id]!.correct++;
    }
    for (const id of (row.incorrect_blank_ids as string[]) ?? []) {
      if (byItem[id]) byItem[id]!.incorrect++;
    }
  }
  const hardest = [...(items ?? [])]
    .map((it) => {
      const s = byItem[it.id as string]!;
      const total = s.correct + s.incorrect;
      return {
        itemId: it.id as string,
        label: String(it.selected_text ?? "").slice(0, 40),
        wrongRate: total === 0 ? 0 : s.incorrect / total,
        ...s,
      };
    })
    .sort((a, b) => b.wrongRate - a.wrongRate);

  return {
    ok: true as const,
    studentCount,
    completedStudents,
    avgScore: studentCount ? Math.round(scoreSum / studentCount) : 0,
    avgAttempts: studentCount
      ? Math.round((attemptSum / studentCount) * 10) / 10
      : 0,
    byItem: hardest,
  };
}

export { composeSegmentsToText, proposeFullSentenceSegments };
