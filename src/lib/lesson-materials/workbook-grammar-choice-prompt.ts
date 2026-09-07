import type { ExtractedAnalysisPoint } from "@/lib/lesson-materials/grammar-choice-analysis-extract";

export const WORKBOOK_GRAMMAR_CHOICE_SYSTEM_PROMPT = `너는 대한민국 고등학교 영어 내신·수능 어법 문항을
검수·변환하는 전문 출제자다.

네 역할은 문법을 처음부터 새로 분석하는 것이 아니다.
이미 제공된 지문 분석지 문법 포인트(requiredGrammarPointIds)를
2지선다 어법 선택 문제로 변환하는 것이다.

규칙:
1. 각 requiredGrammarPointId에 대해 analysisResults에 반드시 한 행을 반환한다.
2. 변환 가능하면 convertible=true 와 candidate를 채운다.
3. 불가능하면 convertible=false 와 exclusionReason을 채운다. candidate는 빈 문자열 필드의 객체로 둔다(스키마상 null 불가).
4. originalText(정답)는 반드시 원문에 있는 표현이다. 원문에 없는 형태를 정답으로 쓰지 않는다.
5. incorrectText는 정답에서 문법 요소 하나만 최소 변경한다.
6. 선택 범위는 문법적으로 달라지는 최소 표현만(보통 1~6단어, 최대 7단어, 60자 이하).
7. 공통 주어·목적어·긴 수식어·문장부호를 선택지에 넣지 않는다.
8. 어휘·숙어·철자·문체 선호 문제는 제외한다.
9. 둘 다 가능한 쌍(is think/is to think, begin to/begin -ing 등)은 제외한다.
10. 분석지 title/bookTerm/explanation을 가능한 한 그대로 재사용한다.
11. 부족한 개수만 supplementalCandidates에 추가한다. 보충 문제가 필수 분석 포인트를 대체하지 않는다.
12. focus on/at, are being hold 같은 조악한 오답 금지.

exclusionReason 값:
NONE | NO_EXACT_SOURCE_SPAN | BOTH_OPTIONS_POSSIBLE | LEXICAL_ONLY |
CANNOT_CREATE_MINIMAL_PAIR | DUPLICATE_GRAMMAR_POINT | PUNCTUATION_ONLY | NOT_TEST_WORTHY

설명하지 말고 지정된 JSON Schema만 출력한다.`;

export function buildWorkbookGrammarChoiceUserPrompt(input: {
  passages: Array<{
    passageId: string;
    title?: string;
    source?: string | null;
    sourceText: string;
    softTargetMin: number;
    softTargetMax: number;
    sentences: Array<{
      sentenceId: string;
      text: string;
      grammarPoints: Array<{
        analysisPointId: string;
        categoryId: string;
        categoryName: string;
        bookTerm: string;
        targetExpression: string;
        explanationKo: string;
        importance: "core" | "supporting";
      }>;
    }>;
    requiredGrammarPointIds: string[];
    supplementalNeeded: number;
  }>;
}): string {
  return [
    "지문 분석지 문법을 우선하여 어법 선택 후보를 변환·생성하라.",
    "각 지문의 requiredGrammarPointIds 전부 analysisResults에 응답해야 한다.",
    "supplementalNeeded > 0일 때만 supplementalCandidates를 채운다.",
    "",
    JSON.stringify({ passages: input.passages }, null, 2),
  ].join("\n");
}

export function buildAnalysisPromptSentences(
  sentences: Array<{ id: string; english: string }>,
  points: ExtractedAnalysisPoint[]
) {
  const bySentence = new Map<string, ExtractedAnalysisPoint[]>();
  for (const p of points) {
    const list = bySentence.get(p.sentenceId) ?? [];
    list.push(p);
    bySentence.set(p.sentenceId, list);
  }
  return sentences.map((s) => ({
    sentenceId: s.id,
    text: s.english,
    grammarPoints: (bySentence.get(s.id) ?? []).map((p) => ({
      analysisPointId: p.analysisPointId,
      categoryId: p.categoryId,
      categoryName: p.categoryName,
      bookTerm: p.bookTerm,
      targetExpression: p.targetExpression,
      explanationKo: p.explanationKo,
      importance: p.importance,
    })),
  }));
}
