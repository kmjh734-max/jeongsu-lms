import type { SupabaseClient } from "@supabase/supabase-js";
import { buildFallbackDictationBlanks } from "@/lib/listening/dictation/fallback-blanks";
import {
  pickPreparedBlankItems,
  prebuildDictationForQuestion,
} from "@/lib/listening/dictation/prebuild-question";
import type {
  DictationBlankItem,
  DictationSetSettings,
} from "@/lib/listening/dictation/types";
import { normalizeDictationText } from "@/lib/listening/dictation/normalize-text";
import { filterWordOnlyBlankItems } from "@/lib/listening/dictation/word-only";

export type ResolveDictationBlanksInput = {
  admin: SupabaseClient;
  questionId: string;
  scriptText: string;
  questionType: string;
  answerClue: string;
  segments: Array<{ speaker: string; text: string }>;
  settings: DictationSetSettings;
  attemptNo: number;
  seedItems?: DictationBlankItem[] | null;
  /** 재시도 시 이전 빈칸 단어 제외 */
  avoidWords?: string[];
};

/** 학생 Dictation용 빈칸 — 단어만, 없으면 DB 재생성·fallback */
export async function resolveDictationBlankItems(
  input: ResolveDictationBlanksInput
): Promise<DictationBlankItem[]> {
  let items = filterWordOnlyBlankItems(input.seedItems ?? []);

  if (!items.length) {
    const { data: qRow } = await input.admin
      .from("listening_questions")
      .select("dictation_blank_items, dictation_blank_variants")
      .eq("id", input.questionId)
      .maybeSingle();

    items = qRow ? (pickPreparedBlankItems(qRow, input.attemptNo) ?? []) : [];
  }

  if (!items.length) {
    await prebuildDictationForQuestion(input.questionId, {
      includeVariants: false,
      force: true,
    });
    const { data: refreshed } = await input.admin
      .from("listening_questions")
      .select("dictation_blank_items, dictation_blank_variants")
      .eq("id", input.questionId)
      .maybeSingle();
    items = refreshed ? (pickPreparedBlankItems(refreshed, input.attemptNo) ?? []) : [];
  }

  if (!items.length && input.scriptText.trim()) {
    items = filterWordOnlyBlankItems(
      buildFallbackDictationBlanks({
        scriptText: input.scriptText,
        segments: input.segments,
        blankLevel: input.settings.dictation_blank_level,
        answerClue: input.answerClue,
        previousBlankWords: input.avoidWords,
      })
    );
  }

  if (
    input.avoidWords?.length &&
    items.length &&
    input.scriptText.trim()
  ) {
    const avoidSet = new Set(
      input.avoidWords.map((w) => normalizeDictationText(w))
    );
    const overlap = items.every((it) =>
      avoidSet.has(normalizeDictationText(it.answer))
    );
    if (overlap) {
      const alt = filterWordOnlyBlankItems(
        buildFallbackDictationBlanks({
          scriptText: input.scriptText,
          segments: input.segments,
          blankLevel: input.settings.dictation_blank_level,
          answerClue: input.answerClue,
          previousBlankWords: input.avoidWords,
        })
      );
      if (alt.length) items = alt;
    }
  }

  return items;
}
