import { rejectConditionalChoice } from "@/lib/lesson-materials/grammar-choice-v2/conditional-ch05";
import { rejectConjunctionChoice } from "@/lib/lesson-materials/grammar-choice-v2/conjunction-ch10";
import { rejectNonfiniteChoice } from "@/lib/lesson-materials/grammar-choice-v2/nonfinite-ch09";
import { rejectSpecialChoice } from "@/lib/lesson-materials/grammar-choice-v2/special-ch14";
import { rejectVoiceChoice } from "@/lib/lesson-materials/grammar-choice-v2/voice-ch03";
import { rejectModalChoice } from "@/lib/lesson-materials/grammar-choice-v2/modal-ch04";
import { rejectSentenceChoice } from "@/lib/lesson-materials/grammar-choice-v2/sentence-ch01";
import { rejectTenseChoice } from "@/lib/lesson-materials/grammar-choice-v2/tense-ch02";
import { rejectInfinitiveChoice } from "@/lib/lesson-materials/grammar-choice-v2/infinitive-ch06";
import { rejectGerundChoice } from "@/lib/lesson-materials/grammar-choice-v2/gerund-ch07";
import { rejectPartsChoice } from "@/lib/lesson-materials/grammar-choice-v2/parts-ch13";
import { rejectComparisonChoice } from "@/lib/lesson-materials/grammar-choice-v2/comparison-ch12";
import { rejectParticipleChoice } from "@/lib/lesson-materials/grammar-choice-v2/participle-ch08";
import { rejectRelativeChoice } from "@/lib/lesson-materials/grammar-choice-v2/relative-ch11";
import {
  ambiguousSubjectBoundary,
  bothWhatThatGrammatical,
} from "@/lib/lesson-materials/grammar-choice-v2/choice-repair";
import {
  isMechanicalToInfinitiveMarker,
  isWhToInfinitiveSpan,
  rejectFabricatedDistractor,
} from "@/lib/lesson-materials/grammar-choice-v2/distractor-guard";
import {
  hasInterveningAgreement,
  isNumberAgreementPair,
  whenFollowedByFiniteClause,
} from "@/lib/lesson-materials/grammar-choice-v2/structure-frames";
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

/**
 * 불규칙 동사의 과거·과거분사를 원형으로 되돌리는 표.
 *
 * 규칙 접사만 벗기면 said -> said, went -> went로 남아 원형과 다른 낱말로 보인다.
 * 그러면 said/says 같은 순수 시제 굴절 쌍이 "형태가 아니라 의미로 갈리는 쌍"으로
 * 오분류되어 MEANING_ONLY_CONTRAST로 죽는다.
 * 관측: 스냅샷 17지문에서 제안된 TENSE 후보 5개가 전부 이 경로로 탈락했다
 * (said/says x4, occupy/occupied x1). 시제 문항 0건의 직접 원인이다.
 */
const IRREGULAR_VERB_STEM = new Map<string, string>([
  ["said", "say"], ["went", "go"], ["gone", "go"], ["made", "make"],
  ["took", "take"], ["taken", "take"], ["came", "come"], ["saw", "see"],
  ["seen", "see"], ["knew", "know"], ["known", "know"], ["got", "get"],
  ["gotten", "get"], ["gave", "give"], ["given", "give"], ["found", "find"],
  ["thought", "think"], ["told", "tell"], ["became", "become"],
  ["left", "leave"], ["felt", "feel"], ["brought", "bring"], ["began", "begin"],
  ["begun", "begin"], ["kept", "keep"], ["held", "hold"], ["wrote", "write"],
  ["written", "write"], ["stood", "stand"], ["heard", "hear"],
  ["meant", "mean"], ["met", "meet"], ["ran", "run"], ["paid", "pay"],
  ["sat", "sit"], ["spoke", "speak"], ["spoken", "speak"], ["led", "lead"],
  ["grew", "grow"], ["grown", "grow"], ["lost", "lose"], ["fell", "fall"],
  ["fallen", "fall"], ["sent", "send"], ["built", "build"],
  ["understood", "understand"], ["drew", "draw"], ["drawn", "draw"],
  ["broke", "break"], ["broken", "break"], ["spent", "spend"],
  ["chose", "choose"], ["chosen", "choose"], ["rose", "rise"], ["risen", "rise"],
  ["drove", "drive"], ["driven", "drive"], ["ate", "eat"], ["eaten", "eat"],
  ["forgot", "forget"], ["forgotten", "forget"], ["bought", "buy"],
  ["caught", "catch"], ["taught", "teach"], ["sought", "seek"],
  ["fought", "fight"], ["won", "win"], ["shown", "show"],
  ["arose", "arise"], ["arisen", "arise"], ["dealt", "deal"], ["laid", "lay"],
]);

