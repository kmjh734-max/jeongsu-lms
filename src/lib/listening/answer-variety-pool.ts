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
  "속초 · 주말 아침", "여수 · 오늘 낮", "포항 · 내일 저녁", "울산 · 화요일", "수원 · 오늘 아침",
  "안동 · 내일 낮", "목포 · 수요일 오후", "청주 · 오늘 저녁", "김해 · 주말 오후", "원주 · 목요일 아침",
  "군산 · 내일 밤", "통영 · 오늘 오전", "정선 · 토요일 낮", "파주 · 내일 아침",
];

const SCHOOL_SCENES = [
  "학교 축제 준비", "과학 발표 연습", "동아리 포스터 만들기", "가족 저녁 식사 준비", "친구 생일 선물 고르기",
  "체육대회 연습", "합창 대회 준비", "요리 수업", "캠핑 짐 싸기", "도서관 봉사 활동", "벼룩시장 준비",
  "반려동물 돌보기", "미술 전시회 관람", "학급 신문 만들기", "주말 자전거 여행 계획",
  "교내 방송 준비", "텃밭 가꾸기", "연극 무대 연습", "사진 전시 고르기", "이웃 어르신 돕기",
  "운동장 정리", "학급 문집 만들기", "과학관 견학 준비", "재활용 캠페인 준비",
];

const EVENT_TOPICS = [
  "주말 과학 캠프", "학교 벼룩시장", "사진 동아리 전시회", "어린이 요리 교실", "청소년 독서 캠프",
  "학교 합창 대회", "지역 식물 박람회", "초보 코딩 교실", "가족 걷기 대회", "환경 정화 봉사",
  "영화 동아리 상영회", "종이접기 교실", "천문대 관측 행사", "도예 체험 수업", "보드게임 동아리 모임",
  "지역 마라톤 대회", "우리 동네 역사 탐방", "수어 배우기 교실", "구조 동물 돌봄 봉사", "청소년 연극 워크숍",
  "전통 악기 체험", "자전거 안전 교실", "바다 정화 캠페인", "목공 만들기 교실",
];

/** 유형마다 다른 장면을 쓰도록 나눈 상황 은행 — 예전에는 의도·장래희망·심정·핵심 내용·장소가 SCHOOL_SCENES 하나를 같이 썼다 */
const SC_INTENT = [
  "발표를 마친 뒤", "실수를 알아차린 순간", "부탁을 들어 준 뒤", "약속에 늦은 상황", "새 계획을 꺼낼 때",
  "도움이 필요할 때", "결과를 알게 된 뒤", "경기를 앞두고", "물건을 빌린 뒤", "일정이 겹쳤을 때",
  "함께 만든 것을 본 뒤", "오해가 풀렸을 때", "어려운 일을 맡았을 때", "선물을 받은 뒤", "규칙을 어긴 것을 보았을 때",
  "먼 길을 함께 걷는 중", "시험 결과를 기다릴 때", "청소를 끝낸 뒤", "길에서 우연히 만났을 때", "짐을 나눠 든 뒤",
  "연습이 잘 안될 때", "처음 해 보는 일을 앞두고", "고장 난 물건을 보았을 때", "함께 정한 일을 미룰 때",
];

const SC_DREAM = [
  "진로 상담 시간", "직업 체험의 날", "졸업생 강연 뒤", "동아리 면담", "방학 계획 이야기",
  "가족과 저녁 대화", "봉사 활동을 다녀와서", "책을 읽고 나서", "전시회를 보고 나서", "경기를 보고 나서",
  "부모님 일터 방문", "학교 신문 인터뷰", "새 취미를 시작하며", "체험 학습을 다녀와서", "친구의 꿈 이야기",
  "다큐멘터리를 보고", "대회에 나가 보고", "선배와 이야기하며", "새 과목을 배우고", "현장 학습 소감",
  "장래 희망 발표 준비", "직업 소개 영상 보고", "동네 가게 주인과 대화", "실습 수업을 마치고",
];

const SC_EMOTION = [
  "오래 준비한 일을 마쳤을 때", "잃어버린 것을 찾았을 때", "예상 못 한 소식을 들었을 때", "발표 차례를 기다릴 때",
  "결과 발표를 앞두고", "계획이 갑자기 바뀌었을 때", "남 앞에서 실수했을 때", "기다리던 날이 다가올 때",
  "오래 걸린 일을 다시 해야 할 때", "친구가 먼저 도와줬을 때", "처음 해 보는 일을 앞두고", "힘들게 만든 것이 잘 됐을 때",
  "약속이 어긋났을 때", "길을 잃었을 때", "칭찬을 들었을 때", "기르던 것이 아팠을 때",
  "오래 못 본 사람을 만났을 때", "준비물을 두고 왔을 때", "비가 와서 못 나갈 때", "새 자리에 처음 갔을 때",
  "도전이 잘 풀렸을 때", "긴 줄을 기다릴 때", "지난 사진을 다시 볼 때", "생각보다 쉬웠을 때",
];

const SC_TOPIC = [
  "쉬는 시간 대화", "하굣길 대화", "점심시간 대화", "모둠 회의", "가족 저녁 대화", "동아리 회의",
  "전화 통화", "등굣길 대화", "운동장에서", "도서관 앞에서", "교무실 앞에서", "버스 안에서",
  "체육관에서", "미술실에서", "급식실 줄에서", "정류장에서 기다리며", "복도에서 마주쳐서", "주말에 만나서",
  "학교 행사 뒤풀이", "봉사 활동 가는 길", "견학 버스 안", "반 회의 시간", "방과 후 교실", "운동 끝나고",
];

