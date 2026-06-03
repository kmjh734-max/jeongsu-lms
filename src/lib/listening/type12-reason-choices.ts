/** 12번 이유 파악 선택지 검사 */

import {
  instructionMatchesTargetPerson,
  speakerCodeFromTarget,
  targetPersonLabel,
} from "@/lib/listening/type7-career-choices";

export interface MentionedPossibleReason {
  reason: string;
  role: string;
}

const REASON_SUFFIX =
  /(하기\s*위해서|하려고|하기\s*위해|보러\s*가기\s*위해서|돕기\s*위해서)$/;

const PLACE_OR_NOUN_ONLY =
  /^(공원|시립\s*공원|도서관|체육관|학교|박물관|우체국|병원|동물\s*보호소|자전거|그림|봉사|곤충|책|친구)$/;

const MOSTLY_ENGLISH = /^[A-Za-z0-9\s.,'"-]+$/;

const VAGUE_REASON_CLUE =
  /^(?:I'?m|are you) going (?:there|to)|after lunch|near my house|twice a month|that sounds fun|the park is|going there/i;

const REASON_IN_CLUE =
  /(?:have to|need to|want to|going for|we'?ll|I help|plant|find|practice|feed|volunteer|presentation|because|to return|books for)/i;

export function normalizeReasonLabel(label: string): string {
  return label.trim().replace(/\s+/g, " ");
}

export function isKoreanReasonChoice(choice: string): boolean {
  const t = normalizeReasonLabel(choice);
  if (!t || t.length < 4) return false;
  if (MOSTLY_ENGLISH.test(t) && !/[\uAC00-\uD7A3]/.test(t)) return false;
  if (!/[\uAC00-\uD7A3]/.test(t)) return false;
  if (PLACE_OR_NOUN_ONLY.test(t.replace(/\s/g, ""))) return false;
  if (REASON_SUFFIX.test(t)) return true;
  if (/(찾기|반납|만나|연습|질문|찍기|붙이|입양|돌보|심기|타기|그리|관찰|봉사)/.test(t) && t.length >= 6) {
    return true;
  }
  return false;
}

export function checkKoreanReasonChoices(choices: string[]): {
  ok: boolean;
  message?: string;
} {
  const invalid = choices.filter((c) => c.trim() && !isKoreanReasonChoice(c));
  if (invalid.length > 0) {
    return {
      ok: false,
      message: `이유 표현이 아닌 선택지: ${invalid.join(", ")}`,
    };
  }
  const normalized = choices.map((c) => normalizeReasonLabel(c));
  const unique = new Set(normalized.filter(Boolean));
  if (unique.size < choices.filter((c) => c.trim()).length) {
    return { ok: false, message: "선택지에 같은 이유가 중복되었습니다." };
  }
  return { ok: true };
}

export function reasonMatchesChoice(
  reasonForGoing: string,
  choices: string[],
  correctIndex: number
): boolean {
  const target = normalizeReasonLabel(reasonForGoing);
  const choice = normalizeReasonLabel(choices[correctIndex - 1] ?? "");
  return !!target && !!choice && target === choice;
}

export function indexOfReasonInChoices(
  choices: string[],
  reason: string
): number {
  const target = normalizeReasonLabel(reason);
  return choices.findIndex((c) => normalizeReasonLabel(c) === target);
}

export function normalizeMentionedPossibleReasons(
  raw: unknown
): MentionedPossibleReason[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const o = item as Record<string, unknown>;
      const reason = String(o.reason ?? "").trim();
      const role = String(o.role ?? "").trim();
      if (!reason) return null;
      return {
        reason,
        role: role || "mentioned_but_not_answer",
      };
    })
    .filter((x): x is MentionedPossibleReason => x !== null);
}

export function buildType12Instruction(
  targetPerson: string,
  targetPlace: string
): string {
  const who = targetPersonLabel(targetPerson) ?? targetPerson.trim();
  const place = targetPlace.trim();
  if (!who || !place) {
    return "대화를 듣고, ○○가 ○○에 가는 이유로 가장 적절한 것을 고르시오.";
  }
  const particle = who === "여자" ? "여자가" : "남자가";
  return `대화를 듣고, ${particle} ${place}에 가는 이유로 가장 적절한 것을 고르시오.`;
}

export function instructionContainsTargetPlace(
  instruction: string,
  targetPlace: string
): boolean {
  const place = targetPlace.trim();
  if (!place || !instruction.trim()) return true;
  const core = place.replace(/\s/g, "");
  return instruction.replace(/\s/g, "").includes(core);
}

export function isVagueReasonClue(clue: string): boolean {
  const c = clue.trim();
  if (!c) return true;
  if (VAGUE_REASON_CLUE.test(c) && !REASON_IN_CLUE.test(c)) return true;
  if (!REASON_IN_CLUE.test(c) && !/(plant|find|practice|feed|volunteer|presentation|return|help)/i.test(c)) {
    return true;
  }
  return false;
}

export function findReasonSpeaker(
  segments: Array<{ speaker: string; text: string }>,
  targetPerson: string
): "M" | "W" | null {
  const code = speakerCodeFromTarget(targetPerson);
  if (!code) return null;

  const reasonPattern =
    /(?:have to|need to|want to|going for|we'?ll|I help|plant|find|practice|feed|volunteer|presentation|books for|return)/i;

  const targetLines = segments.filter((s) => s.speaker === code);
  if (targetLines.some((s) => reasonPattern.test(s.text))) {
    return code;
  }

  for (let i = segments.length - 1; i >= 0; i--) {
    const seg = segments[i]!;
    if (seg.speaker !== code) continue;
    if (reasonPattern.test(seg.text)) return code;
  }
  return null;
}

export function validateType12ReasonFields(q: {
  instruction: string;
  choices: string[];
  correct_answer: number;
  answer_clue: string;
  target_person?: string;
  target_place?: string;
  reason_for_going?: string;
  mentioned_possible_reasons?: MentionedPossibleReason[];
  segments: Array<{ speaker: string; text: string }>;
}): { ok: boolean; issues: string[] } {
  const issues: string[] = [];
  const target = q.target_person?.trim() ?? "";
  const place = q.target_place?.trim() ?? "";
  const reason = q.reason_for_going?.trim() ?? "";

  if (!/가는\s*이유|이유로/.test(q.instruction)) {
    issues.push("지시문이 이유 파악 유형에 맞지 않을 수 있습니다.");
  }

  if (!target) {
    issues.push("target_person(대상 인물)이 필요합니다.");
  } else if (
    q.instruction?.trim() &&
    !instructionMatchesTargetPerson(q.instruction, target)
  ) {
    issues.push("지시문과 target_person(대상)이 일치하지 않습니다.");
  }

  if (!place) {
    issues.push("target_place(목적 장소)이 필요합니다.");
  } else if (
    q.instruction?.trim() &&
    !instructionContainsTargetPlace(q.instruction, place)
  ) {
    issues.push("지시문과 target_place(장소)가 일치하지 않을 수 있습니다.");
  }

  if (!reason) {
    issues.push("reason_for_going(가는 이유)이 필요합니다.");
  } else {
    if (!isKoreanReasonChoice(reason)) {
      issues.push("reason_for_going가 한글 이유 표현이어야 합니다.");
    }
    if (!reasonMatchesChoice(reason, q.choices, q.correct_answer)) {
      issues.push("reason_for_going와 correct_answer 선택지가 일치하지 않습니다.");
    }
  }

  const mentioned = q.mentioned_possible_reasons ?? [];
  if (mentioned.length < 1) {
    issues.push("mentioned_possible_reasons에 오답 후보 이유가 1개 이상 필요합니다.");
  }

  if (target && !findReasonSpeaker(q.segments, target)) {
    issues.push("목표 인물의 발화에 가는 이유 단서가 충분하지 않습니다.");
  }

  if (!q.answer_clue?.trim()) {
    issues.push("answer_clue가 필요합니다.");
  } else if (isVagueReasonClue(q.answer_clue)) {
    issues.push("answer_clue가 장소에 가는 이유를 직접 보여주지 않습니다.");
  }

  return { ok: issues.length === 0, issues };
}

export {
  instructionMatchesTargetPerson,
  speakerCodeFromTarget,
  targetPersonLabel,
};
