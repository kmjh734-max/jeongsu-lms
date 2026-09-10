import { stemVerb } from "@/lib/lesson-materials/grammar-choice-v2/local-validators";
import type { LocalRejectCode } from "@/lib/lesson-materials/grammar-choice-v2/types";

const LONG_ALLOW = new Set([
  "INDIRECT_QUESTION_ORDER",
  "INVERSION_NEGATIVE",
  "INVERSION_ONLY",
  "INVERSION_COMPLEMENT",
  "CLEFT_IT_THAT",
  "DUMMY_IT_SUBJECT",
  "CORRELATIVE_BOTH_AND",
  "CORRELATIVE_NOT_ONLY_BUT_ALSO",
  "CAUSATIVE_PASSIVE",
  "VOICE_BE_MADE_TO",
  "PERCEPTION_COMPLEMENT",
  "PARALLEL_VERBS",
  "PARALLEL_CLAUSES",
  "PARALLEL_SHARED_AUXILIARY",
]);

function tokens(text: string): string[] {
  return text.trim().split(/\s+/).filter(Boolean);
}

export function validateMinimalPair(input: {
  pointCode: string;
  sourceSpan: string;
  distractor: string;
  sentence: string;
}): LocalRejectCode | null {
  const correct = input.sourceSpan.trim();
  const wrong = input.distractor.trim();
  if (!correct || !wrong) return "SOURCE_ANSWER_MISMATCH";
  if (wrong === "∅") return "FUNCTION_WORD_OR_ARGUMENT_DROPPED";

  const bad = `${correct} ${wrong}`.toLowerCase();
  if (
    bad.includes("one bringing about") ||
    bad.includes("yet we not allowing") ||
    bad.includes("we not allowing") ||
    bad.includes("not allow ourselves")
  ) {
    return "IMPLAUSIBLE_CLAUSE_REWRITE";
  }
  if (/\bnot allowing\b/i.test(wrong) && !/\bare not allowing\b/i.test(wrong)) {
    return "UNREALISTIC_LEARNER_ERROR";
  }

  const cTok = tokens(correct);
  const wTok = tokens(wrong);
  const limit = LONG_ALLOW.has(input.pointCode) ? 8 : 4;
  if (cTok.length > limit || wTok.length > limit) return "NON_MINIMAL_SPAN";
  if (cTok.length > 6 && input.sentence.trim() === correct) {
    return "IMPLAUSIBLE_CLAUSE_REWRITE";
  }
  if (
    correct.length > 40 &&
    wrong.length > 40 &&
    input.sentence.includes(correct) &&
    correct.split(/\s+/).length > 6
  ) {
    return "IMPLAUSIBLE_CLAUSE_REWRITE";
  }

  if (hasMultipleGrammarAxes(correct, wrong, input.pointCode)) {
    return "MULTI_AXIS_EDIT";
  }
  const diffs = alignedDiffs(cTok, wTok);
  if (diffs > 2 && !LONG_ALLOW.has(input.pointCode) && !isSingleAxisConstruction(correct, wrong)) {
    return "MULTI_AXIS_EDIT";
  }
  if (dropsArgument(cTok, wTok)) return "FUNCTION_WORD_OR_ARGUMENT_DROPPED";
  return null;
}

function norm(text: string): string {
  return text.trim().toLowerCase().replace(/[’]/g, "'");
}

function isSingleAxisConstruction(correct: string, wrong: string): boolean {
  const c = norm(correct);
  const w = norm(wrong);
  const pair = [c, w].sort().join("|");
  if (
    pair === "had|would have" ||
    pair === "were|would be" ||
    pair === "you have|do you have" ||
    pair === "things should|should things"
  ) {
    return true;
  }
  const cTok = tokens(c);
  const wTok = tokens(w);
  if (cTok.length === wTok.length && [...cTok].sort().join(" ") === [...wTok].sort().join(" ")) {
    return true;
  }
  return false;
}

