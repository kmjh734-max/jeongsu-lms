"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { isExamPrepEnabled } from "@/lib/academy-features";
import { parseVocabMarks } from "@/lib/exam-prep/vocab-marks";
import {
  collectEnglishBlankWarnings,
  validateEnglishBlankAgainstText,
  type ExamStage3Blank,
  type Stage3BlankDraft,
} from "@/lib/exam-prep/stage3-types";
import type { ExamKoreanBlank } from "@/lib/exam-prep/stage2-types";

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

function findNth(haystack: string, needle: string, occurrence = 0) {
  let from = 0;
  let start = -1;
  for (let i = 0; i <= occurrence; i++) {
    start = haystack.indexOf(needle, from);
    if (start < 0) return null;
    from = start + Math.max(needle.length, 1);
  }
  return { start, end: start + needle.length };
}

export async function listStage3BlanksAction(passageId: string) {
  const auth = await requireStaff();
  if (!auth.ok) return auth;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("exam_stage_blanks")
    .select("*")
    .eq("passage_id", passageId)
    .eq("academy_id", auth.profile.academy_id)
    .eq("stage_number", 3)
    .order("blank_order", { ascending: true });
  if (error) return { ok: false as const, message: error.message };
  return { ok: true as const, blanks: (data ?? []) as ExamStage3Blank[] };
}

