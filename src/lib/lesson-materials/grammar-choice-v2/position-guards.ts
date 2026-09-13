/**
 * 네모 자리가 확정된 뒤, 네모 앞뒤 낱말을 보고 거르는 검사.
 *
 * rejectCandidate는 네모를 자르고 좁히는 동안 여러 번 불리고 문장 속 위치를 모른다
 * (정답을 문장에서 다시 찾으면 in이 feeling 안에서 잡힌다). 여기 검사는 바로 앞 낱말이
 * 판정을 가르므로 위치가 확정된 뒤 한 번 돈다.
 *
 * 모두 배포 전 16지문(236문항) 점검에서 유일성 판정과 검수를 통과해 나온 문항의
 * 모양이다(2026-09-11).
 */
import { stemVerb } from "@/lib/lesson-materials/grammar-choice-v2/local-validators";
import type { LocalRejectCode } from "@/lib/lesson-materials/grammar-choice-v2/types";

const MODALS = new Set(["can", "could", "may", "might", "must", "shall", "should", "will", "would"]);

/**
 * 한쪽을 다른 쪽으로 바꿔도 대개 문법적인 전치사 쌍. 뜻이 조금 달라질 뿐 오답이 되지 않는다.
 * 관측: at some point [in / during] their lives, the level of variety [in / of] your routine.
 */
const SUBSTITUTABLE_PREPOSITIONS = new Set([
  "during|in", "during|for", "during|over", "during|throughout", "in|within", "in|of",
  "in|into", "on|onto", "about|on", "about|of", "at|in", "to|toward", "to|towards",
  "among|between", "on|upon",
]);

/** 굳어진 -ing 명사. 한정사 뒤에서는 분사가 아니라 명사다(a meeting start time). */
const ING_NOUNS = new Set([
  "meeting", "building", "ending", "beginning", "wedding", "ceiling", "morning", "evening",
  "clothing", "painting", "setting", "training", "feeling", "reading", "writing", "housing",
  "parking", "shopping", "spelling", "warning", "opening", "offering", "finding", "recording",
  "drawing", "gathering", "hearing", "crossing", "landing", "heating", "funding", "planning",
  "marketing", "understanding", "being", "belonging", "savings", "earnings", "surroundings",
]);

const OBJECT_PRONOUNS = new Set(["him", "her", "it", "them", "me", "us", "you"]);

const PREPOSITIONS = new Set([
  "in", "on", "at", "to", "for", "with", "from", "about", "of", "by", "into", "onto", "over",
  "under", "through", "without", "after", "before", "around", "across", "against", "among",
]);

/** 문장이나 절의 첫머리(앞에 붙은 접속부사까지). */
const CLAUSE_OPENING =
  /^\s*(?:(?:therefore|however|thus|so|also|then|instead|moreover|besides|first|finally|still|yet|and|but|in addition|for example|for instance)\s*,?\s*)?$/i;

function words(text: string): string[] {
  return text.trim().toLowerCase().replace(/[’]/g, "'").split(/\s+/).filter(Boolean);
}

