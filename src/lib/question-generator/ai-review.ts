/**
 * 뜻을 읽는 검수 — 규칙 검수가 못 보는 것을 모델이 본다.
 *
 * 선생님 결정(2026-10-03): 「AI 비용은 있으니 다 만들고 검수하는 기능을 넣자」.
 * 세 작업(100·382·202문항)을 전부 읽어 보니, 규칙으로 못 잡는 불량은 모두 뜻을 읽어야
 * 아는 것이었다 — 두 보기가 같은 뜻(복수 정답), 요약문이 비문이 되는 빈칸, 원문 표현을
 * 오류라 지목한 어법, 지칭의 답이 대명사, 「맞음」 처리한 밑줄의 뜻이 틀린 것.
 *
 * 판정은 셋이다.
 *  - pass: 그대로 저장
 *  - fix : 본문·보기는 멀쩡하고 정답 번호나 해설만 틀린 것 — 그 둘만 고쳐 저장
 *  - drop: 버리고 다시 만든다
 *
 * 값: gpt-5.6-sol 기준 문항당 약 11원(입력 1,200·출력 150토큰). 생성 원가의 약 25%.
 * 끄려면 QG_AI_REVIEW=off.
 */
import { questionGeneratorChatJsonWithRetry } from "@/lib/question-generator/openai";
import type { GeneratedQuestionPayload, QuestionTypeOption } from "@/lib/question-generator/types";

export type ReviewVerdict = "pass" | "fix" | "drop";

export type ReviewResult = {
  verdict: ReviewVerdict;
  reason: string;
  /** fix일 때 고친 칸 이름 */
  fixed: string[];
};

const REVIEW_MODEL = process.env.OPENAI_MODEL_QG_REVIEW?.trim() || "gpt-5.6-sol";

export function aiReviewEnabled(): boolean {
  return (process.env.QG_AI_REVIEW ?? "on").trim().toLowerCase() !== "off";
}

const REVIEW_SYSTEM = `You are a senior Korean high-school English exam editor doing FINAL QA on one generated item. Be strict but fair: drop only real defects, not stylistic taste.
Return ONE JSON object: {"verdict":"pass"|"fix"|"drop","reason":"<Korean, one or two sentences>","fixedCorrectAnswer":<optional>,"fixedExplanation":<optional Korean string>}

DROP when any of these holds:
1. More than one choice is a valid answer (two choices mean the same thing), or no choice is correct, or the keyed answer is wrong.
2. The item asks about something the passage does not support, or the passage/choices contain leaked markup, answer hints, or a truncated/garbled sentence.
3. Grammar items (어법): a spot marked as wrong is actually grammatical (e.g., a plain past tense, "The objective is completing", a word that is in the ORIGINAL passage unchanged), or a spot marked as correct is actually ungrammatical, or the correction equals the underlined text.
4. Vocabulary items (어휘): the "wrong" word is actually acceptable in context, or a "correct" word is wrong in context.
5. Summary/blank writing (요약문·서술형): the summary sentence is ungrammatical or meaningless once the answer is filled in; the answer does not satisfy the stated <조건> (word counts, "본문에서 찾아", "원형 제시", "모두 한 번씩"); the <보기> cannot produce the answer; or the answer to a 지칭 item is a pronoun/determiner rather than the noun referred to.
6. Insertion/order/irrelevant items: the keyed position/order is not the only coherent one.
7. Implied-meaning (함축) items: the keyed choice does not capture the contextual meaning, or another choice does equally well.

FIX (not drop) only when the body and choices are fine and ONLY the answer key or the explanation is wrong, and you are certain of the correct value. Put the corrected value in fixedCorrectAnswer (same format as the given correctAnswer: integer 1-5 for MCQ, or the same string format for subjective) and/or fixedExplanation (Korean, 평서형 "~다", same shape as the original explanation).

PASS otherwise. Minor wording issues in the explanation are not defects. Do not drop because distractors are easy. Do not rewrite the passage or choices.`;

function compact(text: unknown, max = 2400): string {
  const s = String(text ?? "").replace(/\s+/g, " ").trim();
  return s.length > max ? `${s.slice(0, max)} …` : s;
}

/**
 * 문항 하나를 검수한다. 모델이 못 답하면 pass로 둔다(검수 때문에 멀쩡한 문항을 잃지 않는다).
 */
