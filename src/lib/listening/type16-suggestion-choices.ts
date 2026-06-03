/** 16번 제안한 것 선택지·제안 표현 검사 */

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

const SUGGESTION_PATTERN =
  /\bwhy don'?t (?:we|you)\b|\bhow about\b|\blet'?s\b|\bmaybe (?:we|you) can\b|\byou should\b|\bwe can\b|\bit would be good to\b|\bi think you should\b/i;

const REQUEST_PATTERN =
  /\b(?:can|could|would)\s+you\b/i;

export function buildType16Instruction(
  suggester: string,
  suggestedTo: string
): string {
  const who = targetPersonLabel(suggester) ?? suggester.trim();
  const to = targetPersonLabel(suggestedTo) ?? suggestedTo.trim();
  if (!who || !to) {
    return "대화를 듣고, ○○가 ○○에게 제안한 것으로 가장 적절한 것을 고르시오.";
  }
  return `대화를 듣고, ${who}가 ${to}에게 제안한 것으로 가장 적절한 것을 고르시오.`;
}

export function instructionMatchesSuggester(
  instruction: string,
  suggester: string
): boolean {
  const who = targetPersonLabel(suggester);
  if (!who || !instruction.trim()) return true;
  return instruction.includes(who);
}

export function instructionMatchesSuggestedTo(
  instruction: string,
  suggestedTo: string
): boolean {
  const to = targetPersonLabel(suggestedTo);
  if (!to || !instruction.trim()) return true;
  return instruction.includes(`${to}에게`) || instruction.includes(to);
}

export function findSuggestionSpeaker(
  segments: Array<{ speaker: string; text: string }>
): "M" | "W" | null {
  for (let i = segments.length - 1; i >= 0; i--) {
    const seg = segments[i]!;
    if (seg.speaker !== "M" && seg.speaker !== "W") continue;
    if (SUGGESTION_PATTERN.test(seg.text) && !isRequestOnly(seg.text)) {
      return seg.speaker;
    }
  }
  return null;
}

export function isRequestOnly(text: string): boolean {
  return REQUEST_PATTERN.test(text) && !SUGGESTION_PATTERN.test(text);
}

export function scriptHasSuggestionExpression(script: string): boolean {
  return SUGGESTION_PATTERN.test(script);
}

export function scriptCenteredOnRequest(script: string): boolean {
  const lines = script.split(/[.!?]/).filter((l) => l.trim());
  const requestLines = lines.filter((l) => REQUEST_PATTERN.test(l));
  const suggestionLines = lines.filter(
    (l) => SUGGESTION_PATTERN.test(l) && !isRequestOnly(l)
  );
  return requestLines.length > suggestionLines.length && suggestionLines.length === 0;
}

export function answerClueHasSuggestion(clue: string): boolean {
  const c = clue.trim();
  if (!c || !SUGGESTION_PATTERN.test(c)) return false;
  if (isRequestOnly(c) && !SUGGESTION_PATTERN.test(c)) return false;
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

export function validateType16SuggestionFields(q: {
  instruction: string;
  choices: string[];
  correct_answer: number;
  answer_clue: string;
  suggester?: string;
  suggested_to?: string;
  suggested_action?: string;
  suggestion_expression?: string;
  mentioned_actions?: MentionedActionEntry[];
  segments: Array<{ speaker: string; text: string }>;
}): { ok: boolean; issues: string[] } {
  const issues: string[] = [];
  const suggester = q.suggester?.trim() ?? "";
  const suggestedTo = q.suggested_to?.trim() ?? "";
  const action = q.suggested_action?.trim() ?? "";

  if (!/제안한\s*것|제안한/.test(q.instruction)) {
    issues.push("지시문이 제안한 것 파악 유형에 맞지 않을 수 있습니다.");
  }

  if (!suggester) {
    issues.push("suggester(제안한 사람)이 필요합니다.");
  } else if (!instructionMatchesSuggester(q.instruction, suggester)) {
    issues.push("지시문과 suggester(제안한 사람)가 일치하지 않습니다.");
  }

  if (!suggestedTo) {
    issues.push("suggested_to(제안받은 사람)이 필요합니다.");
  } else if (!instructionMatchesSuggestedTo(q.instruction, suggestedTo)) {
    issues.push("지시문과 suggested_to(제안받은 사람)가 일치하지 않습니다.");
  }

  if (!action) {
    issues.push("suggested_action(제안한 내용)이 필요합니다.");
  } else if (!actionMatchesChoice(action, q.choices, q.correct_answer)) {
    issues.push("suggested_action과 correct_answer 선택지가 일치하지 않습니다.");
  }

  const script = q.segments.map((s) => s.text).join(" ");
  if (script && !scriptHasSuggestionExpression(script)) {
    issues.push(
      "대본에 Why don't / How about / Let's / Maybe you can 제안 표현이 필요합니다."
    );
  }

  if (script && scriptCenteredOnRequest(script)) {
    issues.push("대본이 부탁(Can/Could/Would you) 중심이면 안 됩니다.");
  }

  const sugSpeaker = findSuggestionSpeaker(q.segments);
  const suggesterSpeaker = personLabelToSpeaker(suggester);
  if (sugSpeaker && suggesterSpeaker && sugSpeaker !== suggesterSpeaker) {
    issues.push("제안 표현을 말한 화자와 suggester가 일치하지 않습니다.");
  }

  if (
    q.suggestion_expression?.trim() &&
    !SUGGESTION_PATTERN.test(q.suggestion_expression)
  ) {
    issues.push("suggestion_expression에 제안 표현이 포함되어야 합니다.");
  }

  if (!q.answer_clue?.trim()) {
    issues.push("answer_clue가 필요합니다.");
  } else if (!answerClueHasSuggestion(q.answer_clue)) {
    issues.push("answer_clue에 Why don't / How about / Let's 제안 문장이 필요합니다.");
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
