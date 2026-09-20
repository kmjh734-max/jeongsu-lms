import { VALIDATION_PASS_SCORE } from "@/lib/question-generator/constants";
import type {
  GeneratedQuestionPayload,
  QuestionTypeOption,
  QuestionValidation,
} from "@/lib/question-generator/types";

/** 지문에서 낱말만 뽑아 센다(밑줄 기호·문장부호는 뺀다) */
function passageWords(text: string): string[] {
  return (text || "")
    .replace(/<\/?u>/g, " ")
    .replace(/[ⓐ-ⓩ①-⑳]/g, " ")
    .toLowerCase()
    .replace(/[^a-z' ]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

/**
 * 어법·어휘는 지문을 다시 쓰면 안 된다(선생님 지적 2026-09-20: "어법 개수가 지문을 재진술한다").
 * 밑줄 자리의 낱말만 바뀌어야 하므로, 원문 낱말이 그대로 남은 비율로 가린다.
 * 재진술을 켜고 만든 문항은 이 검사를 건너뛴다.
 */
export function passageKeptRatio(original: string, modified: string): number {
  const a = passageWords(original);
  const b = passageWords(modified);
  if (a.length < 20 || b.length < 20) return 1;
  const bag = new Map<string, number>();
  for (const w of a) bag.set(w, (bag.get(w) ?? 0) + 1);
  let same = 0;
  for (const w of b) {
    const n = bag.get(w) ?? 0;
    if (n > 0) {
      same++;
      bag.set(w, n - 1);
    }
  }
  return same / b.length;
}

/** 어법·어휘에서 지문을 그대로 두었다고 볼 최저선(밑줄 6곳이 바뀌어도 넘는 값) */
export const PASSAGE_KEEP_MIN = 0.9;

/** 로컬 형태 검수만 (AI 검수 호출 없음 — 속도 우선) */
export function validateGeneratedQuestion(opts: {
  passage: string;
  option: QuestionTypeOption;
  question: GeneratedQuestionPayload;
  /** 지문 재진술을 켜고 만든 문항이면 원문 대조를 건너뛴다 */
  allowParaphrase?: boolean;
}): QuestionValidation {
  const q = opts.question;
  const option = opts.option;
  const warnings: string[] = [];
  let score = 100;

  if (option.isObjective) {
    const slotInPassage =
      option.type === "sentence_insertion" ||
      option.type === "irrelevant_sentence" ||
      (option.type === "vocabulary" && option.aingkaCode === "어휘추론") ||
      // 어법 추론: 밑줄 ①~⑤가 지문 안에 있고 아래 보기는 없다
      (option.type === "grammar" &&
        (option.aingkaCode === "어법추론" || option.aingkaCode === "어법모두고르기"));

    if (slotInPassage) {
      if (option.type === "grammar") {
        const marks = (q.passageModified ?? "").match(/[①②③④⑤ⓐⓑⓒⓓⓔ]/g) ?? [];
        if (new Set(marks).size < 5) {
          warnings.push("지문에 밑줄 번호 5개가 없습니다.");
          score -= 40;
        }
      }
      if (
        option.type === "sentence_insertion" &&
        !(q.questionText || "").trim()
      ) {
        warnings.push("주어진 문장이 없습니다.");
        score -= 40;
      }
    } else if (!q.choices || q.choices.length !== 5) {
      warnings.push("선택지 개수가 5개가 아닙니다.");
      score -= 40;
    }

    const nums = new Set((q.choices ?? []).map((c) => c.number));
    if (!slotInPassage && nums.size !== (q.choices?.length ?? 0)) {
      warnings.push("선택지 번호가 중복되었습니다.");
      score -= 15;
    }
    if (!slotInPassage) {
      const empty = (q.choices ?? []).some((c) => !c.text.trim());
      if (empty) {
        warnings.push("빈 선택지가 있습니다.");
        score -= 20;
      }
    }

    // 개수형: 1개~5개 고정 검증
    if (
      (option.type === "grammar" && option.aingkaCode === "어법개수") ||
      (option.type === "vocabulary" && option.aingkaCode === "어휘개수")
    ) {
      const texts = (q.choices ?? []).map((c) => c.text.trim());
      if (texts.join("|") !== "1개|2개|3개|4개|5개") {
        warnings.push("개수 보기가 1개~5개 형식이 아닙니다.");
        score -= 40;
      }
    }
  }

  // 어법·어휘: 밑줄 자리 말고 지문을 고쳐 쓰면 버린다
  if (
    !opts.allowParaphrase &&
    (option.type === "grammar" || option.type === "vocabulary") &&
    (q.passageModified ?? "").trim()
  ) {
    const kept = passageKeptRatio(opts.passage, q.passageModified ?? "");
    if (kept < PASSAGE_KEEP_MIN) {
      warnings.push(`지문을 고쳐 썼습니다(원문 유지 ${Math.round(kept * 100)}%). 원문 그대로 다시 만듭니다.`);
      score -= 45;
    }
  }

  if (!q.instruction.trim()) {
    warnings.push("발문이 없습니다.");
    score -= 30;
  }
  if (!q.explanation.trim()) {
    warnings.push("해설이 없습니다.");
    score -= 25;
  }
  if (q.type !== option.type) {
    warnings.push("요청 유형과 생성 유형이 다릅니다.");
    score -= 30;
  }

  // 요지인데 요약문완성(빈칸·…… 쌍)으로 나온 경우 폐기
  if (option.type === "summary_mcq") {
    const blob = [
      q.questionText,
      q.instruction,
      ...(q.choices ?? []).map((c) => c.text),
    ]
      .join("\n")
      .toLowerCase();
    const looksLikeSummaryBlank =
      /요약문/.test(blob) ||
      (/\(a\)/.test(blob) && /\(b\)/.test(blob)) ||
      (q.choices ?? []).some((c) => /……|\.{2,}\s*\S+\s*\.{2,}|…{2,}/.test(c.text));
    if (looksLikeSummaryBlank) {
      warnings.push("요약문완성 형식이 감지되어 요지 문항으로 사용할 수 없습니다.");
      score -= 80;
    }
  }

  return {
    singleCorrectAnswer: true,
    answerMatchesExplanation: Boolean(q.explanation.trim()),
    evidenceExists: true,
    ambiguityRisk: score < 70 ? "high" : "low",
    difficultyMatch: true,
    grammarChecked: true,
    overallScore: Math.max(0, Math.min(100, score)),
    warnings,
    typeMatch: q.type === option.type,
  };
}

export function shouldRegenerate(v: QuestionValidation): boolean {
  if (v.overallScore < VALIDATION_PASS_SCORE) return true;
  if (!v.answerMatchesExplanation) return true;
  if (v.typeMatch === false) return true;
  if (!v.singleCorrectAnswer) return true;
  return false;
}