const SC_PLACE = [
  "물건을 찾는 손님", "예약을 확인하는 손님", "도움을 청하는 사람", "처음 온 사람", "값을 묻는 손님",
  "교환하러 온 손님", "순서를 기다리는 사람", "짐을 맡기는 사람", "길을 묻는 사람", "약속한 사람을 기다리며",
  "규칙을 묻는 사람", "신청서를 내는 사람", "물건을 맡기는 사람", "시간을 확인하는 사람", "표를 사는 사람",
  "설명을 듣는 사람", "몸이 불편해 온 사람", "물건을 돌려주러 온 사람", "추천을 부탁하는 사람", "잃어버린 것을 찾는 사람",
  "같이 온 사람을 찾는 사람", "포장을 부탁하는 사람", "예약을 바꾸는 사람", "회원 가입을 하는 사람",
];

const SC_JOB = [
  "손님과 일하는 사람의 대화", "전화 예약 대화", "처음 방문한 손님과의 대화", "단골 손님과의 대화",
  "일터를 견학하며", "일이 끝날 무렵", "바쁜 시간의 대화", "문제를 해결해 주는 대화",
  "설명을 듣는 대화", "차례를 기다리다 나눈 대화", "약속 시간을 잡는 대화", "일하는 곳을 소개하는 대화",
  "도구를 준비하는 대화", "결과를 알려 주는 대화", "주의 사항을 알려 주는 대화", "다음에 올 날을 정하는 대화",
  "잘못된 점을 고쳐 주는 대화", "가격을 알려 주는 대화", "밖에서 우연히 만난 대화", "일을 배우러 온 사람과의 대화",
  "안내를 부탁하는 대화", "물건을 맡기는 대화", "급하게 도움을 청하는 대화", "일을 마친 뒤 인사하는 대화",
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
    // 교재 3종의 의도 선택지는 81종이었고 가장 잦은 것은 사과·감사·칭찬·격려 순이었다. 10종만 쓰던 것을 24종으로 넓혔다
    entries: [
      { answer: "감사" }, { answer: "사과" }, { answer: "거절" }, { answer: "칭찬" }, { answer: "부탁" },
      { answer: "격려" }, { answer: "항의" }, { answer: "제안" }, { answer: "동의" }, { answer: "걱정" },
      { answer: "승낙" }, { answer: "충고" }, { answer: "위로" }, { answer: "축하" }, { answer: "불평" },
      { answer: "허락" }, { answer: "확인" }, { answer: "안내" }, { answer: "당부" }, { answer: "경고" },
      { answer: "문의" }, { answer: "약속" }, { answer: "초대" }, { answer: "양보" },
    ],
    scenarios: SC_INTENT,
    note: "격려는 걱정·긴장한 상대에게 하는 말이다(예: Don't worry. You can do it.). 긴장한 사람이 스스로 \"I can do it\"이라고 하는 것은 격려가 아니다.",
  },
  5: {
    answerLabel: "언급하지 않은 항목(정답)",
    entries: [
      { answer: "참가비" }, { answer: "모임 장소" }, { answer: "시작 날짜" }, { answer: "준비물" },
      { answer: "참가 대상" }, { answer: "신청 방법" }, { answer: "활동 내용" }, { answer: "모집 인원" },
      { answer: "모임 요일" }, { answer: "지도 교사" },
      // 교재의 담화형 언급X는 행사 항목만 쓰지 않는다 — 사물·장소 속성(입장료·위치·기간·재료)이 절반이었다
      { answer: "입장료" }, { answer: "행사 장소" }, { answer: "진행 기간" }, { answer: "준비 물품" },
      { answer: "문의 전화" }, { answer: "주차 방법" }, { answer: "우천 시 안내" }, { answer: "시상 내용" },
      { answer: "끝나는 시각" }, { answer: "가는 방법" }, { answer: "함께 여는 곳" }, { answer: "먹을거리" },
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
      // 교재의 장래 희망은 89종 — 교사·의사·건축가·아나운서·만화가 같은 흔한 답이 우리 풀에 없었다
      { answer: "교사", hint: "teacher" }, { answer: "의사", hint: "doctor" }, { answer: "건축가", hint: "architect" },
      { answer: "아나운서", hint: "news anchor" }, { answer: "만화가", hint: "cartoonist" }, { answer: "디자이너", hint: "designer" },
      { answer: "가수", hint: "singer" }, { answer: "제빵사", hint: "baker" }, { answer: "소방관", hint: "firefighter" },
      { answer: "영화감독", hint: "film director" }, { answer: "농부", hint: "farmer" }, { answer: "우주 비행사", hint: "astronaut" },
      { answer: "번역가", hint: "translator" }, { answer: "지휘자", hint: "conductor" },
    ],
    scenarios: SC_DREAM,
    note: "다른 직업 1~2개(부모님 권유·예전 꿈·친구의 꿈)를 대본에 넣어 오답 근거로 삼고, 정답 직업은 하는 일로 설명하거나 한 번만 말한다.",
  },
  8: {
    answerLabel: "심정(정답)",
    entries: [
      { answer: "안도" }, { answer: "자랑스러움" }, { answer: "실망" }, { answer: "걱정" }, { answer: "설렘" },
      { answer: "만족" }, { answer: "당황" }, { answer: "놀람" }, { answer: "지루함" }, { answer: "슬픔" },
      // 교재의 심정 선택지는 66종 — 화남·부러움·두려움·편안함·고마움·외로움이 우리 풀에 없었다
      { answer: "화남" }, { answer: "부러움" }, { answer: "두려움" }, { answer: "편안함" }, { answer: "고마움" },
      { answer: "외로움" }, { answer: "미안함" }, { answer: "긴장" }, { answer: "뿌듯함" },
      { answer: "아쉬움" }, { answer: "궁금함" }, { answer: "감동" },
    ],
    scenarios: SC_EMOTION,
    note: "감정은 감정어 대신 몸의 반응·행동·다음에 하려는 일로 드러내고, 회차마다 다른 장치를 고른다(이 지침의 예시 문장을 그대로 옮겨 쓰지 않는다). 정답 외 감정 1~2개도 상황상 그럴듯하게 만든다. 감탄문으로 감정을 그대로 말하는 문장(What a relief! 등)은 그 감정어를 말한 것과 같으므로 쓰지 않는다.",
  },
  10: {
    answerLabel: "대화의 핵심 내용(정답)",
    entries: [
      { answer: "동아리 홍보 방법" }, { answer: "체육대회 응원 준비" }, { answer: "봉사 활동 장소" },
      { answer: "발표 순서 정하기" }, { answer: "벼룩시장 물건 가격" }, { answer: "학급 소풍 장소" },
      { answer: "과학 실험 주제" }, { answer: "생일 파티 준비물" }, { answer: "환경 캠페인 포스터" },
      { answer: "동영상 촬영 장소" }, { answer: "주말 공부 계획" }, { answer: "교실 화분 관리" },
      { answer: "분리배출 방법" }, { answer: "학급 규칙 정하기" }, { answer: "운동 습관 만들기" },
      { answer: "중고 물건 나눔" }, { answer: "졸업 선물 고르기" }, { answer: "동네 길 안내 지도" },
      { answer: "급식 남기지 않기" }, { answer: "방학 계획 세우기" }, { answer: "사진 정리 방법" },
      { answer: "새 친구와 친해지기" }, { answer: "도서 추천 방법" }, { answer: "자전거 안전 수칙" },
    ],
    scenarios: SC_TOPIC,
  },
  11: {
    answerLabel: "최종 이동 방법(정답)",
    entries: [
      { answer: "버스", hint: "take the bus" }, { answer: "지하철", hint: "take the subway" },
      { answer: "택시", hint: "take a taxi" }, { answer: "자전거", hint: "ride bikes" },
      { answer: "도보", hint: "walk" }, { answer: "기차", hint: "take the train" },
      { answer: "자동차", hint: "my dad will drive us" },
      // 교재 교통수단은 42종 — 배·비행기·오토바이·셔틀버스도 정답으로 나온다
      { answer: "배", hint: "take the ferry" }, { answer: "비행기", hint: "take the plane" },
      { answer: "셔틀버스", hint: "take the shuttle bus" }, { answer: "킥보드", hint: "ride a kick scooter" },
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
      // 교재의 장소는 75종 — 백화점·경찰서·놀이공원·은행·세탁소가 우리 풀에 없었다
      { answer: "백화점" }, { answer: "경찰서" }, { answer: "놀이공원" }, { answer: "은행" }, { answer: "세탁소" },
      { answer: "가구점" }, { answer: "수영장" }, { answer: "박물관" }, { answer: "체육관" }, { answer: "지하철역" },
      { answer: "꽃집" }, { answer: "사진관" }, { answer: "옷 가게" }, { answer: "치과" }, { answer: "공원" },
      { answer: "호텔 안내대" }, { answer: "수리 센터" },
    ],
    scenarios: SC_PLACE,
    note: "장소 이름을 대본에서 직접 말하지 않고, 그 장소에서만 할 법한 말로 추론하게 한다.",
  },
  14: {
    answerLabel: "표에서 대본과 다른 항목(정답)",
    entries: [
      { answer: "날짜" }, { answer: "시간" }, { answer: "장소" }, { answer: "대상" }, { answer: "참가비" },
      { answer: "준비물" }, { answer: "신청 방법" }, { answer: "활동 내용" },
      { answer: "모집 인원" }, { answer: "요일" }, { answer: "문의처" }, { answer: "마감일" },
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
      // 교재의 직업은 교사·건축가·여행 가이드·호텔 직원·경비원·인테리어 디자이너까지 폭이 넓다
      { answer: "교사", hint: "worksheet, group, hand in" }, { answer: "건축가", hint: "floor plan, roof, design" },
      { answer: "여행 안내원", hint: "tour, guide, meeting point" }, { answer: "호텔 직원", hint: "check in, room key, luggage" },
      { answer: "우체국 직원", hint: "parcel, stamp, weigh" }, { answer: "꽃집 주인", hint: "bouquet, ribbon, fresh" },
      { answer: "간호사", hint: "temperature, shot, rest" }, { answer: "택배 기사", hint: "package, sign, doorstep" },
      { answer: "박물관 안내원", hint: "exhibit, this way, no flash" }, { answer: "운동 지도자", hint: "warm up, posture, ten more" },
      { answer: "수리 기사", hint: "part, plug, fixed" }, { answer: "재단사", hint: "measure, hem, try on" },
      { answer: "농부", hint: "field, harvest, seeds" }, { answer: "승무원", hint: "seat belt, tray, aisle" },
    ],
    scenarios: SC_JOB,
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
      // 교재의 관계 110종에는 장사 관계가 아닌 짝(팀장–팀원, 독자–작가, 면접관–지원자)이 많았다
      { answer: "교사 – 학생" }, { answer: "운전자 – 경찰관" }, { answer: "독자 – 작가" },
      { answer: "면접관 – 지원자" }, { answer: "팀장 – 팀원" }, { answer: "기자 – 발명가" },
      { answer: "이웃 – 이웃" }, { answer: "손님 – 우체국 직원" }, { answer: "관객 – 공연 안내원" },
      { answer: "학생 – 상담 교사" }, { answer: "손님 – 세탁소 주인" }, { answer: "환자 – 치과 의사" },
      { answer: "여행객 – 여행 안내원" }, { answer: "손님 – 식당 종업원" }, { answer: "동아리원 – 동아리 회장" },
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
      { answer: "돗자리" }, { answer: "저울" }, { answer: "부채" }, { answer: "빨대" }, { answer: "지우개" },
      { answer: "다리미" }, { answer: "가위" }, { answer: "우산꽂이" }, { answer: "머리핀" }, { answer: "확성기" },
      { answer: "장바구니" }, { answer: "빗자루" }, { answer: "귀마개" }, { answer: "돼지 저금통" }, { answer: "낚싯대" },
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
    // 교재 심정 선택지 66종 가운데 잦았던 angry·jealous·scared·relaxed·thankful·curious를 더했다
    { answer: "angry" }, { answer: "jealous" }, { answer: "scared" }, { answer: "relaxed" },
    { answer: "thankful" }, { answer: "curious" }, { answer: "confident" }, { answer: "lonely" },
    { answer: "sorry" }, { answer: "touched" }, { answer: "hopeful" }, { answer: "puzzled" },
    { answer: "impressed" }, { answer: "regretful" },
  ],
  scenarios: SC_EMOTION,
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