export async function saveStage3BlanksAction(
  passageId: string,
  drafts: Stage3BlankDraft[]
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
    .select("id, english_text, korean_text")
    .eq("passage_id", passageId)
    .eq("academy_id", auth.profile.academy_id);

  const byId = new Map((sentences ?? []).map((s) => [s.id as string, s]));
  const warnings: string[] = [];

  for (const d of drafts) {
    const sent = byId.get(d.sentence_id);
    if (!sent) {
      return { ok: false as const, message: "문장 데이터가 없는 빈칸이 있습니다." };
    }
    const english = String(sent.english_text ?? "");
    const err = validateEnglishBlankAgainstText(english, d);
    if (err) return { ok: false as const, message: err };
    warnings.push(...collectEnglishBlankWarnings(english, [d]));
  }

  const bySentence = new Map<string, Stage3BlankDraft[]>();
  for (const d of drafts) {
    const list = bySentence.get(d.sentence_id) ?? [];
    list.push(d);
    bySentence.set(d.sentence_id, list);
  }
  for (const [, list] of bySentence) {
    const overlapWarn = collectEnglishBlankWarnings(
      String(byId.get(list[0]!.sentence_id)?.english_text ?? ""),
      list
    ).filter((w) => w.includes("겹칩"));
    if (overlapWarn[0]) {
      return { ok: false as const, message: overlapWarn[0] };
    }
  }

  const { data: existingRows } = await supabase
    .from("exam_stage_blanks")
    .select("id")
    .eq("passage_id", passageId)
    .eq("academy_id", auth.profile.academy_id)
    .eq("stage_number", 3);
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

  if (drafts.length === 0) {
    revalidatePassage(passageId);
    return { ok: true as const, count: 0, warnings: [...new Set(warnings)] };
  }

  for (let i = 0; i < drafts.length; i++) {
    const d = drafts[i]!;
    const selected = d.selected_text || d.answer_text;
    const row = {
      academy_id: auth.profile.academy_id,
      passage_id: passageId,
      sentence_id: d.sentence_id,
      stage_number: 3,
      target_language: "en" as const,
      blank_order: d.blank_order || i + 1,
      answer_text: d.answer_text,
      accepted_answers: (d.accepted_answers ?? []).filter(
        (a) => a.trim() && a.trim() !== d.answer_text.trim()
      ),
      korean_start: null,
      korean_end: null,
      english_start: d.english_start,
      english_end: d.english_end,
      selected_text: selected,
      answer_snapshot: selected,
      linked_vocabulary_mark_id: d.linked_vocabulary_mark_id ?? null,
      linked_korean_text: d.linked_korean_text ?? null,
      linked_korean_start: d.linked_korean_start ?? null,
      linked_korean_end: d.linked_korean_end ?? null,
      linked_english_text: d.answer_text,
      hint: d.hint ?? null,
      explanation: d.explanation ?? null,
      is_required: d.is_required ?? true,
      case_sensitive: d.case_sensitive ?? false,
      ignore_extra_spaces: d.ignore_extra_spaces ?? true,
      ignore_punctuation: d.ignore_punctuation ?? false,
      flexible_spacing: d.ignore_extra_spaces ?? true,
      created_by: auth.profile.id,
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
  return {
    ok: true as const,
    count: drafts.length,
    warnings: [...new Set(warnings)],
  };
}

export async function setStage3PublishedAction(
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
      .eq("stage_number", 3);
    if (!count || count < 1) {
      return {
        ok: false as const,
        message: "지문 전체에 영문 빈칸이 하나도 없으면 공개할 수 없습니다.",
      };
    }
  }

  const { error } = await supabase
    .from("exam_passages")
    .update({
      stage3_published: published,
      updated_at: new Date().toISOString(),
    })
    .eq("id", passageId)
    .eq("academy_id", auth.profile.academy_id);
  if (error) return { ok: false as const, message: error.message };

  revalidatePassage(passageId);
  return { ok: true as const };
}

/** 1단계 어휘 기준 영문 빈칸 제안 */
export async function proposeStage3FromVocabAction(passageId: string) {
  const auth = await requireStaff();
  if (!auth.ok) return auth;
  const supabase = await createClient();

  const { data: sentences } = await supabase
    .from("exam_passage_sentences")
    .select("id, english_text, korean_text, vocabulary")
    .eq("passage_id", passageId)
    .eq("academy_id", auth.profile.academy_id)
    .order("sentence_order", { ascending: true });

  const proposals: Stage3BlankDraft[] = [];
  let order = 1;

  for (const s of sentences ?? []) {
    const english = String(s.english_text ?? "");
    const korean = String(s.korean_text ?? "");
    if (!english.trim()) continue;
    const marks = parseVocabMarks(s.vocabulary);
    const used: Array<{ korean_start: number; korean_end: number }> = [];

    for (const m of marks) {
      const needle = m.englishText?.trim();
      if (!needle) continue;
      const hit = findNth(english, needle, m.englishOccurrence ?? 0);
      if (!hit) continue;
      const overlap = used.some(
        (r) => hit.start < r.korean_end && hit.end > r.korean_start
      );
      if (overlap) continue;
      used.push({ korean_start: hit.start, korean_end: hit.end });

      let koStart: number | null = null;
      let koEnd: number | null = null;
      const koNeedle = m.koreanText?.trim();
      if (koNeedle) {
        const kh = findNth(korean, koNeedle, m.koreanOccurrence ?? 0);
        if (kh) {
          koStart = kh.start;
          koEnd = kh.end;
        }
      }

      proposals.push({
        sentence_id: s.id as string,
        blank_order: order++,
        answer_text: needle,
        selected_text: needle,
        accepted_answers: [],
        english_start: hit.start,
        english_end: hit.end,
        linked_vocabulary_mark_id: m.id,
        linked_korean_text: koNeedle || null,
        linked_korean_start: koStart,
        linked_korean_end: koEnd,
        hint: m.meaning || null,
        explanation: koNeedle ? `${needle}: ${koNeedle}` : null,
        is_required: true,
        case_sensitive: false,
        ignore_extra_spaces: true,
      });
    }
  }

  return { ok: true as const, proposals };
}

/** 2단계 연결 어휘로 영문 빈칸 제안 */
export async function proposeStage3FromStage2Action(passageId: string) {
  const auth = await requireStaff();
  if (!auth.ok) return auth;
  const supabase = await createClient();

  const [{ data: stage2Blanks }, { data: sentences }] = await Promise.all([
    supabase
      .from("exam_stage_blanks")
      .select("*")
      .eq("passage_id", passageId)
      .eq("academy_id", auth.profile.academy_id)
      .eq("stage_number", 2)
      .order("blank_order", { ascending: true }),
    supabase
      .from("exam_passage_sentences")
      .select("id, english_text, korean_text")
      .eq("passage_id", passageId)
      .eq("academy_id", auth.profile.academy_id),
  ]);

  const byId = new Map((sentences ?? []).map((s) => [s.id as string, s]));
  const proposals: Stage3BlankDraft[] = [];
  const usedBySentence = new Map<
    string,
    Array<{ korean_start: number; korean_end: number }>
  >();
  let order = 1;

  for (const b of (stage2Blanks ?? []) as ExamKoreanBlank[]) {
    const linked = b.linked_english_text?.trim();
    if (!linked) continue;
    const sent = byId.get(b.sentence_id);
    if (!sent) continue;
    const english = String(sent.english_text ?? "");
    const occ = b.linked_english_occurrence ?? 0;
    const hit =
      b.linked_english_start != null &&
      b.linked_english_end != null &&
      english.slice(b.linked_english_start, b.linked_english_end) === linked
        ? { start: b.linked_english_start, end: b.linked_english_end }
        : findNth(english, linked, occ);
    if (!hit) continue;

    const used = usedBySentence.get(b.sentence_id) ?? [];
    const overlap = used.some(
      (r) => hit.start < r.korean_end && hit.end > r.korean_start
    );
    if (overlap) continue;
    used.push({ korean_start: hit.start, korean_end: hit.end });
    usedBySentence.set(b.sentence_id, used);

    proposals.push({
      sentence_id: b.sentence_id,
      blank_order: order++,
      answer_text: linked,
      selected_text: linked,
      accepted_answers: [],
      english_start: hit.start,
      english_end: hit.end,
      linked_vocabulary_mark_id: b.linked_vocabulary_mark_id,
      linked_korean_text: b.answer_text,
      linked_korean_start: b.korean_start,
      linked_korean_end: b.korean_end,
      hint: b.hint,
      explanation: b.explanation || `${linked}: ${b.answer_text}`,
      is_required: true,
      case_sensitive: false,
      ignore_extra_spaces: true,
    });
  }

  return { ok: true as const, proposals };
}
