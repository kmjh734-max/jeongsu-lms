/**
 * 정답을 가리고 직접 풀어 보는 검수.
 *
 * 선생님 결정(2026-10-04): 「조건부도 나오지 않게 완벽을 추구하자」.
 * 정수학원 세 작업의 조건부·불량 가운데 풀어 봐야 아는 것(두 보기가 다 맞음, 개수가 읽기에 따라
 * 갈림, 정답이 흐린 주제·제목)은 정답과 해설을 함께 보여 주는 검수가 자주 놓쳤다. 해설을 읽으면
 * 그 풀이에 끌려간다. 그래서 학생이 받는 것(지문·발문·보기)만 주고 풀게 한 뒤, 고른 답이 정답과
 * 다르거나 다른 답도 맞다고 하면 버리고 다시 만든다.
 *
 * 객관식(보기 4개 이상, 정답이 번호)과, 보기 없이 개수를 숫자로 쓰는 개수 문항(일치개수 등)을 본다.
 * 다른 서술형은 답이 글이라 이 방식으로 비교할 수 없다.
 * 끄려면 QG_BLIND_SOLVE=off. 호출이 실패하면 통과로 둔다.
 */
import { questionGeneratorChatJsonWithRetry } from "@/lib/question-generator/openai";
import type { GeneratedQuestionPayload } from "@/lib/question-generator/types";

const SOLVE_MODEL =
  process.env.OPENAI_MODEL_QG_SOLVE?.trim() || process.env.OPENAI_MODEL_QG_REVIEW?.trim() || "gpt-5.6-terra";

export function blindSolveEnabled(): boolean {
  return (process.env.QG_BLIND_SOLVE ?? "on").trim().toLowerCase() !== "off";
}

function hasChoices(payload: GeneratedQuestionPayload): boolean {
  return Array.isArray(payload.choices) && payload.choices.length >= 4;
}

function isCountItem(payload: GeneratedQuestionPayload): boolean {
  return (
    !hasChoices(payload) &&
    /개수/.test(String(payload.instruction ?? "")) &&
    /^\s*\d+\s*(개)?\s*$/.test(String(payload.correctAnswer ?? ""))
  );
}

export function blindSolvable(payload: GeneratedQuestionPayload): boolean {
  if (isCountItem(payload)) return true;
  const n = Number(payload.correctAnswer);
  return hasChoices(payload) && Number.isInteger(n) && n >= 1;
}

const SOLVE_SYSTEM = `You are the strongest student in a Korean high-school English class, taking an exam. You see exactly what students see: the passage, the instruction, and the choices. Solve the item from the passage alone.
Then think like a student filing a formal objection (이의제기): is there another answer a careful student could defend with evidence from the passage? For count items (개수), judge every statement/spot one by one and note any whose truth depends on how it is read.
If the item has no choices and asks for a count, "answer" is the count and "alsoDefensible" lists other counts a careful student could defend.
For count items (개수), also give "count": the number you actually counted, and list other defensible counts in "alsoDefensible" as counts.
Return ONE JSON object: {"answer":<choice number, or the count>,"count":<count items only>,"alsoDefensible":[<other answers a careful student could defend, or empty>],"debatable":<true if your answer depends on a reading a reasonable student could make differently>,"reason":"<Korean, one or two sentences>"}
Be honest, not generous: list an answer in alsoDefensible only if you could argue it in front of a teacher with passage evidence. Normal hard items with one clearly best answer are NOT debatable.`;

function compact(text: unknown, max = 2600): string {
  const s = String(text ?? "").replace(/\s+/g, " ").trim();
  return s.length > max ? `${s.slice(0, max)} …` : s;
}

export type BlindSolveResult = {
  verdict: "pass" | "drop";
  answer: number | null;
  reason: string;
  /** 서술형 확인이 고친 칸(해설) */
  fixed?: string[];
};

