"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { isExamPrepEnabled } from "@/lib/academy-features";
import { parseVocabMarks } from "@/lib/exam-prep/vocab-marks";
import {
  blankCoverageRatio,
  excludeTrailingJosaFromBlank,
  findOverlappingBlanks,
  validateBlankAgainstKorean,
  type BlankDraft,
  type ExamKoreanBlank,
} from "@/lib/exam-prep/stage2-types";

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

export async function listKoreanBlanksAction(passageId: string) {
  const auth = await requireStaff();
  if (!auth.ok) return auth;
  const supabase = await createClient();
  const [{ data, error }, { data: sentences }] = await Promise.all([
    supabase
      .from("exam_stage_blanks")
      .select("*")
      .eq("passage_id", passageId)
      .eq("academy_id", auth.profile.academy_id)
      .eq("stage_number", 2)
      .order("blank_order", { ascending: true }),
    supabase
      .from("exam_passage_sentences")
      .select("id, korean_text")
      .eq("passage_id", passageId)
      .eq("academy_id", auth.profile.academy_id),
  ]);
  if (error) return { ok: false as const, message: error.message };
  const koreanById = new Map(
    (sentences ?? []).map((s) => [s.id as string, String(s.korean_text ?? "")])
  );
  const blanks = ((data ?? []) as ExamKoreanBlank[]).map((b) =>
    excludeTrailingJosaFromBlank(koreanById.get(b.sentence_id) ?? "", b)
  );
  return { ok: true as const, blanks };
}

