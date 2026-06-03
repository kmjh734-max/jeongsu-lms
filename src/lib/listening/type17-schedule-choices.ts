/** 17번 특정 시점에 할 일 선택지·계획 검사 */

import {
  instructionMatchesTargetPerson,
  speakerCodeFromTarget,
  targetPersonLabel,
} from "@/lib/listening/type7-career-choices";
import {
  actionMatchesChoice,
  checkKoreanActionChoices,
  indexOfActionInChoices,
  normalizeActionLabel,
} from "@/lib/listening/type9-action-choices";

export interface MentionedOtherActionEntry {
  action: string;
  role: string;
}

const FINAL_PLAN_PATTERN =
  /\b(?:I'?m|We'?re|I am|We are)\s+going\s+to\b|\b(?:I'?ll|We'?ll|I will|We will)\b/i;

const CANCELED_PLAN_PATTERN =
  /\b(?:wanted|planned|thought)\s+to\b|\bwas\s+going\s+to\b|\bI'?d\s+like\s+to\b/i;

const TIME_KEYWORDS = [
  "오늘 오후",
  "오늘 방과 후",
  "오늘 저녁",
  "내일 아침",
  "내일",
  "이번 토요일",
  "이번 일요일",
  "이번 주말",
  "겨울 방학",
  "다음 금요일",
];

export function buildType17Instruction(
  targetPerson: string,
  targetTime: string
): string {
  const who = targetPersonLabel(targetPerson) ?? targetPerson.trim();
  const time = targetTime.trim() || "이번 주말";
  if (!who) {
    return "대화를 듣고, ○○가 ○○에 할 일로 가장 적절한 것을 고르시오.";
  }
  return `대화를 듣고, ${who}가 ${time}에 할 일로 가장 적절한 것을 고르시오.`;
}

export function instructionContainsTargetTime(
  instruction: string,
  targetTime: string
): boolean {
  const time = targetTime.trim();
  if (!time || !instruction.trim()) return true;
  return instruction.includes(time) || instruction.includes(`${time}에`);
}

export function extractTargetTimeFromInstruction(instruction: string): string {
  const m = instruction.match(/(?:남자|여자)가\s*(.+?)에\s*할\s*일/);
  if (m?.[1]?.trim()) return m[1].trim();
  for (const kw of TIME_KEYWORDS) {
    if (instruction.includes(kw)) return kw;
  }
  return "이번 주말";
}

export function looksLikeCanceledPlan(text: string): boolean {
  const t = text.trim();
  if (!t) return false;
  if (/\bwas\s+going\s+to\b/i.test(t)) return true;
  if (/\b(?:wanted|planned|thought)\s+to\b/i.test(t)) return true;
  if (/\bI'?d\s+like\s+to\b/i.test(t)) return true;
  return false;
}

export function hasFinalPlanExpression(text: string): boolean {
  return FINAL_PLAN_PATTERN.test(text);
}

export function findPlannedActionSpeaker(
  segments: Array<{ speaker: string; text: string }>
): "M" | "W" | null {
  for (let i = segments.length - 1; i >= 0; i--) {
    const seg = segments[i]!;
    if (seg.speaker !== "M" && seg.speaker !== "W") continue;
    if (hasFinalPlanExpression(seg.text) && !looksLikeCanceledPlan(seg.text)) {
      return seg.speaker;
    }
  }
  for (let i = segments.length - 1; i >= 0; i--) {
    const seg = segments[i]!;
    if (seg.speaker !== "M" && seg.speaker !== "W") continue;
    if (hasFinalPlanExpression(seg.text)) return seg.speaker;
  }
  return null;
}

export function answerClueHasPlannedAction(clue: string): boolean {
  const parts = clue
    .split(/[/|]/)
    .map((s) => s.trim())
    .filter(Boolean);
  const candidates = parts.length > 0 ? parts : [clue.trim()];
  return candidates.some(
    (part) => hasFinalPlanExpression(part) && !looksLikeCanceledPlan(part)
  );
}

export function answerClueLooksLikeCanceledPlan(clue: string): boolean {
  const parts = clue
    .split(/[/|]/)
    .map((s) => s.trim())
    .filter(Boolean);
  const candidates = parts.length > 0 ? parts : [clue.trim()];
  return candidates.every(
    (part) => !hasFinalPlanExpression(part) || looksLikeCanceledPlan(part)
  );
}

export function scriptHasFinalPlan(script: string): boolean {
  const sentences = script.split(/[.!?]/).filter((s) => s.trim());
  return sentences.some(
    (s) => hasFinalPlanExpression(s) && !looksLikeCanceledPlan(s)
  );
}

export function normalizeMentionedOtherActions(
  raw: unknown
): MentionedOtherActionEntry[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const o = item as Record<string, unknown>;
      const action = String(o.action ?? "").trim();
      const role = String(o.role ?? "").trim();
      if (!action) return null;
      return { action, role: role || "original_plan_or_distractor" };
    })
    .filter((x): x is MentionedOtherActionEntry => x !== null);
}