export async function reviewGeneratedQuestion(opts: {
  passage: string;
  option: QuestionTypeOption;
  payload: GeneratedQuestionPayload;
  /** 지문을 바꿔 써도 되는 작업이면 원문 대조 기준을 느슨히 본다 */
  allowParaphrase?: boolean;
}): Promise<ReviewResult> {
  const { option, payload } = opts;
  const label = `${option.label ?? option.type}${option.aingkaCode ? ` (${option.aingkaCode})` : ""}`;
  const choices = Array.isArray(payload.choices) && payload.choices.length
    ? payload.choices.map((c) => `${"①②③④⑤⑥⑦"[(c.number ?? 1) - 1] ?? c.number} ${c.text}`).join("\n")
    : "(choices are in the passage or this is a subjective item)";

  const user = [
    `ITEM TYPE: ${label}`,
    `PARAPHRASE ALLOWED: ${opts.allowParaphrase ? "yes (passage may be reworded)" : "no (grammar/vocab items must keep the original wording except inside marked spots)"}`,
    `\nORIGINAL PASSAGE:\n${compact(opts.passage)}`,
    payload.passageModified && payload.passageModified.trim() !== opts.passage.trim()
      ? `\nMODIFIED PASSAGE (as shown to students; <u>…</u> = underline, ___ = blank):\n${compact(payload.passageModified)}`
      : "",
    `\nINSTRUCTION: ${compact(payload.instruction, 400)}`,
    payload.questionText ? `\nQUESTION TEXT:\n${compact(payload.questionText, 1200)}` : "",
    `\nCHOICES:\n${choices}`,
    `\nKEYED ANSWER: ${JSON.stringify(payload.correctAnswer)}`,
    `\nEXPLANATION (Korean):\n${compact(payload.explanation, 1600)}`,
  ]
    .filter(Boolean)
    .join("\n");

  let raw: Record<string, unknown>;
  try {
    raw = (await questionGeneratorChatJsonWithRetry({
      system: REVIEW_SYSTEM,
      user,
      temperature: 0,
      maxTokens: 700,
      reasoningEffort: "low",
      preferredModels: [REVIEW_MODEL],
      cacheKey: `qg-review:${option.type}`,
    })) as Record<string, unknown>;
  } catch {
    return { verdict: "pass", reason: "검수 호출 실패 — 규칙 검수만 통과한 상태로 둔다", fixed: [] };
  }

  const verdict = String(raw.verdict ?? "pass").toLowerCase();
  const reason = compact(raw.reason, 300) || "";
  if (verdict === "drop") return { verdict: "drop", reason, fixed: [] };
  if (verdict !== "fix") return { verdict: "pass", reason, fixed: [] };

  // fix: 정답 번호·해설만 받는다. 본문·보기는 절대 건드리지 않는다.
  const fixed: string[] = [];
  const nextAnswer = raw.fixedCorrectAnswer;
  if (nextAnswer !== undefined && nextAnswer !== null && nextAnswer !== "") {
    const isMcq = Array.isArray(payload.choices) && payload.choices.length >= 4;
    if (isMcq) {
      const n = Number(nextAnswer);
      if (Number.isInteger(n) && n >= 1 && n <= (payload.choices?.length ?? 5) && n !== Number(payload.correctAnswer)) {
        payload.correctAnswer = n;
        fixed.push("correctAnswer");
      }
    } else if (typeof nextAnswer === typeof payload.correctAnswer && String(nextAnswer).trim() !== String(payload.correctAnswer).trim()) {
      payload.correctAnswer = nextAnswer as GeneratedQuestionPayload["correctAnswer"];
      fixed.push("correctAnswer");
    }
  }
  const nextExpl = typeof raw.fixedExplanation === "string" ? raw.fixedExplanation.trim() : "";
  if (nextExpl && nextExpl.length >= 10 && !/[A-Za-z]{40,}/.test(nextExpl) && nextExpl !== payload.explanation) {
    payload.explanation = nextExpl;
    fixed.push("explanation");
  }
  if (fixed.length === 0) return { verdict: "pass", reason: reason || "고칠 값이 없어 통과", fixed };
  return { verdict: "fix", reason, fixed };
}
