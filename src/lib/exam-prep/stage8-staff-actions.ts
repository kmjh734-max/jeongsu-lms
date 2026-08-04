"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { isExamPrepEnabled } from "@/lib/academy-features";
import {
  collectStage8Warnings,
  parseReorderChunks,
  validateStage8GroupAgainstText,
  type ExamStage8Group,
  type Stage8GroupDraft,
} from "@/lib/exam-prep/stage8-types";

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

function bumpContentVersion(
  supabase: Awaited<ReturnType<typeof createClient>>,
  passageId: string,
  academyId: string,
  current: number
) {
  return supabase
    .from("exam_passages")
    .update({
      stage8_content_version: (Number(current) || 1) + 1,
      updated_at: new Date().toISOString(),
    })
    .eq("id", passageId)
    .eq("academy_id", academyId);
}

export async function saveStage8GroupsAction(
  passageId: string,
  drafts: Stage8GroupDraft[]
) {
  const auth = await requireStaff();
  if (!auth.ok) return auth;
  const supabase = await createClient();

  const { data: passage } = await supabase
    .from("exam_passages")
    .select("id, stage8_content_version")
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
  const englishBySentence = new Map(
    (sentences ?? []).map((s) => [
      s.id as string,
      String(s.english_text ?? ""),
    ])
  );

  for (const d of drafts) {
    const sent = byId.get(d.sentence_id);
    if (!sent) {
      return { ok: false as const, message: "문장 데이터가 없는 항목이 있습니다." };
    }
    const english = String(sent.english_text ?? "");
    const err = validateStage8GroupAgainstText(english, d);
    if (err) return { ok: false as const, message: err };
  }

  const warnings = collectStage8Warnings(englishBySentence, drafts);
  const hard = warnings.filter(
    (w) =>
      w.includes("겹") ||
      w.includes("일치하지") ||
      w.includes("최소 2개") ||
      w.includes("동일")
  );
  if (hard[0]) {
    return { ok: false as const, message: hard[0] };
  }

  const { data: existingRows } = await supabase
    .from("exam_stage_blanks")
    .select("id")
    .eq("passage_id", passageId)
    .eq("academy_id", auth.profile.academy_id)
    .eq("stage_number", 8);
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
    const chunks = parseReorderChunks(d.chunks).map((c, idx) => ({
      ...c,
      chunkOrder: idx + 1,
    }));
    const selected = d.original_text;
    const row = {
      academy_id: auth.profile.academy_id,
      passage_id: passageId,
      sentence_id: d.sentence_id,
      stage_number: 8,
      target_language: "en" as const,
      blank_order: d.blank_order || i + 1,
      answer_text: selected,
      accepted_answers: [],
      english_start: d.english_start,
      english_end: d.english_end,
      selected_text: selected,
      answer_snapshot: selected,
      reorder_chunks: chunks,
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
        .eq("stage_number", 8);
      if (error) return { ok: false as const, message: error.message };
    } else {
      const { error } = await supabase.from("exam_stage_blanks").insert(row);
      if (error) return { ok: false as const, message: error.message };
    }
  }

  await bumpContentVersion(
    supabase,
    passageId,
    auth.profile.academy_id!,
    Number(passage.stage8_content_version) || 1
  );

  revalidatePassage(passageId);
  return {
    ok: true as const,
    count: drafts.length,
    warnings: [...new Set(warnings)],
  };
}

