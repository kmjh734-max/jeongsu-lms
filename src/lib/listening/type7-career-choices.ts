/** 7번 장래 희망·직업 선택지 검사 */

const MOSTLY_ENGLISH = /^[A-Za-z0-9\s.,'"-]+$/;

/** 영어 직업 → 한국어 직업 (정답 매칭용) */
const ENGLISH_TO_KOREAN_JOB: Record<string, string> = {
  writer: "작가",
  vet: "수의사",
  veterinarian: "수의사",
  photographer: "사진작가",
  violinist: "바이올린 연주자",
  pianist: "피아노 연주자",
  singer: "가수",
  chef: "요리사",
  cook: "요리사",
  doctor: "의사",
  nurse: "간호사",
  pilot: "조종사",
  interpreter: "통역사",
  translator: "통역사",
  scientist: "과학자",
  programmer: "프로그래머",
  artist: "화가",
  dancer: "댄서",
  athlete: "운동선수",
  teacher: "선생님",
  journalist: "기자",
};

const ACTIVITY_NOT_JOB =
  /^(writing|reading|swimming|soccer|notebook|camera|music|stories)$/i;

export function normalizeJobLabel(label: string): string {
  return label.trim().replace(/\s+/g, "");
}

export function isKoreanJobChoice(choice: string): boolean {
  const t = choice.trim();
  if (!t) return false;
  if (ACTIVITY_NOT_JOB.test(t)) return false;
  if (MOSTLY_ENGLISH.test(t) && /[A-Za-z]{4,}/.test(t)) return false;
  if (/^[a-z]+\s+[a-z]+$/i.test(t) && !/[\u3131-\uD79D]/.test(t)) return false;
  return /[\u3131-\uD79D\uAC00-\uD7A3]/.test(t);
}

export function checkKoreanJobChoices(choices: string[]): {
  ok: boolean;
  message?: string;
} {
  const invalid = choices.filter((c) => c.trim() && !isKoreanJobChoice(c));
  if (invalid.length > 0) {
    return {
      ok: false,
      message: `한국어 직업명이 아닌 선택지: ${invalid.join(", ")}`,
    };
  }
  const normalized = choices.map((c) => normalizeJobLabel(c));
  const unique = new Set(normalized.filter(Boolean));
  if (unique.size < choices.filter((c) => c.trim()).length) {
    return { ok: false, message: "선택지에 같은 직업이 중복되었습니다." };
  }
  return { ok: true };
}

export function targetPersonLabel(person: string): "남자" | "여자" | null {
  const p = person.trim();
  if (p === "M" || p === "남자" || /남자/.test(p)) return "남자";
  if (p === "W" || p === "여자" || /여자/.test(p)) return "여자";
  return null;
}

export function instructionMatchesTargetPerson(
  instruction: string,
  targetPerson: string
): boolean {
  const who = targetPersonLabel(targetPerson);
  if (!who || !instruction.trim()) return true;
  if (who === "남자" && /남자/.test(instruction)) return true;
  if (who === "여자" && /여자/.test(instruction)) return true;
  return false;
}

export function speakerCodeFromTarget(targetPerson: string): "M" | "W" | null {
  const who = targetPersonLabel(targetPerson);
  if (who === "남자") return "M";
  if (who === "여자") return "W";
  return null;
}

export function findDreamJobSpeaker(
  segments: Array<{ speaker: string; text: string }>
): "M" | "W" | null {
  for (const seg of segments) {
    if (seg.speaker !== "M" && seg.speaker !== "W") continue;
    if (/I want to be (a|an) /i.test(seg.text)) {
      return seg.speaker;
    }
  }
  return null;
}

export function extractEnglishJobFromScript(scriptText: string): string | null {
  const m = scriptText.match(/I want to be (?:a|an) ([a-z]+(?:\s+[a-z]+)?)/i);
  return m?.[1]?.trim().toLowerCase() ?? null;
}

export function koreanJobFromEnglish(englishJob: string): string | null {
  const key = englishJob.toLowerCase().split(/\s+/)[0] ?? "";
  return ENGLISH_TO_KOREAN_JOB[key] ?? null;
}

export function dreamJobMatchesChoice(
  dreamJob: string,
  choices: string[],
  correctIndex: number
): boolean {
  const dream = normalizeJobLabel(dreamJob);
  const choice = normalizeJobLabel(choices[correctIndex - 1] ?? "");
  return !!dream && !!choice && dream === choice;
}

export function indexOfJobInChoices(choices: string[], job: string): number {
  const target = normalizeJobLabel(job);
  return choices.findIndex((c) => normalizeJobLabel(c) === target);
}

export function hasDreamJobInScript(scriptText: string): boolean {
  return /I want to be (a|an) /i.test(scriptText);
}

export function answerClueHasJob(answerClue: string, dreamJob: string): boolean {
  const clue = answerClue.toLowerCase();
  if (/I want to be/i.test(clue)) return true;
  const dream = dreamJob.trim();
  if (dream && answerClue.includes(dream)) return true;
  const eng = extractEnglishJobFromScript(answerClue);
  if (eng) {
    const ko = koreanJobFromEnglish(eng);
    if (ko && normalizeJobLabel(ko) === normalizeJobLabel(dreamJob)) return true;
  }
  return false;
}

export function normalizeInterestClues(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((x) => String(x).trim()).filter(Boolean);
}

export function validateType7CareerFields(q: {
  instruction: string;
  choices: string[];
  correct_answer: number;
  script_text: string;
  answer_clue: string;
  target_person?: string;
  dream_job?: string;
  interest_clues?: string[];
  segments: Array<{ speaker: string; text: string }>;
}): { ok: boolean; issues: string[] } {
  const issues: string[] = [];
  const target = q.target_person?.trim() ?? "";
  const dreamJob = q.dream_job?.trim() ?? "";

  if (!target) {
    issues.push("target_person(남자/여자)이 필요합니다.");
  } else if (!instructionMatchesTargetPerson(q.instruction, target)) {
    issues.push("지시문과 target_person이 일치하지 않습니다.");
  }

  const dreamSpeaker = findDreamJobSpeaker(q.segments);
  const expectedSpeaker = speakerCodeFromTarget(target);
  if (dreamSpeaker && expectedSpeaker && dreamSpeaker !== expectedSpeaker) {
    issues.push(
      "장래 희망을 말한 화자와 target_person(지시문 대상)이 일치하지 않습니다."
    );
  }

  if (!hasDreamJobInScript(q.script_text)) {
    issues.push('대본에 "I want to be a/an ..." 형태의 장래 희망이 필요합니다.');
  }

  if (!dreamJob) {
    issues.push("dream_job(정답 직업)이 필요합니다.");
  } else {
    if (!dreamJobMatchesChoice(dreamJob, q.choices, q.correct_answer)) {
      issues.push("dream_job과 correct_answer 선택지가 일치하지 않습니다.");
    }
    if (q.answer_clue.trim() && !answerClueHasJob(q.answer_clue, dreamJob)) {
      issues.push("answer_clue에 직업명이 들어간 문장이 필요합니다.");
    }
  }

  const clues = q.interest_clues ?? [];
  if (clues.length < 1) {
    issues.push("interest_clues에 관심사 단서가 1개 이상 필요합니다.");
  }

  return { ok: issues.length === 0, issues };
}
