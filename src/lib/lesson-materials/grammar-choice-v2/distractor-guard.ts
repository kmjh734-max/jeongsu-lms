import type { LocalRejectCode } from "@/lib/lesson-materials/grammar-choice-v2/types";
import { isSingleVerbGroupAxis } from "@/lib/lesson-materials/grammar-choice-v2/minimal-pair";

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

  // make the reader's job [harder / more hardly]: more를 붙이면서 형용사를 부사로도
  // 바꿨다. 축이 둘이고 more hardly는 뜻도 다른 말이 된다.
  if (/^(?:more|most)\s+[a-z]+ly$/i.test(wrong) && /^[a-z]+$/i.test(correct) && !/ly$/i.test(correct)) {
    return "DISTRACTOR_NOT_ALLOWED";
  }

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
  if (right === `${left}ly` && (left.endsWith("ly") || FLAT_ADVERBS.has(left))) return true;
  // full -> fully처럼 -ll에 y만 붙인 꼴: ill -> illy
  if (left.endsWith("ll") && right === `${left}y` && FLAT_ADVERBS.has(left)) return true;
  // the [small / smallly] miracles: -ll에 -ly를 통째로 붙이면 l이 셋이 된다. 그런 낱말은 없다.
  if (right === `${left}ly` && (left.endsWith("ll") || NO_LY_ADJECTIVES.has(left))) return true;
  if (right === `${left}s` && MODALS.has(left)) return true;
  if (isInventedComparative(left, right)) return true;
  return false;
}

/**
 * 분석 추론을 끄면(none) 모델이 규칙을 기계적으로 적용한 없는 낱말을 오답으로
 * 낸다(관측: often/oftenly, likely/likelyly, will/wills,
 * more predictable/predictabler). 유일성 판정은 "문법에 맞느냐"만 묻기 때문에
 * 없는 낱말을 오히려 통과시키고, 검수를 medium으로 올려도 걸러지지 않았다.
 * 형태만 보고 확실히 없는 것만 여기서 막는다.
 */
const FLAT_ADVERBS = new Set([
  "often",
  "always",
  "never",
  "also",
  "very",
  "soon",
  "seldom",
  "almost",
  "already",
  "perhaps",
  "quite",
  "rather",
  "together",
  "sometimes",
  // 접속부사·문장부사: However, do they ... 가 [Howeverly / However]로 출제됐다(2026-09-11).
  "however",
  "therefore",
  "moreover",
  "furthermore",
  "nevertheless",
  "nonetheless",
  "otherwise",
  "instead",
  "meanwhile",
  "thus",
  "hence",
  "still",
  "yet",
  "too",
  "even",
  "just",
  "only",
  "again",
  "ever",
  "here",
  "there",
  "now",
  "then",
  "today",
  "tomorrow",
  "yesterday",
  "well",
  "much",
  "maybe",
  "indeed",
  "anyway",
  "besides",
  "likewise",
  "afterward",
  "afterwards",
  "somehow",
  "everywhere",
  "anywhere",
  "nowhere",
  // 형용사·부사 모양이 같은 낱말: makes me very [ill / illy] at ease(2026-09-11 배포 전 점검).
  // hard/hardly, late/lately, high/highly처럼 -ly가 뜻이 다른 실재 낱말인 것은 넣지 않는다.
  "ill",
  "fast",
  "far",
  "long",
  "enough",
  "else",
  "once",
  "twice",
  "alike",
  "alone",
  "ahead",
  "abroad",
  "away",
  "aloud",
  "further",
  "later",
  "sooner",
  "less",
  "more",
  "least",
  "better",
  "best",
  "worse",
  "worst",
  "straight",
]);

/** -ly 부사형이 없는 흔한 형용사(bigly, oldly, youngly는 없는 말이다). */
const NO_LY_ADJECTIVES = new Set(["small", "big", "tall", "old", "young", "little", "fun", "good", "fat"]);

const MODALS = new Set(["will", "would", "can", "could", "shall", "should", "may", "might"]);

/**
 * 파생 접미사로 끝나는 형용사는 -er/-est 비교급을 만들지 않는다(more/most를 쓴다).
 * pleasant/pleasanter처럼 드물게 쓰이는 형태가 있는 -ant는 넣지 않는다.
 */
const PERIPHRASTIC_ADJECTIVE = /(?:able|ible|ful|ous|ive|less|ic|ish|ent)$/;

function isInventedComparative(base: string, derived: string): boolean {
  if (!PERIPHRASTIC_ADJECTIVE.test(base)) return false;
  const stem = base.replace(/e$/, "");
  return [`${stem}er`, `${stem}est`, `${base}r`, `${base}st`].includes(derived);
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

/** -ive로 끝나지만 동사인 낱말. 형용사 어미로 보면 living, arriving이 없는 낱말이 된다. */
const IVE_VERBS = new Set([
  "live", "give", "drive", "dive", "arrive", "survive", "derive", "deprive", "receive",
  "perceive", "believe", "relieve", "achieve", "strive", "thrive", "forgive", "revive",
  "conceive", "deceive", "contrive", "retrieve", "grieve", "leave", "weave", "save",
  "move", "prove", "improve", "approve", "remove", "solve", "involve", "resolve", "evolve",
]);

function canTakeIng(word: string): boolean {
  if (IVE_VERBS.has(word)) return true;
  if (ADJECTIVE_OR_NOUN.has(word) || isAdjectiveOrMassNoun(word)) return false;
  if (VERB_PARALLEL.has(word)) return true;
  if (/(?:ize|ise|ate|ify|en)$/.test(word)) return true;
  return /^[a-z]{3,}$/.test(word) && !/(?:ive|ous|al|ful|less|ic|able|ible|ary|ory|tion|ness|ity)$/.test(word);
}

function isAdjectiveOrMassNoun(word: string): boolean {
  if (IVE_VERBS.has(word)) return false;
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
  // I've been / I was, haven't seen / didn't see: 낱말 둘이 바뀌어도 축은 동사 형태 하나다.
  if (isSingleVerbGroupAxis(correct, wrong)) return false;
  let diffs = 0;
  for (let i = 0; i < c.length; i += 1) if (c[i] !== w[i]) diffs += 1;
  return diffs >= 2 && !isWordOrderFlip(correct, wrong);
}
