import type { LocalRejectCode } from "@/lib/lesson-materials/grammar-choice-v2/types";

const ADJECTIVE_OR_NOUN = new Set([
  "negative",
  "positive",
  "important",
  "extreme",
  "magnetic",
  "beautiful",
  "successful",
  "passionate",
  "loving",
  "challenging",
  "necessary",
  "critical",
  "typical",
  "physical",
  "emotional",
  "extraordinary",
  "uncountable",
  "information",
  "advice",
  "evidence",
  "furniture",
]);

const UNCOUNTABLE_TEACHING = new Set([
  "information|informations",
  "advice|advices",
  "evidence|evidences",
  "furniture|furnitures",
]);

const VERB_PARALLEL = new Set([
  "visualize",
  "affirm",
  "upgrade",
  "become",
  "build",
  "read",
  "think",
  "focus",
  "move",
  "apply",
]);

export function isWhToInfinitiveSpan(span: string): boolean {
  return /\b(?:how|what|when|where|why|who|which)\s+to\s+[A-Za-z]+/i.test(span.trim());
}

export function isIndirectFiniteClause(span: string, sentence = ""): boolean {
  const text = `${span} ${sentence}`;
  if (isWhToInfinitiveSpan(span) || isWhToInfinitiveSpan(sentence) && !/\b(?:you|we|they|he|she|I|it|things?)\s+(?:have|has|had|should|would|could|can|do|did|want|need)\b/i.test(span)) {
    if (isWhToInfinitiveSpan(span)) return false;
  }
  return (
    /\b(?:you|we|they|he|she|I)\s+(?:have|has|had|want|need|do|did)\b/i.test(span) ||
    /\b(?:things?|people|students)\s+should\b/i.test(span) ||
    /\bshould\s+(?:things?|people|students)\s+be\b/i.test(span) ||
    /\bhow\s+\w+\s+should\b/i.test(text) && /\b(?:things?|people)\s+should\b/i.test(span)
  );
}

function choiceText(text: string): string {
  return text.trim().toLowerCase().replace(/\s+/g, " ");
}

function verbAfterTo(text: string): string | null {
  return /^to ([a-z]+)$/.exec(choiceText(text))?.[1] ?? null;
}

function isIngFormOf(base: string, ing: string): boolean {
  if (!base || !ing.endsWith("ing") || ing.length <= 3 || base.endsWith("ing")) return false;
  if (`${base}ing` === ing) return true;
  if (base.endsWith("e") && `${base.slice(0, -1)}ing` === ing) return true;
  return base.length >= 3 && `${base}${base.at(-1)}ing` === ing;
}

/** Both options are `to` + the same verb, differing only by a mechanical -ing. */
export function isMechanicalToInfinitiveMarker(correct: string, wrong: string): boolean {
  const left = verbAfterTo(correct);
  const right = verbAfterTo(wrong);
  if (!left || !right || left === right) return false;
  return isIngFormOf(left, right) || isIngFormOf(right, left);
}

export function rejectFabricatedDistractor(input: {
  pointCode: string;
  correct: string;
  wrong: string;
  sentence: string;
}): Extract<LocalRejectCode, "FABRICATED_INFLECTION" | "DISTRACTOR_NOT_ALLOWED"> | null {
  const correct = input.correct.trim();
  const wrong = input.wrong.trim();
  if (!wrong || wrong === "∅") return null;
  if (isAllowedTeachingPair(input.pointCode, correct, wrong, input.sentence)) return null;
  if (isWordOrderFlip(correct, wrong)) return null;

  const invented = inventedTokens(correct, wrong);
  if (invented.length) return "FABRICATED_INFLECTION";

  if (changesSeveralAxes(correct, wrong) && !isAllowedTeachingPair(input.pointCode, correct, wrong, input.sentence)) {
    return "DISTRACTOR_NOT_ALLOWED";
  }
  return null;
}

export function isInventedInflection(base: string, derived: string): boolean {
  const left = base.trim().toLowerCase();
  const right = derived.trim().toLowerCase();
  if (!left || !right || left === right) return false;
  if (right === `${left.replace(/e$/, "")}ing` || right === `${left}ing`) {
    return !canTakeIng(left);
  }
  if (right === `${left}ed` || right === `${left}d`) {
    return !canTakeIng(left);
  }
  if (right === `${left}s` && isAdjectiveOrMassNoun(left)) return true;
  return false;
}

