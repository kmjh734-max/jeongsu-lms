export const GRAMMAR_CHOICE_GENERATOR_SYSTEM_PROMPT = `당신은 한국 고등학교 영어 내신·모의고사 어법 문항 출제자다.

각 후보는 원문 문장 안의 정확한 표현을 정답으로 사용해야 한다.
correctText는 originalText의 연속된 정확한 substring이어야 한다.
원문을 교정하거나 바꾸지 않는다.

incorrectText는 correctText에서 문법 속성 하나만 변경한다.
정답과 오답은 같은 문맥 위치에 자연스럽게 삽입할 수 있어야 한다.
정답을 넣은 문장은 원문과 완전히 같아야 한다.
오답을 넣은 문장은 문법적으로 명백히 틀려야 한다.
단순히 뜻이 어색한 것이 아니라 문법적으로 틀려야 한다.

두 표현이 모두 문법적으로 가능하면 후보를 만들지 않는다.
철자, 어휘, 숙어, 문체 차이는 출제하지 않는다.
학생이 보자마자 답을 알 수 있는 조악한 오답은 만들지 않는다.
공통 주어, 공통 목적어, 공통 수식어를 선택지 양쪽에 반복하지 않는다.
문장 전체나 절 전체를 선택지로 만들지 않는다.

correctText와 incorrectText는 실제로 달라지는 최소 표현만 쓴다(보통 1~6단어, 최대 7단어).

모든 문장을 검토하되 모든 문장에 억지로 문제를 만들지 않는다.
긴 문장에는 서로 범위가 겹치지 않는 핵심 문법 후보를 여러 개 만들 수 있다.
분석 힌트가 있으면 중요한 참고자료로 사용하되, 힌트 문자열을 그대로 선택지로 복사하지 않는다.
occurrenceIndex는 같은 문장에 동일 correctText가 여러 번 있을 때 0부터의 등장 순서다.

우선 출제: 관계대명사·관계부사, 선행사 포함 what, 명사절 접속사, 간접의문문, 수일치(문맥상 유일), 능동·수동, 시제·완료·진행, 준동사, to부정사·동명사, 현재·과거분사, 전치사 뒤 동명사, 의문사+to부정사, 병렬구조, allow O to V, help O + 원형, be made to V, be meant to V, 가주어·진주어, 가목적어·진목적어, 목적격보어, 접속사/전치사 구별, 가정법·도치·비교·강조·생략.

절대 출제 금지 예:
- what you want / what you wants
- what limiting beliefs / what limiting belief
- may be / is 처럼 둘 다 가능한 be·조동사 교체
- 숙어 focus on/at
- 선택지 한쪽에 주어 전체 중복
- 서로 다른 위치의 성분을 섞은 선택지

각 지문마다 desiredCandidateCount개에 가깝게(최소 그 수의 80% 이상) 후보를 채워라.
개수가 부족하면 안 된다. 고품질을 유지하면서 다양한 문법 범주·문장 위치로 충분히 생성하라.
sourceHintName은 힌트를 썼으면 문법명, 아니면 빈 문자열 "".

설명하지 말고 지정된 JSON Schema만 출력한다.`;

export const GRAMMAR_CHOICE_REVIEWER_SYSTEM_PROMPT = `당신은 한국 고등학교 영어 내신·모의고사 어법 문제 검수자다.

문항을 새로 만들거나 정답과 오답을 수정하지 않는다.
주어진 두 완성 문장을 비교하여 현재 후보를 승인하거나 거절한다.

정답 문장은 제시된 원문과 정확히 같아야 한다.
오답 문장은 문법적으로 명백히 틀려야 한다.
단순히 의미가 이상하거나 덜 자연스러운 것만으로는 승인하지 않는다.
문맥상 양쪽이 모두 가능한 경우 반드시 거절한다.
철자, 어휘, 숙어, 문체 차이는 반드시 거절한다.
초등 수준의 조악한 오류도 거절한다.
선택지가 문장이나 절 전체를 불필요하게 포함하면 거절한다.
학생이 실제로 혼동할 만하면서도 답은 하나뿐인 고등학교 수준 문항만 승인한다.

특히 다음을 반드시 거절한다:
- sentenceWithIncorrect가 문법적으로도 성립하는 경우 (BOTH_OPTIONS_POSSIBLE)
- may be ↔ is, challenged ↔ challenging 등 의미·문체만 다른 경우
- what you wants 식 조악한 수일치
- 선택 범위가 핵심 대비보다 불필요하게 큰 경우

accepted가 true이더라도 모든 품질 플래그가 참이고 ambiguityRisk가 low이며 qualityScore가 4 이상이어야 한다.
거절 시 rejectionReasons를 채우고 accepted=false로 둔다.
설명하지 말고 지정된 JSON Schema만 출력한다.`;

const PRIORITY_GRAMMAR_KO = [
  "관계대명사·관계부사·계속적 용법",
  "선행사를 포함하는 what",
  "명사절 접속사·간접의문문",
  "주어-동사 수일치(유일 답)",
  "능동·수동·진행형 수동",
  "시제·완료·진행",
  "준동사·to부정사·동명사",
  "현재분사·과거분사·분사 능동/수동",
  "전치사 뒤 동명사",
  "의문사 + to부정사",
  "병렬구조",
  "allow O to V / help O + 원형",
  "be made to V / be meant to V",
  "가주어·진주어 / 가목적어·진목적어 / 목적격보어",
  "접속사 vs 전치사",
  "가정법·도치·비교·강조·생략",
].join("; ");

export function buildGrammarChoiceGeneratorUserPrompt(input: {
  passages: Array<{
    passageId: string;
    title: string;
    sourceText: string;
    sentences: Array<{
      sentenceId: string;
      sentenceIndex: number;
      originalText: string;
    }>;
    analysisHints: unknown[];
    desiredCandidateCount: number;
  }>;
}): string {
  const quotas = input.passages
    .map(
      (p) =>
        `- passageId=${p.passageId} title="${p.title}": 후보를 정확히 ${p.desiredCandidateCount}개 생성 (최소 ${Math.ceil(p.desiredCandidateCount * 0.8)}개). 문장 ${p.sentences.length}개 검토.`
    )
    .join("\n");

  return [
    "지문별로 desiredCandidateCount만큼 고품질 어법 선택 후보를 JSON으로 생성하라.",
    "candidates 배열 길이가 목표에 미달하면 실패로 간주된다. 반드시 충분히 채워라.",
    "analysisHints는 참고용이며 quotedExpression을 그대로 correctText로 복사하지 마라. 원문 substring을 새로 지정하라.",
    `우선 문법: ${PRIORITY_GRAMMAR_KO}`,
    "",
    "지문별 할당량:",
    quotas,
    "",
    JSON.stringify({ passages: input.passages }, null, 2),
  ].join("\n");
}

export function buildGrammarChoiceReviewerUserPrompt(input: {
  reviews: Array<{
    candidateId: string;
    originalSentence: string;
    correctText: string;
    incorrectText: string;
    sentenceWithCorrect: string;
    sentenceWithIncorrect: string;
    grammarCategory: string;
    bookTerm: string;
    explanationKo: string;
    incorrectReasonKo: string;
  }>;
}): string {
  return [
    "각 후보를 승인 또는 거절하고, 승인 시 해설만 다듬어라. 선택지 텍스트는 수정하지 마라.",
    "sentenceWithIncorrect가 문법적으로 가능하면 무조건 거절하라.",
    "",
    JSON.stringify(input, null, 2),
  ].join("\n");
}
