import type { ListeningDifficultyTier } from "@/lib/listening/exam-difficulty";
import type { ExamTypeTemplate } from "@/lib/listening/exam-types";

/**
 * 전국 중2 영어듣기평가 고정 20유형 (2025·2026 기출 형식 참고, 내용 복사 금지)
 */
export const MIDDLE2_LISTENING_EXAM_TYPES: ExamTypeTemplate[] = [
  {
    id: 1,
    question_type: "날씨 파악",
    instruction: "다음을 듣고, ○○의 날씨로 가장 적절한 것을 고르시오.",
    format_guide:
      "Weather report monologue mentioning 2+ places; one target place in instruction. weather_icon or Korean weather choices.",
    segment_guide: "M or W monologue 6~8 sentences. Multiple regions/periods.",
    choice_guide: "5 Korean weather phrases or image icons. Correct = asked place/time.",
    difficulty_tier: "foundation",
  },
  {
    id: 2,
    question_type: "구입/주문 물품 파악",
    instruction: "대화를 듣고, ○○가 구매할/주문할 것으로 가장 적절한 것을 고르시오.",
    format_guide: "Purchase dialogue with visual distinction (color, shape, pattern). needs_image_choices true.",
    segment_guide: "M/W 7~10 turns. Final decision clear.",
    choice_guide: "5 English product labels; image choices; visual_choice_type image.",
    difficulty_tier: "foundation",
  },
  {
    id: 3,
    question_type: "심정 파악",
    instruction: "대화를 듣고, ○○의 심정으로 가장 적절한 것을 고르시오.",
    format_guide: "target_person, target_emotion, emotion_clues. Korean or English emotion choices per prompt.",
    segment_guide: "M/W 7~10 turns.",
    choice_guide: "5 emotion words (Korean nouns or English adjectives).",
    difficulty_tier: "foundation",
  },
  {
    id: 4,
    question_type: "과거에 한 일 파악",
    instruction:
      "대화를 듣고, ○○가 (오늘 아침/어제/지난 주말)에 한 일로 가장 적절한 것을 고르시오.",
    format_guide:
      "Past action at stated time frame. immediate_action field stores correct action; mentioned_actions = distractors.",
    segment_guide: "M/W 7~10 turns. Time frame explicit in instruction.",
    choice_guide: "5 Korean action phrases (~하기).",
    difficulty_tier: "foundation",
  },
  {
    id: 5,
    question_type: "대화 장소 파악",
    instruction: "대화를 듣고, 두 사람이 대화하는 장소로 가장 적절한 곳을 고르시오.",
    format_guide: "Infer place; target_place, place_clues (2+). Do NOT name place in script.",
    segment_guide: "M/W 7~10 turns.",
    choice_guide: "5 Korean place names.",
    difficulty_tier: "foundation",
  },
  {
    id: 6,
    question_type: "마지막 말의 의도 파악",
    instruction: "대화를 듣고, ○○의 마지막 말의 의도로 가장 적절한 것을 고르시오.",
    format_guide: "last_speaker, target_intention, final_utterance, intention_candidates.",
    segment_guide: "M/W 7~10 turns. Last line intent clear.",
    choice_guide: "5 Korean intention nouns (거절, 요청, 동의, 사과, 감사, 당부, 항의 등).",
    difficulty_tier: "foundation",
  },
  {
    id: 7,
    question_type: "구입/가져올 물품 파악",
    instruction: "대화를 듣고, ○○가 구입할/가져올 물건으로 가장 적절한 것을 고르시오.",
    format_guide: "Item to buy/bring; may use images. Final I'll buy/bring/take.",
    segment_guide: "M/W 7~10 turns.",
    choice_guide: "5 Korean nouns or English product names.",
    difficulty_tier: "standard",
  },
  {
    id: 8,
    question_type: "대화 직후 할 일 파악",
    instruction: "대화를 듣고, ○○가 대화 직후에 할 일로 가장 적절한 것을 고르시오.",
    format_guide: "immediate_action, mentioned_actions, target_person.",
    segment_guide: "M/W 7~10 turns. I'll ... right away / now.",
    choice_guide: "5 Korean action phrases.",
    difficulty_tier: "standard",
  },
  {
    id: 9,
    question_type: "언급하지 않은 것",
    instruction: "대화를 듣고, 두 사람이 ○○에 대해 언급하지 않은 것을 고르시오.",
    format_guide: "Event/topic name in instruction. mention_plan: 4 mentioned + 1 unmentioned.",
    segment_guide: "M/W 7~10 turns about one event/program.",
    choice_guide: "5 Korean labels (날짜, 장소, 참가 대상, 우승 상품, 책 제목 등).",
    difficulty_tier: "standard",
  },
  {
    id: 10,
    question_type: "담화 내용 파악",
    instruction: "다음을 듣고, ○○가 하는 말의 내용으로 가장 적절한 것을 고르시오.",
    format_guide: "Monologue (lesson, announcement, safety). main_content = correct choice.",
    segment_guide: "M or W monologue 6~8 sentences. NOT dialogue.",
    choice_guide: "5 Korean content noun phrases.",
    difficulty_tier: "standard",
  },
  {
    id: 11,
    question_type: "표/안내 정보 불일치",
    instruction: "○○에 관한 다음 내용을 듣고, 표의 내용과 일치하지 않는 것을 고르시오.",
    format_guide: "table_data 5 rows, 1 mismatch. source_facts_from_script.",
    segment_guide: "M/W dialogue or monologue announcing event/facility.",
    choice_guide: "5 Korean statements matching table rows.",
    difficulty_tier: "standard",
  },
  {
    id: 12,
    question_type: "목적 파악",
    instruction:
      "대화를 듣고, ○○가 (전화를 건/외출을 하는/친구를 만나러 가는) 목적으로 가장 적절한 것을 고르시오.",
    format_guide: "reason_for_going stores purpose; target_person required.",
    segment_guide: "M/W 7~10 turns.",
    choice_guide: "5 Korean purpose phrases (~하려고).",
    difficulty_tier: "standard",
  },
  {
    id: 13,
    question_type: "거스름돈 파악",
    instruction: "대화를 듣고, ○○가 받을 거스름돈으로 가장 적절한 것을 고르시오.",
    format_guide:
      "Shop/cafe payment. final_time stores change amount label e.g. $4; mentioned_times = price steps. Math must be unique.",
    segment_guide: "M/W 7~10 turns with item prices and total stated clearly.",
    choice_guide: "5 English money amounts ($2, $4, ...).",
    difficulty_tier: "applied",
  },
  {
    id: 14,
    question_type: "관계 파악",
    instruction: "대화를 듣고, 두 사람의 관계로 가장 적절한 것을 고르시오.",
    format_guide:
      "Infer roles (직업 관계). target_job = correct relationship label; job_clues = clues; distractor_jobs = wrong pairs.",
    segment_guide: "M/W 7~10 turns. Roles implied by actions, not stated directly.",
    choice_guide: "5 Korean relationship pairs (A―B format).",
    difficulty_tier: "applied",
  },
  {
    id: 15,
    question_type: "부탁한 일 파악",
    instruction: "대화를 듣고, ○○가 ○○에게 부탁한 일로 가장 적절한 것을 고르시오.",
    format_guide: "requester, requested_person, requested_action, request_expression.",
    segment_guide: "M/W 7~10 turns. Could you / Can you request.",
    choice_guide: "5 Korean action phrases.",
    difficulty_tier: "applied",
  },
  {
    id: 16,
    question_type: "이유 파악",
    instruction:
      "대화를 듣고, ○○가 (학교에 다시 가는/수영 강습을 중단한/집에 다시 가는) 이유로 가장 적절한 것을 고르시오.",
    format_guide: "reason_for_going, target_person, mentioned_possible_reasons.",
    segment_guide: "M/W 7~10 turns. Reason in latter half.",
    choice_guide: "5 Korean reason phrases (~해서 / ~기 위해서).",
    difficulty_tier: "applied",
  },
  {
    id: 17,
    question_type: "그림 상황 대화 고르기",
    instruction: "다음 그림의 상황에 가장 적절한 대화를 고르시오.",
    format_guide:
      "question_text describes one picture scenario. choices = 5 short English dialogues (2~4 lines each). needs_image_choices false; picture described in question_text.",
    segment_guide: "N/A — choices contain full mini-dialogues.",
    choice_guide: "5 English dialogue snippets; one matches pictured situation.",
    difficulty_tier: "applied",
  },
  {
    id: 18,
    question_type: "언급하지 않은 것",
    instruction: "다음을 듣고, ○○가 ○○에 대해 언급하지 않은 것을 고르시오.",
    format_guide: "Announcement monologue. mention_plan or main_content + unmentioned label.",
    segment_guide: "M or W monologue 6~8 sentences.",
    choice_guide: "5 Korean information labels.",
    difficulty_tier: "applied",
  },
  {
    id: 19,
    question_type: "응답 고르기",
    instruction: "대화를 듣고, 여자의 마지막 말에 이어질 남자의 말로 가장 적절한 것을 고르시오.",
    format_guide: "Ends with W. Man: ______. blank_speaker M. 7~10 turns.",
    segment_guide: "Last segment W only.",
    choice_guide: "5 English response sentences. Specific context; not Okay/Sure alone.",
    difficulty_tier: "advanced",
  },
  {
    id: 20,
    question_type: "응답 고르기",
    instruction: "대화를 듣고, 남자의 마지막 말에 이어질 여자의 말로 가장 적절한 것을 고르시오.",
    format_guide: "Ends with M. Woman: ______. blank_speaker W. situation_type required.",
    segment_guide: "Last segment M only.",
    choice_guide: "5 English response sentences.",
    difficulty_tier: "advanced",
  },
];

export function getMiddle2ExamTypeById(id: number): ExamTypeTemplate | undefined {
  return MIDDLE2_LISTENING_EXAM_TYPES.find((t) => t.id === id);
}
