export interface ContinuationScenarioAssignment {
  id: string;
  theme: string;
  setting: string;
  responseFunction: string;
  openingHook: string;
  avoidPatterns: string[];
}

const TYPE19_SCENARIOS: ContinuationScenarioAssignment[] = [
  {
    id: "science_fair_poster",
    theme: "과학박람회 포스터를 함께 붙이기로 함",
    setting: "교실, 점심시간 전",
    responseFunction: "도움 제공",
    openingHook: "The poster keeps falling off the wall.",
    avoidPatterns: ["lost notebook", "homework", "library"],
  },
  {
    id: "basketball_practice",
    theme: "농구 연습 후 물병을 가져다 달라는 부탁",
    setting: "학교 운동장",
    responseFunction: "도움 제공",
    openingHook: "I forgot my water bottle on the bench.",
    avoidPatterns: ["lost item", "science class"],
  },
  {
    id: "birthday_surprise",
    theme: "친구 생일 파티 준비 비밀",
    setting: "방과 후 교실",
    responseFunction: "제안 수락",
    openingHook: "Can you help me buy a small cake after school?",
    avoidPatterns: ["homework", "lost phone"],
  },
  {
    id: "bus_stop_rain",
    theme: "비 오는 날 우산을 같이 쓰자는 제안",
    setting: "버스 정류장",
    responseFunction: "수락/동의",
    openingHook: "It started raining. I only have a small umbrella.",
    avoidPatterns: ["library", "cafeteria"],
  },
  {
    id: "club_room_key",
    theme: "동아리실 열쇠를 잃어버려 선생님께 말할지 고민",
    setting: "복도, 동아리실 앞",
    responseFunction: "격려",
    openingHook: "I can't find the key to the music room.",
    avoidPatterns: ["science poster", "basketball"],
  },
  {
    id: "presentation_nerves",
    theme: "내일 발표가 걱정되는 친구 격려",
    setting: "도서관",
    responseFunction: "격려",
    openingHook: "I'm really nervous about speaking in front of the class tomorrow.",
    avoidPatterns: ["lost homework", "birthday"],
  },
  {
    id: "cafeteria_line",
    theme: "급식 줄이 길어 다른 코너로 가자는 제안",
    setting: "학교 급식실",
    responseFunction: "수락/동의",
    openingHook: "The line is too long. Should we try the salad bar?",
    avoidPatterns: ["umbrella", "music room"],
  },
  {
    id: "field_trip_form",
    theme: "현장학습 동의서를 부모님께 받아오라는 부탁",
    setting: "교실",
    responseFunction: "정보 확인",
    openingHook: "Did you already get your parents to sign the field trip form?",
    avoidPatterns: ["lost notebook", "rain"],
  },
  {
    id: "recycling_project",
    theme: "재활용 캠페인 포스터 문구 정하기",
    setting: "환경 동아리",
    responseFunction: "동의",
    openingHook: "What should we write on the recycling poster?",
    avoidPatterns: ["birthday", "basketball"],
  },
  {
    id: "after_school_tutor",
    theme: "수학 문제를 같이 풀자는 제안",
    setting: "교실, 방과 후",
    responseFunction: "도움 제공",
    openingHook: "I don't understand problem number five. Can you explain it?",
    avoidPatterns: ["lost key", "umbrella"],
  },
];

