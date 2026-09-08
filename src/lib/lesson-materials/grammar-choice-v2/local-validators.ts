import { ontologyPoint } from "@/lib/lesson-materials/grammar-choice-v2/grammar-ontology";
import type {
  ExactSentence,
  GrammarCandidate,
  LocalRejectCode,
} from "@/lib/lesson-materials/grammar-choice-v2/types";

const MODALS = new Set([
  "can",
  "could",
  "may",
  "might",
  "must",
  "shall",
  "should",
  "will",
  "would",
]);

const IMPERATIVES = new Set(["think", "imagine", "consider"]);

export function normalizeToken(text: string): string {
  return text.trim().toLowerCase().replace(/[’]/g, "'");
}

function tokens(text: string): string[] {
  return text.split(/\s+/).filter(Boolean);
}

function stemVerb(word: string): string {
  const w = normalizeToken(word);
  if (w.endsWith("ing") && w.length > 5) return w.slice(0, -3);
  if (w.endsWith("ies") && w.length > 4) return `${w.slice(0, -3)}y`;
  if (w.endsWith("es") && w.length > 4) return w.slice(0, -2);
  if (w.endsWith("s") && w.length > 3) return w.slice(0, -1);
  if (w.endsWith("ed") && w.length > 4) return w.slice(0, -2);
  return w;
}

export function subtypeKey(pointCode: string, a: string, b: string): string {
  const pair = [normalizeToken(a), normalizeToken(b)].sort().join("|");
  if (
    /\bmany\b/.test(`${normalizeToken(a)} ${normalizeToken(b)}`) &&
    /kind/.test(pair)
  ) {
    return "COUNTABLE_PLURAL_AFTER_MANY";
  }
  return `${pointCode}:${pair}`;
}

function previousToken(sentence: string, span: string): string {
  const at = sentence.indexOf(span);
  if (at <= 0) return "";
  const before = sentence.slice(0, at).trim();
  const parts = tokens(before);
  return normalizeToken(parts[parts.length - 1] ?? "");
}

function isInflectionOnly(a: string, b: string): boolean {
  const ta = tokens(a);
  const tb = tokens(b);
  if (ta.length !== tb.length || ta.length === 0) return false;
  let diffs = 0;
  for (let i = 0; i < ta.length; i++) {
    if (normalizeToken(ta[i]!) === normalizeToken(tb[i]!)) continue;
    diffs += 1;
    if (stemVerb(ta[i]!) !== stemVerb(tb[i]!)) return false;
  }
  return diffs === 1;
}

function looksLikeToVVsToVing(a: string, b: string): boolean {
  const na = normalizeToken(a);
  const nb = normalizeToken(b);
  const pair = [na, nb].sort();
  if (pair[0]!.startsWith("to ") && pair[1]!.startsWith("to ")) {
    const left = pair[0]!.slice(3);
    const right = pair[1]!.slice(3);
    return left.endsWith("ing") !== right.endsWith("ing");
  }
  return (
    (na.endsWith("ing") || nb.endsWith("ing")) &&
    stemVerb(na) === stemVerb(nb) &&
    !na.includes(" ") &&
    !nb.includes(" ")
  );
}

export function repairForbiddenConditionalDistractor(
  candidate: GrammarCandidate
): GrammarCandidate {
  if (!candidate.pointCode.startsWith("CONDITIONAL_")) return candidate;
  const wrong = candidate.distractors[0] ?? "";
  const next = rewriteConditionalWrong(candidate.correctAnswer, wrong);
  if (!next || next === wrong) return candidate;
  return { ...candidate, distractors: [next, ...candidate.distractors.slice(1)] };
}

function rewriteConditionalWrong(correct: string, wrong: string): string | null {
  const c = normalizeToken(correct);
  const w = normalizeToken(wrong);
  if (/\bwould\b|\bcould\b|\bmight\b/.test(w)) return null;
  if (/\bhad\b/.test(c) && /\bhave\b|\bhas\b/.test(w)) {
    return wrong.replace(/\b(?:have|has)\b/i, "would have");
  }
  if (/\bwere\b/.test(c) && /\b(?:is|are|was)\b/.test(w)) {
    return wrong.replace(/\b(?:is|are|was)\b/i, "would be");
  }
  return null;
}

