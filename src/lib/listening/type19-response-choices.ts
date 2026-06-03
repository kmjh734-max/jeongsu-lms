/** 19번 응답 고르기 선택지·맥락 검사 */

export interface DistractorReasonEntry {
  choice: string;
  reason: string;
}

export const TYPE19_END_SPEAKER = "W";
export const TYPE19_BLANK_SPEAKER = "M";

const TOO_GENERIC =
  /^(?:okay|ok|sure|yes|no|thank you|thanks|i see|right|good|great|fine|alright)[.!?,\s]*$/i;

const RESPONSE_FUNCTIONS = [
  "감사",
  "수락",
  "동의",
  "거절",
  "안도",
  "도움 제공",
  "정보 확인",
  "사과",
  "격려",
];

export function buildType19Instruction(): string {
  return "대화를 듣고, 여자의 마지막 말에 이어질 남자의 말로 가장 적절한 것을 고르시오.";
}

export function questionTextForBlankSpeaker(speaker: "M" | "W"): string {
  return speaker === "M"
    ? "Man: __________________________"
    : "Woman: __________________________";
}

export function blankSpeakerLabel(speaker: "M" | "W"): "남자" | "여자" {
  return speaker === "M" ? "남자" : "여자";
}

export function parseBlankSpeaker(raw: string): "M" | "W" | null {
  const s = raw.trim().toUpperCase();
  if (s === "M" || s === "남자" || /남/.test(raw)) return "M";
  if (s === "W" || s === "여자" || /여/.test(raw)) return "W";
  return null;
}

export function instructionMatchesBlankSpeaker(
  instruction: string,
  blankSpeaker: "M" | "W"
): boolean {
  if (!instruction.trim()) return true;
  const who = blankSpeakerLabel(blankSpeaker);
  if (!instruction.includes(who)) return false;
  if (blankSpeaker === "M") {
    return /여자.*마지막|여자의\s*마지막/.test(instruction);
  }
  return /남자.*마지막|남자의\s*마지막/.test(instruction);
}

export function questionTextMatchesBlankSpeaker(
  questionText: string,
  blankSpeaker: "M" | "W"
): boolean {
  const t = questionText.trim();
  if (!t.includes("______")) return false;
  if (blankSpeaker === "M") return /^Man\s*:/i.test(t);
  return /^Woman\s*:/i.test(t);
}

export function isTooGenericResponse(text: string): boolean {
  const t = text.trim();
  if (!t) return true;
  if (TOO_GENERIC.test(t)) return true;
  const words = t.split(/\s+/).filter(Boolean);
  if (words.length <= 2 && /^(okay|sure|yes|no|thanks?|right|good)$/i.test(words[0] ?? "")) {
    return true;
  }
  return false;
}

export function checkEnglishResponseChoices(choices: string[]): {
  ok: boolean;
  message?: string;
} {
  const invalid = choices.filter((c) => {
    const t = c.trim();
    if (!t) return true;
    if (/[가-힣]/.test(t)) return true;
    if (!/[A-Za-z]/.test(t)) return true;
    return false;
  });
  if (invalid.length > 0) {
    return {
      ok: false,
      message: `영어 응답 문장이 아닌 선택지: ${invalid.join(" | ")}`,
    };
  }
  const unique = new Set(choices.map((c) => c.trim().toLowerCase()));
  if (unique.size < choices.filter((c) => c.trim()).length) {
    return { ok: false, message: "선택지에 같은 응답이 중복되었습니다." };
  }
  return { ok: true };
}

export function previousTurnMatchesLastSegment(
  previousTurn: string,
  segments: Array<{ speaker: string; text: string }>
): boolean {
  const pt = previousTurn.trim();
  if (!pt) return false;
  const spoken = segments.filter((s) => s.text.trim() && !/_{2,}/.test(s.text));
  const last = spoken[spoken.length - 1];
  if (!last) return false;
  const label = last.speaker === "W" ? "W" : last.speaker === "M" ? "M" : "";
  const expected = `${label}: ${last.text}`.trim();
  return (
    pt === expected ||
    pt.endsWith(last.text.trim()) ||
    last.text.trim() === pt.replace(/^[MW]:\s*/i, "").trim()
  );
}

