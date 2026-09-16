/**
 * 정답·상황 다양화 풀 (1번 대상 풀·19~20번 상황 풀과 같은 방식).
 * 같은 프롬프트로 여러 회차를 만들면 모델이 한 답으로 몰렸다
 * (직업=수의사 60/60, 언급하지 않은 것=참가비 60/60, 날씨=비 51/60, 이동=지하철 47/60).
 * 유형마다 정답과 상황을 미리 정해 프롬프트에 넣고, 같은 과정(학원·학년)에서 이미 쓴 정답은
 * 덜 쓴 것부터 고르게 해 한 정답이 반복되지 않게 한다.
 */
import {
  isHighSchoolListeningGrade,
  type ListeningGradeLevel,
} from "@/lib/listening/grade-level";

export interface AnswerVarietyAssignment {
  typeId: number;
  /** 지시문 변형 (심정: "en" 영어 형용사 / "ko" 한국어 명사) */
  variant?: string;
  /** 정답 선택지 (한국어 라벨 등) */
  answer: string;
  /** 대본 상황·소재 */
  scenario: string;
  /** 영어 대본에서 쓸 표현 참고 */
  hint?: string;
}

interface PoolEntry {
  answer: string;
  hint?: string;
}

interface VarietyPool {
  /** 무엇을 정해 주는지 (프롬프트 문구) */
  answerLabel: string;
  entries: PoolEntry[];
  scenarios: string[];
  /** 프롬프트에 덧붙일 주의 */
  note?: string;
  /** 정해 주는 값이 정답 선택지가 아니라 대본에 넣을 표현일 때 (표현의 의미 유형) */
  scriptValue?: boolean;
}

const WEATHER_SCENARIOS = [
  "서울 · 오늘 오후", "부산 · 내일 오전", "대구 · 토요일", "인천 · 오늘 저녁", "광주 · 내일 오후",
  "대전 · 일요일 오전", "강릉 · 오늘 오후", "제주 · 내일", "전주 · 금요일 오후", "춘천 · 오늘 밤",
];

const SCHOOL_SCENES = [
  "학교 축제 준비", "과학 발표 연습", "동아리 포스터 만들기", "가족 저녁 식사 준비", "친구 생일 선물 고르기",
  "체육대회 연습", "합창 대회 준비", "요리 수업", "캠핑 짐 싸기", "도서관 봉사 활동", "벼룩시장 준비",
  "반려동물 돌보기", "미술 전시회 관람", "학급 신문 만들기", "주말 자전거 여행 계획",
];

const EVENT_TOPICS = [
  "주말 과학 캠프", "학교 벼룩시장", "사진 동아리 전시회", "어린이 요리 교실", "청소년 독서 캠프",
  "학교 합창 대회", "지역 식물 박람회", "초보 코딩 교실", "가족 걷기 대회", "환경 정화 봉사",
  "영화 동아리 상영회", "종이접기 교실", "천문대 관측 행사", "도예 체험 수업", "보드게임 동아리 모임",
];

