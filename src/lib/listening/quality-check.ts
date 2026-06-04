import type { ExamTypeTemplate } from "@/lib/listening/exam-types";
import type { ListeningGradeLevel } from "@/lib/listening/grade-level";
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
  isMostlyEnglish,
  isMostlyKorean,
} from "@/lib/listening/fix-script-language";
import {
  checkKoreanEmotionChoices,
  emotionMatchesChoice,
  instructionMatchesTargetPerson as instructionMatchesEmotionTarget,
  isVagueAnswerClue,
  validateType8EmotionFields,
} from "@/lib/listening/type8-emotion-choices";
import {
  actionMatchesChoice,
  answerClueHasImmediateAction,
  checkKoreanActionChoices,
  instructionMatchesTargetPerson as instructionMatchesActionTarget,
  validateType9ActionFields,
} from "@/lib/listening/type9-action-choices";
import {
  checkKoreanContentChoices,
  isMainContentTooBroad,
  mainContentMatchesChoice,
  validateType10ContentFields,
} from "@/lib/listening/type10-content-choices";
import { TYPE10_QUESTION_TYPE } from "@/lib/listening/prompts/type10MainContentPrompt";
import {
  answerClueHasFinalTransportDecision,
  checkKoreanTransportChoices,
  transportMatchesChoice,
  validateType11TransportFields,
} from "@/lib/listening/type11-transport-choices";
import { TYPE11_QUESTION_TYPE } from "@/lib/listening/prompts/type11TransportPrompt";
import {
  checkKoreanReasonChoices,
  findReasonSpeaker,
  instructionContainsTargetPlace,
  instructionMatchesTargetPerson as instructionMatchesReasonTarget,
  isVagueReasonClue,
  reasonMatchesChoice,
  validateType12ReasonFields,
} from "@/lib/listening/type12-reason-choices";
import { TYPE12_QUESTION_TYPE } from "@/lib/listening/prompts/type12ReasonPrompt";
import {
  answerClueHasPlaceHints,
  checkKoreanPlaceChoices,
  placeMatchesChoice,
  scriptDirectlyNamesPlace,
  validateType13PlaceFields,
} from "@/lib/listening/type13-place-choices";
import { TYPE13_QUESTION_TYPE } from "@/lib/listening/prompts/type13PlacePrompt";
import {
  choicesAlignWithTable,
  validateType14TableFields,
} from "@/lib/listening/type14-table-validation";
import { TYPE14_QUESTION_TYPE } from "@/lib/listening/prompts/type14TablePrompt";
import {
  answerClueHasRequest,
  findRequestSpeaker,
  instructionMatchesRequestedPerson,
  instructionMatchesRequester,
  scriptCenteredOnSuggestion,
  scriptHasRequestExpression,
  validateType15RequestFields,
} from "@/lib/listening/type15-request-choices";
import { TYPE15_QUESTION_TYPE } from "@/lib/listening/prompts/type15RequestPrompt";
import {
  answerClueHasSuggestion,
  findSuggestionSpeaker,
  instructionMatchesSuggestedTo,
  instructionMatchesSuggester,
  scriptCenteredOnRequest,
  scriptHasSuggestionExpression,
  validateType16SuggestionFields,
} from "@/lib/listening/type16-suggestion-choices";
import { TYPE16_QUESTION_TYPE } from "@/lib/listening/prompts/type16SuggestionPrompt";
import {
  answerClueHasPlannedAction,
  answerClueLooksLikeCanceledPlan,
  findPlannedActionSpeaker,
  instructionContainsTargetTime,
  validateType17ScheduleFields,
} from "@/lib/listening/type17-schedule-choices";
import { TYPE17_QUESTION_TYPE } from "@/lib/listening/prompts/type17SchedulePrompt";
import {
  answerClueHasJobInference,
  countJobCluesForSpeaker,
  scriptDirectlyNamesJob,
  scriptHasDreamJobAspiration,
  targetJobMatchesChoice,
  validateType18JobFields,
} from "@/lib/listening/type18-job-choices";
import { TYPE18_QUESTION_TYPE } from "@/lib/listening/prompts/type18JobPrompt";
import {
  checkEnglishResponseChoices,
  instructionMatchesBlankSpeaker,
  isTooGenericResponse,
  parseBlankSpeaker,
  previousTurnMatchesLastSegment,
  questionTextMatchesBlankSpeaker,
  validateType19ResponseFields,
} from "@/lib/listening/type19-response-choices";
import { TYPE19_QUESTION_TYPE } from "@/lib/listening/prompts/type19ResponsePrompt";
import {
  validateType20ResponseFields,
  looksLikeType19Situation,
  scriptLooksLikeLostItemDialogue,
} from "@/lib/listening/type20-response-choices";
import { TYPE20_QUESTION_TYPE } from "@/lib/listening/prompts/type20ResponsePrompt";

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
  if (code.endsWith("_dialogue")) return 28;
  if (code.startsWith("type") && code.includes("speaker")) return 20;
  if (code === "grammar" || code === "blank_in_segments") return 18;
  if (code === "word_count" || code === "turn_count" || code === "sentence_count") return 12;
  if (code === "long_sentences") return 8;
  return 10;
}