function lastWord(text: string): string {
  return (words(text).at(-1) ?? "").replace(/[^a-z']/g, "");
}

/**
 * 교재(textbook-rules.ts의 avoid)가 둘 다 된다고 한 대비. 고르는 문항이 되지 않는다.
 * 모양만으로 확실히 가를 수 있는 것만 여기 둔다.
 */
function bothPossibleInTextbooks(
  c: string[],
  w: string[],
  before: string,
  after: string
): LocalRejectCode | null {
  const a = c.join(" ");
  const b = w.join(" ");
  const pair = [a, b].sort().join("|");
  const toPair = (x: string, y: string) => x === `to ${y}` || y === `to ${x}`;
  const bare = (x: string, y: string) => (x.startsWith("to ") ? y : x);
  const toIng = (x: string, y: string) => {
    const [to, ing] = x.startsWith("to ") ? [x, y] : [y, x];
    return to.startsWith("to ") && !to.slice(3).includes(" ") && /^[a-z]+ing$/.test(ing) && stemVerb(to.slice(3)) === stemVerb(ing);
  };

  // help (+목적어) [to V / V]
  if (toPair(a, b) && /\bhelp(?:s|ed|ing)?\b(?:\s+[\w'’]+){0,3}\s*$/i.test(before)) return "BOTH_GRAMMATICAL";
  // 지각동사 + 목적어 [V / V-ing] (p.p.와의 대비는 능동·수동이라 둔다)
  if (
    c.length === 1 && w.length === 1 &&
    /ing$/.test(a) !== /ing$/.test(b) && !/(?:ed|en)$/.test(bare(a, b)) &&
    stemVerb(a) === stemVerb(b) &&
    /\b(?:see|sees|saw|seen|watch|watches|watched|hear|hears|heard|feel|feels|felt|notice|notices|noticed|observe|observes|observed|look(?:s|ed)? at|listen(?:s|ed)? to)\b(?:\s+[\w'’]+){1,3}\s*$/i.test(before)
  ) {
    return "BOTH_GRAMMATICAL";
  }
  // like·love·hate·prefer·start·begin·continue [to V / V-ing]
  if (toIng(a, b) && /\b(?:like|likes|liked|love|loves|loved|hate|hates|hated|prefer|prefers|preferred|start|starts|started|begin|begins|began|begun|continue|continues|continued)\s*$/i.test(before)) {
    return "BOTH_GRAMMATICAL";
  }
  // 문장 첫머리 주어 [To V / V-ing] + 동사: 동명사·to부정사 주어 둘 다 된다
  if (toIng(a, b) && CLAUSE_OPENING.test(before) && /^(?:\s+[\w'’]+){0,6}?\s+(?:is|was|are|were|has|can|will|may|would|could|should|must|makes|made|helps|seems|takes|requires|means)\b/i.test(after)) {
    return "BOTH_GRAMMATICAL";
  }
  // no more complex than [knowing / to know]: than 뒤 비교 대상은 동명사·to부정사 둘 다 된다.
  // 앞의 비교 대상이 동명사·to부정사면(Speaking … is easier than [writing]) 그 형태에 맞추는 병렬 문항이라 둔다.
  if (
    toIng(a, b) &&
    /\bthan\s*$/i.test(before) &&
    !/^\s*["“]?[a-z]+ing\b/i.test(before) &&
    !/\bit(?:\s+is|'s|\s+was)\b[^,;]*\bto\s+[a-z]+/i.test(before)
  ) {
    return "BOTH_GRAMMATICAL";
  }
  // It is/was X [that / who] ...(강조 구문의 사람)
  if (pair === "that|who" && /\bit\s+(?:is|was)\b[^,.;!?]{1,40}$/i.test(before)) return "BOTH_GRAMMATICAL";
  // 동사의 목적어 자리 [if / whether]. 전치사 뒤, 문장 첫머리(주어), or not·to부정사 앞은 whether만 된다.
  if (pair === "if|whether") {
    const prev = lastWord(before);
    const onlyWhether =
      PREPOSITIONS.has(prev) || CLAUSE_OPENING.test(before) || /^\s+(?:or not|to)\b/i.test(after);
    if (!onlyWhether) return "BOTH_GRAMMATICAL";
  }
  // 반복된 과거 습관 [used to / would]. 상태(be·have·live·know …)는 used to만 된다.
  if ((a === "used to" && b === "would") || (a === "would" && b === "used to")) {
    if (!/^\s+(?:be|have|live|know|own|like|love|believe|seem|belong|stand|feel)\b/i.test(after)) return "BOTH_GRAMMATICAL";
  }
  // [Without / But for], [where / in which], [the way / how]
  if (pair === "but for|without" || /^(?:at|in|on) which\|where$/.test(pair) || pair === "how|the way") {
    return "BOTH_GRAMMATICAL";
  }
  // 명사절(know/wonder/ask … when·if) 안에서는 will을 쓴다. will을 오답으로 둔 시간·조건 부사절
  // 문항은 정답이 틀린 것이다. (will이 정답인 명사절 문항은 교재가 묻는 포인트라 둔다.)
  if (
    w.includes("will") && !c.includes("will") &&
    /\b(?:know|knows|knew|wonder|wonders|wondered|ask|asks|asked|sure|decide|decided|tell|told|idea)\s+(?:when|if)\b[^,;]*$/i.test(before)
  ) {
    return "BOTH_GRAMMATICAL";
  }
  return null;
}

/** -ing로 끝나지만 동명사가 아닌 낱말(spoke clearly during ..., keep the door open during ...). */
const NOT_GERUND_ING = new Set([
  "during", "including", "regarding", "concerning", "considering", "following", "according",
  "excluding", "notwithstanding", "nothing", "something", "anything", "everything", "thing",
  "king", "ring", "spring", "string", "bring", "sing", "wing", "swing", "sting",
]);

function isGerundNext(after: string): boolean {
  const next = /^\s+([a-z]+ing)\b/i.exec(after)?.[1]?.toLowerCase();
  return !!next && next.length > 4 && !NOT_GERUND_ING.has(next) && !ING_NOUNS.has(next);
}

/** 형용사와 그 부사형(slow/slowly, easy/easily, simple/simply, basic/basically, full/fully). */
function isAdjAdvPair(a: string, b: string): boolean {
  const [short, long] = [a, b].sort((x, y) => x.length - y.length);
  if (!short || !long || short === long) return false;
  return (
    long === `${short}ly` ||
    (short.endsWith("y") && long === `${short.slice(0, -1)}ily`) ||
    (short.endsWith("le") && long === `${short.slice(0, -1)}y`) ||
    (short.endsWith("ic") && long === `${short}ally`) ||
    (short.endsWith("ll") && long === `${short}y`)
  );
}

/** 네모 전후 문맥까지 이은 문자열(정규식 검사용). */
function joined(tokens: string[]): string {
  return tokens.join(" ");
}

const NUMBER_WORD_PAIRS = new Set(["are|is", "was|were", "has|have", "do|does", "don't|doesn't", "aren't|isn't", "wasn't|weren't"]);

/** 한 낱말의 단수·복수 동사 대비(is/are, comes/come). */
function isNumberPair(c: string[], w: string[]): boolean {
  if (c.length !== 1 || w.length !== 1) return false;
  const [x, y] = [c[0]!, w[0]!];
  if (NUMBER_WORD_PAIRS.has([x, y].sort().join("|"))) return true;
  const [short, long] = [x, y].sort((p, q) => p.length - q.length);
  return (long === `${short}s` || long === `${short}es` || (short.endsWith("y") && long === `${short.slice(0, -1)}ies`)) && !/(?:ing|ed)$/.test(short);
}

const CLAUSE_MARKER =
  /\b(?:that|which|who|whom|when|if|because|while|where|whereas|although|though|since|as|once|until|before|after|unless)\b/gi;
const SUBJECT_PRONOUN = /^(?:i|you|he|she|we|they|it)$/;

/**
 * 동사 바로 앞 주어가 짧은지(한두 낱말, 수식어 없음). 마지막 문장부호·절 표지 뒤 낱말만 센다.
 * 동명사 주어(Writing is), 부분 표현(Some of), there, 등위 주어(A and B)는 교재 포인트라 뺀다.
 * The book that I bought [is]처럼 절 표지 뒤가 "대명사 + 동사"면 그 절이 주어를 꾸미는 것이라 뺀다.
 */
function isTrivialSubject(before: string): boolean {
  let tail = before.split(/[,;:—–()"“”]/).pop() ?? before;
  const marker = [...tail.matchAll(CLAUSE_MARKER)].pop();
  if (marker) tail = tail.slice((marker.index ?? 0) + marker[0].length);
  const tokens = words(tail).map((t) => t.replace(/[^a-z'-]/g, "")).filter(Boolean);
  while (tokens.length && /^(?:and|but|or|so|yet)$/.test(tokens[0]!)) tokens.shift();
  const content = tokens.filter((t) => !/ly$/.test(t));
  if (content.length === 0 || content.length > 3) return false;
  // 동명사 주어는 첫 낱말이 -ing다(Learning foreign languages is ...).
  if (content[0] === "there" || /ing$/.test(content[0]!) || /ing$/.test(content.at(-1)!)) return false;
  if (content.slice(1).some((t) => SUBJECT_PRONOUN.test(t)) || (SUBJECT_PRONOUN.test(content[0]!) && content.length > 1)) return false;
  return !content.some((t) =>
    /^(?:and|or|of|with|in|on|at|for|from|to|by|about|each|every|none|either|neither|number|kind|kinds|percent|half|all|most|some|many|much|both)$/.test(t)
  );
}

function sharedPrefix(a: string, b: string): number {
  let n = 0;
  while (n < a.length && n < b.length && a[n] === b[n]) n += 1;
  return n;
}

/** 낱말 수가 같고 한 자리만 다르면 그 자리. */
function singleDiff(c: string[], w: string[]): number | null {
  if (c.length !== w.length) return null;
  const diffs = c.map((token, i) => (token === w[i] ? -1 : i)).filter((i) => i >= 0);
  return diffs.length === 1 ? diffs[0]! : null;
}

export function rejectAtPosition(input: {
  pointCode: string;
  correct: string;
  wrong: string;
  sentence: string;
  /** 문장 안에서 정답이 시작하는 위치 */
  at: number;
}): LocalRejectCode | null {
  const { sentence, at } = input;
  if (at < 0 || at > sentence.length) return null;
  const before = sentence.slice(0, at);
  const after = sentence.slice(at + input.correct.length);
  const c = words(input.correct);
  const w = words(input.wrong);
  if (!c.length || !w.length) return null;
  const prev = lastWord(before);

  // In [flexible / flexibly]-time cultures: 하이픈 복합어를 쪼갠 네모.
  if (/^[-‐‑]/.test(after) || /[-‐‑]$/.test(before)) return "CODE_SPAN_CONTRACT_MISMATCH";

  const diff = singleDiff(c, w);
  if (diff !== null) {
    const lead = diff > 0 ? c[diff - 1]! : prev;
    const cw = c[diff]!;
    const ww = w[diff]!;
    // [would become / would becomes], [will damage / will damages]: 조동사 뒤 동사에 -s를
    // 붙인 것은 수일치 문항이 아니다(조동사 뒤는 늘 원형).
    if (MODALS.has(lead) && stemVerb(cw) === stemVerb(ww)) return "MECHANICAL_MODAL_FORM";
    // will probably be [circulated / circulates]: be 뒤 3인칭 단수 현재형은 학습자가 쓰지 않는다.
    if (/^(?:be|been|being)$/.test(lead) && ww.endsWith("s") && !cw.endsWith("s") && stemVerb(cw) === stemVerb(ww)) {
      return "UNREALISTIC_LEARNER_ERROR";
    }
  }

  // set forth from the nest to [find / will find]: to 뒤에 조동사를 넣은 오답.
  if (prev === "to" && MODALS.has(w[0]!) && !MODALS.has(c[0]!)) return "MECHANICAL_INFINITIVE_MARKER";

  const pair = [c.join(" "), w.join(" ")].sort().join("|");
  if (SUBSTITUTABLE_PREPOSITIONS.has(pair)) return "BOTH_GRAMMATICAL";

  // something potentially [more / most] important: than도 the도 없으면 둘 다 된다.
  // more and [more / most]는 비교급 and 비교급이라 뒤에 than이 없어도 more만 된다.
  if (c.length === w.length && c[0] !== w[0] && [c[0], w[0]].sort().join("|") === "more|most" && c.slice(1).join(" ") === w.slice(1).join(" ")) {
    const moreAndMore = /\bmore\s+and\s+$/i.test(before) || /^\s+and\s+more\b/i.test(after);
    if (c[0] === "more" && !moreAndMore && !/\bthan\b/i.test(after) && !/\bthe\s+$/i.test(before)) return "BOTH_GRAMMATICAL";
    if (c[0] === "most" && !/(?:\b(?:the|my|your|his|her|its|our|their)|['’]s)\s+$/i.test(before)) return "BOTH_GRAMMATICAL";
  }

  // Therefore, [to keep / keeping] yourself entertained ..., you need to ...: 문장 첫머리의
  // 목적 부정사 자리에 분사구문을 넣어도 문법적이다(뜻만 달라진다).
  if (c[0] === "to" && /ing$/.test(w[0]!) && CLAUSE_OPENING.test(before) && /,/.test(after)) {
    return "BOTH_GRAMMATICAL";
  }

  // an agenda with a [meeting / met] start time: 명사 meeting을 분사로 보고 만든 오답.
  if (
    c.length === 1 &&
    ING_NOUNS.has(c[0]!) &&
    !/ing$/.test(w[0]!) &&
    // her·that은 목적어·대명사일 수 있어(made her [happy]) 넣지 않는다.
    /\b(?:a|an|the|my|your|his|its|our|their|every|each|some|any|no)\s+$/i.test(before)
  ) {
    return "CODE_SPAN_CONTRACT_MISMATCH";
  }

  // It sounds [like / likely] you might be ...: 연결동사 뒤 likely(+ that절 생략)도 문법적이다.
  if (pair === "like|likely" && /^(?:sound|sounds|sounded|seem|seems|seemed|look|looks|looked|feel|feels|felt|appear|appears|appeared)$/.test(prev)) {
    return "BOTH_GRAMMATICAL";
  }

  // do the work [everyone / which everyone] feels ...: 목적격 관계대명사는 넣어도 된다.
  // 생략 문항의 오답은 what처럼 들어가면 틀리는 말이어야 한다.
  if (w.length === c.length + 1 && /^(?:which|that|who|whom)$/.test(w[0]!) && w.slice(1).join(" ") === c.join(" ")) {
    return "BOTH_GRAMMATICAL";
  }

  // here [is my advice / does my advice]: be를 do로 바꾼 오답은 학습자가 쓰지 않는다.
  // 도치 문항(Not only [was he / did he] ...)은 be와 do의 대비가 곧 문법 포인트라 둔다.
  if (
    !input.pointCode.startsWith("INVERSION_") &&
    c.length >= 2 &&
    c.length === w.length &&
    /^(?:am|is|are|was|were)$/.test(c[0]!) &&
    /^(?:do|does|did)$/.test(w[0]!) &&
    c.slice(1).join(" ") === w.slice(1).join(" ")
  ) {
    return "IMPLAUSIBLE_DISTRACTOR";
  }

  // without the risks or [the penalties / penalized]: 한정사를 빼면서 같은 낱말의 형태도
  // 바꿨다. 축이 둘이다. [the other / another]처럼 한정사끼리 바꾼 것은 둔다.
  if (
    c.length === 2 &&
    w.length === 1 &&
    /^(?:the|a|an)$/.test(c[0]!) &&
    c[1] !== w[0] &&
    sharedPrefix(c[1]!, w[0]!) >= 4
  ) {
    return "DISTRACTOR_NOT_ALLOWED";
  }

  // not as a genius but [as a / a] fraud: 상관접속사(not … but, both … and …) 뒤에 되풀이한
  // 전치사는 빼도 문법적이다. 선생님이 짚었다(2026-09-11).
  if (
    w.length === c.length - 1 &&
    (PREPOSITIONS.has(c[0]!) || c[0] === "as") &&
    c.slice(1).join(" ") === w.join(" ") &&
    /\b(?:not|both|either|neither|rather than)\b/i.test(sentence) &&
    new RegExp(`\\b${c[0]}\\b`, "i").test(`${before} ${after}`)
  ) {
    return "BOTH_GRAMMATICAL";
  }

  const textbookBoth = bothPossibleInTextbooks(c, w, before, after);
  if (textbookBoth) return textbookBoth;

  // 교재 규칙 반영 뒤 실행(2026-09-13)
  // happiness [comes / come], your brain [uses / use]: 주어가 바로 앞 한두 낱말이면 수일치가 너무 쉽다.
  // 교재가 묻는 것은 수식어로 주어와 동사가 떨어진 경우다.
  if (isNumberPair(c, w) && isTrivialSubject(before)) return "TOO_TRIVIAL_SHORT_AGREEMENT";
  // [starting to read / starting to reading]: to 뒤에 -ing를 붙인 오답(전치사 to 뒤는 교재 포인트라 둔다)
  for (let i = 0; i + 1 < Math.min(c.length, w.length); i += 1) {
    if (c[i] === "to" && w[i] === "to" && /ing$/.test(w[i + 1]!) && !/ing$/.test(c[i + 1]!) && stemVerb(c[i + 1]!) === stemVerb(w[i + 1]!)) {
      if (!/\b(?:look(?:s|ed|ing)? forward|object(?:s|ed)?|used|accustomed|devoted|committed|contribute[sd]?|when it comes)\s*$/i.test(`${before} ${c.slice(0, i).join(" ")}`)) {
        return "IMPLAUSIBLE_DISTRACTOR";
      }
    }
  }
  // the work [everyone / everyone what] feels: 관계사를 주어 뒤에 붙인 오답
  if (w.length === c.length + 1 && /^(?:what|which|that|who)$/.test(w.at(-1)!) && w.slice(0, -1).join(" ") === c.join(" ")) {
    return "IMPLAUSIBLE_DISTRACTOR";
  }
  // [all the potential / all potentially]: 한정사를 빼면서 같은 낱말의 형태도 바꿨다
  if (w.length === c.length - 1) {
    const at = c.findIndex((t) => t === "the" || t === "a" || t === "an");
    if (at >= 0) {
      const rest = [...c.slice(0, at), ...c.slice(at + 1)];
      const d = rest.map((t, i) => (t === w[i] ? -1 : i)).filter((i) => i >= 0);
      if (d.length === 1 && sharedPrefix(rest[d[0]!]!, w[d[0]!]!) >= 4) return "DISTRACTOR_NOT_ALLOWED";
    }
  }
  // just [as / more] much customer response: more much는 없는 말이다
  const moreMuch = /\b(?:more|most|less)\s+(?:much|many)\b/i;
  const nextWords = after.trimStart().split(/\s+/).slice(0, 1).join(" ");
  if (moreMuch.test(`${joined(w)} ${nextWords}`) && !moreMuch.test(`${joined(c)} ${nextWords}`)) {
    return "IMPLAUSIBLE_DISTRACTOR";
  }

  // 3차 실행(2026-09-11)
  // no matter how [much / many] other people believe ...: 뒤가 복수 명사면 many도 문법적이다.
  // (is·seems 같은 동사와 progress처럼 -ss로 끝나는 불가산 명사는 복수로 보지 않는다.)
  if (
    pair === "many|much" &&
    c[0] === "much" &&
    /^\s+(?:other|more|few|people|(?!(?:is|was|has|does|seems|looks|makes|takes|means|goes|says|gives|news|physics|economics|mathematics|politics)\b)[a-z]{2,}[^s\W]s)\b/i.test(after)
  ) {
    return "BOTH_GRAMMATICAL";
  }
  // [continuously / continuous] listening to ...: 동명사 앞은 한정사·be가 없으면 부사(동명사 수식)도
  // 형용사(명사화된 -ing 수식)도 된다. we are [constantly / constant] ingesting은 진행형이라 부사만.
  if (
    c.length === 1 &&
    w.length === 1 &&
    isAdjAdvPair(c[0]!, w[0]!) &&
    isGerundNext(after) &&
    !/\b(?:am|is|are|was|were|be|been|being|'m|'re|'s|a|an|the|such|this|that|these|those|my|your|his|her|its|our|their|some|any|no|every|each|more|most|much)\s+$/i.test(before)
  ) {
    return "BOTH_GRAMMATICAL";
  }
  // one bad race was all [it would take / would take it], songs you like and [songs you don't /
  // you don't songs]: 첫 낱말을 맨 뒤로 돌린 오답은 학습자가 쓰지 않는다. 두 낱말 맞바꿈
  // ([I am / am I])은 주어·동사 도치라 둔다.
  if (c.length >= 3 && w.join(" ") === [...c.slice(1), c[0]].join(" ")) {
    return "IMPLAUSIBLE_DISTRACTOR";
  }
  // The result can be [a / to a] misunderstood text: 명사구 앞에 to를 끼운 오답.
  if (w.length === c.length + 1 && w[0] === "to" && /^(?:a|an|the)$/.test(c[0]!) && w.slice(1).join(" ") === c.join(" ")) {
    return "IMPLAUSIBLE_DISTRACTOR";
  }
  // helps us [continue functioning / continue to functioning]: to 뒤에 -ing를 그대로 둔 오답.
  // 학습자가 틀리는 형태는 to function이다. (look forward to처럼 to가 정답에 있는 쌍은 해당 없다.)
  if (!c.includes("to") && w.some((token, i) => token === "to" && /ing$/.test(w[i + 1] ?? "") && c.includes(w[i + 1]!))) {
    return "IMPLAUSIBLE_DISTRACTOR";
  }
  // However, [it / them] seems ...: 주어 자리 it을 목적격 복수로 바꾼 오답. 너무 쉽다.
  // (목적어 자리 when they find [it / them]은 앞 명사의 수를 묻는 문항이라 둔다.)
  if (
    c.length === 1 &&
    c[0] === "it" &&
    (w[0] === "them" || w[0] === "they") &&
    w.length === 1 &&
    /^\s+(?:seems|is|was|has|does|doesn['’]t|makes|takes|looks|appears|sounds|means|can|will|would|may|might|must|should)\b/i.test(after)
  ) {
    return "TOO_BASIC_FOR_LEVEL";
  }

  // a friend you haven't seen [in / him in] a while: 동사는 네모 밖에 두고 전치사 앞에
  // 대명사를 끼워 넣었다. 학생이 무엇을 고르는지 알 수 없다.
  if (c.length === 1 && PREPOSITIONS.has(c[0]!) && w.length === 2 && w[1] === c[0] && OBJECT_PRONOUNS.has(w[0]!)) {
    return "IMPLAUSIBLE_DISTRACTOR";
  }
  return null;
}
