/** Generalized structural frames. No sentence-specific hardcoding. */

export const RELATIVE_PREPS =
  "for|with|to|from|of|in|on|by|about|into|through|without|over|under|between|among";

const INDEFINITE =
  "nobody|no one|nothing|everybody|everyone|anybody|anyone|somebody|someone|each|either|neither";

const FINITE_VERB =
  "am|is|are|was|were|has|have|had|do|does|did|can|could|may|might|must|shall|should|will|would|drank|went|came|made|took|saw|got|left|kept|knew|thought|felt|became|began|brought|built|bought|caught|chose|drew|drove|ate|fell|found|gave|heard|held|led|lost|met|paid|ran|read|said|sat|sent|spoke|stood|told|won|wrote|[A-Za-z]+ed|[A-Za-z]+s";

const NON_COMPARATIVE_ER =
  /^(?:other|rather|after|over|under|never|however|whether|either|together|whenever|wherever|teacher|player|reader|writer|leader|computer|order|water|number|member|chapter|paper|power)$/i;

const PARTICLES = "up|out|off|on|down|in|away|over";

export function tokens(text: string): string[] {
  return text.trim().split(/\s+/).filter(Boolean);
}

export function indexOfWord(text: string, span: string, from = 0): number {
  const re = new RegExp(`\\b${escapeRe(span)}\\b`, "i");
  const slice = text.slice(from);
  const hit = re.exec(slice);
  return hit ? from + hit.index : -1;
}