export function normalizeDistractorReasons(
  raw: unknown,
  choices: string[]
): DistractorReasonEntry[] {
  if (!Array.isArray(raw)) return [];
  const entries: DistractorReasonEntry[] = [];
  for (const item of raw) {
    if (typeof item === "string") {
      const reason = item.trim();
      if (reason) entries.push({ choice: "", reason });
      continue;
    }
    if (!item || typeof item !== "object") continue;
    const o = item as Record<string, unknown>;
    const choice = String(o.choice ?? "").trim();
    const reason = String(o.reason ?? "").trim();
    if (choice || reason) {
      entries.push({ choice, reason: reason || "오답" });
    }
  }
  if (entries.length >= choices.length) return entries.slice(0, 5);
  return entries;
}

export function distractorReasonsToStrings(
  entries: DistractorReasonEntry[],
  choices: string[]
): string[] {
  if (entries.length === 0) return [];
  return choices.map((choice, i) => {
    const match =
      entries.find(
        (e) =>
          e.choice.trim() &&
          e.choice.trim().toLowerCase() === choice.trim().toLowerCase()
      ) ?? entries[i];
    if (!match) return "";
    if (match.choice.trim()) {
      return match.reason.trim()
        ? `${match.choice}: ${match.reason}`
        : match.choice;
    }
    return match.reason.trim();
  });
}

export function validateType19ResponseFields(q: {
  instruction: string;
  question_text: string;
  choices: string[];
  correct_answer: number;
  answer_clue: string;
  previous_turn: string;
  blank_speaker?: string;
  correct_response_function?: string;
  distractor_reason?: string[];
  segments: Array<{ speaker: string; text: string }>;
}): { ok: boolean; issues: string[] } {
  const issues: string[] = [];
  const blank = parseBlankSpeaker(q.blank_speaker ?? TYPE19_BLANK_SPEAKER);

  if (!/응답|이어질/.test(q.instruction)) {
    issues.push("지시문이 응답 고르기 유형에 맞지 않을 수 있습니다.");
  }

  if (blank) {
    if (!instructionMatchesBlankSpeaker(q.instruction, blank)) {
      issues.push("지시문과 blank_speaker(빈칸 화자)가 일치하지 않습니다.");
    }
    if (!questionTextMatchesBlankSpeaker(q.question_text, blank)) {
      issues.push("question_text와 blank_speaker가 일치하지 않습니다.");
    }
  }

  const choiceCheck = checkEnglishResponseChoices(q.choices);
  if (!choiceCheck.ok) {
    issues.push(choiceCheck.message ?? "보기 형식 오류");
  }

  const correctChoice = q.choices[q.correct_answer - 1]?.trim() ?? "";
  if (correctChoice && isTooGenericResponse(correctChoice)) {
    issues.push("정답 응답이 너무 일반적입니다(Okay/Yes/Sure/Thank you 등).");
  }

  for (let i = 0; i < q.choices.length; i++) {
    if (i + 1 === q.correct_answer) continue;
    const c = q.choices[i]?.trim() ?? "";
    if (c && !isTooGenericResponse(c)) {
      // 오답이 너무 자연스러운지는 AI 검수에 맡기고, 명백히 짧은 것만 경고는 quality-check에서
    }
  }

  if (!q.previous_turn?.trim()) {
    issues.push("previous_turn(직전 발화)이 필요합니다.");
  } else if (!previousTurnMatchesLastSegment(q.previous_turn, q.segments)) {
    issues.push("previous_turn이 segments 마지막 발화와 일치하지 않습니다.");
  }

  const lastSpeaker = q.segments[q.segments.length - 1]?.speaker;
  if (lastSpeaker !== TYPE19_END_SPEAKER) {
    issues.push("19번은 마지막 segment 화자가 W(여자)여야 합니다.");
  }

  if (!q.correct_response_function?.trim()) {
    issues.push("correct_response_function(정답 응답 기능)이 필요합니다.");
  }

  const dr = q.distractor_reason ?? [];
  if (dr.filter(Boolean).length < 5) {
    issues.push("distractor_reason(오답 이유) 5개가 필요합니다.");
  }

  if (!q.answer_clue?.trim()) {
    issues.push("answer_clue가 필요합니다.");
  }

  return { ok: issues.length === 0, issues };
}

export function isValidResponseFunction(fn: string): boolean {
  const f = fn.trim();
  if (!f) return false;
  return RESPONSE_FUNCTIONS.some((r) => f.includes(r));
}
