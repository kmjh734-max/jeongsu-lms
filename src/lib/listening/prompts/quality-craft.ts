/**
 * 실제 시험 수준 문항을 위한 출제 요령 (quality-rubric.md 수치).
 * 예전 생성본은 대본이 짧고(고1 목적 84단어 ↔ 교재 평균 127), 한 턴을 긴 한 문장으로만 써서 딱딱했으며,
 * 정답이 대본 한 줄의 직역(고1 의견 keyOv 0.83 ↔ 교재 0.40)이거나 응답 유형이 모두
 * "Could you …?" → "Sure, I'll …" 되풀이였다(교재 lastYN 0.05~0.22, lastEcho 0.03).
 * 예시 대사는 모두 새로 쓴 것이다 — 시판 교재·기출 문장을 넣지 않는다.
 */
import {
  isHighSchoolListeningGrade,
  type ListeningGradeLevel,
} from "@/lib/listening/grade-level";
import { getTypeDef, keyForCode, type ListeningTypeKey } from "@/lib/listening/type-catalog";

export interface ListeningTypeTarget {
  /** 대본 영어 단어 수 범위 */
  words: [number, number];
  /** 대화 턴 수 범위 (담화는 없음) */
  turns?: [number, number];
  /** 대화 문장당 단어 수 목표 (평균) */
  dialogueWordsPerSentence: [number, number];
  /** 대화 턴당 평균 단어 수 목표 (교재 실측: 고1 12~13, 중1 약 7.5, 중2 약 8, 중3 약 9~10) */
  wordsPerTurn: [number, number];
  /** 응답 선택지 영어 단어 수 (교재 실측: 중1 3~7, 중2 4~8, 중3 4~9, 고등 5~10) */
  responseChoiceWords: [number, number];
}

type HighTarget = { words: [number, number]; turns?: [number, number] };

/**
 * 고등 1~17번 분량 목표 — 이 표가 유일한 기준이다(exam-difficulty·exam-types-high*·공통 프롬프트는 여기서 읽는다).
 * 고1: 시판 고1 모의고사 20회 실측 중앙값·분위(정답 줄 제외). 고3은 수능 수준(고1보다 5~15% 김), 고2는 그 중간.
 * 짧은 응답(11·12)은 학년이 올라가도 3턴을 유지한다.
 */
const HIGH_TARGETS: Record<"high1" | "high2" | "high3", Record<number, HighTarget>> = {
  high1: {
    1: { words: [115, 140] },
    2: { words: [120, 160], turns: [10, 12] },
    3: { words: [90, 115] },
    4: { words: [145, 183], turns: [10, 12] },
    5: { words: [120, 160], turns: [10, 12] },
    6: { words: [115, 160], turns: [11, 13] },
    7: { words: [120, 155], turns: [11, 12] },
    8: { words: [115, 160], turns: [10, 12] },
    9: { words: [110, 145] },
    10: { words: [130, 155], turns: [10, 12] },
    11: { words: [32, 55], turns: [3, 3] },
    12: { words: [32, 55], turns: [3, 3] },
    13: { words: [105, 140], turns: [9, 11] },
    14: { words: [105, 140], turns: [9, 11] },
    15: { words: [125, 155] },
    16: { words: [160, 185] },
    17: { words: [160, 185] },
  },
  high2: {
    1: { words: [115, 150] },
    2: { words: [125, 165], turns: [10, 12] },
    3: { words: [95, 120] },
    4: { words: [145, 190], turns: [10, 12] },
    5: { words: [125, 165], turns: [10, 12] },
    6: { words: [125, 165], turns: [11, 13] },
    7: { words: [125, 160], turns: [11, 12] },
    8: { words: [120, 165], turns: [10, 12] },
    9: { words: [115, 150] },
    10: { words: [135, 165], turns: [10, 12] },
    11: { words: [35, 55], turns: [3, 3] },
    12: { words: [35, 55], turns: [3, 3] },
    13: { words: [110, 150], turns: [9, 12] },
    14: { words: [110, 150], turns: [9, 12] },
    15: { words: [130, 160] },
    16: { words: [165, 190] },
    17: { words: [165, 190] },
  },
  high3: {
    1: { words: [120, 155] },
    2: { words: [130, 170], turns: [11, 13] },
    3: { words: [100, 125] },
    4: { words: [150, 195], turns: [11, 13] },
    5: { words: [135, 175], turns: [11, 13] },
    6: { words: [135, 175], turns: [11, 13] },
    7: { words: [130, 170], turns: [11, 13] },
    8: { words: [125, 170], turns: [11, 13] },
    9: { words: [125, 160] },
    10: { words: [140, 175], turns: [11, 13] },
    11: { words: [35, 58], turns: [3, 3] },
    12: { words: [35, 58], turns: [3, 3] },
    13: { words: [120, 160], turns: [10, 12] },
    14: { words: [120, 160], turns: [10, 12] },
    15: { words: [135, 165] },
    16: { words: [170, 195] },
    17: { words: [170, 195] },
  },
};