/* ───────────── 교재 실측을 반영한 상황·정답 은행 (2026-09-16) ─────────────
 * 참고 중학 교재 3종(중1·중2·중3) 876문항의 선택지를 유형별로 집계해 폭을 맞췄다.
 * 교재의 대본·선택지·해설은 한 줄도 옮기지 않았고, 근거로 삼은 것은 "정답 범주가 몇 가지였나"와
 * 숫자 폭뿐이다 — 의도 81종, 장소 75종, 장래 희망 89종, 심정 66종, 교통수단 42종,
 * 시각 86종(오전 9시~오후 6시 30분, 정각·30분이 절반), 금액 $8~$100, 날짜는 3~12월.
 * 우리 결과는 정수학원 중등 66세트 기준 언급X=참가비 60/66, 날씨=비 51/66, 이동=지하철 47/66,
 * 시각은 3:50~4:20 p.m.에 84%가 몰려 있었다. 유형마다 상황 은행을 따로 두고 회차마다 돌려 쓴다.
 */

const SC_PURPOSE_CALL = [
  "연습실 예약 변경", "빌린 물건 반납 약속", "행사 시작 시간 확인", "잃어버린 물건 문의", "수업 준비물 확인",
  "배송 날짜 변경 요청", "동아리 모임 장소 알리기", "아픈 친구 상태 묻기", "숙제 범위 확인", "차편 도착 시간 알리기",
  "사진 파일 전달 요청", "예약 인원 늘리기", "가게 영업 시간 확인", "수리 맡긴 물건 찾아가기", "초대 일정 조정",
  "봉사 활동 신청 방법 묻기", "분실물 보관 여부 확인", "대회 접수 마감 확인", "이사 도움 요청", "강좌 취소 안내",
  "길 안내 요청", "책 대출 기간 연장", "자리 바꿔 달라는 부탁", "시험 범위 다시 묻기",
];