const MIDDLE_POOLS: Record<number, VarietyPool> = {
  3: {
    answerLabel: "정답 날씨",
    entries: [
      { answer: "맑음", hint: "sunny, clear sky" },
      { answer: "흐림", hint: "cloudy, gray sky" },
      { answer: "비", hint: "rain, rainy" },
      { answer: "눈", hint: "snow, snowy" },
      { answer: "바람", hint: "windy, strong wind" },
      { answer: "안개", hint: "foggy" },
    ],
    scenarios: WEATHER_SCENARIOS,
    note: "선택지는 한국어 날씨어 5개(맑음·흐림·비·눈·바람·안개 중). 다른 시간대의 다른 날씨도 한 번 언급해 오답 근거로 삼는다.",
  },
  4: {
    answerLabel: "마지막 말의 의도(정답)",
    entries: [
      { answer: "감사" }, { answer: "사과" }, { answer: "거절" }, { answer: "칭찬" }, { answer: "부탁" },
      { answer: "격려" }, { answer: "항의" }, { answer: "제안" }, { answer: "동의" }, { answer: "걱정" },
    ],
    scenarios: SCHOOL_SCENES,
    note: "격려는 걱정·긴장한 상대에게 하는 말이다(예: Don't worry. You can do it.). 긴장한 사람이 스스로 \"I can do it\"이라고 하는 것은 격려가 아니다.",
  },
  5: {
    answerLabel: "언급하지 않은 항목(정답)",
    entries: [
      { answer: "참가비" }, { answer: "모임 장소" }, { answer: "시작 날짜" }, { answer: "준비물" },
      { answer: "참가 대상" }, { answer: "신청 방법" }, { answer: "활동 내용" }, { answer: "모집 인원" },
      { answer: "모임 요일" }, { answer: "지도 교사" },
    ],
    scenarios: EVENT_TOPICS,
    note: "정답 항목 외 4개 항목은 대본에서 분명히 말한다. 정답 항목은 대본에서 전혀 언급하지 않는다.",
  },
  7: {
    answerLabel: "장래 희망(정답)",
    entries: [
      { answer: "수의사", hint: "vet" }, { answer: "요리사", hint: "chef" }, { answer: "기자", hint: "journalist" },
      { answer: "작가", hint: "writer" }, { answer: "과학자", hint: "scientist" }, { answer: "조종사", hint: "pilot" },
      { answer: "간호사", hint: "nurse" }, { answer: "통역사", hint: "interpreter" }, { answer: "프로그래머", hint: "programmer" },
      { answer: "화가", hint: "artist" }, { answer: "운동선수", hint: "athlete" }, { answer: "사진작가", hint: "photographer" },
    ],
    scenarios: SCHOOL_SCENES,
    note: "다른 직업 1~2개(부모님 권유·예전 꿈·친구의 꿈)를 대본에 넣어 오답 근거로 삼고, 정답 직업은 하는 일로 설명하거나 한 번만 말한다.",
  },
  8: {
    answerLabel: "심정(정답)",
    entries: [
      { answer: "안도" }, { answer: "자랑스러움" }, { answer: "실망" }, { answer: "걱정" }, { answer: "설렘" },
      { answer: "만족" }, { answer: "당황" }, { answer: "놀람" }, { answer: "지루함" }, { answer: "슬픔" },
    ],
    scenarios: SCHOOL_SCENES,
    note: "감정은 감정어 대신 몸의 반응·행동·다음에 하려는 일로 드러내고, 회차마다 다른 장치를 고른다(이 지침의 예시 문장을 그대로 옮겨 쓰지 않는다). 정답 외 감정 1~2개도 상황상 그럴듯하게 만든다. 감탄문으로 감정을 그대로 말하는 문장(What a relief! 등)은 그 감정어를 말한 것과 같으므로 쓰지 않는다.",
  },
  10: {
    answerLabel: "대화의 핵심 내용(정답)",
    entries: [
      { answer: "동아리 홍보 방법" }, { answer: "체육대회 응원 준비" }, { answer: "봉사 활동 장소" },
      { answer: "발표 순서 정하기" }, { answer: "벼룩시장 물건 가격" }, { answer: "학급 소풍 장소" },
      { answer: "과학 실험 주제" }, { answer: "생일 파티 준비물" }, { answer: "환경 캠페인 포스터" },
      { answer: "동영상 촬영 장소" }, { answer: "주말 공부 계획" }, { answer: "교실 화분 관리" },
    ],
    scenarios: SCHOOL_SCENES,
  },
  11: {
    answerLabel: "최종 이동 방법(정답)",
    entries: [
      { answer: "버스", hint: "take the bus" }, { answer: "지하철", hint: "take the subway" },
      { answer: "택시", hint: "take a taxi" }, { answer: "자전거", hint: "ride bikes" },
      { answer: "도보", hint: "walk" }, { answer: "기차", hint: "take the train" },
      { answer: "자동차", hint: "my dad will drive us" },
    ],
    scenarios: [
      "과학관 가기", "야구장 가기", "할머니 댁 방문", "미술관 관람", "영화관 가기", "해변 소풍", "시립 도서관 가기",
      "수족관 가기", "공원 음악회", "친구 집 모둠 과제",
    ],
    note: "다른 교통수단 2~3개를 이유와 함께 먼저 배제한 뒤 마지막에 정답 교통수단으로 결정한다.",
  },
  13: {
    answerLabel: "대화 장소(정답)",
    entries: [
      { answer: "우체국" }, { answer: "서점" }, { answer: "빵집" }, { answer: "미용실" }, { answer: "기차역" },
      { answer: "영화관" }, { answer: "문구점" }, { answer: "식당" }, { answer: "미술관" }, { answer: "공항" },
      { answer: "약국" }, { answer: "동물병원" }, { answer: "보건실" }, { answer: "신발 가게" }, { answer: "도서관" },
    ],
    scenarios: SCHOOL_SCENES,
    note: "장소 이름을 대본에서 직접 말하지 않고, 그 장소에서만 할 법한 말로 추론하게 한다.",
  },
  14: {
    answerLabel: "표에서 대본과 다른 항목(정답)",
    entries: [
      { answer: "날짜" }, { answer: "시간" }, { answer: "장소" }, { answer: "대상" }, { answer: "참가비" },
      { answer: "준비물" }, { answer: "신청 방법" }, { answer: "활동 내용" },
    ],
    scenarios: EVENT_TOPICS,
  },
  18: {
    answerLabel: "직업(정답)",
    entries: [
      { answer: "약사", hint: "medicine, twice a day" }, { answer: "사진작가", hint: "camera, smile, light" },
      { answer: "사서", hint: "library card, borrow, return" }, { answer: "제빵사", hint: "oven, bread, flour" },
      { answer: "소방관", hint: "fire, smoke alarm, hose" }, { answer: "미용사", hint: "haircut, wash, style" },
      { answer: "요리사", hint: "soup, sauce, kitchen" }, { answer: "경찰관", hint: "report, lost bag, ID" },
      { answer: "치과의사", hint: "teeth, brush, open wide" }, { answer: "수의사", hint: "pet, ears, check the dog" },
      { answer: "버스 기사", hint: "stop, get off, back door" }, { answer: "정비사", hint: "car, engine, tire" },
    ],
    scenarios: ["손님과 일하는 사람의 대화", "전화 예약 대화", "처음 방문한 손님과의 대화", "단골 손님과의 대화"],
    note: "직업을 가진 사람이 자기 일과 관련된 말을 2번 이상 하게 하고, 지시문은 그 사람(남자/여자)의 직업을 묻는다. 직업명을 대본에서 직접 말하지 않는다.",
  },
};

