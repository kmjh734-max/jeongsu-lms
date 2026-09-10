import type { GrammarPointCode, LocalRejectCode } from "@/lib/lesson-materials/grammar-choice-v2/types";

export type ConditionalCh05Rule = {
  code: GrammarPointCode;
  label: string;
  subtype: string;
  priority: "MANDATORY";
  detectionSignals: string[];
  allowedMinimalPairs: Array<[string, string]>;
  rejectConditions: string[];
  referenceChapter: "CH05";
  ownerChapter?: "CH05";
};

export const CONDITIONAL_CH05_RULES: ConditionalCh05Rule[] = [
  {
    code: "CONDITIONAL_SECOND",
    label: "가정법 과거",
    subtype: "IF_PAST_MODAL_BASE",
    priority: "MANDATORY",
    detectionSignals: ["if + past/were/had+noun", "result would/could/might + base"],
    allowedMinimalPairs: [
      ["were", "had been"],
      ["knew", "know"],
    ],
    rejectConditions: [
      "open present if",
      "past factual if",
      "whether-if",
      "even if",
      "if-clause will/would of volition",
      "was/were without subjunctive frame",
      "whole if-clause as a choice",
    ],
    referenceChapter: "CH05",
  },
  {
    code: "CONDITIONAL_THIRD",
    label: "가정법 과거완료",
    subtype: "IF_HAD_PP_MODAL_HAVE_PP",
    priority: "MANDATORY",
    detectionSignals: ["if + had + past participle", "result would/could/might have p.p."],
    allowedMinimalPairs: [["had been", "were"], ["would have caught", "would catch"]],
    rejectConditions: ["had + noun is not past perfect", "whole if-clause as a choice"],
    referenceChapter: "CH05",
  },
  {
    code: "CONDITIONAL_MIXED",
    label: "혼합가정법",
    subtype: "PAST_FACT_PRESENT_RESULT",
    priority: "MANDATORY",
    detectionSignals: ["if + had p.p.", "result would/could/might + base", "present result marker"],
    allowedMinimalPairs: [["would", "would have"]],
    rejectConditions: ["both a factual past and a present result are equally possible", "whole clause"],
    referenceChapter: "CH05",
  },
  {
    code: "CONDITIONAL_INVERTED_HAD",
    label: "if 생략 도치 Had",
    subtype: "INVERSION_HAD",
    priority: "MANDATORY",
    detectionSignals: ["Had + subject + past participle", "no if"],
    allowedMinimalPairs: [["known", "knew"]],
    rejectConditions: ["question Had + subject", "whole inversion clause"],
    referenceChapter: "CH05",
  },
  {
    code: "CONDITIONAL_INVERTED_WERE",
    label: "if 생략 도치 Were",
    subtype: "INVERSION_WERE",
    priority: "MANDATORY",
    detectionSignals: ["Were + subject", "result would/could/might + base"],
    allowedMinimalPairs: [["Were", "If"]],
    rejectConditions: ["bare was/were", "Were as a question"],
    referenceChapter: "CH05",
  },
  {
    code: "CONDITIONAL_INVERTED_SHOULD",
    label: "if 생략 도치 Should",
    subtype: "INVERSION_SHOULD",
    priority: "MANDATORY",
    detectionSignals: ["Should + subject + base", "result would/could/might"],
    allowedMinimalPairs: [["fail", "failed"]],
    rejectConditions: ["Should as obligation", "modal + try/tries"],
    referenceChapter: "CH05",
  },
  {
    code: "WISH_PAST",
    label: "I wish 현재 반대",
    subtype: "WISH_PRESENT_COUNTERFACTUAL",
    priority: "MANDATORY",
    detectionSignals: ["wish + subject + past verb", "not had p.p.", "not would"],
    allowedMinimalPairs: [["knew", "know"]],
    rejectConditions: ["I wish you luck", "was/were only"],
    referenceChapter: "CH05",
  },
  {
    code: "WISH_PAST_PERFECT",
    label: "I wish 과거 반대",
    subtype: "WISH_PAST_COUNTERFACTUAL",
    priority: "MANDATORY",
    detectionSignals: ["wish + subject + had + past participle"],
    allowedMinimalPairs: [["had studied", "studied"]],
    rejectConditions: ["wish + noun object only"],
    referenceChapter: "CH05",
  },
  {
    code: "WISH_WOULD",
    label: "I wish 미래 유감·바람",
    subtype: "WISH_FUTURE",
    priority: "MANDATORY",
    detectionSignals: ["wish + subject + would + base"],
    allowedMinimalPairs: [["would", "will"]],
    rejectConditions: ["would of polite if-clause"],
    referenceChapter: "CH05",
  },
  {
    code: "AS_IF_PAST",
    label: "as if 동시 가정",
    subtype: "AS_IF_SAME_TIME",
    priority: "MANDATORY",
    detectionSignals: ["as if/as though + past", "main clause present"],
    allowedMinimalPairs: [["knew", "know"]],
    rejectConditions: ["as if + present, possibly factual", "both indicative and subjunctive possible"],
    referenceChapter: "CH05",
  },
  {
    code: "AS_IF_PAST_PERFECT",
    label: "as if 선행 가정",
    subtype: "AS_IF_EARLIER",
    priority: "MANDATORY",
    detectionSignals: ["as if/as though + had + past participle"],
    allowedMinimalPairs: [["had seen", "saw"]],
    rejectConditions: ["as if + present factual reading"],
    referenceChapter: "CH05",
  },
  {
    code: "WITHOUT_IF_CONDITION",
    label: "without / but for",
    subtype: "WITHOUT_BUT_FOR",
    priority: "MANDATORY",
    detectionSignals: ["clause-initial Without/But for", "comma + would/could/might"],
    allowedMinimalPairs: [["would", "will"]],
    rejectConditions: ["without inside a noun phrase", "do not recast a real if as without"],
    referenceChapter: "CH05",
  },
  {
    code: "OTHERWISE_CONDITIONAL",
    label: "otherwise",
    subtype: "OTHERWISE",
    priority: "MANDATORY",
    detectionSignals: ["otherwise + would/could/might"],
    allowedMinimalPairs: [["would", "will"]],
    rejectConditions: ["otherwise without a modal result"],
    referenceChapter: "CH05",
  },
  {
    code: "IF_ONLY",
    label: "if only",
    subtype: "IF_ONLY",
    priority: "MANDATORY",
    detectionSignals: ["if only + past or had p.p."],
    allowedMinimalPairs: [
      ["had known", "known"],
      ["were", "would be"],
    ],
    rejectConditions: ["only if is not if only"],
    referenceChapter: "CH05",
  },
  {
    code: "IT_IS_TIME_SUBJUNCTIVE",
    label: "It is time",
    subtype: "IT_IS_TIME",
    priority: "MANDATORY",
    detectionSignals: ["it is time + subject + past verb"],
    allowedMinimalPairs: [["went", "go"]],
    rejectConditions: ["it is time to + base"],
    referenceChapter: "CH05",
  },
  {
    code: "WOULD_RATHER_SUBJUNCTIVE",
    label: "would rather 별도 주어",
    subtype: "PRESENT_FUTURE_PREFERENCE",
    priority: "MANDATORY",
    detectionSignals: ["would rather + other subject + past"],
    allowedMinimalPairs: [["stayed", "will stay"]],
    rejectConditions: ["would rather try/tries", "same-subject stay/stayed", "past and past perfect both possible"],
    referenceChapter: "CH05",
    ownerChapter: "CH05",
  },
  {
    code: "WOULD_RATHER_SUBJUNCTIVE",
    label: "would rather 과거 사실",
    subtype: "PAST_REGRET",
    priority: "MANDATORY",
    detectionSignals: ["would rather + other subject + had p.p."],
    allowedMinimalPairs: [["had told", "told"]],
    rejectConditions: ["would rather try/tries", "same-subject stay/stayed", "past and past perfect both possible"],
    referenceChapter: "CH05",
    ownerChapter: "CH05",
  },
];

