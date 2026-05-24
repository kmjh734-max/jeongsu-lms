/** 중1 영어듣기능력평가 20개 유형 템플릿 (참고용 — 기출 복사 금지) */
export interface ExamTypeTemplate {
  id: number;
  question_type: string;
  instruction: string;
  format_guide: string;
  segment_guide: string;
}

export const MIDDLE1_LISTENING_EXAM_TYPES: ExamTypeTemplate[] = [
  {
    id: 1,
    question_type: "묘사 듣고 대상 고르기",
    instruction: "다음을 듣고, ‘I’가 무엇인지 가장 적절한 것을 고르시오.",
    format_guide:
      "One speaker (M or W) describes an object/animal/place/job in 4~6 short English sentences using 'I'.",
    segment_guide: "ANN: short listen cue in English, then M or W monologue only (no dialogue).",
  },
  {
    id: 2,
    question_type: "주문/선택 정보 파악",
    instruction:
      "대화를 듣고, 남자/여자가 주문한 것으로 가장 적절한 것을 고르시오.",
    format_guide:
      "Shop/cafe/restaurant dialogue. Include cup type, size, toppings, color, or price clues.",
    segment_guide: "ANN + M/W dialogue, 4~8 turns.",
  },
  {
    id: 3,
    question_type: "날씨 파악",
    instruction:
      "다음을 듣고, 오늘 오후/내일 날씨로 가장 적절한 것을 고르시오.",
    format_guide: "Weather forecast monologue or ANN-style report, 3~5 sentences.",
    segment_guide: "ANN or single speaker weather report.",
  },
  {
    id: 4,
    question_type: "마지막 말의 의도",
    instruction:
      "대화를 듣고, 여자/남자가 한 마지막 말의 의도로 가장 적절한 것을 고르시오.",
    format_guide:
      "Dialogue where the LAST line clearly shows intent: refuse, praise, apologize, blame, encourage, etc.",
    segment_guide: "M/W dialogue; last line must be from the person named in instruction.",
  },
  {
    id: 5,
    question_type: "언급하지 않은 것",
    instruction:
      "다음을 듣고, 남자/여자가 ○○에 대해 언급하지 않은 것을 고르시오.",
    format_guide:
      "Announcement about event/performance/class/festival. Four details given; one choice is NOT mentioned.",
    segment_guide: "ANN or M/W; mention title, place, date, price, or where to buy — omit one.",
  },
  {
    id: 6,
    question_type: "시각 파악",
    instruction:
      "대화를 듣고, 수업/행사/약속이 시작하는 시각을 고르시오.",
    format_guide: "Dialogue about schedule change; final agreed start time is clear.",
    segment_guide: "M/W dialogue about time change.",
  },
  {
    id: 7,
    question_type: "장래 희망/직업 희망",
    instruction:
      "대화를 듣고, 여자/남자의 장래 희망으로 가장 적절한 것을 고르시오.",
    format_guide: "Talk about interests and future job hopes.",
    segment_guide: "M/W dialogue.",
  },
  {
    id: 8,
    question_type: "심정 파악",
    instruction:
      "대화를 듣고, 남자/여자의 심정으로 가장 적절한 것을 고르시오.",
    format_guide:
      "Situation: canceled expectation or good news. Choices: disappointed, relieved, worried, satisfied, anxious, etc.",
    segment_guide: "M/W dialogue showing emotion.",
  },
  {
    id: 9,
    question_type: "대화 직후 할 일",
    instruction:
      "대화를 듣고, 여자/남자가 대화 직후에 할 일로 가장 적절한 것을 고르시오.",
    format_guide: "Problem situation then immediate next action.",
    segment_guide: "M/W dialogue.",
  },
  {
    id: 10,
    question_type: "대화 주제/내용",
    instruction:
      "대화를 듣고, 무엇에 관한 내용인지 가장 적절한 것을 고르시오.",
    format_guide: "Everyday problem-solving conversation; topic in choices.",
    segment_guide: "M/W dialogue.",
  },
  {
    id: 11,
    question_type: "이동 방법",
    instruction:
      "대화를 듣고, 두 사람이 함께 이동할 방법으로 가장 적절한 것을 고르시오.",
    format_guide: "Original plan changes; they choose transport together.",
    segment_guide: "M/W dialogue.",
  },
  {
    id: 12,
    question_type: "이유 파악",
    instruction:
      "대화를 듣고, 남자/여자가 ○○에 가는 이유로 가장 적절한 것을 고르시오.",
    format_guide: "Must return to a place or do something again; reason is clear.",
    segment_guide: "M/W dialogue.",
  },
  {
    id: 13,
    question_type: "장소 파악",
    instruction:
      "대화를 듣고, 두 사람이 대화하는 장소로 가장 적절한 곳을 고르시오.",
    format_guide: "Lines imply location: nurse office, teachers' room, music room, etc.",
    segment_guide: "M/W dialogue at school or public place.",
  },
  {
    id: 14,
    question_type: "표 정보 불일치",
    instruction:
      "○○에 관한 다음 내용을 듣고, 표에서 일치하지 않는 것을 고르시오.",
    format_guide:
      "Festival/event/class announcement. question_text includes a simple markdown or text TABLE with 4~5 rows. Exactly ONE choice does NOT match the audio.",
    segment_guide: "ANN announcement with specific details.",
  },
  {
    id: 15,
    question_type: "부탁한 일",
    instruction:
      "대화를 듣고, 여자/남자가 상대에게 부탁한 일로 가장 적절한 것을 고르시오.",
    format_guide: "Family/friend request dialogue.",
    segment_guide: "M/W dialogue.",
  },
  {
    id: 16,
    question_type: "제안한 것",
    instruction:
      "대화를 듣고, 남자/여자가 상대에게 제안한 것으로 가장 적절한 것을 고르시오.",
    format_guide: "Problem + solution suggestion.",
    segment_guide: "M/W dialogue.",
  },
  {
    id: 17,
    question_type: "함께 할 일",
    instruction:
      "대화를 듣고, 두 사람이 이번 주말/오늘 할 일로 가장 적절한 것을 고르시오.",
    format_guide: "Schedule coordination for weekend/today activity.",
    segment_guide: "M/W dialogue.",
  },
  {
    id: 18,
    question_type: "직업 파악",
    instruction:
      "대화를 듣고, 남자/여자의 직업으로 가장 적절한 것을 고르시오.",
    format_guide: "Interview or situational dialogue revealing job.",
    segment_guide: "M/W dialogue.",
  },
  {
    id: 19,
    question_type: "마지막 말에 이어질 응답",
    instruction:
      "대화를 듣고, 여자의 마지막 말에 이어질 남자의 말로 가장 적절한 것을 고르시오.",
    format_guide:
      "Dialogue ends with woman's line; choices are man's possible replies. Do NOT include the answer in the script.",
    segment_guide: "M/W dialogue; woman's last line in audio, man's reply is the question target.",
  },
  {
    id: 20,
    question_type: "마지막 말에 이어질 응답",
    instruction:
      "대화를 듣고, 남자의 마지막 말에 이어질 여자의 말로 가장 적절한 것을 고르시오.",
    format_guide:
      "Dialogue ends with man's line; choices are woman's possible replies. Different situation from type 19.",
    segment_guide: "M/W dialogue; man's last line in audio.",
  },
];

export function getExamTypeById(id: number): ExamTypeTemplate | undefined {
  return MIDDLE1_LISTENING_EXAM_TYPES.find((t) => t.id === id);
}

/** 문항 수·선택 유형에 맞게 유형 목록 결정 */
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
