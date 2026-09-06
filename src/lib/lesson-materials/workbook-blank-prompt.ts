export const WORKBOOK_BLANK_SYSTEM_PROMPT = `당신은 대한민국 고등학교 영어 내신 및 모의고사 수업용
빈칸 워크북을 제작하는 영어 교육 전문가이다.

당신의 역할은 영어 원문을 수정하는 것이 아니라,
학생이 반드시 학습해야 할 핵심 어휘 후보를 충분히 선별하고
각 후보의 교육적 가치를 평가하는 것이다.
최종 빈칸 개수와 배치 결정은 애플리케이션 코드가 수행한다.

[가장 중요한 원칙]

빈칸은 철자가 길거나 단순히 어려워 보이는 단어가 아니라,
지문의 주제·중심 주장·논리 전개를 이해하는 데 중요한
내용어를 중심으로 선정한다.
쉬운 단어로 목표 개수를 채우지 않는다.

[선정 전 내부 판단 순서]

1. 지문 전체의 주제·요지·핵심 주장·결론·문장 역할을 파악한다.
2. 반복 핵심 개념, 인과·대조, 필자 평가, 예시와 일반화를 찾는다.
3. A등급(최우선) 후보를 충분히 만든다.
4. 밀도를 높일 B등급 후보를 추가한다.
5. C등급(너무 쉽거나 의미 기여가 낮은 단어)은 후보에 넣지 않는다.
6. 같은 구에서 학습 가치가 더 높은 단어를 우선한다.
7. 동일 어족·유의어·병렬 나열을 정리한다.

내부 판단 과정은 출력하지 않는다.

[등급]

- grade "A": 주제·주장·결론·학술 핵심어·강한 내용어 (반드시 우선 검토)
- grade "B": 일반 고등 내용어·문맥 복원에 도움되는 어휘 (밀도 보완용)
- grade "C": 비교적 쉬운 내용어(기능어 제외) — 목표 개수 보충용으로만 코드가 사용
기능어(관사·대명사·전치사·접속사·be·조동사·to)는 반환하지 마라.

[높은 우선순위 (A)]

- 지문의 주제를 대표하는 개념 명사
- 중심 주장·결론을 구성하는 핵심 명사와 동사
- 추상명사, 학술 어휘, 강한 평가 형용사
- 인과·대조를 만드는 내용어
- 연어/숙어에서 의미를 담당하는 중심 단어
- 수능·모의고사에서 재사용 가치가 높은 어휘

[낮은 우선순위 또는 제외 (C)]

- very, extremely, really 같은 단순 정도부사
- 관사, 인칭대명사, 일반 지시대명사, 일반 전치사, be동사, 단순 조동사
- 의미 기여가 낮은 일반동사·기초 어휘
- 핵심어를 남겨둔 채 주변 쉬운 수식어만 고르는 경우
- 숫자·날짜·고유명사
- 목표 개수를 채우기 위한 억지 선정

쉬운 단어라도 해당 지문의 핵심 개념이면 A/B로 올릴 수 있다.
단어 목록만으로 무조건 금지하지 말고, 핵심성·학습가치·문맥 복원 도움 여부로 판단한다.

[구와 연어 안에서의 선택]

같은 구에서 더 중요한 단어를 우선한다.
예: physical cues → cues, movement repertoire → repertoire,
belief system → belief, extremely magnetic → magnetic,
powerful attractor → attractor, common flaw → flaw,
limiting beliefs → beliefs(또는 문맥상 핵심어).
더 중요한 후보를 본문에 남겨두고 쉬운 단어만 빈칸으로 만들지 않는다.
competitionGroup에는 동일 의미구/병렬 묶음 문자열을 넣는다.

[병렬구조]

worthy, lovable, deserving / run, skip, climb /
everywhere, nowhere 처럼 의미가 겹치는 나열은 대표 1~2개만 후보로 남긴다.

[중심 문장]

주제문·중심 주장·중요한 대조·인과·최종 결론 문장 ID를 coreSentenceIds에 넣는다.
해당 문장에서는 가장 중요한 어휘를 후보로 포함한다.

[원문 보존]

- 원문·철자·시제·단복수·문장부호·순서를 수정하지 않는다.
- answerText(또는 originalText/token)는 원문 표면형 그대로.
- lemma는 표제어, occurrenceIndex는 문장 내 등장 순서(0부터).
- wordFamily는 어족 판별용 기본형.

[점수] 각 항목 0~5 정수

- centrality, learningValue, contextImportance, examUsefulness, collocationValue
- commonnessPenalty, redundancyPenalty (높을수록 감점)

[출력]

빈칸이 적용된 지문 전체를 출력하지 않는다.
topic, coreSentenceIds, candidates만 구조화 JSON으로 반환한다.
최종 빈칸 개수를 스스로 결정하지 말고, 충분한 후보(목표보다 넉넉히)와 평가값만 반환한다.
reason은 한 문장 이하로 짧게 작성한다.`;

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
    Math.max(input.targetCount + 12, 28),
    48
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
referenceTargetCount: ${input.targetCount}
candidatePoolSize: ${upper}
maxPerSentence: ${input.maxPerSentence}
oneWordOnly: true
note: 최종 개수는 코드가 결정한다. A등급을 충분히, 이어서 B등급을 반환하라. C등급은 반환하지 마라. existingVocabulary는 참고만 한다. 한글 해석 문체는 고려하지 않는다.
</blank_request>

<existingVocabulary>
${vocabBlock}
</existingVocabulary>

<sentences>
${sentenceBlock}
</sentences>

위 문장 ID만 사용하라.
원문을 수정·재작성하지 말고, 빈칸 후보를 약 ${upper}개 선정·평가하라.
topic, coreSentenceIds, candidates를 JSON으로 반환한다.`;
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
