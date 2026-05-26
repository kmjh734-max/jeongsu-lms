import { buildScriptText } from "@/lib/listening/script-text";
import { TYPE4_QUESTION_TYPE } from "@/lib/listening/prompts/type4IntentionPrompt";
import {
  intentionMatchesChoice,
  instructionMatchesLastSpeaker,
  normalizeIntentionLabel,
  speakerLabelFromCode,
} from "@/lib/listening/type4-intention-choices";
import type { GeneratedListeningQuestion } from "@/lib/listening/types";

function lastSegment(q: GeneratedListeningQuestion) {
  const spoken = q.segments.filter((s) => s.speaker === "M" || s.speaker === "W");
  return spoken[spoken.length - 1];
}

function buildInstruction(lastSpeaker: "M" | "W"): string {
  const who = speakerLabelFromCode(lastSpeaker);
  return `대화를 듣고, ${who}가 한 마지막 말의 의도로 가장 적절한 것을 고르시오.`;
}

function syncCorrectAnswer(
  q: GeneratedListeningQuestion,
  targetIntention: string
): number {
  const target = normalizeIntentionLabel(targetIntention);
  if (!target) return q.correct_answer;

  const idx = q.choices.findIndex(
    (c) => normalizeIntentionLabel(c) === target
  );
  return idx >= 0 ? idx + 1 : q.correct_answer;
}

export function fixType4Question(
  q: GeneratedListeningQuestion,
  typeId: number
): GeneratedListeningQuestion {
  if (typeId !== 4) return q;

  const last = lastSegment(q);
  const last_speaker: "M" | "W" =
    q.last_speaker === "M" || q.last_speaker === "W"
      ? q.last_speaker
      : last?.speaker === "M" || last?.speaker === "W"
        ? last.speaker
        : "W";

  const final_utterance =
    q.final_utterance?.trim() || last?.text?.trim() || "";

  const intention_candidates = Array.isArray(q.intention_candidates)
    ? q.intention_candidates.map((x) => normalizeIntentionLabel(String(x))).filter(Boolean)
    : q.choices.map((c) => normalizeIntentionLabel(c)).filter(Boolean);

  const target_intention = normalizeIntentionLabel(
    q.target_intention?.trim() ||
      intention_candidates[q.correct_answer - 1] ||
      q.choices[q.correct_answer - 1] ||
      ""
  );

  const instruction =
    q.instruction?.trim() && instructionMatchesLastSpeaker(q.instruction, last_speaker)
      ? q.instruction
      : buildInstruction(last_speaker);

  const base: GeneratedListeningQuestion = {
    ...q,
    order_index: 4,
    question_type: TYPE4_QUESTION_TYPE,
    instruction,
    question_text: "",
    needs_image_choices: false,
    visual_choice_type: "none",
    choice_image_prompts: [],
    last_speaker,
    final_utterance,
    target_intention,
    intention_candidates,
    script_text: q.script_text || buildScriptText(q.segments),
  };

  const correct_answer = syncCorrectAnswer(base, target_intention);

  return { ...base, correct_answer };
}
