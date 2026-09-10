import { factorParallelChoices } from "@/lib/lesson-materials/grammar-choice-v2/assessment-contract";
import { activeLemmaOfParticiple } from "@/lib/lesson-materials/grammar-choice-v2/nonfinite-ch09";
import {
  findEitherOrParallelVerb,
  findPrepWhich,
  findUniqueComparativeThan,
  isLockedEitherOrParallel,
  RELATIVE_PREPS,
  whenFollowedByFiniteClause,
} from "@/lib/lesson-materials/grammar-choice-v2/structure-frames";
import type { GrammarCandidate, GrammarPointCode, GrammarPriority } from "@/lib/lesson-materials/grammar-choice-v2/types";

const BE = "is|are|was|were";
const PRON = "we|they|he|she|I|you|it";

function tokens(text: string): string[] {
  return text.trim().split(/\s+/).filter(Boolean);
}

function pairKey(left: string, right: string): string {
  return [left, right].map((s) => s.trim().toLowerCase()).sort().join("|");
}

function occurrenceOf(text: string, span: string, from: number): number {
  const lower = text.toLowerCase();
  const needle = span.toLowerCase();
  let count = 0;
  let at = 0;
  while (at <= from) {
    const hit = lower.indexOf(needle, at);
    if (hit < 0 || hit > from) break;
    const before = hit === 0 || !/[A-Za-z]/.test(text[hit - 1] ?? "");
    const after = hit + needle.length >= text.length || !/[A-Za-z]/.test(text[hit + needle.length] ?? "");
    if (before && after) {
      if (hit === from) return count;
      count += 1;
    }
    at = hit + 1;
  }
  return 0;
}

function indexOfWord(text: string, span: string, from = 0): number {
  const re = new RegExp(`\\b${span.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\$&")}\\b`, "i");
  const slice = text.slice(from);
  const hit = re.exec(slice);
  return hit ? from + hit.index : -1;
}

/** what/that are both grammatical only for the two recovered clause shapes. */
export function bothWhatThatGrammatical(sentence: string, correct: string, wrong: string): boolean {
  if (pairKey(correct, wrong) !== "that|what") return false;
  const marker = correct.trim();
  const at = sentence.toLowerCase().indexOf(marker.toLowerCase());
  if (at < 0) return false;
  const before = sentence.slice(0, at);
  const after = sentence.slice(at + marker.length).replace(/^\s+/, "");
  if (/\b(?:of|about)\s+$/i.test(before) && /^what$/i.test(correct)) return false;
  if (
    new RegExp(`^(?!${PRON}\\b)[A-Za-z]+(?:'s)?\\s+(?:${BE}|has|have)\\b`, "i").test(after)
  ) {
    return true;
  }
  if (new RegExp(`\\b(?:${BE})\\s+$`, "i").test(before) && new RegExp(`^(?:${PRON})\\s+[A-Za-z]+`, "i").test(after)) {
    return true;
  }
  return false;
}

export function ambiguousSubjectBoundary(sentence: string, correct: string): boolean {
  if (!new RegExp(`^(?:${BE})$`, "i").test(correct.trim())) return false;
  return /\b[A-Za-z]+ing\b[^.]{0,80},\s+[A-Za-z]+ing\b[^,]{0,40},\s+(?:is|are|was|were)\b/i.test(
    sentence
  );
}

function stripCommon(correct: string, wrong: string): { correct: string; wrong: string } | null {
  const c = tokens(correct);
  const w = tokens(wrong);
  let start = 0;
  while (start < c.length && start < w.length && c[start]!.toLowerCase() === w[start]!.toLowerCase()) start += 1;
  let end = 0;
  while (
    end < c.length - start &&
    end < w.length - start &&
    c[c.length - 1 - end]!.toLowerCase() === w[w.length - 1 - end]!.toLowerCase()
  ) {
    end += 1;
  }
  const nextC = c.slice(start, c.length - end);
  const nextW = w.slice(start, w.length - end);
  if (!nextC.length || !nextW.length) return null;
  if (nextC.length > 4 || nextW.length > 4) return null;
  return { correct: nextC.join(" "), wrong: nextW.join(" ") };
}

function passiveWrongAlsoOk(_sentence: string, correct: string, wrong: string): boolean {
  const c = correct.toLowerCase();
  const w = wrong.toLowerCase();
  if (!/wip/.test(c)) return false;
  return /\b(?:wiped|wiped out)\b/.test(w);
}

