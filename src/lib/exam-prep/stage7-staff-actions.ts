"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { isExamPrepEnabled } from "@/lib/academy-features";
import {
  collectStage7Warnings,
  validateCandidateAgainstDisplay,
  type ExamStage7Candidate,
  type Stage7CandidateDraft,
} from "@/lib/exam-prep/stage7-types";

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

export async function saveStage7DisplayTextsAction(
  passageId: string,
  rows: Array<{ sentenceId: string; stage7DisplayText: string }>
) {
  const auth = await requireStaff();
  if (!auth.ok) return auth;
  const supabase = await createClient();

  for (const r of rows) {
    const { error } = await supabase
      .from("exam_passage_sentences")
      .update({
        stage7_display_text: r.stage7DisplayText,
        updated_at: new Date().toISOString(),
      })
      .eq("id", r.sentenceId)
      .eq("passage_id", passageId)
      .eq("academy_id", auth.profile.academy_id);
    if (error) return { ok: false as const, message: error.message };
  }

  const { data: p } = await supabase
    .from("exam_passages")
    .select("stage7_content_version")
    .eq("id", passageId)
    .maybeSingle();
  await supabase
    .from("exam_passages")
    .update({
      stage7_content_version: (Number(p?.stage7_content_version) || 1) + 1,
      updated_at: new Date().toISOString(),
    })
    .eq("id", passageId)
    .eq("academy_id", auth.profile.academy_id);

  revalidatePassage(passageId);
  return { ok: true as const };
}

export async function initStage7DisplayFromOriginalAction(passageId: string) {
  const auth = await requireStaff();
  if (!auth.ok) return auth;
  const supabase = await createClient();
  const { data: sentences } = await supabase
    .from("exam_passage_sentences")
    .select("id, english_text, stage7_display_text")
    .eq("passage_id", passageId)
    .eq("academy_id", auth.profile.academy_id);

  for (const s of sentences ?? []) {
    if (String(s.stage7_display_text ?? "").trim()) continue;
    const { error } = await supabase
      .from("exam_passage_sentences")
      .update({
        stage7_display_text: String(s.english_text ?? ""),
        updated_at: new Date().toISOString(),
      })
      .eq("id", s.id as string);
    if (error) return { ok: false as const, message: error.message };
  }
  revalidatePassage(passageId);
  return { ok: true as const };
}

export async function saveStage7CandidatesAction(
  passageId: string,
  drafts: Stage7CandidateDraft[],
  requiredErrorCount: number
) {
  const auth = await requireStaff();
  if (!auth.ok) return auth;
  const supabase = await createClient();

  const { data: passage } = await supabase
    .from("exam_passages")
    .select("id")
    .eq("id", passageId)
    .eq("academy_id", auth.profile.academy_id)
    .maybeSingle();
  if (!passage) return { ok: false as const, message: "지문을 찾을 수 없습니다." };

  const { data: sentences } = await supabase
    .from("exam_passage_sentences")
    .select("id, english_text, stage7_display_text")
    .eq("passage_id", passageId)
    .eq("academy_id", auth.profile.academy_id);

  const displayBySentence = new Map<string, string>();
  for (const s of sentences ?? []) {
    const display = String(s.stage7_display_text ?? "").trim();
    if (!display) {
      return {
        ok: false as const,
        message:
          "7단계 표시 문장이 없습니다. 원문에서 표시 문장을 먼저 생성해 주세요.",
      };
    }
    displayBySentence.set(s.id as string, display);
  }

  for (const d of drafts) {
    const display = displayBySentence.get(d.sentence_id) ?? "";
    const err = validateCandidateAgainstDisplay(display, d);
    if (err) return { ok: false as const, message: err };
  }

  const warnings = collectStage7Warnings(
    displayBySentence,
    drafts,
    requiredErrorCount
  );
  const overlap = warnings.find((w) => w.includes("겹"));
  if (overlap) return { ok: false as const, message: overlap };

  const { data: existingRows } = await supabase
    .from("exam_stage_blanks")
    .select("id")
    .eq("passage_id", passageId)
    .eq("academy_id", auth.profile.academy_id)
    .eq("stage_number", 7);
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
    const correction = d.is_error
      ? d.correction_text.trim()
      : d.displayed_text.trim();
    const accepted = d.is_error
      ? [...new Set((d.accepted_corrections ?? []).map((a) => a.trim()).filter(Boolean))]
          .filter((a) => a.toLowerCase() !== correction.toLowerCase())
      : [];

    const row = {
      academy_id: auth.profile.academy_id,
      passage_id: passageId,
      sentence_id: d.sentence_id,
      stage_number: 7,
      target_language: "en" as const,
      blank_order: d.blank_order || i + 1,
      answer_text: correction,
      accepted_answers: accepted,
      english_start: d.english_start,
      english_end: d.english_end,
      selected_text: d.displayed_text,
      answer_snapshot: d.displayed_text,
      is_error: d.is_error,
      grammar_category: d.error_subcategory ?? [],
      korean_start: null,
      korean_end: null,
      hint: d.hint?.trim() || null,
      explanation: d.explanation?.trim() || null,
      is_required: d.is_error,
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
        .eq("stage_number", 7);
      if (error) return { ok: false as const, message: error.message };
    } else {
      const { error } = await supabase.from("exam_stage_blanks").insert(row);
      if (error) return { ok: false as const, message: error.message };
    }
  }

  const { data: p } = await supabase
    .from("exam_passages")
    .select("stage7_content_version")
    .eq("id", passageId)
    .maybeSingle();

  await supabase
    .from("exam_passages")
    .update({
      stage7_required_error_count: requiredErrorCount,
      stage7_content_version: (Number(p?.stage7_content_version) || 1) + 1,
      updated_at: new Date().toISOString(),
    })
    .eq("id", passageId)
    .eq("academy_id", auth.profile.academy_id);

  revalidatePassage(passageId);
  return {
    ok: true as const,
    count: drafts.length,
    warnings: [...new Set(warnings)],
  };
}

