/** 18번 직업 파악 선택지·직업 단서 검사 */

import {
  checkKoreanJobChoices,
  dreamJobMatchesChoice,
  indexOfJobInChoices,
  instructionMatchesTargetPerson,
  normalizeJobLabel,
  speakerCodeFromTarget,
  targetPersonLabel,
} from "@/lib/listening/type7-career-choices";

export interface DistractorJobEntry {
  job: string;
  reason: string;
}

const EXPLICIT_JOB_IDENTITY =
  /\b(?:I am|I'm|I work as|my job is|being a)\s+(?:a|an)?\s*[a-z]/i;

const AS_A_JOB =
  /\bas\s+(?:a|an)\s+(?:doctor|nurse|vet|veterinarian|chef|cook|photographer|writer|artist|firefighter|police|pilot|teacher|librarian|baker|hairdresser|journalist|scientist|pharmacist|coach|driver|mailman)\b/i;

const DREAM_JOB_PATTERN = /\bI want to be (?:a|an)\s+/i;

const VAGUE_CLUE =
  /^(?:can I help you|thank you|please wait|that sounds good|okay|sure|yes|no|good|great)[.!?,\s]*$/i;

const JOB_CLUE_INDICATORS = [
  /\b(?:check|examine|prescribe|medicine|patient|fever|throat|rest)\b/i,
  /\b(?:dog|cat|pet|animal|ears|teeth)\b/i,
  /\b(?:camera|picture|photo|smile|light|window)\b/i,
  /\b(?:library card|borrow|return|books|voice down)\b/i,
  /\b(?:oven|flour|butter|cookies|bread|cake|shelf)\b/i,
  /\b(?:fire|smoke|hose|alarm|building|stairs|elevator)\b/i,
  /\b(?:hair|wash|cut|chair|straight|curly|short)\b/i,
  /\b(?:stop|station|door|move to the back|get off)\b/i,
  /\b(?:soup|onions|sauce|salt|customers|dinner|cut)\b/i,
  /\b(?:ID|report|happened|find your bag)\b/i,
  /\b(?:give him|twice a day|bring him back)\b/i,
];

export function buildType18Instruction(targetPerson: string): string {
  const who = targetPersonLabel(targetPerson) ?? targetPerson.trim();
  if (!who) {
    return "대화를 듣고, ○○의 직업으로 가장 적절한 것을 고르시오.";
  }
  return `대화를 듣고, ${who}의 직업으로 가장 적절한 것을 고르시오.`;
}

export function scriptDirectlyNamesJob(script: string): boolean {
  if (EXPLICIT_JOB_IDENTITY.test(script)) return true;
  return AS_A_JOB.test(script);
}

export function scriptHasDreamJobAspiration(script: string): boolean {
  return DREAM_JOB_PATTERN.test(script);
}

export function segmentHasJobClue(text: string): boolean {
  return JOB_CLUE_INDICATORS.some((p) => p.test(text));
}

export function countJobCluesForSpeaker(
  segments: Array<{ speaker: string; text: string }>,
  speaker: "M" | "W"
): number {
  return segments
    .filter((s) => s.speaker === speaker)
    .filter((s) => segmentHasJobClue(s.text)).length;
}

export function targetPersonHasEnoughJobClues(
  segments: Array<{ speaker: string; text: string }>,
  targetPerson: string,
  jobClues: string[]
): boolean {
  const speaker = speakerCodeFromTarget(targetPerson);
  const clueCount =
    jobClues.length >= 2
      ? jobClues.length
      : speaker
        ? countJobCluesForSpeaker(segments, speaker)
        : 0;
  return clueCount >= 2;
}

export function answerClueHasJobInference(clue: string): boolean {
  const parts = clue
    .split(/[/|]/)
    .map((s) => s.trim())
    .filter(Boolean);
  const candidates = parts.length > 0 ? parts : [clue.trim()];
  const valid = candidates.filter(
    (c) => c.length >= 8 && !VAGUE_CLUE.test(c)
  );
  if (valid.length >= 2) return true;
  return valid.some((c) => segmentHasJobClue(c) || c.length >= 20);
}

export function normalizeJobClues(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((x) => String(x).trim()).filter(Boolean);
}

export function normalizeDistractorJobs(raw: unknown): DistractorJobEntry[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const o = item as Record<string, unknown>;
      const job = String(o.job ?? "").trim();
      const reason = String(o.reason ?? "").trim();
      if (!job) return null;
      return { job, reason: reason || "오답 직업" };
    })
    .filter((x): x is DistractorJobEntry => x !== null);
}

export function targetJobMatchesChoice(
  targetJob: string,
  choices: string[],
  correctIndex: number
): boolean {
  return dreamJobMatchesChoice(targetJob, choices, correctIndex);
}

export function validateType18JobFields(q: {
  instruction: string;
  choices: string[];
  correct_answer: number;
  answer_clue: string;
  script_text: string;
  target_person?: string;
  target_job?: string;
  job_clues?: string[];
  distractor_jobs?: DistractorJobEntry[];
  segments: Array<{ speaker: string; text: string }>;
}): { ok: boolean; issues: string[] } {
  const issues: string[] = [];
  const target = q.target_person?.trim() ?? "";
  const job = q.target_job?.trim() ?? "";
  const script = q.script_text?.trim() || q.segments.map((s) => s.text).join(" ");

  if (!/직업/.test(q.instruction)) {
    issues.push("지시문이 직업 파악 유형에 맞지 않을 수 있습니다.");
  }

  if (!target) {
    issues.push("target_person(대상 인물)이 필요합니다.");
  } else if (!instructionMatchesTargetPerson(q.instruction, target)) {
    issues.push("지시문과 target_person(대상)이 일치하지 않습니다.");
  }

  if (script && scriptDirectlyNamesJob(script)) {
    issues.push("대본에서 직업명을 직접 말하면 안 됩니다.");
  }

  if (script && scriptHasDreamJobAspiration(script)) {
    issues.push('대본에 "I want to be a/an ..."(7번 장래 희망)이 있으면 안 됩니다.');
  }

  const clues = q.job_clues ?? [];
  if (clues.length < 2) {
    issues.push("job_clues에 직업 추론 단서가 2개 이상 필요합니다.");
  }

  if (
    target &&
    !targetPersonHasEnoughJobClues(q.segments, target, clues)
  ) {
    issues.push("target_person 화자의 직업 단서가 2개 이상 필요합니다.");
  }

  if (!job) {
    issues.push("target_job(정답 직업)이 필요합니다.");
  } else if (!targetJobMatchesChoice(job, q.choices, q.correct_answer)) {
    issues.push("target_job과 correct_answer 선택지가 일치하지 않습니다.");
  }

  if (!q.answer_clue?.trim()) {
    issues.push("answer_clue가 필요합니다.");
  } else if (!answerClueHasJobInference(q.answer_clue)) {
    issues.push("answer_clue에 직업 추론 단서 문장 2개 이상이 필요합니다.");
  }

  const distractors = q.distractor_jobs ?? [];
  if (distractors.length < 1) {
    issues.push("distractor_jobs에 오답 직업 설명이 1개 이상 필요합니다.");
  }

  return { ok: issues.length === 0, issues };
}

export {
  checkKoreanJobChoices,
  indexOfJobInChoices,
  instructionMatchesTargetPerson,
  normalizeJobLabel,
  speakerCodeFromTarget,
  targetPersonLabel,
};