export function rejectCandidate(input: {
  candidate: GrammarCandidate;
  sentence: ExactSentence;
}): LocalRejectCode | null {
  const { candidate, sentence } = input;
  const correct = candidate.correctAnswer;
  const wrong = candidate.distractors[0] ?? "";
  if (!correct || !wrong) return "SOURCE_ANSWER_MISMATCH";
  if (correct !== candidate.sourceSpan) return "SOURCE_ANSWER_MISMATCH";
  if (!sentence.text.includes(correct)) return "SOURCE_SPAN_NOT_FOUND";

  const point = ontologyPoint(candidate.pointCode);
  const prev = previousToken(sentence.text, correct);
  const chapter = point?.chapter;

  if (prev === "to" && looksLikeToVVsToVing(correct, wrong)) {
    return "MECHANICAL_INFINITIVE_MARKER";
  }
  if (
    normalizeToken(correct).startsWith("to ") &&
    normalizeToken(wrong).startsWith("to ") &&
    looksLikeToVVsToVing(correct, wrong)
  ) {
    return "MECHANICAL_INFINITIVE_MARKER";
  }

  if (MODALS.has(prev) && isInflectionOnly(correct, wrong)) {
    return "MECHANICAL_MODAL_FORM";
  }

  const first = normalizeToken(tokens(sentence.text)[0] ?? "");
  if (
    IMPERATIVES.has(first) &&
    IMPERATIVES.has(normalizeToken(correct).replace(/s$/, "")) &&
    isInflectionOnly(correct, wrong)
  ) {
    return "TRIVIAL_IMPERATIVE_INFLECTION";
  }

  if (chapter === "C02" || candidate.pointCode.startsWith("AGREEMENT_")) {
    if (isTrivialShortAgreement(sentence.text, correct, wrong)) {
      return "TOO_TRIVIAL_SHORT_AGREEMENT";
    }
  }

  if (isMeaningOnlyVoice(correct, wrong)) return "MEANING_ONLY_CONTRAST";
  if (isBothGrammaticalPair(correct, wrong, sentence.text)) {
    return "BOTH_GRAMMATICAL";
  }
  if (isImplausible(correct, wrong, sentence.text)) {
    return "IMPLAUSIBLE_DISTRACTOR";
  }
  if (isAmbiguousTense(correct, wrong, sentence.text, candidate.pointCode)) {
    return "AMBIGUOUS_TENSE";
  }
  if (isAmbiguousReference(correct, wrong)) return "AMBIGUOUS_REFERENCE";
  return null;
}

function isTrivialShortAgreement(
  sentence: string,
  correct: string,
  wrong: string
): boolean {
  const c = normalizeToken(correct);
  const w = normalizeToken(wrong);
  const agree = new Set([
    "is|are",
    "are|is",
    "was|were",
    "were|was",
    "has|have",
    "have|has",
    "applies|apply",
    "apply|applies",
    "writes|write",
    "write|writes",
    "wants|want",
    "want|wants",
  ]);
  const pair = `${c}|${w}`;
  if (!agree.has(pair) && !isInflectionOnly(correct, wrong)) return false;
  if (/\b(?:one of|the number of|a number of|not only|what|there)\b/i.test(sentence)) {
    return false;
  }
  if (/\b(?:who|which|that)\b/i.test(sentence) && c.match(/^(is|are|was|were|has|have)$/)) {
    const between = sentence.split(correct)[0] ?? "";
    if (/\b(?:who|which|that|of)\b/i.test(between.slice(-40))) return false;
  }
  const at = sentence.indexOf(correct);
  const before = sentence.slice(Math.max(0, at - 48), at);
  const gap = tokens(before);
  const intervening =
    /\b(of|who|which|that|whose|when|where|with|by|from|in|on|for)\b/i.test(
      before.slice(-40)
    ) && gap.length > 3;
  if (intervening || gap.length > 6) return false;
  return gap.length <= 3;
}

function isMeaningOnlyVoice(correct: string, wrong: string): boolean {
  const pair = [normalizeToken(correct), normalizeToken(wrong)].sort().join("|");
  return (
    pair.includes("wiped out") &&
    (pair.includes("wiping out") || pair.includes("wipe out"))
  );
}

function isBothGrammaticalPair(
  correct: string,
  wrong: string,
  sentence: string
): boolean {
  const pair = [normalizeToken(correct), normalizeToken(wrong)].sort().join("|");
  if (pair === "if|unless") return true;
  if (pair === "that|which" && !/,\s*which\b/.test(sentence)) return true;
  if (pair === "think|to think" && /all we have to do is/i.test(sentence)) {
    return true;
  }
  if (pair === "have|to have" && /all (?:s|we) have to do is/i.test(sentence)) {
    return true;
  }
  return false;
}

function isImplausible(correct: string, wrong: string, sentence: string): boolean {
  const w = normalizeToken(wrong);
  if (w === "who" && /\bwas\s+that\b/i.test(sentence)) return true;
  if (w === "what" && /,\s*which\b/.test(sentence) && normalizeToken(correct) === "which") {
    return false;
  }
  return false;
}

function isAmbiguousTense(
  correct: string,
  wrong: string,
  sentence: string,
  pointCode: string
): boolean {
  if (!pointCode.startsWith("TENSE_")) return false;
  if (!isInflectionOnly(correct, wrong)) return false;
  const hasMarker =
    /\b(yesterday|ago|already|since|for|before|after|by the time|now|then|when|while|tomorrow|just|never|always)\b/i.test(
      sentence
    );
  return !hasMarker;
}

function isAmbiguousReference(correct: string, wrong: string): boolean {
  const pair = [normalizeToken(correct), normalizeToken(wrong)].sort().join("|");
  return pair === "it|this" || pair === "it|that";
}

export function needsAuditor(candidate: GrammarCandidate): boolean {
  if (candidate.riskLevel === "HIGH") return true;
  if (candidate.pointCode.startsWith("TENSE_")) return true;
  if (candidate.pointCode.startsWith("CONDITIONAL_")) return true;
  if (candidate.pointCode.startsWith("WISH_") || candidate.pointCode.startsWith("AS_IF_")) {
    return true;
  }
  if (
    candidate.pointCode === "RELATIVE_WHO_WHOM" ||
    candidate.pointCode === "RELATIVE_ADVERB_WHERE" ||
    candidate.pointCode === "RELATIVE_WHAT" ||
    candidate.pointCode === "RELATIVE_NONRESTRICTIVE"
  ) {
    return true;
  }
  if (candidate.pointCode.startsWith("VOICE_") && candidate.riskLevel !== "LOW") {
    return true;
  }
  return false;
}
