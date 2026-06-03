/** 10번 핵심 내용 명사구 선택지 검사 */

export interface TopicDistractorReason {
  choice: string;
  reason: string;
}

const TOO_VAGUE =
  /^(학교생활|친구\s*대화|문제\s*해결|일상\s*대화|학교|친구|대화|문제|생활)$/;

const SINGLE_WORD_ONLY = /^[\uAC00-\uD7A3]{1,3}$/;

const MOSTLY_ENGLISH = /^[A-Za-z0-9\s.,'"-]+$/;

export function normalizeContentPhrase(label: string): string {
  return label.trim().replace(/\s+/g, " ");
}

export function isKoreanContentPhrase(choice: string): boolean {
  const t = choice.trim();
  if (!t || t.length < 3) return false;
  if (MOSTLY_ENGLISH.test(t) && !/[\uAC00-\uD7A3]/.test(t)) return false;
  if (!/[\uAC00-\uD7A3]/.test(t)) return false;
  if (TOO_VAGUE.test(t.replace(/\s/g, ""))) return false;
  if (SINGLE_WORD_ONLY.test(t)) return false;
  // 단어 하나만 (공백 없고 4자 이하) 거절
  if (!/\s/.test(t) && t.length <= 4 && !/(하기|나눔|계획|방법|준비|찾기|작성)$/.test(t)) {
    return false;
  }
  return true;
}

export function checkKoreanContentChoices(choices: string[]): {
  ok: boolean;
  message?: string;
} {
  const invalid = choices.filter((c) => c.trim() && !isKoreanContentPhrase(c));
  if (invalid.length > 0) {
    return {
      ok: false,
      message: `핵심 내용 명사구가 아닌 선택지: ${invalid.join(", ")}`,
    };
  }
  const normalized = choices.map((c) => normalizeContentPhrase(c));
  const unique = new Set(normalized.filter(Boolean));
  if (unique.size < choices.filter((c) => c.trim()).length) {
    return { ok: false, message: "선택지에 같은 내용이 중복되었습니다." };
  }
  return { ok: true };
}

export function mainContentMatchesChoice(
  mainContent: string,
  choices: string[],
  correctIndex: number
): boolean {
  const main = normalizeContentPhrase(mainContent);
  const choice = normalizeContentPhrase(choices[correctIndex - 1] ?? "");
  return !!main && !!choice && main === choice;
}

export function indexOfContentInChoices(
  choices: string[],
  content: string
): number {
  const target = normalizeContentPhrase(content);
  return choices.findIndex((c) => normalizeContentPhrase(c) === target);
}

export function normalizeContentClues(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((x) => String(x).trim()).filter(Boolean);
}

export function normalizeTopicDistractorReasons(
  raw: unknown
): TopicDistractorReason[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const o = item as Record<string, unknown>;
      const choice = String(o.choice ?? "").trim();
      const reason = String(o.reason ?? "").trim();
      if (!choice) return null;
      return { choice, reason };
    })
    .filter((x): x is TopicDistractorReason => x !== null);
}

export function isMainContentTooBroad(content: string): boolean {
  return TOO_VAGUE.test(content.replace(/\s/g, ""));
}

export function validateType10ContentFields(q: {
  instruction: string;
  choices: string[];
  correct_answer: number;
  answer_clue: string;
  main_content?: string;
  content_clues?: string[];
  topic_distractor_reasons?: TopicDistractorReason[];
}): { ok: boolean; issues: string[] } {
  const issues: string[] = [];
  const main = q.main_content?.trim() ?? "";

  if (!/무엇에\s*관한\s*내용|관한\s*내용/.test(q.instruction)) {
    issues.push("지시문이 핵심 내용 파악 유형에 맞지 않을 수 있습니다.");
  }

  if (!main) {
    issues.push("main_content(핵심 내용)이 필요합니다.");
  } else {
    if (isMainContentTooBroad(main)) {
      issues.push("main_content가 너무 넓거나 추상적입니다.");
    }
    if (!mainContentMatchesChoice(main, q.choices, q.correct_answer)) {
      issues.push("main_content와 correct_answer 선택지가 일치하지 않습니다.");
    }
  }

  const clues = q.content_clues ?? [];
  if (clues.length < 1) {
    issues.push("content_clues에 핵심 단서가 1개 이상 필요합니다.");
  }

  if (!q.answer_clue?.trim()) {
    issues.push("answer_clue가 필요합니다.");
  }

  const dr = q.topic_distractor_reasons ?? [];
  if (dr.length < 3) {
    issues.push("topic_distractor_reasons(오답 이유)가 3개 이상 필요합니다.");
  }

  return { ok: issues.length === 0, issues };
}