function escapeRe(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function isNumberAgreementPair(correct: string, wrong: string): boolean {
  const a = correct.trim().toLowerCase();
  const b = wrong.trim().toLowerCase();
  if (!a || !b || a.includes(" ") || b.includes(" ")) return false;
  const pair = [a, b].sort().join("|");
  if (
    pair === "are|is" ||
    pair === "has|have" ||
    pair === "was|were" ||
    pair === "do|does" ||
    pair === "don't|doesn't" ||
    pair === "dont|doesnt"
  ) {
    return true;
  }
  const [short, long] = [a, b].sort((x, y) => x.length - y.length);
  if (long.endsWith("ed") || long.endsWith("ing") || short.endsWith("ed") || short.endsWith("ing")) {
    return false;
  }
  return long === `${short}s` || long === `${short}es` || (short.endsWith("y") && long === `${short.slice(0, -1)}ies`);
}

export function hasInterveningAgreement(sentence: string, verb: string): boolean {
  const at = indexOfWord(sentence, verb);
  if (at < 0) return false;
  const before = sentence.slice(0, at);
  const re = new RegExp(`\\b(?:${INDEFINITE})\\b([\\s\\S]{1,80})$`, "i");
  const match = before.match(re);
  if (!match) return false;
  const gapText = match[1] ?? "";
  const gap = tokens(gapText);
  if (gap.length < 2) return false;
  if (/\b(?:is|are|was|were|has|have|had|does|do|did|[A-Za-z]+ed|[A-Za-z]+s)\b/i.test(gapText)) {
    return false;
  }
  return /\b(?:outside|inside|of|who|which|that|whose|when|where|with|by|from|in|on|for|without|except)\b/i.test(
    gapText
  );
}

export function extractDetNounBefore(sentence: string, span: string): string | null {
  const at = indexOfWord(sentence, span);
  if (at < 0) return null;
  const before = sentence.slice(0, at);
  const match = before.match(/\b((?:the|a|an)\s+[A-Za-z]+)\s+$/i);
  return match?.[1] ?? null;
}

export function isPostmodifyingPastParticiple(sentence: string, span: string): boolean {
  const at = indexOfWord(sentence, span);
  if (at < 0) return false;
  const before = sentence.slice(0, at);
  if (/\b(?:am|is|are|was|were|be|been|being|have|has|had)\s+$/i.test(before)) return false;
  return /(?:the|a|an)\s+[A-Za-z]+\s+$/i.test(before) && /(?:ed|en|involved|known|made|taken|given|seen)$/i.test(span.trim());
}

export function findPrepWhich(sentence: string, from = 0): { prep: string; whichAt: number } | null {
  const re = new RegExp(`\\b(${RELATIVE_PREPS})\\s+(which)\\b`, "gi");
  re.lastIndex = from;
  const match = re.exec(sentence);
  if (!match || match.index == null) return null;
  const whichAt = match.index + match[0].toLowerCase().lastIndexOf("which");
  return { prep: (match[1] ?? "").toLowerCase(), whichAt };
}

export function hasPrepWhich(sentence: string): boolean {
  return findPrepWhich(sentence) != null;
}

export function whenFollowedByFiniteClause(sentence: string, whenAt = -1): boolean {
  const at = whenAt >= 0 ? whenAt : indexOfWord(sentence, "when");
  if (at < 0) return false;
  const before = sentence.slice(Math.max(0, at - 24), at);
  if (/\b(?:day|time|moment|year|night|morning|hour|week|month)\s+$/i.test(before)) return false;
  const after = sentence.slice(at + 4).trim();
  const finite = new RegExp(
    `^(?:(?:the|a|an|this|that|my|your|his|her|their|our)\\s+)?(?:I|you|he|she|we|they|it|[A-Za-z']+)\\s+(?:[A-Za-z'-]+\\s+){0,3}(?:${FINITE_VERB})\\b`,
    "i"
  );
  return finite.test(after);
}

export function isComparativeErWord(word: string): boolean {
  const w = word.trim().toLowerCase();
  if (!w || NON_COMPARATIVE_ER.test(w)) return false;
  if (/^(?:better|worse|further|farther)$/i.test(w)) return true;
  return w.length >= 4 && /er$/.test(w) && !/eer$/.test(w);
}

export function findUniqueComparativeThan(sentence: string): number {
  const source = sentence.replace(/[’]/g, "'");
  const re =
    /\b(?:more|less)\s+[A-Za-z]+\s+than\b|[A-Za-z]{3,}er\s+than\b|\b(?:better|worse|further|farther)\s+than\b/gi;
  for (const match of source.matchAll(re)) {
    const raw = match[0] ?? "";
    if (/\bmore\s+and\s+more\b/i.test(raw)) continue;
    const word = (raw.match(/^(\S+)/) ?? [])[1] ?? "";
    if (/^(?:more|less|better|worse|further|farther)$/i.test(word) === false && !isComparativeErWord(word)) {
      continue;
    }
    if (/^(?:rather|other)\s+than\b/i.test(raw)) continue;
    const thanAt = (match.index ?? 0) + raw.toLowerCase().lastIndexOf("than");
    if (!comparativeThanIsUnique(source, thanAt)) continue;
    return thanAt;
  }
  return -1;
}

export function comparativeThanIsUnique(sentence: string, thanAt: number): boolean {
  const before = sentence.slice(Math.max(0, thanAt - 48), thanAt);
  if (!/(?:\b(?:more|less)\s+[A-Za-z]+|(?:better|worse|further|farther)|[A-Za-z]{3,}er)\s+$/i.test(before)) {
    return false;
  }
  if (/\b(?:rather|other)\s+$/i.test(before)) return false;
  if (/\bthe\s+[a-z]+est\b/i.test(sentence) && !/\bnothing\b/i.test(sentence)) return false;
  if (/\bthe\s+most\s+[a-z]+\b/i.test(sentence) && !/\bnothing\b/i.test(sentence)) return false;
  if (/\bas\s+[a-z]+\s+as\b/i.test(sentence)) return false;
  return true;
}

export function sameFormClass(left: string, right: string): boolean {
  const a = left.trim().toLowerCase();
  const b = right.trim().toLowerCase();
  if (!a || !b) return false;
  const ing = (w: string) => w.endsWith("ing");
  const ed = (w: string) => w.endsWith("ed") || /^(?:made|took|came|went|did|had|said|saw|got)$/.test(w);
  if (ing(a) && ing(b)) return true;
  if (ed(a) && ed(b)) return true;
  if (!ing(a) && !ing(b) && !ed(a) && !ed(b)) return true;
  return false;
}

export function pastToIng(word: string): string | null {
  const w = word.trim().toLowerCase();
  if (/^(?:made|took|came|went|did|had|said|saw|got)$/.test(w)) return null;
  if (w.endsWith("ied") && w.length > 4) return `${w.slice(0, -3)}ying`;
  if (w.endsWith("ed") && w.length > 3) return `${w.slice(0, -2)}ing`;
  return null;
}

export function isLockedEitherOrParallel(
  sentence: string,
  correct: string,
  wrong: string
): boolean {
  const at = indexOfWord(sentence, correct);
  if (at < 0) return false;
  const before = sentence.slice(0, at);
  if (!/\beither\b[\s\S]{0,48}\bor\s+$/i.test(before)) return false;
  const first = before.match(/\beither\s+(\w+)/i)?.[1];
  if (!first) return false;
  if (!sameFormClass(first, correct)) return false;
  if (sameFormClass(first, wrong)) return false;
  const after = sentence.slice(at + correct.length);
  if (new RegExp(`^\\s+(?:${PARTICLES})\\b`, "i").test(after) === false) {
    // particle may be absent; still allow locked verb-form parallel
  }
  const stemA = correct.replace(/(?:ed|ing)$/i, "").toLowerCase();
  const stemB = wrong.replace(/(?:ed|ing)$/i, "").toLowerCase();
  if (!stemA || stemA !== stemB) return false;
  return true;
}

export function findEitherOrParallelVerb(
  sentence: string
): { correct: string; wrong: string; at: number } | null {
  const re = new RegExp(`\\beither\\s+(\\w+)\\s+or\\s+(\\w+)(?:\\s+(?:${PARTICLES}))?\\b`, "gi");
  for (const match of sentence.matchAll(re)) {
    const first = match[1] ?? "";
    const second = match[2] ?? "";
    if (!sameFormClass(first, second)) continue;
    const wrong = pastToIng(second);
    if (!wrong || sameFormClass(first, wrong)) continue;
    const at = indexOfWord(sentence, second, match.index ?? 0);
    if (at < 0) continue;
    if (!isLockedEitherOrParallel(sentence, second, wrong)) continue;
    return { correct: sentence.slice(at, at + second.length), wrong, at };
  }
  return null;
}