export async function blindSolveQuestion(opts: {
  passage: string;
  payload: GeneratedQuestionPayload;
}): Promise<BlindSolveResult> {
  const { payload } = opts;
  const mcq = hasChoices(payload);
  const unit = mcq ? "번" : "개";
  const key = Number(String(payload.correctAnswer ?? "").replace(/[^0-9]/g, ""));
  const shown = payload.passageModified?.trim() ? payload.passageModified : opts.passage;
  const choices = mcq
    ? (payload.choices ?? []).map((c) => `${"①②③④⑤⑥⑦"[(c.number ?? 1) - 1] ?? c.number} ${c.text}`).join("\n")
    : "";
  const user = [
    `INSTRUCTION: ${compact(payload.instruction, 400)}`,
    `\nPASSAGE (<u>…</u> = underline, ___ = blank):\n${compact(shown)}`,
    payload.questionText ? `\nQUESTION TEXT:\n${compact(payload.questionText, 1600)}` : "",
    mcq ? `\nCHOICES:\n${choices}` : "\n(No choices: write the count as the answer.)",
  ]
    .filter(Boolean)
    .join("\n");

  let raw: Record<string, unknown>;
  try {
    raw = (await questionGeneratorChatJsonWithRetry({
      system: SOLVE_SYSTEM,
      user,
      temperature: 0,
      maxTokens: 2000,
      /*
       * 개수 문항은 깊이 생각하게 한다. 2026-10-04 시험: low로는 같은 어법개수 문항을 풀 때마다
       * 개수가 달라졌고(멀쩡한 것을 버리고 불량을 통과), medium은 개수 문항 불량·조건부 5개를
       * 모두 잡았다. 다른 유형은 low로도 멀쩡한 18개를 하나도 버리지 않았다.
       */
      reasoningEffort:
        (process.env.QG_SOLVE_EFFORT as "low" | "medium" | undefined) ||
        (/개수/.test(String(payload.instruction ?? "")) ? "medium" : "low"),
      preferredModels: [SOLVE_MODEL],
      cacheKey: "qg-solve",
    })) as Record<string, unknown>;
  } catch {
    return { verdict: "pass", answer: null, reason: "풀기 호출 실패 — 통과로 둔다" };
  }

  /*
   * 보기가 「1개 … 5개」인 개수 문항은 모델이 보기 번호와 개수를 헷갈린다(시험에서 「틀린 것은
   * 4개」라 쓰고 답은 3번). 센 개수를 따로 받아 그 개수의 보기 번호로 바꾼다.
   */
  const countChoice = new Map<number, number>();
  if (mcq) {
    for (const c of payload.choices ?? []) {
      const m = String(c.text).match(/^\s*(\d+)\s*개/);
      if (m) countChoice.set(Number(m[1]), Number(c.number));
    }
  }
  const countMode = mcq && countChoice.size === (payload.choices?.length ?? 0) && Number.isInteger(Number(raw.count));
  const toChoice = (n: number) => (countMode ? countChoice.get(n) ?? -1 : n);

  const answer = countMode ? toChoice(Number(raw.count)) : Number(raw.answer);
  const reason = compact(raw.reason, 300);
  const also = (Array.isArray(raw.alsoDefensible) ? raw.alsoDefensible : [])
    .map((n) => toChoice(Number(n)))
    .filter((n) => Number.isInteger(n) && n > 0 && n !== key);
  if (!Number.isInteger(answer)) return { verdict: "pass", answer: null, reason: reason || "답을 못 읽어 통과" };
  if (answer !== key) return { verdict: "drop", answer, reason: `직접 풀면 ${answer}${unit} — ${reason}` };
  if (also.length) return { verdict: "drop", answer, reason: `${also.join("·")}${unit}도 답이 될 수 있음 — ${reason}` };
  if (raw.debatable === true) return { verdict: "drop", answer, reason: `읽기에 따라 답이 갈림 — ${reason}` };
  return { verdict: "pass", answer, reason };
}

/*
 * 서술형 확인(2026-10-04). 정수학원 273문항 대조에서 조건부 23개 중 14개, 불량 2개가 모두
 * 서술형이었다 — 다른 어순·다른 본문 표현도 답이 되거나, 맞는 자리를 틀렸다고 한 오류 수정.
 * 선생님 지시: 허용답으로 살리지 말고 답이 하나뿐인 문항만 남긴다. 그래서 다른 답이 나오면 버린다.
 * 답이 글이라 정답을 가리고 맞춰 볼 수 없어서, 정답을 보여 주고 「이 답이 맞는지, 다른 답도
 * 되는지」를 묻는다.
 */
export function subjectiveCheckable(payload: GeneratedQuestionPayload): boolean {
  if (hasChoices(payload) || isCountItem(payload)) return false;
  const key = payload.correctAnswer;
  return typeof key === "string" && key.trim().length > 0;
}

const SUBJECTIVE_SYSTEM = `You check one subjective (서술형) item of a Korean high-school English exam. You see the passage, the instruction with its <조건>, the question text, and the KEYED answer.
1. Solve the item yourself first, following every condition.
2. Decide whether the keyed answer is correct and satisfies every stated condition (word count, "본문에서 찾아", given words used exactly, 어형 변화 rule, the Korean translation). For error-correction items, check that every spot the key calls wrong is really ungrammatical under every reading and that every other spot is correct.
3. Find any OTHER answer a fair teacher would have to mark correct: another phrase from the passage that fits the blank in grammar and meaning, another word order allowed by the given words and the translation, another valid correction of a marked error. Ignore differences only in punctuation or capitalization.
4. Treat these as keyWrong too: the summary sentence is ungrammatical or meaningless once the answer is filled in; the <보기> words cannot produce the answer (missing or extra words, wrong forms for the stated 어형 rule); a 지칭 answer is a pronoun or determiner instead of the noun referred to; a 특정표현 answer does not MEAN the same as the underlined expression (only a related action, a cause/result, or the words right after it); the passage or question text is garbled, truncated, or leaks the answer; the item invents content the passage does not have.
5. Check the EXPLANATION (Korean). It is wrong if it claims a word changes form (A → B) when the <보기> already gives B, or names a change for a word that is not in <보기>; if it contains a generic sentence that is not about THIS passage; or if it uses a wrong grammar term, wrong referent, or wrong reason. If the key is right but the explanation is wrong, write a corrected one in "fixedExplanation" (Korean, 평서형 "~다", same shape and length as the original). Otherwise leave it out. Wording style alone is not wrong.
Return ONE JSON object: {"keyWrong":<true|false>,"otherValid":[<other fully correct answers, or empty>],"fixedExplanation":<optional Korean string>,"reason":"<Korean, one or two sentences>"}
Be strict and concrete: list an answer in otherValid only if you are sure it is fully correct under all conditions.`;

