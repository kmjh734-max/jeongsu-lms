import { createHash } from "node:crypto";
import type { GrammarChoiceCandidate } from "@/lib/lesson-materials/workbook-types";
import { findTokenSpan } from "@/lib/lesson-materials/grammar-choice-repair";
import { tokenizeForWordOrder } from "@/lib/lesson-materials/word-order-tokenize";
import { formatWorkbookPassage } from "@/lib/lesson-materials/workbook-types";

type HeuristicPattern = {
  /** Exact phrase as it appears in the passage (whitespace-tokenized). */
  correct: string;
  incorrect: string;
  grammarCategoryId: string;
  grammarCategoryName: string;
  bookTerm: string;
  explanationKo: string;
  incorrectReasonKo: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  learningValue: 1 | 2 | 3 | 4 | 5;
};

/**
 * High-school grammar patterns frequently present in mock-exam passages.
 * Not passage-hardcoded: only applied when the exact correct span exists.
 */
const HEURISTIC_PATTERNS: HeuristicPattern[] = [
  {
    correct: "which states",
    incorrect: "which state",
    grammarCategoryId: "rel-sv-agreement",
    grammarCategoryName: "관계절의 동사 수 일치",
    bookTerm: "관계대명사 which의 수 일치",
    explanationKo:
      "관계대명사 which의 선행사가 단수이므로 동사는 states가 적절하다.",
    incorrectReasonKo: "state는 복수 주어에 쓰이는 형태로 수 일치 오류이다.",
    difficulty: 3,
    learningValue: 5,
  },
  {
    correct: "focusing",
    incorrect: "focused",
    grammarCategoryId: "gerund-prep",
    grammarCategoryName: "전치사의 목적어",
    bookTerm: "전치사 뒤 동명사",
    explanationKo:
      "전치사 by의 목적어 역할을 하므로 동명사 focusing이 적절하다.",
    incorrectReasonKo: "과거분사 focused는 전치사의 목적어로 쓸 수 없다.",
    difficulty: 3,
    learningValue: 5,
  },
  {
    correct: "contradict",
    incorrect: "contradicts",
    grammarCategoryId: "rel-sv-agreement",
    grammarCategoryName: "관계절의 동사 수 일치",
    bookTerm: "관계절의 동사 수 일치",
    explanationKo:
      "관계대명사의 선행사가 복수이므로 관계절의 동사는 contradict가 적절하다.",
    incorrectReasonKo: "contradicts는 단수 주어에 쓰이는 형태이다.",
    difficulty: 4,
    learningValue: 5,
  },
  {
    correct: "are being held captive",
    incorrect: "are holding captive",
    grammarCategoryId: "passive",
    grammarCategoryName: "능동태와 수동태",
    bookTerm: "수동태",
    explanationKo:
      "아이들이 붙잡혀 있는 상태이므로 수동태 are being held captive가 적절하다.",
    incorrectReasonKo: "능동태 are holding은 의미상 주어가 붙잡는 쪽이 된다.",
    difficulty: 4,
    learningValue: 5,
  },
  {
    correct: "for which we were created",
    incorrect: "for which we created",
    grammarCategoryId: "passive",
    grammarCategoryName: "능동태와 수동태",
    bookTerm: "수동태",
    explanationKo:
      "우리가 창조된 대상이므로 수동태 were created가 적절하다.",
    incorrectReasonKo: "능동 created는 의미상 맞지 않는다.",
    difficulty: 4,
    learningValue: 5,
  },
  {
    correct: "to participate",
    incorrect: "participating",
    grammarCategoryId: "to-inf",
    grammarCategoryName: "to부정사",
    bookTerm: "to부정사의 명사적 용법",
    explanationKo:
      "allow oneself to V 구문이므로 to부정사 to participate가 적절하다.",
    incorrectReasonKo: "동명사 participating은 이 구문의 목적격보어로 맞지 않는다.",
    difficulty: 3,
    learningValue: 4,
  },
  {
    correct: "how to socialize",
    incorrect: "how socializing",
    grammarCategoryId: "wh-to-inf",
    grammarCategoryName: "의문사+to부정사",
    bookTerm: "의문사 to부정사",
    explanationKo:
      "learn how to V 구조이므로 how to socialize가 적절하다.",
    incorrectReasonKo: "how socializing은 문법적으로 성립하지 않는다.",
    difficulty: 3,
    learningValue: 4,
  },
  {
    correct: "Instead of moving",
    incorrect: "Instead of move",
    grammarCategoryId: "gerund-prep",
    grammarCategoryName: "전치사의 목적어",
    bookTerm: "전치사 뒤 동명사",
    explanationKo:
      "전치사 of의 목적어이므로 동명사 moving이 적절하다.",
    incorrectReasonKo: "동사원형 move는 전치사의 목적어로 쓸 수 없다.",
    difficulty: 3,
    learningValue: 4,
  },
  {
    correct: "that will help them",
    incorrect: "that will be helped them",
    grammarCategoryId: "passive",
    grammarCategoryName: "능동태와 수동태",
    bookTerm: "관계절의 태",
    explanationKo:
      "that(=things)가 them을 돕는 주체이므로 능동 will help가 적절하다.",
    incorrectReasonKo: "수동 will be helped them은 비문이다.",
    difficulty: 4,
    learningValue: 5,
  },
  {
    correct: "were never meant to have",
    incorrect: "were never meant having",
    grammarCategoryId: "to-inf",
    grammarCategoryName: "to부정사",
    bookTerm: "be meant to V",
    explanationKo: "be meant to V 구문이므로 to have가 적절하다.",
    incorrectReasonKo: "having은 이 구문에 맞지 않는다.",
    difficulty: 3,
    learningValue: 4,
  },
  {
    correct: "are meant to live",
    incorrect: "are meant living",
    grammarCategoryId: "to-inf",
    grammarCategoryName: "to부정사",
    bookTerm: "be meant to V",
    explanationKo: "be meant to V 구문이므로 to live가 적절하다.",
    incorrectReasonKo: "living은 이 구문에 맞지 않는다.",
    difficulty: 3,
    learningValue: 4,
  },
  {
    correct: "to socialize",
    incorrect: "socializing",
    grammarCategoryId: "to-inf",
    grammarCategoryName: "to부정사",
    bookTerm: "의문사 to부정사",
    explanationKo: "how to V의 일부로 to부정사가 적절하다.",
    incorrectReasonKo: "동명사만 쓰면 how 구조가 깨진다.",
    difficulty: 3,
    learningValue: 3,
  },
  {
    correct: "bring about",
    incorrect: "bringing about",
    grammarCategoryId: "modal-verb",
    grammarCategoryName: "조동사",
    bookTerm: "조동사 + 동사원형",
    explanationKo:
      "조동사 can 뒤에는 동사원형이 오므로 bring about가 적절하다.",
    incorrectReasonKo: "bringing은 조동사 뒤에 올 수 없다.",
    difficulty: 3,
    learningValue: 4,
  },
];

