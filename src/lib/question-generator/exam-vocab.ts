import { createAdminClient } from "@/lib/supabase/admin";
import { persistVocabItems } from "@/lib/vocab/save-items";
import { SITE_URL } from "@/lib/branding";

export type HardWord = { word: string; meaning: string };

function siteBase(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? SITE_URL).replace(/\/$/, "");
}

/** 시험지 QR — 변형문제 연계 단어학습 (1·2·4단계) */
export function buildExamVocabUrl(setId: string): string {
  return `${siteBase()}/student/vocab/exam/${setId}`;
}

function normalizeHardWords(raw: unknown): HardWord[] {
  if (!Array.isArray(raw)) return [];
  const out: HardWord[] = [];
  const seen = new Set<string>();
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const word = String(
      (item as { word?: unknown }).word ?? ""
    )
      .trim()
      .toLowerCase();
    const meaning = String(
      (item as { meaning?: unknown }).meaning ??
        (item as { meaningKo?: unknown }).meaningKo ??
        ""
    ).trim();
    if (!word || !meaning) continue;
    if (word.length > 40 || meaning.length > 80) continue;
    if (seen.has(word)) continue;
    seen.add(word);
    out.push({
      word: String((item as { word?: unknown }).word ?? "").trim(),
      meaning,
    });
  }
  return out.slice(0, 12);
}

export const normalizeHardWordsFromRaw = normalizeHardWords;

export function parseHardWordsColumn(raw: unknown): HardWord[] {
  return normalizeHardWords(raw);
}

/**
 * 생성 완료 job의 문항 hard_words를 모아 exam_compact 단어장으로 동기화.
 * 기존 vocab_set_id가 있으면 단어만 갱신.
 */
export async function syncExamVocabSetFromJob(jobId: string): Promise<string | null> {
  const admin = createAdminClient();
  const { data: job, error } = await admin
    .from("question_generation_jobs")
    .select("id, created_by, request_config, vocab_set_id, total_completed")
    .eq("id", jobId)
    .single();

  if (error || !job) return null;
  if ((job.total_completed ?? 0) < 1) return null;

  const { data: questions } = await admin
    .from("generated_english_questions")
    .select("hard_words, instruction")
    .eq("generation_job_id", jobId)
    .order("created_at", { ascending: true });

  const merged: HardWord[] = [];
  const seen = new Set<string>();
  for (const q of questions ?? []) {
    for (const w of normalizeHardWords(q.hard_words)) {
      const key = w.word.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      merged.push(w);
    }
  }

  if (merged.length === 0) return (job.vocab_set_id as string | null) ?? null;

  const cfg = (job.request_config ?? {}) as { title?: string; grade?: string };
  const titleBase = (cfg.title || "변형문제").trim() || "변형문제";
  const setTitle = `${titleBase} · 보기 단어`.slice(0, 80);
  const description = `변형문제 해설 연계 단어장 (1·2·4단계). ${cfg.grade ?? ""}`.trim();
  const teacherId = job.created_by as string;

  let setId = (job.vocab_set_id as string | null) ?? null;

  if (setId) {
    await admin
      .from("vocab_sets")
      .update({
        title: setTitle,
        description,
        exam_compact: true,
        source_job_id: jobId,
        is_published: true,
      })
      .eq("id", setId);
  } else {
    const { data: created, error: cErr } = await admin
      .from("vocab_sets")
      .insert({
        title: setTitle,
        description,
        teacher_id: teacherId,
        created_by: teacherId,
        is_published: true,
        exam_compact: true,
        source_job_id: jobId,
        folder_id: null,
        order_index: 0,
      })
      .select("id")
      .single();
    if (cErr || !created) {
      console.error("exam vocab set create failed", cErr);
      return null;
    }
    setId = created.id as string;
    await admin
      .from("question_generation_jobs")
      .update({ vocab_set_id: setId })
      .eq("id", jobId);
  }

  const persist = await persistVocabItems(
    admin,
    setId,
    merged.map((w, i) => ({
      word: w.word,
      meaning: w.meaning,
      order_index: i,
    }))
  );
  if (!persist.ok) {
    console.error("exam vocab items persist failed", persist.message);
  }

  return setId;
}

/** 로그인한 학생이 exam_compact 단어장에 직접 배정되도록 보장 */
export async function ensureStudentExamVocabAssignment(
  studentId: string,
  setId: string
): Promise<boolean> {
  const admin = createAdminClient();
  const { data: set } = await admin
    .from("vocab_sets")
    .select("id, exam_compact, is_published")
    .eq("id", setId)
    .maybeSingle();

  if (!set?.is_published || !set.exam_compact) return false;

  const { data: existing } = await admin
    .from("vocab_assignments")
    .select("id")
    .eq("set_id", setId)
    .eq("student_id", studentId)
    .maybeSingle();

  if (existing) return true;

  const { error } = await admin.from("vocab_assignments").insert({
    set_id: setId,
    student_id: studentId,
    class_id: null,
    assigned_by: studentId,
  });

  return !error;
}

/** exam_compact: 2단계 완료 시 3단계를 자동 완료 처리해 4단계 해금 */
export async function ensureExamCompactStageSkip(
  studentId: string,
  setId: string
): Promise<void> {
  const admin = createAdminClient();
  const { data: set } = await admin
    .from("vocab_sets")
    .select("exam_compact")
    .eq("id", setId)
    .maybeSingle();
  if (!set?.exam_compact) return;

  const { data: progress } = await admin
    .from("vocab_stage_progress")
    .select("id, stage2_completed, stage3_completed")
    .eq("student_id", studentId)
    .eq("set_id", setId)
    .maybeSingle();

  if (!progress?.stage2_completed || progress.stage3_completed) return;

  await admin
    .from("vocab_stage_progress")
    .update({
      stage3_completed: true,
      stage3_completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", progress.id);
}
