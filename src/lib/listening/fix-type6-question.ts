import { buildScriptText } from "@/lib/listening/script-text";
import { TYPE6_QUESTION_TYPE } from "@/lib/listening/prompts/type6TimePrompt";
import {
  indexOfTimeInChoices,
  normalizeMentionedTimes,
  normalizeTimeLabel,
} from "@/lib/listening/type6-time-choices";
import type { GeneratedListeningQuestion } from "@/lib/listening/types";

function syncCorrectAnswer(
  q: GeneratedListeningQuestion,
  finalTime: string
): number {
  const idx = indexOfTimeInChoices(q.choices, finalTime);
  return idx >= 0 ? idx + 1 : q.correct_answer;
}

export function fixType6Question(
  q: GeneratedListeningQuestion,
  typeId: number
): GeneratedListeningQuestion {
  if (typeId !== 6) return q;

  const final_time = normalizeTimeLabel(
    q.final_time?.trim() ||
      q.choices[q.correct_answer - 1]?.trim() ||
      ""
  );

  const mentioned_times = normalizeMentionedTimes(q.mentioned_times);

  const time_question_target = q.time_question_target?.trim() ?? "";

  const base: GeneratedListeningQuestion = {
    ...q,
    order_index: 6,
    question_type: TYPE6_QUESTION_TYPE,
    question_text: "",
    needs_image_choices: false,
    visual_choice_type: "none",
    choice_image_prompts: [],
    final_time,
    mentioned_times,
    time_question_target,
    script_text: q.script_text || buildScriptText(q.segments),
  };

  const correct_answer = final_time
    ? syncCorrectAnswer(base, final_time)
    : base.correct_answer;

  return { ...base, correct_answer };
}
