import type { ExamTypeTemplate } from "@/lib/listening/exam-types";
import { QUALITY_PASS_THRESHOLD } from "@/lib/listening/prompts/qualityCheckPrompt";
import type { GeneratedListeningQuestion } from "@/lib/listening/types";

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
      });
    }
    if (turnCount < 5 || turnCount > 7) {
      issues.push({
        code: "type1_sentences",
        message: `1번 유형은 5~7문장이어야 합니다 (${turnCount}개).`,
      });
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

  if (typeId === 14 && !q.question_text?.trim()) {
    issues.push({ code: "type14_table", message: "14번 유형은 표(question_text)가 필요합니다." });
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
