import { createHash } from "node:crypto";
import type { GrammarChoiceCandidate } from "@/lib/lesson-materials/workbook-types";
import { findTokenSpan } from "@/lib/lesson-materials/grammar-choice-repair";
import { tokenizeForWordOrder } from "@/lib/lesson-materials/word-order-tokenize";
import { formatWorkbookPassage } from "@/lib/lesson-materials/workbook-types";
import { minimizeAndRelocateCandidate } from "@/lib/lesson-materials/grammar-choice-minimize";

type HeuristicPattern = {
  /** Phrase that must exist in the passage (correct form). */
  correct: string;
  incorrect: string;
  grammarCategoryId: string;
  grammarCategoryName: string;
  bookTerm: string;
  explanationKo: string;
  incorrectReasonKo: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  learningValue: 1 | 2 | 3 | 4 | 5;
  /** Optional: previous token bare form must match (e.g. "by" before focusing). */
  prevToken?: string;
  /** Optional: next token bare form must match. */
  nextToken?: string;
};

/**
 * Minimal-span HS grammar patterns. correct/incorrect should already be
 * the differing core; minimize() still runs as a safety net.
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
    prevToken: "by",
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
    correct: "attracts",
    incorrect: "attract",
    grammarCategoryId: "sv-agreement",
    grammarCategoryName: "주어와 동사의 수 일치",
    bookTerm: "주어와 동사의 수 일치",
    explanationKo: "주어 like가 단수 취급이므로 attracts가 적절하다.",
    incorrectReasonKo: "attract는 복수 주어에 쓰이는 형태이다.",
    difficulty: 3,
    learningValue: 4,
  },
  {
    correct: "what",
    incorrect: "which",
    nextToken: "limiting",
    grammarCategoryId: "rel-what",
    grammarCategoryName: "관계대명사 what",
    bookTerm: "관계대명사 what",
    explanationKo:
      "선행사를 포함한 관계대명사 what이 적절하다.",
    incorrectReasonKo: "which는 선행사가 앞에 있을 때 쓴다.",
    difficulty: 4,
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
  {
    correct: "which",
    incorrect: "that",
    prevToken: "for",
    grammarCategoryId: "prep-rel",
    grammarCategoryName: "전치사+관계대명사",
    bookTerm: "전치사+관계대명사",
    explanationKo:
      "전치사 for 뒤에는 관계대명사 which가 적절하다.",
    incorrectReasonKo: "전치사 뒤에는 관계대명사 that을 쓰지 않는다.",
    difficulty: 4,
    learningValue: 5,
  },
  {
    correct: "to participate",
    incorrect: "participating",
    grammarCategoryId: "to-inf",
    grammarCategoryName: "to부정사",
    bookTerm: "to부정사 목적격보어",
    explanationKo:
      "allow oneself to V 구문이므로 to participate가 적절하다.",
    incorrectReasonKo: "동명사 participating은 이 구문에 맞지 않는다.",
    difficulty: 3,
    learningValue: 4,
  },
  {
    correct: "were created",
    incorrect: "created",
    grammarCategoryId: "passive",
    grammarCategoryName: "능동태와 수동태",
    bookTerm: "수동태",
    explanationKo: "우리가 창조된 대상이므로 수동 were created가 적절하다.",
    incorrectReasonKo: "능동 created는 의미상 맞지 않는다.",
    difficulty: 4,
    learningValue: 4,
  },
  {
    correct: "moving",
    incorrect: "move",
    prevToken: "of",
    grammarCategoryId: "gerund-prep",
    grammarCategoryName: "전치사의 목적어",
    bookTerm: "전치사 뒤 동명사",
    explanationKo: "전치사 of의 목적어이므로 동명사 moving이 적절하다.",
    incorrectReasonKo: "동사원형 move는 전치사의 목적어로 쓸 수 없다.",
    difficulty: 3,
    learningValue: 4,
  },
  {
    correct: "are being held",
    incorrect: "are holding",
    grammarCategoryId: "passive",
    grammarCategoryName: "능동태와 수동태",
    bookTerm: "수동태",
    explanationKo:
      "아이들이 붙잡혀 있는 상태이므로 수동 are being held가 적절하다.",
    incorrectReasonKo: "능동 are holding은 의미상 주어가 붙잡는 쪽이 된다.",
    difficulty: 4,
    learningValue: 5,
  },
  {
    correct: "to socialize",
    incorrect: "socializing",
    prevToken: "how",
    grammarCategoryId: "wh-to-inf",
    grammarCategoryName: "의문사+to부정사",
    bookTerm: "의문사 to부정사",
    explanationKo: "how to V 구조이므로 to socialize가 적절하다.",
    incorrectReasonKo: "how socializing은 문법적으로 성립하지 않는다.",
    difficulty: 3,
    learningValue: 4,
  },
  {
    correct: "that",
    incorrect: "what",
    nextToken: "will",
    grammarCategoryId: "rel-that",
    grammarCategoryName: "관계대명사 that",
    bookTerm: "관계대명사 that과 what",
    explanationKo:
      "선행사 the very thing이 있으므로 관계대명사 that이 적절하다.",
    incorrectReasonKo: "what은 선행사를 포함하므로 여기 쓸 수 없다.",
    difficulty: 4,
    learningValue: 5,
  },
  {
    correct: "to have",
    incorrect: "having",
    grammarCategoryId: "to-inf",
    grammarCategoryName: "to부정사",
    bookTerm: "be meant to V",
    explanationKo: "be meant to V 구문이므로 to have가 적절하다.",
    incorrectReasonKo: "having은 이 구문에 맞지 않는다.",
    difficulty: 3,
    learningValue: 4,
  },
  {
    correct: "to manifest",
    incorrect: "manifesting",
    grammarCategoryId: "to-inf",
    grammarCategoryName: "to부정사",
    bookTerm: "to부정사의 명사적 용법",
    explanationKo: "목적·결과의 to부정사 to manifest가 적절하다.",
    incorrectReasonKo: "동명사 manifesting은 이 자리에 맞지 않는다.",
    difficulty: 3,
    learningValue: 4,
  },
  {
    correct: "visualize",
    incorrect: "visualizing",
    grammarCategoryId: "parallel-bare",
    grammarCategoryName: "병렬구조",
    bookTerm: "병렬구조",
    explanationKo: "think about or visualize의 병렬 원형이 적절하다.",
    incorrectReasonKo: "visualizing은 병렬 형태가 깨진다.",
    difficulty: 3,
    learningValue: 3,
  },
];

function bare(token: string): string {
  return token.replace(/[.,;:!?]+$/g, "").toLowerCase();
}

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
      if (pat.prevToken) {
        const before = tokens[found.start - 1];
        if (!before || bare(before) !== pat.prevToken.toLowerCase()) continue;
      }
      if (pat.nextToken) {
        const after = tokens[found.end + 1];
        if (!after || bare(after) !== pat.nextToken.toLowerCase()) continue;
      }
      const key = `${s.id}:${found.start}:${found.end}`;
      if (used.has(key)) continue;

      const raw: GrammarChoiceCandidate = {
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
      };
      const minimized = minimizeAndRelocateCandidate(raw, english);
      if (!minimized) continue;
      const mKey = `${s.id}:${minimized.startTokenIndex}:${minimized.endTokenIndex}`;
      if (used.has(mKey)) continue;
      used.add(mKey);
      used.add(key);
      out.push(minimized);
    }
  }

  return out;
}
