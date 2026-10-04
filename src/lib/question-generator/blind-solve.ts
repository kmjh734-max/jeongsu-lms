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
Also judge every CHOICE as written (선생님 기준: 객관식 보기가 어색하면 안 된다). List in "awkward" the number of any choice that is unnatural or ungrammatical English (or unnatural Korean), or that rewords the passage so loosely that a careful student cannot tell whether it is true or false (e.g. "quickly add up" turned into "brief paragraphs accumulate quickly"; "one evening" turned into "nightly"). Plain wrong distractors that are clearly wrong are fine.
Also list in "rareWords" any word in the choices (or count-item statements) that is NOT in the passage and that a typical Korean 고등학생 preparing for 수능 would not know: specialist or technical terms (pigmentation, hominid, locomotion, acreage), GRE-style words (rapport, affinity, substantive, toil), or a common word used in an unusual sense (stock meaning "cardboard"). Normal 수능 vocabulary (recognition, reliance, exposure, sustain, evolutionary) is fine — do not list it.
Return ONE JSON object: {"answer":<choice number, or the count>,"count":<count items only>,"alsoDefensible":[<other answers a careful student could defend, or empty>],"debatable":<true if your answer depends on a reading a reasonable student could make differently>,"awkward":[<choice numbers, or empty>],"rareWords":[<words, or empty>],"reason":"<Korean, one or two sentences>"}
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
        // 객관식도 깊이 본다 — low로는 애매한 보기(내용불일치·문장삽입)를 놓쳤다(7차 시험 2026-10-04)
        "medium",
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
  // 보기가 어색하거나 참·거짓이 애매하게 바꿔 쓴 것이면 다시 만든다(선생님 기준: 객관식 보기가 어색하면 안 된다)
  const awkward = (Array.isArray(raw.awkward) ? raw.awkward : []).map(Number).filter((n) => Number.isInteger(n) && n >= 1);
  if (mcq && awkward.length) return { verdict: "drop", answer, reason: `보기 ${awkward.join("·")}번이 어색하거나 애매함 — ${reason}` };
  /*
   * 낯선 낱말(선생님 말 2026-10-04: 「너무 낯선 단어들이 포함되지 않도록」). 단어장 표는 수능 어휘보다 좁아
   * 코드만으로는 정상 수능 단어까지 걸린다. 풀어 보는 모델이 고등학생에게 낯선 말만 골라낸다.
   */
  const passageLower = String(opts.passage ?? "").toLowerCase();
  const rare = (Array.isArray(raw.rareWords) ? raw.rareWords : [])
    .map((w) => String(w).trim())
    .filter((w) => w && !passageLower.includes(w.toLowerCase()));
  if (rare.length) return { verdict: "drop", answer, reason: `낯선 낱말(${rare.slice(0, 5).join(", ")})을 고등학생이 아는 말로 바꿔 쓴다 — ${reason}` };
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
3. Do NOT look for other possible answers — the teacher judges alternative answers. Judge only whether the keyed answer itself is right.
4. Treat these as keyWrong too: the summary sentence is ungrammatical or meaningless once the answer is filled in; the <보기> words cannot produce the answer (missing or extra words, wrong forms for the stated 어형 rule); a 지칭 answer is a pronoun or determiner instead of the noun referred to; a 특정표현 answer does not MEAN the same as the underlined expression (only a related action, a cause/result, or the words right after it); the passage or question text is garbled, truncated, or leaks the answer; the item invents content the passage does not have.
4-1. 특정표현 (the instruction asks what an underlined expression means, answered with a phrase from the passage): put the keyed phrase IN PLACE OF the underlined expression and reread that sentence. keyWrong = true unless the sentence keeps the same meaning and scope — not broader (covers more cases than the underline), not narrower, not a different subject or object (what "ones"/"them" refers to must match), not a cause, result, example or the words right after the underline. Be strict: when in doubt, keyWrong = true.
5. Check the EXPLANATION (Korean). It is wrong if it claims a word changes form (A → B) when the <보기> already gives B, or names a change for a word that is not in <보기>, or leaves out a word whose form the answer actually changes (have → has, opinion → opinions); if it contains a generic sentence that is not about THIS passage; or if it uses a wrong grammar term, wrong referent, or wrong reason. If the key is right but the explanation is wrong, write a corrected one in "fixedExplanation" (Korean, 평서형 "~다", same shape and length as the original). Otherwise leave it out. Wording style alone is not wrong.
Return ONE JSON object: {"keyWrong":<true|false>,"fixedExplanation":<optional Korean string>,"reason":"<Korean, one or two sentences>"}`;

/*
 * 다른 정답은 찾지 않는다(선생님 결정 2026-10-04: 「다른 정답은 사용자가 생각하게 해도 괜찮아,
 * 그런 건 인간이 할 영역」). 정답 자체가 맞는지와 해설만 본다. 다른 답을 찾느라 쓰던 생각도 줄어 값이 내려간다.
 */
export async function checkSubjectiveQuestion(opts: {
  passage: string;
  payload: GeneratedQuestionPayload;
  /** 유형 코드(aingkaCode) — 다른 답을 어떻게 다룰지 정한다 */
  code?: string | null;
}): Promise<BlindSolveResult> {
  const { payload } = opts;
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
        // 특정표현의 「같은 뜻인가」도 미묘해 깊이 본다(선생님 결정 2026-10-04: 맞는 지문에서만 내고 아니면 다른 유형으로)
        (/어법|오류|수정/.test(String(payload.instruction ?? "")) || opts.code === "특정표현의미서술" ? "medium" : "low"),
      preferredModels: [SOLVE_MODEL],
      cacheKey: "qg-solve-subjective",
    })) as Record<string, unknown>;
  } catch {
    return { verdict: "pass", answer: null, reason: "확인 호출 실패 — 통과로 둔다" };
  }
  const reason = compact(raw.reason, 300);
  if (raw.keyWrong === true) return { verdict: "drop", answer: null, reason: `정답이 맞지 않음 — ${reason}` };
  // 해설만 틀렸으면 고쳐서 살린다(뜻 검수의 fix와 같은 잣대)
  const fixedExplanation = typeof raw.fixedExplanation === "string" ? raw.fixedExplanation.trim() : "";
  if (fixedExplanation.length >= 10 && !/[A-Za-z]{40,}/.test(fixedExplanation) && fixedExplanation !== payload.explanation) {
    payload.explanation = fixedExplanation;
    return { verdict: "pass", answer: null, reason: `해설을 고침 · ${reason}`, fixed: ["explanation"] };
  }
  return { verdict: "pass", answer: null, reason };
}
