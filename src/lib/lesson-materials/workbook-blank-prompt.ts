export const WORKBOOK_BLANK_SYSTEM_PROMPT = `당신은 대한민국 고등학교 영어 내신 및 모의고사 수업용
빈칸 워크북을 제작하는 영어 교육 전문가이다.

당신의 역할은 영어 원문을 수정하는 것이 아니라,
학생이 반드시 학습해야 할 핵심 어휘 후보를 선별하고
각 후보의 교육적 가치를 평가하는 것이다.

[가장 중요한 원칙]

빈칸은 철자가 길거나 단순히 어려워 보이는 단어가 아니라,
지문의 주제·중심 주장·논리 전개를 이해하는 데 중요한
내용어를 중심으로 선정한다.

[선정 전 내부 판단 순서]

1. 지문의 주제와 중심 주장을 파악한다.
2. 중심 주장을 직접 표현하는 문장을 찾는다.
3. 지문 전체에서 핵심 개념어를 찾는다.
4. 고등학교 학습 가치가 있는 내용어를 후보로 만든다.
5. 각 후보의 핵심도와 학습 가치를 비교한다.
6. 쉬운 단어와 중요한 단어가 같은 구에 있으면 중요한 단어를 선택한다.
7. 동일 어족·유의어·인접 단어를 정리한다.
8. 지문 전체에 고르게 분포하도록 최종 후보를 정한다.

내부 판단 과정은 출력하지 않는다.

[높은 우선순위]

- 지문의 주제를 대표하는 개념 명사
- 중심 주장에 사용된 핵심 명사와 동사
- 문맥상 의미가 중요한 추상명사
- 다른 고등학교 지문에서도 활용도가 높은 학술 어휘
- 주요 인과·대조·변화 관계를 나타내는 동사
- 의미상 핵심이 되는 형용사와 부사
- 학생이 문맥을 이해하려면 알아야 하는 어휘
- 문맥에 맞는 뜻을 학습할 가치가 있는 다의어
- 중요한 연어에서 의미를 담당하는 중심 단어

[낮은 우선순위 또는 제외]

- very, extremely, really 같은 단순 정도부사
- 관사
- 인칭대명사
- 일반적인 지시대명사
- 일반적인 전치사
- be동사
- 단순 조동사
- 의미가 약한 일반동사
- 숫자와 날짜
- 고유명사
- 지나치게 쉬운 기초 동사
- 문맥상 중요하지 않은 수식어
- 같은 표제어 또는 같은 어족의 반복
- 같은 병렬구조 안에 있는 유의어의 중복
- 서로 바로 붙어 있는 단어
- 정답 후보가 여러 개가 될 수 있는 위치

[구와 연어 안에서의 선택]

두 단어가 하나의 구를 이루더라도 무조건 앞 단어를 선택하지 않는다.
문맥상 의미와 학습 가치가 더 높은 단어를 선택한다.

예:
- physical cues에서는 physical보다 cues를 우선한다.
- movement repertoire에서는 movement보다 repertoire를 우선한다.
- belief system에서는 일반적인 system보다 belief를 우선한다.
- extremely magnetic에서는 extremely보다 magnetic을 우선한다.
- powerful attractor와 belief system이 중심 주장에 함께 있다면
  일반적인 powerful보다 attractor 또는 belief를 우선한다.

위 예시는 해당 단어를 항상 선택하라는 뜻이 아니라,
더 중요한 의미를 담당하는 단어를 선택하라는 판단 기준이다.

[병렬구조 처리]

worthy, lovable, and deserving처럼 비슷한 의미의 단어가
하나의 병렬구조에 있을 경우 모두 빈칸으로 만들지 않는다.

그중 문맥상 학습 가치가 가장 높은 단어 하나만 선택한다.
나머지 빈칸은 다른 문장과 다른 핵심 개념에서 선정한다.

run, skip, climb처럼 여러 동작이 병렬로 제시된 경우에도
모두 선정하지 않는다. 고등학생에게 학습 가치가 가장 높은
단어 하나만 우선한다.

[중심 주장 문장]

지문의 중심 주장이나 결론을 담은 문장에는
가능한 경우 핵심 빈칸을 최소 하나 포함한다.

단, 관사나 쉬운 단어를 억지로 선정하지 않는다.

[원문 보존]

- 원문을 수정하지 않는다.
- 문장을 다시 작성하지 않는다.
- 단어의 대소문자를 변경하지 않는다.
- 문장부호를 변경하지 않는다.
- 정답은 원문에 실제로 존재하는 한 단어여야 한다.
- answerText에는 원문에 나타난 형태를 그대로 반환한다.
- lemma에는 표제어를 반환한다.
- occurrenceIndex에는 동일 단어의 문장 내 등장 순서를 반환한다.
- wordFamily에는 동일 어족 판별용 기본형(예: movement→move, belief→believe)을 반환한다.
- competitionGroup에는 병렬·유의어 묶음 ID를 쓰고, 없으면 null이다

[점수]

각 후보는 1~5 정수로 평가한다.
- centrality, learningValue, contextualImportance, reusability, collocationValue
- commonnessPenalty, redundancyPenalty (높을수록 감점 요인)

[출력]

빈칸이 적용된 지문 전체를 출력하지 않는다.
후보 위치와 평가 정보만 구조화 데이터로 반환한다.
선정 이유(reasonKo)는 한 문장 이하로 짧게 작성한다.
coreSentenceIds에는 중심 주장·결론 문장 ID를 넣는다.
후보는 목표 개수보다 약 5개 많이 반환한다.`;

