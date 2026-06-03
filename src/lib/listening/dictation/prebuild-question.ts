import { createAdminClient } from "@/lib/supabase/admin";
import { assertListeningOpenAiEnv } from "@/lib/listening/assert-listening-openai";
import { generateDictationBlanks } from "@/lib/listening/dictation/generate-blanks";
import { buildFallbackDictationBlanks } from "@/lib/listening/dictation/fallback-blanks";
import type { DictationBlankItem, DictationSetSettings } from "@/lib/listening/dictation/types";
import { DEFAULT_DICTATION_SETTINGS } from "@/lib/listening/dictation/types";
import { normalizeDictationText } from "@/lib/listening/dictation/normalize-text";
import { filterWordOnlyBlankItems } from "@/lib/listening/dictation/word-only";

const VARIANT_COUNT = 2;

export type PrebuildDictationOptions = {
  /** false면 1차 빈칸만 저장 (학생 대기 시간 단축) */
  includeVariants?: boolean;
  /** true면 기존 빈칸이 있어도 다시 생성 */
  force?: boolean;
};

async function generateBlankSet(opts: {
  apiKey?: string;
  questionType: string;
  scriptText: string;
  segments: Array<{ speaker: string; text: string }>;
  answerClue: string;
  blankLevel: DictationSetSettings["dictation_blank_level"];
  previousBlankWords: string[];
}): Promise<DictationBlankItem[]> {
  if (opts.apiKey) {
    try {
      const items = await generateDictationBlanks({
        apiKey: opts.apiKey,
        questionType: opts.questionType,
        scriptText: opts.scriptText,
        segments: opts.segments,
        answerClue: opts.answerClue,
        blankLevel: opts.blankLevel,
        previousBlankWords: opts.previousBlankWords,
      });
      const wordsOnly = filterWordOnlyBlankItems(items);
      if (wordsOnly.length > 0) return wordsOnly;
    } catch {
      /* fallback */
    }
  }
  return filterWordOnlyBlankItems(
    buildFallbackDictationBlanks({
      scriptText: opts.scriptText,
      segments: opts.segments,
      blankLevel: opts.blankLevel,
      previousBlankWords: opts.previousBlankWords,
      answerClue: opts.answerClue,
    })
  );
}

function wordsFromItems(items: DictationBlankItem[]): string[] {
  return items.map((i) => normalizeDictationText(i.answer)).filter(Boolean);
}

/** 문항 Dictation 빈칸 미리 생성 → listening_questions에 저장 */
export async function prebuildDictationForQuestion(
  questionId: string,
  opts?: PrebuildDictationOptions
): Promise<{ ok: boolean; message?: string; itemCount?: number; cached?: boolean }> {
  const includeVariants = opts?.includeVariants ?? false;
  const force = opts?.force ?? false;
  const admin = createAdminClient();

  const { data: question, error: qErr } = await admin
    .from("listening_questions")
    .select("id, set_id, script_text, question_type, answer_clue, dictation_blank_items")
    .eq("id", questionId)
    .maybeSingle();

  if (qErr || !question) {
    return { ok: false, message: qErr?.message ?? "문항 없음" };
  }

  const existing = question.dictation_blank_items;
  if (!force && Array.isArray(existing) && existing.length > 0) {
    const wordOnly = filterWordOnlyBlankItems(existing as DictationBlankItem[]);
    if (wordOnly.length > 0) {
      return { ok: true, itemCount: wordOnly.length, cached: true };
    }
  }

  const { data: setRow } = await admin
    .from("listening_sets")
    .select(
      "dictation_enabled, dictation_blank_level, dictation_randomize_on_retry"
    )
    .eq("id", question.set_id)
    .maybeSingle();

  const settings: DictationSetSettings = {
    ...DEFAULT_DICTATION_SETTINGS,
    dictation_enabled: setRow?.dictation_enabled ?? true,
    dictation_blank_level:
      (setRow?.dictation_blank_level as DictationSetSettings["dictation_blank_level"]) ??
      "auto",
    dictation_randomize_on_retry: setRow?.dictation_randomize_on_retry ?? true,
  };

  if (!settings.dictation_enabled) {
    return { ok: true, message: "Dictation 비활성 세트", itemCount: 0 };
  }

  const scriptText = (question.script_text as string) ?? "";
  if (!scriptText.trim()) {
    return { ok: false, message: "대본이 없어 Dictation을 만들 수 없습니다." };
  }

  const { data: segments } = await admin
    .from("listening_question_segments")
    .select("speaker_type, text, order_index")
    .eq("question_id", questionId)
    .order("order_index", { ascending: true });

  const segList = (segments ?? []).map((s) => ({
    speaker: s.speaker_type as string,
    text: s.text as string,
  }));

  let apiKey: string | undefined;
  try {
    ({ apiKey } = assertListeningOpenAiEnv());
  } catch {
    apiKey = undefined;
  }

  const primary = await generateBlankSet({
    apiKey,
    questionType: (question.question_type as string) ?? "",
    scriptText,
    segments: segList,
    answerClue: (question.answer_clue as string) ?? "",
    blankLevel: settings.dictation_blank_level,
    previousBlankWords: [],
  });

  if (primary.length === 0) {
    return { ok: false, message: "빈칸 후보를 찾지 못했습니다." };
  }

  const variants: DictationBlankItem[][] = [];
  if (includeVariants) {
    let avoid = wordsFromItems(primary);
    for (let i = 0; i < VARIANT_COUNT; i++) {
      const variant = await generateBlankSet({
        apiKey,
        questionType: (question.question_type as string) ?? "",
        scriptText,
        segments: segList,
        answerClue: (question.answer_clue as string) ?? "",
        blankLevel: settings.dictation_blank_level,
        previousBlankWords: avoid,
      });
      if (variant.length > 0) {
        variants.push(variant);
        avoid = [...avoid, ...wordsFromItems(variant)];
      }
    }
  }

  const { error: upErr } = await admin
    .from("listening_questions")
    .update({
      dictation_blank_items: primary,
      dictation_blank_variants: variants,
      dictation_prepared_at: new Date().toISOString(),
    })
    .eq("id", questionId);

  if (upErr) {
    const missing = /column|does not exist|PGRST204/i.test(upErr.message);
    return {
      ok: false,
      message: missing
        ? `${upErr.message} — Supabase에서 052_listening_dictation_prepared.sql을 실행하세요.`
        : upErr.message,
    };
  }

  return { ok: true, itemCount: primary.length };
}