/** 중등 담화형 유형 (그 외는 대화) — 옛 모듈 1·3·5·14 + 새 담화 유형(모듈 번호 21~) */
const MIDDLE_MONOLOGUE = new Set([1, 3, 5, 14]);

/** 모듈 번호 → 새 중등 유형 키 (21~) */
function newMiddleKey(typeId: number): ListeningTypeKey | undefined {
  return typeId > 20 ? keyForCode(typeId, "middle") : undefined;
}

/**
 * 짧은 대화 5개(그림 상황·어색한 대화) 총 단어 수 — 번호 안내("Number one.")는 빼고 센다.
 * 공식 기출 실측: 중2 그림 상황 45~60, 중3 그림 상황 65~90·어색한 대화 50~85.
 */
const MINI_DIALOGUE_WORDS: Record<"middle1" | "middle2" | "middle3", [number, number]> = {
  middle1: [40, 60],
  middle2: [50, 75],
  middle3: [60, 90],
};

/** 학년 기본값과 다른 새 유형 분량 (공식 기출 실측·설계 보고서 5-2) */
const NEW_TYPE_WORDS: Partial<Record<"middle2" | "middle3", Partial<Record<ListeningTypeKey, [number, number]>>>> = {
  middle3: {
    M_SITUATION_SAY: [70, 100],
    M_DESCRIBE: [55, 85],
    M_PURPOSE_ANNOUNCE: [65, 95],
  },
  middle2: {
    M_TOPIC_MONO: [55, 80],
  },
};

/**
 * 중등 분량 목표. 중학 교재 실측(대화 1문항, 정답 줄 제외): 중1 약 46단어(35~53)·6턴, 중2 약 63(53~74)·8턴,
 * 중3 약 76(64~94)·8~9턴, 문장당 6~7단어. 중2는 선생님 결정으로 기출보다 길게(75~115).
 */
const MIDDLE_TARGETS: Record<
  "middle1" | "middle2" | "middle3",
  {
    dialogue: { words: [number, number]; turns: [number, number] };
    monologue: [number, number];
    response: { words: [number, number]; turns: [number, number] };
    wps: [number, number];
    wpt: [number, number];
    /** 응답 선택지 영어 단어 수 */
    responseChoiceWords: [number, number];
  }
> = {
  middle1: { dialogue: { words: [40, 55], turns: [5, 7] }, monologue: [32, 50], response: { words: [40, 55], turns: [5, 7] }, wps: [5, 8], wpt: [6, 9], responseChoiceWords: [3, 7] },
  // 중2는 선생님 결정(2026-09-16)으로 연습용으로 기출(약 63단어)보다 길게 75~115단어
  middle2: { dialogue: { words: [75, 115], turns: [8, 11] }, monologue: [60, 85], response: { words: [65, 95], turns: [7, 10] }, wps: [5, 8], wpt: [8, 11], responseChoiceWords: [4, 8] },
  middle3: { dialogue: { words: [70, 110], turns: [7, 10] }, monologue: [60, 90], response: { words: [70, 100], turns: [7, 9] }, wps: [6, 9], wpt: [8, 11], responseChoiceWords: [4, 9] },
};