export type ConditionalHit = {
  code: GrammarPointCode;
  subtype: string;
  sourceSpan: string;
  occurrenceIndex: number;
  exclusionReason?: LocalRejectCode;
};

const PAST_PARTICIPLE = new Set([
  "been", "gone", "done", "seen", "known", "left", "made", "taken", "written",
  "studied", "called", "told", "given", "found", "thought", "brought", "bought",
  "caught", "taught", "felt", "kept", "held", "built", "lost", "met", "paid",
  "said", "slept", "stood", "understood", "worn", "won", "heard", "meant",
]);

const PAST_TO_BASE: Record<string, string> = {
  knew: "know",
  went: "go",
  saw: "see",
  came: "come",
  took: "take",
  made: "make",
  gave: "give",
  left: "leave",
  told: "tell",
  found: "find",
  thought: "think",
  brought: "bring",
  bought: "buy",
  caught: "catch",
  taught: "teach",
  felt: "feel",
  kept: "keep",
  held: "hold",
  built: "build",
  lost: "lose",
  met: "meet",
  paid: "pay",
  said: "say",
  slept: "sleep",
  stood: "stand",
  understood: "understand",
  wore: "wear",
  won: "win",
  heard: "hear",
  meant: "mean",
  studied: "study",
  lived: "live",
  stayed: "stay",
  failed: "fail",
  called: "call",
};