function hasMultipleGrammarAxes(correct: string, wrong: string, pointCode: string): boolean {
  if (
    pointCode.startsWith("CONDITIONAL_") ||
    pointCode.startsWith("PARALLEL_") ||
    isSingleAxisConstruction(correct, wrong) ||
    isSingleVoiceOrParticipleAxis(correct, wrong, pointCode)
  ) {
    return false;
  }
  const c = tokens(norm(correct));
  const w = tokens(norm(wrong));
  if (c.length === 0 || w.length === 0) return false;
  if (c.length === w.length && [...c].sort().join(" ") === [...w].sort().join(" ")) return false;

  const functionWord = new Set([
    "a", "an", "the", "to", "of", "be", "am", "is", "are", "was", "were",
    "been", "being", "do", "does", "did", "not", "and", "or", "but",
  ]);
  const onlyC = extraTokens(c, w);
  const onlyW = extraTokens(w, c);
  const extras = [...onlyC, ...onlyW];
  if (extras.length < 2) return false;

  const functionChanges = extras.filter((t) => functionWord.has(t));
  const contentChanges = extras.filter((t) => !functionWord.has(t));
  const finite = new Set(["am", "is", "are", "was", "were"]);
  if (functionChanges.some((token) => finite.has(token)) && contentChanges.length > 0) {
    return true;
  }
  if (functionChanges.some((token) => finite.has(token)) && sharedOrderChanged(c, w) && contentChanges.length > 0) {
    return true;
  }
  if (functionChanges.length > 0 && contentChanges.length > 0 && sharedOrderChanged(c, w)) {
    return true;
  }
  return false;
}

function isSingleVoiceOrParticipleAxis(
  correct: string,
  wrong: string,
  pointCode: string
): boolean {
  if (
    !pointCode.startsWith("VOICE_") &&
    !pointCode.includes("PARTICIPLE") &&
    !pointCode.startsWith("PASSIVE_")
  ) {
    return false;
  }
  const c = tokens(norm(correct));
  const w = tokens(norm(wrong));
  const aux = new Set(["be", "am", "is", "are", "was", "were", "been", "being"]);
  const finite = new Set(["am", "is", "are", "was", "were"]);
  const onlyC = extraTokens(c, w);
  const onlyW = extraTokens(w, c);
  const extras = [...onlyC, ...onlyW];
  const content = extras.filter((t) => !aux.has(t));
  const functionExtras = extras.filter((t) => aux.has(t));
  /**
   * 태를 바꾸면 표면은 두 군데가 움직인다 — be동사가 생기거나 사라지고 동사 형태가
   * 바뀐다(is set / sets). 그런데 문법 축은 하나(태)다.
   *
   * 예전에는 be동사가 움직였다는 것만 보고 축이 둘이라고 판정해서, 내신 어법의
   * 핵심인 능동태·수동태 문항이 항상 MULTI_AXIS_EDIT로 죽었다. 바뀐 내용어가
   * 같은 동사 가족이면(set/sets, obsessed/obsessing) 축은 하나다. 가족이 다르면
   * 그때는 태 말고 다른 것도 함께 바꾼 것이므로 예전처럼 막는다.
   */
  /**
   * 네모 안이 be동사와 그 동사 하나로만 이뤄져 있어야 태 하나만 묻는 문항이다.
   * are wonderfully made / wonderfully make처럼 부사를 끌고 들어오면 학생이 봐야 할
   * 것이 둘이 되므로 예전처럼 막는다.
   */
  const family = content.length ? verbFamily(content[0]!) : "";
  const verbPhraseOnly = [...c, ...w].every(
    (token) => aux.has(token) || verbFamily(token) === family
  );
  if (content.length === 0) return true;
  if (sameVerbFamily(content) && verbPhraseOnly) return true;
  if (functionExtras.some((token) => finite.has(token))) return false;
  return false;
}

/**
 * 같은 동사인지 본다.
 *
 * 예전에는 hold/make/do 세 개짜리 표에 규칙 접사 제거를 붙인 것이 전부여서
 * written/wrote 같은 불규칙이 서로 다른 동사로 보였다. 그래서 was written / wrote,
 * 즉 가장 표준적인 능동태·수동태 쌍이 축 둘로 판정돼 죽었다.
 * PR #1이 시제 판정을 고치며 만든 공용 표(stemVerb)를 그대로 쓴다.
 */
function verbFamily(word: string): string {
  return stemVerb(word);
}

function sameVerbFamily(words: string[]): boolean {
  if (words.length < 2) return true;
  const stems = words.map(verbFamily);
  return stems.every((stem) => stem.length >= 2 && stem === stems[0]);
}