export async function setStage7PublishedAction(
  passageId: string,
  published: boolean
) {
  const auth = await requireStaff();
  if (!auth.ok) return auth;
  const supabase = await createClient();

  if (published) {
    const { data: passage } = await supabase
      .from("exam_passages")
      .select("stage7_required_error_count")
      .eq("id", passageId)
      .eq("academy_id", auth.profile.academy_id)
      .maybeSingle();
    const required = Number(passage?.stage7_required_error_count) || 3;

    const { data: sentences } = await supabase
      .from("exam_passage_sentences")
      .select("id, stage7_display_text")
      .eq("passage_id", passageId);
    for (const s of sentences ?? []) {
      if (!String(s.stage7_display_text ?? "").trim()) {
        return {
          ok: false as const,
          message: "모든 문장에 7단계 표시 문장이 필요합니다.",
        };
      }
    }

    const { data: items } = await supabase
      .from("exam_stage_blanks")
      .select("*")
      .eq("passage_id", passageId)
      .eq("academy_id", auth.profile.academy_id)
      .eq("stage_number", 7);

    const drafts: Stage7CandidateDraft[] = (items ?? []).map((r) => ({
      id: r.id as string,
      sentence_id: r.sentence_id as string,
      blank_order: Number(r.blank_order),
      english_start: Number(r.english_start),
      english_end: Number(r.english_end),
      displayed_text: String(r.selected_text ?? ""),
      is_error: Boolean(r.is_error),
      correction_text: Boolean(r.is_error) ? String(r.answer_text ?? "") : "",
      accepted_corrections: (r.accepted_answers as string[]) ?? [],
      error_subcategory: (r.grammar_category as string[]) ?? [],
    }));

    const displayBySentence = new Map(
      (sentences ?? []).map((s) => [
        s.id as string,
        String(s.stage7_display_text ?? ""),
      ])
    );
    const warnings = collectStage7Warnings(
      displayBySentence,
      drafts,
      required
    );
    const blocking = warnings.find(
      (w) =>
        w.includes("오류 개수는") ||
        w.includes("오류 후보가 없습니다") ||
        w.includes("후보가 없습니다") ||
        w.includes("일치하지 않습니다") ||
        w.includes("올바른 후보가 하나도") ||
        w.includes("모든 밑줄 후보가 오류")
    );
    if (blocking) return { ok: false as const, message: blocking };

    const errorCount = drafts.filter((d) => d.is_error).length;
    if (errorCount !== required) {
      return {
        ok: false as const,
        message: `오류 후보 ${errorCount}개와 설정 개수 ${required}개가 일치해야 공개할 수 있습니다.`,
      };
    }
    if (drafts.filter((d) => !d.is_error).length < 1) {
      return {
        ok: false as const,
        message: "올바른 밑줄 후보를 최소 1개 포함해 주세요.",
      };
    }
  }

  const { error } = await supabase
    .from("exam_passages")
    .update({
      stage7_published: published,
      updated_at: new Date().toISOString(),
    })
    .eq("id", passageId)
    .eq("academy_id", auth.profile.academy_id);

  if (error) return { ok: false as const, message: error.message };
  revalidatePassage(passageId);
  return { ok: true as const, published };
}

export async function listStage7CandidatesAction(passageId: string) {
  const auth = await requireStaff();
  if (!auth.ok) return auth;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("exam_stage_blanks")
    .select("*")
    .eq("passage_id", passageId)
    .eq("academy_id", auth.profile.academy_id)
    .eq("stage_number", 7)
    .order("blank_order", { ascending: true });
  if (error) return { ok: false as const, message: error.message };
  return { ok: true as const, items: (data ?? []) as ExamStage7Candidate[] };
}
