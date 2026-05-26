import type { ExamTypeTemplate } from "@/lib/listening/exam-types";
import { QUALITY_PASS_THRESHOLD } from "@/lib/listening/prompts/qualityCheckPrompt";
import type { GeneratedListeningQuestion } from "@/lib/listening/types";
import { normalizeTableData } from "@/lib/listening/table-data";
import { checkChoicesSameCategory } from "@/lib/listening/type1-choice-category";
import {
  checkPurchaseChoicesSameProduct,
  hasVagueVisualConditions,
} from "@/lib/listening/type2-product-category";
import {
  checkWeatherChoicesValid,
  weatherAnswerMatchesChoice,
} from "@/lib/listening/type3-weather-choices";
import {
  checkIntentionChoicesValid,
  instructionMatchesLastSpeaker,
  intentionMatchesChoice,
  isVagueFinalUtterance,
} from "@/lib/listening/type4-intention-choices";
import {
  checkKoreanLabelChoices,
  correctAnswerMatchesUnmentioned,
  countMentionFlags,
  normalizeMentionPlan,
  validateMentionPlan,
} from "@/lib/listening/type5-mention-plan";
import {
  checkTimeChoicesValid,
  finalTimeMatchesChoice,
  instructionAlignsWithTarget,
  validateType6TimeFields,
} from "@/lib/listening/type6-time-choices";
import {
  checkKoreanJobChoices,
  dreamJobMatchesChoice,
  findDreamJobSpeaker,
  hasDreamJobInScript,
  instructionMatchesTargetPerson,
  speakerCodeFromTarget,
  validateType7CareerFields,
} from "@/lib/listening/type7-career-choices";
import {
  checkKoreanEmotionChoices,
  emotionMatchesChoice,
  instructionMatchesTargetPerson as instructionMatchesEmotionTarget,
  isVagueAnswerClue,
  validateType8EmotionFields,
} from "@/lib/listening/type8-emotion-choices";

export interface QualityIssue {
  code: string;
  message: string;
  weight?: number;
}

export interface QualityCheckResult {
  ok: boolean;
  issues: QualityIssue[];
  quality_score: number;
}

const FORBIDDEN_GRAMMAR =
  /\b(who|which|that)\s+(is|are|was|were|has|have)\b|having\s+\w+ed\b|would\s+have\b|if\s+i\s+were\b/i;

/** 담화형(단독 화자·안내) 유형 */
const MONOLOGUE_TYPE_IDS = new Set([1, 3, 5, 14]);