/** 아직 빈칸이 없는 문항만 자동 생성 (버튼 없이 백그라운드용) */
export async function ensureDictationPreparedForSet(
  setId: string,
  opts?: PrebuildDictationOptions
): Promise<{ ok: number; skipped: number; failed: number; messages: string[] }> {
  const admin = createAdminClient();
  const { data: setRow } = await admin
    .from("listening_sets")
    .select("dictation_enabled")
    .eq("id", setId)
    .maybeSingle();

  if (!setRow?.dictation_enabled) {
    return { ok: 0, skipped: 0, failed: 0, messages: [] };
  }

  const { data: questions } = await admin
    .from("listening_questions")
    .select("id, dictation_blank_items")
    .eq("set_id", setId)
    .order("order_index", { ascending: true });

  let ok = 0;
  let skipped = 0;
  let failed = 0;
  const messages: string[] = [];

  for (const q of questions ?? []) {
    const existing = q.dictation_blank_items;
    if (!opts?.force && Array.isArray(existing) && existing.length > 0) {
      const wordOnly = filterWordOnlyBlankItems(existing as DictationBlankItem[]);
      if (wordOnly.length > 0) {
        skipped++;
        continue;
      }
    }

    const result = await prebuildDictationForQuestion(q.id as string, opts);
    if (result.ok && ((result.itemCount ?? 0) > 0 || result.cached)) ok++;
    else {
      failed++;
      if (result.message) messages.push(result.message);
    }
  }

  return { ok, skipped, failed, messages };
}

/** 세트 전체 Dictation 미리 생성 (재시도용 variant 포함) */
export async function prebuildDictationForSet(
  setId: string
): Promise<{ ok: number; failed: number; messages: string[] }> {
  const result = await ensureDictationPreparedForSet(setId, {
    includeVariants: true,
    force: true,
  });
  return { ok: result.ok, failed: result.failed, messages: result.messages };
}

export function pickPreparedBlankItems(
  question: {
    dictation_blank_items: unknown;
    dictation_blank_variants: unknown;
  },
  attemptNo: number
): DictationBlankItem[] | null {
  const primary = question.dictation_blank_items;
  if (!Array.isArray(primary) || primary.length === 0) return null;

  if (attemptNo <= 1) {
    return filterWordOnlyBlankItems(primary as DictationBlankItem[]);
  }

  const variants = question.dictation_blank_variants;
  if (Array.isArray(variants) && variants.length > 0) {
    const idx = Math.min(attemptNo - 2, variants.length - 1);
    const picked = variants[idx];
    if (Array.isArray(picked) && picked.length > 0) {
      return filterWordOnlyBlankItems(picked as DictationBlankItem[]);
    }
  }

  return filterWordOnlyBlankItems(primary as DictationBlankItem[]);
}