export function validateType17ScheduleFields(q: {
  instruction: string;
  choices: string[];
  correct_answer: number;
  answer_clue: string;
  target_person?: string;
  target_time?: string;
  planned_action?: string;
  mentioned_other_actions?: MentionedOtherActionEntry[];
  segments: Array<{ speaker: string; text: string }>;
}): { ok: boolean; issues: string[] } {
  const issues: string[] = [];
  const target = q.target_person?.trim() ?? "";
  const time = q.target_time?.trim() ?? "";
  const action = q.planned_action?.trim() ?? "";

  if (!/할\s*일/.test(q.instruction)) {
    issues.push("지시문이 특정 시점에 할 일 파악 유형에 맞지 않을 수 있습니다.");
  }

  if (!target) {
    issues.push("target_person(대상 인물)이 필요합니다.");
  } else if (!instructionMatchesTargetPerson(q.instruction, target)) {
    issues.push("지시문과 target_person(대상)이 일치하지 않습니다.");
  }

  if (!time) {
    issues.push("target_time(질문 시점)이 필요합니다.");
  } else if (!instructionContainsTargetTime(q.instruction, time)) {
    issues.push("지시문과 target_time(시점)이 일치하지 않습니다.");
  }

  if (!action) {
    issues.push("planned_action(실제 할 일)이 필요합니다.");
  } else if (!actionMatchesChoice(action, q.choices, q.correct_answer)) {
    issues.push("planned_action과 correct_answer 선택지가 일치하지 않습니다.");
  }

  const script = q.segments.map((s) => s.text).join(" ");
  if (script && !scriptHasFinalPlan(script)) {
    issues.push(
      "대본에 I'm going to / We will 등 최종 계획 표현이 필요합니다."
    );
  }

  const planSpeaker = findPlannedActionSpeaker(q.segments);
  const expectedSpeaker = speakerCodeFromTarget(target);
  if (planSpeaker && expectedSpeaker && planSpeaker !== expectedSpeaker) {
    issues.push("최종 계획을 말한 화자와 target_person이 일치하지 않습니다.");
  }

  if (!q.answer_clue?.trim()) {
    issues.push("answer_clue가 필요합니다.");
  } else if (answerClueLooksLikeCanceledPlan(q.answer_clue)) {
    issues.push(
      "answer_clue가 취소된 원래 계획(wanted/planned/was going to)이면 안 됩니다."
    );
  } else if (!answerClueHasPlannedAction(q.answer_clue)) {
    issues.push(
      "answer_clue에 I'm going to / We will 최종 계획 문장이 필요합니다."
    );
  }

  const mentioned = q.mentioned_other_actions ?? [];
  if (mentioned.length < 1) {
    issues.push(
      "mentioned_other_actions에 원래 계획/오답 활동이 1개 이상 필요합니다."
    );
  }

  return { ok: issues.length === 0, issues };
}

export {
  actionMatchesChoice,
  checkKoreanActionChoices,
  indexOfActionInChoices,
  normalizeActionLabel,
};
