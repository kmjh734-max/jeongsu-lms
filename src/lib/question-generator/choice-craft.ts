/**
 * 보기(선택지) 제작 규칙 — 『예상 & 변형문제』 A4 세트(2026.7.11 63문항)에서 추출.
 * 정답/오답의 ‘만드는 방식’을 유형별로 고정한다.
 */

/** 모든 객관식 공통 */
export function choiceCraftCommonRules(): string {
  return `보기 공통 (A4 변형문제 동형):
- 정답 하나만. 두 보기가 동시에 맞으면 다시 작성.
- 보기 길이·구조·어휘 난이도를 비슷하게. 정답만 길고 구체적이지 않게.
- 보기끼리 의미 중복·포함 관계 금지.
- 지문 표현을 그대로 복사하지 말고 paraphrase (영어/한국어 모두).
- 황당·완전 무관 오답 금지. 지문 소재·어휘와 닿아 있되 핵심만 비틀 것.
- 오답 기법: 긍정↔부정, 원인↔결과, 주체↔대상, 범위 확대/축소, 정도 과장/약화, 세부→전체 일반화, 전체→사례 축소, 방향·조건 변경.`;
}

/** 주제 */
export function topicChoiceCraft(en: boolean): string {
  return `주제 보기 (A4 Q5·21·37형):
- 정답: 글 전체 핵심 대상+관계를 담은 ${en ? "영어 명사구/how절" : "한국어 구"}.
  예) "the two-way relationship where beliefs and actions influence each other"
  (한 방향만 말하면 오답).
- 오답 4개 역할 고정:
  1) 한 방향만 / 부분 주장
  2) 세부 사례·부수 소재로 좁힘
  3) 글보다 넓은·다른 요인 (social factors 등)
  4) 관련은 있으나 중심 아님 (consistency 문제 등)
- ${en ? "소문자 명사구 위주 (문장 전체 X)" : "간결한 명사구/절"}.`;
}

/** 제목 */
export function titleChoiceCraft(en: boolean): string {
  return `제목 보기 (A4 Q6·22·38형):
- 정답: 핵심 반전/주장을 함축. 원문 문장 복사 금지.
  예) "Beyond a One-Way Street: How Action and Belief Influence Each Other"
  / "Speak Less to Hear More: …" / "Knowledge Is Not Enough: Why … Requires Action"
- 오답: 지문 키워드는 쓰되 메시지 빗나감 (건강습관, 스피킹 스킬, 세부 사례만 등).
- 정답만 과도한 은유·화려함 금지. ${en ? "Title Case 영어" : "자연스러운 한국어 제목"}.`;
}

/** 요지 */
export function summaryChoiceCraft(en: boolean): string {
  return `요지 보기 (A4 Q7–8·23–24·39–40형):
- 정답: 필자 최종 메시지 한 문장 (소재 소개 X, 판단·시사점 O).
  양방향·조건이 있으면 둘 다 담을 것.
  예) "행동은 신념을 반영할 뿐 아니라 신념을 형성하기도 한다."
- 오답:
  1) 부분 사실(요지 아님) — 예: "행동이 항상 생각과 일치하진 않는다"(참이지만 요지 아님)
  2) 한 방향만 / 반대 주장
  3) 주변 사례·무관 주장
- ${en ? "영어 완전 문장, 원문 복사 금지" : "자연스러운 시험체 한국어"}.`;
}

/** 함축의미 */
export function impliedMeaningChoiceCraft(): string {
  return `함축의미 보기 (A4 Q9·25형):
- 밑줄은 비유·관용·문맥 의존 표현.
- 정답: 사전/직역이 아니라 앞뒤 논리를 추상화한 문맥 paraphrase.
  예) "the arrow … reverse direction"
    → ○ "our behaviors are just as capable of influencing our inner beliefs"
    → × "the arrow literally points the other way" / "do two things"류 일반론
  예) "a game of waiting for our own turn to speak"
    → ○ "an interaction where the focus is on preparing one's own response"
- 오답: 직역·반대·관련 심리 상식이나 지문과 다른 해석.
- 선택지 전부 영어 짧은 구/절, 길이 비슷.`;
}

/** 내용 불일치 */
export function contentFalseChoiceCraft(en: boolean): string {
  return `내용불일치 보기 (A4 Q10–11·26–27형):
- ④개는 지문 사실을 정확히 paraphrase한 참.
- ①개만 핵심 관계를 뒤집어 거짓.
  예) 지문 "행동이 생각을 바꿀 수 있다" → 거짓 "행동이 사고에 미치는 영향은 거의 없다"
  예) 지문 "말 줄이면 더 잘 듣는다" → 거짓 "말을 적게 할수록 듣는 능력은 저하된다"
- ‘언급되지 않음’만으로 오답 만들지 말 것. 지문 정보로 주체·방향·정도·조건을 왜곡.
- ${en ? "영어 paraphrase" : "한국어 시험체"}.`;
}

/** 어휘 문맥 */
export function vocabChoiceCraft(): string {
  return `어휘(문맥) 보기·밑줄 (A4 Q4·13·20·29·36형):
- 틀린 어휘 = 문법 OK + 문맥 방향 반대 (반의어·반대 평가).
  예) favor→dislike, reverse/opposite→same, eliminate→reinforce/strengthen,
      socialize→avoid, lower(risk)→increase, reflects→hides/contradicts
- 맞는 밑줄 = 원어와 가까운 동의·유사어로 자연스럽게 (shape, indicate, mirrors, noted…).
- ‘낯선 단어’가 아니라 ‘논리적으로 반대’인 단어.
- 개수형: 틀린 개수만 세고, 애매한 표현 남기지 말 것.`;
}

/** 무관한 문장 */
export function irrelevantChoiceCraft(): string {
  return `무관한 문장 (A4 Q15·31형):
- 큰 소재(심리·사회·건강 등)는 비슷하게 유지.
- 그러나 글의 논리(주장의 다음 단계)에는 기여하지 않음.
  예) 신념↔행동 글에 "직장 매너가 평판에 중요하다"
  예) 침묵·경청 글에 "도시 소음공해가 정신건강에 해롭다"
- 외계인·완전 딴 소재로 정답이 즉시 보이게 하지 말 것.
- 원문 핵심 문장을 무관으로 지정하지 말 것.`;
}

/** 문장 삽입 */
export function insertionChoiceCraft(): string {
  return `문장 삽입 (A4 Q14·30형):
- 삽입문에 대명사·지시·연결·반복어휘·앞 결과/뒤 원인 단서 중 ≥1.
- 정답 위치에서만 자연. 두 자리 가능하면 문장·위치 재선정.
- 예) "It turns out that the arrow…" → "more remarkable way" 직후.
- 예) "What if you were limited to fifty words…" → eliminate idea 직후, listen differently 직전.`;
}