const SC_TIME = [
  "영화 상영 시작", "기차 출발", "병원 예약", "동아리 모임", "발표 연습", "체육관 개방", "미술관 해설 시간",
  "수영장 자유 수영", "버스 막차", "도서관 문 닫는 시각", "학원 수업 시작", "농구 경기 시작", "케이크 찾는 시각",
  "봉사 활동 집합", "요리 교실 시작", "사진 촬영 예약", "축제 무대 순서", "천문대 관측 시작", "시상식 시작",
  "수리 완료 시각", "공항 탑승 수속", "박물관 마감", "합창 연습 시작", "시장 문 여는 시각",
];

const SC_DATE = [
  "체육대회", "학교 축제", "현장 체험 학습", "합창 대회 본선", "도서 반납 기한", "미술 전시 개막", "농구 결승전",
  "봉사 활동 날", "가족 여행 출발", "과학 발표회", "동아리 모집 마감", "연극 공연", "사진 전시 마지막 날",
  "졸업 사진 촬영", "캠핑 출발", "책 축제", "요리 대회 예선", "수영 대회", "음악회 공연", "직업 체험의 날",
  "학급 문집 마감", "이사 가는 날", "달리기 대회", "박물관 특별전 마지막 날",
];

const SC_AMOUNT = [
  "영화표와 음료", "체험 교실 재료비", "화분과 흙", "운동화와 양말", "책 두 권과 서점 쿠폰", "간식과 음료 배달",
  "수영장 입장권과 사물함", "미술 재료 묶음", "자전거 대여와 헬멧", "공연표와 프로그램 책자", "케이크와 초",
  "캠핑 용품 대여", "사진 인화와 액자", "보드게임 카페 이용료", "기념품과 엽서", "택배 두 상자",
  "동물원 입장권과 먹이 체험", "악기 대여와 교본", "학용품 묶음 할인", "화분 배달비 포함", "티셔츠 단체 주문",
  "박물관 해설 프로그램", "과일 상자 두 개", "실내 암벽장 이용료",
];

const SC_REQUEST = [
  "발표 준비", "동아리 부스 정리", "집안일 나누기", "전시 준비", "체육대회 준비", "학급 신문 만들기",
  "봉사 활동 준비", "생일 파티 준비", "이사 정리", "과학 실험 준비", "합창 연습 준비", "캠핑 짐 싸기",
  "사진 전시 준비", "요리 실습 준비", "도서관 정리", "학교 방송 준비", "연극 소품 준비", "화단 가꾸기",
  "시험 공부 도와주기", "행사 안내 준비", "반려동물 돌보기", "교실 청소", "졸업 앨범 만들기", "장보기",
];

const SC_TODO_NOW = [
  "요리 중", "행사장 설치 중", "숙제 마무리 중", "짐 정리 중", "사진 정리 중", "화분 심는 중",
  "무대 준비 중", "실험 정리 중", "짐 옮기는 중", "표 확인 중", "간식 준비 중", "청소 중",
  "포스터 붙이는 중", "악기 정리 중", "옷 고르는 중", "자전거 점검 중", "장 보는 중", "책 정리 중",
  "캠핑 준비 중", "동물 돌보는 중", "게시판 꾸미는 중", "발표 자료 확인 중", "물건 포장 중", "경기 준비 중",
];

