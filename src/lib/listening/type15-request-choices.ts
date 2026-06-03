/** 15번 부탁한 일 선택지·부탁 표현 검사 */

import { targetPersonLabel } from "@/lib/listening/type7-career-choices";
import {
  actionMatchesChoice,
  checkKoreanActionChoices,
  indexOfActionInChoices,
  normalizeActionLabel,
  normalizeMentionedActions,
  type MentionedActionEntry,
} from "@/lib/listening/type9-action-choices";

export type { MentionedActionEntry };

const REQUEST_PATTERN =
  /\b(?:can|could|would)\s+you\b|\bplease\b/i;

const SUGGESTION_PATTERN =
  /\bwhy don'?t we\b|\bhow about\b|\blet'?s\b/i;

export function buildType15Instruction(
  requester: string,
  requestedPerson: string
): string {
  const who = targetPersonLabel(requester) ?? requester.trim();
  const to = targetPersonLabel(requestedPerson) ?? requestedPerson.trim();
  if (!who || !to) {
    return "대화를 듣고, ○○가 ○○에게 부탁한 일로 가장 적절한 것을 고르시오.";
  }
  return `대화를 듣고, ${who}가 ${to}에게 부탁한 일로 가장 적절한 것을 고르시오.`;
}

export function instructionMatchesRequester(
  instruction: string,
  requester: string
): boolean {
  const who = targetPersonLabel(requester);
  if (!who || !instruction.trim()) return true;
  return instruction.includes(who);
}

export function instructionMatchesRequestedPerson(
  instruction: string,
  requestedPerson: string
): boolean {
  const to = targetPersonLabel(requestedPerson);
  if (!to || !instruction.trim()) return true;
  return instruction.includes(`${to}에게`) || instruction.includes(to);
}

export function findRequestSpeaker(
  segments: Array<{ speaker: string; text: string }>
): "M" | "W" | null {
  for (let i = segments.length - 1; i >= 0; i--) {
    const seg = segments[i]!;
    if (seg.speaker !== "M" && seg.speaker !== "W") continue;
    if (REQUEST_PATTERN.test(seg.text) && !isSuggestionOnly(seg.text)) {
      return seg.speaker;
    }
  }
  return null;
}

export function isSuggestionOnly(text: string): boolean {
  return SUGGESTION_PATTERN.test(text) && !REQUEST_PATTERN.test(text);
}

export function scriptHasRequestExpression(script: string): boolean {
  return REQUEST_PATTERN.test(script);
}

export function scriptCenteredOnSuggestion(script: string): boolean {
  const lines = script.split(/[.!?]/).filter((l) => l.trim());
  const suggestionLines = lines.filter((l) => SUGGESTION_PATTERN.test(l));
  const requestLines = lines.filter(
    (l) => REQUEST_PATTERN.test(l) && !isSuggestionOnly(l)
  );
  return suggestionLines.length > requestLines.length && requestLines.length === 0;
}

export function answerClueHasRequest(clue: string): boolean {
  const c = clue.trim();
  if (!c || !REQUEST_PATTERN.test(c)) return false;
  if (isSuggestionOnly(c) && !REQUEST_PATTERN.test(c)) return false;
  return true;
}

export function speakerToPersonLabel(speaker: "M" | "W"): "남자" | "여자" {
  return speaker === "M" ? "남자" : "여자";
}

export function personLabelToSpeaker(person: string): "M" | "W" | null {
  const p = targetPersonLabel(person);
  if (p === "남자") return "M";
  if (p === "여자") return "W";
  return null;
}

export function validateType15RequestFields(q: {
  instruction: string;
  choices: string[];
  correct_answer: number;
  answer_clue: string;
  requester?: string;
  requested_person?: string;
  requested_action?: string;
  request_expression?: string;
  mentioned_actions?: MentionedActionEntry[];
  segments: Array<{ speaker: string; text: string }>;
}): { ok: boolean; issues: string[] } {
  const issues: string[] = [];
  const requester = q.requester?.trim() ?? "";
  const requested = q.requested_person?.trim() ?? "";
  const action = q.requested_action?.trim() ?? "";

  if (!/부탁한\s*일|부탁한/.test(q.instruction)) {
    issues.push("지시문이 부탁한 일 파악 유형에 맞지 않을 수 있습니다.");
  }

  if (!requester) {
    issues.push("requester(부탁한 사람)이 필요합니다.");
  } else if (!instructionMatchesRequester(q.instruction, requester)) {
    issues.push("지시문과 requester(부탁한 사람)가 일치하지 않습니다.");
  }

  if (!requested) {
    issues.push("requested_person(부탁받은 사람)이 필요합니다.");
  } else if (!instructionMatchesRequestedPerson(q.instruction, requested)) {
    issues.push("지시문과 requested_person(부탁받은 사람)가 일치하지 않습니다.");
  }

  if (!action) {
    issues.push("requested_action(부탁한 일)이 필요합니다.");
  } else if (!actionMatchesChoice(action, q.choices, q.correct_answer)) {
    issues.push("requested_action과 correct_answer 선택지가 일치하지 않습니다.");
  }

  const script = q.segments.map((s) => s.text).join(" ");
  if (script && !scriptHasRequestExpression(script)) {
    issues.push("대본에 Can you / Could you / Would you 부탁 표현이 필요합니다.");
  }

  if (script && scriptCenteredOnSuggestion(script)) {
    issues.push("대본이 제안(Why don't we / Let's) 중심이면 안 됩니다.");
  }

  const reqSpeaker = findRequestSpeaker(q.segments);
  const requesterSpeaker = personLabelToSpeaker(requester);
  if (reqSpeaker && requesterSpeaker && reqSpeaker !== requesterSpeaker) {
    issues.push("부탁 표현을 말한 화자와 requester가 일치하지 않습니다.");
  }

  if (q.request_expression?.trim() && !REQUEST_PATTERN.test(q.request_expression)) {
    issues.push("request_expression에 부탁 표현이 포함되어야 합니다.");
  }

  if (!q.answer_clue?.trim()) {
    issues.push("answer_clue가 필요합니다.");
  } else if (!answerClueHasRequest(q.answer_clue)) {
    issues.push("answer_clue에 Can/Could/Would you 부탁 문장이 필요합니다.");
  }

  const mentioned = q.mentioned_actions ?? [];
  if (mentioned.length < 1) {
    issues.push("mentioned_actions에 맥락/오답 행동이 1개 이상 필요합니다.");
  }

  return { ok: issues.length === 0, issues };
}

export {
  actionMatchesChoice,
  checkKoreanActionChoices,
  indexOfActionInChoices,
  normalizeActionLabel,
  normalizeMentionedActions,
};