/** 학년·유형별 대본 분량 목표 (모르면 null) */
export function listeningTypeTarget(
  typeId: number,
  grade: ListeningGradeLevel | undefined
): ListeningTypeTarget | null {
  if (isHighSchoolListeningGrade(grade)) {
    const g = grade === "high2" || grade === "high3" ? grade : "high1";
    const base = HIGH_TARGETS[g][typeId];
    if (!base) return null;
    const wpt: [number, number] = g === "high3" ? [12, 15] : g === "high2" ? [11, 15] : [11, 14];
    return { ...base, dialogueWordsPerSentence: [5, 9], wordsPerTurn: wpt, responseChoiceWords: [5, 10] };
  }
  const g = grade === "middle2" || grade === "middle3" ? grade : "middle1";
  const t = MIDDLE_TARGETS[g];
  const common = { dialogueWordsPerSentence: t.wps, wordsPerTurn: t.wpt, responseChoiceWords: t.responseChoiceWords };
  if (typeId === 19 || typeId === 20) return { words: t.response.words, turns: t.response.turns, ...common };
  if (MIDDLE_MONOLOGUE.has(typeId)) return { words: t.monologue, ...common };
  if (typeId >= 1 && typeId <= 20) return { words: t.dialogue.words, turns: t.dialogue.turns, ...common };
  const key = newMiddleKey(typeId);
  if (!key) return null;
  const form = getTypeDef(key).scriptForm;
  // 짧은 대화 5개: 번호 안내를 뺀 10줄, 한 줄 5~9단어
  if (form === "mini_dialogues") return { words: MINI_DIALOGUE_WORDS[g], turns: [10, 10], ...common, wordsPerTurn: [5, 9] };
  const override = g === "middle1" ? undefined : NEW_TYPE_WORDS[g]?.[key];
  if (form === "monologue") return { words: override ?? t.monologue, ...common };
  return { words: override ?? t.dialogue.words, turns: t.dialogue.turns, ...common };
}

/** 프롬프트용 한 줄 분량 표기 ("115~140단어 (담화)", "120~160단어, 10~12턴, 턴당 약 11~14단어") */
export function listeningTargetText(typeId: number, grade: ListeningGradeLevel | undefined): string {
  const t = listeningTypeTarget(typeId, grade);
  if (!t) return "";
  if (!t.turns) return `${t.words[0]}~${t.words[1]}단어 (담화)`;
  const turns = t.turns[0] === t.turns[1] ? `${t.turns[0]}턴` : `${t.turns[0]}~${t.turns[1]}턴`;
  return `${t.words[0]}~${t.words[1]}단어, ${turns}, 턴당 약 ${t.wordsPerTurn[0]}~${t.wordsPerTurn[1]}단어`;
}

const COMMON_CRAFT = `
[실제 시험 수준 — 반드시 지킬 출제 요령]
1. 분량과 구어체: 대본 총 단어 수는 아래 유형별 범위 안이어야 하고, 하한보다 짧으면 실패다.
   분량은 턴을 늘려서가 아니라 한 턴을 두 문장으로 채워서 맞춘다 — 대부분의 턴 = 짧은 반응·질문 + 이유·정보 한 문장.
   예) "Really? I thought the bus was faster on weekends." / "That's true, but the stop is a ten-minute walk from here."
   한 문장은 15단어를 넘기지 않고, 5~6단어 한 문장으로 끝나는 턴은 전체의 3분의 1 이하로.
   Oh / Well / Actually / That's a relief 같은 반응과 축약형(I'm, don't, let's, that's)을 쓴다.
   반응어 외에는 주어·동사를 갖춘 문법적으로 맞는 문장만 쓴다 (전보식 영어 금지: "Did you once want photographer work?" ✗).
   말하는 영어는 쉬운 단어가 대부분이다 — 8글자 이상 긴 단어(information, participate, environmental …)는 꼭 필요할 때만.
   다 쓴 뒤 segments 단어 수를 세어 범위를 확인한다.
2. 해설하듯 말하지 않는다: "The only thing left is …", "The real reason is …", "I feel proud because …",
   "My dream job is …" 처럼 정답을 그대로 알려 주는 문장 금지. 단서는 행동·상황·반응으로 드러낸다.
3. 정답은 재진술: 한국어 선택지는 대본 한 문장의 직역이 아니라 요점을 다른 말로 요약한다.
   영어 선택지는 대본의 핵심 단어를 그대로 되풀이하지 않는다.
4. 오답은 대본에서 나온다: 이미 끝난 일, 상대가 할 일, 제안했다가 거절된 일, 추측했다가 부정된 이유,
   다른 시간·장소의 정보처럼 대본에 등장했지만 질문의 답은 아닌 것을 오답 2~3개로 쓴다. 황당한 오답 금지.
5. 정답은 대본 근거로 하나만 확정되고, 나머지 넷은 대본으로 반박되어야 한다.
6. 한 세트 안에서 같은 장면(동아리 부스·학교 축제·과학 발표 등)을 반복하지 않는다. 아래 「소재 영역」을 따른다.
`.trim();

