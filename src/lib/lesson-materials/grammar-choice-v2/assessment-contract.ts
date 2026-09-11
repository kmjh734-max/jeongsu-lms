import type { LocalRejectCode } from "@/lib/lesson-materials/grammar-choice-v2/types";
import { spanStart } from "@/lib/lesson-materials/grammar-choice-v2/local-validators";
import {
  comparativeThanIsUnique,
  findUniqueComparativeThan,
  hasInterveningAgreement,
  hasPrepWhich,
  isPostmodifyingPastParticiple,
  whenFollowedByFiniteClause,
} from "@/lib/lesson-materials/grammar-choice-v2/structure-frames";

const COORD = /^(?:and|or|but)$/i;

function pairKey(left: string, right: string): string {
  return [left, right].map((s) => s.trim().toLowerCase()).sort().join("|");
}

function tokens(text: string): string[] {
  return text.trim().split(/\s+/).filter(Boolean);
}

function escapeRe(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function isGerundBasePair(correct: string, wrong: string): boolean {
  const c = correct.trim().toLowerCase();
  const w = wrong.trim().toLowerCase();
  if (!c || !w || c.includes(" ") || w.includes(" ")) return false;
  const ing = c.endsWith("ing") ? c : w.endsWith("ing") ? w : "";
  const base = ing === c ? w : c;
  if (!ing || !base || base.endsWith("ing")) return false;
  const stem = ing.replace(/ing$/, "");
  /**
   * -ing를 떼면 자음이 겹쳐 남는 형태가 있다: chopping -> chopp, planning -> plann,
   * getting -> gett. 겹친 자음 하나를 떼야 원형이 된다.
   *
   * 예전에는 이 경우를 몰라서 by chopping [chopping / chop] 같은 표준 전치사+동명사
   * 문항이 CODE_SPAN_CONTRACT_MISMATCH로 죽었다. filling처럼 원래 겹자음인 낱말은
   * base === stem에서 이미 통과하므로 이 완화가 그쪽 판정을 바꾸지 않는다.
   */
  const dedoubled =
    stem.length > 2 && /([bdfglmnprt])\1$/.test(stem) ? stem.slice(0, -1) : "";
  const stems = dedoubled ? [stem, dedoubled] : [stem];
  return stems.some(
    (candidate) =>
      base === candidate ||
      base === `${candidate}e` ||
      base.replace(/e$/, "") === candidate
  );
}

function followingToken(sentence: string, span: string): string {
  const at = spanStart(sentence, span);
  if (at < 0) return "";
  const after = sentence.slice(at + span.trim().length).trim();
  return (after.split(/\s+/)[0] ?? "").replace(/[^A-Za-z'-]/g, "");
}

function insteadOfNounShape(correct: string, wrong: string, sentence: string): boolean {
  if (!/^instead of$/i.test(correct.trim())) return false;
  if (!/^instead$/i.test(wrong.trim())) return false;
  const next = followingToken(sentence, "instead of");
  if (!next) return false;
  if (/^(?:that|what|which|if|when|because|although|though)$/i.test(next)) return false;
  return true;
}

function prepositionBefore(sentence: string, span: string): boolean {
  const at = spanStart(sentence, span);
  if (at <= 0) return false;
  const before = sentence.slice(0, at);
  return /\b(?:of|by|before|after|about|without|from|in|on|at|for|with|to)\s+$/i.test(before);
}

function toBeBefore(sentence: string, span: string): boolean {
  const at = spanStart(sentence, span);
  if (at < 0) return false;
  return /\bto\s+$/i.test(sentence.slice(0, at));
}

function modalBeBefore(sentence: string, span: string): boolean {
  const at = spanStart(sentence, span);
  if (at < 0) return false;
  const before = sentence.slice(Math.max(0, at - 48), at);
  return /\b(?:can|could|may|might|must|shall|should|will|would)\s+be(?:\s+\w+){0,2}\s+$/i.test(before);
}

/** Structural code/span/pair/subtype/axis check. Not sentence-hardcoded. */
export function codeSpanContractMismatch(input: {
  pointCode: string;
  subtype: string;
  assessmentAxis: string;
  correct: string;
  wrong: string;
  sentence: string;
}): Extract<LocalRejectCode, "CODE_SPAN_CONTRACT_MISMATCH"> | null {
  const code = input.pointCode;
  const pair = pairKey(input.correct, input.wrong);
  const subtype = input.subtype;
  const axis = input.assessmentAxis;
  const sentence = input.sentence.replace(/[’]/g, "'");

  if (code === "PREPOSITION_INSTEAD_OF") {
    if (!insteadOfNounShape(input.correct, input.wrong, sentence)) return "CODE_SPAN_CONTRACT_MISMATCH";
    if (subtype !== "INSTEAD_OF_NOUN") return "CODE_SPAN_CONTRACT_MISMATCH";
    if (axis !== "FIXED_PREPOSITIONAL_PHRASE" && axis !== "PREPOSITION_INSTEAD_OF") {
      return "CODE_SPAN_CONTRACT_MISMATCH";
    }
    if (isGerundBasePair(input.correct, input.wrong)) return "CODE_SPAN_CONTRACT_MISMATCH";
    return null;
  }

  if (code === "GERUND_PREPOSITION_OBJECT") {
    if (!isGerundBasePair(input.correct, input.wrong)) return "CODE_SPAN_CONTRACT_MISMATCH";
    if (!prepositionBefore(sentence, input.correct)) return "CODE_SPAN_CONTRACT_MISMATCH";
    if (pair === "instead|instead of") return "CODE_SPAN_CONTRACT_MISMATCH";
    if (subtype !== "PREP_GERUND" && subtype !== "GERUND_PREP_OBJECT" && !subtype.includes("PREP_GERUND")) {
      return "CODE_SPAN_CONTRACT_MISMATCH";
    }
    if (axis !== "GERUND_PREPOSITION_OBJECT") return "CODE_SPAN_CONTRACT_MISMATCH";
    return null;
  }

  if (code === "INFINITIVE_PASSIVE") {
    if (!/^be\s+[a-z]+$/i.test(input.correct.trim())) return "CODE_SPAN_CONTRACT_MISMATCH";
    if (pair === "wiped|wiping") return "CODE_SPAN_CONTRACT_MISMATCH";
    if (!toBeBefore(sentence, input.correct)) return "CODE_SPAN_CONTRACT_MISMATCH";
    if (subtype !== "TO_BE_PP") return "CODE_SPAN_CONTRACT_MISMATCH";
    if (axis !== "INFINITIVE_PASSIVE") return "CODE_SPAN_CONTRACT_MISMATCH";
    return null;
  }

  if (
    (code === "VOICE_ACTIVE_PASSIVE" || code === "VOICE_MODAL_PASSIVE") &&
    /wip/i.test(input.correct) &&
    /\bto be wiped\b/i.test(sentence) &&
    !/\bcompletely wiped\b/i.test(sentence) &&
    !/^be wiped$/i.test(input.correct.trim())
  ) {
    return "CODE_SPAN_CONTRACT_MISMATCH";
  }

  if (code === "VOICE_MODAL_PASSIVE" && pair === "wiped|wiping") {
    if (!modalBeBefore(sentence, input.correct)) return "CODE_SPAN_CONTRACT_MISMATCH";
    if (toBeBefore(sentence, input.correct) && !/\bcompletely\s+wiped\b/i.test(sentence)) {
      return "CODE_SPAN_CONTRACT_MISMATCH";
    }
    if (axis !== "VOICE_MODAL_PASSIVE") return "CODE_SPAN_CONTRACT_MISMATCH";
    return null;
  }

  if (
    (code === "VOICE_ACTIVE_PASSIVE" || code === "VOICE_MODAL_PASSIVE") &&
    pair === "wiped|wiping" &&
    /\bto be wiped\b/i.test(sentence) &&
    !/\bcompletely wiped\b/i.test(sentence)
  ) {
    return "CODE_SPAN_CONTRACT_MISMATCH";
  }

  if (code === "PARALLEL_CLAUSES" && pair === "that|what") {
    if (axis !== "PARALLEL_CLAUSES" && axis !== input.pointCode) return "CODE_SPAN_CONTRACT_MISMATCH";
    return null;
  }

  if (code === "NOUN_CLAUSE_DECLARATIVE_ORDER") {
    const c = tokens(input.correct);
    const w = tokens(input.wrong);
    if (c.length < 2 || w.length < 2) return "CODE_SPAN_CONTRACT_MISMATCH";
    if (axis !== "NOUN_CLAUSE_DECLARATIVE_ORDER") return "CODE_SPAN_CONTRACT_MISMATCH";
    return null;
  }

  if (code === "AGREEMENT_DISTANCE" && subtype === "INTERVENING_MODIFIER") {
    if (!hasInterveningAgreement(sentence, input.correct)) return "CODE_SPAN_CONTRACT_MISMATCH";
    return null;
  }

  if (code === "PARTICIPLE_ACTIVE_PASSIVE" && subtype === "POSTMODIFYING_PP") {
    if (!isPostmodifyingPastParticiple(sentence, input.correct)) return "CODE_SPAN_CONTRACT_MISMATCH";
    return null;
  }

  if (code === "RELATIVE_PREPOSITION_WHICH" && pair === "that|which") {
    if (!hasPrepWhich(sentence)) return "CODE_SPAN_CONTRACT_MISMATCH";
    if (subtype !== "PREP_WHICH" && !subtype.includes("PREP")) return "CODE_SPAN_CONTRACT_MISMATCH";
    return null;
  }

  if (code === "COMPARATIVE" && pair === "as|than") {
    const thanAt = findUniqueComparativeThan(sentence);
    if (thanAt < 0 || !comparativeThanIsUnique(sentence, thanAt)) return "CODE_SPAN_CONTRACT_MISMATCH";
    if (subtype !== "THAN_FRAME" && !subtype.includes("THAN")) return "CODE_SPAN_CONTRACT_MISMATCH";
    return null;
  }

  if (code === "CONJUNCTION_PREPOSITION_CONTRAST" && pair === "during|when") {
    if (!whenFollowedByFiniteClause(sentence)) return "CODE_SPAN_CONTRACT_MISMATCH";
    return null;
  }

  return null;
}

export function explanationContractMismatch(input: {
  pointCode: string;
  correct: string;
  wrong: string;
  explanation: string;
}): boolean {
  const text = input.explanation;
  const pair = pairKey(input.correct, input.wrong);
  const pairText = `${input.correct} ${input.wrong}`;
  if (/\bink\b/i.test(text) && !/\bink\b/i.test(pairText)) return true;
  if (/\bspecies\b/i.test(text) && !/\bspecies\b/i.test(pairText)) return true;

  if (input.pointCode === "PREPOSITION_INSTEAD_OF") {
    if (!/instead of/.test(text) || !/명사|동명사/.test(text)) return true;
    if (/전치사 뒤에는 동명사|to be p\.p|내용절/.test(text)) return true;
  }
  if (input.pointCode === "GERUND_PREPOSITION_OBJECT") {
    if (!/전치사/.test(text) || !/V-ing|동명사/.test(text)) return true;
    if (/복합전치사 instead of|instead는 부사/.test(text)) return true;
  }
  if (input.pointCode === "INFINITIVE_PASSIVE") {
    if (pair !== "be wiped|wipe" && !/^be\s+/.test(input.correct.trim().toLowerCase())) return false;
    if (!/to be p\.p/.test(text)) return true;
    if (/modal \+ be p\.p/.test(text)) return true;
  }
  if (input.pointCode === "VOICE_MODAL_PASSIVE" && pair === "wiped|wiping") {
    if (!/조동사|modal \+ be p\.p/.test(text) || !/p\.p/.test(text)) return true;
    if (/to부정사의 수동형|to be p\.p/.test(text)) return true;
  }
  if (input.pointCode === "NOUN_CLAUSE_DECLARATIVE_ORDER") {
    if (!/주어\s*\+\s*동사|S \+ V/.test(text)) return true;
  }
  if (input.pointCode === "PARALLEL_CLAUSES" && pair === "that|what") {
    if (!/완전한/.test(text) || !/that/.test(text) || !/what/.test(text)) return true;
    if (!/문장 성분|주어나 목적어/.test(text)) return true;
    if (/같은 접속 구조/.test(text) && !/완전한 내용절/.test(text)) return true;
  }
  if (input.pointCode === "AGREEMENT_DISTANCE" && pair === "like|likes") {
    if (!/수식어|장거리/.test(text)) return true;
  }
  if (input.pointCode === "PARTICIPLE_ACTIVE_PASSIVE" && pair === "involved|involving") {
    if (!/후치수식/.test(text) || !/과거분사/.test(text)) return true;
  }
  if (input.pointCode === "RELATIVE_PREPOSITION_WHICH" && pair === "that|which") {
    if (!/전치사/.test(text) || !/which/.test(text) || !/that/.test(text)) return true;
  }
  if (input.pointCode === "COMPARATIVE" && pair === "as|than") {
    if (!/비교급/.test(text) || !/than/.test(text)) return true;
  }
  if (input.pointCode === "CONJUNCTION_PREPOSITION_CONTRAST" && pair === "during|when") {
    if (!/절/.test(text) || !/when/.test(text)) return true;
  }
  return false;
}

export function sharedParallelPrefix(correct: string, wrong: string): { prefix: string; correctRest: string; wrongRest: string } | null {
  const c = tokens(correct);
  const w = tokens(wrong);
  if (c.length < 2 || w.length < 2) return null;
  let start = 0;
  while (start < c.length && start < w.length && c[start]!.toLowerCase() === w[start]!.toLowerCase()) start += 1;
  if (start < 2) return null;
  const prefixTokens = c.slice(0, start);
  if (!COORD.test(prefixTokens[prefixTokens.length - 1] ?? "")) return null;
  const restC = c.slice(start);
  const restW = w.slice(start);
  if (!restC.length || !restW.length || restC.length > 2 || restW.length > 2) return null;
  return { prefix: prefixTokens.join(" "), correctRest: restC.join(" "), wrongRest: restW.join(" ") };
}

export function factorParallelChoices(input: {
  pointCode: string;
  correct: string;
  wrong: string;
  sentence: string;
}): { correct: string; wrong: string; at: number } | null {
  if (input.pointCode !== "PARALLEL_VERBS" && input.pointCode !== "PARALLEL_AND_OR_BUT") return null;
  if (/\bmade\b/i.test(input.correct) && /\bto\b/i.test(`${input.correct} ${input.wrong}`)) return null;
  const shared = sharedParallelPrefix(input.correct, input.wrong);
  if (!shared) return null;
  const sentence = input.sentence.replace(/[’]/g, "'");
  const expected = `${shared.prefix} ${shared.correctRest}`.toLowerCase();
  if (input.correct.trim().toLowerCase() !== expected) return null;
  const fullAt = sentence.toLowerCase().indexOf(expected);
  if (fullAt < 0) return null;
  const prefixRe = new RegExp(`\\b${escapeRe(shared.prefix)}\\b`, "gi");
  const prefixHits = sentence.match(prefixRe) ?? [];
  if (prefixHits.length !== 1) return null;
  const restAt = fullAt + shared.prefix.length + 1;
  const slice = sentence.slice(restAt, restAt + shared.correctRest.length);
  if (slice.toLowerCase() !== shared.correctRest.toLowerCase()) return null;
  const restored = sentence.slice(0, restAt) + slice + sentence.slice(restAt + slice.length);
  if (restored !== sentence) return null;
  const beforeBlank = sentence.slice(0, restAt);
  if (!/\b(?:and|or|but)\s+$/i.test(beforeBlank)) return null;
  return { correct: slice, wrong: shared.wrongRest, at: restAt };
}
