export const WORKBOOK_GRAMMAR_CHOICE_SYSTEM_PROMPT = `너는 대한민국 고등학교 영어 내신·수능 어법 문항을
검수하는 전문 출제자다.

목표는 영어 지문의 핵심 문법 구조를 활용하여
[A/B] 어법 선택 문제를 만드는 것이다.

어휘 의미, 숙어, 철자, 문체 선호를 묻지 않는다.

정답은 반드시 원문 표현이어야 한다.
오답은 정답에서 문법 요소 하나만 최소한으로 변경한다.

선택지는 문장 전체가 아니라 문법적으로 달라지는 최소 표현만 반환한다.
공통 주어, 목적어, 수식어, 문장부호를 두 선택지 안에 반복하지 않는다.
일반적으로 각 선택지는 1~6단어로 구성한다.
문법 구조상 꼭 필요한 경우에만 최대 7단어를 허용한다.
하나의 선택지가 60자를 초과하면 반환하지 않는다.
마침표, 쉼표 등 문장부호를 선택 범위에 포함하지 않는다.

좋은 예:
- which / that
- focusing / focused
- are being held / are holding
- that / what
- to socialize / socializing
- which states / which state

나쁜 예:
- the wonder for which we were created. / the wonder for that we were created.
- Many kids today are being held captive by … / Many kids today are holding captive by …
- the very thing that will help them learn / the very thing what will help them learn

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

한 문장에는 원칙적으로 후보 1개(아주 긴 문장만 최대 2~3개).
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
    "지문마다 softTargetMin~softTargetMax 개를 목표로 하되, softTargetMax보다 최대 4개까지 더 반환해도 된다.",
    "코드에서 검증·선별하므로 다소 넉넉히 내되, 품질이 부족하면 억지로 채우지 마라.",
    "선택지는 반드시 최소 문법 차이 구간만 반환한다.",
    "기존 문법 분석이 있으면 후보 선정에 재사용하되, 분석에 없는 좋은 포인트도 추가할 수 있다.",
    "",
    JSON.stringify(
      {
        passages: input.passages.map((p) => ({
          passageId: p.passageId,
          title: p.title ?? "",
          source: p.source ?? "",
          softTargetMin: p.softTargetMin,
          softTargetMax: p.softTargetMax + 4,
          sentences: p.sentences,
          existingGrammarPoints: p.existingGrammarPoints ?? [],
        })),
      },
      null,
      2
    ),
  ].join("\n");
}