export async function setStage8PublishedAction(
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
        "id, is_required, answer_text, selected_text, english_start, english_end, sentence_id, reorder_chunks, blank_order, hint, explanation"
      )
      .eq("passage_id", passageId)
      .eq("academy_id", auth.profile.academy_id)
      .eq("stage_number", 8);

    const required = (items ?? []).filter((r) => r.is_required);
    if (required.length < 1) {
      return {
        ok: false as const,
        message: "필수 배열 구간이 최소 1개 있어야 공개할 수 있습니다.",
      };
    }

    const { data: sentences } = await supabase
      .from("exam_passage_sentences")
      .select("id, english_text")
      .eq("passage_id", passageId);
    const enMap = new Map(
      (sentences ?? []).map((s) => [s.id as string, String(s.english_text ?? "")])
    );
    const drafts: Stage8GroupDraft[] = (items ?? []).map((r, i) => ({
      id: r.id as string,
      sentence_id: r.sentence_id as string,
      blank_order: Number(r.blank_order) || i + 1,
      english_start: Number(r.english_start),
      english_end: Number(r.english_end),
      original_text: String(r.selected_text ?? r.answer_text ?? ""),
      chunks: parseReorderChunks(r.reorder_chunks),
      hint: (r.hint as string | null) ?? null,
      explanation: (r.explanation as string | null) ?? null,
      is_required: Boolean(r.is_required),
    }));

    for (const d of drafts.filter((x) => x.is_required !== false)) {
      const english = enMap.get(d.sentence_id) ?? "";
      const err = validateStage8GroupAgainstText(english, d);
      if (err) {
        return { ok: false as const, message: `공개 전 오류: ${err}` };
      }
    }
    const warnings = collectStage8Warnings(enMap, drafts);
    const blocking = warnings.find(
      (w) =>
        w.includes("일치하지") ||
        w.includes("최소 2개") ||
        w.includes("동일") ||
        w.includes("겹")
    );
    if (blocking) {
      return { ok: false as const, message: `공개 전 오류: ${blocking}` };
    }
  }

  const { error } = await supabase
    .from("exam_passages")
    .update({
      stage8_published: published,
      updated_at: new Date().toISOString(),
    })
    .eq("id", passageId)
    .eq("academy_id", auth.profile.academy_id);

  if (error) return { ok: false as const, message: error.message };
  revalidatePassage(passageId);
  return { ok: true as const, published };
}

export async function listStage8GroupsAction(passageId: string) {
  const auth = await requireStaff();
  if (!auth.ok) return auth;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("exam_stage_blanks")
    .select("*")
    .eq("passage_id", passageId)
    .eq("academy_id", auth.profile.academy_id)
    .eq("stage_number", 8)
    .order("blank_order", { ascending: true });
  if (error) return { ok: false as const, message: error.message };
  return {
    ok: true as const,
    items: (data ?? []).map((row) => ({
      ...(row as ExamStage8Group),
      stage_number: 8 as const,
      reorder_chunks: parseReorderChunks(
        (row as { reorder_chunks: unknown }).reorder_chunks
      ),
    })),
  };
}

/** 강사용 간단 통계 (배열 구간별 정답률) */
export async function getStage8PassageStatsAction(passageId: string) {
  const auth = await requireStaff();
  if (!auth.ok) return auth;
  const supabase = await createClient();

  const { data: groups } = await supabase
    .from("exam_stage_blanks")
    .select("id, selected_text, blank_order, sentence_id")
    .eq("passage_id", passageId)
    .eq("academy_id", auth.profile.academy_id)
    .eq("stage_number", 8)
    .order("blank_order", { ascending: true });

  const { data: progressRows } = await supabase
    .from("exam_stage2_progress")
    .select(
      "id, score, completed_at, attempt_count, correct_blank_ids, incorrect_blank_ids, answers, hint_used_blank_ids, revealed_answer_blank_ids"
    )
    .eq("passage_id", passageId)
    .eq("academy_id", auth.profile.academy_id)
    .eq("stage_number", 8);

  const byGroup: Record<
    string,
    { correct: number; incorrect: number; hint: number; revealed: number }
  > = {};
  for (const g of groups ?? []) {
    byGroup[g.id as string] = {
      correct: 0,
      incorrect: 0,
      hint: 0,
      revealed: 0,
    };
  }

  let completedStudents = 0;
  let scoreSum = 0;
  let attemptSum = 0;
  const studentCount = (progressRows ?? []).length;

  for (const row of progressRows ?? []) {
    if (row.completed_at) completedStudents++;
    scoreSum += Number(row.score) || 0;
    attemptSum += Number(row.attempt_count) || 0;
    const correct = new Set(
      (row.correct_blank_ids as string[] | undefined) ?? []
    );
    const incorrect = new Set(
      (row.incorrect_blank_ids as string[] | undefined) ?? []
    );
    const hints = new Set(
      (row.hint_used_blank_ids as string[] | undefined) ?? []
    );
    const revealed = new Set(
      (row.revealed_answer_blank_ids as string[] | undefined) ?? []
    );
    for (const id of Object.keys(byGroup)) {
      if (correct.has(id)) byGroup[id]!.correct++;
      if (incorrect.has(id)) byGroup[id]!.incorrect++;
      if (hints.has(id)) byGroup[id]!.hint++;
      if (revealed.has(id)) byGroup[id]!.revealed++;
    }
  }

  const hardest = [...(groups ?? [])]
    .map((g) => {
      const s = byGroup[g.id as string]!;
      const total = s.correct + s.incorrect;
      return {
        groupId: g.id as string,
        label: String(g.selected_text ?? "").slice(0, 40),
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
    byGroup: hardest,
  };
}
