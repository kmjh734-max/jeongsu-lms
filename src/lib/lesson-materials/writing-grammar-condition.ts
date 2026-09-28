import { ONE_PAGE_BOTH_FORMS_OK } from "@/lib/lesson-materials/one-page-grammar-rules";
import { findTextbookPoint } from "@/lib/grammar/textbook-points";
import { WRITING_GRAMMARS } from "@/lib/question-generator/writing-grammar";

/**
 * 1장 테스트지의 영작에 붙이는 「지정 문법」 조건.
 *
 * 선생님 요청(2026-09-29): 고르기로는 못 내는 어법을 제시어 배열로 돌려서 내자.
 *
 * 왜 고르기로 못 내나 — 두 형태가 모두 맞는 자리는 「어느 쪽이 맞나」를 물을 수 없다.
 * 관계대명사 that/which, It-that 강조구문의 that/who, 목적어절 if/whether, 조동사 뒤
 * have p.p. 같은 것들이다(ONE_PAGE_BOTH_FORMS_OK에 적혀 있다).
 *
 * 그런데 영작으로는 낼 수 있다. 「관계부사를 사용할 것」이라고 조건을 걸면 학생이 그
 * 구조를 직접 만들어야 한다. 교과서가 13종이나 다루는 관계부사가 1장 자료에서 통째로
 * 빠지던 것을 이렇게 메운다.
 */

/** 막혀 있는 교재 코드 ↔ 영작으로 낼 어법 이름 */
const BLOCKED_TO_WRITING: Array<[string, string]> = [
  ["RELATIVE_ADVERB_WHY", "관계부사"],
  ["CLEFT_IT_THAT", "It - that 강조구문"],
  ["MODAL_HAVE_PP", "조동사 + have p.p."],
  ["MODAL_PAST_INFERENCE", "조동사 + have p.p."],
  // 동명사 주어·보어는 영작 조건으로 걸 이름이 없어서(「동명사를 쓸 것」은 to부정사도 답이 된다) 뺀다
  ["INFINITIVE_NOUN_ROLE", "가주어 it, 진주어 to부정사"],
  ["RELATIVE_RESTRICTIVE", "관계대명사"],
  ["RELATIVE_OBJECT", "관계대명사"],
  ["RELATIVE_OMISSION", "관계대명사"],
  ["RELATIVE_PREPOSITION_WHICH", "전치사 + 관계대명사"],
  ["RELATIVE_PREPOSITION_WHOM", "전치사 + 관계대명사"],
  ["NOUN_CLAUSE_WHETHER_IF", "명사절 whether/if"],
  ["OBJECT_COMPLEMENT_BARE_V", "사역동사"],
  ["WITHOUT_IF_CONDITION", "without/but for 가정법"],
  ["MULTIPLICATIVE_COMPARISON", "as many[much] + 명사 + as"],
];

/**
 * 「이 문장에 이 어법이 정말 들어 있나」를 보는 식.
 *
 * 변형문제가 쓰는 check는 「모델이 시킨 문법을 넣었나」를 보는 것이라 느슨하다.
 * 그대로 쓰면 few of them feel like this one 같은 문장이 지각동사로 잡힌다.
 * 1장 자료는 확실한 자리만 싣는 곳이라, 여기서는 이 식과 check를 둘 다 통과해야 한다.
 * 여기에 이름이 없는 어법은 조건으로 걸지 않는다(지각동사는 확실히 가려낼 식이 없어서 뺐다).
 */