export function checkListeningQuestionQuality(
  q: GeneratedListeningQuestion,
  typeHint?: ExamTypeTemplate,
  gradeLevel: ListeningGradeLevel = "middle1"
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
  const isMonologue = MONOLOGUE_TYPE_IDS.has(typeId);
  const skipWordCountRules = gradeLevel === "middle1";

  if (!skipWordCountRules) {
    const totalWords = totalScriptWords(q);
    if (totalWords < 50 || totalWords > 95) {
      issues.push({
        code: "word_count",
        message: `대본 단어 수가 기준(55~90)을 벗어납니다 (${totalWords}단어).`,
      });
    }
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

  if (!skipWordCountRules) {
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
    const segText = q.segments.map((s) => s.text).join(" ");
    if (isMostlyKorean(segText) && isMostlyEnglish(q.script_translation ?? "")) {
      issues.push({
        code: "type3_script_language_swap",
        message:
          "대본(segments)은 영어, 해석(script_translation)은 한국어여야 합니다. (뒤바뀜)",
        weight: 24,
      });
    }

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

  if (typeId === 9) {
    const hasM = q.segments.some((s) => s.speaker === "M");
    const hasW = q.segments.some((s) => s.speaker === "W");
    if (!hasM || !hasW) {
      issues.push({
        code: "type9_dialogue",
        message: "9번 유형은 M과 W 대화가 필요합니다.",
      });
    }
    if (turnCount < 6 || turnCount > 8) {
      issues.push({
        code: "type9_turns",
        message: `9번 유형은 6~8턴이어야 합니다 (${turnCount}턴).`,
      });
    }

    const actionCheck = checkKoreanActionChoices(q.choices);
    if (!actionCheck.ok) {
      issues.push({
        code: "type9_choice_format",
        message: actionCheck.message ?? "보기 형식 오류",
        weight: 22,
      });
    }

    if (q.target_person?.trim() && q.instruction?.trim()) {
      if (!instructionMatchesActionTarget(q.instruction, q.target_person)) {
        issues.push({
          code: "type9_target_person_mismatch",
          message: "지시문과 target_person(대상)이 일치하지 않습니다.",
          weight: 24,
        });
      }
    }

    if (!q.immediate_action?.trim()) {
      issues.push({
        code: "type9_immediate_action_unclear",
        message: "immediate_action(대화 직후 행동)이 필요합니다.",
        weight: 22,
      });
    } else if (
      !actionMatchesChoice(q.immediate_action, q.choices, q.correct_answer)
    ) {
      issues.push({
        code: "type9_action_mismatch",
        message: "immediate_action과 correct_answer 선택지가 일치하지 않습니다.",
        weight: 22,
      });
    }

    if (q.answer_clue?.trim() && !answerClueHasImmediateAction(q.answer_clue)) {
      issues.push({
        code: "type9_immediate_action_unclear",
        message:
          "answer_clue에 I'll ... now/right now/right away 즉시 행동 근거가 필요합니다.",
        weight: 20,
      });
    } else if (!q.answer_clue?.trim()) {
      issues.push({
        code: "type9_immediate_action_unclear",
        message: "answer_clue(즉시 행동 근거)가 필요합니다.",
        weight: 18,
      });
    }

    const actionFieldCheck = validateType9ActionFields({
      instruction: q.instruction,
      choices: q.choices,
      correct_answer: q.correct_answer,
      answer_clue: q.answer_clue ?? "",
      target_person: q.target_person,
      immediate_action: q.immediate_action,
      mentioned_actions: q.mentioned_actions,
      segments: q.segments,
    });
    for (const msg of actionFieldCheck.issues) {
      if (msg.includes("지시문과 target_person")) continue;
      if (msg.includes("immediate_action과 correct_answer")) continue;
      if (msg.includes("answer_clue")) continue;
      issues.push({
        code: "type9_action_check",
        message: msg,
        weight: 14,
      });
    }

    if (q.needs_image_choices) {
      issues.push({
        code: "type9_needs_image",
        message: "9번 유형은 needs_image_choices가 false여야 합니다.",
      });
    }
    if (q.visual_choice_type && q.visual_choice_type !== "none") {
      issues.push({
        code: "type9_visual_type",
        message: 'visual_choice_type은 "none"이어야 합니다.',
      });
    }
    const prompts = q.choice_image_prompts ?? [];
    if (prompts.some((p) => p.trim())) {
      issues.push({
        code: "type9_image_prompts",
        message: "9번 유형은 choice_image_prompts를 비워 두어야 합니다.",
      });
    }
    if (q.question_text?.trim()) {
      issues.push({
        code: "type9_question_text",
        message: "9번 유형은 question_text를 비워 두어야 합니다.",
      });
    }
  }

  if (typeId === 10) {
    const hasM = q.segments.some((s) => s.speaker === "M");
    const hasW = q.segments.some((s) => s.speaker === "W");
    if (!hasM || !hasW) {
      issues.push({
        code: "type10_dialogue",
        message: "10번 유형은 M과 W 대화가 필요합니다.",
      });
    }
    if (turnCount < 6 || turnCount > 8) {
      issues.push({
        code: "type10_turns",
        message: `10번 유형은 6~8턴이어야 합니다 (${turnCount}턴).`,
      });
    }

    if (q.question_type !== TYPE10_QUESTION_TYPE) {
      issues.push({
        code: "type10_question_type",
        message: `question_type은 "${TYPE10_QUESTION_TYPE}"이어야 합니다.`,
        weight: 12,
      });
    }

    const contentCheck = checkKoreanContentChoices(q.choices);
    if (!contentCheck.ok) {
      issues.push({
        code: "type10_choice_format",
        message: contentCheck.message ?? "보기 형식 오류",
        weight: 22,
      });
    }

    if (!q.main_content?.trim()) {
      issues.push({
        code: "type10_main_content_inaccurate",
        message: "main_content(핵심 내용)이 필요합니다.",
        weight: 22,
      });
    } else {
      if (isMainContentTooBroad(q.main_content)) {
        issues.push({
          code: "type10_main_content_inaccurate",
          message: "main_content가 너무 넓거나 추상적입니다.",
          weight: 22,
        });
      }
      if (
        !mainContentMatchesChoice(
          q.main_content,
          q.choices,
          q.correct_answer
        )
      ) {
        issues.push({
          code: "type10_main_content_inaccurate",
          message: "main_content와 correct_answer 선택지가 일치하지 않습니다.",
          weight: 22,
        });
      }
    }

    if (!q.answer_clue?.trim()) {
      issues.push({
        code: "type10_topic_consistent",
        message: "answer_clue(핵심 내용 근거)가 필요합니다.",
        weight: 18,
      });
    } else if (isVagueAnswerClue(q.answer_clue)) {
      issues.push({
        code: "type10_topic_consistent",
        message:
          "answer_clue가 대화 핵심 내용을 직접 보여주는 문장이어야 합니다.",
        weight: 20,
      });
    }

    const contentFieldCheck = validateType10ContentFields({
      instruction: q.instruction,
      choices: q.choices,
      correct_answer: q.correct_answer,
      answer_clue: q.answer_clue ?? "",
      main_content: q.main_content,
      content_clues: q.content_clues,
      topic_distractor_reasons: q.topic_distractor_reasons,
    });
    for (const msg of contentFieldCheck.issues) {
      if (msg.includes("main_content와 correct_answer")) continue;
      if (msg.includes("answer_clue")) continue;
      issues.push({
        code: "type10_content_check",
        message: msg,
        weight: 14,
      });
    }

    if (q.needs_image_choices) {
      issues.push({
        code: "type10_needs_image",
        message: "10번 유형은 needs_image_choices가 false여야 합니다.",
      });
    }
    if (q.visual_choice_type && q.visual_choice_type !== "none") {
      issues.push({
        code: "type10_visual_type",
        message: 'visual_choice_type은 "none"이어야 합니다.',
      });
    }
    const prompts = q.choice_image_prompts ?? [];
    if (prompts.some((p) => p.trim())) {
      issues.push({
        code: "type10_image_prompts",
        message: "10번 유형은 choice_image_prompts를 비워 두어야 합니다.",
      });
    }
    if (q.question_text?.trim()) {
      issues.push({
        code: "type10_question_text",
        message: "10번 유형은 question_text를 비워 두어야 합니다.",
      });
    }
  }

  if (typeId === 11) {
    const hasM = q.segments.some((s) => s.speaker === "M");
    const hasW = q.segments.some((s) => s.speaker === "W");
    if (!hasM || !hasW) {
      issues.push({
        code: "type11_dialogue",
        message: "11번 유형은 M과 W 대화가 필요합니다.",
      });
    }
    if (turnCount < 6 || turnCount > 8) {
      issues.push({
        code: "type11_turns",
        message: `11번 유형은 6~8턴이어야 합니다 (${turnCount}턴).`,
      });
    }

    if (q.question_type !== TYPE11_QUESTION_TYPE) {
      issues.push({
        code: "type11_question_type",
        message: `question_type은 "${TYPE11_QUESTION_TYPE}"이어야 합니다.`,
        weight: 12,
      });
    }

    const transportCheck = checkKoreanTransportChoices(q.choices);
    if (!transportCheck.ok) {
      issues.push({
        code: "type11_choice_format",
        message: transportCheck.message ?? "보기 형식 오류",
        weight: 22,
      });
    }

    if (!q.final_transport?.trim()) {
      issues.push({
        code: "type11_final_transport_unclear",
        message: "final_transport(최종 이동 수단)이 필요합니다.",
        weight: 22,
      });
    } else if (
      !transportMatchesChoice(
        q.final_transport,
        q.choices,
        q.correct_answer
      )
    ) {
      issues.push({
        code: "type11_final_transport_unclear",
        message: "final_transport와 correct_answer 선택지가 일치하지 않습니다.",
        weight: 22,
      });
    }

    if (!q.destination?.trim()) {
      issues.push({
        code: "type11_destination_unclear",
        message: "destination(목적지)이 필요합니다.",
        weight: 16,
      });
    }

    const scriptJoined = q.segments.map((s) => s.text).join(" ");
    if (
      scriptJoined &&
      !/\blet'?s\s+(?:take|walk|go)|then let'?s walk|yes\.?\s*let'?s/i.test(
        scriptJoined
      )
    ) {
      issues.push({
        code: "type11_final_transport_unclear",
        message:
          "대화 마지막에 Let's take / Let's walk 형태의 최종 결정 문장이 필요합니다.",
        weight: 20,
      });
    }

    if (q.answer_clue?.trim()) {
      if (!answerClueHasFinalTransportDecision(q.answer_clue)) {
        issues.push({
          code: "type11_transport_confusion",
          message:
            "answer_clue는 제안이 아니라 최종 결정 문장(Let's take ...)이어야 합니다.",
          weight: 20,
        });
      }
    } else {
      issues.push({
        code: "type11_final_transport_unclear",
        message: "answer_clue(최종 이동 결정 근거)가 필요합니다.",
        weight: 18,
      });
    }

    const transportFieldCheck = validateType11TransportFields({
      instruction: q.instruction,
      choices: q.choices,
      correct_answer: q.correct_answer,
      answer_clue: q.answer_clue ?? "",
      destination: q.destination,
      final_transport: q.final_transport,
      mentioned_transport_options: q.mentioned_transport_options,
      segments: q.segments,
    });
    for (const msg of transportFieldCheck.issues) {
      if (msg.includes("final_transport와 correct_answer")) continue;
      if (msg.includes("answer_clue")) continue;
      issues.push({
        code: "type11_transport_check",
        message: msg,
        weight: 14,
      });
    }

    const mentioned = q.mentioned_transport_options ?? [];
    const finalCount = mentioned.filter((m) =>
      /final/i.test(m.role)
    ).length;
    if (finalCount > 1) {
      issues.push({
        code: "type11_transport_confusion",
        message: "최종 이동 수단(final)이 여러 개로 표시되어 혼동될 수 있습니다.",
        weight: 18,
      });
    }

    if (q.needs_image_choices) {
      issues.push({
        code: "type11_needs_image",
        message: "11번 유형은 needs_image_choices가 false여야 합니다.",
      });
    }
    if (q.visual_choice_type && q.visual_choice_type !== "none") {
      issues.push({
        code: "type11_visual_type",
        message: 'visual_choice_type은 "none"이어야 합니다.',
      });
    }
    const prompts = q.choice_image_prompts ?? [];
    if (prompts.some((p) => p.trim())) {
      issues.push({
        code: "type11_image_prompts",
        message: "11번 유형은 choice_image_prompts를 비워 두어야 합니다.",
      });
    }
    if (q.question_text?.trim()) {
      issues.push({
        code: "type11_question_text",
        message: "11번 유형은 question_text를 비워 두어야 합니다.",
      });
    }
  }

  if (typeId === 12) {
    const hasM = q.segments.some((s) => s.speaker === "M");
    const hasW = q.segments.some((s) => s.speaker === "W");
    if (!hasM || !hasW) {
      issues.push({
        code: "type12_dialogue",
        message: "12번 유형은 M과 W 대화가 필요합니다.",
      });
    }
    if (turnCount < 6 || turnCount > 8) {
      issues.push({
        code: "type12_turns",
        message: `12번 유형은 6~8턴이어야 합니다 (${turnCount}턴).`,
      });
    }

    if (q.question_type !== TYPE12_QUESTION_TYPE) {
      issues.push({
        code: "type12_question_type",
        message: `question_type은 "${TYPE12_QUESTION_TYPE}"이어야 합니다.`,
        weight: 12,
      });
    }

    const reasonCheck = checkKoreanReasonChoices(q.choices);
    if (!reasonCheck.ok) {
      issues.push({
        code: "type12_choice_format",
        message: reasonCheck.message ?? "보기 형식 오류",
        weight: 22,
      });
    }

    if (q.target_person?.trim() && q.instruction?.trim()) {
      if (!instructionMatchesReasonTarget(q.instruction, q.target_person)) {
        issues.push({
          code: "type12_target_person_mismatch",
          message: "지시문과 target_person(대상)이 일치하지 않습니다.",
          weight: 24,
        });
      }
    }

    if (!q.target_place?.trim()) {
      issues.push({
        code: "type12_target_place_unclear",
        message: "target_place(목적 장소)이 필요합니다.",
        weight: 16,
      });
    } else if (
      q.instruction?.trim() &&
      !instructionContainsTargetPlace(q.instruction, q.target_place)
    ) {
      issues.push({
        code: "type12_target_place_unclear",
        message: "지시문과 target_place(장소)가 일치하지 않을 수 있습니다.",
        weight: 14,
      });
    }

    if (!q.reason_for_going?.trim()) {
      issues.push({
        code: "type12_reason_unclear",
        message: "reason_for_going(가는 이유)이 필요합니다.",
        weight: 22,
      });
    } else if (
      !reasonMatchesChoice(
        q.reason_for_going,
        q.choices,
        q.correct_answer
      )
    ) {
      issues.push({
        code: "type12_reason_unclear",
        message: "reason_for_going와 correct_answer 선택지가 일치하지 않습니다.",
        weight: 22,
      });
    }

    if (q.target_person?.trim() && !findReasonSpeaker(q.segments, q.target_person)) {
      issues.push({
        code: "type12_reason_unclear",
        message: "목표 인물의 발화에 가는 이유 단서가 충분하지 않습니다.",
        weight: 20,
      });
    }

    if (q.answer_clue?.trim()) {
      if (isVagueReasonClue(q.answer_clue)) {
        issues.push({
          code: "type12_reason_unclear",
          message:
            "answer_clue가 장소에 가는 이유를 직접 보여주는 문장이어야 합니다.",
          weight: 20,
        });
      }
    } else {
      issues.push({
        code: "type12_reason_unclear",
        message: "answer_clue(가는 이유 근거)가 필요합니다.",
        weight: 18,
      });
    }

    const reasonFieldCheck = validateType12ReasonFields({
      instruction: q.instruction,
      choices: q.choices,
      correct_answer: q.correct_answer,
      answer_clue: q.answer_clue ?? "",
      target_person: q.target_person,
      target_place: q.target_place,
      reason_for_going: q.reason_for_going,
      mentioned_possible_reasons: q.mentioned_possible_reasons,
      segments: q.segments,
    });
    for (const msg of reasonFieldCheck.issues) {
      if (msg.includes("지시문과 target_person")) continue;
      if (msg.includes("reason_for_going와 correct_answer")) continue;
      if (msg.includes("answer_clue")) continue;
      issues.push({
        code: "type12_reason_check",
        message: msg,
        weight: 14,
      });
    }

    if (q.needs_image_choices) {
      issues.push({
        code: "type12_needs_image",
        message: "12번 유형은 needs_image_choices가 false여야 합니다.",
      });
    }
    if (q.visual_choice_type && q.visual_choice_type !== "none") {
      issues.push({
        code: "type12_visual_type",
        message: 'visual_choice_type은 "none"이어야 합니다.',
      });
    }
    const prompts = q.choice_image_prompts ?? [];
    if (prompts.some((p) => p.trim())) {
      issues.push({
        code: "type12_image_prompts",
        message: "12번 유형은 choice_image_prompts를 비워 두어야 합니다.",
      });
    }
    if (q.question_text?.trim()) {
      issues.push({
        code: "type12_question_text",
        message: "12번 유형은 question_text를 비워 두어야 합니다.",
      });
    }
  }

  if (typeId === 13) {
    const hasM = q.segments.some((s) => s.speaker === "M");
    const hasW = q.segments.some((s) => s.speaker === "W");
    if (!hasM || !hasW) {
      issues.push({
        code: "type13_dialogue",
        message: "13번 유형은 M과 W 대화가 필요합니다.",
      });
    }
    if (turnCount < 6 || turnCount > 8) {
      issues.push({
        code: "type13_turns",
        message: `13번 유형은 6~8턴이어야 합니다 (${turnCount}턴).`,
      });
    }

    if (q.question_type !== TYPE13_QUESTION_TYPE) {
      issues.push({
        code: "type13_question_type",
        message: `question_type은 "${TYPE13_QUESTION_TYPE}"이어야 합니다.`,
        weight: 12,
      });
    }

    const placeCheck = checkKoreanPlaceChoices(q.choices);
    if (!placeCheck.ok) {
      issues.push({
        code: "type13_choice_format",
        message: placeCheck.message ?? "보기 형식 오류",
        weight: 22,
      });
    }

    const scriptJoined = q.segments.map((s) => s.text).join(" ");

    if (!q.target_place?.trim()) {
      issues.push({
        code: "type13_place_unclear",
        message: "target_place(대화 장소)이 필요합니다.",
        weight: 22,
      });
    } else {
      if (
        !placeMatchesChoice(q.target_place, q.choices, q.correct_answer)
      ) {
        issues.push({
          code: "type13_place_unclear",
          message: "target_place와 correct_answer 선택지가 일치하지 않습니다.",
          weight: 22,
        });
      }
      if (scriptJoined && scriptDirectlyNamesPlace(scriptJoined, q.target_place)) {
        issues.push({
          code: "type13_place_directly_named",
          message: "대본에서 정답 장소명을 직접 언급하면 안 됩니다.",
          weight: 24,
        });
      }
    }

    const clues = q.place_clues ?? [];
    if (clues.length < 2) {
      issues.push({
        code: "type13_place_clues_insufficient",
        message: "place_clues에 장소 단서가 2개 이상 필요합니다.",
        weight: 20,
      });
    }

    if (q.answer_clue?.trim()) {
      if (!answerClueHasPlaceHints(q.answer_clue)) {
        issues.push({
          code: "type13_place_clues_insufficient",
          message:
            "answer_clue에 장소 추론 단서 문장 2개 이상이 필요합니다.",
          weight: 20,
        });
      }
    } else {
      issues.push({
        code: "type13_place_unclear",
        message: "answer_clue(장소 추론 근거)가 필요합니다.",
        weight: 18,
      });
    }

    const placeFieldCheck = validateType13PlaceFields({
      instruction: q.instruction,
      choices: q.choices,
      correct_answer: q.correct_answer,
      answer_clue: q.answer_clue ?? "",
      target_place: q.target_place,
      place_clues: q.place_clues,
      distractor_places: q.distractor_places,
      segments: q.segments,
    });
    for (const msg of placeFieldCheck.issues) {
      if (msg.includes("target_place와 correct_answer")) continue;
      if (msg.includes("answer_clue")) continue;
      if (msg.includes("직접 언급")) continue;
      issues.push({
        code: "type13_place_check",
        message: msg,
        weight: 14,
      });
    }

    if (q.needs_image_choices) {
      issues.push({
        code: "type13_needs_image",
        message: "13번 유형은 needs_image_choices가 false여야 합니다.",
      });
    }
    if (q.visual_choice_type && q.visual_choice_type !== "none") {
      issues.push({
        code: "type13_visual_type",
        message: 'visual_choice_type은 "none"이어야 합니다.',
      });
    }
    const prompts = q.choice_image_prompts ?? [];
    if (prompts.some((p) => p.trim())) {
      issues.push({
        code: "type13_image_prompts",
        message: "13번 유형은 choice_image_prompts를 비워 두어야 합니다.",
      });
    }
    if (q.question_text?.trim()) {
      issues.push({
        code: "type13_question_text",
        message: "13번 유형은 question_text를 비워 두어야 합니다.",
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

  if (typeId === 19) {
    if (q.question_type !== TYPE19_QUESTION_TYPE) {
      issues.push({
        code: "type19_question_type",
        message: `question_type은 "${TYPE19_QUESTION_TYPE}"이어야 합니다.`,
        weight: 12,
      });
    }

    if (turnCount < 5 || turnCount > 7) {
      issues.push({
        code: "type19_turns",
        message: `19번 유형은 5~7턴이어야 합니다 (${turnCount}턴).`,
      });
    }

    const blankSpeaker = parseBlankSpeaker(q.blank_speaker ?? "M") ?? "M";

    if (!instructionMatchesBlankSpeaker(q.instruction, blankSpeaker)) {
      issues.push({
        code: "type19_blank_speaker_mismatch",
        message: "지시문과 blank_speaker(빈칸 화자)가 일치하지 않습니다.",
        weight: 24,
      });
    }

    if (!questionTextMatchesBlankSpeaker(q.question_text, blankSpeaker)) {
      issues.push({
        code: "type19_blank_speaker_mismatch",
        message: "question_text와 blank_speaker가 일치하지 않습니다.",
        weight: 22,
      });
    }

    const englishCheck = checkEnglishResponseChoices(q.choices);
    if (!englishCheck.ok) {
      issues.push({
        code: "type19_choice_format",
        message: englishCheck.message ?? "보기 형식 오류",
        weight: 22,
      });
    }

    const correctChoice = q.choices[q.correct_answer - 1]?.trim() ?? "";
    if (correctChoice && isTooGenericResponse(correctChoice)) {
      issues.push({
        code: "type19_response_too_generic",
        message: "정답 응답이 너무 일반적입니다(Okay/Yes/Sure/Thank you 등).",
        weight: 22,
      });
    }

    if (
      q.previous_turn?.trim() &&
      !previousTurnMatchesLastSegment(q.previous_turn, q.segments)
    ) {
      issues.push({
        code: "type19_previous_turn_mismatch",
        message: "previous_turn이 segments 마지막 발화와 일치하지 않습니다.",
        weight: 20,
      });
    }

    if (!q.answer_clue?.trim()) {
      issues.push({
        code: "type19_response_context_weak",
        message: "answer_clue(응답 연결 근거)가 필요합니다.",
        weight: 18,
      });
    }

    const responseFieldCheck = validateType19ResponseFields({
      instruction: q.instruction,
      question_text: q.question_text,
      choices: q.choices,
      correct_answer: q.correct_answer,
      answer_clue: q.answer_clue ?? "",
      previous_turn: q.previous_turn ?? "",
      blank_speaker: q.blank_speaker,
      correct_response_function: q.correct_response_function,
      distractor_reason: q.distractor_reason,
      segments: q.segments,
    });
    for (const msg of responseFieldCheck.issues) {
      if (msg.includes("지시문과 blank_speaker")) continue;
      if (msg.includes("question_text와 blank_speaker")) continue;
      if (msg.includes("영어 응답")) continue;
      if (msg.includes("너무 일반적")) continue;
      if (msg.includes("previous_turn")) continue;
      if (msg.includes("distractor_reason")) continue;
      if (msg.includes("answer_clue")) continue;
      if (msg.includes("마지막 segment")) continue;
      issues.push({
        code: "type19_response_check",
        message: msg,
        weight: 14,
      });
    }

    if (q.needs_image_choices) {
      issues.push({
        code: "type19_needs_image",
        message: "19번 유형은 needs_image_choices가 false여야 합니다.",
      });
    }
    if (q.visual_choice_type && q.visual_choice_type !== "none") {
      issues.push({
        code: "type19_visual_type",
        message: 'visual_choice_type은 "none"이어야 합니다.',
      });
    }
    const prompts = q.choice_image_prompts ?? [];
    if (prompts.some((p) => p.trim())) {
      issues.push({
        code: "type19_image_prompts",
        message: "19번 유형은 choice_image_prompts를 비워 두어야 합니다.",
      });
    }
  }

  if (typeId === 20) {
    if (q.question_type !== TYPE20_QUESTION_TYPE) {
      issues.push({
        code: "type20_question_type",
        message: `question_type은 "${TYPE20_QUESTION_TYPE}"이어야 합니다.`,
        weight: 12,
      });
    }

    if (turnCount < 5 || turnCount > 7) {
      issues.push({
        code: "type20_turns",
        message: `20번 유형은 5~7턴이어야 합니다 (${turnCount}턴).`,
      });
    }

    const blankSpeaker = parseBlankSpeaker(q.blank_speaker ?? "W") ?? "W";

    if (!instructionMatchesBlankSpeaker(q.instruction, blankSpeaker)) {
      issues.push({
        code: "type20_blank_speaker_mismatch",
        message: "지시문과 blank_speaker(빈칸 화자)가 일치하지 않습니다.",
        weight: 24,
      });
    }

    if (!questionTextMatchesBlankSpeaker(q.question_text, blankSpeaker)) {
      issues.push({
        code: "type20_blank_speaker_mismatch",
        message: "question_text와 blank_speaker가 일치하지 않습니다.",
        weight: 22,
      });
    }

    const englishCheck = checkEnglishResponseChoices(q.choices);
    if (!englishCheck.ok) {
      issues.push({
        code: "type20_choice_format",
        message: englishCheck.message ?? "보기 형식 오류",
        weight: 22,
      });
    }

    const correctChoice = q.choices[q.correct_answer - 1]?.trim() ?? "";
    if (correctChoice && isTooGenericResponse(correctChoice)) {
      issues.push({
        code: "type20_response_too_generic",
        message: "정답 응답이 너무 일반적입니다(Okay/Yes/Sure/Thank you 등).",
        weight: 22,
      });
    }

    if (
      q.previous_turn?.trim() &&
      !previousTurnMatchesLastSegment(q.previous_turn, q.segments)
    ) {
      issues.push({
        code: "type20_previous_turn_mismatch",
        message: "previous_turn이 segments 마지막 발화와 일치하지 않습니다.",
        weight: 20,
      });
    }

    if (!q.answer_clue?.trim()) {
      issues.push({
        code: "type20_response_context_weak",
        message: "answer_clue(응답 연결 근거)가 필요합니다.",
        weight: 18,
      });
    }

    const scriptJoined = q.segments.map((s) => s.text).join(" ");
    if (q.situation_type?.trim() && looksLikeType19Situation(q.situation_type)) {
      issues.push({
        code: "type20_duplicate_with_19",
        message: "situation_type이 19번(잃어버린 물건 등)과 너무 비슷합니다.",
        weight: 20,
      });
    }
    if (scriptJoined && scriptLooksLikeLostItemDialogue(scriptJoined)) {
      issues.push({
        code: "type20_duplicate_with_19",
        message: "대본이 19번 유형(잃어버린 물건)과 너무 비슷합니다.",
        weight: 22,
      });
    }

    if (!q.situation_type?.trim()) {
      issues.push({
        code: "type20_situation_missing",
        message: "situation_type(상황 유형)이 필요합니다.",
        weight: 16,
      });
    }

    const responseFieldCheck = validateType20ResponseFields({
      instruction: q.instruction,
      question_text: q.question_text,
      choices: q.choices,
      correct_answer: q.correct_answer,
      answer_clue: q.answer_clue ?? "",
      previous_turn: q.previous_turn ?? "",
      blank_speaker: q.blank_speaker,
      situation_type: q.situation_type,
      correct_response_function: q.correct_response_function,
      distractor_reason: q.distractor_reason,
      segments: q.segments,
      script_text: q.script_text ?? scriptJoined,
    });
    for (const msg of responseFieldCheck.issues) {
      if (msg.includes("지시문과 blank_speaker")) continue;
      if (msg.includes("question_text와 blank_speaker")) continue;
      if (msg.includes("영어 응답")) continue;
      if (msg.includes("너무 일반적")) continue;
      if (msg.includes("previous_turn")) continue;
      if (msg.includes("distractor_reason")) continue;
      if (msg.includes("answer_clue")) continue;
      if (msg.includes("19번")) continue;
      if (msg.includes("마지막 segment")) continue;
      issues.push({
        code: "type20_response_check",
        message: msg,
        weight: 14,
      });
    }

    if (q.needs_image_choices) {
      issues.push({
        code: "type20_needs_image",
        message: "20번 유형은 needs_image_choices가 false여야 합니다.",
      });
    }
    if (q.visual_choice_type && q.visual_choice_type !== "none") {
      issues.push({
        code: "type20_visual_type",
        message: 'visual_choice_type은 "none"이어야 합니다.',
      });
    }
    const prompts20 = q.choice_image_prompts ?? [];
    if (prompts20.some((p) => p.trim())) {
      issues.push({
        code: "type20_image_prompts",
        message: "20번 유형은 choice_image_prompts를 비워 두어야 합니다.",
      });
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
      if (q.question_type !== TYPE14_QUESTION_TYPE) {
        issues.push({
          code: "type14_question_type",
          message: `question_type은 "${TYPE14_QUESTION_TYPE}"이어야 합니다.`,
          weight: 12,
        });
      }

      if (table.rows.length !== 5) {
        issues.push({
          code: "type14_row_count",
          message: `표 행은 5개여야 합니다 (${table.rows.length}개).`,
          weight: 22,
        });
      }
      if (table.mismatch_no < 1 || table.mismatch_no > 5) {
        issues.push({
          code: "type14_mismatch_no",
          message: "mismatch_no는 1~5여야 합니다.",
          weight: 20,
        });
      }
      if (q.correct_answer !== table.mismatch_no) {
        issues.push({
          code: "type14_answer_mismatch",
          message: "correct_answer와 mismatch_no가 일치해야 합니다.",
          weight: 24,
        });
      }
      if (!table.mismatch_reason?.trim()) {
        issues.push({
          code: "type14_mismatch_reason",
          message: "mismatch_reason이 필요합니다.",
          weight: 18,
        });
      }
      if (!table.title?.trim()) {
        issues.push({
          code: "type14_no_table",
          message: "table_data.title이 필요합니다.",
          weight: 16,
        });
      }

      if (!choicesAlignWithTable(q.choices, table)) {
        issues.push({
          code: "type14_choices_order",
          message: "choices가 table_data.rows label과 같은 순서여야 합니다.",
          weight: 18,
        });
      }

      if (q.visual_choice_type !== "table") {
        issues.push({
          code: "type14_visual_type",
          message: 'visual_choice_type은 "table"이어야 합니다.',
          weight: 16,
        });
      }

      if (q.needs_image_choices) {
        issues.push({
          code: "type14_needs_image",
          message: "14번 유형은 needs_image_choices가 false여야 합니다.",
        });
      }

      const tableFieldCheck = validateType14TableFields({
        instruction: q.instruction,
        choices: q.choices,
        correct_answer: q.correct_answer,
        answer_clue: q.answer_clue ?? "",
        table_data: table,
        source_facts_from_script: q.source_facts_from_script,
        segments: q.segments,
        visual_choice_type: q.visual_choice_type,
        needs_image_choices: q.needs_image_choices,
      });
      for (const msg of tableFieldCheck.issues) {
        if (msg.includes("correct_answer와 mismatch_no")) continue;
        if (msg.includes("table_data가 필요")) continue;
        issues.push({
          code: "type14_table_check",
          message: msg,
          weight: 14,
        });
      }

      if (!q.answer_clue?.trim()) {
        issues.push({
          code: "type14_answer_clue",
          message: "14번은 answer_clue에 불일치 근거가 필요합니다.",
          weight: 16,
        });
      }

      if (q.question_text?.trim()) {
        issues.push({
          code: "type14_question_text",
          message: "14번 유형은 question_text를 비워 두어야 합니다.",
        });
      }
    }
  }

  if (typeId === 15) {
    const hasM = q.segments.some((s) => s.speaker === "M");
    const hasW = q.segments.some((s) => s.speaker === "W");
    if (!hasM || !hasW) {
      issues.push({
        code: "type15_dialogue",
        message: "15번 유형은 M과 W 대화가 필요합니다.",
      });
    }
    if (turnCount < 6 || turnCount > 8) {
      issues.push({
        code: "type15_turns",
        message: `15번 유형은 6~8턴이어야 합니다 (${turnCount}턴).`,
      });
    }

    if (q.question_type !== TYPE15_QUESTION_TYPE) {
      issues.push({
        code: "type15_question_type",
        message: `question_type은 "${TYPE15_QUESTION_TYPE}"이어야 합니다.`,
        weight: 12,
      });
    }

    const actionCheck = checkKoreanActionChoices(q.choices);
    if (!actionCheck.ok) {
      issues.push({
        code: "type15_choice_format",
        message: actionCheck.message ?? "보기 형식 오류",
        weight: 22,
      });
    }

    if (q.requester?.trim() && q.instruction?.trim()) {
      if (!instructionMatchesRequester(q.instruction, q.requester)) {
        issues.push({
          code: "type15_speaker_mismatch",
          message: "지시문과 requester(부탁한 사람)가 일치하지 않습니다.",
          weight: 24,
        });
      }
    }

    if (q.requested_person?.trim() && q.instruction?.trim()) {
      if (!instructionMatchesRequestedPerson(q.instruction, q.requested_person)) {
        issues.push({
          code: "type15_speaker_mismatch",
          message: "지시문과 requested_person(부탁받은 사람)가 일치하지 않습니다.",
          weight: 24,
        });
      }
    }

    const scriptJoined = q.segments.map((s) => s.text).join(" ");
    if (scriptJoined && !scriptHasRequestExpression(scriptJoined)) {
      issues.push({
        code: "type15_no_request",
        message: "대본에 Can/Could/Would you 부탁 표현이 필요합니다.",
        weight: 22,
      });
    }

    if (scriptJoined && scriptCenteredOnSuggestion(scriptJoined)) {
      issues.push({
        code: "type15_suggestion_confusion",
        message: "대본이 제안(Why don't we / Let's) 중심이면 안 됩니다.",
        weight: 22,
      });
    }

    const reqSpeaker = findRequestSpeaker(q.segments);
    if (
      reqSpeaker &&
      q.requester?.trim() &&
      ((q.requester.includes("남") && reqSpeaker !== "M") ||
        (q.requester.includes("여") && reqSpeaker !== "W"))
    ) {
      issues.push({
        code: "type15_speaker_mismatch",
        message: "부탁 표현을 말한 화자와 requester가 일치하지 않습니다.",
        weight: 22,
      });
    }

    if (!q.requested_action?.trim()) {
      issues.push({
        code: "type15_no_request",
        message: "requested_action(부탁한 일)이 필요합니다.",
        weight: 20,
      });
    } else if (
      !actionMatchesChoice(
        q.requested_action,
        q.choices,
        q.correct_answer
      )
    ) {
      issues.push({
        code: "type15_no_request",
        message: "requested_action과 correct_answer 선택지가 일치하지 않습니다.",
        weight: 20,
      });
    }

    if (q.answer_clue?.trim()) {
      if (!answerClueHasRequest(q.answer_clue)) {
        issues.push({
          code: "type15_no_request",
          message:
            "answer_clue에 Can/Could/Would you 부탁 문장이 필요합니다.",
          weight: 20,
        });
      }
    } else {
      issues.push({
        code: "type15_no_request",
        message: "answer_clue(부탁 표현 근거)가 필요합니다.",
        weight: 18,
      });
    }

    const requestFieldCheck = validateType15RequestFields({
      instruction: q.instruction,
      choices: q.choices,
      correct_answer: q.correct_answer,
      answer_clue: q.answer_clue ?? "",
      requester: q.requester,
      requested_person: q.requested_person,
      requested_action: q.requested_action,
      request_expression: q.request_expression,
      mentioned_actions: q.mentioned_actions,
      segments: q.segments,
    });
    for (const msg of requestFieldCheck.issues) {
      if (msg.includes("지시문과 requester")) continue;
      if (msg.includes("지시문과 requested_person")) continue;
      if (msg.includes("requested_action과 correct_answer")) continue;
      if (msg.includes("answer_clue")) continue;
      issues.push({
        code: "type15_request_check",
        message: msg,
        weight: 14,
      });
    }

    if (q.needs_image_choices) {
      issues.push({
        code: "type15_needs_image",
        message: "15번 유형은 needs_image_choices가 false여야 합니다.",
      });
    }
    if (q.visual_choice_type && q.visual_choice_type !== "none") {
      issues.push({
        code: "type15_visual_type",
        message: 'visual_choice_type은 "none"이어야 합니다.',
      });
    }
    const prompts = q.choice_image_prompts ?? [];
    if (prompts.some((p) => p.trim())) {
      issues.push({
        code: "type15_image_prompts",
        message: "15번 유형은 choice_image_prompts를 비워 두어야 합니다.",
      });
    }
    if (q.question_text?.trim()) {
      issues.push({
        code: "type15_question_text",
        message: "15번 유형은 question_text를 비워 두어야 합니다.",
      });
    }
  }

  if (typeId === 16) {
    const hasM = q.segments.some((s) => s.speaker === "M");
    const hasW = q.segments.some((s) => s.speaker === "W");
    if (!hasM || !hasW) {
      issues.push({
        code: "type16_dialogue",
        message: "16번 유형은 M과 W 대화가 필요합니다.",
      });
    }
    if (turnCount < 6 || turnCount > 8) {
      issues.push({
        code: "type16_turns",
        message: `16번 유형은 6~8턴이어야 합니다 (${turnCount}턴).`,
      });
    }

    if (q.question_type !== TYPE16_QUESTION_TYPE) {
      issues.push({
        code: "type16_question_type",
        message: `question_type은 "${TYPE16_QUESTION_TYPE}"이어야 합니다.`,
        weight: 12,
      });
    }

    const actionCheck = checkKoreanActionChoices(q.choices);
    if (!actionCheck.ok) {
      issues.push({
        code: "type16_choice_format",
        message: actionCheck.message ?? "보기 형식 오류",
        weight: 22,
      });
    }

    if (q.suggester?.trim() && q.instruction?.trim()) {
      if (!instructionMatchesSuggester(q.instruction, q.suggester)) {
        issues.push({
          code: "type16_speaker_mismatch",
          message: "지시문과 suggester(제안한 사람)가 일치하지 않습니다.",
          weight: 24,
        });
      }
    }

    if (q.suggested_to?.trim() && q.instruction?.trim()) {
      if (!instructionMatchesSuggestedTo(q.instruction, q.suggested_to)) {
        issues.push({
          code: "type16_speaker_mismatch",
          message: "지시문과 suggested_to(제안받은 사람)가 일치하지 않습니다.",
          weight: 24,
        });
      }
    }

    const scriptJoined = q.segments.map((s) => s.text).join(" ");
    if (scriptJoined && !scriptHasSuggestionExpression(scriptJoined)) {
      issues.push({
        code: "type16_no_suggestion",
        message:
          "대본에 Why don't / How about / Let's / Maybe you can 제안 표현이 필요합니다.",
        weight: 22,
      });
    }

    if (scriptJoined && scriptCenteredOnRequest(scriptJoined)) {
      issues.push({
        code: "type16_request_confusion",
        message: "대본이 부탁(Can/Could/Would you) 중심이면 안 됩니다.",
        weight: 22,
      });
    }

    const sugSpeaker = findSuggestionSpeaker(q.segments);
    if (
      sugSpeaker &&
      q.suggester?.trim() &&
      ((q.suggester.includes("남") && sugSpeaker !== "M") ||
        (q.suggester.includes("여") && sugSpeaker !== "W"))
    ) {
      issues.push({
        code: "type16_speaker_mismatch",
        message: "제안 표현을 말한 화자와 suggester가 일치하지 않습니다.",
        weight: 22,
      });
    }

    if (!q.suggested_action?.trim()) {
      issues.push({
        code: "type16_no_suggestion",
        message: "suggested_action(제안한 내용)이 필요합니다.",
        weight: 20,
      });
    } else if (
      !actionMatchesChoice(
        q.suggested_action,
        q.choices,
        q.correct_answer
      )
    ) {
      issues.push({
        code: "type16_no_suggestion",
        message: "suggested_action과 correct_answer 선택지가 일치하지 않습니다.",
        weight: 20,
      });
    }

    if (q.answer_clue?.trim()) {
      if (!answerClueHasSuggestion(q.answer_clue)) {
        issues.push({
          code: "type16_no_suggestion",
          message:
            "answer_clue에 Why don't / How about / Let's 제안 문장이 필요합니다.",
          weight: 20,
        });
      }
    } else {
      issues.push({
        code: "type16_no_suggestion",
        message: "answer_clue(제안 표현 근거)가 필요합니다.",
        weight: 18,
      });
    }

    const suggestionFieldCheck = validateType16SuggestionFields({
      instruction: q.instruction,
      choices: q.choices,
      correct_answer: q.correct_answer,
      answer_clue: q.answer_clue ?? "",
      suggester: q.suggester,
      suggested_to: q.suggested_to,
      suggested_action: q.suggested_action,
      suggestion_expression: q.suggestion_expression,
      mentioned_actions: q.mentioned_actions,
      segments: q.segments,
    });
    for (const msg of suggestionFieldCheck.issues) {
      if (msg.includes("지시문과 suggester")) continue;
      if (msg.includes("지시문과 suggested_to")) continue;
      if (msg.includes("suggested_action과 correct_answer")) continue;
      if (msg.includes("answer_clue")) continue;
      issues.push({
        code: "type16_suggestion_check",
        message: msg,
        weight: 14,
      });
    }

    if (q.needs_image_choices) {
      issues.push({
        code: "type16_needs_image",
        message: "16번 유형은 needs_image_choices가 false여야 합니다.",
      });
    }
    if (q.visual_choice_type && q.visual_choice_type !== "none") {
      issues.push({
        code: "type16_visual_type",
        message: 'visual_choice_type은 "none"이어야 합니다.',
      });
    }
    const prompts = q.choice_image_prompts ?? [];
    if (prompts.some((p) => p.trim())) {
      issues.push({
        code: "type16_image_prompts",
        message: "16번 유형은 choice_image_prompts를 비워 두어야 합니다.",
      });
    }
    if (q.question_text?.trim()) {
      issues.push({
        code: "type16_question_text",
        message: "16번 유형은 question_text를 비워 두어야 합니다.",
      });
    }
  }

  if (typeId === 17) {
    const hasM = q.segments.some((s) => s.speaker === "M");
    const hasW = q.segments.some((s) => s.speaker === "W");
    if (!hasM || !hasW) {
      issues.push({
        code: "type17_dialogue",
        message: "17번 유형은 M과 W 대화가 필요합니다.",
      });
    }
    if (turnCount < 6 || turnCount > 8) {
      issues.push({
        code: "type17_turns",
        message: `17번 유형은 6~8턴이어야 합니다 (${turnCount}턴).`,
      });
    }

    if (q.question_type !== TYPE17_QUESTION_TYPE) {
      issues.push({
        code: "type17_question_type",
        message: `question_type은 "${TYPE17_QUESTION_TYPE}"이어야 합니다.`,
        weight: 12,
      });
    }

    const actionCheck = checkKoreanActionChoices(q.choices);
    if (!actionCheck.ok) {
      issues.push({
        code: "type17_choice_format",
        message: actionCheck.message ?? "보기 형식 오류",
        weight: 22,
      });
    }

    if (!q.target_time?.trim()) {
      issues.push({
        code: "type17_target_time_unclear",
        message: "target_time(질문 시점)이 필요합니다.",
        weight: 22,
      });
    } else if (
      q.instruction?.trim() &&
      !instructionContainsTargetTime(q.instruction, q.target_time)
    ) {
      issues.push({
        code: "type17_target_time_unclear",
        message: "지시문과 target_time(시점)이 일치하지 않습니다.",
        weight: 24,
      });
    }

    if (q.target_person?.trim() && q.instruction?.trim()) {
      if (!instructionMatchesTargetPerson(q.instruction, q.target_person)) {
        issues.push({
          code: "type17_target_person_mismatch",
          message: "지시문과 target_person(대상)이 일치하지 않습니다.",
          weight: 24,
        });
      }
    }

    const planSpeaker = findPlannedActionSpeaker(q.segments);
    if (
      planSpeaker &&
      q.target_person?.trim() &&
      speakerCodeFromTarget(q.target_person) !== planSpeaker
    ) {
      issues.push({
        code: "type17_target_person_mismatch",
        message: "최종 계획을 말한 화자와 target_person이 일치하지 않습니다.",
        weight: 22,
      });
    }

    if (!q.planned_action?.trim()) {
      issues.push({
        code: "type17_planned_action_unclear",
        message: "planned_action(실제 할 일)이 필요합니다.",
        weight: 20,
      });
    } else if (
      !actionMatchesChoice(q.planned_action, q.choices, q.correct_answer)
    ) {
      issues.push({
        code: "type17_planned_action_unclear",
        message: "planned_action과 correct_answer 선택지가 일치하지 않습니다.",
        weight: 20,
      });
    }

    if (q.answer_clue?.trim()) {
      if (answerClueLooksLikeCanceledPlan(q.answer_clue)) {
        issues.push({
          code: "type17_canceled_plan",
          message:
            "answer_clue가 취소된 원래 계획(wanted/planned/was going to)이면 안 됩니다.",
          weight: 22,
        });
      } else if (!answerClueHasPlannedAction(q.answer_clue)) {
        issues.push({
          code: "type17_planned_action_unclear",
          message:
            "answer_clue에 I'm going to / We will 최종 계획 문장이 필요합니다.",
          weight: 20,
        });
      }
    } else {
      issues.push({
        code: "type17_planned_action_unclear",
        message: "answer_clue(최종 계획 근거)가 필요합니다.",
        weight: 18,
      });
    }

    const scheduleFieldCheck = validateType17ScheduleFields({
      instruction: q.instruction,
      choices: q.choices,
      correct_answer: q.correct_answer,
      answer_clue: q.answer_clue ?? "",
      target_person: q.target_person,
      target_time: q.target_time,
      planned_action: q.planned_action,
      mentioned_other_actions: q.mentioned_other_actions,
      segments: q.segments,
    });
    for (const msg of scheduleFieldCheck.issues) {
      if (msg.includes("지시문과 target_person")) continue;
      if (msg.includes("지시문과 target_time")) continue;
      if (msg.includes("planned_action과 correct_answer")) continue;
      if (msg.includes("answer_clue")) continue;
      if (msg.includes("최종 계획을 말한 화자")) continue;
      issues.push({
        code: "type17_schedule_check",
        message: msg,
        weight: 14,
      });
    }

    if (q.needs_image_choices) {
      issues.push({
        code: "type17_needs_image",
        message: "17번 유형은 needs_image_choices가 false여야 합니다.",
      });
    }
    if (q.visual_choice_type && q.visual_choice_type !== "none") {
      issues.push({
        code: "type17_visual_type",
        message: 'visual_choice_type은 "none"이어야 합니다.',
      });
    }
    const prompts = q.choice_image_prompts ?? [];
    if (prompts.some((p) => p.trim())) {
      issues.push({
        code: "type17_image_prompts",
        message: "17번 유형은 choice_image_prompts를 비워 두어야 합니다.",
      });
    }
    if (q.question_text?.trim()) {
      issues.push({
        code: "type17_question_text",
        message: "17번 유형은 question_text를 비워 두어야 합니다.",
      });
    }
  }

  if (typeId === 18) {
    const hasM = q.segments.some((s) => s.speaker === "M");
    const hasW = q.segments.some((s) => s.speaker === "W");
    if (!hasM || !hasW) {
      issues.push({
        code: "type18_dialogue",
        message: "18번 유형은 M과 W 대화가 필요합니다.",
      });
    }
    if (turnCount < 6 || turnCount > 8) {
      issues.push({
        code: "type18_turns",
        message: `18번 유형은 6~8턴이어야 합니다 (${turnCount}턴).`,
      });
    }

    if (q.question_type !== TYPE18_QUESTION_TYPE) {
      issues.push({
        code: "type18_question_type",
        message: `question_type은 "${TYPE18_QUESTION_TYPE}"이어야 합니다.`,
        weight: 12,
      });
    }

    const jobCheck = checkKoreanJobChoices(q.choices);
    if (!jobCheck.ok) {
      issues.push({
        code: "type18_choice_format",
        message: jobCheck.message ?? "보기 형식 오류",
        weight: 22,
      });
    }

    if (q.target_person?.trim() && q.instruction?.trim()) {
      if (!instructionMatchesTargetPerson(q.instruction, q.target_person)) {
        issues.push({
          code: "type18_target_person_mismatch",
          message: "지시문과 target_person(대상)이 일치하지 않습니다.",
          weight: 24,
        });
      }
    }

    const scriptJoined = q.segments.map((s) => s.text).join(" ");
    if (scriptJoined && scriptDirectlyNamesJob(scriptJoined)) {
      issues.push({
        code: "type18_job_directly_named",
        message: "대본에서 직업명을 직접 말하면 안 됩니다.",
        weight: 24,
      });
    }

    if (scriptJoined && scriptHasDreamJobAspiration(scriptJoined)) {
      issues.push({
        code: "type18_dream_job_confusion",
        message: '대본에 "I want to be a/an ..."(7번 장래 희망)이 있으면 안 됩니다.',
        weight: 20,
      });
    }

    const expectedSpeaker = speakerCodeFromTarget(q.target_person ?? "");
    if (expectedSpeaker) {
      const mClues = countJobCluesForSpeaker(q.segments, "M");
      const wClues = countJobCluesForSpeaker(q.segments, "W");
      const targetClues =
        expectedSpeaker === "M" ? mClues : wClues;
      const otherClues =
        expectedSpeaker === "M" ? wClues : mClues;
      if (targetClues < 2 && (q.job_clues?.length ?? 0) < 2) {
        issues.push({
          code: "type18_job_clues_insufficient",
          message: "target_person 화자의 직업 단서가 2개 이상 필요합니다.",
          weight: 22,
        });
      } else if (targetClues < otherClues && otherClues >= 2) {
        issues.push({
          code: "type18_target_person_mismatch",
          message: "직업 단서가 target_person이 아닌 다른 화자에게 더 많습니다.",
          weight: 20,
        });
      }
    }

    if (!q.target_job?.trim()) {
      issues.push({
        code: "type18_job_unclear",
        message: "target_job(정답 직업)이 필요합니다.",
        weight: 20,
      });
    } else if (
      !targetJobMatchesChoice(q.target_job, q.choices, q.correct_answer)
    ) {
      issues.push({
        code: "type18_job_mismatch",
        message: "target_job과 correct_answer 선택지가 일치하지 않습니다.",
        weight: 20,
      });
    }

    if ((q.job_clues?.length ?? 0) < 2) {
      issues.push({
        code: "type18_job_clues_insufficient",
        message: "job_clues에 직업 추론 단서가 2개 이상 필요합니다.",
        weight: 20,
      });
    }

    if (q.answer_clue?.trim()) {
      if (!answerClueHasJobInference(q.answer_clue)) {
        issues.push({
          code: "type18_job_clues_insufficient",
          message: "answer_clue에 직업 추론 단서 문장 2개 이상이 필요합니다.",
          weight: 18,
        });
      }
    } else {
      issues.push({
        code: "type18_job_clues_insufficient",
        message: "answer_clue(직업 추론 근거)가 필요합니다.",
        weight: 18,
      });
    }

    const jobFieldCheck = validateType18JobFields({
      instruction: q.instruction,
      choices: q.choices,
      correct_answer: q.correct_answer,
      answer_clue: q.answer_clue ?? "",
      script_text: q.script_text ?? scriptJoined,
      target_person: q.target_person,
      target_job: q.target_job,
      job_clues: q.job_clues,
      distractor_jobs: q.distractor_jobs,
      segments: q.segments,
    });
    for (const msg of jobFieldCheck.issues) {
      if (msg.includes("지시문과 target_person")) continue;
      if (msg.includes("target_job과 correct_answer")) continue;
      if (msg.includes("직업명을 직접")) continue;
      if (msg.includes("job_clues")) continue;
      if (msg.includes("answer_clue")) continue;
      if (msg.includes("target_person 화자")) continue;
      issues.push({
        code: "type18_job_check",
        message: msg,
        weight: 14,
      });
    }

    if (q.needs_image_choices) {
      issues.push({
        code: "type18_needs_image",
        message: "18번 유형은 needs_image_choices가 false여야 합니다.",
      });
    }
    if (q.visual_choice_type && q.visual_choice_type !== "none") {
      issues.push({
        code: "type18_visual_type",
        message: 'visual_choice_type은 "none"이어야 합니다.',
      });
    }
    const prompts = q.choice_image_prompts ?? [];
    if (prompts.some((p) => p.trim())) {
      issues.push({
        code: "type18_image_prompts",
        message: "18번 유형은 choice_image_prompts를 비워 두어야 합니다.",
      });
    }
    if (q.question_text?.trim()) {
      issues.push({
        code: "type18_question_text",
        message: "18번 유형은 question_text를 비워 두어야 합니다.",
      });
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