const SC_DID = [
  "지난 주말", "어제 오후", "지난 방학", "지난 토요일", "어제 저녁", "지난 일요일", "지난 연휴",
  "어제 아침", "지난달", "지난 금요일 방과 후", "지난 휴일", "어제 점심시간", "지난 수요일", "지난 봄 소풍",
  "지난 체육대회 날", "어제 하굣길", "지난 축제 날", "지난 시험 기간", "지난 겨울", "어제 등굣길",
  "지난 가족 모임", "지난 현장 학습", "어제 자율 활동 시간", "지난 명절 연휴",
];

const SC_ANNOUNCE = [
  "학교 방송", "도서관 안내 방송", "체육관 안내 방송", "지하철역 안내 방송", "쇼핑몰 안내 방송",
  "박물관 관람 안내", "공연장 안내 방송", "수영장 안내 방송", "아파트 관리 사무소 방송", "캠핑장 안내 방송",
  "기차역 안내 방송", "동물원 안내 방송", "학교 급식실 안내", "축제장 안내 방송", "공항 안내 방송",
  "시장 안내 방송", "놀이공원 안내 방송", "미술관 안내 방송", "버스 터미널 안내", "과학관 안내 방송",
  "스키장 안내 방송", "해수욕장 안내 방송", "도시 축제 안내 방송", "학교 운동장 안내",
];

const SC_SITUATION = [
  "빌린 물건을 돌려주려는 상황", "자리를 바꿔 달라고 말하려는 상황", "길을 물어보려는 상황",
  "규칙을 지켜 달라고 말하려는 상황", "도움을 청하려는 상황", "약속 시간을 미루려는 상황",
  "잘못 온 물건을 바꾸려는 상황", "예약을 확인하려는 상황", "분실물을 찾으려는 상황",
  "함께 하자고 권하려는 상황", "사정을 설명하고 양해를 구하려는 상황", "고마움을 전하려는 상황",
  "실수를 사과하려는 상황", "조용히 해 달라고 부탁하려는 상황", "추천을 부탁하려는 상황",
  "대신 전해 달라고 부탁하려는 상황", "다시 설명해 달라고 청하려는 상황", "순서를 양보하려는 상황",
  "안전을 알려 주려는 상황", "일정을 다시 알려 주려는 상황", "값을 깎아 달라고 말하려는 상황",
  "자리를 맡아 달라고 부탁하려는 상황", "길을 알려 주려는 상황", "몸이 불편함을 알리려는 상황",
];

const SC_TABLE_SELECT = [
  "운동화 고르기", "자전거 고르기", "무선 이어폰 고르기", "캠핑 텐트 고르기", "책상 램프 고르기",
  "체험 교실 고르기", "여행 숙소 고르기", "화분 고르기", "운동 강좌 고르기", "가방 고르기",
  "우산 고르기", "보드게임 고르기", "물병 고르기", "사진 인화 상품 고르기", "케이크 고르기",
  "헬멧 고르기", "손목시계 고르기", "독서대 고르기", "미술 강좌 고르기", "숙박 체험 고르기",
  "운동복 고르기", "여행 가방 고르기", "악기 강습 고르기", "반려동물 사료 고르기",
];

const SC_SCENE = [
  "가게 계산대", "버스 정류장", "교실 복도", "병원 대기실", "도서관 열람실", "공원 벤치", "지하철 승강장",
  "체육관 입구", "식당 자리", "미술관 전시실", "우체국 창구", "놀이터", "횡단보도", "학교 급식실",
  "수영장 탈의실", "기차 안", "꽃집 앞", "주차장", "승강기 앞", "분식집", "문구점 계산대", "운동장 트랙",
  "정류장 안내판 앞", "영화관 매표소",
];

const SC_FUNCTION = [
  "인사와 안부", "길 안내", "물건 사기", "약속 잡기", "몸 상태 묻기", "취미 묻기", "음식 주문",
  "날씨 이야기", "도움 청하기", "축하 인사", "사과와 대답", "제안과 대답", "시간 묻기", "값 묻기",
  "방법 묻기", "감사 인사", "전화 통화", "허락 구하기", "위치 묻기", "계획 묻기", "이유 묻기",
  "좋아하는 것 묻기", "얼마나 자주 하는지 묻기", "경험 묻기",
];

const SC_ABOUT_DIALOGUE = [
  "새로 생긴 체육관", "학교 텃밭", "전학 온 친구", "새로 산 자전거", "동네 도서관", "가족 여행지",
  "기르는 반려동물", "새 담임 선생님", "학교 축제 부스", "동아리 발표회", "새로 연 분식집", "교내 사진 대회",
  "방학 캠프", "새 휴대전화", "이사 갈 동네", "봉사 활동 단체", "학교 밴드", "새로 배우는 악기",
  "지역 수영장", "친구의 형", "새로 나온 보드게임", "주말 벼룩시장", "학교 매점", "새로 산 신발",
];

const SC_SHOP = [
  "문구점에서 필통 고르기", "꽃집에서 화분 고르기", "온라인으로 책가방 주문하기", "제과점에서 케이크 장식 정하기",
  "운동용품점에서 물병 고르기", "안경점에서 안경테 고르기", "시장에서 앞치마 고르기", "인쇄소에서 명찰 만들기",
  "가구점에서 책상 스탠드 고르기", "기념품 가게에서 열쇠고리 고르기", "화방에서 스케치북 고르기", "양말 가게에서 양말 고르기",
  "빵집에서 도시락 가방 고르기", "전자상가에서 손전등 고르기", "우산 가게에서 우산 고르기", "가방 수선집에서 이름표 달기",
  "떡집에서 답례품 상자 고르기", "수족관 가게에서 어항 장식 고르기", "학교 매점에서 공책 고르기", "공방에서 컵 무늬 정하기",
  "모자 가게에서 모자 고르기", "신발 가게에서 운동화 고르기", "카펫 가게에서 매트 고르기", "시계 가게에서 벽시계 고르기",
];

