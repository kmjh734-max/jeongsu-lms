import { buildScriptText } from "@/lib/listening/script-text";
import { TYPE7_QUESTION_TYPE } from "@/lib/listening/prompts/type7CareerPrompt";
import {
  findDreamJobSpeaker,
  indexOfJobInChoices,
  normalizeInterestClues,
  targetPersonLabel,
} from "@/lib/listening/type7-career-choices";
import type { GeneratedListeningQuestion } from "@/lib/listening/types";

function buildInstruction(targetPerson: string): string {
  const who = targetPersonLabel(targetPerson) ?? "여자";
  return `대화를 듣고, ${who}의 장래 희망으로 가장 적절한 것을 고르시오.`;
}

function resolveTargetPerson(q: GeneratedListeningQuestion): string {
  if (q.target_person?.trim()) {
    const label = targetPersonLabel(q.target_person);
    if (label) return label;
  }
  const dreamSpeaker = findDreamJobSpeaker(q.segments);
  if (dreamSpeaker === "M") return "남자";
  if (dreamSpeaker === "W") return "여자";
  if (q.instruction.includes("남자")) return "남자";
  if (q.instruction.includes("여자")) return "여자";
  return "여자";
}

export function fixType7Question(
  q: GeneratedListeningQuestion,
  typeId: number
): GeneratedListeningQuestion {
  if (typeId !== 7) return q;

  const target_person = resolveTargetPerson(q);
  const dream_job =
    q.dream_job?.trim() || q.choices[q.correct_answer - 1]?.trim() || "";
  const interest_clues = normalizeInterestClues(q.interest_clues);

  const instruction =
    q.instruction?.trim() &&
    /장래\s*희망/.test(q.instruction) &&
    ((target_person === "남자" && /남자/.test(q.instruction)) ||
      (target_person === "여자" && /여자/.test(q.instruction)))
      ? q.instruction
      : buildInstruction(target_person);

  const base: GeneratedListeningQuestion = {
    ...q,
    order_index: 7,
    question_type: TYPE7_QUESTION_TYPE,
    instruction,
    question_text: "",
    needs_image_choices: false,
    visual_choice_type: "none",
    choice_image_prompts: [],
    target_person,
    dream_job,
    interest_clues,
    script_text: q.script_text || buildScriptText(q.segments),
  };

  const jobIdx = dream_job ? indexOfJobInChoices(base.choices, dream_job) : -1;
  const correct_answer = jobIdx >= 0 ? jobIdx + 1 : base.correct_answer;

  return { ...base, correct_answer };
}
