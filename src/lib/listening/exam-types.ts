import type { ListeningDifficultyTier } from "@/lib/listening/exam-difficulty";
import type { ListeningGradeLevel } from "@/lib/listening/grade-level";
import { MIDDLE2_LISTENING_EXAM_TYPES } from "@/lib/listening/exam-types-middle2";

/**
 * 전국 중1 영어듣기평가 고정 20유형 (2024·2025·2026 기출 형식 참고, 내용 복사 금지)
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
      "One speaker (M or W) describes in first person. 5~7 sentences, 6~13 words each. Last sentence MUST be exactly: What am I?",
    segment_guide: "Monologue only (M or W). No dialogue. Total 55~75 words.",
    choice_guide:
      "5 English nouns in same category (animals OR objects). One correct match to description.",
    difficulty_tier: "foundation",
  },
  {
    id: 2,
    question_type: "구입/주문 정보 파악",
    instruction: "대화를 듣고, ○○가 구입한/주문한 것으로 가장 적절한 것을 고르시오.",
    format_guide:
      "Shop/cafe purchase dialogue. Image choices required (needs_image_choices, choice_image_prompts). Visual conditions: color, pattern, topping, etc. Final I'll take/have/buy sentence.",
    segment_guide: "M/W dialogue 6~8 turns. Clerk and customer.",
    choice_guide:
      "5 English choices same product category; picture-distinguishable; visual_choice_type image.",
    difficulty_tier: "foundation",
  },
  {
    id: 3,
    question_type: "날씨 파악",
    instruction: "다음을 듣고, ○○의 오늘 오후/현재/내일 날씨로 가장 적절한 것을 고르시오.",
    format_guide:
      "Weather report monologue. Specific time in question. weather_icon image choices. weather_target_* fields.",
    segment_guide: "W or M monologue 5~7 sentences. Multiple time periods mentioned.",
    choice_guide:
      "5 Korean weather choices; choice_image_prompts; correct answer matches asked time.",
    difficulty_tier: "foundation",
  },
  {
    id: 4,
    question_type: "마지막 말의 의도 파악",
    instruction: "대화를 듣고, ○○가 한 마지막 말의 의도로 가장 적절한 것을 고르시오.",
    format_guide:
      "Dialogue; last_speaker/target_intention/final_utterance. needs_image_choices false. Final line intent clear.",
    segment_guide: "M/W 6~8 turns. Last line = intent clue; instruction ○○ matches last speaker.",
    choice_guide:
      "5 Korean intention nouns (감사, 거절, 칭찬, 사과, 항의, 격려, 부탁 등). visual_choice_type none.",
    difficulty_tier: "foundation",
  },
  {
    id: 5,
    question_type: "언급하지 않은 것",
    instruction: "다음을 듣고, ○○가 ○○에 대해 언급하지 않은 것을 고르시오.",
    format_guide:
      "Monologue; mention_plan with 4 mentioned + 1 unmentioned. Korean label choices. needs_image_choices false.",
    segment_guide: "M or W monologue 5~7 sentences. English script only.",
    choice_guide:
      "5 Korean information labels (이름, 날짜, 장소…). correct_answer = unmentioned item.",
    difficulty_tier: "foundation",
  },
  {
    id: 6,
    question_type: "시각 파악",
    instruction: "대화를 듣고, 두 사람이 만날 시각/수업이 시작하는 시각을 고르시오.",
    format_guide:
      "M/W dialogue; 2+ times; final_time matches instruction target. time_question_target, mentioned_times.",
    segment_guide: "M/W 6~8 turns. Final time confirmed in last 1~2 turns.",
    choice_guide:
      "5 English times (e.g. 4:30 p.m.). needs_image_choices false.",
    difficulty_tier: "foundation",
  },
  {
    id: 7,
    question_type: "장래 희망 파악",
    instruction: "대화를 듣고, ○○의 장래 희망으로 가장 적절한 것을 고르시오.",
    format_guide:
      "Interest → I want to be a/an ...; target_person, dream_job, interest_clues. needs_image_choices false.",
    segment_guide: "M/W 6~8 turns. Dream job in later turns.",
    choice_guide: "5 Korean job names. target_person matches instruction.",
    difficulty_tier: "standard",
  },
  {
    id: 8,
    question_type: "심정 파악",
    instruction: "대화를 듣고, ○○의 심정으로 가장 적절한 것을 고르시오.",
    format_guide:
      "Target person emotion; target_person, target_emotion, emotion_clues. needs_image_choices false.",
    segment_guide: "M/W 6~8 turns. Clues in target speaker lines.",
    choice_guide: "5 Korean emotion nouns (실망, 설렘, 걱정, 안도, 당황 등).",
    difficulty_tier: "standard",
  },
  {
    id: 9,
    question_type: "대화 직후 할 일 파악",
    instruction: "대화를 듣고, ○○가 대화 직후에 할 일로 가장 적절한 것을 고르시오.",
    format_guide:
      "Immediate next action; target_person, immediate_action, mentioned_actions. I'll ... now.",
    segment_guide: "M/W 6~8 turns. Last 1~2 turns state immediate action.",
    choice_guide: "5 Korean action phrases (~하기, ~가기). needs_image_choices false.",
    difficulty_tier: "standard",
  },
  {
    id: 10,
    question_type: "대화의 핵심 내용 파악",
    instruction: "대화를 듣고, 무엇에 관한 내용인지 가장 적절한 것을 고르시오.",
    format_guide:
      "Core content noun phrase; main_content, content_clues, topic_distractor_reasons.",
    segment_guide: "M/W 6~8 turns. One consistent core topic throughout.",
    choice_guide: "5 Korean content noun phrases (동영상 촬영 장소, 물건 나눔). needs_image_choices false.",
    difficulty_tier: "standard",
  },
  {
    id: 11,
    question_type: "이동 방법 파악",
    instruction: "대화를 듣고, 두 사람이 함께 이동할 방법으로 가장 적절한 것을 고르시오.",
    format_guide:
      "Multiple transport candidates; final_transport, destination, mentioned_transport_options.",
    segment_guide: "M/W 6~8 turns. Destination clear; final decision at end (Let's take ...).",
    choice_guide: "5 Korean transports (도보, 버스, 지하철, 택시, 비행기 등). needs_image_choices false.",
    difficulty_tier: "standard",
  },
  {
    id: 12,
    question_type: "이유 파악",
    instruction: "대화를 듣고, ○○가 ○○에 가는 이유로 가장 적절한 것을 고르시오.",
    format_guide:
      "Reason for going; target_person, target_place, reason_for_going, mentioned_possible_reasons.",
    segment_guide: "M/W 6~8 turns. Place stated; reason clarified mid-late dialogue.",
    choice_guide: "5 Korean reason phrases (~하기 위해서). needs_image_choices false.",
    difficulty_tier: "standard",
  },
  {
    id: 13,
    question_type: "대화 장소 파악",
    instruction: "대화를 듣고, 두 사람이 대화하는 장소로 가장 적절한 곳을 고르시오.",
    format_guide:
      "Infer place from clues; target_place, place_clues, distractor_places. Do NOT name place in script.",
    segment_guide: "M/W 6~8 turns. At least 2 place clues (objects, actions, services).",
    choice_guide: "5 Korean place names (보건실, 도서관, 우체국). needs_image_choices false.",
    difficulty_tier: "standard",
  },
  {
    id: 14,
    question_type: "표 정보 불일치",
    instruction: "○○에 관한 다음 내용을 듣고, 표의 내용과 일치하지 않는 것을 고르시오.",
    format_guide:
      "table_data required (5 rows, 1 mismatch). source_facts_from_script. visual_choice_type table.",
    segment_guide: "Single speaker M or W, 5~7 announcement sentences.",
    choice_guide: "5 Korean labels matching table_data.rows order. correct_answer = mismatch_no.",
    difficulty_tier: "applied",
  },
  {
    id: 15,
    question_type: "부탁한 일 파악",
    instruction: "대화를 듣고, ○○가 ○○에게 부탁한 일로 가장 적절한 것을 고르시오.",
    format_guide:
      "Request (Can/Could/Would you). requester, requested_person, requested_action, request_expression.",
    segment_guide: "M/W 6~8 turns. Request in latter half. NOT suggestion (16).",
    choice_guide: "5 Korean action phrases (~하기). needs_image_choices false.",
    difficulty_tier: "applied",
  },
  {
    id: 16,
    question_type: "제안한 것 파악",
    instruction: "대화를 듣고, ○○가 ○○에게 제안한 것으로 가장 적절한 것을 고르시오.",
    format_guide:
      "Suggestion (Why don't / How about / Let's). suggester, suggested_to, suggested_action, suggestion_expression. NOT request (15).",
    segment_guide: "M/W 6~8 turns. Problem first, suggestion in latter half.",
    choice_guide: "5 Korean action phrases (~하기). needs_image_choices false.",
    difficulty_tier: "applied",
  },
  {
    id: 17,
    question_type: "특정 시점에 할 일 파악",
    instruction: "대화를 듣고, ○○가 오늘 오후/이번 주말에 할 일로 가장 적절한 것을 고르시오.",
    format_guide:
      "Schedule at specific time. target_person, target_time, planned_action, mentioned_other_actions. NOT immediate (9), request (15), suggestion (16).",
    segment_guide: "M/W 6~8 turns. Multiple activities mentioned; final plan for target_time clear.",
    choice_guide: "5 Korean activity phrases (~하기). needs_image_choices false.",
    difficulty_tier: "applied",
  },
  {
    id: 18,
    question_type: "직업 파악",
    instruction: "대화를 듣고, ○○의 직업으로 가장 적절한 것을 고르시오.",
    format_guide:
      "Job NOT named in script. target_person, target_job, job_clues(2+), distractor_jobs. NOT dream job (7).",
    segment_guide: "M/W 6~8 turns. Work role clues from actions/tools/settings.",
    choice_guide: "5 Korean job names. needs_image_choices false.",
    difficulty_tier: "applied",
  },
  {
    id: 19,
    question_type: "응답 고르기",
    instruction: "대화를 듣고, 여자의 마지막 말에 이어질 남자의 말로 가장 적절한 것을 고르시오.",
    format_guide:
      "5~7 turns; ends with W. question_text Man: ______. blank_speaker M. Reply NOT in segments.",
    segment_guide: "M/W dialogue; last segment W only; previous_turn = last W utterance.",
    choice_guide: "5 English response sentences. NOT Okay/Yes/Sure alone. correct_response_function required.",
    difficulty_tier: "advanced",
  },
  {
    id: 20,
    question_type: "응답 고르기",
    instruction: "대화를 듣고, 남자의 마지막 말에 이어질 여자의 말로 가장 적절한 것을 고르시오.",
    format_guide:
      "5~7 turns; ends with M. question_text Woman: ______. blank_speaker W. NOT same as Q19.",
    segment_guide: "M/W dialogue; last segment M only; situation_type required.",
    choice_guide: "5 English response sentences. situation_type + correct_response_function.",
    difficulty_tier: "advanced",
  },
];

export function getExamTypesForGrade(grade: ListeningGradeLevel): ExamTypeTemplate[] {
  return grade === "middle2" ? MIDDLE2_LISTENING_EXAM_TYPES : MIDDLE1_LISTENING_EXAM_TYPES;
}

export function getExamTypeById(
  id: number,
  grade: ListeningGradeLevel = "middle1"
): ExamTypeTemplate | undefined {
  return getExamTypesForGrade(grade).find((t) => t.id === id);
}

/** 5→1~5, 10→1~10, 20→1~20 고정 순서 */
export function resolveExamTypesForGeneration(
  count: number,
  selectedTypeIds?: number[],
  grade: ListeningGradeLevel = "middle1"
): ExamTypeTemplate[] {
  const allTypes = getExamTypesForGrade(grade);
  if (selectedTypeIds && selectedTypeIds.length > 0) {
    const picked = selectedTypeIds
      .map((id) => getExamTypeById(id, grade))
      .filter((t): t is ExamTypeTemplate => t !== undefined)
      .sort((a, b) => a.id - b.id);
    if (picked.length === 0) {
      return allTypes.slice(0, Math.min(count, 20));
    }
    if (picked.length >= count) {
      return picked.slice(0, count);
    }
    const result = [...picked];
    for (const t of allTypes) {
      if (result.length >= count) break;
      if (!result.some((r) => r.id === t.id)) result.push(t);
    }
    return result.slice(0, count);
  }
  return allTypes.slice(0, Math.min(count, 20));
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
