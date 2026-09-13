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
