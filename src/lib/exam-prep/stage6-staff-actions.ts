"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { isExamPrepEnabled } from "@/lib/academy-features";
import {
  collectStage6Warnings,
  parseChoiceOptions,
  validateStage6ItemAgainstText,
  type ExamStage6Item,
  type Stage6ItemDraft,
} from "@/lib/exam-prep/stage6-types";

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

export async function saveStage6ItemsAction(
  passageId: string,
  drafts: Stage6ItemDraft[]
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
    .select("id, english_text")
    .eq("passage_id", passageId)
    .eq("academy_id", auth.profile.academy_id);

  const byId = new Map((sentences ?? []).map((s) => [s.id as string, s]));
  const warnings: string[] = [];

  for (const d of drafts) {
    const sent = byId.get(d.sentence_id);
    if (!sent) {
      return { ok: false as const, message: "문장 데이터가 없는 항목이 있습니다." };
    }
    const english = String(sent.english_text ?? "");
    const err = validateStage6ItemAgainstText(english, d);
    if (err) return { ok: false as const, message: err };
    warnings.push(...collectStage6Warnings(english, [d]));
  }

  const bySentence = new Map<string, Stage6ItemDraft[]>();
  for (const d of drafts) {
    const list = bySentence.get(d.sentence_id) ?? [];
    list.push(d);
    bySentence.set(d.sentence_id, list);
  }
  for (const [, list] of bySentence) {
    const overlapWarn = collectStage6Warnings(
      String(byId.get(list[0]!.sentence_id)?.english_text ?? ""),
      list
    ).filter((w) => w.includes("겹"));
    if (overlapWarn[0]) {
      return { ok: false as const, message: overlapWarn[0] };
    }
  }

  const { data: existingRows } = await supabase
    .from("exam_stage_blanks")
    .select("id")
    .eq("passage_id", passageId)
    .eq("academy_id", auth.profile.academy_id)
    .eq("stage_number", 6);
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
    const options = parseChoiceOptions(d.choice_options);
    const row = {
      academy_id: auth.profile.academy_id,
      passage_id: passageId,
      sentence_id: d.sentence_id,
      stage_number: 6,
      target_language: "en" as const,
      blank_order: d.blank_order || i + 1,
      answer_text: d.answer_text,
      accepted_answers: [],
      english_start: d.english_start,
      english_end: d.english_end,
      selected_text: selected,
      answer_snapshot: selected,
      choice_options: options,
      question_category: d.question_category,
      grammar_subcategory: d.grammar_subcategory ?? [],
      vocabulary_subcategory: d.vocabulary_subcategory ?? [],
      shuffle_options: d.shuffle_options !== false,
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
        .eq("stage_number", 6);
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

export async function setStage6PublishedAction(
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
        "id, is_required, answer_text, choice_options, english_start, english_end, selected_text, sentence_id, question_category, grammar_subcategory, vocabulary_subcategory"
      )
      .eq("passage_id", passageId)
      .eq("academy_id", auth.profile.academy_id)
      .eq("stage_number", 6);

    const required = (items ?? []).filter((r) => r.is_required);
    if (required.length < 1) {
      return {
        ok: false as const,
        message: "필수 어법·어휘 항목이 최소 1개 있어야 공개할 수 있습니다.",
      };
    }

    const { data: sentences } = await supabase
      .from("exam_passage_sentences")
      .select("id, english_text")
      .eq("passage_id", passageId);
    const enMap = new Map(
      (sentences ?? []).map((s) => [s.id as string, String(s.english_text ?? "")])
    );

    for (const item of required) {
      const english = enMap.get(item.sentence_id as string) ?? "";
      const err = validateStage6ItemAgainstText(english, {
        english_start: Number(item.english_start),
        english_end: Number(item.english_end),
        answer_text: String(item.answer_text ?? ""),
        selected_text: String(item.selected_text ?? item.answer_text ?? ""),
        question_category:
          (item.question_category as "grammar" | "vocabulary") || "grammar",
        choice_options: parseChoiceOptions(item.choice_options),
      });
      if (err) {
        return {
          ok: false as const,
          message: `공개 전 오류: ${err}`,
        };
      }
    }
  }

  const { error } = await supabase
    .from("exam_passages")
    .update({
      stage6_published: published,
      updated_at: new Date().toISOString(),
    })
    .eq("id", passageId)
    .eq("academy_id", auth.profile.academy_id);

  if (error) return { ok: false as const, message: error.message };
  revalidatePassage(passageId);
  return { ok: true as const, published };
}

export async function listStage6ItemsAction(passageId: string) {
  const auth = await requireStaff();
  if (!auth.ok) return auth;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("exam_stage_blanks")
    .select("*")
    .eq("passage_id", passageId)
    .eq("academy_id", auth.profile.academy_id)
    .eq("stage_number", 6)
    .order("blank_order", { ascending: true });
  if (error) return { ok: false as const, message: error.message };
  return { ok: true as const, items: (data ?? []) as ExamStage6Item[] };
}
