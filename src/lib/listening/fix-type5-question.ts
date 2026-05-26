import { buildScriptText } from "@/lib/listening/script-text";
import { TYPE5_QUESTION_TYPE } from "@/lib/listening/prompts/type5UnmentionedPrompt";
import {
  normalizeMentionPlan,
  type MentionPlan,
} from "@/lib/listening/type5-mention-plan";
import type {
  GeneratedListeningQuestion,
  ListeningScriptSegment,
} from "@/lib/listening/types";

function normalizeType5Segments(
  segments: ListeningScriptSegment[]
): ListeningScriptSegment[] {
  const spoken = segments.filter((s) => s.speaker === "M" || s.speaker === "W");
  if (spoken.length === 0) return segments;
  const primary = spoken[0]!.speaker;
  return spoken.filter((s) => s.speaker === primary);
}

function primarySpeaker(segments: ListeningScriptSegment[]): "M" | "W" {
  const first = segments.find((s) => s.speaker === "M" || s.speaker === "W");
  return first?.speaker === "M" ? "M" : "W";
}

function speakerLabel(speaker: "M" | "W"): "남자" | "여자" {
  return speaker === "M" ? "남자" : "여자";
}

function instructionMatchesSpeaker(
  instruction: string,
  speaker: "M" | "W"
): boolean {
  const who = speakerLabel(speaker);
  if (who === "남자" && /남자/.test(instruction)) return true;
  if (who === "여자" && /여자/.test(instruction)) return true;
  return false;
}

function choicesFromPlan(plan: MentionPlan): string[] {
  return [...plan.choice_items]
    .sort((a, b) => a.no - b.no)
    .map((i) => i.label);
}

export function fixType5Question(
  q: GeneratedListeningQuestion,
  typeId: number
): GeneratedListeningQuestion {
  if (typeId !== 5) return q;

  const segments = normalizeType5Segments(q.segments);
  const speaker = primarySpeaker(segments);
  const plan =
    normalizeMentionPlan(q.mention_plan) ??
    (q.choices.length === 5
      ? normalizeMentionPlan({
          topic: "",
          unmentioned_no: q.correct_answer,
          unmentioned_label: q.choices[q.correct_answer - 1] ?? "",
          choice_items: q.choices.map((label, idx) => ({
            no: idx + 1,
            label,
            mentioned: idx + 1 !== q.correct_answer,
            evidence: "",
          })),
        })
      : null);

  const choices = plan ? choicesFromPlan(plan) : q.choices;
  const correct_answer = plan?.unmentioned_no ?? q.correct_answer;

  const instruction =
    q.instruction?.trim() && instructionMatchesSpeaker(q.instruction, speaker)
      ? q.instruction
      : q.instruction?.trim() || `다음을 듣고, ${speakerLabel(speaker)}가 ○○에 대해 언급하지 않은 것을 고르시오.`;

  return {
    ...q,
    order_index: 5,
    question_type: TYPE5_QUESTION_TYPE,
    instruction,
    segments,
    choices,
    correct_answer,
    script_text: buildScriptText(segments),
    question_text: "",
    needs_image_choices: false,
    visual_choice_type: "none",
    choice_image_prompts: [],
    mention_plan: plan ?? q.mention_plan,
  };
}