/**
 * 교재에 있는데 우리 풀에는 없던 유형의 정답·상황 은행.
 * 공통 중등 배치 20자리 가운데 12자리(시각·직후 할 일·부탁·언급X 대화·한 일·전화 목적·금액·
 * 그림 상황·어색한 대화·표 선택·날짜·방송 목적·상황 발화)에 정답 풀이 아예 없었다.
 * 정답이 자리 번호·영어 문장인 유형은 scriptValue로 "대본에서 다룰 거리"만 정한다.
 */
const BANK_POOLS: Record<number, VarietyPool> = {
  2: {
    answerLabel: "그림 선택지에서 구분할 무늬·모양(회차마다 다르게)",
    scriptValue: true,
    entries: [
      { answer: "줄무늬" }, { answer: "물방울무늬" }, { answer: "체크무늬" }, { answer: "꽃무늬" },
      { answer: "동물 그림" }, { answer: "글자 한 단어" }, { answer: "하트 무늬" }, { answer: "구름 그림" },
      { answer: "번개 모양" }, { answer: "나뭇잎 무늬" }, { answer: "삼각형 무늬" }, { answer: "물결무늬" },
      { answer: "숫자" }, { answer: "리본" }, { answer: "달·해 그림" }, { answer: "과일 그림" },
      { answer: "발자국 무늬" }, { answer: "지도 무늬" }, { answer: "음표" }, { answer: "공룡 그림" },
      { answer: "눈송이 무늬" }, { answer: "자전거 그림" }, { answer: "우주선 그림" }, { answer: "무늬 없음(단색)" },
    ],
    scenarios: SC_SHOP,
    note: "이 무늬(또는 모양)를 정답 그림의 결정적 속성으로 삼는다. 별 무늬는 연달아 쓰지 않는다 — 최근 6회 중 5회가 별이었다. 나머지 속성(색·주머니·손잡이 등)은 회차마다 바꾼다.",
  },
  6: {
    answerLabel: "정답 시각",
    entries: [
      { answer: "9:00 a.m." }, { answer: "9:30 a.m." }, { answer: "10:00 a.m." }, { answer: "10:20 a.m." },
      { answer: "10:30 a.m." }, { answer: "11:00 a.m." }, { answer: "11:15 a.m." }, { answer: "11:40 a.m." },
      { answer: "12:30 p.m." }, { answer: "1:00 p.m." }, { answer: "1:30 p.m." }, { answer: "1:50 p.m." },
      { answer: "2:00 p.m." }, { answer: "2:30 p.m." }, { answer: "2:45 p.m." }, { answer: "3:00 p.m." },
      { answer: "3:20 p.m." }, { answer: "3:30 p.m." }, { answer: "4:00 p.m." }, { answer: "4:30 p.m." },
      { answer: "5:00 p.m." }, { answer: "5:15 p.m." }, { answer: "5:30 p.m." }, { answer: "6:00 p.m." },
      { answer: "6:30 p.m." }, { answer: "7:00 p.m." },
    ],
    scenarios: SC_TIME,
    note: "선택지 5개는 이른 시각부터 차례로 쓰고 간격을 10·15·30분 중 하나로 통일한다. 교재의 시각은 오전 9시~오후 7시에 고르게 퍼져 있고 정각·30분이 절반이니 4시 언저리만 쓰지 않는다. 처음 말한 시각을 한 번 미루거나 앞당겨 정답을 만든다.",
  },
  9: {
    answerLabel: "대화 직후 할 일(정답)",
    entries: [
      { answer: "의자 옮기기" }, { answer: "접시 닦기" }, { answer: "표 인쇄하기" }, { answer: "재료 씻기" },
      { answer: "사진 고르기" }, { answer: "창문 닫기" }, { answer: "물 끓이기" }, { answer: "명단 확인하기" },
      { answer: "상자 열어 보기" }, { answer: "선생님께 여쭤보기" }, { answer: "우산 가지러 가기" }, { answer: "자리 맡아 두기" },
      { answer: "전화 걸기" }, { answer: "가방 챙기기" }, { answer: "빵 사 오기" }, { answer: "지도 펴 보기" },
      { answer: "쓰레기 내다 놓기" }, { answer: "화분에 물 주기" }, { answer: "옷 갈아입기" }, { answer: "영수증 찾아보기" },
      { answer: "자전거 자물쇠 풀기" }, { answer: "글씨 크게 다시 쓰기" }, { answer: "친구 마중 나가기" }, { answer: "시간표 확인하기" },
    ],
    scenarios: SC_TODO_NOW,
    note: "정답은 대화가 끝난 바로 다음에 할 한 가지 행동이다. 대본에 나오는 다른 행동 2~3개(이미 한 일·나중에 할 일·상대가 할 일)를 오답 근거로 삼는다.",
  },
  15: {
    answerLabel: "부탁한 일(정답)",
    entries: [
      { answer: "사진 보내 주기" }, { answer: "자리 맡아 주기" }, { answer: "우산 빌려주기" }, { answer: "일찍 깨워 주기" },
      { answer: "짐 들어 주기" }, { answer: "글 한 번 읽어 봐 주기" }, { answer: "약속 시간 알려 주기" }, { answer: "대신 전화해 주기" },
      { answer: "재료 사다 주기" }, { answer: "동생 데리러 가 주기" }, { answer: "영수증 챙겨 주기" }, { answer: "문 열어 주기" },
      { answer: "노래 틀어 주기" }, { answer: "글씨 크게 써 주기" }, { answer: "책 반납해 주기" }, { answer: "길 안내해 주기" },
      { answer: "가방 봐 주기" }, { answer: "창문 닫아 주기" }, { answer: "음식 데워 주기" }, { answer: "사용법 알려 주기" },
      { answer: "전화번호 알려 주기" }, { answer: "화분에 물 주기" }, { answer: "옷 다려 주기" }, { answer: "함께 가 주기" },
    ],
    scenarios: SC_REQUEST,
    note: "부탁하는 사람과 부탁받는 사람을 지시문과 맞추고, 오답은 부탁하지 않은 일·스스로 하겠다고 한 일·이미 해 둔 일로 만든다.",
  },
  21: {
    answerLabel: "대화에서 언급하지 않은 항목(정답)",
    entries: [
      { answer: "가격" }, { answer: "색깔" }, { answer: "크기" }, { answer: "무게" }, { answer: "재료" },
      { answer: "위치" }, { answer: "생김새" }, { answer: "이름" }, { answer: "나이" }, { answer: "사용 방법" },
      { answer: "이용 시간" }, { answer: "쉬는 날" }, { answer: "좋아하는 것" }, { answer: "사는 곳" },
      { answer: "배우게 된 계기" }, { answer: "함께 가는 사람" }, { answer: "걸리는 시간" }, { answer: "구입한 곳" },
      { answer: "생긴 지 얼마나 되었는지" }, { answer: "고칠 점" }, { answer: "먹이" }, { answer: "수명" },
      { answer: "가는 방법" }, { answer: "빌리는 방법" },
    ],
    scenarios: SC_ABOUT_DIALOGUE,
    note: "정답 항목 외 4개 항목은 대화에서 분명히 말한다. 교재의 대화형 언급X는 행사 신청 항목(참가비·신청 방법)보다 사물·장소·사람의 속성을 더 많이 쓴다.",
  },
  23: {
    answerLabel: "한 일(정답, 과거)",
    entries: [
      { answer: "집 청소하기" }, { answer: "영화 보기" }, { answer: "책 읽기" }, { answer: "자전거 타기" },
      { answer: "할머니 댁 방문하기" }, { answer: "빨래 널기" }, { answer: "케이크 만들기" }, { answer: "병원 진료받기" },
      { answer: "친구 이사 돕기" }, { answer: "사진 정리하기" }, { answer: "수영 배우기" }, { answer: "텃밭 가꾸기" },
      { answer: "동생 숙제 봐 주기" }, { answer: "공연 관람하기" }, { answer: "등산하기" }, { answer: "악기 연습하기" },
      { answer: "봉사 활동하기" }, { answer: "방 정리하기" }, { answer: "시장 다녀오기" }, { answer: "낚시하기" },
      { answer: "보드게임 하기" }, { answer: "강아지 목욕시키기" }, { answer: "요리 배우기" }, { answer: "박물관 관람하기" },
    ],
    scenarios: SC_DID,
    note: "지시문의 시점(지난 주말·어제 오후 등)을 대본에서 그대로 말하고, 오답은 다른 시점에 한 일·하려다 못 한 일·상대가 한 일로 만든다.",
  },
  26: {
    answerLabel: "전화·방문한 목적(정답)",
    entries: [
      { answer: "예약을 변경하려고" }, { answer: "빌린 물건을 돌려주려고" }, { answer: "분실물을 찾으려고" },
      { answer: "준비물을 확인하려고" }, { answer: "도착 시간을 알리려고" }, { answer: "참가 신청 방법을 물으려고" },
      { answer: "수리를 맡기려고" }, { answer: "배송 날짜를 미루려고" }, { answer: "모임 장소를 알리려고" },
      { answer: "결석을 알리려고" }, { answer: "자리를 바꿔 달라고 하려고" }, { answer: "길을 물으려고" },
      { answer: "대출 기간을 늘리려고" }, { answer: "도움을 청하려고" }, { answer: "일정을 다시 물으려고" },
      { answer: "물건을 교환하려고" }, { answer: "인원을 늘리려고" }, { answer: "영업 시간을 확인하려고" },
      { answer: "초대하려고" }, { answer: "사진을 보내 달라고 하려고" }, { answer: "취소를 알리려고" },
      { answer: "추천을 부탁하려고" }, { answer: "잘못 온 물건을 알리려고" }, { answer: "안부를 물으려고" },
    ],
    scenarios: SC_PURPOSE_CALL,
    note: "목적은 전화·방문을 건 쪽이 처음 2~3턴 안에 드러낸다. 오답은 대화에 나오지만 목적이 아닌 일(인사·뒷이야기·상대가 꺼낸 화제)로 만든다.",
  },
  27: {
    answerLabel: "지불할 금액(정답)",
    entries: [
      { answer: "$8" }, { answer: "$10" }, { answer: "$12" }, { answer: "$14" }, { answer: "$15" },
      { answer: "$18" }, { answer: "$20" }, { answer: "$24" }, { answer: "$25" }, { answer: "$27" },
      { answer: "$30" }, { answer: "$32" }, { answer: "$35" }, { answer: "$40" }, { answer: "$45" },
      { answer: "$48" }, { answer: "$50" }, { answer: "$54" }, { answer: "$60" }, { answer: "$64" },
      { answer: "$70" }, { answer: "$75" }, { answer: "$80" }, { answer: "$90" },
    ],
    scenarios: SC_AMOUNT,
    note: "최종 금액은 대본에서 말하지 않는다(단가·수량·할인·추가 비용만 말하고 학생이 계산). 교재의 금액은 $8~$100에 퍼져 있으니 한 자릿수만 쓰지 않는다. 선택지 5개는 작은 금액부터 차례로 쓴다.",
  },
  29: {
    answerLabel: "다섯 대화가 함께 쓰는 장면",
    scriptValue: true,
    entries: SC_SCENE.map((s) => ({ answer: s })),
    scenarios: SC_FUNCTION,
    note: "그림 한 장의 장면을 위 장소로 잡고, 짧은 대화 5개는 모두 그 장소에서 나올 법하되 정답 한 개만 그림 속 인물의 행동과 맞게 만든다.",
  },
  33: {
    answerLabel: "첫 대화가 쓸 말하기 기능",
    scriptValue: true,
    entries: SC_FUNCTION.map((s) => ({ answer: s })),
    scenarios: SC_SCENE,
    note: "짧은 대화 5개는 서로 다른 말하기 기능을 쓰고, 정답 한 개만 물음과 대답이 어긋나게 만든다.",
  },
  34: {
    answerLabel: "표에서 고를 대상",
    scriptValue: true,
    entries: SC_TABLE_SELECT.map((s) => ({ answer: s })),
    scenarios: SC_AMOUNT,
    note: "표는 4개 열(이름 + 조건 3개)로 만들고, 대화에서 조건을 하나씩 좁혀 한 행만 남긴다. 값의 단위(가격·무게·시간·거리)는 회차마다 다르게 고른다.",
  },
  35: {
    answerLabel: "정답 날짜",
    entries: [
      { answer: "3월 9일" }, { answer: "3월 22일" }, { answer: "4월 5일" }, { answer: "4월 18일" },
      { answer: "5월 6일" }, { answer: "5월 15일" }, { answer: "5월 27일" }, { answer: "6월 3일" },
      { answer: "6월 14일" }, { answer: "6월 25일" }, { answer: "7월 8일" }, { answer: "7월 19일" },
      { answer: "8월 2일" }, { answer: "8월 16일" }, { answer: "9월 4일" }, { answer: "9월 17일" },
      { answer: "9월 28일" }, { answer: "10월 3일" }, { answer: "10월 12일" }, { answer: "10월 24일" },
      { answer: "11월 7일" }, { answer: "11월 20일" }, { answer: "12월 1일" }, { answer: "12월 13일" },
    ],
    scenarios: SC_DATE,
    note: "선택지 5개는 이른 날짜부터 차례로 쓰고 같은 달 안에서 며칠씩 벌린다. 처음 말한 날짜를 사정(일정 겹침·날씨·예약 마감) 때문에 한 번 옮겨 정답을 만든다.",
  },
  36: {
    answerLabel: "방송의 목적(정답)",
    entries: [
      { answer: "이용 시간 변경을 알리려고" }, { answer: "안전 수칙을 안내하려고" }, { answer: "분실물을 찾아 주려고" },
      { answer: "행사 장소 변경을 알리려고" }, { answer: "참가자를 모집하려고" }, { answer: "공사로 인한 통제를 알리려고" },
      { answer: "할인 행사를 알리려고" }, { answer: "주차 방법을 안내하려고" }, { answer: "관람 규칙을 알리려고" },
      { answer: "쉬는 날을 알리려고" }, { answer: "대피 훈련을 안내하려고" }, { answer: "새 시설을 소개하려고" },
      { answer: "예약 방법을 안내하려고" }, { answer: "비 올 때 일정을 알리려고" }, { answer: "질서를 지켜 달라고 당부하려고" },
      { answer: "간식 나눔을 안내하려고" }, { answer: "설문 참여를 부탁하려고" }, { answer: "공연 시작을 알리려고" },
      { answer: "탑승 안내를 하려고" }, { answer: "반납 기한을 알리려고" }, { answer: "자원봉사자를 모집하려고" },
      { answer: "청소 시간을 알리려고" }, { answer: "출입 통제를 알리려고" }, { answer: "수업 취소를 알리려고" },
    ],
    scenarios: SC_ANNOUNCE,
    note: "담화 한 사람이 안내한다. 목적은 첫 두세 문장에서 드러내고 뒷부분은 세부 사항이다. 오답은 담화에 나오는 세부 사항을 목적처럼 쓴 것으로 만든다.",
  },
  37: {
    answerLabel: "상황 설명에서 정할 말할 거리",
    scriptValue: true,
    entries: SC_SITUATION.map((s) => ({ answer: s })),
    scenarios: SC_SCENE,
    note: "3인칭 상황 설명 담화를 쓰고 마지막에 「이런 상황에서 ○○가 ○○에게 할 말」로 끝낸다. 정답은 그 상황에서 바로 할 한 문장이고, 오답은 상황에 나온 낱말을 쓰되 목적이 어긋난 문장으로 만든다.",
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
  return MIDDLE_POOLS[typeId] ?? NEW_MIDDLE_POOLS[typeId] ?? BANK_POOLS[typeId] ?? null;
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
 * 회차 번호로 상황을 한 칸씩 돌려 고른다 — 은행이 바닥나기 전에는 같은 학년의 다른 회차와 겹치지 않는다.
 * 무작위로 뽑던 때는 은행이 24개여도 22회차 중 같은 상황이 여러 번 나왔다(생일 선물 고르기 5회 등).
 * 유형마다 시작점을 어긋나게 해(typeId × 7) 여러 유형이 같은 순서로 움직이지 않게 한다.
 */
function pickRotated<T>(list: T[], rotation: number, typeId: number): T {
  return list[(((rotation + typeId * 7) % list.length) + list.length) % list.length]!;
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
  variant?: string,
  /** 같은 학원·학년에서 이번이 몇 번째 회차인지 (0부터). 상황을 회차마다 한 칸씩 돌려 쓴다 */
  rotation = -1
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
  // 아직 아무도 안 쓴 정답이 여럿이면 무작위로 뽑지 말고 회차 번호로 갈라 준다
  // (은행을 넓히면 미사용 정답이 20개 넘게 남아, 연달아 만든 두 회차가 같은 답을 뽑는 일이 생겼다)
  const entry = rotation >= 0 ? pickRotated(candidates, rotation, typeId) : pickRandom(candidates);
  const freshScenarios = pool.scenarios.filter((s) => !avoidScenarios.includes(s));
  const list = freshScenarios.length > 0 ? freshScenarios : pool.scenarios;
  return {
    typeId,
    ...(variant ? { variant } : {}),
    answer: entry.answer,
    hint: entry.hint,
    scenario: rotation >= 0 ? pickRotated(list, rotation, typeId) : pickRandom(list),
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
