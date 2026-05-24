import type { ListeningDifficultyTier } from "@/lib/listening/exam-difficulty";

/**
 * 2024·2025 전국 중1 영어듣기능력평가 유형 참고 (문장·대본 복사 금지, 지시문·형식·난이도만 반영)
 */
export interface ExamTypeTemplate {
  id: number;
  question_type: string;
  instruction: string;
  format_guide: string;
  segment_guide: string;
  choice_guide: string;
  difficulty_tier: ListeningDifficultyTier;
}

export const MIDDLE1_LISTENING_EXAM_TYPES: ExamTypeTemplate[] = [
  {
    id: 1,
    question_type: "묘사 듣고 대상 고르기",
    instruction: "다음을 듣고, ‘I’가 무엇인지 가장 적절한 것을 고르시오.",
    format_guide:
      "First-person monologue (3~4 sentences): animal, insect, or object with I. No dialogue. Simple clues (body, habitat, behavior).",
    segment_guide:
      "M OR W monologue only (no ANN required). 3~4 short sentences, 6~10 words each.",
    choice_guide:
      "5 English options naming animals/objects/places (NEW names; not seahorse/ant from real exams).",
    difficulty_tier: "foundation",
  },
  {
    id: 2,
    question_type: "구매·선택 대화",
    instruction: "대화를 듣고, ○○가 구입할 ○○으로 가장 적절한 것을 고르시오.",
    format_guide:
      "Shop dialogue (clothes, doll, coat, etc.). Buyer chooses ONE item after comparing 2 options. Fill ○○ in instruction with 남자/여자 and item (인형, 코트, etc.).",
    segment_guide: "M/W dialogue 4~6 turns; clear final purchase.",
    choice_guide:
      "5 English options describing different products (with one distinguishing detail each).",
    difficulty_tier: "foundation",
  },
  {
    id: 3,
    question_type: "날씨 파악",
    instruction: "다음을 듣고, ○○의 (오늘 오후|현재) 날씨로 가장 적절한 것을 고르시오.",
    format_guide:
      "Weather report for a Korean place name (Gangneung, Dokdo, etc.). 3~4 sentences about rain, wind, sun.",
    segment_guide: "W or ANN weather announcement; 3~4 sentences.",
    choice_guide:
      "5 English weather words: sunny, cloudy, rainy, snowy, windy (or similar).",
    difficulty_tier: "foundation",
  },
  {
    id: 4,
    question_type: "마지막 말의 의도",
    instruction: "대화를 듣고, ○○가 한 마지막 말의 의도로 가장 적절한 것을 고르시오.",
    format_guide:
      "Dialogue; one speaker's LAST line shows clear intent (praise, apology, promise to fix, etc.).",
    segment_guide: "M/W dialogue 4~6 turns; end with M or W (match instruction).",
    choice_guide: "5 Korean options: 칭찬, 사과, 거절, 부탁, 격려, 항의 등.",
    difficulty_tier: "foundation",
  },
  {
    id: 5,
    question_type: "언급하지 않은 것",
    instruction: "다음을 듣고, ○○가 ○○에 대해 언급하지 않은 것을 고르시오.",
    format_guide:
      "Monologue or announcement about a person/event. Mention 4 of 5 facts — one choice was NOT said.",
    segment_guide: "M or W monologue 4~5 sentences (introduction or event info).",
    choice_guide:
      "5 Korean short phrases: 이름, 나이, 직업, 취미, 날짜, 장소, 거리, 신청 방법 등.",
    difficulty_tier: "foundation",
  },
  {
    id: 6,
    question_type: "시각·만남 시각",
    instruction: "대화를 듣고, 두 사람이 만날 시각을 고르시오.",
    format_guide:
      "Dialogue negotiating meeting time; final agreed time is clear (may start with wrong times).",
    segment_guide: "M/W dialogue 5~7 turns; may include phone ring cue in script_text only.",
    choice_guide: "5 time options like 4:00 p.m., 5:30 p.m., 6:00 p.m.",
    difficulty_tier: "foundation",
  },
  {
    id: 7,
    question_type: "장래 희망",
    instruction: "대화를 듣고, ○○의 장래 희망으로 가장 적절한 것을 고르시오.",
    format_guide: "Conversation about future dream/job linked to hobbies or skills.",
    segment_guide: "M/W dialogue 5~7 turns.",
    choice_guide: "5 Korean jobs/dreams (작가, 바이올린 연주자, 요리사, etc.).",
    difficulty_tier: "standard",
  },
  {
    id: 8,
    question_type: "심정 파악",
    instruction: "대화를 듣고, ○○의 심정으로 가장 적절한 것을 고르시오.",
    format_guide: "Surprise, worry, relief, or disappointment situation; feeling is clear.",
    segment_guide: "M/W dialogue 5~7 turns.",
    choice_guide: "5 Korean: 설렘, 걱정, 안도, 실망, 당황스러움 등.",
    difficulty_tier: "standard",
  },
  {
    id: 9,
    question_type: "대화 직후 할 일",
    instruction: "대화를 듣고, ○○가 대화 직후에 할 일로 가장 적절한 것을 고르시오.",
    format_guide: "Problem discussed; speaker will do something immediately after.",
    segment_guide: "M/W dialogue 5~7 turns; last line leads to action.",
    choice_guide: "5 Korean action phrases.",
    difficulty_tier: "standard",
  },
  {
    id: 10,
    question_type: "대화 주제",
    instruction: "대화를 듣고, 무엇에 관한 내용인지 가장 적절한 것을 고르시오.",
    format_guide: "Everyday school/home activity planning.",
    segment_guide: "M/W dialogue 5~7 turns.",
    choice_guide: "5 Korean topic phrases (동영상 촬영, 장난감 나눔, etc.).",
    difficulty_tier: "standard",
  },
  {
    id: 11,
    question_type: "이동 방법",
    instruction: "대화를 듣고, 두 사람이 함께 이동할 방법으로 가장 적절한 것을 고르시오.",
    format_guide: "They discuss transport and agree on one method.",
    segment_guide: "M/W dialogue 5~7 turns (family or friends).",
    choice_guide: "5 Korean: 도보, 버스, 택시, 비행기, 지하철 등.",
    difficulty_tier: "standard",
  },
  {
    id: 12,
    question_type: "이유 파악",
    instruction: "대화를 듣고, ○○가 ○○에 가는 이유로 가장 적절한 것을 고르시오.",
    format_guide: "Someone going to a place; reason stated clearly.",
    segment_guide: "M/W dialogue 5~7 turns.",
    choice_guide: "5 Korean reason phrases (~하려고).",
    difficulty_tier: "standard",
  },
  {
    id: 13,
    question_type: "장소 파악",
    instruction: "대화를 듣고, 두 사람이 대화하는 장소로 가장 적절한 곳을 고르시오.",
    format_guide: "Location implied by context (sports, shopping, school facilities).",
    segment_guide: "M/W dialogue 5~7 turns.",
    choice_guide: "5 Korean places: 야구장, 신발 가게, 시청, 학교 정원 등.",
    difficulty_tier: "standard",
  },
  {
    id: 14,
    question_type: "표·안내 불일치",
    instruction:
      "○○에 관한 다음 내용을 듣고, 표에서 일치하지 않는 것을 고르시오.",
    format_guide:
      "Event/class announcement (baking class, festival, etc.). question_text MUST include a simple Korean table (항목/내용) with 5 rows — audio matches 4 rows, one choice is wrong.",
    segment_guide: "W or ANN announcement 5~6 sentences with specific times, fees, place.",
    choice_guide: "5 Korean items matching table row labels.",
    difficulty_tier: "applied",
  },
  {
    id: 15,
    question_type: "부탁한 일",
    instruction: "대화를 듣고, ○○가 ○○에게 부탁한 일로 가장 적절한 것을 고르시오.",
    format_guide: "Family/friend asks for a favor; favor is clear.",
    segment_guide: "M/W dialogue 5~7 turns.",
    choice_guide: "5 Korean action phrases.",
    difficulty_tier: "applied",
  },
  {
    id: 16,
    question_type: "제안한 것",
    instruction: "대화를 듣고, ○○가 ○○에게 제안한 것으로 가장 적절한 것을 고르시오.",
    format_guide: "After exam or problem, one person suggests an activity.",
    segment_guide: "M/W dialogue 5~7 turns.",
    choice_guide: "5 Korean suggestion phrases.",
    difficulty_tier: "applied",
  },
  {
    id: 17,
    question_type: "할 일·계획",
    instruction: "대화를 듣고, ○○가 (주말에|오늘 오후에) 할 일로 가장 적절한 것을 고르시오.",
    format_guide: "Plans for weekend or afternoon activity.",
    segment_guide: "M/W dialogue 5~7 turns.",
    choice_guide: "5 Korean activity phrases.",
    difficulty_tier: "applied",
  },
  {
    id: 18,
    question_type: "직업 파악",
    instruction: "대화를 듣고, ○○의 직업으로 가장 적절한 것을 고르시오.",
    format_guide: "Job revealed through work context (vet, cleaner, etc.).",
    segment_guide: "M/W dialogue 5~7 turns.",
    choice_guide: "5 Korean jobs.",
    difficulty_tier: "applied",
  },
  {
    id: 19,
    question_type: "이어 말하기 (여→남)",
    instruction:
      "대화를 듣고, 여자의 마지막 말에 이어질 남자의 말로 가장 적절한 것을 고르시오.",
    format_guide:
      "Dialogue ends with woman's line after [Pause] cue in script only. Man's reply is NOT in audio. 5 short English replies.",
    segment_guide:
      "M/W dialogue 7~9 turns; last segment is W; do NOT include man's answer in segments.",
    choice_guide:
      "5 short English sentences (e.g. I'm glad it's finally here. / That sounds great.).",
    difficulty_tier: "advanced",
  },
  {
    id: 20,
    question_type: "이어 말하기 (남→여)",
    instruction:
      "대화를 듣고, 남자의 마지막 말에 이어질 여자의 말로 가장 적절한 것을 고르시오.",
    format_guide:
      "Different topic from #19. Ends with man's line; woman's reply not in audio.",
    segment_guide: "M/W dialogue 7~9 turns; last segment is M.",
    choice_guide: "5 short English sentences.",
    difficulty_tier: "advanced",
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

export function tierLabel(tier: ListeningDifficultyTier): string {
  const map: Record<ListeningDifficultyTier, string> = {
    foundation: "기초",
    standard: "보통",
    applied: "심화",
    advanced: "고난도",
  };
  return map[tier];
}