const HIGH_TYPE_CRAFT: Record<number, string> = {
  1: "목적: 인사·배경으로 시작하고 목적은 중반 이후에. 오답은 대본 소재어(행사·장소 등)를 쓴 다른 목적(홍보·사과·모집 등).",
  2: "의견: 대상 화자가 의견을 2~3번 다른 표현으로 말한다(I think / You'd better / It's worth …). 정답은 일반화한 문장, 오답에는 상대 화자의 말·세부 사실·반대 주장을 넣는다.",
  3: "요지: 문제 제기→주장→예시→재강조. 정답은 마지막 재강조 문장의 직역이 아니라 일반화.",
  4: "그림: 그림 속 사물 5개를 왼쪽→오른쪽·위→아래처럼 자연스러운 순서로 언급한다(First/Second 같은 번호로 세지 않는다). 각 언급에 짧은 반응·이유를 섞는다(\"Oh, the striped one? It matches the sofa.\"). 사물은 정확히 5개만 묘사. 분량은 도입 2턴 + 사물마다 묘사·반응 2턴 정도로 채운다.",
  5: "할 일: 준비 점검 대화. 이미 한 일·상대가 할 일·하려다 필요 없다고 한 일을 오답으로. 정답 과제는 \"The only thing left\" 없이 후반부 부탁·제안과 수락으로 정한다.",
  6: "금액: 단가·수량·할인(쿠폰·회원·%)·추가 요금. 할인 전 합계는 말해도 되지만 최종 지불액은 말하지 않는다. 오답은 할인 누락·순서 착오·수량 착오 값이며 정답은 오름차순 선택지에서 ②~④ 자리. 특정 품목에만 적용되는 할인은 price_calculation adjustment에 applies_to로 품목 label을 적는다. % 할인 뒤 금액이 센트 없이 떨어지도록 단가·수량을 고른다(10% 할인이면 할인 대상 합계를 10의 배수로) — 반올림한 금액을 정답으로 쓰지 않는다.",
  7: "이유: 상대가 1~2번 틀린 이유를 추측→부정(No, that's not it)→진짜 이유. 진짜 이유는 선택지와 다른 말로 설명한다.",
  8: "미언급: 네 항목은 질문·대답으로 자연스럽게 나오고, 선택지는 대본 언급 순서대로 쓴다.",
  9: "내용 불일치: 선택지 5개는 대본 순서대로. 정답은 수·요일·대상 등 한 요소만 바꾼 문장.",
  10: "표: 조건 3~4개를 차례로 적용하고 마지막은 \"that one / this model\"처럼 가리키기만. 오답 행은 각각 조건을 정확히 하나씩만 어긴다. table_data.value는 열 이름이 드러나게 \"열이름: 값 / 열이름: 값\" 형식.",
  11: "짧은 응답(여자의 마지막 말 → 남자의 응답: 마지막 segment W, blank_speaker M, question_text \"Man: _____\"): A-B-A 3턴. 마지막 말은 평서문(걱정·소식·계획)이나 의문사 의문문 위주 — \"Could you …? / Shall I …?\" 부탁으로 끝내고 \"Sure, I'll …\"을 정답으로 하는 구조 금지. 정답은 마지막 말의 단어를 되풀이하지 않는다.",
  12: "짧은 응답(남자의 마지막 말 → 여자의 응답: 마지막 segment M, blank_speaker W, \"Woman: _____\"): 11번과 같은 규칙, 다른 응답 기능(위로·거절·조건부 수락·정보 제공 등).",
  13: "긴 응답(남자의 마지막 말 → 여자의 응답: 마지막 segment M, blank_speaker W, \"Woman: _____\"). 마지막 말은 고민·의견·계획을 말하는 평서문이나 의문사 의문문. 정답은 대화 전체 맥락을 종합한 반응이고, 오답 2개 이상은 대본 단어를 빌린 함정.",
  14: "긴 응답(여자의 마지막 말 → 남자의 응답: 마지막 segment W, blank_speaker M, \"Man: _____\"): 13번과 같은 규칙. Yes/No 부탁→수락 되풀이 금지.",
  15: "상황 발화: 배경→문제→A의 판단. 마지막에 A가 하려는 말의 취지는 밝히되(wants to suggest / encourage …) 정답 문장과 같은 단어로 쓰지 않는다.",
  16: "주제: 도입→항목 4개(각 1~2문장 설명)→마무리. 정답은 영어 주제구(ways to / effects of / reasons why …)로, 첫 문장을 그대로 옮기지 않는다.",
  17: "언급 여부: 같은 범주의 구체 명사(동물·음식·장소·도구 등) 1~3단어. 지시문 범주어와 선택지가 정확히 맞아야 한다. 4개는 대본에 순서대로 등장.",
};