function stemVerb(word: string): string {
  const w = normalizeToken(word).replace(/^to\s+/, "");
  const irregular = IRREGULAR_VERB_STEM.get(w);
  if (irregular) return irregular;
  if (w.endsWith("ing") && w.length > 4) {
    let stem = w.slice(0, -3);
    if (stem.length >= 4 && stem.at(-1) === stem.at(-2)) stem = stem.slice(0, -1);
    return stem;
  }
  if (w.endsWith("ies") && w.length > 4) return `${w.slice(0, -3)}y`;
  if (w.endsWith("es") && w.length > 4) return w.slice(0, -2);
  if (w.endsWith("s") && w.length > 3) return w.slice(0, -1);
  if (w.endsWith("ied") && w.length > 4) return `${w.slice(0, -3)}y`;
  if (w.endsWith("ed") && w.length > 4) {
    let stem = w.slice(0, -2);
    if (stem.length >= 4 && stem.at(-1) === stem.at(-2)) stem = stem.slice(0, -1);
    return stem;
  }
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

function stripLeadingTo(text: string): string {
  const n = normalizeToken(text);
  return n.startsWith("to ") ? n.slice(3).trim() : n;
}

function isMechanicalGovernorForm(
  correct: string,
  wrong: string,
  prev: string
): boolean {
  const c = normalizeToken(correct);
  const w = normalizeToken(wrong);
  const cBare = stripLeadingTo(c);
  const wBare = stripLeadingTo(w);
  if (!cBare || !wBare || cBare.includes(" ") || wBare.includes(" ")) return false;
  if (stemVerb(cBare) !== stemVerb(wBare)) return false;
  const ingShift = cBare.endsWith("ing") !== wBare.endsWith("ing");
  if (!ingShift) return false;
  return prev === "to" || c.startsWith("to ") || w.startsWith("to ");
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

function isMisclassifiedComparative(correct: string, wrong: string): boolean {
  const parts = [correct, wrong].map((s) => s.trim().toLowerCase()).sort();
  if (!parts.every((part) => /^more [a-z]+$/.test(part))) return false;
  const stems = parts.map((part) => part.replace(/^more /, ""));
  return stems[0] !== stems[1] && (stems[0] + "ly" === stems[1] || stems[1] + "ly" === stems[0]);
}

const IRREGULAR_COMPARATIVE = new Set(["better", "worse", "farther", "further", "lesser", "elder"]);
const IRREGULAR_SUPERLATIVE = new Set(["best", "worst", "farthest", "furthest", "least", "eldest"]);
const COMPARATIVE_STOP = new Set([
  "other", "another", "whether", "after", "over", "under", "never", "water", "number",
  "power", "member", "order", "cover", "answer", "paper", "letter", "teacher", "however",
  "whatever", "whoever", "wherever", "either", "neither", "rather", "her", "per", "were",
  "there", "where", "here", "user", "server", "filter", "corner", "border", "mother",
  "father", "brother", "sister", "weather", "together", "ever", "carrier", "barrier",
  "integer", "proper", "inner", "outer", "former",
]);
const SUPERLATIVE_STOP = new Set([
  "interest", "forest", "honest", "modest", "protest", "request", "contest", "digest",
  "suggest", "arrest", "invest", "persist", "exist", "rest", "test", "west",
]);

function looksComparativeForm(word: string): boolean {
  const w = word.toLowerCase();
  if (IRREGULAR_COMPARATIVE.has(w)) return true;
  if (COMPARATIVE_STOP.has(w) || w.length < 5) return false;
  if (/ier$/.test(w)) return true;
  return /er$/.test(w);
}

function looksSuperlativeForm(word: string): boolean {
  const w = word.toLowerCase();
  if (IRREGULAR_SUPERLATIVE.has(w)) return true;
  if (SUPERLATIVE_STOP.has(w) || w.length < 6) return false;
  if (/iest$/.test(w)) return true;
  return /est$/.test(w);
}

/** more/less + comparative, most + superlative, or a redundant marker on an irregular degree form. */
export function isDoubleDegreeMarking(text: string): boolean {
  const words = text.trim().toLowerCase().split(/\s+/).filter(Boolean);
  for (let i = 0; i < words.length - 1; i += 1) {
    const mark = words[i]!;
    const next = words[i + 1]!;
    if ((mark === "more" || mark === "less") && looksComparativeForm(next)) return true;
    if (mark === "most" && looksSuperlativeForm(next)) return true;
  }
  return false;
}

export function rejectCandidate(input: {
  candidate: GrammarCandidate;
  sentence: ExactSentence;
}): LocalRejectCode | null {
  const { candidate, sentence } = input;
  const correct = candidate.correctAnswer;
  const wrong = candidate.distractors[0] ?? "";
  if (!correct || !wrong) return "SOURCE_ANSWER_MISMATCH";
  if (isMechanicalToInfinitiveMarker(correct, wrong)) return "MECHANICAL_INFINITIVE_MARKER";
  if (correct !== candidate.sourceSpan) return "SOURCE_ANSWER_MISMATCH";
  if (!sentence.text.includes(correct)) return "SOURCE_SPAN_NOT_FOUND";
  if (bothWhatThatGrammatical(sentence.text, correct, wrong)) return "BOTH_GRAMMATICAL";
  if (ambiguousSubjectBoundary(sentence.text, correct)) return "AMBIGUOUS_SUBJECT_BOUNDARY";
  if (
    candidate.pointCode === "INDIRECT_QUESTION_ORDER" &&
    isWhToInfinitiveSpan(`${correct} ${sentence.text}`) &&
    !/\b(?:you|we|they|things?)\s+(?:have|should)\b/i.test(correct)
  ) {
    return "ANALYSIS_ONLY";
  }
  if (isMisclassifiedComparative(correct, wrong)) return "MISCLASSIFIED_ASSESSMENT_AXIS";
  if (isDoubleDegreeMarking(correct) || isDoubleDegreeMarking(wrong)) return "DOUBLE_DEGREE_MARKING";
  if (candidate.pointCode === "UNMAPPED_HIGH_VALUE_POINT") return "UNMAPPED_ASSESSMENT_AXIS";
  const pair = [correct, wrong].map((s) => s.trim().toLowerCase()).sort().join("|");
  if (pair === "used|would use" && /\bImagine if\b/i.test(sentence.text)) {
    return "BOTH_CHOICES_GRAMMATICAL_IN_CONTEXT";
  }
  const fabricated = rejectFabricatedDistractor({
    pointCode: candidate.pointCode,
    correct,
    wrong,
    sentence: sentence.text,
  });
  if (fabricated) return fabricated;

  const conditionalReject = rejectConditionalChoice({
    pointCode: candidate.pointCode,
    correct,
    wrong,
    sentence: sentence.text,
  });
  if (conditionalReject) return conditionalReject;

  const relativeReject = rejectRelativeChoice({
    pointCode: candidate.pointCode,
    correct,
    wrong,
    sentence: sentence.text,
  });
  if (relativeReject) return relativeReject;

  const conjunctionReject = rejectConjunctionChoice({
    pointCode: candidate.pointCode,
    correct,
    wrong,
    sentence: sentence.text,
  });
  if (conjunctionReject) return conjunctionReject;

  const participleReject = rejectParticipleChoice({
    pointCode: candidate.pointCode,
    correct,
    wrong,
    sentence: sentence.text,
  });
  if (participleReject) return participleReject;

  const nonfiniteReject = rejectNonfiniteChoice({
    pointCode: candidate.pointCode,
    correct,
    wrong,
    sentence: sentence.text,
  });
  if (nonfiniteReject) return nonfiniteReject;

  const specialReject = rejectSpecialChoice({
    pointCode: candidate.pointCode,
    correct,
    wrong,
    sentence: sentence.text,
  });
  if (specialReject) return specialReject;

  const voiceReject = rejectVoiceChoice({
    pointCode: candidate.pointCode,
    correct,
    wrong,
    sentence: sentence.text,
  });
  if (voiceReject) return voiceReject;

  const modalReject = rejectModalChoice({
    pointCode: candidate.pointCode,
    correct,
    wrong,
    sentence: sentence.text,
  });
  if (modalReject) return modalReject;

  const sentenceReject = rejectSentenceChoice({
    pointCode: candidate.pointCode,
    correct,
    wrong,
    sentence: sentence.text,
  });
  if (sentenceReject) return sentenceReject;

  const tenseReject = rejectTenseChoice({
    pointCode: candidate.pointCode,
    correct,
    wrong,
    sentence: sentence.text,
  });
  if (tenseReject) return tenseReject;

  const infinitiveReject = rejectInfinitiveChoice({
    pointCode: candidate.pointCode,
    correct,
    wrong,
    sentence: sentence.text,
  });
  if (infinitiveReject) return infinitiveReject;

  const gerundReject = rejectGerundChoice({
    pointCode: candidate.pointCode,
    correct,
    wrong,
    sentence: sentence.text,
  });
  if (gerundReject) return gerundReject;

  const partsReject = rejectPartsChoice({
    pointCode: candidate.pointCode,
    correct,
    wrong,
    sentence: sentence.text,
  });
  if (partsReject) return partsReject;

  const comparisonReject = rejectComparisonChoice({
    pointCode: candidate.pointCode,
    correct,
    wrong,
    sentence: sentence.text,
  });
  if (comparisonReject) return comparisonReject;

  const point = ontologyPoint(candidate.pointCode);
  const prev = previousToken(sentence.text, correct);
  const chapter = point?.chapter;

  const gerundVersusTo =
    (candidate.pointCode === "GERUND_VERB_OBJECT" || candidate.pointCode === "GERUND_FIXED_CONSTRUCTION") &&
    /^(?:[a-z]+ing|to [a-z]+)$/i.test(correct.trim()) &&
    /^(?:[a-z]+ing|to [a-z]+)$/i.test(wrong.trim()) &&
    correct.trim().toLowerCase().startsWith("to ") !== wrong.trim().toLowerCase().startsWith("to ");
  if (!gerundVersusTo && isMechanicalGovernorForm(correct, wrong, prev)) {
    return "MECHANICAL_GOVERNOR_FORM";
  }
  if (prev === "to" && looksLikeToVVsToVing(correct, wrong)) {
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

  if (isListedTrivialPair(sentence.text, correct, wrong)) {
    return "TOO_TRIVIAL_SHORT_AGREEMENT";
  }
  if (
    !isAllowedLongAgreement(sentence.text, correct) &&
    (chapter === "C02" ||
      candidate.pointCode.startsWith("AGREEMENT_") ||
      isShortAgreementPair(correct, wrong))
  ) {
    if (isTrivialShortAgreement(sentence.text, correct, wrong)) {
      return "TOO_TRIVIAL_SHORT_AGREEMENT";
    }
  }

  if (isBothGrammaticalPair(correct, wrong, sentence.text)) {
    return "BOTH_GRAMMATICAL";
  }
  if (isContextLockedNonfinite(candidate.pointCode) && isLockedToIngPair(correct, wrong)) {
    return null;
  }
  if (isStructuralPronounPair(candidate.pointCode, correct, wrong, sentence.text)) {
    return null;
  }
  if (isConfusableAdverbPair(correct, wrong)) return "MEANING_ONLY_CONTRAST";
  if (pairKey(correct, wrong) === "during|when") {
    if (!whenFollowedByFiniteClause(sentence.text) || !/^when$/i.test(correct)) {
      return "MEANING_ONLY_CONTRAST";
    }
  } else if (isMeaningOnlyContrast(correct, wrong)) {
    return "MEANING_ONLY_CONTRAST";
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

function pairKey(a: string, b: string): string {
  return [normalizeToken(a), normalizeToken(b)].sort().join("|");
}

function immediateSubject(sentence: string, span: string): string {
  const at = sentence.toLowerCase().indexOf(normalizeToken(span));
  if (at < 0) return "";
  const before = sentence.slice(0, at).trim();
  return normalizeToken(tokens(before).at(-1) ?? "");
}

function isListedTrivialPair(sentence: string, correct: string, wrong: string): boolean {
  const sorted = pairKey(correct, wrong);
  const joined = `${normalizeToken(correct)} ${normalizeToken(wrong)}`;
  if (sorted === "many kind|many kinds") return true;
  if (sorted === "kind|kinds" && /\bmany\b/i.test(sentence)) return true;
  if (/\bmany\b/.test(joined) && /\bkinds?\b/.test(joined)) return true;

  const subject = immediateSubject(sentence, correct);
  if ((sorted === "are|is" || sorted === "is|are") && (subject === "information" || subject === "sections")) {
    return true;
  }
  if (sorted === "has|have" && subject === "graphs") return true;
  return false;
}

function isShortAgreementPair(correct: string, wrong: string): boolean {
  const sorted = pairKey(correct, wrong);
  return sorted === "are|is" || sorted === "has|have" || sorted === "was|were";
}

function isAllowedLongAgreement(sentence: string, correct: string): boolean {
  const c = normalizeToken(correct);
  if (!/^(is|are|was|were|has|have)$/.test(c)) return false;
  const at = sentence.indexOf(correct);
  if (at < 0) return false;
  const before = sentence.slice(0, at);
  if (/\b(?:who|which|that|whose)\b/i.test(before.slice(-48))) return true;
  if (/[,—–]/.test(before.slice(-24))) return true;
  return tokens(before).length > 6;
}

function isAdjAdvPair(a: string, b: string): boolean {
  const left = normalizeToken(a);
  const right = normalizeToken(b);
  const [short, long] = [left, right].sort((x, y) => x.length - y.length);
  if (!short || !long) return false;
  return long === `${short}ly` || (short.endsWith("y") && long === `${short.slice(0, -1)}ily`);
}

function isContextLockedNonfinite(code: string): boolean {
  return (
    code === "NONFINITE_MEMORY_COMPLEMENT" ||
    code === "NONFINITE_STOP_COMPLEMENT" ||
    code === "NONFINITE_TRY_COMPLEMENT" ||
    code === "NONFINITE_MEAN_COMPLEMENT" ||
    code === "NONFINITE_GO_ON_COMPLEMENT"
  );
}

function isLockedToIngPair(correct: string, wrong: string): boolean {
  const pair = [normalizeToken(correct), normalizeToken(wrong)].sort().join("|");
  return /^[a-z]+ing\|to [a-z]+$/.test(pair);
}

function isConfusableAdverbPair(correct: string, wrong: string): boolean {
  const pair = pairKey(correct, wrong);
  return ["hard|hardly", "late|lately", "near|nearly", "high|highly", "close|closely", "most|mostly"].includes(pair);
}

function isStructuralPronounPair(code: string, correct: string, wrong: string, sentence: string): boolean {
  const pair = pairKey(correct, wrong);
  if (code === "PRONOUN_REFLEXIVE" && ["ourselves|us", "themselves|them", "himself|him", "herself|her"].includes(pair)) {
    return /\b(?:we|they|he|she)\b/i.test(sentence) && !/\bincluding\b/i.test(sentence);
  }
  if (code === "PRONOUN_SUBJECT_OBJECT_CASE" && ["he|him", "i|me", "she|her", "they|them", "we|us"].includes(pair)) {
    return !/\bit was\b/i.test(sentence);
  }
  return false;
}

function isAllowedPedagogicPair(correct: string, wrong: string): boolean {
  const sorted = pairKey(correct, wrong);
  if (sorted === "its|it's" || sorted === "it's|its") return true;
  if (sorted === "what|which") return true;
  if (sorted === "it|this" || sorted === "it|that") return true;
  return isAdjAdvPair(correct, wrong);
}

function isMeaningOnlyContrast(correct: string, wrong: string): boolean {
  if (isAllowedPedagogicPair(correct, wrong)) return false;
  const closed = new Set([
    "is", "are", "was", "were", "has", "have", "had", "do", "does", "did",
    "to", "of", "which", "that", "who", "whom", "what", "whose", "and", "or",
    "but", "its", "it's", "a", "an", "the", "not", "be", "been", "being", "than",
  ]);
  const c = tokens(correct);
  const w = tokens(wrong);
  if (c.length !== w.length || c.length === 0) return false;
  const diffs: number[] = [];
  for (let i = 0; i < c.length; i++) {
    if (normalizeToken(c[i]!) !== normalizeToken(w[i]!)) diffs.push(i);
  }
  if (diffs.length !== 1) return false;
  const a = normalizeToken(c[diffs[0]!]!);
  const b = normalizeToken(w[diffs[0]!]!);
  if (closed.has(a) || closed.has(b)) return false;
  if (stemVerb(a) === stemVerb(b) || isInflectedPair(a, b) || isComparativePair(a, b)) return false;
  if (isAdjAdvPair(a, b)) return false;
  return true;
}

function isComparativePair(a: string, b: string): boolean {
  const forms = new Set(["far", "further", "farther", "good", "better", "bad", "worse", "much", "more", "little", "less"]);
  return forms.has(a) && forms.has(b);
}

function isInflectedPair(a: string, b: string): boolean {
  const [short, long] = [a, b].sort((x, y) => x.length - y.length);
  if (long === `${short}s` || long === `${short}es` || long === `${short}ed` || long === `${short}ing`) {
    return true;
  }
  if (short.endsWith("e") && (long === `${short.slice(0, -1)}ing` || long === `${short.slice(0, -1)}ed`)) {
    return true;
  }
  return stemVerb(a) === stemVerb(b);
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
  if (!agree.has(pair) && !isNumberAgreementPair(correct, wrong)) return false;
  if (hasInterveningAgreement(sentence, correct)) return false;
  if (/\b(?:one of|the number of|a number of|not only|what|there|the news|each of|along with)\b/i.test(sentence)) {
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
    /\b(of|who|which|that|whose|when|where|with|by|from|in|on|for|outside|inside)\b/i.test(
      before.slice(-40)
    ) && gap.length > 3;
  if (intervening || gap.length > 6) return false;
  return gap.length <= 3;
}

function isBothGrammaticalPair(
  correct: string,
  wrong: string,
  sentence: string
): boolean {
  const pair = [normalizeToken(correct), normalizeToken(wrong)].sort().join("|");
  if (pair === "it|this") return true;
  if (pair === "if|unless") return true;
  if (
    pair === "that|which" &&
    !/,\s*which\b/.test(sentence) &&
    !/\b(?:for|with|to|from|of|in|on|by|about|into|through|without|over|under|between|among)\s+which\b/i.test(sentence)
  ) {
    return true;
  }
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

/**
 * 문장 안에서 시제를 확정짓는 시간 표지.
 *
 * isAmbiguousTense는 "표지가 없으면 모호하니 거부"하는 게이트다. 그런데 목록이
 * 좁아서 실제로 시제를 확정하는 표현을 대부분 놓쳤다. 관측: 제안된
 * TENSE_EXPLICIT_TIME_MARKER 후보가 전부 여기서 탈락했는데 정작 그 문장들은
 * once said / Today ... occupy처럼 표지가 분명했다. 코드명이 이미
 * "명시적 시간 표지"인 후보가 표지 없음으로 걸리던 셈이다.
 *
 * 넓히는 방향이지만 가드를 푸는 것은 아니다. 표지가 없으면 지금과 똑같이
 * 탈락하고, 살아남은 후보도 블라인드 유일성 게이트와 검수를 그대로 통과해야 한다.
 */
const EXPLICIT_TIME_MARKER_RE =
  /\b(?:yesterday|ago|already|since|for|before|after|by the time|now|then|when|while|tomorrow|just|never|always|once|today|tonight|nowadays|currently|recently|lately|these days|at present|so far|up to now|ever since|last (?:night|week|month|year|time)|next (?:week|month|year)|this (?:morning|afternoon|evening|week|month|year)|over the (?:past|last)|in \d{4})\b/i;

function isAmbiguousTense(
  correct: string,
  wrong: string,
  sentence: string,
  pointCode: string
): boolean {
  if (!pointCode.startsWith("TENSE_")) return false;
  if (!isInflectionOnly(correct, wrong)) return false;
  const hasMarker = EXPLICIT_TIME_MARKER_RE.test(sentence);
  return !hasMarker;
}

function isAmbiguousReference(correct: string, wrong: string): boolean {
  const pair = [normalizeToken(correct), normalizeToken(wrong)].sort().join("|");
  return pair === "it|that";
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
  // 정답에 접미사를 붙여 만든 오답은 실재하지 않는 단어일 수 있다
  // (관측: extinct → extinctly가 그대로 출제됐다). 실재 여부는 어휘 지식이라
  // 로컬 규칙으로 못 가리므로 감사 모델에 보낸다.
  if (isDerivedFromCorrect(candidate.correctAnswer, candidate.distractors[0] ?? "")) {
    return true;
  }
  return false;
}

/** 한쪽이 다른 쪽에 파생 접미사를 붙인 형태인지 본다. */
const DERIVATION_SUFFIXES = ["ly", "ing", "ed", "er", "est", "ness", "ful"];

export function isDerivedFromCorrect(correct: string, wrong: string): boolean {
  const base = correct.trim().toLowerCase();
  const derived = wrong.trim().toLowerCase();
  if (!base || !derived || base === derived) return false;
  if (base.includes(" ") || derived.includes(" ")) return false;
  return DERIVATION_SUFFIXES.some(
    (suffix) =>
      derived === `${base}${suffix}` ||
      derived === `${base.replace(/e$/, "")}${suffix}` ||
      base === `${derived}${suffix}` ||
      base === `${derived.replace(/e$/, "")}${suffix}`
  );
}