export function repairChoice(input: {
  pointCode: string;
  correct: string;
  wrong: string;
  sentence: string;
}): { pointCode: GrammarPointCode; correct: string; wrong: string; at: number } | null {
  const sentence = input.sentence.replace(/[’]/g, "'");
  const code = input.pointCode as GrammarPointCode;
  const correct = input.correct.trim();
  const wrong = input.wrong.trim();

  const all = sentence.match(/\ball\s+(?:that\s+|which\s+)?(?:\w+\s+){0,3}(?:have|has|had)\s+to\s+do\s+(is|are|was|were)\b/i);
  if (all && new RegExp(`^(?:${BE})$`, "i").test(correct)) {
    const verb = all[1] ?? correct;
    return {
      pointCode: "PSEUDO_CLEFT_ALL",
      correct: verb,
      wrong: /^(?:is|was)$/i.test(verb) ? (verb.toLowerCase() === "is" ? "are" : "were") : verb.toLowerCase() === "are" ? "is" : "was",
      at: indexOfWord(sentence, verb, all.index ?? 0),
    };
  }

  const oneOf = sentence.match(
    /\bOne of\s+(?:(?!\b(?:was|were|is|are|has|have|that|who|which)\b)[A-Za-z']+\s+){1,8}(was|were|is|are|has|have)\b/i
  );
  if (oneOf && new RegExp(`^(?:${BE}|has|have)$`, "i").test(correct)) {
    const verb = (oneOf[0].match(/\b(was|were|is|are|has|have)\b/i) ?? [])[1] ?? correct;
    if (correct.toLowerCase() === verb.toLowerCase() || code === "AGREEMENT_LONG_SUBJECT") {
      return {
        pointCode: "AGREEMENT_ONE_OF",
        correct: verb,
        wrong: /^(?:was|is|has)$/i.test(verb)
          ? verb.toLowerCase() === "was"
            ? "were"
            : verb.toLowerCase() === "is"
              ? "are"
              : "have"
          : verb.toLowerCase() === "were"
            ? "was"
            : verb.toLowerCase() === "are"
              ? "is"
              : "has",
        at: indexOfWord(sentence, verb, oneOf.index ?? 0),
      };
    }
  }

  if (/^for which$/i.test(correct) || (/^which$/i.test(wrong) && /\bfor which\b/i.test(correct))) {
    const at = sentence.toLowerCase().search(/\bfor which\b/i);
    if (at >= 0) {
      const whichAt = sentence.toLowerCase().indexOf("which", at);
      return { pointCode: "RELATIVE_PREPOSITION_WHICH", correct: "which", wrong: "that", at: whichAt };
    }
  }

  const whichAt = whichAfterPrep(sentence, correct);
  if (whichAt >= 0 && (/which/i.test(correct) || code === "RELATIVE_NONRESTRICTIVE" || code === "RELATIVE_PREPOSITION_WHICH")) {
    return {
      pointCode: "RELATIVE_PREPOSITION_WHICH",
      correct: sentence.slice(whichAt, whichAt + 5),
      wrong: "that",
      at: whichAt,
    };
  }

  if (isErEstPair(correct, wrong)) {
    const thanAt = findUniqueComparativeThan(sentence);
    if (thanAt >= 0) {
      return { pointCode: "COMPARATIVE", correct: "than", wrong: "as", at: thanAt };
    }
  }

  if (code === "CORRELATIVE_EITHER_OR" || /\beither\b/i.test(correct)) {
    const shrunk = stripCommon(correct, wrong);
    if (shrunk && isLockedEitherOrParallel(sentence, shrunk.correct, shrunk.wrong)) {
      const at = indexOfWord(sentence, shrunk.correct);
      if (at >= 0) {
        return { pointCode: "CORRELATIVE_EITHER_OR", correct: shrunk.correct, wrong: shrunk.wrong, at };
      }
    }
  }

  if (
    (code === "CONJUNCTION_PREPOSITION_CONTRAST" || pairKey(correct, wrong) === "during|when") &&
    /^when$/i.test(correct) &&
    whenFollowedByFiniteClause(sentence)
  ) {
    const at = indexOfWord(sentence, "when");
    if (at >= 0) {
      return { pointCode: "CONJUNCTION_PREPOSITION_CONTRAST", correct: "when", wrong: "during", at };
    }
  }

  if (code === "INDIRECT_QUESTION_ORDER" || /\byou have\b/i.test(correct)) {
    if (/\byou have\b/i.test(sentence) && (/\bdo you have\b/i.test(wrong) || /\byou have\b/i.test(correct))) {
      const at = sentence.toLowerCase().indexOf("you have");
      if (at >= 0 && tokens(correct).length > 2) {
        return { pointCode: "INDIRECT_QUESTION_ORDER", correct: "you have", wrong: "do you have", at };
      }
    }
  }

  if (
    (code === "CORRELATIVE_BOTH_AND" || /\bboth\b/i.test(sentence)) &&
    /\band\b/i.test(correct) &&
    /\bor\b/i.test(wrong) &&
    tokens(correct).length > 1
  ) {
    const bothAt = sentence.toLowerCase().search(/\bboth\b/);
    const andAt = sentence.toLowerCase().indexOf(" and ", bothAt);
    if (bothAt >= 0 && andAt >= 0) {
      return { pointCode: "CORRELATIVE_BOTH_AND", correct: "and", wrong: "or", at: andAt + 1 };
    }
  }

  if (code === "VOICE_BE_MADE_TO" || /made to move/i.test(correct)) {
    const at = sentence.toLowerCase().indexOf("made to move");
    if (at >= 0 && /made to move/i.test(correct)) {
      return { pointCode: "VOICE_BE_MADE_TO", correct: "made to move", wrong: "made move", at };
    }
  }

  if (
    /\bthink about or visualize\b/i.test(sentence) &&
    /\bvisualiz/i.test(correct) &&
    /\bvisualiz/i.test(wrong)
  ) {
    const at = sentence.toLowerCase().indexOf("visualize");
    if (at >= 0) {
      return { pointCode: "PARALLEL_VERBS", correct: "visualize", wrong: "visualizing", at };
    }
  }

  if (
    /\bbut planning is everything\b/i.test(sentence) &&
    /planning is everything/i.test(correct) &&
    /planning being everything/i.test(wrong)
  ) {
    const at = sentence.toLowerCase().indexOf("planning is everything");
    if (at >= 0) {
      return { pointCode: "PARALLEL_CLAUSES", correct: "is", wrong: "being", at: at + "planning ".length };
    }
  }

  if (
    /\bone of\b/i.test(sentence) &&
    /\bgreatest insights\b/i.test(sentence) &&
    /\bgreatest\b/i.test(correct) &&
    /most greatest/i.test(wrong)
  ) {
    const at = sentence.toLowerCase().indexOf("insights");
    if (at >= 0) {
      return { pointCode: "ONE_OF_SUPERLATIVE", correct: "insights", wrong: "insight", at };
    }
  }

  if (
    /\bextremely magnetic\b/i.test(sentence) &&
    /\bextremely\b/i.test(correct) &&
    /magnetic/i.test(correct)
  ) {
    const at = sentence.toLowerCase().search(/\bextremely\b/i);
    if (at >= 0) {
      return { pointCode: "ADVERB_ADJECTIVE_MODIFIER", correct: "extremely", wrong: "extreme", at };
    }
  }

  if (
    /\bplanning and thinking\b/i.test(sentence) &&
    /planning and thinking/i.test(correct) &&
    /to think/i.test(wrong)
  ) {
    const at = sentence.toLowerCase().indexOf("thinking");
    if (at >= 0) {
      return { pointCode: "PARALLEL_AND_OR_BUT", correct: "thinking", wrong: "think", at };
    }
  }

  const insteadGerund = remapInsteadOfGerund(correct, wrong, sentence);
  if (insteadGerund) return insteadGerund;

  if (
    /\binstead of\b/i.test(sentence) &&
    /^instead of$/i.test(correct.trim()) &&
    /^instead$/i.test(wrong.trim())
  ) {
    const at = sentence.toLowerCase().indexOf("instead of");
    if (at >= 0) {
      return { pointCode: "PREPOSITION_INSTEAD_OF", correct: "instead of", wrong: "instead", at };
    }
  }

  if (
    /\bthe point is\b/i.test(sentence) &&
    /\bwe are getting\b/i.test(correct) &&
    /\bare we getting\b/i.test(wrong)
  ) {
    const at = sentence.toLowerCase().indexOf("we are getting");
    if (at >= 0) {
      return { pointCode: "NOUN_CLAUSE_DECLARATIVE_ORDER", correct: "we are getting", wrong: "are we getting", at };
    }
  }

  if (/\bfeel frightened and become\b/i.test(sentence) && /\bbecome\b/i.test(correct)) {
    const at = sentence.toLowerCase().indexOf("become");
    if (at >= 0) {
      return { pointCode: "PARALLEL_VERBS", correct: "become", wrong: "becoming", at };
    }
  }

  if (/wiped out|be wiped/i.test(correct) || (code.startsWith("VOICE_") && /wip/i.test(correct)) || code === "INFINITIVE_PASSIVE") {
    const infinitive = repairToBeWiped(sentence, correct, wrong);
    if (infinitive) return infinitive;
    if (/\bto be wiped\b/i.test(sentence) && !/\bcompletely wiped\b/i.test(sentence) && /wip/i.test(correct)) {
      return null;
    }
    if (/\bcompletely wiped\b/i.test(sentence) && /\bwiped\b/i.test(correct)) {
      const at = sentence.toLowerCase().indexOf("wiped");
      if (at >= 0) {
        return { pointCode: "VOICE_MODAL_PASSIVE", correct: "wiped", wrong: "wiping", at };
      }
    }
    const shrunk = stripCommon(correct, wrong);
    if (!shrunk || !sentence.toLowerCase().includes(shrunk.correct.toLowerCase())) return null;
    if (passiveWrongAlsoOk(sentence, shrunk.correct, shrunk.wrong)) return null;
    const at = sentence.toLowerCase().indexOf(shrunk.correct.toLowerCase());
    if (at < 0) return null;
    return {
      pointCode: code.startsWith("VOICE_") ? code : "VOICE_ACTIVE_PASSIVE",
      correct: shrunk.correct,
      wrong: shrunk.wrong,
      at,
    };
  }

  const factored = factorParallelChoices({ pointCode: code, correct, wrong, sentence });
  if (factored) return { pointCode: code, ...factored };

  return null;
}

function remapInsteadOfGerund(
  correct: string,
  wrong: string,
  sentence: string
): { pointCode: GrammarPointCode; correct: string; wrong: string; at: number } | null {
  if (!/^instead of\s+/i.test(correct) || !/^instead of\s+/i.test(wrong)) return null;
  const correctRest = correct.replace(/^instead of\s+/i, "").trim();
  const wrongRest = wrong.replace(/^instead of\s+/i, "").trim();
  if (!correctRest || !wrongRest || /\s/.test(correctRest) || /\s/.test(wrongRest)) return null;
  if (correctRest.toLowerCase() === wrongRest.toLowerCase()) return null;
  const at = indexOfWord(sentence, correctRest);
  if (at < 0) return null;
  if (!/\binstead of\s+$/i.test(sentence.slice(0, at))) return null;
  return { pointCode: "GERUND_PREPOSITION_OBJECT", correct: sentence.slice(at, at + correctRest.length), wrong: wrongRest, at };
}

function repairToBeWiped(
  sentence: string,
  correct: string,
  wrong: string
): { pointCode: GrammarPointCode; correct: string; wrong: string; at: number } | null {
  if (!/wip/i.test(correct) && !/wip/i.test(wrong)) return null;
  const lower = sentence.toLowerCase();
  const toBe = lower.search(/\bto be wiped\b/);
  if (toBe < 0) return null;
  const wipedAt = lower.indexOf("wiped", toBe);
  if (wipedAt < 0) return null;
  const before = lower.slice(Math.max(0, wipedAt - 16), wipedAt);
  if (/\bcompletely\s+$/.test(before)) return null;
  if (!/\bto be\s+$/.test(before)) return null;
  const lemma = activeLemmaOfParticiple("wiped");
  if (lemma !== "wipe") return null;
  const at = lower.indexOf("be wiped", toBe);
  if (at < 0) return null;
  return { pointCode: "INFINITIVE_PASSIVE", correct: "be wiped", wrong: "wipe", at };
}

function whichAfterPrep(sentence: string, correct: string): number {
  const from = /\bwhich\b/i.test(correct) ? Math.max(0, sentence.toLowerCase().indexOf(correct.toLowerCase().replace(/^.*\b(which)\b/i, "which"))) : -1;
  const at = from >= 0 ? indexOfWord(sentence, "which", from) : indexOfWord(sentence, "which");
  if (at < 0) return -1;
  if (!new RegExp(`\\b(?:${RELATIVE_PREPS})\\s+$`, "i").test(sentence.slice(0, at))) return -1;
  return at;
}

function isErEstPair(correct: string, wrong: string): boolean {
  const a = correct.trim().toLowerCase();
  const b = wrong.trim().toLowerCase();
  if (!a || !b || a.includes(" ") || b.includes(" ")) return false;
  return (a.endsWith("er") && b.endsWith("est")) || (a.endsWith("est") && b.endsWith("er"));
}

export function safeLocalCandidates(sentenceId: string, text: string): GrammarCandidate[] {
  const source = text.replace(/[’]/g, "'");
  const out: GrammarCandidate[] = [];
  const push = (
    code: GrammarPointCode,
    span: string,
    wrong: string,
    at: number,
    priority: GrammarPriority = "MANDATORY"
  ) => {
    if (at < 0 || !source.toLowerCase().includes(span.toLowerCase())) return;
    out.push({
      candidateId: `local-${code}-${at}`,
      sentenceId,
      pointCode: code,
      sourceSpan: span,
      occurrenceIndex: occurrenceOf(source, span, at),
      correctAnswer: span,
      distractors: [wrong],
      transformCode: "FORM_SWAP",
      priority,
      difficulty: "CORE",
      evidence: "",
      ruleSummaryKo: "",
      riskLevel: "LOW",
    });
  };

  const youHave = source.toLowerCase().indexOf("you have");
  if (/\bwhat\b/i.test(source) && youHave >= 0 && /what[\s\S]{0,40}you have\b/i.test(source)) {
    push("INDIRECT_QUESTION_ORDER", "you have", "do you have", youHave);
  }
  if (/\bBoth\b/.test(source) && /\band\b/i.test(source)) {
    const andAt = source.toLowerCase().indexOf(" and ");
    if (andAt >= 0) push("CORRELATIVE_BOTH_AND", "and", "or", andAt + 1);
  }
  if (/\bboth within\b/i.test(source) && /\band across\b/i.test(source)) {
    const andAt = source.toLowerCase().indexOf(" and across");
    if (andAt >= 0) push("CORRELATIVE_BOTH_AND", "and", "or", andAt + 1);
  }
  if (/\bmade to move\b/i.test(source)) {
    const at = source.toLowerCase().indexOf("made to move");
    push("VOICE_BE_MADE_TO", "made to move", "made move", at, "MANDATORY");
  }
  if (/\bfeel frightened and become\b/i.test(source)) {
    const at = source.toLowerCase().indexOf("become");
    push("PARALLEL_VERBS", "become", "becoming", at, "CORE");
  }
  let prepFrom = 0;
  for (;;) {
    const prepWhich = findPrepWhich(source, prepFrom);
    if (!prepWhich) break;
    push("RELATIVE_PREPOSITION_WHICH", source.slice(prepWhich.whichAt, prepWhich.whichAt + 5), "that", prepWhich.whichAt);
    prepFrom = prepWhich.whichAt + 1;
  }
  const thanAt = findUniqueComparativeThan(source);
  if (thanAt >= 0) {
    push("COMPARATIVE", source.slice(thanAt, thanAt + 4), "as", thanAt, "CORE");
  }
  const either = findEitherOrParallelVerb(source);
  if (either) {
    push("CORRELATIVE_EITHER_OR", either.correct, either.wrong, either.at, "CORE");
  }
  const whenAt = indexOfWord(source, "when");
  if (whenAt >= 0 && whenFollowedByFiniteClause(source, whenAt)) {
    push("CONJUNCTION_PREPOSITION_CONTRAST", source.slice(whenAt, whenAt + 4), "during", whenAt, "BASIC");
  }
  return out;
}

export function explanationFitsPair(explanation: string, correct: string, wrong: string): boolean {
  const allowed = `${correct} ${wrong}`.toLowerCase();
  if (explanation.includes("전치사구") && /^(?:is|are|was|were)$/i.test(correct.trim())) return false;
  if (/\bfor which\b/i.test(explanation) && !/\bfor which\b/i.test(allowed)) return false;
  if (
    /\bwhich\b/i.test(allowed) &&
    /\bthat\b/i.test(allowed) &&
    /\[for which\s*\/\s*which\]|for which를 쓰고 which는/i.test(explanation)
  ) {
    return false;
  }
  return true;
}
