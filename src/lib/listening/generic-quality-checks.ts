/**
 * 전 학년 공통 규칙 검수 (모델 호출 없음).
 * 예전에는 생성 직후 모든 문항에 품질 100·정답 확인됨을 찍어 두어, 아래 문제가 그대로 저장됐다:
 * 잘린 대본, 반대 화자를 묻는 지시문, 섞기 전 번호를 가리키는 해설, 틀린 금액 정답.
 */
import {
  isLabelOnlyChoiceSet,
  numericChoiceValue,
} from "@/lib/listening/balance-correct-answer";
import {
  isHighSchoolListeningGrade,
  type ListeningGradeLevel,
} from "@/lib/listening/grade-level";
import { scriptTooShortReason } from "@/lib/listening/parse-listening-response";
import { checkPriceQuestion, isPriceQuestion } from "@/lib/listening/price-check";
import {
  majoritySpeakerOfQuotes,
  speakerOfQuote,
} from "@/lib/listening/speaker-attribution";
import { findRequestSpeaker } from "@/lib/listening/type15-request-choices";
import { findSuggestionSpeaker } from "@/lib/listening/type16-suggestion-choices";
import type { GeneratedListeningQuestion } from "@/lib/listening/types";

export interface GenericQualityIssue {
  code: string;
  message: string;
  weight?: number;
}

/** 이 코드가 하나라도 있으면 정답이 틀렸거나 풀 수 없는 문항일 가능성이 높다 → 검토 표시 */
const CRITICAL_CODE =
  /(_speaker_mismatch|_target_person_mismatch|_answer_mismatch|_intention_mismatch|_final_time_mismatch|_dream_job_mismatch|_emotion_mismatch|_action_mismatch|_job_mismatch|_multiple_unmentioned|_blank_speaker_mismatch)$|^(script_too_short|duplicate_choices|explanation_wrong_position|price_answer_mismatch|price_explanation_mismatch|figure_labels|type4_encourage_self|correct_answer|choices_count|no_segments|no_script|instruction_speaker_mismatch)$/;

export function isCriticalQualityCode(code: string): boolean {
  return CRITICAL_CODE.test(code);
}

const CIRCLED = ["①", "②", "③", "④", "⑤"];

function personCode(label: string): "M" | "W" | null {
  if (label === "남자") return "M";
  if (label === "여자") return "W";
  return null;
}

type ChoiceLang = "ko" | "en" | "neutral";

function choiceLanguage(choice: string): ChoiceLang {
  const c = choice.trim();
  if (/[가-힣]/.test(c)) return "ko";
  if (numericChoiceValue(c) != null) return "neutral";
  if (/^[①②③④⑤A-E\d\s.:$,%()-]*$/i.test(c)) return "neutral";
  if (/[a-z]{2,}/i.test(c)) return "en";
  return "neutral";
}

/** 유형별로 선택지가 어느 언어여야 하는지 (모르면 null) */
function expectedChoiceLanguage(
  typeId: number,
  gradeLevel: ListeningGradeLevel | undefined
): "ko" | "en" | null {
  if (isHighSchoolListeningGrade(gradeLevel)) {
    if ([1, 2, 3, 5, 7, 8, 9].includes(typeId)) return "ko";
    if (typeId >= 11 && typeId <= 17) return "en";
    return null;
  }
  if ([1, 2, 19, 20].includes(typeId)) return "en";
  if (typeId >= 3 && typeId <= 18 && typeId !== 6) return "ko";
  return null;
}

