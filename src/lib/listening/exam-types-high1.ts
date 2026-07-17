import type { ExamTypeTemplate } from "@/lib/listening/exam-type-template";

/**
 * 고1 전국연합학력평가 영어 듣기 1~17번 고정 유형
 * (2025.9·10 / 2026.3·6 기출 형식 참고, 내용 복사 금지)
 */
export const HIGH1_LISTENING_EXAM_TYPES: ExamTypeTemplate[] = [
  {
    id: 1,
    question_type: "목적 파악",
    instruction: "다음을 듣고, ○○가 하는 말의 목적으로 가장 적절한 것을 고르시오.",
    format_guide:
      "School/community announcement monologue. Purpose = inform, request, invite, encourage, or announce a change. Korean choices.",
    segment_guide:
      "Monologue only (M or W). 5~8 sentences. Total 85~120 words. Opens with greeting/self-ID, states plan/change, closes with thanks/cooperation.",
    choice_guide:
      "5 Korean purpose statements (…하려고). Only one matches the announced purpose; distractors share topic words.",
    difficulty_tier: "foundation",
  },
  {
    id: 2,
    question_type: "의견 파악",
    instruction: "대화를 듣고, ○○의 의견으로 가장 적절한 것을 고르시오.",
    format_guide:
      "M/W dialogue. Target speaker states/repeats a clear opinion or advice. Korean choices.",
    segment_guide:
      "M/W dialogue 7~10 turns. Total 90~130 words. Opinion appears in later turns and may be restated.",
    choice_guide:
      "5 Korean opinion statements. Correct = speaker's stance; distractors = other speaker or related but wrong claim.",
    difficulty_tier: "foundation",
  },
  {
    id: 3,
    question_type: "요지 파악",
    instruction: "다음을 듣고, ○○가 하는 말의 요지로 가장 적절한 것을 고르시오.",
    format_guide:
      "Radio tip / advice monologue. Gist is a generalizable main idea, not a single detail. Korean choices.",
    segment_guide:
      "Monologue (M or W). 5~8 sentences. Total 80~115 words. Hook → tip → brief why it works.",
    choice_guide:
      "5 Korean gist statements. Correct abstracts the tip; distractors are details or opposite advice.",
    difficulty_tier: "foundation",
  },
  {
    id: 4,
    question_type: "그림 불일치",
    instruction: "대화를 듣고, 그림에서 대화의 내용과 일치하지 않는 것을 고르시오.",
    format_guide:
      "Dialogue describes a scene/poster with 5 labeled details (①–⑤). Exactly one detail in the picture does NOT match the dialogue. needs_image_choices true.",
    segment_guide:
      "M/W dialogue 7~10 turns. Total 95~140 words. Speakers mention all five labeled items; one statement conflicts with the image design.",
    choice_guide:
      "choices = [\"①\",\"②\",\"③\",\"④\",\"⑤\"]. correct_answer = the labeled part that mismatches. choice_image_prompts: one composite scene with five clear labels.",
    difficulty_tier: "foundation",
  },
  {
    id: 5,
    question_type: "할 일",
    instruction: "대화를 듣고, ○○가 할 일로 가장 적절한 것을 고르시오.",
    format_guide:
      "Checklist dialogue: several tasks already done vs one remaining action for the target speaker. Korean choices.",
    segment_guide:
      "M/W dialogue 8~11 turns. Total 100~140 words. Target says they will do X / I'll … right away for the remaining task.",
    choice_guide:
      "5 Korean action phrases (…하기). Correct = remaining task; distractors = already completed tasks.",
    difficulty_tier: "foundation",
  },
  {
    id: 6,
    question_type: "금액 계산",
    instruction: "대화를 듣고, ○○가 지불할 금액을 고르시오.",
    format_guide:
      "Purchase/rental dialogue with unit prices, quantities, optional extras, and optional coupon/discount. Dollar choices. Often 3 points.",
    segment_guide:
      "M/W dialogue 8~12 turns. Total 100~150 words. All numbers spoken clearly; final payable amount computable.",
    choice_guide:
      "5 dollar amounts (e.g. $25). Correct = exact final payment after options/discount. Distractors = common calc errors.",
    difficulty_tier: "standard",
  },
  {
    id: 7,
    question_type: "이유 파악",
    instruction: "대화를 듣고, ○○가 … 이유를 고르시오.",
    format_guide:
      "Dialogue about inability/absence/failure. Partner guesses wrong reasons; true reason stated later. Korean choices.",
    segment_guide:
      "M/W dialogue 8~11 turns. Total 100~140 words. Deny 1~2 wrong guesses, then give real reason.",
    choice_guide:
      "5 Korean reason phrases (…해서). Correct = true reason; distractors = guessed or mentioned but denied reasons.",
    difficulty_tier: "standard",
  },
  {
    id: 8,
    question_type: "미언급",
    instruction: "대화를 듣고, ○○에 관해 언급되지 않은 것을 고르시오.",
    format_guide:
      "Event/class info dialogue. Four of five choice labels are mentioned; one is not. Korean item labels.",
    segment_guide:
      "M/W dialogue 7~10 turns. Total 95~135 words. Explicitly cover date, fee, how to join, materials, etc. — omit exactly one.",
    choice_guide:
      "5 Korean labels (날짜, 참가비, 준비물…). correct_answer = unmentioned label.",
    difficulty_tier: "standard",
  },
  {
    id: 9,
    question_type: "내용 불일치",
    instruction: "○○에 관한 다음 내용을 듣고, 일치하지 않는 것을 고르시오.",
    format_guide:
      "Event announcement monologue. Four facts match choices; one choice conflicts with the script. Korean choices.",
    segment_guide:
      "Monologue (M or W). 6~9 sentences. Total 100~140 words. Place, time, features, fee/reservation clearly stated.",
    choice_guide:
      "5 Korean factual claims. Correct = the false claim relative to the script.",
    difficulty_tier: "standard",
  },
  {
    id: 10,
    question_type: "표 선택",
    instruction: "다음 표를 보면서 대화를 듣고, ○○가 …을 고르시오.",
    format_guide:
      "Table with 5 rows (A–E) and 3~4 columns. Speakers apply constraints until one row remains. table_data required. question_text empty.",
    segment_guide:
      "M/W dialogue 8~12 turns. Total 100~150 words. Sequential filters (price, size, feature…). Final choice stated.",
    choice_guide:
      "table_data: { title, rows[5] with no/label/value summary, mismatch_no=correct row 1~5, mismatch_reason=why that row }. choices may be row labels A–E.",
    difficulty_tier: "standard",
  },
  {
    id: 11,
    question_type: "짧은 응답",
    instruction:
      "대화를 듣고, ○○의 마지막 말에 대한 ○○의 응답으로 가장 적절한 것을 고르시오.",
    format_guide:
      "Short dialogue ending BEFORE the responder's reply. English response choices. previous_turn + blank_speaker required.",
    segment_guide:
      "M/W short dialogue 4~7 turns. Total 70~110 words. Last segment = previous_turn speaker only. Do NOT include the reply in segments.",
    choice_guide:
      "5 English replies (8~16 words). One fits function+context. No bare Okay/Yes/Sure. question_text like \"Woman: _____\" or \"Man: _____\".",
    difficulty_tier: "applied",
  },
  {
    id: 12,
    question_type: "짧은 응답",
    instruction:
      "대화를 듣고, ○○의 마지막 말에 대한 ○○의 응답으로 가장 적절한 것을 고르시오.",
    format_guide:
      "Same as type 11 but opposite blank speaker (if 11 blanks W, 12 blanks M, or vice versa). English choices. Often 3 points.",
    segment_guide:
      "M/W short dialogue 4~7 turns. Total 70~110 words. Reply not in segments.",
    choice_guide:
      "5 English replies. previous_turn, blank_speaker, correct_response_function, distractor_reasons required.",
    difficulty_tier: "applied",
  },
  {
    id: 13,
    question_type: "긴 응답",
    instruction:
      "대화를 듣고, ○○의 마지막 말에 대한 ○○의 응답으로 가장 적절한 것을 고르시오.",
    format_guide:
      "Longer counseling/planning dialogue. Printed blank line (Man:/Woman:). English choices. Often 3 points.",
    segment_guide:
      "M/W dialogue 8~12 turns. Total 110~160 words. Rich context before last prompt turn. Reply not in segments.",
    choice_guide:
      "5 English replies with specific detail from context. question_text \"Man: _____\" or \"Woman: _____\".",
    difficulty_tier: "applied",
  },
  {
    id: 14,
    question_type: "긴 응답",
    instruction:
      "대화를 듣고, ○○의 마지막 말에 대한 ○○의 응답으로 가장 적절한 것을 고르시오.",
    format_guide:
      "Same slot as 13 with opposite blank speaker. English choices. Often 3 points.",
    segment_guide:
      "M/W dialogue 8~12 turns. Total 110~160 words. Reply not in segments.",
    choice_guide:
      "5 English contextual replies. previous_turn, blank_speaker, correct_response_function, distractor_reasons required.",
    difficulty_tier: "applied",
  },
  {
    id: 15,
    question_type: "상황 발화",
    instruction:
      "다음 상황 설명을 듣고, ○○가 ○○에게 할 말로 가장 적절한 것을 고르시오.",
    format_guide:
      "Third-person situation narration (English). Ask what A would say to B. English utterance choices. Printed \"Name: _____\".",
    segment_guide:
      "Monologue narrator (M or W or ANN). 5~8 sentences. Total 90~130 words. Ends with: In this situation, what would A most likely say to B?",
    choice_guide:
      "5 English utterances (request, thanks, suggestion, apology…). Only one matches the intended speech act.",
    difficulty_tier: "applied",
  },
  {
    id: 16,
    question_type: "주제",
    instruction: "○가 하는 말의 주제로 가장 적절한 것은?",
    format_guide:
      "[16~17] shared long monologue played TWICE. Type 16 = topic. English topic choices. Must share identical segments with type 17.",
    segment_guide:
      "Monologue (M or W). 6~9 sentences listing 3~5 items/tips. Total 110~160 words. Clear topic sentence + enumerated items.",
    choice_guide:
      "5 English topic phrases. Correct = overall topic; distractors = one detail or wrong focus.",
    difficulty_tier: "advanced",
  },
  {
    id: 17,
    question_type: "언급 여부",
    instruction: "언급된 ○○이/가 아닌 것은?",
    format_guide:
      "Same audio as type 16. Ask which listed item was NOT mentioned. MUST copy segments/script_text from type 16 exactly.",
    segment_guide:
      "Identical segments to type 16. Do not invent a new script.",
    choice_guide:
      "5 English nouns/items from the list category. Four appear in the script; one does not.",
    difficulty_tier: "advanced",
  },
];

export function getHigh1ExamTypeById(id: number): ExamTypeTemplate | undefined {
  return HIGH1_LISTENING_EXAM_TYPES.find((t) => t.id === id);
}