/**
 * 새 중등 유형(모듈 번호 21~)의 정답 풀 — 관계·설명 대상은 모델이 한두 답(손님–점원, 우산)으로 몰리기 쉽고,
 * 표현의 의미는 표현 하나(piece of cake)만 되풀이하기 쉬워 미리 정해 준다. 값은 모두 새로 고른 일반 표현이다.
 */
const NEW_MIDDLE_POOLS: Record<number, VarietyPool> = {
  28: {
    answerLabel: "두 사람의 관계(정답, 지시문 순서와 무관하게 'A – B')",
    entries: [
      { answer: "손님 – 사진사" }, { answer: "학생 – 사서" }, { answer: "손님 – 미용사" }, { answer: "승객 – 택시 기사" },
      { answer: "환자 – 간호사" }, { answer: "관람객 – 박물관 안내원" }, { answer: "학부모 – 담임 교사" },
      { answer: "투숙객 – 호텔 직원" }, { answer: "손님 – 꽃집 주인" }, { answer: "회원 – 운동 트레이너" },
      { answer: "주민 – 관리 사무소 직원" }, { answer: "고객 – 수리 기사" }, { answer: "선수 – 코치" },
      { answer: "손님 – 제빵사" }, { answer: "승객 – 승무원" },
    ],
    scenarios: ["처음 방문한 손님", "예약 확인", "문제 해결 요청", "물건 찾기", "일정 조율"],
    note: "직함·관계명을 대본에서 말하지 않고, 하는 일·요청·장소 단서 2개 이상으로 관계를 추론하게 한다.",
  },
  31: {
    answerLabel: "대본에 넣고 지시문에 인용할 영어 표현",
    scriptValue: true,
    entries: [
      { answer: "I'm all ears.", hint: "잘 듣고 있으니 말해 봐" },
      { answer: "Break a leg!", hint: "행운을 빌어" },
      { answer: "It's on me.", hint: "내가 낼게" },
      { answer: "My hands are full.", hint: "지금 너무 바빠" },
      { answer: "Hang in there.", hint: "조금만 더 힘내" },
      { answer: "I'm under the weather.", hint: "몸이 좀 안 좋아" },
      { answer: "That rings a bell.", hint: "들어 본 것 같아" },
      { answer: "It slipped my mind.", hint: "깜빡 잊었어" },
      { answer: "I'll sleep on it.", hint: "하루 더 생각해 볼게" },
      { answer: "Count me in.", hint: "나도 끼워 줘" },
      { answer: "It's not my cup of tea.", hint: "내 취향이 아니야" },
      { answer: "Let's call it a day.", hint: "오늘은 여기까지 하자" },
      { answer: "You read my mind.", hint: "내 생각과 똑같아" },
      { answer: "I'm on it.", hint: "바로 할게" },
      { answer: "Keep your chin up.", hint: "기운 내" },
    ],
    scenarios: SCHOOL_SCENES,
    note: "이 표현을 대상 화자의 대사에 철자 그대로 한 번 넣고, 지시문 “ ” 안에 그대로 인용한다. 정답 선택지는 이 표현의 맥락 속 의미를 한국어 구어 문장으로 쓴 것(위 참고 뜻을 그대로 옮기지 말고 대화 맥락에 맞게).",
  },
  32: {
    answerLabel: "설명 대상(정답)",
    entries: [
      { answer: "구명조끼" }, { answer: "돋보기" }, { answer: "줄자" }, { answer: "나침반" }, { answer: "손전등" },
      { answer: "체온계" }, { answer: "망원경" }, { answer: "앞치마" }, { answer: "연" }, { answer: "하모니카" },
      { answer: "스테이플러" }, { answer: "보온병" }, { answer: "우비" }, { answer: "모래시계" }, { answer: "지구본" },
    ],
    scenarios: ["물건 소개", "학교에서 쓰는 물건", "여행·야외 활동", "집에서 쓰는 물건"],
    note: "대상의 영어 이름을 대본에서 말하지 않는다. 오답 선택지는 같은 범주에서 앞 단서 일부와 맞는 물건으로 쓴다.",
  },
};

