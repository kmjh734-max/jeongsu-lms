import type { ListeningGradeLevel } from "@/lib/listening/grade-level";
import { buildScriptText } from "@/lib/listening/script-text";
import {
  TYPE1_INSTRUCTION,
  TYPE1_QUESTION_TYPE,
} from "@/lib/listening/prompts/type1DescribePrompt";
import type { GeneratedListeningQuestion, ListeningScriptSegment } from "@/lib/listening/types";

/** 1번: 단일 화자(M/W) 담화만 */
function normalizeType1Segments(
  segments: ListeningScriptSegment[]
): ListeningScriptSegment[] {
  const spoken = segments.filter((s) => s.speaker === "M" || s.speaker === "W");
  if (spoken.length === 0) return segments;
  const primary = spoken[0]!.speaker;
  return spoken.filter((s) => s.speaker === primary);
}

export function fixType1Question(
  q: GeneratedListeningQuestion,
  typeId: number,
  gradeLevel?: ListeningGradeLevel
): GeneratedListeningQuestion {
  if (typeId !== 1) return q;
  if (gradeLevel === "middle2") return q;

  const segments = normalizeType1Segments(q.segments);
  const choice_image_prompts = Array.isArray(q.choice_image_prompts)
    ? q.choice_image_prompts.map((p) => String(p).trim()).slice(0, 5)
    : [];
  while (choice_image_prompts.length < 5) choice_image_prompts.push("");

  return {
    ...q,
    order_index: 1,
    question_type: TYPE1_QUESTION_TYPE,
    instruction: q.instruction?.trim() || TYPE1_INSTRUCTION,
    segments,
    script_text: buildScriptText(segments),
    question_text: "",
    needs_image_choices: true,
    choice_image_prompts,
  };
}