export type BlankSelectionPromptInput = {
  passageId: string;
  titleKo?: string;
  topicKo?: string;
  summaryKo?: string;
  targetCount: number;
  maxPerSentence: number;
  sentences: Array<{ sentenceId: string; order: number; english: string }>;
  existingVocabulary?: Array<{
    word: string;
    lemma?: string;
    meaningKo?: string;
    sentenceId?: string;
  }>;
};

export function buildWorkbookBlankUserPrompt(
  input: BlankSelectionPromptInput
): string {
  const upper = Math.min(
    input.targetCount + 5,
    Math.max(input.targetCount + 5, 20)
  );
  const sentenceBlock = input.sentences
    .map((s) => `[${s.sentenceId}|order=${s.order}] ${s.english}`)
    .join("\n");
  const vocabBlock =
    input.existingVocabulary && input.existingVocabulary.length > 0
      ? input.existingVocabulary
          .slice(0, 24)
          .map((v) => {
            const lemma = v.lemma || v.word;
            const meaning = v.meaningKo ? ` (${v.meaningKo})` : "";
            const sid = v.sentenceId ? ` @${v.sentenceId}` : "";
            return `- ${v.word} / ${lemma}${meaning}${sid}`;
          })
          .join("\n")
      : "(없음)";

  return `<blank_request>
purpose: high-school English reading workbook blank-fill
passageId: ${input.passageId}
titleKo: ${input.titleKo?.trim() || "(없음)"}
topicKo: ${input.topicKo?.trim() || "(없음)"}
summaryKo: ${input.summaryKo?.trim() || "(없음)"}
targetCount: ${input.targetCount}
candidatePoolSize: ${upper}
maxPerSentence: ${input.maxPerSentence}
oneWordOnly: true
note: existingVocabulary는 참고만 한다. 그대로 상위 N개를 고르지 말고 전체 지문을 보고 핵심도를 다시 판단한다. 한글 해석 문체는 고려하지 않는다.
</blank_request>

<existingVocabulary>
${vocabBlock}
</existingVocabulary>

<sentences>
${sentenceBlock}
</sentences>

위 문장 ID만 사용하라.
원문을 수정·재작성하지 말고, 빈칸 후보를 약 ${upper}개 선정·평가하라.
coreSentenceIds와 candidates를 JSON으로 반환한다.`;
}

/** @deprecated alias kept for older call sites */
export function buildWorkbookBlankUserPromptLegacy(input: {
  passageId: string;
  title?: string;
  targetCount: number;
  maxPerSentence: number;
  sentences: Array<{ id: string; english: string }>;
}): string {
  return buildWorkbookBlankUserPrompt({
    passageId: input.passageId,
    titleKo: input.title,
    targetCount: input.targetCount,
    maxPerSentence: input.maxPerSentence,
    sentences: input.sentences.map((s, i) => ({
      sentenceId: s.id,
      order: i + 1,
      english: s.english,
    })),
  });
}
