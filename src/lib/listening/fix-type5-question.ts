import { isMiddle1OnlyTypeFix } from "@/lib/listening/dialogue-type-ids";
import type { ListeningGradeLevel } from "@/lib/listening/grade-level";
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
  typeId: number,
  gradeLevel?: ListeningGradeLevel
): GeneratedListeningQuestion {
  if (typeId !== 5) return q;
  if (isMiddle1OnlyTypeFix(5, gradeLevel)) return q;

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

  // 선택지를 이미 섞어 두었으면(정답 위치 분산) 그 순서를 지키고 plan 번호를 맞춘다.
  // 예전에는 plan 순서로 되돌려 정답(참가비)이 60문항 중 57번 ⑤에 놓였다.
  const reordered = plan ? planFollowingChoiceOrder(plan, q.choices) : null;
  const finalPlan = reordered ?? plan;
  const choices = reordered ? q.choices.map((c) => c.trim()) : plan ? choicesFromPlan(plan) : q.choices;
  const correct_answer = finalPlan?.unmentioned_no ?? q.correct_answer;

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
    mention_plan: finalPlan ?? q.mention_plan,
  };
}

/** 선택지가 plan 항목과 같은 글자들의 다른 순서면, 선택지 순서대로 번호를 다시 매긴 plan (아니면 null) */
function planFollowingChoiceOrder(plan: MentionPlan, choices: string[]): MentionPlan | null {
  const labels = choices.map((c) => c.trim());
  if (labels.length !== plan.choice_items.length) return null;
  const items: MentionPlan["choice_items"] = [];
  for (let i = 0; i < labels.length; i++) {
    const item = plan.choice_items.find((it) => it.label === labels[i]);
    if (!item) return null;
    items.push({ ...item, no: i + 1 });
  }
  if (new Set(items.map((i) => i.label)).size !== items.length) return null;
  const unmentioned =
    items.find((i) => i.label === plan.unmentioned_label) ?? items.find((i) => !i.mentioned);
  if (!unmentioned) return null;
  return {
    ...plan,
    choice_items: items,
    unmentioned_no: unmentioned.no,
    unmentioned_label: unmentioned.label,
  };
}
