import { buildScriptText } from "@/lib/listening/script-text";
import { TYPE18_QUESTION_TYPE } from "@/lib/listening/prompts/type18JobPrompt";
import {
  buildType18Instruction,
  countJobCluesForSpeaker,
  indexOfJobInChoices,
  normalizeDistractorJobs,
  normalizeJobClues,
  normalizeJobLabel,
  speakerCodeFromTarget,
  targetPersonLabel,
} from "@/lib/listening/type18-job-choices";
import type { GeneratedListeningQuestion } from "@/lib/listening/types";

function resolveTargetPerson(q: GeneratedListeningQuestion): string {
  if (q.target_person?.trim()) {
    return targetPersonLabel(q.target_person) ?? q.target_person.trim();
  }
  const mClues = countJobCluesForSpeaker(q.segments, "M");
  const wClues = countJobCluesForSpeaker(q.segments, "W");
  if (mClues > wClues) return "남자";
  if (wClues > mClues) return "여자";
  if (q.instruction.includes("남자")) return "남자";
  if (q.instruction.includes("여자")) return "여자";
  return "남자";
}

function instructionMatches(
  instruction: string,
  targetPerson: string
): boolean {
  const who = targetPersonLabel(targetPerson) ?? targetPerson;
  return instruction.includes(who) && /직업/.test(instruction);
}

export function fixType18Question(
  q: GeneratedListeningQuestion,
  typeId: number
): GeneratedListeningQuestion {
  if (typeId !== 18) return q;

  const target_person = resolveTargetPerson(q);
  const target_job = normalizeJobLabel(
    q.target_job?.trim() || q.choices[q.correct_answer - 1]?.trim() || ""
  );
  const job_clues = normalizeJobClues(q.job_clues);
  const distractor_jobs = normalizeDistractorJobs(q.distractor_jobs);

  const instruction =
    q.instruction?.trim() && instructionMatches(q.instruction, target_person)
      ? q.instruction
      : buildType18Instruction(target_person);

  const base: GeneratedListeningQuestion = {
    ...q,
    order_index: 18,
    question_type: TYPE18_QUESTION_TYPE,
    instruction,
    question_text: "",
    needs_image_choices: false,
    visual_choice_type: "none",
    choice_image_prompts: [],
    target_person,
    target_job,
    job_clues,
    distractor_jobs,
    script_text: q.script_text || buildScriptText(q.segments),
  };

  const idx = target_job ? indexOfJobInChoices(base.choices, target_job) : -1;
  const correct_answer = idx >= 0 ? idx + 1 : base.correct_answer;

  const speaker = speakerCodeFromTarget(target_person);
  if (speaker && job_clues.length < 2) {
    const fromSegments = base.segments
      .filter((s) => s.speaker === speaker && s.text.trim())
      .map((s) => s.text.trim())
      .slice(-3);
    if (fromSegments.length >= 2) {
      base.job_clues = fromSegments;
    }
  }

  return { ...base, correct_answer };
}
