/** 9번 대화 직후 행동 선택지 검사 */

import {
  instructionMatchesTargetPerson,
  speakerCodeFromTarget,
  targetPersonLabel,
} from "@/lib/listening/type7-career-choices";

export interface MentionedActionEntry {
  action: string;
  role: string;
}

const ACTION_SUFFIX = /(하기|가기|찾기|사기|전화하기|가져오기|만들기|확인하기|검색하기|신청하기|청소하기|붙이기|데리러\s*가기|열어주기|돌려주기|빌리기|마시기|접기|씻기|그리기|연습하기|끄기)$/;

const PLACE_OR_NOUN_ONLY =
  /^(도서관|인터넷|학교|교실|미술관|케이크|물병|돗자리|배터리|마이크|컴퓨터|선생님|친구)$/;

const IMMEDIATE_PATTERN =
  /\bI'?ll\b|\bI will\b/i;

const IMMEDIATE_TIMING =
  /\b(now|right now|right away|at once)\b/i;

export function normalizeActionLabel(label: string): string {
  return label.trim().replace(/\s+/g, " ");
}

export function isKoreanActionChoice(choice: string): boolean {
  const t = choice.trim();
  if (!t || t.length < 3) return false;
  if (/^[A-Za-z]/.test(t) && !/[\uAC00-\uD7A3]/.test(t)) return false;
  if (PLACE_OR_NOUN_ONLY.test(t.replace(/\s/g, ""))) return false;
  if (ACTION_SUFFIX.test(t)) return true;
  if (/[\uAC00-\uD7A3]/.test(t) && /(하기|가기|찾|사|전화|가져|만들|확인|검색|신청|데리|열어|돌려|빌|마시|접|씻|그리|연습|끄)/.test(t)) {
    return true;
  }
  return false;
}

export function checkKoreanActionChoices(choices: string[]): {
  ok: boolean;
  message?: string;
} {
  const invalid = choices.filter((c) => c.trim() && !isKoreanActionChoice(c));
  if (invalid.length > 0) {
    return {
      ok: false,
      message: `행동 표현이 아닌 선택지: ${invalid.join(", ")}`,
    };
  }
  const normalized = choices.map((c) => normalizeActionLabel(c));
  const unique = new Set(normalized.filter(Boolean));
  if (unique.size < choices.filter((c) => c.trim()).length) {
    return { ok: false, message: "선택지에 같은 행동이 중복되었습니다." };
  }
  return { ok: true };
}

export function actionMatchesChoice(
  immediateAction: string,
  choices: string[],
  correctIndex: number
): boolean {
  const target = normalizeActionLabel(immediateAction);
  const choice = normalizeActionLabel(choices[correctIndex - 1] ?? "");
  return !!target && !!choice && target === choice;
}

export function indexOfActionInChoices(
  choices: string[],
  action: string
): number {
  const target = normalizeActionLabel(action);
  return choices.findIndex((c) => normalizeActionLabel(c) === target);
}

export function normalizeMentionedActions(raw: unknown): MentionedActionEntry[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const o = item as Record<string, unknown>;
      const action = String(o.action ?? "").trim();
      const role = String(o.role ?? "").trim();
      if (!action) return null;
      return { action, role: role || "mentioned_but_not_immediate" };
    })
    .filter((x): x is MentionedActionEntry => x !== null);
}

export function findImmediateActionSpeaker(
  segments: Array<{ speaker: string; text: string }>
): "M" | "W" | null {
  for (let i = segments.length - 1; i >= 0; i--) {
    const seg = segments[i]!;
    if (seg.speaker !== "M" && seg.speaker !== "W") continue;
    if (IMMEDIATE_PATTERN.test(seg.text) && IMMEDIATE_TIMING.test(seg.text)) {
      return seg.speaker;
    }
  }
  for (let i = segments.length - 1; i >= 0; i--) {
    const seg = segments[i]!;
    if (seg.speaker !== "M" && seg.speaker !== "W") continue;
    if (IMMEDIATE_PATTERN.test(seg.text)) {
      return seg.speaker;
    }
  }
  return null;
}

export function targetPersonHasImmediateUtterance(
  segments: Array<{ speaker: string; text: string }>,
  targetPerson: string
): boolean {
  const code = speakerCodeFromTarget(targetPerson);
  if (!code) return false;
  const lines = segments.filter((s) => s.speaker === code).map((s) => s.text);
  return lines.some(
    (t) => IMMEDIATE_PATTERN.test(t) && (IMMEDIATE_TIMING.test(t) || /I'?ll go/i.test(t))
  );
}

export function answerClueHasImmediateAction(clue: string): boolean {
  const c = clue.trim();
  if (!c) return false;
  if (!IMMEDIATE_PATTERN.test(c)) return false;
  return IMMEDIATE_TIMING.test(c) || /I'?ll go/i.test(c) || /I'?ll call/i.test(c);
}

export {
  instructionMatchesTargetPerson,
  speakerCodeFromTarget,
  targetPersonLabel,
};

export function validateType9ActionFields(q: {
  instruction: string;
  choices: string[];
  correct_answer: number;
  answer_clue: string;
  target_person?: string;
  immediate_action?: string;
  mentioned_actions?: MentionedActionEntry[];
  segments: Array<{ speaker: string; text: string }>;
}): { ok: boolean; issues: string[] } {
  const issues: string[] = [];
  const target = q.target_person?.trim() ?? "";
  const action = q.immediate_action?.trim() ?? "";

  if (!target) {
    issues.push("target_person(남자/여자)이 필요합니다.");
  } else if (!instructionMatchesTargetPerson(q.instruction, target)) {
    issues.push("지시문과 target_person이 일치하지 않습니다.");
  }

  const actionSpeaker = findImmediateActionSpeaker(q.segments);
  const expected = speakerCodeFromTarget(target);
  if (actionSpeaker && expected && actionSpeaker !== expected) {
    issues.push(
      "즉시 행동을 말한 화자와 target_person(지시문 대상)이 일치하지 않습니다."
    );
  }

  if (!action) {
    issues.push("immediate_action(정답 행동)이 필요합니다.");
  } else if (!actionMatchesChoice(action, q.choices, q.correct_answer)) {
    issues.push("immediate_action과 correct_answer 선택지가 일치하지 않습니다.");
  }

  if (target && !targetPersonHasImmediateUtterance(q.segments, target)) {
    issues.push(
      "목표 인물의 말에 I'll ... now/right now/right away 형태가 필요합니다."
    );
  }

  if (q.answer_clue.trim()) {
    if (!answerClueHasImmediateAction(q.answer_clue)) {
      issues.push(
        "answer_clue에 즉시 행동(I'll ... now/right now 등) 근거가 필요합니다."
      );
    }
  } else {
    issues.push("answer_clue가 필요합니다.");
  }

  const mentioned = q.mentioned_actions ?? [];
  if (mentioned.length < 1) {
    issues.push("mentioned_actions에 언급 행동이 1개 이상 필요합니다.");
  }

  return { ok: issues.length === 0, issues };
}
