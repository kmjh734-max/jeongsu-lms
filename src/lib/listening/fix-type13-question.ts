import { buildScriptText } from "@/lib/listening/script-text";
import { TYPE13_QUESTION_TYPE } from "@/lib/listening/prompts/type13PlacePrompt";
import {
  indexOfPlaceInChoices,
  normalizeDistractorPlaces,
  normalizePlaceClues,
  normalizePlaceLabel,
} from "@/lib/listening/type13-place-choices";
import type { GeneratedListeningQuestion } from "@/lib/listening/types";

const TYPE13_INSTRUCTION =
  "대화를 듣고, 두 사람이 대화하는 장소로 가장 적절한 곳을 고르시오.";

export function fixType13Question(
  q: GeneratedListeningQuestion,
  typeId: number
): GeneratedListeningQuestion {
  if (typeId !== 13) return q;

  const target_place = normalizePlaceLabel(
    q.target_place?.trim() ||
      q.choices[q.correct_answer - 1]?.trim() ||
      ""
  );
  const place_clues = normalizePlaceClues(q.place_clues);
  const distractor_places = normalizeDistractorPlaces(q.distractor_places);

  const base: GeneratedListeningQuestion = {
    ...q,
    order_index: 13,
    question_type: TYPE13_QUESTION_TYPE,
    instruction: q.instruction?.trim() || TYPE13_INSTRUCTION,
    question_text: "",
    needs_image_choices: false,
    visual_choice_type: "none",
    choice_image_prompts: [],
    target_place,
    place_clues,
    distractor_places,
    script_text: q.script_text || buildScriptText(q.segments),
  };

  const idx = target_place
    ? indexOfPlaceInChoices(base.choices, target_place)
    : -1;
  const correct_answer = idx >= 0 ? idx + 1 : base.correct_answer;

  return { ...base, correct_answer };
}