function wordCount(text: string): number {
  return text
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

function totalScriptWords(q: GeneratedListeningQuestion): number {
  return q.segments.reduce((sum, s) => sum + wordCount(s.text), 0);
}

function longSentenceCount(q: GeneratedListeningQuestion, maxWords = 13): number {
  return q.segments.filter((s) => wordCount(s.text) > maxWords).length;
}

function computeQualityScore(issues: QualityIssue[]): number {
  let score = 100;
  for (const issue of issues) {
    const w = issue.weight ?? defaultIssueWeight(issue.code);
    score -= w;
  }
  return Math.max(0, Math.min(100, score));
}

function defaultIssueWeight(code: string): number {
  if (code.startsWith("type") && code.includes("speaker")) return 20;
  if (code === "grammar" || code === "blank_in_segments") return 18;
  if (code === "word_count" || code === "turn_count" || code === "sentence_count") return 12;
  if (code === "long_sentences") return 8;
  return 10;
}

export function checkListeningQuestionQuality(
  q: GeneratedListeningQuestion,
  typeHint?: ExamTypeTemplate
): QualityCheckResult {
  const issues: QualityIssue[] = [];

  if (!q.instruction?.trim()) {
    issues.push({ code: "no_instruction", message: "지시문이 없습니다." });
  }
  if (!q.segments?.length) {
    issues.push({ code: "no_segments", message: "대본 segment가 없습니다." });
  }
  if (!q.script_text?.trim()) {
    issues.push({ code: "no_script", message: "script_text가 비어 있습니다." });
  }
  if (q.choices.length !== 5) {
    issues.push({
      code: "choices_count",
      message: `선택지가 5개가 아닙니다 (${q.choices.length}개).`,
    });
  }
  if (!Number.isInteger(q.correct_answer) || q.correct_answer < 1 || q.correct_answer > 5) {
    issues.push({ code: "correct_answer", message: "정답 번호가 1~5가 아닙니다." });
  }
  if (!q.answer_clue?.trim()) {
    issues.push({ code: "no_answer_clue", message: "정답 근거(answer_clue)가 없습니다." });
  }

  const typeId = typeHint?.id ?? q.order_index;
  const totalWords = totalScriptWords(q);
  const isMonologue = MONOLOGUE_TYPE_IDS.has(typeId);

  if (totalWords < 50 || totalWords > 95) {
    issues.push({
      code: "word_count",
      message: `대본 단어 수가 기준(55~90)을 벗어납니다 (${totalWords}단어).`,
    });
  }

  const turnCount = q.segments.length;
  if (isMonologue) {
    if (turnCount < 5 || turnCount > 7) {
      issues.push({
        code: "sentence_count",
        message: `담화형은 5~7문장이어야 합니다 (${turnCount}개).`,
      });
    }
  } else if (typeId !== 19 && typeId !== 20) {
    if (turnCount < 6 || turnCount > 8) {
      issues.push({
        code: "turn_count",
        message: `대화형은 6~8턴이어야 합니다 (${turnCount}턴).`,
      });
    }
  } else if (turnCount < 6 || turnCount > 8) {
    issues.push({
      code: "turn_count",
      message: `19~20번은 6~8턴이어야 합니다 (${turnCount}턴).`,
    });
  }

  const longCount = longSentenceCount(q, 13);
  if (longCount > 0) {
    issues.push({
      code: "long_sentences",
      message: `13단어를 넘는 문장이 ${longCount}개 있습니다 (문장당 6~13단어 권장).`,
    });
  }

  const shortCount = q.segments.filter((s) => wordCount(s.text) < 5).length;
  if (shortCount > Math.floor(q.segments.length / 2)) {
    issues.push({
      code: "short_sentences",
      message: "문장이 너무 짧습니다 (6~13단어 권장).",
    });
  }

  for (const seg of q.segments) {
    if (FORBIDDEN_GRAMMAR.test(seg.text)) {
      issues.push({
        code: "grammar",
        message: "중1 수준을 넘는 문법이 포함되어 있습니다.",
      });
      break;
    }
  }

  if (typeId === 1) {
    const last = q.segments[q.segments.length - 1]?.text ?? "";
    if (!/what am i\?/i.test(last)) {
      issues.push({
        code: "type1_ending",
        message: "1번 유형은 마지막 문장이 What am I? 여야 합니다.",
        weight: 22,
      });
    }
    if (turnCount < 5 || turnCount > 7) {
      issues.push({
        code: "type1_sentences",
        message: `1번 유형은 5~7문장이어야 합니다 (${turnCount}개).`,
      });
    }
    const speakers = new Set(q.segments.map((s) => s.speaker));
    if (speakers.has("ANN") || (speakers.has("M") && speakers.has("W"))) {
      issues.push({
        code: "type1_speaker",
        message: "1번 유형은 M 또는 W 한 명의 담화만 사용해야 합니다.",
      });
    }
    const catCheck = checkChoicesSameCategory(q.choices);
    if (!catCheck.ok) {
      issues.push({
        code: "type1_mixed_category",
        message: catCheck.message ?? "선택지 범주가 섞여 있습니다.",
        weight: 18,
      });
    }
    const prompts = q.choice_image_prompts ?? [];
    const filledPrompts = prompts.filter((p) => p.trim()).length;
    if (filledPrompts < 5) {
      issues.push({
        code: "type1_image_prompts",
        message: `그림 선택지 설명(choice_image_prompts)이 5개 필요합니다 (${filledPrompts}개).`,
      });
    }
    if (/i am (a|an) /i.test(q.script_text)) {
      issues.push({
        code: "type1_direct_answer",
        message: '대본에서 "I am a ..."처럼 정답을 직접 말하지 마세요.',
      });
    }
  }

  if (typeId === 3) {
    const speakers = new Set(q.segments.map((s) => s.speaker));
    if (speakers.has("ANN") || (speakers.has("M") && speakers.has("W"))) {
      issues.push({
        code: "type3_speaker",
        message: "3번 유형은 W 또는 M 한 명의 날씨 안내만 사용해야 합니다.",
      });
    }
    if (turnCount < 5 || turnCount > 7) {
      issues.push({
        code: "type3_sentences",
        message: `3번 유형은 5~7문장이어야 합니다 (${turnCount}개).`,
      });
    }
    if (!q.instruction?.trim() || q.instruction.includes("○○")) {
      issues.push({
        code: "type3_instruction",
        message: "3번 유형은 지역명이 포함된 지시문이 필요합니다.",
      });
    }
    if (!q.weather_target_location?.trim()) {
      issues.push({
        code: "type3_location",
        message: "weather_target_location(지역명)이 필요합니다.",
      });
    }
    if (!q.weather_target_time?.trim()) {
      issues.push({
        code: "type3_target_time",
        message: "weather_target_time(질문 시점)이 필요합니다.",
        weight: 20,
      });
    }
    if (!q.weather_answer?.trim()) {
      issues.push({
        code: "type3_weather_answer",
        message: "weather_answer가 필요합니다.",
      });
    }
    if (
      q.weather_answer &&
      !weatherAnswerMatchesChoice(q.weather_answer, q.choices, q.correct_answer)
    ) {
      issues.push({
        code: "type3_time_mismatch",
        message: "질문 시점(weather_answer)과 correct_answer 선택지가 일치하지 않습니다.",
        weight: 22,
      });
    }
    const weatherChoiceCheck = checkWeatherChoicesValid(q.choices);
    if (!weatherChoiceCheck.ok) {
      issues.push({
        code: "type3_choices",
        message: weatherChoiceCheck.message ?? "날씨 선택지 오류",
      });
    }
    if (!q.needs_image_choices) {
      issues.push({
        code: "type3_needs_image",
        message: "3번 유형은 needs_image_choices가 true여야 합니다.",
      });
    }
    if (q.visual_choice_type && q.visual_choice_type !== "weather_icon") {
      issues.push({
        code: "type3_visual_type",
        message: 'visual_choice_type은 "weather_icon"이어야 합니다.',
      });
    }
    const prompts = q.choice_image_prompts ?? [];
    if (prompts.filter((p) => p.trim()).length < 5) {
      issues.push({
        code: "type3_image_prompts",
        message: "choice_image_prompts 5개가 필요합니다.",
      });
    }
    if (/humidity|precipitation|atmospheric/i.test(q.script_text)) {
      issues.push({
        code: "type3_hard_terms",
        message: "중1 수준을 넘는 기상 용어가 포함되어 있습니다.",
      });
    }
  }

  if (typeId === 4) {
    const hasM = q.segments.some((s) => s.speaker === "M");
    const hasW = q.segments.some((s) => s.speaker === "W");
    if (!hasM || !hasW) {
      issues.push({
        code: "type4_dialogue",
        message: "4번 유형은 M과 W 대화가 필요합니다.",
      });
    }
    const spoken = q.segments.filter((s) => s.speaker === "M" || s.speaker === "W");
    const lastSeg = spoken[spoken.length - 1];
    const last_speaker =
      q.last_speaker === "M" || q.last_speaker === "W"
        ? q.last_speaker
        : lastSeg?.speaker === "M" || lastSeg?.speaker === "W"
          ? lastSeg.speaker
          : null;

    if (last_speaker && q.instruction?.trim()) {
      if (!instructionMatchesLastSpeaker(q.instruction, last_speaker)) {
        issues.push({
          code: "type4_speaker_mismatch",
          message: "지시문의 남자/여자와 마지막 발화자(last_speaker)가 일치하지 않습니다.",
          weight: 22,
        });
      }
    } else if (!last_speaker) {
      issues.push({
        code: "type4_last_speaker",
        message: "last_speaker(M/W)가 필요합니다.",
        weight: 18,
      });
    }

    const finalUtterance =
      q.final_utterance?.trim() || lastSeg?.text?.trim() || "";
    if (!finalUtterance) {
      issues.push({
        code: "type4_final_utterance",
        message: "final_utterance(마지막 발화)가 필요합니다.",
      });
    } else if (isVagueFinalUtterance(finalUtterance)) {
      issues.push({
        code: "type4_vague_intention",
        message:
          "마지막 발화가 너무 짧거나 모호합니다 (Okay, Sure, Thanks 등만 사용하지 마세요).",
        weight: 20,
      });
    }

    if (!q.target_intention?.trim()) {
      issues.push({
        code: "type4_target_intention",
        message: "target_intention(정답 의도)이 필요합니다.",
        weight: 18,
      });
    } else if (
      !intentionMatchesChoice(q.target_intention, q.choices, q.correct_answer)
    ) {
      issues.push({
        code: "type4_intention_mismatch",
        message: "target_intention과 correct_answer 선택지가 일치하지 않습니다.",
        weight: 20,
      });
    }

    const intentionCheck = checkIntentionChoicesValid(q.choices);
    if (!intentionCheck.ok) {
      issues.push({
        code: "type4_choices",
        message: intentionCheck.message ?? "의도 선택지 오류",
      });
    }

    if (q.needs_image_choices) {
      issues.push({
        code: "type4_needs_image",
        message: "4번 유형은 needs_image_choices가 false여야 합니다.",
      });
    }
    if (q.visual_choice_type && q.visual_choice_type !== "none") {
      issues.push({
        code: "type4_visual_type",
        message: 'visual_choice_type은 "none"이어야 합니다.',
      });
    }
    const prompts = q.choice_image_prompts ?? [];
    if (prompts.some((p) => p.trim())) {
      issues.push({
        code: "type4_image_prompts",
        message: "4번 유형은 choice_image_prompts를 비워 두어야 합니다.",
      });
    }
    if (q.question_text?.trim()) {
      issues.push({
        code: "type4_question_text",
        message: "4번 유형은 question_text를 비워 두어야 합니다.",
      });
    }
  }

  if (typeId === 5) {
    const speakers = new Set(
      q.segments.filter((s) => s.speaker === "M" || s.speaker === "W").map((s) => s.speaker)
    );
    if (speakers.size !== 1) {
      issues.push({
        code: "type5_speaker",
        message: "5번 유형은 M 또는 W 한 명의 담화만 사용해야 합니다.",
        weight: 20,
      });
    }
    if (turnCount < 5 || turnCount > 7) {
      issues.push({
        code: "type5_sentences",
        message: `5번 유형은 5~7문장이어야 합니다 (${turnCount}개).`,
      });
    }

    const koreanCheck = checkKoreanLabelChoices(q.choices);
    if (!koreanCheck.ok) {
      issues.push({
        code: "type5_choice_format",
        message: koreanCheck.message ?? "보기 형식 오류",
        weight: 22,
      });
    }

    const plan = normalizeMentionPlan(q.mention_plan);
    if (!plan) {
      issues.push({
        code: "type5_mention_plan",
        message: "mention_plan이 필요합니다.",
        weight: 20,
      });
    } else {
      const { mentioned, unmentioned } = countMentionFlags(plan);
      if (mentioned !== 4 || unmentioned !== 1) {
        issues.push({
          code: "type5_multiple_unmentioned",
          message: `언급 ${mentioned}개·미언급 ${unmentioned}개 (4/1이어야 함).`,
          weight: 24,
        });
      }
      if (!correctAnswerMatchesUnmentioned(q.correct_answer, plan)) {
        issues.push({
          code: "type5_answer_mismatch",
          message: "correct_answer와 unmentioned_no가 일치하지 않습니다.",
          weight: 24,
        });
      }
      const planCheck = validateMentionPlan(
        plan,
        q.choices,
        q.correct_answer,
        q.script_text
      );
      for (const msg of planCheck.issues) {
        issues.push({
          code: "type5_mention_check",
          message: msg,
          weight: 14,
        });
      }
    }

    if (q.needs_image_choices) {
      issues.push({
        code: "type5_needs_image",
        message: "5번 유형은 needs_image_choices가 false여야 합니다.",
      });
    }
    if (q.visual_choice_type && q.visual_choice_type !== "none") {
      issues.push({
        code: "type5_visual_type",
        message: 'visual_choice_type은 "none"이어야 합니다.',
      });
    }
    const prompts = q.choice_image_prompts ?? [];
    if (prompts.some((p) => p.trim())) {
      issues.push({
        code: "type5_image_prompts",
        message: "5번 유형은 choice_image_prompts를 비워 두어야 합니다.",
      });
    }
    if (q.question_text?.trim()) {
      issues.push({
        code: "type5_question_text",
        message: "5번 유형은 question_text를 비워 두어야 합니다.",
      });
    }
  }

  if (typeId === 6) {
    const hasM = q.segments.some((s) => s.speaker === "M");
    const hasW = q.segments.some((s) => s.speaker === "W");
    if (!hasM || !hasW) {
      issues.push({
        code: "type6_dialogue",
        message: "6번 유형은 M과 W 대화가 필요합니다.",
      });
    }
    if (turnCount < 6 || turnCount > 8) {
      issues.push({
        code: "type6_turns",
        message: `6번 유형은 6~8턴이어야 합니다 (${turnCount}턴).`,
      });
    }

    const timeChoiceCheck = checkTimeChoicesValid(q.choices);
    if (!timeChoiceCheck.ok) {
      issues.push({
        code: "type6_choice_format",
        message: timeChoiceCheck.message ?? "보기 형식 오류",
        weight: 22,
      });
    }

    if (q.time_question_target?.trim() && q.instruction?.trim()) {
      if (!instructionAlignsWithTarget(q.instruction, q.time_question_target)) {
        issues.push({
          code: "type6_time_target_mismatch",
          message: "지시문과 time_question_target(시각 대상)이 일치하지 않습니다.",
          weight: 24,
        });
      }
    }

    if (!q.final_time?.trim()) {
      issues.push({
        code: "type6_final_time_unclear",
        message: "final_time(최종 정답 시각)이 필요합니다.",
        weight: 22,
      });
    } else if (
      !finalTimeMatchesChoice(q.final_time, q.choices, q.correct_answer)
    ) {
      issues.push({
        code: "type6_final_time_mismatch",
        message: "final_time과 correct_answer 선택지가 일치하지 않습니다.",
        weight: 22,
      });
    }

    const timeFieldCheck = validateType6TimeFields({
      instruction: q.instruction,
      choices: q.choices,
      correct_answer: q.correct_answer,
      script_text: q.script_text,
      answer_clue: q.answer_clue ?? "",
      time_question_target: q.time_question_target,
      final_time: q.final_time,
      mentioned_times: q.mentioned_times,
    });
    for (const msg of timeFieldCheck.issues) {
      if (msg.includes("지시문과 time_question_target")) continue;
      if (msg.includes("final_time과 correct_answer")) continue;
      issues.push({
        code: "type6_time_check",
        message: msg,
        weight: 14,
      });
    }

    if (q.needs_image_choices) {
      issues.push({
        code: "type6_needs_image",
        message: "6번 유형은 needs_image_choices가 false여야 합니다.",
      });
    }
    if (q.visual_choice_type && q.visual_choice_type !== "none") {
      issues.push({
        code: "type6_visual_type",
        message: 'visual_choice_type은 "none"이어야 합니다.',
      });
    }
    const prompts = q.choice_image_prompts ?? [];
    if (prompts.some((p) => p.trim())) {
      issues.push({
        code: "type6_image_prompts",
        message: "6번 유형은 choice_image_prompts를 비워 두어야 합니다.",
      });
    }
    if (q.question_text?.trim()) {
      issues.push({
        code: "type6_question_text",
        message: "6번 유형은 question_text를 비워 두어야 합니다.",
      });
    }
  }

  if (typeId === 7) {
    const hasM = q.segments.some((s) => s.speaker === "M");
    const hasW = q.segments.some((s) => s.speaker === "W");
    if (!hasM || !hasW) {
      issues.push({
        code: "type7_dialogue",
        message: "7번 유형은 M과 W 대화가 필요합니다.",
      });
    }
    if (turnCount < 6 || turnCount > 8) {
      issues.push({
        code: "type7_turns",
        message: `7번 유형은 6~8턴이어야 합니다 (${turnCount}턴).`,
      });
    }

    const jobCheck = checkKoreanJobChoices(q.choices);
    if (!jobCheck.ok) {
      issues.push({
        code: "type7_choice_format",
        message: jobCheck.message ?? "보기 형식 오류",
        weight: 22,
      });
    }

    if (q.target_person?.trim() && q.instruction?.trim()) {
      if (!instructionMatchesTargetPerson(q.instruction, q.target_person)) {
        issues.push({
          code: "type7_target_person_mismatch",
          message: "지시문과 target_person(대상)이 일치하지 않습니다.",
          weight: 24,
        });
      }
      const expected = speakerCodeFromTarget(q.target_person);
      const dreamSpeaker = findDreamJobSpeaker(q.segments);
      if (expected && dreamSpeaker && expected !== dreamSpeaker) {
        issues.push({
          code: "type7_target_person_mismatch",
          message: "장래 희망을 말한 화자와 target_person이 일치하지 않습니다.",
          weight: 24,
        });
      }
    }

    if (!hasDreamJobInScript(q.script_text)) {
      issues.push({
        code: "type7_dream_job_unclear",
        message: '대본에 "I want to be a/an ..." 장래 희망이 필요합니다.',
        weight: 22,
      });
    }

    if (!q.dream_job?.trim()) {
      issues.push({
        code: "type7_dream_job_unclear",
        message: "dream_job(정답 직업)이 필요합니다.",
        weight: 20,
      });
    } else if (!dreamJobMatchesChoice(q.dream_job, q.choices, q.correct_answer)) {
      issues.push({
        code: "type7_dream_job_mismatch",
        message: "dream_job과 correct_answer 선택지가 일치하지 않습니다.",
        weight: 22,
      });
    }

    const careerCheck = validateType7CareerFields({
      instruction: q.instruction,
      choices: q.choices,
      correct_answer: q.correct_answer,
      script_text: q.script_text,
      answer_clue: q.answer_clue ?? "",
      target_person: q.target_person,
      dream_job: q.dream_job,
      interest_clues: q.interest_clues,
      segments: q.segments,
    });
    for (const msg of careerCheck.issues) {
      if (msg.includes("지시문과 target_person")) continue;
      if (msg.includes("장래 희망을 말한 화자")) continue;
      if (msg.includes("I want to be")) continue;
      if (msg.includes("dream_job과 correct_answer")) continue;
      issues.push({
        code: "type7_career_check",
        message: msg,
        weight: 14,
      });
    }

    if (q.needs_image_choices) {
      issues.push({
        code: "type7_needs_image",
        message: "7번 유형은 needs_image_choices가 false여야 합니다.",
      });
    }
    if (q.visual_choice_type && q.visual_choice_type !== "none") {
      issues.push({
        code: "type7_visual_type",
        message: 'visual_choice_type은 "none"이어야 합니다.',
      });
    }
    const prompts = q.choice_image_prompts ?? [];
    if (prompts.some((p) => p.trim())) {
      issues.push({
        code: "type7_image_prompts",
        message: "7번 유형은 choice_image_prompts를 비워 두어야 합니다.",
      });
    }
    if (q.question_text?.trim()) {
      issues.push({
        code: "type7_question_text",
        message: "7번 유형은 question_text를 비워 두어야 합니다.",
      });
    }
  }

  if (typeId === 8) {
    const hasM = q.segments.some((s) => s.speaker === "M");
    const hasW = q.segments.some((s) => s.speaker === "W");
    if (!hasM || !hasW) {
      issues.push({
        code: "type8_dialogue",
        message: "8번 유형은 M과 W 대화가 필요합니다.",
      });
    }
    if (turnCount < 6 || turnCount > 8) {
      issues.push({
        code: "type8_turns",
        message: `8번 유형은 6~8턴이어야 합니다 (${turnCount}턴).`,
      });
    }

    const emotionCheck = checkKoreanEmotionChoices(q.choices);
    if (!emotionCheck.ok) {
      issues.push({
        code: "type8_choice_format",
        message: emotionCheck.message ?? "보기 형식 오류",
        weight: 22,
      });
    }

    if (q.target_person?.trim() && q.instruction?.trim()) {
      if (!instructionMatchesEmotionTarget(q.instruction, q.target_person)) {
        issues.push({
          code: "type8_target_person_mismatch",
          message: "지시문과 target_person(대상)이 일치하지 않습니다.",
          weight: 24,
        });
      }
    }

    if (!q.target_emotion?.trim()) {
      issues.push({
        code: "type8_emotion_unclear",
        message: "target_emotion(정답 감정)이 필요합니다.",
        weight: 22,
      });
    } else if (
      !emotionMatchesChoice(q.target_emotion, q.choices, q.correct_answer)
    ) {
      issues.push({
        code: "type8_emotion_mismatch",
        message: "target_emotion과 correct_answer 선택지가 일치하지 않습니다.",
        weight: 22,
      });
    }

    if (q.answer_clue?.trim() && isVagueAnswerClue(q.answer_clue)) {
      issues.push({
        code: "type8_weak_clue",
        message: "answer_clue가 감정 판단 근거로 충분하지 않습니다.",
        weight: 20,
      });
    } else if (!q.answer_clue?.trim()) {
      issues.push({
        code: "type8_weak_clue",
        message: "answer_clue(감정 근거)가 필요합니다.",
        weight: 18,
      });
    }

    const emotionFieldCheck = validateType8EmotionFields({
      instruction: q.instruction,
      choices: q.choices,
      correct_answer: q.correct_answer,
      answer_clue: q.answer_clue ?? "",
      target_person: q.target_person,
      target_emotion: q.target_emotion,
      emotion_clues: q.emotion_clues,
      segments: q.segments,
    });
    for (const msg of emotionFieldCheck.issues) {
      if (msg.includes("지시문과 target_person")) continue;
      if (msg.includes("target_emotion과 correct_answer")) continue;
      if (msg.includes("answer_clue")) continue;
      issues.push({
        code: "type8_emotion_check",
        message: msg,
        weight: 14,
      });
    }

    if (q.needs_image_choices) {
      issues.push({
        code: "type8_needs_image",
        message: "8번 유형은 needs_image_choices가 false여야 합니다.",
      });
    }
    if (q.visual_choice_type && q.visual_choice_type !== "none") {
      issues.push({
        code: "type8_visual_type",
        message: 'visual_choice_type은 "none"이어야 합니다.',
      });
    }
    const prompts = q.choice_image_prompts ?? [];
    if (prompts.some((p) => p.trim())) {
      issues.push({
        code: "type8_image_prompts",
        message: "8번 유형은 choice_image_prompts를 비워 두어야 합니다.",
      });
    }
    if (q.question_text?.trim()) {
      issues.push({
        code: "type8_question_text",
        message: "8번 유형은 question_text를 비워 두어야 합니다.",
      });
    }
  }

  if (typeId === 2) {
    const hasM = q.segments.some((s) => s.speaker === "M");
    const hasW = q.segments.some((s) => s.speaker === "W");
    if (!hasM || !hasW) {
      issues.push({
        code: "type2_dialogue",
        message: "2번 유형은 M과 W 대화가 필요합니다.",
      });
    }
    if (turnCount < 6 || turnCount > 8) {
      issues.push({
        code: "type2_turns",
        message: `2번 유형은 6~8턴이어야 합니다 (${turnCount}턴).`,
      });
    }
    const scriptJoined = q.segments.map((s) => s.text).join(" ");
    if (!/I'?ll\s+(?:take|have|buy)/i.test(scriptJoined)) {
      issues.push({
        code: "type2_final_choice",
        message: "2번 유형은 I'll take/have/buy 형태의 최종 선택 문장이 필요합니다.",
        weight: 20,
      });
    }
    if (!q.needs_image_choices) {
      issues.push({
        code: "type2_needs_image",
        message: "2번 유형은 needs_image_choices가 true여야 합니다.",
        weight: 22,
      });
    }
    if (q.visual_choice_type && q.visual_choice_type !== "image") {
      issues.push({
        code: "type2_visual_type",
        message: 'visual_choice_type은 "image"여야 합니다.',
      });
    }
    const prompts = q.choice_image_prompts ?? [];
    if (prompts.filter((p) => p.trim()).length < 5) {
      issues.push({
        code: "type2_image_prompts",
        message: "choice_image_prompts 5개가 필요합니다.",
      });
    }
    const productCheck = checkPurchaseChoicesSameProduct(q.choices);
    if (!productCheck.ok) {
      issues.push({
        code: "type2_mixed_product",
        message: productCheck.message ?? "선택지 물건 범주 불일치",
        weight: 18,
      });
    }
    if (hasVagueVisualConditions(q.choices)) {
      issues.push({
        code: "type2_vague_visual",
        message: "그림으로 구분하기 어려운 조건(가격·인기 등)이 포함되어 있습니다.",
      });
    }
    const finalSentence = q.selected_conditions?.final_choice_sentence?.trim();
    if (finalSentence && !scriptJoined.includes(finalSentence.slice(0, 20))) {
      const clue = q.answer_clue?.trim();
      if (!clue || !/I'?ll\s+(?:take|have|buy)/i.test(clue)) {
        issues.push({
          code: "type2_answer_clue",
          message: "answer_clue에 최종 선택 문장이 포함되어야 합니다.",
        });
      }
    }
  }

  if (typeId === 19 || typeId === 20) {
    const lastSpeaker = q.segments[q.segments.length - 1]?.speaker;
    if (typeId === 19 && lastSpeaker !== "W") {
      issues.push({ code: "type19_speaker", message: "19번은 여자 마지막 말로 끝나야 합니다." });
    }
    if (typeId === 20 && lastSpeaker !== "M") {
      issues.push({ code: "type20_speaker", message: "20번은 남자 마지막 말로 끝나야 합니다." });
    }
    if (!q.question_text?.includes("______")) {
      issues.push({
        code: "blank_format",
        message: "19~20번은 question_text에 Man:/Woman: ________ 형식이 필요합니다.",
      });
    }
    const koreanChoices = q.choices.filter((c) => /[가-힣]/.test(c)).length;
    if (koreanChoices > 0) {
      issues.push({
        code: "continuation_english",
        message: "19~20번 선택지는 영어 문장이어야 합니다.",
      });
    }
    if (!q.previous_turn?.trim()) {
      issues.push({
        code: "no_previous_turn",
        message: "19~20번은 previous_turn(직전 발화)가 필요합니다.",
      });
    }
    if (!q.correct_response_function?.trim()) {
      issues.push({
        code: "no_response_function",
        message: "19~20번은 correct_response_function이 필요합니다.",
      });
    }
    const dr = q.distractor_reason ?? [];
    if (dr.length < 5) {
      issues.push({
        code: "distractor_reason",
        message: "19~20번은 distractor_reason 5개가 필요합니다.",
      });
    }
    for (const seg of q.segments) {
      if (/_{2,}|^\s*$/.test(seg.text.trim())) {
        issues.push({
          code: "blank_in_segments",
          message: "빈칸(____)은 segment에 넣지 말고 question_text에만 표시하세요.",
        });
        break;
      }
    }
  }

  if (typeId === 14) {
    const table = q.table_data ?? normalizeTableData(
      (q as { table_data?: unknown }).table_data
    );
    if (!table) {
      issues.push({
        code: "type14_no_table",
        message: "14번 유형은 table_data가 필요합니다.",
        weight: 25,
      });
    } else {
      if (table.rows.length !== 5) {
        issues.push({
          code: "type14_row_count",
          message: `표 행은 5개여야 합니다 (${table.rows.length}개).`,
        });
      }
      if (table.mismatch_no < 1 || table.mismatch_no > 5) {
        issues.push({ code: "type14_mismatch_no", message: "mismatch_no는 1~5여야 합니다." });
      }
      if (q.correct_answer !== table.mismatch_no) {
        issues.push({
          code: "type14_answer_mismatch",
          message: "correct_answer와 mismatch_no가 일치해야 합니다.",
          weight: 20,
        });
      }
      if (!table.mismatch_reason?.trim()) {
        issues.push({
          code: "type14_mismatch_reason",
          message: "mismatch_reason이 필요합니다.",
        });
      }
      if (!q.answer_clue?.trim()) {
        issues.push({
          code: "type14_answer_clue",
          message: "14번은 answer_clue에 불일치 근거가 필요합니다.",
        });
      }
    }
  }

  const quality_score = computeQualityScore(issues);
  const ok = issues.length === 0 && quality_score >= QUALITY_PASS_THRESHOLD;

  return { ok, issues, quality_score };
}

export function attachQualityToQuestions(
  questions: GeneratedListeningQuestion[],
  types?: ExamTypeTemplate[]
): Array<
  GeneratedListeningQuestion & {
    needs_review: boolean;
    quality_issues: QualityIssue[];
    quality_score: number;
  }
> {
  return questions.map((q, i) => {
    const result = checkListeningQuestionQuality(q, types?.[i]);
    const needs_review = result.quality_score < QUALITY_PASS_THRESHOLD || result.issues.length > 0;
    return {
      ...q,
      needs_review,
      quality_issues: result.issues,
      quality_score: result.quality_score,
    };
  });
}
