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
  if (functionExtras.some((token) => finite.has(token)) && content.length > 0) return false;
  return content.length === 0 || sameVerbFamily(content);
}

function verbFamily(word: string): string {
  const irregular: Record<string, string> = {
    held: "hold",
    hold: "hold",
    holding: "hold",
    made: "make",
    make: "make",
    making: "make",
    done: "do",
    did: "do",
    doing: "do",
  };
  return irregular[word] ?? word.replace(/(ing|ed|es|s)$/i, "");
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