const MIDDLE_TYPE_CRAFT: Record<number, string> = {
  1: "묘사: 단서 3~4개를 일반→구체 순으로, 결정적 단서는 뒤에. 오답은 같은 범주에서 앞 단서 일부와 맞는 것.",
  2: "구입: 조건을 하나씩 바꾸다 결정. 마지막 말이 정답 선택지 전체를 되풀이하지 않는다(\"I'll take the one with the stars.\" 정도).",
  3: "날씨: 정답 외 날씨 2~3개가 다른 시점·지역으로 대본에 나온다.",
  4: "의도: 마지막 말은 의도어(칭찬·사과 등)를 직접 말하지 않는다. 마지막 말은 대화 상대에게 하는 말이어야 한다(자리에 없는 사람에게 하는 말 금지).",
  5: "언급하지 않은 것: 선택지는 대본 언급 순서대로.",
  6: "시각: 후보 시각 3개 이상이 제안·거절되고 마지막에 확정. 오름차순 선택지에서 정답은 ②~④ 자리.",
  7: "장래 희망: 다른 직업(부모님 권유·예전 꿈·친구의 꿈) 1~2개를 대본에 넣어 오답으로 쓰고, 정답 직업은 하는 일로 설명하거나 한 번만 말한다.",
  8: "심정: 상황·반응으로 드러내고, 오답 1~2개는 상황상 그럴듯한 감정(처음 걱정했다가 안도 등).",
  9: "직후 할 일: 오답은 이미 한 일·상대가 할 일·나중에 할 일. 정답 동작은 선택지 직역과 다른 표현으로.",
  10: "핵심 내용: 한 주제를 여러 턴에 걸쳐 다루고, 오답은 대본에 스쳐 간 소재.",
  11: "이동 방법: 다른 교통수단 2~3개를 이유와 함께 배제한 뒤 결정.",
  12: "이유: 상대가 이유를 추측→부정→진짜 이유. 추측된 이유를 오답으로.",
  13: "장소: 장소명을 말하지 않고 단서 2개 이상으로 추론.",
  14: "표 불일치: 표 5행은 대본 언급 순서.",
  15: "부탁: 앞에서 거절·보류된 다른 부탁이나 이미 끝난 일을 오답으로. 부탁 표현은 선택지 직역과 다르게.",
  16: "제안: 상대가 제안을 받기 전 고민·다른 선택지를 말하게 하고, 제안하는 사람이 스스로 할 일은 오답으로.",
  17: "특정 시점 할 일: 원래 계획·취소된 일·다른 날 할 일을 오답으로.",
  18: "직업: 직업명을 말하지 않는다. 대본에 나온 다른 사람·동물·물건과 관련된 직업을 오답으로.",
  19: "응답: 마지막 말이 Yes/No 부탁이고 정답이 \"Sure, I'll …\" 되풀이인 구조 금지. 정답은 마지막 말 단어를 되풀이하지 않고, 오답 1~2개는 대본 단어를 빌린 함정.",
  20: "응답: 19번과 같은 규칙. 황당한 오답(맥락과 전혀 무관한 문장) 대신 기능이 어긋난 응답으로.",
};