export function genericQualityIssues(
  q: GeneratedListeningQuestion,
  typeId: number,
  gradeLevel: ListeningGradeLevel | undefined
): GenericQualityIssue[] {
  const issues: GenericQualityIssue[] = [];
  const choices = (q.choices ?? []).map((c) => String(c ?? "").trim());
  const labelOnly = isLabelOnlyChoiceSet(choices);

  // 1) 잘린 대본
  const short = scriptTooShortReason(q.segments ?? [], typeId, gradeLevel, q.instruction);
  if (short) {
    issues.push({ code: "script_too_short", message: `대본이 잘렸거나 너무 짧습니다: ${short}`, weight: 40 });
  }

  // 2) 같은 선택지 중복
  const normChoices = choices.map((c) => c.toLowerCase().replace(/\s+/g, " "));
  if (!labelOnly && new Set(normChoices).size !== normChoices.length) {
    issues.push({ code: "duplicate_choices", message: "같은 선택지가 두 번 있습니다.", weight: 30 });
  }

  // 3) 수 선택지 순서 (정답만 순서를 벗어나 있으면 순서만 보고 답을 알 수 있음)
  const values = choices.map(numericChoiceValue);
  if (choices.length === 5 && values.every((v) => v != null)) {
    const sorted = [...values].sort((a, b) => a! - b!);
    if (values.some((v, i) => v !== sorted[i])) {
      issues.push({
        code: "numeric_choice_order",
        message: "시각·금액 선택지가 작은 값부터 놓여 있지 않습니다.",
        weight: 12,
      });
    }
  }

  // 4) 해설 속 ①~⑤ 번호
  const explanation = String(q.explanation ?? "");
  if (!labelOnly && /[①②③④⑤]/.test(explanation) && !/그림/.test(q.question_type ?? "")) {
    const key = CIRCLED[q.correct_answer - 1];
    const refs = [...new Set(explanation.match(/[①②③④⑤]/g) ?? [])];
    // 번호가 하나뿐인데 정답과 다르면 섞기 전 번호가 남은 것 ("②가 일치하지 않는다"처럼 정답이란 말이 없어도)
    if (refs.length === 1 && refs[0] !== key) {
      issues.push({
        code: "explanation_wrong_position",
        message: `해설이 ${refs[0]}을 정답처럼 설명하지만 정답은 ${key}입니다.`,
        weight: 25,
      });
    } else {
      issues.push({
        code: "explanation_position_ref",
        message: "해설에 선택지 번호(①~⑤)가 들어 있습니다. 번호 대신 선택지 내용으로 설명해야 합니다.",
        weight: 5,
      });
    }
  }

  // 5) 금액 계산 검산
  if (isPriceQuestion(q)) {
    const price = checkPriceQuestion(q);
    if (price.keyMismatch) {
      issues.push({
        code: "price_answer_mismatch",
        message: `계산한 금액($${price.expected})과 정답 선택지($${price.keyValue})가 다릅니다.`,
        weight: 45,
      });
    } else if (price.explanationMismatch) {
      issues.push({
        code: "price_explanation_mismatch",
        message: "해설의 최종 금액이 계산한 금액과 다릅니다.",
        weight: 20,
      });
    }
    if (price.finalAmountSpoken) {
      issues.push({
        code: "price_final_amount_spoken",
        message: "대본이 최종 지불 금액을 그대로 말해 계산할 필요가 없습니다.",
        weight: 10,
      });
    }
  }

  // 6) 그림 불일치: 선택지는 그림 속 라벨 ①~⑤
  if (/그림 불일치/.test(q.question_type ?? "") && choices.join("") !== CIRCLED.join("")) {
    issues.push({
      code: "figure_labels",
      message: "그림 불일치 문항의 선택지는 ①~⑤ 라벨이어야 합니다.",
      weight: 30,
    });
  }

  // 7) 지시문의 화자 = 대본에서 실제로 그 말을 한 화자
  const ins = q.instruction ?? "";
  const reqMatch = ins.match(/(남자|여자)가\s*(남자|여자)에게\s*(부탁|제안)/);
  if (reqMatch) {
    const asker = personCode(reqMatch[1]!);
    const actual =
      reqMatch[3] === "부탁"
        ? speakerOfQuote(q.segments, q.request_expression) ?? findRequestSpeaker(q.segments)
        : speakerOfQuote(q.segments, q.suggestion_expression) ?? findSuggestionSpeaker(q.segments);
    if (asker && actual && asker !== actual) {
      issues.push({
        code: "instruction_speaker_mismatch",
        message: `지시문은 ${reqMatch[1]}가 ${reqMatch[3]}했다고 묻지만 대본에서는 상대가 ${reqMatch[3]}합니다.`,
        weight: 35,
      });
    }
  }
  const lastMatch = ins.match(/(남자|여자)가 한 마지막 말/);
  if (lastMatch) {
    const spoken = (q.segments ?? []).filter((s) => s.speaker === "M" || s.speaker === "W");
    const last = spoken[spoken.length - 1]?.speaker;
    if (last && personCode(lastMatch[1]!) !== last) {
      issues.push({
        code: "instruction_speaker_mismatch",
        message: `지시문은 ${lastMatch[1]}의 마지막 말을 묻지만 마지막 발화자가 다릅니다.`,
        weight: 35,
      });
    }
  }
  const jobMatch = ins.match(/(남자|여자)의 직업/);
  if (jobMatch && (q.job_clues?.length ?? 0) >= 2) {
    const actual = majoritySpeakerOfQuotes(q.segments, q.job_clues ?? []);
    if (actual && personCode(jobMatch[1]!) !== actual) {
      issues.push({
        code: "instruction_speaker_mismatch",
        message: `지시문은 ${jobMatch[1]}의 직업을 묻지만 직업 단서는 상대가 말합니다.`,
        weight: 35,
      });
    }
  }

  // 8) 격려: 마지막 말이 상대가 아닌 자기 자신에게 하는 말("I can do it")이면 격려가 아님
  const answer = choices[q.correct_answer - 1] ?? "";
  if (typeId === 4 && !isHighSchoolListeningGrade(gradeLevel) && /격려/.test(answer)) {
    const spoken = (q.segments ?? []).filter((s) => s.speaker === "M" || s.speaker === "W");
    const lastSeg = spoken[spoken.length - 1];
    const lastText = lastSeg?.text ?? "";
    // 격려하는 사람이 앞에서 자기가 긴장된다고 말했다면 역할이 뒤바뀐 대본
    const lastSpeakerWasNervous = spoken
      .slice(0, -1)
      .some(
        (s) =>
          s.speaker === lastSeg?.speaker &&
          /\bI(?:'m| am| feel| still feel)\s+(?:so |really |very |a little |still |a bit )*(?:nervous|scared|worried|afraid|anxious)\b/i.test(
            s.text
          )
      );
    if (
      (/\bI\s+(?:can|will|'ll)\b/i.test(lastText) && !/\byou\b/i.test(lastText)) ||
      lastSpeakerWasNervous
    ) {
      issues.push({
        code: "type4_encourage_self",
        message: "격려가 정답인데 마지막 말이 상대를 격려하는 말이 아니거나, 긴장한 사람이 격려하고 있습니다.",
        weight: 30,
      });
    }
  }

  // 9) 선택지 언어 섞임
  if (!labelOnly) {
    const langs = choices.map(choiceLanguage).filter((l) => l !== "neutral");
    const expected = expectedChoiceLanguage(typeId, gradeLevel);
    if (langs.includes("ko") && langs.includes("en")) {
      issues.push({ code: "choice_language_mixed", message: "선택지에 한국어와 영어가 섞여 있습니다.", weight: 10 });
    } else if (expected && langs.length > 0 && langs.every((l) => l !== expected)) {
      issues.push({
        code: "choice_language",
        message: expected === "ko" ? "이 유형의 선택지는 한국어여야 합니다." : "이 유형의 선택지는 영어여야 합니다.",
        weight: 10,
      });
    }
  }

  return issues;
}