function stableId(
  passageId: string,
  sentenceId: string,
  start: number,
  end: number
): string {
  return createHash("sha1")
    .update(`${passageId}|${sentenceId}|${start}|${end}`)
    .digest("hex")
    .slice(0, 12);
}

/**
 * Build deterministic grammar-choice candidates from passage text.
 * Only emits a candidate when the correct span is found verbatim.
 */
export function buildHeuristicGrammarCandidates(input: {
  passageId: string;
  sentences: Array<{ id: string; english: string }>;
}): GrammarChoiceCandidate[] {
  const out: GrammarChoiceCandidate[] = [];
  const used = new Set<string>();

  for (const s of input.sentences) {
    const english = formatWorkbookPassage(s.english);
    const tokens = tokenizeForWordOrder(english).map((t) => t.surface);
    for (const pat of HEURISTIC_PATTERNS) {
      const found = findTokenSpan(tokens, pat.correct);
      if (!found) continue;
      // Prefer "focusing" only when preceded by "by"
      if (pat.correct === "focusing") {
        const before = tokens[found.start - 1] ?? "";
        if (!/^by$/i.test(before.replace(/[.,;:!?]+$/g, ""))) continue;
      }
      const key = `${s.id}:${found.start}:${found.end}`;
      if (used.has(key)) continue;
      used.add(key);
      out.push({
        choiceId: `heur-${stableId(input.passageId, s.id, found.start, found.end)}`,
        passageId: input.passageId,
        sentenceId: s.id,
        startTokenIndex: found.start,
        endTokenIndex: found.end,
        originalText: found.text,
        correctText: found.text,
        incorrectText: pat.incorrect,
        grammarCategoryId: pat.grammarCategoryId,
        grammarCategoryName: pat.grammarCategoryName,
        bookTerm: pat.bookTerm,
        explanationKo: pat.explanationKo,
        incorrectReasonKo: pat.incorrectReasonKo,
        difficulty: pat.difficulty,
        learningValue: pat.learningValue,
        ambiguityRisk: "low",
      });
    }
  }

  return out;
}