const TYPE20_SCENARIOS: ContinuationScenarioAssignment[] = [
  {
    id: "movie_start_time",
    theme: "영화 시작 시간이 늦춰져 표를 사도 된다는 안내",
    setting: "영화관 앞",
    responseFunction: "계획 확인",
    openingHook: "I'm glad we're not late. The movie doesn't start until 3:30.",
    avoidPatterns: ["lost item", "homework", "library book"],
  },
  {
    id: "museum_map",
    theme: "박물관에서 다음 전시관 길 안내",
    setting: "시립 박물관",
    responseFunction: "정보 확인",
    openingHook: "The dinosaur hall is on the second floor. We should go left here.",
    avoidPatterns: ["movie", "cafeteria"],
  },
  {
    id: "train_platform",
    theme: "기차 플랫폼 번호 확인 후 이동",
    setting: "기차역",
    responseFunction: "수락/동의",
    openingHook: "Our train leaves from platform 4 in ten minutes.",
    avoidPatterns: ["bookstore", "health room"],
  },
  {
    id: "bakery_order",
    theme: "베이커리에서 케이크 종류 고르기",
    setting: "동네 베이커리",
    responseFunction: "선택/결정",
    openingHook: "They have chocolate and strawberry cake. Which one do you want?",
    avoidPatterns: ["movie ticket", "museum"],
  },
  {
    id: "sports_day_change",
    theme: "운동회 날짜가 비 때문에 변경됨",
    setting: "교실 공지",
    responseFunction: "안도",
    openingHook: "Sports day is moved to next Friday because of the rain.",
    avoidPatterns: ["lost phone", "science fair"],
  },
  {
    id: "group_project_role",
    theme: "조별과제 역할 분담 수락",
    setting: "도서관 스터디 존",
    responseFunction: "수락/동의",
    openingHook: "Can you design the slides? I'll write the script.",
    avoidPatterns: ["movie", "train"],
  },
  {
    id: "apology_spill",
    theme: "음료를 쏟아 사과한 뒤 괜찮다고 답하기",
    setting: "학교 카페테리아",
    responseFunction: "사과 수용",
    openingHook: "I'm really sorry I spilled juice on your notebook.",
    avoidPatterns: ["birthday", "museum map"],
  },
  {
    id: "concert_seats",
    theme: "학교 음악회 좌석 안내",
    setting: "강당",
    responseFunction: "정보 확인",
    openingHook: "Our seats are in row C near the front.",
    avoidPatterns: ["homework", "lost item"],
  },
  {
    id: "weather_cold",
    theme: "추워서 창문 닫자는 제안에 동의",
    setting: "교실",
    responseFunction: "수락/동의",
    openingHook: "It's getting cold. Should we close the window?",
    avoidPatterns: ["movie", "bakery"],
  },
  {
    id: "photo_pose",
    theme: "졸업 앨범 사진 찍을 때 포즈 제안 수락",
    setting: "운동장",
    responseFunction: "수락/동의",
    openingHook: "Let's stand in front of the school gate for the photo.",
    avoidPatterns: ["science poster", "train platform"],
  },
];

function poolForType(typeId: 19 | 20): ContinuationScenarioAssignment[] {
  return typeId === 19 ? TYPE19_SCENARIOS : TYPE20_SCENARIOS;
}

export function parseUsedScenarioIds(previousProblems?: string[]): string[] {
  if (!previousProblems?.length) return [];
  const ids: string[] = [];
  for (const line of previousProblems) {
    const m = line.match(/scenario_id:([a-z0-9_]+)/i);
    if (m?.[1]) ids.push(m[1]);
  }
  return ids;
}

export function pickContinuationScenario(
  typeId: 19 | 20,
  previousProblems?: string[]
): ContinuationScenarioAssignment {
  const used = new Set(parseUsedScenarioIds(previousProblems));
  const pool = poolForType(typeId);
  const available = pool.filter((s) => !used.has(s.id));
  const list = available.length > 0 ? available : pool;
  return list[Math.floor(Math.random() * list.length)]!;
}

export function formatAssignedScenarioBlock(
  assignment: ContinuationScenarioAssignment
): string {
  return `
## 이번 문항 필수 상황 (반드시 따를 것 — 다른 문항·기출과 다른 새 주제)
- scenario_id: ${assignment.id}
- 상황: ${assignment.theme}
- 장소·배경: ${assignment.setting}
- 권장 응답 기능(correct_response_function): ${assignment.responseFunction}
- 대화 시작 방향(참고): ${assignment.openingHook}
- 이번 대화에서 피할 소재·표현: ${assignment.avoidPatterns.join(", ")}
- JSON의 situation_type 필드에는 반드시 "${assignment.id}" 를 넣는다.
- 잃어버린 물건 / 숙제 / 도서관 / 우산 / 생일파티만 반복하는 패턴 금지.
`.trim();
}

export function buildContinuationAvoidList(
  priorQuestions: Array<{
    order_index: number;
    situation_type?: string;
    segments: Array<{ text: string }>;
  }>,
  _currentTypeId: number
): string[] {
  const lines: string[] = [];
  for (const q of priorQuestions) {
    const st = (q.situation_type ?? "").trim();
    const first = q.segments[0]?.text?.trim() ?? "";
    const last = q.segments[q.segments.length - 1]?.text?.trim() ?? "";
    lines.push(
      `scenario_id:${st || "unknown"}|item:${q.order_index}|first:${first}|last:${last}`
    );
  }
  return lines;
}