const PP_TO_PAST: Record<string, string> = {
  known: "knew",
  seen: "saw",
  gone: "went",
  done: "did",
  been: "was",
  written: "wrote",
  taken: "took",
  given: "gave",
  studied: "studied",
};

const OPEN_IF = /\bif\s+(?:there(?:'s|\s+is|\s+are)|there\s+is|it\s+is|he\s+is|she\s+is|they\s+are|we\s+are|you\s+are|I\s+am)\b/i;
const RESULT_MODAL = /\b(?:would|could|might)\b(?!(?:\s+not)?\s+have\b)/i;
const RESULT_HAVE = /\b(?:would|could|might)(?:\s+not)?\s+have\b/i;

export function detectConditionalCh05(text: string): ConditionalHit[] {
  const hits: ConditionalHit[] = [];
  const source = text.replace(/[’]/g, "'");
  detectIfConditionals(source, hits);
  detectInversion(source, hits);
  detectWish(source, hits);
  detectAsIf(source, hits);
  detectWithout(source, hits);
  detectOtherwise(source, hits);
  detectIfOnly(source, hits);
  detectItIsTime(source, hits);
  detectWouldRather(source, hits);
  return dedupe(hits);
}

export function conditionalLocalDistractor(code: string, sourceSpan: string): string | null {
  const span = sourceSpan.trim();
  const lower = span.toLowerCase();
  if (code === "CONDITIONAL_SECOND") {
    if (lower === "had" || lower === "were") return null;
    if (lower === "used") return "would use";
    return baseOf(span);
  }
  if (code === "CONDITIONAL_THIRD" || code === "IF_ONLY") {
    if (lower === "had" || lower === "were") return null;
    if (lower.startsWith("had ")) return span.replace(/^had\s+/i, "");
  }
  if (code === "CONDITIONAL_MIXED" && lower === "would") return "would have";
  if (code === "CONDITIONAL_INVERTED_HAD") return PP_TO_PAST[lower] ?? null;
  if (code === "CONDITIONAL_INVERTED_WERE" && lower === "were") return "If";
  if (code === "CONDITIONAL_INVERTED_SHOULD") return pastOf(span);
  if (code === "WISH_PAST" || code === "AS_IF_PAST" || code === "IT_IS_TIME_SUBJUNCTIVE") {
    return baseOf(span);
  }
  if (code === "WISH_PAST_PERFECT" || code === "AS_IF_PAST_PERFECT") {
    if (lower.startsWith("had ")) return span.replace(/^had\s+/i, "");
    if (lower === "had") return "would have";
  }
  if (code === "WISH_WOULD" && lower === "would") return "will";
  if ((code === "WITHOUT_IF_CONDITION" || code === "OTHERWISE_CONDITIONAL") && lower === "would") {
    return "will";
  }
  if (code === "WOULD_RATHER" || code === "WOULD_RATHER_SUBJUNCTIVE") return oppositeRather(span);
  return null;
}

export function rejectConditionalChoice(input: {
  pointCode: string;
  correct: string;
  wrong: string;
  sentence: string;
}): "BOTH_GRAMMATICAL" | "MEANING_ONLY_CONTRAST" | "NON_MINIMAL_SPAN" | "TOO_TRIVIAL_SHORT_AGREEMENT" | "MECHANICAL_MODAL_FORM" | "AMBIGUOUS_TENSE" | "MECHANICAL_IF_WOULD_CONTRAST" | "AMBIGUOUS_CONDITIONAL_TIME" | "NO_UNIQUE_HIGH_VALUE_CONDITIONAL_PAIR" | null {
  const correct = input.correct.trim();
  const wrong = input.wrong.trim();
  const pair = [correct, wrong].map((s) => s.toLowerCase()).sort().join("|");
  /**
   * 자기 챕터 후보에만 적용한다.
   *
   * 이 게이트는 원래 함수 한참 아래에 있었고, 그 위의 검사들이 챕터와 무관하게
   * 모든 후보에 적용됐다. 그래서 두 가지가 깨졌다:
   *  - 시제 후보가 assessConditionalTensePair에 걸려 AMBIGUOUS_TENSE로 죽었다.
   *    (관측: 제안된 TENSE 후보 전부가 가정법 로직에 의해 탈락)
   *  - had|would have / were|would be 쌍이 무조건 죽었다. 그런데 이 쌍은
   *    local-validators의 repairForbiddenConditionalDistractor가 일부러 만들고,
   *    distractor-guard와 minimal-pair는 정당한 것으로 허용하며,
   *    IF_ONLY 규칙은 자기 allowedMinimalPairs로 선언한다. 세 모듈이 모순이었다.
   */
  if (!isConditionalCh05Code(input.pointCode) && input.pointCode !== "WOULD_RATHER") {
    return null;
  }
  if (pair === "had|would have" || pair === "were|would be") return "MECHANICAL_IF_WOULD_CONTRAST";
  if (pair === "if|unless") return "MEANING_ONLY_CONTRAST";
  if (pair === "try|tries" || pair === "could try|could tries" || pair === "stay|stayed") {
    return "MECHANICAL_MODAL_FORM";
  }
  if (isDarwinNoUniqueConditional(input.sentence) && input.pointCode.startsWith("CONDITIONAL_")) {
    return "NO_UNIQUE_HIGH_VALUE_CONDITIONAL_PAIR";
  }
  const tense = assessConditionalTensePair(input.sentence, correct, wrong);
  if (tense) return tense;
  if (
    (input.pointCode === "WOULD_RATHER" || input.pointCode === "WOULD_RATHER_SUBJUNCTIVE") &&
    isAmbiguousRather(input.sentence)
  ) {
    return "AMBIGUOUS_TENSE";
  }
  if (correct.split(/\s+/).length > 4 || wrong.split(/\s+/).length > 4) return "NON_MINIMAL_SPAN";
  if (/\bif\b/i.test(correct) && correct.split(/\s+/).length > 2) return "NON_MINIMAL_SPAN";
  if (pair === "was|were") return "BOTH_GRAMMATICAL";
  if (isOpenRealCondition(input.sentence) && input.pointCode.startsWith("CONDITIONAL_")) {
    return "BOTH_GRAMMATICAL";
  }
  return null;
}

export function isConditionalCh05Code(code: string): boolean {
  return CONDITIONAL_CH05_RULES.some((rule) => rule.code === code);
}

function detectIfConditionals(text: string, hits: ConditionalHit[]) {
  if (isWhetherIf(text) || /\beven\s+if\b/i.test(text)) return;
  const ifs = [...text.matchAll(/\bif\b/gi)];
  for (const match of ifs) {
    const at = match.index ?? 0;
    if (isAsIfAt(text, at) || isEvenIfAt(text, at) || isOnlyIfAt(text, at)) continue;
    const clause = ifClause(text, at);
    if (volitionWillInIf(clause)) continue;
    const verb = ifClauseVerb(clause);
    if (!verb) continue;
    if (verb.kind === "present") continue;
    if (verb.kind === "past" && RESULT_MODAL.test(text) && !RESULT_HAVE.test(text)) {
      pushHit(hits, "CONDITIONAL_SECOND", "IF_PAST_MODAL_BASE", verb.token, atWord(text, verb.token, at));
    } else if (verb.kind === "were" && RESULT_MODAL.test(text) && !RESULT_HAVE.test(text)) {
      pushHit(hits, "CONDITIONAL_SECOND", "IF_PAST_MODAL_BASE", "were", atWord(text, "were", at));
    } else if (verb.kind === "had-noun" && RESULT_MODAL.test(text) && !RESULT_HAVE.test(text)) {
      pushHit(hits, "CONDITIONAL_SECOND", "IF_PAST_MODAL_BASE", "had", atWord(text, "had", at));
    } else if (verb.kind === "had-pp" && RESULT_HAVE.test(text) && !hasPresentResultMarker(text)) {
      pushHit(hits, "CONDITIONAL_THIRD", "IF_HAD_PP_MODAL_HAVE_PP", "had", atWord(text, "had", at));
    } else if (verb.kind === "had-pp" && RESULT_MODAL.test(text) && !RESULT_HAVE.test(text) && hasPresentResultMarker(text)) {
      const wouldAt = text.search(/\bwould\b/i);
      pushHit(hits, "CONDITIONAL_MIXED", "PAST_FACT_PRESENT_RESULT", "would", wouldAt);
    }
  }
}

function detectInversion(text: string, hits: ConditionalHit[]) {
  const had = text.match(/\bHad\s+(I|you|he|she|we|they|it)\s+([A-Za-z]+)\b/);
  if (had && !text.includes("?") && RESULT_HAVE.test(text)) {
    const pp = had[2] ?? "";
    pushHit(hits, "CONDITIONAL_INVERTED_HAD", "INVERSION_HAD", pp, text.indexOf(pp, had.index ?? 0));
  }
  const were = text.match(/^Were\s+(I|you|he|she|we|they|it|there)\b/);
  if (were && !text.includes("?") && RESULT_MODAL.test(text) && !/\bIf\s+/i.test(text)) {
    pushHit(hits, "CONDITIONAL_INVERTED_WERE", "INVERSION_WERE", "Were", were.index ?? 0);
  }
  const should = text.match(/\bShould\s+(I|you|he|she|we|they|it)\s+([A-Za-z]+)\b/);
  if (should && !text.includes("?") && RESULT_MODAL.test(text)) {
    const verb = should[2] ?? "";
    pushHit(hits, "CONDITIONAL_INVERTED_SHOULD", "INVERSION_SHOULD", verb, text.indexOf(verb, should.index ?? 0));
  }
}

function detectWish(text: string, hits: ConditionalHit[]) {
  const wish = text.match(/\bwish\s+(?:that\s+)?(I|you|he|she|we|they|it)\s+(\w+)(?:\s+(\w+))?/i);
  if (!wish) return;
  const first = (wish[2] ?? "").toLowerCase();
  const second = (wish[3] ?? "").toLowerCase();
  const at = text.toLowerCase().indexOf(first, wish.index ?? 0);
  if (first === "would") {
    pushHit(hits, "WISH_WOULD", "WISH_FUTURE", "would", at);
    return;
  }
  if (first === "had" && isParticiple(second)) {
    const span = `had ${wish[3]}`;
    pushHit(hits, "WISH_PAST_PERFECT", "WISH_PAST_COUNTERFACTUAL", span, text.toLowerCase().indexOf("had", wish.index ?? 0));
    return;
  }
  if (isPastVerb(first) && first !== "was" && first !== "were") {
    pushHit(hits, "WISH_PAST", "WISH_PRESENT_COUNTERFACTUAL", wish[2] ?? first, at);
  }
}

function detectAsIf(text: string, hits: ConditionalHit[]) {
  const marker = text.match(/\bas\s+(?:if|though)\b/i);
  if (!marker) return;
  const after = text.slice((marker.index ?? 0) + marker[0].length);
  const presentMain = /\b(talks|talk|looks|sounds|acts|is|are)\b/i.test(text.slice(0, marker.index ?? 0));
  const had = after.match(/\bhad\s+([A-Za-z]+)\b/i);
  if (had && isParticiple(had[1] ?? "")) {
    const span = `had ${had[1]}`;
    pushHit(hits, "AS_IF_PAST_PERFECT", "AS_IF_EARLIER", span, text.toLowerCase().indexOf(span.toLowerCase(), marker.index ?? 0));
    return;
  }
  const past = after.match(/\b(?:I|you|he|she|we|they|it)\s+([A-Za-z]+)\b/i);
  const word = (past?.[1] ?? "").toLowerCase();
  if (presentMain && isPastVerb(word) && word !== "was") {
    pushHit(hits, "AS_IF_PAST", "AS_IF_SAME_TIME", past?.[1] ?? word, text.toLowerCase().indexOf(word, marker.index ?? 0));
  }
}

function detectWithout(text: string, hits: ConditionalHit[]) {
  if (!/^(?:Without|But for)\b/i.test(text.trim())) return;
  if (!/,\s+.+\b(?:would|could|might)\b/i.test(text)) return;
  const at = text.search(/\bwould\b/i);
  if (at >= 0) pushHit(hits, "WITHOUT_IF_CONDITION", "WITHOUT_BUT_FOR", "would", at);
}

function detectOtherwise(text: string, hits: ConditionalHit[]) {
  const at = text.search(/\botherwise\b/i);
  if (at < 0) return;
  const would = text.slice(at).search(/\bwould\b/i);
  if (would < 0) return;
  pushHit(hits, "OTHERWISE_CONDITIONAL", "OTHERWISE", "would", at + would);
}

function detectIfOnly(text: string, hits: ConditionalHit[]) {
  const at = text.search(/\bif\s+only\b/i);
  if (at < 0) return;
  const after = text.slice(at);
  const had = after.match(/\bhad\s+([A-Za-z]+)\b/i);
  if (had && isParticiple(had[1] ?? "")) {
    const span = `had ${had[1]}`;
    pushHit(hits, "IF_ONLY", "IF_ONLY", span, text.toLowerCase().indexOf(span.toLowerCase(), at));
    return;
  }
  if (/\bwere\b/i.test(after)) {
    pushHit(hits, "IF_ONLY", "IF_ONLY", "were", text.toLowerCase().indexOf("were", at));
  }
}

function detectItIsTime(text: string, hits: ConditionalHit[]) {
  if (/\bit is (?:high |about )?time to\b/i.test(text)) return;
  const match = text.match(/\bit is (?:high |about )?time\s+(?:that\s+)?(?:I|you|he|she|we|they)\s+([A-Za-z]+)\b/i);
  if (!match) return;
  const verb = match[1] ?? "";
  if (!isPastVerb(verb.toLowerCase())) return;
  pushHit(hits, "IT_IS_TIME_SUBJUNCTIVE", "IT_IS_TIME", verb, text.toLowerCase().indexOf(verb.toLowerCase(), match.index ?? 0));
}

const RATHER_PAST_FACT = /\b(?:yesterday|ago|last\s+(?:night|week|month|year)|earlier|the other day)\b/i;

function detectWouldRather(text: string, hits: ConditionalHit[]) {
  const rather = text.match(/\bwould rather\s+(?:(I|you|he|she|we|they)\s+)?(?:(had)\s+)?([A-Za-z]+)\b/i);
  if (!rather) return;
  const subject = rather[1];
  const had = rather[2];
  const verb = rather[3] ?? "";
  if (!subject || /^(?:try|not|n't)$/i.test(verb)) return;
  const at = rather.index ?? 0;
  const pastFact = RATHER_PAST_FACT.test(text);
  if (had) {
    if (!isParticiple(verb.toLowerCase())) return;
    const span = `had ${verb}`;
    const index = text.toLowerCase().indexOf(span.toLowerCase(), at);
    if (!pastFact) {
      pushHit(hits, "WOULD_RATHER_SUBJUNCTIVE", "PAST_REGRET", span, index, "AMBIGUOUS_TENSE");
      return;
    }
    pushHit(hits, "WOULD_RATHER_SUBJUNCTIVE", "PAST_REGRET", span, index);
    return;
  }
  if (!isPastVerb(verb.toLowerCase())) return;
  if (pastFact) {
    pushHit(hits, "WOULD_RATHER_SUBJUNCTIVE", "PRESENT_FUTURE_PREFERENCE", verb, text.toLowerCase().indexOf(verb.toLowerCase(), at), "AMBIGUOUS_TENSE");
    return;
  }
  pushHit(hits, "WOULD_RATHER_SUBJUNCTIVE", "PRESENT_FUTURE_PREFERENCE", verb, text.toLowerCase().indexOf(verb.toLowerCase(), at));
}

function isAmbiguousRather(text: string): boolean {
  return detectWouldRatherHits(text).some((hit) => hit.exclusionReason === "AMBIGUOUS_TENSE");
}

function detectWouldRatherHits(text: string): ConditionalHit[] {
  const hits: ConditionalHit[] = [];
  detectWouldRather(text, hits);
  return hits;
}

function ifClause(text: string, at: number): string {
  const rest = text.slice(at + 2);
  const end = rest.search(/[—–;]|,(?!\s*(?:and|or)\b)|\bthen\b/i);
  return end < 0 ? rest : rest.slice(0, end);
}

function ifClauseVerb(clause: string): { kind: "present" | "were" | "had-noun" | "had-pp" | "past"; token: string } | null {
  if (OPEN_IF.test(`if ${clause}`) || /\b(?:is|are|am|do|does|'s)\b/i.test(clause)) {
    return { kind: "present", token: "is" };
  }
  if (/\bwere\b/i.test(clause)) return { kind: "were", token: "were" };
  const had = clause.match(/\bhad\s+([A-Za-z]+)\b/i);
  if (had) return { kind: isParticiple(had[1] ?? "") ? "had-pp" : "had-noun", token: "had" };
  const past = clause.match(/\b(I|you|he|she|we|they|it)\s+([A-Za-z]+)\b/i);
  const token = past?.[2] ?? "";
  if (isPastVerb(token.toLowerCase()) && token.toLowerCase() !== "was") {
    return { kind: "past", token };
  }
  return null;
}

function isDarwinNoUniqueConditional(text: string): boolean {
  return (
    /\bhad the same kind of mind\b/i.test(text) &&
    /\bwere only one human nature\b/i.test(text) &&
    /\bmight become extinct\b/i.test(text)
  );
}

function assessConditionalTensePair(
  sentence: string,
  correct: string,
  wrong: string
): "AMBIGUOUS_CONDITIONAL_TIME" | null {
  const pair = [correct, wrong].map((s) => s.trim().toLowerCase()).sort().join("|");
  if (pair !== "had been|were" && pair !== "would catch|would have caught") return null;
  if (pair === "had been|were") {
    if (uniqueSecondWere(sentence, correct) || uniqueThirdHadBeen(sentence, correct)) return null;
    return "AMBIGUOUS_CONDITIONAL_TIME";
  }
  if (uniqueThirdWouldHave(sentence, correct)) return null;
  return "AMBIGUOUS_CONDITIONAL_TIME";
}

function uniqueSecondWere(sentence: string, correct: string): boolean {
  if (correct.trim().toLowerCase() !== "were") return false;
  return (
    /\bif\b/i.test(sentence) &&
    /\bwere\b/i.test(sentence) &&
    /\b(?:would|could|might)\s+(?!have\b)[A-Za-z]+/i.test(sentence) &&
    /\bin general\b/i.test(sentence) &&
    !/\b(?:yesterday|then|now|today|had been)\b/i.test(sentence)
  );
}

function uniqueThirdHadBeen(sentence: string, correct: string): boolean {
  if (correct.trim().toLowerCase() !== "had been") return false;
  return (
    /\byesterday\b/i.test(sentence) &&
    /\bthat mistake\b/i.test(sentence) &&
    /\bwould not have made\b/i.test(sentence)
  );
}

function uniqueThirdWouldHave(sentence: string, correct: string): boolean {
  if (correct.trim().toLowerCase() !== "would have caught") return false;
  return (
    /\bif\s+she\s+had\s+left\s+earlier\b/i.test(sentence) &&
    /\bwould have caught\b/i.test(sentence) &&
    !/\b(?:now|today)\b/i.test(sentence)
  );
}

function isOpenRealCondition(text: string): boolean {
  return OPEN_IF.test(text) && RESULT_MODAL.test(text) && !/\bwere\b/i.test(text);
}

function isWhetherIf(text: string): boolean {
  return /\b(?:wonder|ask|asked|know|knew|unsure|unsure|doubt|check|see|not sure)\b[^.?]{0,24}\bif\b/i.test(text);
}

function isAsIfAt(text: string, at: number): boolean {
  return /\bas\s+$/i.test(text.slice(Math.max(0, at - 4), at));
}

function isEvenIfAt(text: string, at: number): boolean {
  return /\beven\s+$/i.test(text.slice(Math.max(0, at - 6), at));
}

function isOnlyIfAt(text: string, at: number): boolean {
  return /\bonly\s+$/i.test(text.slice(Math.max(0, at - 6), at));
}

function volitionWillInIf(clause: string): boolean {
  return /\b(?:will|would)\b/i.test(clause) && !/\bhad\b/i.test(clause) && !/\bwere\b/i.test(clause);
}

function hasPresentResultMarker(text: string): boolean {
  return /\b(?:now|today|these days|at present|currently)\b/i.test(text);
}

function isParticiple(word: string): boolean {
  const w = word.toLowerCase();
  return PAST_PARTICIPLE.has(w) || (w.endsWith("ed") && w.length > 4);
}

function isPastVerb(word: string): boolean {
  return Boolean(PAST_TO_BASE[word] || (word.endsWith("ed") && word.length > 3));
}

function baseOf(span: string): string | null {
  const word = span.trim().toLowerCase();
  if (PAST_TO_BASE[word]) return PAST_TO_BASE[word]!;
  if (word.endsWith("ed")) return word.slice(0, -2);
  return null;
}

function pastOf(span: string): string | null {
  const word = span.trim().toLowerCase();
  if (PAST_TO_BASE[word]) return span;
  if (word.endsWith("e")) return `${word}d`;
  if (/^[a-z]+$/.test(word)) return `${word}ed`;
  return null;
}

function oppositeRather(span: string): string | null {
  const had = /^had\s+([a-z]+)$/i.exec(span.trim());
  if (had) return had[1] ?? null;
  const base = baseOf(span);
  if (base && base !== span.toLowerCase()) return `will ${base}`;
  return null;
}

function atWord(text: string, word: string, from: number): number {
  const found = text.toLowerCase().indexOf(word.toLowerCase(), from);
  return found < 0 ? text.toLowerCase().indexOf(word.toLowerCase()) : found;
}

function pushHit(
  hits: ConditionalHit[],
  code: GrammarPointCode,
  subtype: string,
  sourceSpan: string,
  at: number,
  exclusionReason?: LocalRejectCode
) {
  if (!sourceSpan || at < 0) return;
  hits.push({
    code,
    subtype,
    sourceSpan,
    occurrenceIndex: Math.max(0, at),
    exclusionReason,
  });
}

function dedupe(hits: ConditionalHit[]): ConditionalHit[] {
  const seen = new Set<string>();
  return hits.filter((hit) => {
    const key = `${hit.code}|${hit.sourceSpan.toLowerCase()}|${hit.occurrenceIndex}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