function isAllowedTeachingPair(pointCode: string, correct: string, wrong: string, sentence: string): boolean {
  const pair = [correct, wrong].map((s) => s.trim().toLowerCase()).sort().join("|");
  if (UNCOUNTABLE_TEACHING.has(pair)) {
    return pointCode === "COUNTABLE_UNCOUNTABLE" || pointCode === "SINGULAR_PLURAL_NOUN";
  }
  if (pair === "applies|apply") {
    return pointCode.startsWith("AGREEMENT_") && /\b(?:he|she|it|variation|principle|this|that)\b/i.test(sentence);
  }
  if (pair === "visualize|visualizing" || pair === "affirm|affirming" || pair === "upgrade|upgrading" || pair === "become|becoming") {
    return (
      (pointCode === "PARALLEL_VERBS" || pointCode === "PARALLEL_AND_OR_BUT") &&
      /\b(?:and|or)\b/i.test(sentence) &&
      VERB_PARALLEL.has(correct.trim().toLowerCase().split(/\s+/).pop() ?? "")
    );
  }
  if (pair === "made move|made to move") return pointCode === "VOICE_BE_MADE_TO" || pointCode === "CAUSATIVE_PASSIVE";
  if (pair === "do you have|you have") return pointCode === "INDIRECT_QUESTION_ORDER";
  if (pair === "should things be|things should be") return pointCode === "INDIRECT_QUESTION_ORDER";
  if (pair === "and|or") return pointCode === "CORRELATIVE_BOTH_AND";
  if (pair === "are|is" || pair === "was|were") {
    return pointCode.startsWith("AGREEMENT_") || pointCode === "PSEUDO_CLEFT_ALL" || pointCode === "RELATIVE_AGREEMENT";
  }
  if (pair === "that|which" || pair === "that|what" || pair === "what|which") return pointCode.startsWith("RELATIVE_") || pointCode.startsWith("NOUN_CLAUSE_");
  if (pair === "had|would have" || pair === "were|would be") return pointCode.startsWith("CONDITIONAL_");
  return false;
}

function inventedTokens(correct: string, wrong: string): string[] {
  const wrongTokens = wrong.toLowerCase().split(/\s+/).filter(Boolean);
  const correctTokens = new Set(correct.toLowerCase().split(/\s+/).filter(Boolean));
  const out: string[] = [];
  for (const token of wrongTokens) {
    if (correctTokens.has(token)) continue;
    const base = [...correctTokens].find((item) => isInventedInflection(item, token));
    if (base) out.push(token);
  }
  return out;
}

function canTakeIng(word: string): boolean {
  if (ADJECTIVE_OR_NOUN.has(word) || isAdjectiveOrMassNoun(word)) return false;
  if (VERB_PARALLEL.has(word)) return true;
  if (/(?:ize|ise|ate|ify|en)$/.test(word)) return true;
  return /^[a-z]{3,}$/.test(word) && !/(?:ive|ous|al|ful|less|ic|able|ible|ary|ory|tion|ness|ity)$/.test(word);
}

function isAdjectiveOrMassNoun(word: string): boolean {
  return ADJECTIVE_OR_NOUN.has(word) || /(?:tion|ment|ness|ity|ive|ous|ful|less)$/.test(word);
}

function isWordOrderFlip(correct: string, wrong: string): boolean {
  const c = correct.toLowerCase().split(/\s+/).filter(Boolean);
  const w = wrong.toLowerCase().split(/\s+/).filter(Boolean);
  if (c.length !== w.length || c.length < 2) return false;
  return c.slice().sort().join(" ") === w.slice().sort().join(" ");
}

function changesSeveralAxes(correct: string, wrong: string): boolean {
  const c = correct.toLowerCase().split(/\s+/).filter(Boolean);
  const w = wrong.toLowerCase().split(/\s+/).filter(Boolean);
  if (c.length !== w.length || c.length < 2) return false;
  let diffs = 0;
  for (let i = 0; i < c.length; i += 1) if (c[i] !== w[i]) diffs += 1;
  return diffs >= 2 && !isWordOrderFlip(correct, wrong);
}
