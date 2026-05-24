/**
 * 2026 중1 전국 영어듣기능력평가 유형 참고 (문장·대본 복사 금지, 유형·지시문 형식만 반영)
 */
export interface ExamTypeTemplate {
  id: number;
  question_type: string;
  instruction: string;
  format_guide: string;
  segment_guide: string;
  choice_guide: string;
}

export const MIDDLE1_LISTENING_EXAM_TYPES: ExamTypeTemplate[] = [
  {
    id: 1,
    question_type: "묘사 듣고 대상 고르기",
    instruction: "다음을 듣고, ‘I’가 무엇인지 가장 적절한 것을 고르시오.",
    format_guide:
      "First-person monologue (4~6 sentences): animal, object, or thing described with I. No dialogue.",
    segment_guide: "ANN: one short English cue, then M OR W monologue only.",
    choice_guide:
      "5 English options naming animals/objects (e.g. crocodile, tiger, eagle — use NEW names, not exam examples).",
  },
  {
    id: 2,
    question_type: "주문/선택 정보 파악",
    instruction: "대화를 듣고, 남자가 주문한 것으로 가장 적절한 것을 고르시오.",
    format_guide:
      "Cafe/ice-cream shop dialogue. Man orders one item; mention size, topping, cup type, or flavor.",
    segment_guide: "M/W dialogue 4~8 turns.",
    choice_guide:
      "5 English options describing different menu items (e.g. ice cream types with toppings).",
  },
  {
    id: 3,
    question_type: "날씨 파악",
    instruction: "다음을 듣고, ○○ 지역 오늘 오후 날씨로 가장 적절한 것을 고르시오.",
    format_guide:
      "Weather report for a Korean city name in instruction (e.g. Hongcheon). 3~5 sentences.",
    segment_guide: "ANN weather announcement.",
    choice_guide:
      "5 English weather words: sunny, cloudy, rainy, snowy, windy (or similar).",
  },
  {
    id: 4,
    question_type: "마지막 말의 의도",
    instruction: "대화를 듣고, 여자가 한 마지막 말의 의도로 가장 적절한 것을 고르시오.",
    format_guide: "Dialogue; woman's LAST line shows clear intent.",
    segment_guide: "M/W dialogue; end with W line.",
    choice_guide: "5 Korean options: 거절, 칭찬, 사과, 비난, 응원 (or similar).",
  },
  {
    id: 5,
    question_type: "언급하지 않은 것",
    instruction: "다음을 듣고, 남자가 뮤지컬에 대해 언급하지 않은 것을 고르시오.",
    format_guide:
      "Announcement about a musical/event. Mention 4 of: title, place, date, price, where to buy — one choice is NOT said.",
    segment_guide: "ANN or M announcement.",
    choice_guide: "5 Korean options: 제목, 장소, 날짜, 가격, 구입처 등.",
  },
  {
    id: 6,
    question_type: "시각 파악",
    instruction: "대화를 듣고, 베이킹 수업이 시작하는 시각을 고르시오.",
    format_guide: "Dialogue about class/event time change; final start time is clear.",
    segment_guide: "M/W dialogue.",
    choice_guide: "5 time options like 3:30 p.m., 4:00 p.m., etc.",
  },
  {
    id: 7,
    question_type: "장래 희망",
    instruction: "대화를 듣고, 여자의 장래 희망으로 가장 적절한 것을 고르시오.",
    format_guide: "Conversation about future dream/job related to hobbies.",
    segment_guide: "M/W dialogue.",
    choice_guide: "5 Korean job/dream options (e.g. 패션 모델, 이벤트 플래너).",
  },
  {
    id: 8,
    question_type: "심정 파악",
    instruction: "대화를 듣고, 남자의 심정으로 가장 적절한 것을 고르시오.",
    format_guide: "Good or bad news situation; man's feeling is clear.",
    segment_guide: "M/W dialogue.",
    choice_guide: "5 Korean: 실망, 안도, 걱정, 만족, 불안 등.",
  },
  {
    id: 9,
    question_type: "대화 직후 할 일",
    instruction: "대화를 듣고, 여자가 대화 직후에 할 일로 가장 적절한 것을 고르시오.",
    format_guide: "Small problem then immediate action by woman.",
    segment_guide: "M/W dialogue.",
    choice_guide: "5 Korean action phrases.",
  },
  {
    id: 10,
    question_type: "대화 주제",
    instruction: "대화를 듣고, 무엇에 관한 내용인지 가장 적절한 것을 고르시오.",
    format_guide: "Everyday problem-solving talk (home, school life).",
    segment_guide: "M/W dialogue.",
    choice_guide: "5 Korean topic phrases.",
  },
  {
    id: 11,
    question_type: "이동 방법",
    instruction: "대화를 듣고, 두 사람이 함께 이동할 방법으로 가장 적절한 것을 고르시오.",
    format_guide: "Plan changes; they agree on transport.",
    segment_guide: "M/W dialogue.",
    choice_guide: "5 Korean: 도보, 버스, 지하철, 자전거, 비행기 등.",
  },
  {
    id: 12,
    question_type: "이유 파악",
    instruction: "대화를 듣고, 남자가 우체국에 가는 이유로 가장 적절한 것을 고르시오.",
    format_guide: "Man must go to post office; reason stated clearly.",
    segment_guide: "M/W dialogue.",
    choice_guide: "5 Korean reason phrases.",
  },
  {
    id: 13,
    question_type: "장소 파악",
    instruction: "대화를 듣고, 두 사람이 대화하고 있는 장소로 가장 적절한 곳을 고르시오.",
    format_guide: "School or building; location implied by context (supplies, activities).",
    segment_guide: "M/W dialogue.",
    choice_guide: "5 Korean: 보건실, 교무실, 음악실, 미술실, 과학실 등.",
  },
  {
    id: 14,
    question_type: "표 정보 불일치",
    instruction:
      "튤립 축제에 관한 다음 내용을 듣고, 표에서 일치하지 않는 것을 고르시오.",
    format_guide:
      "Festival announcement. question_text MUST include a simple text table (항목/내용) with place, period, hours, fee, free drink — ONE row wrong in choices.",
    segment_guide: "ANN announcement with specific details.",
    choice_guide: "5 Korean items matching table rows; one mismatch.",
  },
  {
    id: 15,
    question_type: "부탁한 일",
    instruction: "대화를 듣고, 여자가 남자에게 부탁한 일로 가장 적절한 것을 고르시오.",
    format_guide: "Family/friend favor request.",
    segment_guide: "M/W dialogue.",
    choice_guide: "5 Korean action phrases.",
  },
  {
    id: 16,
    question_type: "제안한 것",
    instruction: "대화를 듣고, 남자가 여자에게 제안한 것으로 가장 적절한 것을 고르시오.",
    format_guide: "Problem and man's suggestion to solve it.",
    segment_guide: "M/W dialogue.",
    choice_guide: "5 Korean suggestion phrases.",
  },
  {
    id: 17,
    question_type: "함께 할 일",
    instruction: "대화를 듣고, 두 사람이 이번 주말에 할 일로 가장 적절한 것을 고르시오.",
    format_guide: "Weekend plan coordination.",
    segment_guide: "M/W dialogue.",
    choice_guide: "5 Korean activity phrases.",
  },
  {
    id: 18,
    question_type: "직업 파악",
    instruction: "대화를 듣고, 남자의 직업으로 가장 적절한 것을 고르시오.",
    format_guide: "Interview or talk revealing man's job.",
    segment_guide: "M/W dialogue.",
    choice_guide: "5 Korean jobs (배우, 소설가, 일러스트레이터, 아나운서, 영화감독 등).",
  },
  {
    id: 19,
    question_type: "마지막 말에 이어질 응답",
    instruction:
      "대화를 듣고, 여자의 마지막 말에 이어질 남자의 말로 가장 적절한 것을 고르시오.",
    format_guide:
      "Dialogue ends with woman's line; choices are 5 short ENGLISH replies the man could say next. Do NOT speak man's answer in audio.",
    segment_guide: "M/W dialogue ending with W.",
    choice_guide: "5 short English sentences (e.g. Sounds great. Let's go.).",
  },
  {
    id: 20,
    question_type: "마지막 말에 이어질 응답",
    instruction:
      "대화를 듣고, 남자의 마지막 말에 이어질 여자의 말로 가장 적절한 것을 고르시오.",
    format_guide:
      "Different situation from #19. Ends with man's line; 5 English replies for woman.",
    segment_guide: "M/W dialogue ending with M.",
    choice_guide: "5 short English sentences.",
  },
];

export function getExamTypeById(id: number): ExamTypeTemplate | undefined {
  return MIDDLE1_LISTENING_EXAM_TYPES.find((t) => t.id === id);
}

export function resolveExamTypesForGeneration(
  count: number,
  selectedTypeIds?: number[]
): ExamTypeTemplate[] {
  if (selectedTypeIds && selectedTypeIds.length > 0) {
    const picked = selectedTypeIds
      .map((id) => getExamTypeById(id))
      .filter((t): t is ExamTypeTemplate => t !== undefined);
    if (picked.length === 0) {
      return MIDDLE1_LISTENING_EXAM_TYPES.slice(0, count);
    }
    if (picked.length >= count) {
      return picked.slice(0, count);
    }
    const result = [...picked];
    for (const t of MIDDLE1_LISTENING_EXAM_TYPES) {
      if (result.length >= count) break;
      if (!result.some((r) => r.id === t.id)) result.push(t);
    }
    return result.slice(0, count);
  }
  return MIDDLE1_LISTENING_EXAM_TYPES.slice(0, Math.min(count, 20));
}
