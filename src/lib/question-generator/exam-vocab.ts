import { createAdminClient } from "@/lib/supabase/admin";
import { persistVocabItems } from "@/lib/vocab/save-items";
import { SITE_URL } from "@/lib/branding";
import { lemmaEnglishToken } from "@/lib/question-generator/word-order-normalize";

export type HardWord = { word: string; meaning: string };

function siteBase(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? SITE_URL).replace(/\/$/, "");
}

/** 시험지 QR — 변형문제 연계 단어학습 (로그인 불필요) */
export function buildExamVocabUrl(setId: string): string {
  return `${siteBase()}/exam-vocab/${setId}`;
}

/** 보기·중요 단어 → 동사/명사 원형 (복수·과거·3인칭 등 제거) */
export function lemmaHardWordForm(raw: string): string {
  return raw
    .trim()
    .split(/\s+/)
    .map((tok) => {
      const cleaned = tok.replace(/^[^a-zA-Z']+|[^a-zA-Z']+$/g, "");
      if (!cleaned) return "";
      return lemmaEnglishToken(cleaned);
    })
    .filter(Boolean)
    .join(" ");
}

function normalizeHardWords(raw: unknown): HardWord[] {
  if (!Array.isArray(raw)) return [];
  const out: HardWord[] = [];
  const seen = new Set<string>();
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const original = String(
      (item as { word?: unknown }).word ?? ""
    ).trim();
    const word = lemmaHardWordForm(original);
    const meaning = String(
      (item as { meaning?: unknown }).meaning ??
        (item as { meaningKo?: unknown }).meaningKo ??
        ""
    ).trim();
    if (!word || !meaning) continue;
    if (word.length > 40 || meaning.length > 80) continue;
    const key = word.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ word, meaning });
  }
  return out.slice(0, 12);
}

export const normalizeHardWordsFromRaw = normalizeHardWords;

export function parseHardWordsColumn(raw: unknown): HardWord[] {
  return normalizeHardWords(raw);
}

/** QR·단어장용: 원형 기준 중복 제거 (progress/Progress, allows/allow 등) */
export function hardWordDedupeKey(word: string): string {
  return lemmaHardWordForm(word)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
}

export function dedupeHardWords(words: HardWord[]): HardWord[] {
  const byKey = new Map<string, HardWord>();
  for (const item of words) {
    const word = lemmaHardWordForm(String(item.word ?? "").trim());
    const meaning = String(item.meaning ?? "").trim();
    if (!word || !meaning) continue;
    if (word.length > 40 || meaning.length > 80) continue;
    const key = hardWordDedupeKey(word);
    if (!key) continue;
    const prev = byKey.get(key);
    if (!prev) {
      byKey.set(key, { word, meaning });
      continue;
    }
    if (meaning.length > prev.meaning.length) {
      byKey.set(key, { word: prev.word, meaning });
    }
  }
  return [...byKey.values()];
}

/** DB vocab_items 행 중복 제거 (학습 카드용) */
export function dedupeVocabItemRows<
  T extends { word: string; meaning: string; order_index?: number | null },
>(items: T[]): T[] {
  const byKey = new Map<string, T>();
  for (const item of items) {
    const word = lemmaHardWordForm(String(item.word ?? "").trim());
    const meaning = String(item.meaning ?? "").trim();
    if (!word || !meaning) continue;
    const key = hardWordDedupeKey(word);
    if (!key) continue;
    const prev = byKey.get(key);
    if (!prev) {
      byKey.set(key, { ...item, word, meaning });
      continue;
    }
    if (meaning.length > String(prev.meaning ?? "").trim().length) {
      byKey.set(key, { ...prev, meaning });
    }
  }
  return [...byKey.values()].map((row, i) => ({
    ...row,
    order_index: i,
  }));
}

/**
 * 해설지 «보기 단어»·QR 단어장에 포함할지.
 * - 영어 선지 객관식
 * - 일치개수(content_count): 하단 선지 없이 <보기> 진술·지문 어휘
 */
export function choicesNeedVocabGloss(
  choices:
    | Array<{ number?: number; text?: string } | null>
    | null
    | undefined
): boolean {
  if (!choices?.length) return false;
  let englishish = 0;
  for (const c of choices) {
    const t = String(c?.text ?? "").trim();
    if (!t) continue;
    if (/^\d+\s*개$/.test(t)) continue;
    const latin = (t.match(/[A-Za-z]/g) ?? []).length;
    const hangul = (t.match(/[\uAC00-\uD7A3]/g) ?? []).length;
    if (latin >= 3 && latin > hangul) englishish += 1;
  }
  return englishish >= 2;
}

export function questionNeedsVocabGloss(input: {
  choices?:
    | Array<{ number?: number; text?: string } | null>
    | null
    | undefined;
  questionType?: string | null;
  optionKey?: string | null;
  questionText?: string | null;
  choiceLanguage?: string | null;
}): boolean {
  if (choicesNeedVocabGloss(input.choices)) return true;

  const type = (input.questionType || "").trim();
  const key = (input.optionKey || "").trim();
  const isContentCount =
    type === "content_count" ||
    key.startsWith("content_count:") ||
    key.includes(":일치개수");

  if (isContentCount) return true;

  // 저장된 hard_words가 있어도, 유형 정보가 비어 있으면 영어 <보기> 진술로 추정
  const qt = input.questionText || "";
  if (/<보기>/.test(qt)) {
    const latin = (qt.match(/[A-Za-z]/g) ?? []).length;
    const hangul = (qt.match(/[\uAC00-\uD7A3]/g) ?? []).length;
    if (latin >= 40 && latin > hangul) return true;
  }

  return false;
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
    .select(
      "hard_words, choices, instruction, question_type, option_key, question_text, choice_language"
    )
    .eq("generation_job_id", jobId)
    .order("created_at", { ascending: true });

  const merged: HardWord[] = [];
  for (const q of questions ?? []) {
    if (
      !questionNeedsVocabGloss({
        choices: q.choices as Array<{ text?: string }> | null,
        questionType: q.question_type as string | null,
        optionKey: q.option_key as string | null,
        questionText: q.question_text as string | null,
        choiceLanguage: q.choice_language as string | null,
      })
    ) {
      continue;
    }
    for (const w of normalizeHardWords(q.hard_words)) {
      merged.push(w);
    }
  }

  const unique = dedupeHardWords(merged);
  if (unique.length === 0) return (job.vocab_set_id as string | null) ?? null;

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
    unique.map((w, i) => ({
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