/** 중2·중3 심정: 교재 선택지가 모두 영어 감정 형용사다 (중1은 한국어 감정 명사) */
const MIDDLE_EMOTION_EN_POOL: VarietyPool = {
  answerLabel: "심정(정답, 영어 형용사)",
  entries: [
    { answer: "relieved" }, { answer: "proud" }, { answer: "disappointed" }, { answer: "worried" },
    { answer: "excited" }, { answer: "satisfied" }, { answer: "embarrassed" }, { answer: "surprised" },
    { answer: "bored" }, { answer: "nervous" }, { answer: "grateful" }, { answer: "upset" },
  ],
  scenarios: SCHOOL_SCENES,
  note: "선택지는 영어 감정 형용사 5개(소문자). 대상 화자는 감정 단어를 직접 말하지 않고 몸의 반응·행동·다음에 하려는 일로 드러내며, 회차마다 다른 장치를 고른다(이 지침의 예시 문장을 그대로 옮겨 쓰지 않는다). 감탄문으로 감정을 그대로 말하는 문장(What a relief! 등)은 그 감정어를 말한 것과 같으므로 쓰지 않는다.",
};

const HIGH_POOLS: Record<number, VarietyPool> = {
  4: {
    answerLabel: "그림에서 대화와 다르게 그릴 라벨(정답)",
    entries: [{ answer: "①" }, { answer: "②" }, { answer: "③" }, { answer: "④" }, { answer: "⑤" }],
    scenarios: [
      "학교 축제 무대", "과학 동아리 부스", "교실 게시판", "캠핑장 텐트 주변", "도서관 독서 코너", "공원 벼룩시장",
      "미술 전시실", "학교 정원", "요리 대회 테이블", "음악실 공연 준비",
    ],
    note: "correct_answer는 위 라벨 번호와 같게. 대화는 그림의 올바른 사실만 말하고, 그림만 그 라벨 하나를 다르게 그린다.",
  },
  6: {
    answerLabel: "구매 장소",
    entries: [
      { answer: "영화관 매표소" }, { answer: "박물관 입장권 창구" }, { answer: "문구점" }, { answer: "꽃집" },
      { answer: "자전거 대여소" }, { answer: "캠핑 용품점" }, { answer: "빵집" }, { answer: "수영장 매표소" },
      { answer: "놀이공원" }, { answer: "서점" }, { answer: "보드게임 카페" }, { answer: "기념품 가게" },
    ],
    scenarios: ["할인 쿠폰 1장", "10% 할인", "두 개 사면 하나 무료", "회원 할인 + 추가 옵션", "단체 할인"],
    note: "최종 지불 금액은 대본에서 말하지 않는다(단가·수량·할인만 말하고 학생이 계산).",
  },
  8: {
    answerLabel: "언급되지 않은 항목(정답)",
    entries: [
      { answer: "날짜" }, { answer: "장소" }, { answer: "참가비" }, { answer: "준비물" }, { answer: "신청 방법" },
      { answer: "시상 내역" }, { answer: "심사 기준" }, { answer: "참가 인원" }, { answer: "참가 대상" },
      { answer: "주최 동아리" }, { answer: "제출 마감일" },
    ],
    scenarios: EVENT_TOPICS,
  },
};