/** 응답 유형 예시 (새로 쓴 대사) — 되풀이 응답을 피하는 법 */
const RESPONSE_EXEMPLAR = `
[응답 유형 예시 — 새로 쓴 대사, 그대로 쓰지 말고 구조만 참고]
나쁜 예: W: Shall I move your booking to Room 407? → 정답 "Yes, please move it to Room 407." (앞말 되풀이)
좋은 예: W: I finally finished the recycling poster. M: Nice! Did you add the collection dates? W: Oh no, I forgot. And I already printed thirty copies.
  → M 정답: "Don't worry. We can put the dates on small stickers."
  → 오답(대본 단어 함정): "Thirty copies should be enough for our class." / "I'm glad the recycling drive went well."
`.trim();

function isResponseType(typeId: number, grade: ListeningGradeLevel | undefined): boolean {
  return isHighSchoolListeningGrade(grade) ? typeId >= 11 && typeId <= 14 : typeId === 19 || typeId === 20;
}

/** 영어 발화 선택지 길이를 알려 줄 유형 (응답 + 중등 상황에 맞는 말) */
function hasEnglishUtteranceChoices(typeId: number, grade: ListeningGradeLevel | undefined): boolean {
  return isResponseType(typeId, grade) || (!isHighSchoolListeningGrade(grade) && newMiddleKey(typeId) === "M_SITUATION_SAY");
}

/** 학년에 따라 달라지는 유형 규칙 (교재 실측) */
function gradeSpecificNote(typeId: number, grade: ListeningGradeLevel | undefined): string {
  if (isHighSchoolListeningGrade(grade)) return "";
  if (typeId === 8) {
    // 선택지 언어(영어 형용사 / 한국어 명사)는 배정된 변형이 정한다 — 중2 영어 3 : 한국어 1, 중3 영어
    return grade === "middle2" || grade === "middle3"
      ? "대상 화자는 감정 단어를 직접 말하지 않는다(상황·반응으로). 선택지는 배정된 형식(영어 감정 형용사 소문자 5개 또는 한국어 감정 명사 5개)으로 쓴다."
      : "중1은 감정 단어를 한 번 직접 말해도 되지만, 정답 외 감정 1~2개도 상황상 그럴듯해야 한다.";
  }
  return "";
}

function targetLine(typeId: number, grade: ListeningGradeLevel | undefined): string {
  const text = listeningTargetText(typeId, grade);
  if (!text) return "";
  const t = listeningTypeTarget(typeId, grade)!;
  const choice = hasEnglishUtteranceChoices(typeId, grade) ? `, 응답 선택지 ${t.responseChoiceWords[0]}~${t.responseChoiceWords[1]}단어` : "";
  return `${text}(하한 미만 금지)${choice}`;
}

/** 요청한 유형들에 대한 출제 요령 블록 (공통 요령 + 유형별 분량·설계) */
export function buildQualityCraftBlock(
  typeIds: number[],
  grade: ListeningGradeLevel | undefined
): string {
  const unique = [...new Set(typeIds)].sort((a, b) => a - b);
  const high = isHighSchoolListeningGrade(grade);
  const craft = high ? HIGH_TYPE_CRAFT : MIDDLE_TYPE_CRAFT;
  const lines = unique
    .map((id) => {
      const target = targetLine(id, grade);
      const newKey = high ? undefined : newMiddleKey(id);
      const typeCraft = craft[id] ?? (newKey ? getTypeDef(newKey).craft : "");
      const note = [typeCraft, gradeSpecificNote(id, grade)].filter(Boolean).join(" ");
      if (!target && !note) return "";
      return `- 유형 ${id}: ${target}${target && note ? " — " : ""}${note}`;
    })
    .filter(Boolean);
  const sample = listeningTypeTarget(unique[0] ?? 2, grade);
  const wps = sample?.dialogueWordsPerSentence ?? [5, 9];
  const wpt = sample?.wordsPerTurn ?? [10, 13];
  const parts = [
    COMMON_CRAFT,
    `대화: 문장당 평균 ${wps[0]}~${wps[1]}단어, 턴당 평균 ${wpt[0]}~${wpt[1]}단어(대부분 두 문장). 담화는 문장당 10~15단어.`,
    lines.length ? `[유형별 분량·설계 (이 요청에 해당하는 유형)]\n${lines.join("\n")}` : "",
    unique.some((id) => isResponseType(id, grade)) ? RESPONSE_EXEMPLAR : "",
  ];
  return parts.filter(Boolean).join("\n\n");
}