export async function saveKoreanBlanksAction(
  passageId: string,
  drafts: BlankDraft[]
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
    .select("id, korean_text, english_text")
    .eq("passage_id", passageId)
    .eq("academy_id", auth.profile.academy_id);

  const byId = new Map((sentences ?? []).map((s) => [s.id as string, s]));
  const warnings: string[] = [];

  const normalizedDrafts = drafts.map((d) => {
    const sent = byId.get(d.sentence_id);
    const korean = String(sent?.korean_text ?? "");
    return excludeTrailingJosaFromBlank(korean, d);
  });

  for (const d of normalizedDrafts) {
    const sent = byId.get(d.sentence_id);
    if (!sent) {
      return { ok: false as const, message: "문장 데이터가 없는 빈칸이 있습니다." };
    }
    const korean = String(sent.korean_text ?? "");
    const err = validateBlankAgainstKorean(korean, d);
    if (err) return { ok: false as const, message: err };
    if (d.korean_start === 0 && d.korean_end >= korean.length) {
      warnings.push("문장 전체가 빈칸으로 설정된 항목이 있습니다.");
    }
  }

  const bySentence = new Map<string, BlankDraft[]>();
  for (const d of normalizedDrafts) {
    const list = bySentence.get(d.sentence_id) ?? [];
    list.push(d);
    bySentence.set(d.sentence_id, list);
  }
  for (const [sid, list] of bySentence) {
    const overlap = findOverlappingBlanks(list);
    if (overlap) return { ok: false as const, message: overlap };
    const sent = byId.get(sid);
    const korean = String(sent?.korean_text ?? "");
    const ratio = blankCoverageRatio(korean, list);
    if (ratio >= 0.6) {
      warnings.push(
        "이 문장의 60% 이상이 빈칸으로 설정되었습니다. 학생이 문맥을 파악하기 어려울 수 있습니다."
      );
    }
  }

  const { data: existingRows } = await supabase
    .from("exam_stage_blanks")
    .select("id")
    .eq("passage_id", passageId)
    .eq("academy_id", auth.profile.academy_id)
    .eq("stage_number", 2);
  const existingIds = new Set((existingRows ?? []).map((r) => r.id as string));
  const keptIds = new Set(
    normalizedDrafts.map((d) => d.id).filter((id): id is string => Boolean(id))
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

  if (normalizedDrafts.length === 0) {
    revalidatePassage(passageId);
    return { ok: true as const, count: 0, warnings };
  }

  for (let i = 0; i < normalizedDrafts.length; i++) {
    const d = normalizedDrafts[i]!;
    const row = {
      academy_id: auth.profile.academy_id,
      passage_id: passageId,
      sentence_id: d.sentence_id,
      stage_number: 2,
      target_language: "ko" as const,
      blank_order: d.blank_order || i + 1,
      answer_text: d.answer_text,
      accepted_answers: (d.accepted_answers ?? []).filter(
        (a) => a.trim() && a.trim() !== d.answer_text.trim()
      ),
      korean_start: d.korean_start,
      korean_end: d.korean_end,
      answer_snapshot: d.answer_text,
      selected_text: d.answer_text,
      linked_vocabulary_mark_id: d.linked_vocabulary_mark_id ?? null,
      linked_english_text: d.linked_english_text ?? null,
      linked_english_start: d.linked_english_start ?? null,
      linked_english_end: d.linked_english_end ?? null,
      linked_english_occurrence: d.linked_english_occurrence ?? null,
      hint: d.hint ?? null,
      explanation: d.explanation ?? null,
      is_required: d.is_required ?? true,
      ignore_punctuation: d.ignore_punctuation ?? false,
      flexible_spacing: d.flexible_spacing ?? false,
      ignore_extra_spaces: d.flexible_spacing ?? false,
      updated_at: new Date().toISOString(),
    };

    if (d.id && existingIds.has(d.id)) {
      const { error } = await supabase
        .from("exam_stage_blanks")
        .update(row)
        .eq("id", d.id)
        .eq("academy_id", auth.profile.academy_id);
      if (error) return { ok: false as const, message: error.message };
    } else {
      const { error } = await supabase.from("exam_stage_blanks").insert(row);
      if (error) return { ok: false as const, message: error.message };
    }
  }

  revalidatePassage(passageId);
  return { ok: true as const, count: normalizedDrafts.length, warnings };
}

export async function setStage2PublishedAction(
  passageId: string,
  published: boolean
) {
  const auth = await requireStaff();
  if (!auth.ok) return auth;
  const supabase = await createClient();

  if (published) {
    const { count } = await supabase
      .from("exam_stage_blanks")
      .select("id", { count: "exact", head: true })
      .eq("passage_id", passageId)
      .eq("academy_id", auth.profile.academy_id)
      .eq("stage_number", 2);
    if (!count || count < 1) {
      return {
        ok: false as const,
        message: "지문 전체에 빈칸이 하나도 없으면 공개할 수 없습니다.",
      };
    }
  }

  const { error } = await supabase
    .from("exam_passages")
    .update({
      stage2_published: published,
      updated_at: new Date().toISOString(),
    })
    .eq("id", passageId)
    .eq("academy_id", auth.profile.academy_id);
  if (error) return { ok: false as const, message: error.message };

  revalidatePassage(passageId);
  return { ok: true as const };
}

/** 1단계 어휘 기준 빈칸 제안 (저장하지 않음) */
export async function proposeBlanksFromVocabAction(passageId: string) {
  const auth = await requireStaff();
  if (!auth.ok) return auth;
  const supabase = await createClient();

  const { data: sentences } = await supabase
    .from("exam_passage_sentences")
    .select("id, korean_text, english_text, vocabulary, is_important_writing")
    .eq("passage_id", passageId)
    .eq("academy_id", auth.profile.academy_id)
    .order("sentence_order", { ascending: true });

  const proposals: BlankDraft[] = [];
  let order = 1;

  for (const s of sentences ?? []) {
    const korean = String(s.korean_text ?? "");
    if (!korean.trim()) continue;
    const marks = parseVocabMarks(s.vocabulary);
    const usedRanges: Array<{ korean_start: number; korean_end: number }> = [];

    for (const m of marks) {
      const needle = m.koreanText?.trim();
      if (!needle) continue;
      const occ = m.koreanOccurrence ?? 0;
      let from = 0;
      let start = -1;
      for (let i = 0; i <= occ; i++) {
        start = korean.indexOf(needle, from);
        if (start < 0) break;
        from = start + Math.max(needle.length, 1);
      }
      if (start < 0) continue;
      const end = start + needle.length;
      const overlap = usedRanges.some(
        (r) => start < r.korean_end && end > r.korean_start
      );
      if (overlap) continue;
      usedRanges.push({ korean_start: start, korean_end: end });

      let enStart: number | null = null;
      let enEnd: number | null = null;
      const en = String(s.english_text ?? "");
      const enNeedle = m.englishText?.trim();
      if (enNeedle) {
        const eOcc = m.englishOccurrence ?? 0;
        let eFrom = 0;
        let eStart = -1;
        for (let i = 0; i <= eOcc; i++) {
          eStart = en.indexOf(enNeedle, eFrom);
          if (eStart < 0) break;
          eFrom = eStart + Math.max(enNeedle.length, 1);
        }
        if (eStart >= 0) {
          enStart = eStart;
          enEnd = eStart + enNeedle.length;
        }
      }

      proposals.push({
        sentence_id: s.id as string,
        blank_order: order++,
        answer_text: needle,
        accepted_answers: [],
        korean_start: start,
        korean_end: end,
        linked_vocabulary_mark_id: m.id,
        linked_english_text: enNeedle || null,
        linked_english_start: enStart,
        linked_english_end: enEnd,
        linked_english_occurrence: m.englishOccurrence ?? 0,
        hint: m.meaning || null,
        explanation: enNeedle ? `${enNeedle}: ${needle}` : null,
        is_required: true,
      });
    }
  }

  return { ok: true as const, proposals };
}