function sharedOrderChanged(a: string[], b: string[]): boolean {
  const sharedA = a.filter((token) => b.includes(token));
  const sharedB = b.filter((token) => a.includes(token));
  return sharedA.join(" ") !== sharedB.join(" ");
}

function extraTokens(left: string[], right: string[]): string[] {
  const pool = [...right];
  const extra: string[] = [];
  for (const token of left) {
    const at = pool.indexOf(token);
    if (at >= 0) pool.splice(at, 1);
    else extra.push(token);
  }
  return extra;
}

function alignedDiffs(a: string[], b: string[]): number {
  const n = Math.max(a.length, b.length);
  let diffs = 0;
  for (let i = 0; i < n; i++) {
    if ((a[i] ?? "").toLowerCase() !== (b[i] ?? "").toLowerCase()) diffs += 1;
  }
  return diffs;
}

function dropsArgument(correct: string[], wrong: string[]): boolean {
  if (wrong.length >= correct.length) return false;
  const dropped = correct.length - wrong.length;
  return dropped >= 2;
}

type Token = { text: string; start: number; end: number };

function tokenSpans(text: string): Token[] {
  return [...text.matchAll(/\S+/g)].map((m) => ({
    text: m[0],
    start: m.index ?? 0,
    end: (m.index ?? 0) + m[0].length,
  }));
}

/**
 * 두 선택지에서 공통된 앞뒤 토큰을 잘라 실제로 다른 구간만 남긴다.
 *
 * 분석 모델이 절 병렬 같은 항목에서 절을 통째로 선택지로 내놓는 일이 있는데
 * (예: "We are wonderfully made, yet we don't allow ourselves to participate"),
 * 어법 선택은 다른 부분만 네모 안에 넣어야 읽을 수 있는 문항이 된다.
 *
 * 잘라낸 정답의 시작 오프셋을 함께 돌려주므로, 호출부는 이미 해석해 둔 원본
 * 스팬 위치에 더해 지문 내 위치를 다시 찾지 않고 계산할 수 있다.
 * 어순 문항은 앞쪽만 자른다. 뒤까지 자르면 어순 대비가 무너진다.
 */
export function trimToMinimalPair(
  correct: string,
  wrong: string,
  options?: { trimTrailing?: boolean }
): { correct: string; wrong: string; startOffset: number } | null {
  const c = tokenSpans(correct);
  const w = tokenSpans(wrong);
  if (c.length < 2 || w.length < 2) return null;

  const same = (a: Token, b: Token) => a.text.toLowerCase() === b.text.toLowerCase();
  const limit = Math.min(c.length, w.length) - 1;

  let lead = 0;
  while (lead < limit && same(c[lead]!, w[lead]!)) lead += 1;

  let trail = 0;
  if (options?.trimTrailing !== false) {
    while (
      lead + trail < limit &&
      same(c[c.length - 1 - trail]!, w[w.length - 1 - trail]!)
    ) {
      trail += 1;
    }
  }
  if (lead === 0 && trail === 0) return null;

  const cStart = c[lead]!.start;
  const cEnd = c[c.length - 1 - trail]!.end;
  const wStart = w[lead]!.start;
  const wEnd = w[w.length - 1 - trail]!.end;
  if (cEnd <= cStart || wEnd <= wStart) return null;

  let trimmedCorrect = correct.slice(cStart, cEnd);
  let trimmedWrong = wrong.slice(wStart, wEnd);

  // 양쪽에 똑같이 남은 꼬리 문장부호는 뗀다. 쉼표까지 네모에 넣으면 읽기 나쁘고,
  // 뗀 자리도 단어 경계라 원문에서 그대로 다시 찾을 수 있다.
  const tail = /[^A-Za-z0-9'’]+$/;
  const correctTail = tail.exec(trimmedCorrect)?.[0] ?? "";
  const wrongTail = tail.exec(trimmedWrong)?.[0] ?? "";
  if (correctTail && correctTail === wrongTail) {
    trimmedCorrect = trimmedCorrect.slice(0, -correctTail.length);
    trimmedWrong = trimmedWrong.slice(0, -wrongTail.length);
  }

  if (!trimmedCorrect.trim() || !trimmedWrong.trim()) return null;
  if (trimmedCorrect.toLowerCase() === trimmedWrong.toLowerCase()) return null;

  return { correct: trimmedCorrect, wrong: trimmedWrong, startOffset: cStart };
}
