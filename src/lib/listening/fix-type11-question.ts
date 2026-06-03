import { buildScriptText } from "@/lib/listening/script-text";
import { TYPE11_QUESTION_TYPE } from "@/lib/listening/prompts/type11TransportPrompt";
import {
  indexOfTransportInChoices,
  normalizeMentionedTransportOptions,
  normalizeTransportLabel,
} from "@/lib/listening/type11-transport-choices";
import type { GeneratedListeningQuestion } from "@/lib/listening/types";

const TYPE11_INSTRUCTION =
  "대화를 듣고, 두 사람이 함께 이동할 방법으로 가장 적절한 것을 고르시오.";

export function fixType11Question(
  q: GeneratedListeningQuestion,
  typeId: number
): GeneratedListeningQuestion {
  if (typeId !== 11) return q;

  const final_transport = normalizeTransportLabel(
    q.final_transport?.trim() ||
      q.choices[q.correct_answer - 1]?.trim() ||
      ""
  );
  const destination = q.destination?.trim() ?? "";
  const mentioned_transport_options = normalizeMentionedTransportOptions(
    q.mentioned_transport_options
  );

  const base: GeneratedListeningQuestion = {
    ...q,
    order_index: 11,
    question_type: TYPE11_QUESTION_TYPE,
    instruction: q.instruction?.trim() || TYPE11_INSTRUCTION,
    question_text: "",
    needs_image_choices: false,
    visual_choice_type: "none",
    choice_image_prompts: [],
    destination,
    final_transport,
    mentioned_transport_options,
    script_text: q.script_text || buildScriptText(q.segments),
  };

  const idx = final_transport
    ? indexOfTransportInChoices(base.choices, final_transport)
    : -1;
  const correct_answer = idx >= 0 ? idx + 1 : base.correct_answer;

  return { ...base, correct_answer };
}
