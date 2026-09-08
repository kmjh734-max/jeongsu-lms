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
쉬운 문항이라도 정답이 하나이고 오답이 문법적으로 틀리면 만든다. 쉽다는 이유만으로 건너뛰지 않는다.
공통 주어, 공통 목적어, 공통 수식어를 선택지 양쪽에 반복하지 않는다.
문장 전체나 절 전체를 선택지로 만들지 않는다.

correctText와 incorrectText는 실제로 달라지는 최소 표현만 쓴다(보통 1~6단어, 최대 7단어).

단어 수와 상관없이, 문장에 해당 문법이 있고 정답이 하나면 문항을 만든다.
먼저 모든 문장을 조사하고, 한 문장에서 첫 문법만 고르지 마라.
관계사, 명사절, 수일치, 조동사 뒤 원형, 시제·태, 능동·수동, to부정사·동명사·분사, 전치사 뒤 동명사, 목적격 보어, 병렬, 간접의문문, 비교·가정·도치, 생략·대용·강조, 형용사·부사, 명령문, 주요 동사 구문, 공유되는 to·조동사·접속사를 끝까지 찾아라.
canCreateUniqueChoice가 true인 포인트마다 후보를 만들어라.
한 문장에 범위가 겹치지 않는 독립 포인트가 여러 개면 여러 문항을 만든다.
같은 문장에서 범위가 겹치지 않는 문법은 각각 문항으로 만든다. 억지로 채우지 않는다.
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

desiredCandidateCount는 상한이다. 단어 수 목표를 채우지 마라.
해당 문법이 있으면 문항을 만들고, 없으면 만들지 마라.
정답이 애매하거나 둘 다 가능하면 넣지 마라.
difficultyLevel은 BASIC | CORE | ADVANCED 중 하나다. 쉬운 명확한 문항은 BASIC이다.
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
쉽다는 이유만으로 거절하지 않는다. 명확한 수일치, 태, 준동사, 병렬, 관계사도 정답이 하나면 BASIC으로 승인한다.
선택지가 문장이나 절 전체를 불필요하게 포함하면 거절한다.
난이도나 고등학교 가치 점수로 탈락시키지 않는다.

특히 다음만 반드시 거절한다:
- sentenceWithIncorrect가 문법적으로도 성립하는 경우 (BOTH_OPTIONS_POSSIBLE)
- 의미·문체·어휘만 다른 경우 (WRONG_ONLY_SEMANTICALLY_AWKWARD, LEXICAL_OR_COLLOCATION)
- 정답이 원문이 아니거나 복원이 실패하는 경우
- 오답이 비문법이 아니라 부자연스럽기만 한 경우
- 해설할 문법 규칙이 없는 경우

TOO_TRIVIAL, NOT_HIGH_SCHOOL_GRAMMAR, 낮은 difficultyScore만으로는 거절하지 않는다.
유효성 플래그가 모두 참이면 쉬운 문항도 accepted=true로 둔다.
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

export type GrammarChoiceTopUpBrief = {
  missingCount: number;
  approvedSpans: Array<{ sentenceId: string; sourceSpan: string; grammarCategory: string }>;
  rejected: Array<{ sentenceId: string; correctText: string; incorrectText: string; reason: string }>;
  uncoveredSentenceIds: string[];
  unusedPoints: Array<{ sentenceId: string; sourceSpan: string; category: string; rule: string }>;
};

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
    topUp?: GrammarChoiceTopUpBrief | null;
  }>;
}): string {
  const quotas = input.passages
    .map((p) => {
      const top = p.topUp
        ? ` 보충 ${p.topUp.missingCount}문항 분량. 이미 승인된 span과 같은 오답을 재사용하지 마라.`
        : "";
      return `- passageId=${p.passageId} title="${p.title}": 상한 ${p.desiredCandidateCount}개. 문장 ${p.sentences.length}개를 모두 보고, 해당 문법이 있는 곳만 출제.${top}`;
    })
    .join("\n");

  return [
    "단어 수와 상관없이 지문을 분석하고, 해당 문법이 있으면 그 포인트마다 문항 1개를 만들어라.",
    "한 문장의 첫 포인트만 고르지 마라. analysisHints만 보지 말고 원문을 다시 보라.",
    "개수를 채우려고 애매한 문항을 추가하지 마라. 해설은 한 문장으로 짧게 써라.",
    "quotedExpression을 그대로 correctText로 복사하지 마라.",
    "difficultyLevel은 BASIC | CORE | ADVANCED. 쉽지만 정답이 하나면 BASIC으로 포함하라.",
    "이미 승인된 source span, 같은 오답, 탈락한 쌍은 다시 만들지 마라.",
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
    "쉽다는 이유만으로 TOO_TRIVIAL을 넣거나 accepted를 false로 두지 마라.",
    "difficultyLevel은 기록만 하고 승인 여부에 쓰지 마라.",
    "",
    JSON.stringify(input, null, 2),
  ].join("\n");
}
