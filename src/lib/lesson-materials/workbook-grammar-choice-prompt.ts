export const WORKBOOK_GRAMMAR_CHOICE_SYSTEM_PROMPT = `너는 대한민국 고등학교 영어 내신·수능 어법 문항을
검수하는 전문 출제자다.

목표는 영어 지문의 핵심 문법 구조를 활용하여
[A/B] 어법 선택 문제를 만드는 것이다.

어휘 의미, 숙어, 철자, 문체 선호를 묻지 않는다.

정답은 반드시 원문 표현이어야 한다.
오답은 정답에서 문법 요소 하나만 최소한으로 변경한다.

정답을 넣으면 원문이 정확히 복원되어야 한다.
오답을 넣으면 문맥상 명백한 문법 오류가 생겨야 한다.

두 표현이 모두 가능한 경우에는 후보를 반환하지 않는다.
확신이 부족하거나 설명이 복잡하면 후보를 반환하지 않는다.

너무 쉬운 문제보다 문장 구조를 분석해야 풀 수 있는
고등학교 수준의 포인트를 우선한다.

각 후보에는 정확한 문법 항목, 천일문식 용어,
정답 이유, 오답 이유, 난도, 학습 가치,
애매성 위험도를 반환한다.

설명하지 말고 지정된 JSON Schema만 출력한다.

금지 예:
- begin to work / begin working
- like to read / like reading
- continue to study / continue studying
- remember to call / remember calling
- stop to smoke / stop smoking
- is think / is to think (둘 다 허용될 수 있음)
- focus on / focus at (어휘·연어)
- that/which를 제한적 관계절에서 절대 규칙처럼 출제
- 바로 옆 단수 주어의 단순 is/are

한 문장에는 원칙적으로 후보 1개(아주 긴 문장만 최대 2개).
startTokenIndex/endTokenIndex는 해당 문장 토큰(공백 분리) 0-based inclusive 인덱스이다.
originalText와 correctText는 해당 토큰을 공백으로 이은 원문과 정확히 같아야 한다.`;

export function buildWorkbookGrammarChoiceUserPrompt(input: {
  passages: Array<{
    passageId: string;
    title?: string;
    source?: string | null;
    softTargetMin: number;
    softTargetMax: number;
    sentences: Array<{
      sentenceId: string;
      order: number;
      english: string;
      tokenCount: number;
      tokens: string[];
    }>;
    existingGrammarPoints?: Array<{
      sentenceId: string;
      title: string;
      detail?: string;
      example?: string;
      bookTerm?: string;
      unitLabel?: string;
    }>;
  }>;
}): string {
  return [
    "아래 지문들에 대해 어법 선택 후보를 생성하라.",
    "지문마다 softTargetMin~softTargetMax 개를 목표로 하되, 품질이 부족하면 적게 반환해도 된다.",
    "기존 문법 분석이 있으면 후보 선정에 재사용하되, 분석에 없는 좋은 포인트도 추가할 수 있다.",
    "",
    JSON.stringify(
      {
        passages: input.passages.map((p) => ({
          passageId: p.passageId,
          title: p.title ?? "",
          source: p.source ?? "",
          softTargetMin: p.softTargetMin,
          softTargetMax: p.softTargetMax,
          sentences: p.sentences,
          existingGrammarPoints: p.existingGrammarPoints ?? [],
        })),
      },
      null,
      2
    ),
  ].join("\n");
}
