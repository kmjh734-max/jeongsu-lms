import { blankCountRange } from "@/lib/listening/dictation/blank-level";
import {
  buildFallbackDictationBlanks,
  ensureOneBlankPerSpokenLine,
} from "@/lib/listening/dictation/fallback-blanks";
import { anchorDictationBlankItems } from "@/lib/listening/dictation/anchor-blank-items";
import { collectSpokenLines } from "@/lib/listening/dictation/spoken-lines";
import { filterWordOnlyBlankItems } from "@/lib/listening/dictation/word-only";
import {
  buildDictationSystemPrompt,
  buildDictationUserPrompt,
  parseDictationAiResponse,
} from "@/lib/listening/dictation/prompt";
import type {
  DictationBlankItem,
  DictationBlankLevel,
} from "@/lib/listening/dictation/types";
import { listeningChatJson } from "@/lib/listening/openai-listening-chat";

export interface GenerateDictationBlanksInput {
  apiKey: string;
  questionType: string;
  scriptText: string;
  segments: Array<{ speaker: string; text: string }>;
  answerClue: string;
  blankLevel: DictationBlankLevel;
  previousBlankWords: string[];
}

export async function generateDictationBlanks(
  input: GenerateDictationBlanksInput
): Promise<DictationBlankItem[]> {
  const spoken = collectSpokenLines({
    scriptText: input.scriptText,
    segments: input.segments,
  });
  const sentenceCount = spoken.length || 3;
  const { min, max } = blankCountRange(input.blankLevel, sentenceCount);

  try {
    const parsed = await listeningChatJson<{ blank_items?: unknown[] }>(
      input.apiKey,
      {
        system: buildDictationSystemPrompt(),
        user: buildDictationUserPrompt({
          questionType: input.questionType,
          scriptText: input.scriptText,
          segmentsJson: JSON.stringify(spoken, null, 2),
          answerClue: input.answerClue,
          blankMin: min,
          blankMax: max,
          previousBlankWords: input.previousBlankWords,
        }),
        temperature: 0.5,
      }
    );
    let items = anchorDictationBlankItems(parseDictationAiResponse(parsed), {
      scriptText: input.scriptText,
      segments: input.segments,
    });
    items = ensureOneBlankPerSpokenLine(
      items,
      spoken,
      input.previousBlankWords
    );
    items = anchorDictationBlankItems(items, {
      scriptText: input.scriptText,
      segments: input.segments,
    });
    items = filterWordOnlyBlankItems(items);
    if (items.length >= Math.min(1, min)) {
      return items.slice(0, max);
    }
  } catch {
    /* fallback below */
  }

  return buildFallbackDictationBlanks({
    scriptText: input.scriptText,
    segments: input.segments,
    blankLevel: input.blankLevel,
    previousBlankWords: input.previousBlankWords,
    answerClue: input.answerClue,
  });
}
