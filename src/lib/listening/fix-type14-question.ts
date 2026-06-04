import { isMiddle1OnlyTypeFix } from "@/lib/listening/dialogue-type-ids";
import type { ListeningGradeLevel } from "@/lib/listening/grade-level";
import { buildScriptText } from "@/lib/listening/script-text";
import { TYPE14_QUESTION_TYPE } from "@/lib/listening/prompts/type14TablePrompt";
import {
  buildType14Instruction,
  choicesFromTableLabels,
  normalizeSourceFactsFromScript,
  normalizeType14TableData,
} from "@/lib/listening/type14-table-validation";
import type { GeneratedListeningQuestion } from "@/lib/listening/types";

export function fixType14Question(
  q: GeneratedListeningQuestion,
  typeId: number,
  gradeLevel?: ListeningGradeLevel
): GeneratedListeningQuestion {
  if (typeId !== 14) return q;
  if (isMiddle1OnlyTypeFix(14, gradeLevel)) return q;

  const table_data = normalizeType14TableData(q.table_data);
  const source_facts_from_script = normalizeSourceFactsFromScript(
    q.source_facts_from_script
  );

  const instruction =
    q.instruction?.trim() ||
    (table_data?.title
      ? buildType14Instruction(table_data.title)
      : "○○에 관한 다음 내용을 듣고, 표의 내용과 일치하지 않는 것을 고르시오.");

  const choices =
    q.choices.filter(Boolean).length >= 5
      ? q.choices
      : table_data
        ? choicesFromTableLabels(table_data)
        : q.choices;

  const correct_answer = table_data?.mismatch_no ?? q.correct_answer;
  const answer_clue =
    q.answer_clue?.trim() ||
    table_data?.mismatch_reason ||
    q.answer_clue;

  return {
    ...q,
    order_index: 14,
    question_type: TYPE14_QUESTION_TYPE,
    instruction,
    question_text: "",
    needs_image_choices: false,
    visual_choice_type: "table",
    choice_image_prompts: [],
    table_data,
    source_facts_from_script,
    choices,
    correct_answer,
    answer_clue,
    script_text: q.script_text || buildScriptText(q.segments),
  };
}

/** @deprecated fixType14Question 사용 */
export function fixTableQuestion(
  q: GeneratedListeningQuestion,
  typeId: number
): GeneratedListeningQuestion {
  return fixType14Question(q, typeId);
}