const DETECT: Record<string, RegExp> = {
  // 한정사 + 명사 + where/when/why — the reason why, the town where, the day when
  관계부사:
    /\b(?:the|a|an|this|that|these|those|his|her|their|my|our|its|some|any|every)\s+\w+\s+(?:where|when|why)\s+\w+/i,
  // it is/was ~ that. 가주어로 흔히 쓰는 형용사가 오면 강조구문이 아니다.
  "It - that 강조구문":
    /\bit\s+(?:is|was)\s+(?!(?:clear|true|important|possible|impossible|necessary|likely|unlikely|obvious|certain|natural|surprising|difficult|easy|hard|interesting|strange|essential|vital|common|said|known|believed|thought)\b)(?:not\s+)?[^.]{2,60}?\bthat\b/i,
  "조동사 + have p.p.": /\b(?:must|should|could|would|might|may)\s+have\s+\w+(?:ed|en|n)\b/i,
  "가주어 it, 진주어 to부정사": /\bit\s+(?:is|was)\s+[^.]{2,60}?\bto\s+[a-z]+\b/i,
  // 한정사 + 명사 + who/which + 동사 — 콤마 뒤 계속적 용법(고르기로 낼 수 있다)은 뺀다
  관계대명사:
    /\b(?:the|a|an|this|that|these|those|his|her|their|my|our|its|some|any|every|all)\s+\w+\s+(?:who|which)\s+\w+/i,
  "전치사 + 관계대명사": /\b(?:in|on|at|for|with|to|from|of|by|about)\s+(?:which|whom)\b/i,
  // 문장 첫머리의 Whether ~ or not은 부사절이라 뺀다
  "명사절 whether/if": /\w\s+whether\b/i,
  사역동사:
    /\b(?:make|makes|made|have|has|had|let|lets)\s+(?:the|a|an|his|her|their|my|our|its|him|her|them|me|us|people|someone|students?|children)\s+\w+/i,
  "without/but for 가정법": /\b(?:without|but\s+for)\b[^.]{0,80}\b(?:would|could|might)\b/i,
  "as many[much] + 명사 + as": /\bas\s+(?:many|much)\s+\w+\s+as\b/i,
};

/**
 * 먼저 맞춰 볼 어법.
 *
 * 「Without your help, we would have missed …」는 조동사 + have p.p.로도 읽히지만
 * 이 문장의 자리는 without 가정법이다. 구조가 정해져 있는 것부터 맞춰 보고,
 * 어디에나 걸리는 것(조동사 + have p.p., 관계대명사, 가주어 it)은 나중에 본다.
 */
const GENERIC_LAST = new Set(["조동사 + have p.p.", "관계대명사", "가주어 it, 진주어 to부정사"]);

export interface WritingCondition {
  /** 조건에 적는 이름 */
  label: string;
  /** 이름 뒤 괄호에 붙이는 형태 */
  form: string;
  /** 고등 교과서 몇 종이 다루는지 — 많은 것부터 고른다 */
  books: number;
}

/** 고르기로 못 내는 어법 가운데, 영작 조건으로 쓸 수 있는 것 (맞춰 볼 차례대로) */
export const WRITING_ONLY_GRAMMARS: Array<WritingCondition & { check: RegExp; detect: RegExp }> =
  (() => {
    const out = new Map<string, WritingCondition & { check: RegExp; detect: RegExp }>();
    for (const [code, label] of BLOCKED_TO_WRITING) {
      if (!ONE_PAGE_BOTH_FORMS_OK.has(code)) continue;
      const detect = DETECT[label];
      if (!detect) continue;
      const g = WRITING_GRAMMARS.find((x) => x.label === label);
      if (!g?.check) continue;
      const books = findTextbookPoint(label)?.bookCount ?? g.textbookBooks ?? 0;
      const prev = out.get(label);
      if (!prev || books > prev.books) {
        out.set(label, { label: g.label, form: g.form, books, check: g.check, detect });
      }
    }
    const tier = (c: WritingCondition) => (GENERIC_LAST.has(c.label) ? 1 : 0);
    return [...out.values()].sort((a, b) => tier(a) - tier(b) || b.books - a.books);
  })();

/**
 * 이 영어 문장으로 낼 수 있는 영작 조건을 고른다.
 * 여러 개가 맞으면 구조가 뚜렷한 것부터, 같으면 교과서가 많이 다루는 것을 쓴다.
 * 확실하지 않으면 null(조건 없이 낸다).
 */
export function writingConditionFor(english: string): WritingCondition | null {
  const s = (english ?? "").trim();
  if (!s) return null;
  for (const g of WRITING_ONLY_GRAMMARS) {
    if (g.detect.test(s) && g.check.test(s)) {
      return { label: g.label, form: g.form, books: g.books };
    }
  }
  return null;
}

/** 시험지에 적는 한 줄 — 「관계부사(where / when / why / how)를 사용할 것」 */
export function writingConditionText(c: Pick<WritingCondition, "label" | "form">): string {
  const last = c.label.trim().slice(-1);
  const code = last.charCodeAt(0);
  const particle =
    code >= 0xac00 && code <= 0xd7a3 ? ((code - 0xac00) % 28 === 0 ? "를" : "을") : "을";
  return `${c.label}(${c.form})${particle} 사용할 것`;
}