function poolFor(
  typeId: number,
  grade: ListeningGradeLevel | undefined,
  variant?: string
): VarietyPool | null {
  // 심정 선택지 언어는 변형이 정한다(중1 한국어 3 : 영어 1, 중2 영어 3 : 한국어 1, 중3 영어). 변형이 없으면 학년 기본값
  if (typeId === 8 && !isHighSchoolListeningGrade(grade)) {
    if (variant === "en") return MIDDLE_EMOTION_EN_POOL;
    if (variant === "ko") return MIDDLE_POOLS[8] ?? null;
  }
  if (typeId === 8 && (grade === "middle2" || grade === "middle3")) return MIDDLE_EMOTION_EN_POOL;
  if (isHighSchoolListeningGrade(grade)) return HIGH_POOLS[typeId] ?? null;
  return MIDDLE_POOLS[typeId] ?? NEW_MIDDLE_POOLS[typeId] ?? null;
}

export function hasAnswerVarietyPool(typeId: number, grade: ListeningGradeLevel | undefined): boolean {
  return poolFor(typeId, grade) != null;
}

function normAnswer(s: string): string {
  // "① 신청 장소"처럼 앞에 붙은 번호만 떼고, 그림 라벨 "①" 자체는 그대로 둔다
  return String(s ?? "")
    .trim()
    .replace(/^[①②③④⑤]\s*(?=\S)/, "")
    .replace(/\s+/g, "");
}

function pickRandom<T>(list: T[]): T {
  return list[Math.floor(Math.random() * list.length)]!;
}

/**
 * 가장 덜 쓴 정답 중 하나를 고른다. usedAnswers에는 같은 과정에서 이미 쓴 정답(여러 번이면 여러 번)을 넣는다.
 * 모든 정답이 한 번씩 쓰이기 전에는 같은 정답이 다시 나오지 않는다.
 */
export function pickAnswerVariety(
  typeId: number,
  grade: ListeningGradeLevel | undefined,
  usedAnswers: string[] = [],
  /** 같은 세트에서 이미 쓴 상황 — 여러 유형이 같은 상황 목록을 써서 한 세트에 같은 장면이 겹쳤다 */
  avoidScenarios: string[] = [],
  variant?: string
): AnswerVarietyAssignment | null {
  const pool = poolFor(typeId, grade, variant);
  if (!pool) return null;
  const counts = new Map<string, number>();
  for (const a of usedAnswers) {
    const k = normAnswer(a);
    counts.set(k, (counts.get(k) ?? 0) + 1);
  }
  const usage = pool.entries.map((e) => counts.get(normAnswer(e.answer)) ?? 0);
  const min = Math.min(...usage);
  const candidates = pool.entries.filter((_, i) => usage[i] === min);
  const entry = pickRandom(candidates);
  const freshScenarios = pool.scenarios.filter((s) => !avoidScenarios.includes(s));
  return {
    typeId,
    ...(variant ? { variant } : {}),
    answer: entry.answer,
    hint: entry.hint,
    scenario: pickRandom(freshScenarios.length > 0 ? freshScenarios : pool.scenarios),
  };
}

export function formatAnswerVarietyBlock(
  a: AnswerVarietyAssignment,
  grade: ListeningGradeLevel | undefined,
  orderIndex?: number
): string {
  const pool = poolFor(a.typeId, grade, a.variant);
  if (!pool) return "";
  const where = orderIndex != null && orderIndex !== a.typeId ? `${orderIndex}번 문항(유형 ${a.typeId})` : `${a.typeId}번 문항`;
  const lines = pool.scriptValue
    ? [
        `## ${where} 필수 설정 (반드시 따를 것 — 다른 회차와 겹치지 않게 미리 정한 값)`,
        `- ${pool.answerLabel}: ${a.answer}${a.hint ? ` (참고 뜻: ${a.hint})` : ""}`,
        `- 상황·소재: ${a.scenario}`,
      ]
    : [
        `## ${where} 필수 설정 (반드시 따를 것 — 다른 회차와 겹치지 않게 미리 정한 값)`,
        `- ${pool.answerLabel}: ${a.answer}${a.hint ? ` (대본 참고 표현: ${a.hint})` : ""}`,
        `- 상황·소재: ${a.scenario}`,
        `- 정답은 반드시 "${a.answer}"이어야 한다. 다른 값으로 바꾸지 말 것.`,
      ];
  if (pool.note) lines.push(`- ${pool.note}`);
  return lines.join("\n");
}

/** 저장된 문항에서 정답 문자열을 뽑는다 (그림 불일치는 라벨) */
export function answerOfStoredQuestion(q: { choices?: unknown; correct_answer?: unknown }): string {
  const choices = Array.isArray(q.choices) ? (q.choices as unknown[]).map(String) : [];
  const idx = Number(q.correct_answer) - 1;
  return choices[idx] ?? "";
}
