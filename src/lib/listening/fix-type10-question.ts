import { buildScriptText } from "@/lib/listening/script-text";
import { TYPE10_QUESTION_TYPE } from "@/lib/listening/prompts/type10MainContentPrompt";
import {
  indexOfContentInChoices,
  normalizeContentClues,
  normalizeContentPhrase,
  normalizeTopicDistractorReasons,
} from "@/lib/listening/type10-content-choices";
import type { GeneratedListeningQuestion } from "@/lib/listening/types";

const TYPE10_INSTRUCTION =
  "대화를 듣고, 무엇에 관한 내용인지 가장 적절한 것을 고르시오.";

export function fixType10Question(
  q: GeneratedListeningQuestion,
  typeId: number
): GeneratedListeningQuestion {
  if (typeId !== 10) return q;

  const main_content = normalizeContentPhrase(
    q.main_content?.trim() ||
      q.choices[q.correct_answer - 1]?.trim() ||
      ""
  );
  const content_clues = normalizeContentClues(q.content_clues);
  const topic_distractor_reasons = normalizeTopicDistractorReasons(
    q.topic_distractor_reasons ??
      (q as GeneratedListeningQuestion & { distractor_reasons?: unknown })
        .distractor_reasons
  );

  const base: GeneratedListeningQuestion = {
    ...q,
    order_index: 10,
    question_type: TYPE10_QUESTION_TYPE,
    instruction: q.instruction?.trim() || TYPE10_INSTRUCTION,
    question_text: "",
    needs_image_choices: false,
    visual_choice_type: "none",
    choice_image_prompts: [],
    main_content,
    content_clues,
    topic_distractor_reasons,
    script_text: q.script_text || buildScriptText(q.segments),
  };

  const idx = main_content
    ? indexOfContentInChoices(base.choices, main_content)
    : -1;
  const correct_answer = idx >= 0 ? idx + 1 : base.correct_answer;

  return { ...base, correct_answer };
}
