import { buildScriptText } from "@/lib/listening/script-text";
import {
  filterSpokenSegments,
  trimContinuationDialogue,
} from "@/lib/listening/fix-continuation-question";
import { TYPE19_QUESTION_TYPE } from "@/lib/listening/prompts/type19ResponsePrompt";
import {
  TYPE19_BLANK_SPEAKER,
  TYPE19_END_SPEAKER,
  buildType19Instruction,
  distractorReasonsToStrings,
  instructionMatchesBlankSpeaker,
  normalizeDistractorReasons,
  parseBlankSpeaker,
  previousTurnMatchesLastSegment,
  questionTextForBlankSpeaker,
} from "@/lib/listening/type19-response-choices";
import type { GeneratedListeningQuestion } from "@/lib/listening/types";

function inferPreviousTurn(
  segments: GeneratedListeningQuestion["segments"]
): string {
  const spoken = filterSpokenSegments(segments);
  const last = spoken[spoken.length - 1];
  if (!last) return "";
  const label = last.speaker === "W" ? "W" : last.speaker === "M" ? "M" : "ANN";
  return `${label}: ${last.text}`;
}

export function fixType19Question(
  q: GeneratedListeningQuestion,
  typeId: number
): GeneratedListeningQuestion {
  if (typeId !== 19) return q;

  const segments = trimContinuationDialogue(q.segments, TYPE19_END_SPEAKER);
  const blank_speaker =
    parseBlankSpeaker(q.blank_speaker ?? "") ?? TYPE19_BLANK_SPEAKER;

  const instruction =
    q.instruction?.trim() &&
    /응답|이어질/.test(q.instruction) &&
    instructionMatchesBlankSpeaker(q.instruction, blank_speaker)
      ? q.instruction
      : buildType19Instruction();

  const question_text = questionTextForBlankSpeaker(blank_speaker);

  let previous_turn = q.previous_turn?.trim() || inferPreviousTurn(segments);
  if (!previousTurnMatchesLastSegment(previous_turn, segments)) {
    previous_turn = inferPreviousTurn(segments);
  }

  const distractorEntries = normalizeDistractorReasons(
    (q as GeneratedListeningQuestion & { distractor_reasons?: unknown })
      .distractor_reasons ?? q.distractor_reason,
    q.choices
  );
  const distractor_reason =
    distractorEntries.length > 0
      ? distractorReasonsToStrings(distractorEntries, q.choices)
      : Array.isArray(q.distractor_reason)
        ? q.distractor_reason.map(String)
        : [];

  return {
    ...q,
    order_index: 19,
    question_type: TYPE19_QUESTION_TYPE,
    instruction,
    question_text,
    segments,
    previous_turn,
    blank_speaker,
    distractor_reason,
    needs_image_choices: false,
    visual_choice_type: "none",
    choice_image_prompts: [],
    script_text: buildScriptText(segments),
  };
}
