import { blankCountRange } from "@/lib/listening/dictation/blank-level";
import { buildFallbackDictationBlanks } from "@/lib/listening/dictation/fallback-blanks";
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
  const spoken = input.segments.filter((s) => {
    const sp = s.speaker.toUpperCase();
    return (sp === "M" || sp === "W") && s.text.trim().length >= 12;
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
    const items = parseDictationAiResponse(parsed);
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