/*
 * 다른 답이 나왔을 때 유형마다 다르게 한다(선생님 결정 2026-10-04).
 *  - 요약문 빈칸(본문에서 찾기): 본문의 비슷한 말도 들어가면 버리지 않고 정답지에 함께 적는다.
 *  - 제시어 배열·요약문 영작: 어순·형태가 여럿 되는 것은 선생님이 확인할 일 — 원문 그대로를 정답으로 두고 넘어간다.
 *  - 그 밖(특정표현·어법 오류 수정 등): 다른 답이 되면 버리고 다시 만든다.
 */
type OtherAnswerPolicy = "list" | "ignore" | "drop";
function otherAnswerPolicy(code: string | null | undefined): OtherAnswerPolicy {
  if (/요약문빈칸[23]단어/.test(code ?? "")) return "list";
  if (/제시어배열|요약문빈칸영작/.test(code ?? "")) return "ignore";
  return "drop";
}

export async function checkSubjectiveQuestion(opts: {
  passage: string;
  payload: GeneratedQuestionPayload;
  /** 유형 코드(aingkaCode) — 다른 답을 어떻게 다룰지 정한다 */
  code?: string | null;
}): Promise<BlindSolveResult> {
  const { payload } = opts;
  const policy = otherAnswerPolicy(opts.code);
  const shown = payload.passageModified?.trim() ? payload.passageModified : opts.passage;
  const user = [
    `INSTRUCTION: ${compact(payload.instruction, 400)}`,
    `\nPASSAGE (<u>…</u> = underline):\n${compact(shown)}`,
    payload.questionText ? `\nQUESTION TEXT:\n${compact(payload.questionText, 1600)}` : "",
    `\nKEYED ANSWER: ${compact(payload.correctAnswer, 600)}`,
    `\nEXPLANATION (Korean):\n${compact(payload.explanation, 1600)}`,
  ]
    .filter(Boolean)
    .join("\n");

  let raw: Record<string, unknown>;
  try {
    raw = (await questionGeneratorChatJsonWithRetry({
      system: SUBJECTIVE_SYSTEM,
      user,
      temperature: 0,
      maxTokens: 2000,
      // 오류 수정은 자리마다 따져야 해서 깊이 생각하게 한다(개수 문항과 같은 까닭)
      reasoningEffort:
        (process.env.QG_SOLVE_EFFORT as "low" | "medium" | undefined) ||
        (/어법|오류|수정/.test(String(payload.instruction ?? "")) ? "medium" : "low"),
      preferredModels: [SOLVE_MODEL],
      cacheKey: "qg-solve-subjective",
    })) as Record<string, unknown>;
  } catch {
    return { verdict: "pass", answer: null, reason: "확인 호출 실패 — 통과로 둔다" };
  }
  const reason = compact(raw.reason, 300);
  const others = (Array.isArray(raw.otherValid) ? raw.otherValid : [])
    .map((x) => String(x).trim())
    .filter((x) => x && x.toLowerCase().replace(/[^a-z0-9]/g, "") !== String(payload.correctAnswer).toLowerCase().replace(/[^a-z0-9]/g, ""));
  if (raw.keyWrong === true) return { verdict: "drop", answer: null, reason: `정답이 맞지 않음 — ${reason}` };
  if (others.length && policy === "drop") {
    return { verdict: "drop", answer: null, reason: `다른 답도 됨(${others.slice(0, 2).join(" / ")}) — ${reason}` };
  }
  const fixed: string[] = [];
  // 해설만 틀렸으면 고쳐서 살린다(뜻 검수의 fix와 같은 잣대)
  const fixedExplanation = typeof raw.fixedExplanation === "string" ? raw.fixedExplanation.trim() : "";
  if (fixedExplanation.length >= 10 && !/[A-Za-z]{40,}/.test(fixedExplanation) && fixedExplanation !== payload.explanation) {
    payload.explanation = fixedExplanation;
    fixed.push("explanation");
  }
  // 요약문 빈칸: 본문의 다른 말도 들어가면 정답지(해설 첫 줄)에 함께 적고 허용답에도 넣는다
  if (others.length && policy === "list") {
    const list = others.slice(0, 3);
    payload.acceptableAnswers = [...new Set([...(payload.acceptableAnswers ?? []), ...list])];
    payload.explanation = `다른 정답: ${list.join(" / ")}\n${payload.explanation}`;
    fixed.push("acceptableAnswers");
  }
  return fixed.length
    ? { verdict: "pass", answer: null, reason: `${fixed.includes("explanation") ? "해설을 고침 · " : ""}${fixed.includes("acceptableAnswers") ? "다른 정답을 적음 · " : ""}${reason}`, fixed }
    : { verdict: "pass", answer: null, reason };
}
