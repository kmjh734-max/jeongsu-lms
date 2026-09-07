import {
  WORD_ORDER_MAX_CHUNK_WORDS_FIXED,
  WORD_ORDER_MAX_SINGLE_WORD_RATIO,
} from "@/lib/lesson-materials/word-order-writing-constants";
import {
  normalizeWhitespace,
  tokenizeForWordOrder,
  type WordOrderToken,
} from "@/lib/lesson-materials/word-order-tokenize";

export type WordOrderChunk = {
  chunkId: string;
  text: string;
  originalIndex: number;
  startTokenIndex: number;
  endTokenIndex: number;
  type?: SemanticChunkType;
};

export type SemanticChunkType =
  | "noun-phrase"
  | "verb-phrase"
  | "prepositional-phrase"
  | "infinitive-phrase"
  | "participial-phrase"
  | "clause"
  | "connector"
  | "fixed-expression"
  | "structural-verb"
  | "other";

export type WordOrderChunkSource =
  | "stored-syntax"
  | "cached-ai"
  | "new-ai"
  | "deterministic-fallback"
  | "legacy-word-groups";

export type ChunkValidationIssue =
  | "ENDS_WITH_DETERMINER"
  | "AUXILIARY_SPLIT"
  | "PASSIVE_SPLIT"
  | "PERFECT_SPLIT"
  | "PHRASAL_VERB_SPLIT"
  | "STRONG_COLLOCATION_SPLIT"
  | "CROSSES_CLAUSE_BOUNDARY"
  | "FIXED_WIDTH_SPLIT_PATTERN"
  | "CHUNK_TOO_LONG"
  | "TOO_MANY_SINGLE_TOKENS"
  | "RESTORE_FAILED"
  | "COVERAGE_FAILED"
  | "ORDER_FAILED"
  | "TOO_FEW_CHUNKS"
  | "ALL_SINGLES";

export type ChunkValidationResult = {
  ok: boolean;
  sourceRestored: boolean;
  tokenCoverageValid: boolean;
  orderValid: boolean;
  boundaryValid: boolean;
  grammarGroupingValid: boolean;
  issues: ChunkValidationIssue[];
  reason?: string;
};

export function buildChunksFromRanges(
  sentenceId: string,
  tokens: WordOrderToken[],
  ranges: Array<{ start: number; end: number; type?: SemanticChunkType }>
): WordOrderChunk[] {
  return ranges.map((r, i) => {
    const slice = tokens.slice(r.start, r.end + 1);
    return {
      chunkId: `${sentenceId}-c${i + 1}`,
      text: slice.map((t) => t.surface).join(" "),
      originalIndex: i,
      startTokenIndex: r.start,
      endTokenIndex: r.end,
      type: r.type ?? "other",
    };
  });
}

export function restoreEnglishFromChunks(chunks: WordOrderChunk[]): string {
  return [...chunks]
    .sort((a, b) => a.startTokenIndex - b.startTokenIndex)
    .map((c) => c.text)
    .join(" ");
}

export function wordCountInChunk(text: string): number {
  return text.split(/\s+/).filter(Boolean).length;
}

function stripTrailingPunct(surface: string): string {
  return surface.replace(/[.,;:!?]+$/g, "");
}

function bareLower(surface: string): string {
  return stripTrailingPunct(surface).toLowerCase();
}

function hasClauseEndPunct(surface: string): boolean {
  return /[,;:]$/.test(surface.trim());
}

/** Determiners / possessives / quantifiers that must not end a chunk. */
const DETERMINERS = new Set([
  "a",
  "an",
  "the",
  "this",
  "these",
  "those",
  "my",
  "your",
  "his",
  "her",
  "its",
  "our",
  "their",
  "some",
  "any",
  "each",
  "every",
  "same",
  "another",
  "no",
]);

/** `that` as demonstrative determiner — exclude when used as conjunction. */
function isDeterminerEnding(
  tokens: WordOrderToken[],
  chunkEnd: number,
  nextStart: number | null
): boolean {
  const low = bareLower(tokens[chunkEnd]!.surface);
  if (low === "that") {
    // If next token looks like a clause subject/verb, treat as connector — OK to end
    if (nextStart != null && nextStart < tokens.length) {
      const nxt = bareLower(tokens[nextStart]!.surface);
      if (
        [
          "we",
          "you",
          "they",
          "he",
          "she",
          "it",
          "i",
          "there",
          "this",
          "these",
          "those",
        ].includes(nxt) ||
        AUX_MODAL.has(nxt)
      ) {
        return false;
      }
    }
    // demonstrative that + noun → should not end alone
    return nextStart != null;
  }
  return DETERMINERS.has(low);
}

const PREPOSITIONS = new Set([
  "of",
  "in",
  "on",
  "at",
  "to",
  "for",
  "with",
  "by",
  "from",
  "into",
  "onto",
  "about",
  "over",
  "under",
  "through",
  "during",
  "without",
  "within",
  "among",
  "between",
  "against",
  "across",
  "after",
  "before",
  "toward",
  "towards",
  "upon",
  "via",
  "per",
  "like",
  "as",
  "onto",
  "off",
  "out",
  "up",
  "down",
  "along",
  "around",
  "near",
]);

const AUX_MODAL = new Set([
  "am",
  "is",
  "are",
  "was",
  "were",
  "be",
  "been",
  "being",
  "have",
  "has",
  "had",
  "do",
  "does",
  "did",
  "don't",
  "doesn't",
  "didn't",
  "can't",
  "cannot",
  "won't",
  "wouldn't",
  "shouldn't",
  "couldn't",
  "mustn't",
  "can",
  "could",
  "will",
  "would",
  "shall",
  "should",
  "may",
  "might",
  "must",
  "need",
  "not",
]);

const CLAUSE_CONJ = new Set([
  "yet",
  "but",
  "so",
  "and",
  "or",
  "nor",
  "however",
  "therefore",
  "thus",
  "instead",
]);

const RELATIVE = new Set([
  "which",
  "who",
  "whom",
  "whose",
  "where",
  "when",
  "while",
  "although",
  "because",
  "since",
  "unless",
  "though",
  "whereas",
  "if",
  "that",
]);

const STRUCTURAL_VERB = new Set(["is", "are", "was", "were"]);

const PARTICLES = new Set([
  "about",
  "on",
  "out",
  "up",
  "off",
  "over",
  "along",
  "into",
  "away",
  "in",
  "with",
  "by",
  "from",
]);

/** Generic phrasal / fixed units (not passage-specific examples). */
const GENERIC_PHRASES: string[] = [
  "in line with",
  "bring about",
  "think about",
  "focus on",
  "focusing on",
  "held captive",
  "get away from",
  "getting further away from",
  "further away from",
  "take part in",
  "hours and hours",
  "every day",
  "square footage",
  "smart devices",
  "physical cues",
  "confirmation bias",
  "petri dish",
  "subscription model",
  "customer loyalty",
  "stable revenue",
  "Law of Attraction",
  "the Law of Attraction",
  "positive or negative thoughts",
  "positive or negative results",
].sort((a, b) => b.split(/\s+/).length - a.split(/\s+/).length);

function matchPhraseAt(
  tokens: WordOrderToken[],
  start: number,
  phrase: string
): number | null {
  const parts = phrase.split(/\s+/).filter(Boolean);
  if (start + parts.length > tokens.length) return null;
  for (let i = 0; i < parts.length; i++) {
    const wantBare = parts[i]!.replace(/[.,;:!?]+$/g, "").toLowerCase();
    const got = bareLower(tokens[start + i]!.surface);
    if (got !== wantBare) return null;
  }
  return start + parts.length - 1;
}

function looksLikePastParticiple(surface: string): boolean {
  const w = bareLower(surface);
  if (w.length < 3) return false;
  if (
    [
      "held",
      "made",
      "created",
      "put",
      "built",
      "used",
      "read",
      "seen",
      "done",
      "gone",
      "taken",
      "given",
      "written",
      "spoken",
      "taught",
      "caught",
      "bought",
      "brought",
      "thought",
      "sought",
      "fought",
      "found",
      "bound",
      "wound",
      "left",
      "kept",
      "slept",
      "felt",
      "meant",
      "sent",
      "spent",
      "built",
      "learnt",
      "learned",
    ].includes(w)
  ) {
    return true;
  }
  return /ed$/.test(w) || /en$/.test(w);
}

function looksLikeNoun(surface: string): boolean {
  const w = bareLower(surface);
  if (!w) return false;
  if (AUX_MODAL.has(w) || PREPOSITIONS.has(w) || CLAUSE_CONJ.has(w)) {
    return false;
  }
  if (DETERMINERS.has(w) && w !== "that") return false;
  return true;
}

function looksLikeAdjective(surface: string): boolean {
  const w = bareLower(surface);
  const stripped = w.replace(/^[‘'"“]+|[’”"']+$/g, "");
  return (
    [
      "same",
      "smart",
      "physical",
      "positive",
      "negative",
      "stable",
      "wonderful",
      "common",
      "limiting",
      "loving",
      "great",
      "many",
      "own",
      "further",
      "outside",
    ].includes(stripped) ||
    /ous$|ful$|ive$|al$|ic$|able$|ible$|less$|ish$|ary$|ory$/.test(stripped)
  );
}

export function looksLikeFixedWidthSplit(chunks: WordOrderChunk[]): boolean {
  if (chunks.length < 4) return false;
  const lengths = chunks.map((c) => wordCountInChunk(c.text));
  const counts = new Map<number, number>();
  for (const n of lengths) counts.set(n, (counts.get(n) ?? 0) + 1);
  let most = 0;
  for (const c of counts.values()) most = Math.max(most, c);
  return most / chunks.length >= 0.7;
}

function crossesClauseBoundary(
  tokens: WordOrderToken[],
  start: number,
  end: number
): boolean {
  for (let i = start; i < end; i++) {
    if (hasClauseEndPunct(tokens[i]!.surface)) {
      // Boundary inside chunk: punct mid-chunk then more tokens
      const next = bareLower(tokens[i + 1]!.surface);
      if (
        CLAUSE_CONJ.has(next) ||
        ["we", "you", "they", "he", "she", "it", "i"].includes(next)
      ) {
        return true;
      }
    }
  }
  return false;
}

function isIncompleteAuxChunk(
  tokens: WordOrderToken[],
  start: number,
  end: number
): boolean {
  const words = tokens.slice(start, end + 1).map((t) => bareLower(t.surface));
  if (words.length === 0) return false;
  // "are being" / "have been" / "can" alone
  const allAuxish = words.every(
    (w) => AUX_MODAL.has(w) || w === "being" || w === "been"
  );
  if (!allAuxish) return false;
  // structural linking "is" / "are" alone may be OK
  if (words.length === 1 && STRUCTURAL_VERB.has(words[0]!)) return false;
  // incomplete progressive/passive/perfect auxiliary sequence
  if (words.includes("being") || words.includes("been")) return true;
  if (words.length >= 2 && words.every((w) => AUX_MODAL.has(w))) return true;
  return false;
}

function endsWithIncompleteAux(
  tokens: WordOrderToken[],
  end: number,
  nextStart: number | null
): boolean {
  const low = bareLower(tokens[end]!.surface);
  if (!["being", "been", "have", "has", "had"].includes(low)) return false;
  if (nextStart == null) return false;
  const nxt = tokens[nextStart]!;
  // next looks like participle / verb complement → split mid auxiliary chain
  return (
    looksLikePastParticiple(nxt.surface) ||
    bareLower(nxt.surface) === "held" ||
    bareLower(nxt.surface) === "created"
  );
}

/**
 * Full validation: restore + grammar/boundary rules.
 */
export function validateWordOrderChunksDetailed(
  originalEnglish: string,
  chunks: WordOrderChunk[]
): ChunkValidationResult {
  const issues: ChunkValidationIssue[] = [];
  const tokens = tokenizeForWordOrder(originalEnglish);

  let sourceRestored = false;
  let tokenCoverageValid = false;
  let orderValid = true;
  let boundaryValid = true;
  let grammarGroupingValid = true;

  if (chunks.length < 2) {
    issues.push("TOO_FEW_CHUNKS");
    return {
      ok: false,
      sourceRestored: false,
      tokenCoverageValid: false,
      orderValid: false,
      boundaryValid: false,
      grammarGroupingValid: false,
      issues,
      reason: "청크가 2개 미만",
    };
  }

  if (tokens.length === 0) {
    return {
      ok: false,
      sourceRestored: false,
      tokenCoverageValid: false,
      orderValid: false,
      boundaryValid: false,
      grammarGroupingValid: false,
      issues: ["COVERAGE_FAILED"],
      reason: "빈 원문",
    };
  }

  const sorted = [...chunks].sort(
    (a, b) => a.startTokenIndex - b.startTokenIndex
  );

  for (let i = 0; i < sorted.length; i++) {
    const c = sorted[i]!;
    if (
      c.startTokenIndex > c.endTokenIndex ||
      c.startTokenIndex < 0 ||
      c.endTokenIndex >= tokens.length
    ) {
      orderValid = false;
      issues.push("ORDER_FAILED");
    }
    if (i > 0) {
      const prev = sorted[i - 1]!;
      if (c.startTokenIndex <= prev.endTokenIndex) {
        orderValid = false;
        issues.push("ORDER_FAILED");
      }
      if (c.startTokenIndex !== prev.endTokenIndex + 1) {
        tokenCoverageValid = false;
        issues.push("COVERAGE_FAILED");
      }
    }
  }
  if (sorted[0]!.startTokenIndex === 0 &&
    sorted[sorted.length - 1]!.endTokenIndex === tokens.length - 1 &&
    !issues.includes("COVERAGE_FAILED")
  ) {
    tokenCoverageValid = true;
  } else if (!issues.includes("COVERAGE_FAILED")) {
    tokenCoverageValid = false;
    issues.push("COVERAGE_FAILED");
  }

  const restored = restoreEnglishFromChunks(sorted);
  sourceRestored =
    normalizeWhitespace(restored) === normalizeWhitespace(originalEnglish);
  if (!sourceRestored) issues.push("RESTORE_FAILED");

  let allSingles = true;
  for (let i = 0; i < sorted.length; i++) {
    const c = sorted[i]!;
    const n = wordCountInChunk(c.text);
    if (n !== 1) allSingles = false;
    if (n > WORD_ORDER_MAX_CHUNK_WORDS_FIXED) {
      issues.push("CHUNK_TOO_LONG");
      grammarGroupingValid = false;
    }
    const nextStart =
      i + 1 < sorted.length ? sorted[i + 1]!.startTokenIndex : null;

    if (crossesClauseBoundary(tokens, c.startTokenIndex, c.endTokenIndex)) {
      boundaryValid = false;
      issues.push("CROSSES_CLAUSE_BOUNDARY");
    }
    if (isDeterminerEnding(tokens, c.endTokenIndex, nextStart)) {
      grammarGroupingValid = false;
      issues.push("ENDS_WITH_DETERMINER");
    }
    if (isIncompleteAuxChunk(tokens, c.startTokenIndex, c.endTokenIndex)) {
      grammarGroupingValid = false;
      if (bareLower(tokens[c.endTokenIndex]!.surface) === "being") {
        issues.push("PASSIVE_SPLIT");
      } else if (
        ["been", "have", "has", "had"].includes(
          bareLower(tokens[c.endTokenIndex]!.surface)
        )
      ) {
        issues.push("PERFECT_SPLIT");
      } else {
        issues.push("AUXILIARY_SPLIT");
      }
    }
    if (endsWithIncompleteAux(tokens, c.endTokenIndex, nextStart)) {
      grammarGroupingValid = false;
      issues.push("PASSIVE_SPLIT");
    }

    // adj | noun split across boundary (physical / cues)
    if (nextStart != null && c.endTokenIndex + 1 === nextStart) {
      const a = bareLower(tokens[c.endTokenIndex]!.surface);
      const b = bareLower(tokens[nextStart]!.surface);
      if (
        (looksLikeAdjective(tokens[c.endTokenIndex]!.surface) ||
          a === "physical" ||
          a === "smart" ||
          a === "same") &&
        looksLikeNoun(tokens[nextStart]!.surface) &&
        !PREPOSITIONS.has(b) &&
        !AUX_MODAL.has(b) &&
        !CLAUSE_CONJ.has(b)
      ) {
        // only flag short dangling adjective end
        if (wordCountInChunk(c.text) <= 3) {
          grammarGroupingValid = false;
          issues.push("STRONG_COLLOCATION_SPLIT");
        }
      }
      // phrasal verb split: bring / about
      if (PARTICLES.has(b) && !PREPOSITIONS.has(a) && wordCountInChunk(c.text) === 1) {
        const phrase = `${a} ${b}`;
        if (
          ["bring about", "think about", "focus on", "held captive"].some(
            (p) => phrase.startsWith(p.split(" ")[0]!)
          )
        ) {
          grammarGroupingValid = false;
          issues.push("PHRASAL_VERB_SPLIT");
        }
      }
    }
  }

  if (allSingles) {
    issues.push("ALL_SINGLES");
    grammarGroupingValid = false;
  }

  const singles = sorted.filter((c) => wordCountInChunk(c.text) === 1).length;
  if (singles / sorted.length > WORD_ORDER_MAX_SINGLE_WORD_RATIO) {
    issues.push("TOO_MANY_SINGLE_TOKENS");
    // soft — only fail if also fixed-width or other grammar issues
  }

  const fixedWidth = looksLikeFixedWidthSplit(sorted);
  if (fixedWidth) {
    issues.push("FIXED_WIDTH_SPLIT_PATTERN");
    if (
      issues.includes("ENDS_WITH_DETERMINER") ||
      issues.includes("CROSSES_CLAUSE_BOUNDARY") ||
      issues.includes("AUXILIARY_SPLIT") ||
      issues.includes("PASSIVE_SPLIT") ||
      issues.includes("STRONG_COLLOCATION_SPLIT")
    ) {
      grammarGroupingValid = false;
    }
  }

  const ok =
    sourceRestored &&
    tokenCoverageValid &&
    orderValid &&
    boundaryValid &&
    grammarGroupingValid &&
    !issues.includes("ALL_SINGLES") &&
    !issues.includes("TOO_FEW_CHUNKS");

  return {
    ok,
    sourceRestored,
    tokenCoverageValid,
    orderValid,
    boundaryValid,
    grammarGroupingValid,
    issues: [...new Set(issues)],
    reason: ok ? undefined : issues.join(","),
  };
}

/** Back-compat wrapper. */
export function validateWordOrderChunks(
  originalEnglish: string,
  chunks: WordOrderChunk[]
): { ok: true } | { ok: false; reason: string } {
  const r = validateWordOrderChunksDetailed(originalEnglish, chunks);
  return r.ok ? { ok: true } : { ok: false, reason: r.reason ?? "invalid" };
}

/** Hard split indices: chunk must end at these token indices (inclusive). */
function findClauseSplitEnds(tokens: WordOrderToken[]): number[] {
  const ends: number[] = [];
  for (let i = 0; i < tokens.length - 1; i++) {
    if (hasClauseEndPunct(tokens[i]!.surface)) {
      const next = bareLower(tokens[i + 1]!.surface);
      if (
        CLAUSE_CONJ.has(next) ||
        RELATIVE.has(next) ||
        ["we", "you", "they", "he", "she", "it", "i"].includes(next)
      ) {
        ends.push(i);
      }
    }
  }
  return ends;
}

function extendNounPhrase(
  tokens: WordOrderToken[],
  start: number,
  limit: number
): number {
  let end = start;
  const first = bareLower(tokens[start]!.surface);
  // determiner / quantifier / possessive
  if (DETERMINERS.has(first) || first === "many" || first === "much") {
    end = start;
    let j = start + 1;
    while (j <= limit) {
      const w = bareLower(tokens[j]!.surface);
      if (PREPOSITIONS.has(w) || CLAUSE_CONJ.has(w) || RELATIVE.has(w)) break;
      if (AUX_MODAL.has(w) && j > start + 1) break;
      if (hasClauseEndPunct(tokens[j]!.surface) && j > start) {
        end = j;
        break;
      }
      end = j;
      j += 1;
      if (end - start + 1 >= 6) break;
    }
    return end;
  }
  // adjective + noun(s)
  if (looksLikeAdjective(tokens[start]!.surface) && start < limit) {
    end = start;
    let j = start + 1;
    while (j <= limit && looksLikeNoun(tokens[j]!.surface)) {
      end = j;
      if (hasClauseEndPunct(tokens[j]!.surface)) break;
      j += 1;
      if (end - start + 1 >= 4) break;
    }
    return end;
  }
  return start;
}

function extendVerbGroup(
  tokens: WordOrderToken[],
  start: number,
  limit: number
): number {
  const i = start;
  const first = bareLower(tokens[i]!.surface);
  if (!AUX_MODAL.has(first) && first !== "to") return start;

  // to-infinitive
  if (first === "to" && i < limit) {
    let end = i + 1;
    // optional short object pronoun / noun
    if (
      end < limit &&
      ["it", "them", "him", "her", "us", "me", "you"].includes(
        bareLower(tokens[end + 1]?.surface ?? "")
      )
    ) {
      end += 1;
    } else if (
      end < limit &&
      looksLikeNoun(tokens[end + 1]?.surface ?? "") &&
      !AUX_MODAL.has(bareLower(tokens[end + 1]!.surface)) &&
      wordCountInChunk(
        tokens
          .slice(i, end + 2)
          .map((t) => t.surface)
          .join(" ")
      ) <= 4
    ) {
      // keep short "to reduce confirmation" out — only 1 object word
      const obj = bareLower(tokens[end + 1]!.surface);
      if (["it", "them", "bias"].includes(obj) || obj.length <= 4) {
        end += 1;
      }
    }
    return Math.min(end, limit);
  }

  // Aux chain: are being held / have been created / can bring / don't allow
  let end = i;
  let j = i + 1;
  while (j <= limit && AUX_MODAL.has(bareLower(tokens[j]!.surface))) {
    end = j;
    j += 1;
  }
  // main verb / participle
  if (j <= limit) {
    end = j;
    j += 1;
    // particle / captive / about
    if (j <= limit) {
      const nxt = bareLower(tokens[j]!.surface);
      if (
        PARTICLES.has(nxt) ||
        nxt === "captive" ||
        nxt === "about" ||
        nxt === "away"
      ) {
        end = j;
        j += 1;
        // "away from"
        if (
          j <= limit &&
          bareLower(tokens[end]!.surface) === "away" &&
          bareLower(tokens[j]!.surface) === "from"
        ) {
          end = j;
        }
      }
    }
  }

  // Don't swallow following subject after comma inside verb group
  for (let k = start; k < end; k++) {
    if (hasClauseEndPunct(tokens[k]!.surface)) {
      end = k;
      break;
    }
  }
  return Math.min(end, limit);
}

function extendPrepPhrase(
  tokens: WordOrderToken[],
  start: number,
  limit: number
): number {
  if (!PREPOSITIONS.has(bareLower(tokens[start]!.surface))) return start;
  if (start >= limit) return start;
  // prep + NP
  const npEnd = extendNounPhrase(tokens, start + 1, limit);
  if (npEnd > start) return npEnd;
  // prep + pronoun / gerund
  return Math.min(start + 2, limit);
}

function chunkClauseSpan(
  tokens: WordOrderToken[],
  start: number,
  end: number
): Array<{ start: number; end: number; type?: SemanticChunkType }> {
  const ranges: Array<{ start: number; end: number; type?: SemanticChunkType }> =
    [];
  let i = start;
  while (i <= end) {
    // generic fixed phrases
    let matched = false;
    for (const phrase of GENERIC_PHRASES) {
      const m = matchPhraseAt(tokens, i, phrase);
      if (m != null && m <= end) {
        ranges.push({
          start: i,
          end: m,
          type: "fixed-expression",
        });
        i = m + 1;
        matched = true;
        break;
      }
    }
    if (matched) continue;

    const low = bareLower(tokens[i]!.surface);

    // relative / connector at span start
    if (
      (RELATIVE.has(low) || CLAUSE_CONJ.has(low)) &&
      i === start
    ) {
      // connector + following short subject/aux unit
      let e = i;
      if (i < end) {
        // "yet we don't allow ourselves" — take connector + subject + verb group
        if (["we", "you", "they", "he", "she", "it", "i"].includes(
          bareLower(tokens[i + 1]!.surface)
        )) {
          const vg = extendVerbGroup(tokens, i + 2, end);
          if (vg > i + 1) e = vg;
          else e = Math.min(i + 3, end);
        } else {
          const vg = extendVerbGroup(tokens, i + 1, end);
          e = vg > i ? vg : Math.min(i + 2, end);
        }
      }
      // don't cross inner punct
      for (let k = i; k < e; k++) {
        if (hasClauseEndPunct(tokens[k]!.surface) && k > i) {
          e = k;
          break;
        }
      }
      ranges.push({
        start: i,
        end: e,
        type: RELATIVE.has(low) ? "clause" : "connector",
      });
      i = e + 1;
      continue;
    }

    // verb group
    if (AUX_MODAL.has(low) || low === "to") {
      // structural linking be + that-clause → alone
      if (
        STRUCTURAL_VERB.has(low) &&
        i < end &&
        bareLower(tokens[i + 1]!.surface) === "that"
      ) {
        ranges.push({ start: i, end: i, type: "structural-verb" });
        i += 1;
        continue;
      }
      const e = extendVerbGroup(tokens, i, end);
      ranges.push({
        start: i,
        end: e,
        type: low === "to" ? "infinitive-phrase" : "verb-phrase",
      });
      i = e + 1;
      continue;
    }

    // determiner NP
    if (DETERMINERS.has(low) || low === "many" || low === "much") {
      const e = extendNounPhrase(tokens, i, end);
      ranges.push({ start: i, end: e, type: "noun-phrase" });
      i = e + 1;
      continue;
    }

    // prepositional phrase
    if (PREPOSITIONS.has(low)) {
      // prep + multiword NP/name (the Law of Attraction)
      let phraseHit: number | null = null;
      for (const phrase of GENERIC_PHRASES) {
        const m = matchPhraseAt(tokens, i + 1, phrase);
        if (m != null && m <= end) {
          phraseHit = m;
          break;
        }
      }
      if (phraseHit != null) {
        ranges.push({
          start: i,
          end: phraseHit,
          type: "prepositional-phrase",
        });
        i = phraseHit + 1;
        continue;
      }
      const e = extendPrepPhrase(tokens, i, end);
      ranges.push({ start: i, end: e, type: "prepositional-phrase" });
      i = e + 1;
      continue;
    }

    // subject pronoun + verb group: We are / They are not going
    if (
      ["we", "you", "they", "he", "she", "it", "i"].includes(low) &&
      i < end &&
      AUX_MODAL.has(bareLower(tokens[i + 1]!.surface))
    ) {
      // Prefer "We are" then complement, OR full verb if short
      const aux = bareLower(tokens[i + 1]!.surface);
      if (
        STRUCTURAL_VERB.has(aux) &&
        i + 1 < end &&
        !AUX_MODAL.has(bareLower(tokens[i + 2]?.surface ?? ""))
      ) {
        // We are + wonderfully made → split after are when complement is adjectival
        const comp = tokens[i + 2]!;
        if (
          looksLikeAdjective(comp.surface) ||
          /ly$/.test(bareLower(comp.surface))
        ) {
          ranges.push({ start: i, end: i + 1, type: "verb-phrase" });
          i = i + 2;
          continue;
        }
      }
      const e = extendVerbGroup(tokens, i + 1, end);
      ranges.push({ start: i, end: e, type: "verb-phrase" });
      i = e + 1;
      continue;
    }

    // adjective/adverb + following bound words until punct/prep/conj
    let e = i;
    if (looksLikeAdjective(tokens[i]!.surface) || /ly$/.test(low)) {
      let j = i + 1;
      while (j <= end) {
        const w = bareLower(tokens[j]!.surface);
        if (PREPOSITIONS.has(w) || CLAUSE_CONJ.has(w) || RELATIVE.has(w)) break;
        if (AUX_MODAL.has(w)) break;
        e = j;
        if (hasClauseEndPunct(tokens[j]!.surface)) break;
        j += 1;
        if (e - i + 1 >= 4) break;
      }
      ranges.push({
        start: i,
        end: e,
        type: "participial-phrase",
      });
      i = e + 1;
      continue;
    }

    // default: take content word, pull following noun if tightly bound
    e = i;
    // "and read physical cues" — keep conj + verb + adj + noun
    if (["and", "or", "but"].includes(low) && i < end) {
      let j = i + 1;
      e = i;
      while (j <= end) {
        const w = bareLower(tokens[j]!.surface);
        if (PREPOSITIONS.has(w) && j > i + 1) break;
        if (CLAUSE_CONJ.has(w) && j > i + 1) break;
        if (hasClauseEndPunct(tokens[j]!.surface)) {
          e = j;
          break;
        }
        e = j;
        j += 1;
        if (e - i + 1 >= 5) break;
      }
      ranges.push({ start: i, end: e, type: "clause" });
      i = e + 1;
      continue;
    }
    if (
      i < end &&
      looksLikeNoun(tokens[i + 1]!.surface) &&
      !AUX_MODAL.has(bareLower(tokens[i + 1]!.surface))
    ) {
      e = i + 1;
      if (
        e < end &&
        looksLikeNoun(tokens[e + 1]!.surface) &&
        !hasClauseEndPunct(tokens[e]!.surface) &&
        !AUX_MODAL.has(bareLower(tokens[i]!.surface))
      ) {
        e = e + 1;
      }
    }
    ranges.push({ start: i, end: e, type: "other" });
    i = e + 1;
  }
  return ranges;
}

/**
 * Boundary-first deterministic fallback. Never slices by fixed N words.
 * Returns null when a safe semantic split cannot be produced.
 */
export function buildFallbackWordOrderChunks(
  sentenceId: string,
  english: string
): WordOrderChunk[] | null {
  const tokens = tokenizeForWordOrder(english);
  if (tokens.length < 2) return null;

  const clauseEnds = findClauseSplitEnds(tokens);
  const spans: Array<{ start: number; end: number }> = [];
  let cursor = 0;
  for (const e of clauseEnds) {
    if (e >= cursor) {
      spans.push({ start: cursor, end: e });
      cursor = e + 1;
    }
  }
  if (cursor <= tokens.length - 1) {
    spans.push({ start: cursor, end: tokens.length - 1 });
  }

  const ranges: Array<{
    start: number;
    end: number;
    type?: SemanticChunkType;
  }> = [];
  for (const span of spans) {
    ranges.push(...chunkClauseSpan(tokens, span.start, span.end));
  }

  if (ranges.length < 2) return null;

  // Merge determiner-ending leftovers into following chunk
  for (let i = 0; i < ranges.length - 1; i++) {
    const r = ranges[i]!;
    if (isDeterminerEnding(tokens, r.end, ranges[i + 1]!.start)) {
      ranges.splice(i, 2, {
        start: r.start,
        end: ranges[i + 1]!.end,
        type: "noun-phrase",
      });
      i -= 1;
    }
  }

  // Merge incomplete aux into following
  for (let i = 0; i < ranges.length - 1; i++) {
    const r = ranges[i]!;
    if (
      isIncompleteAuxChunk(tokens, r.start, r.end) ||
      endsWithIncompleteAux(tokens, r.end, ranges[i + 1]!.start)
    ) {
      ranges.splice(i, 2, {
        start: r.start,
        end: ranges[i + 1]!.end,
        type: "verb-phrase",
      });
      i -= 1;
    }
  }

  // Merge dangling adjective / quoted modifier + following noun
  for (let i = 0; i < ranges.length - 1; i++) {
    const r = ranges[i]!;
    const next = ranges[i + 1]!;
    const last = bareLower(tokens[r.end]!.surface);
    const firstNext = bareLower(tokens[next.start]!.surface);
    const lastSurface = tokens[r.end]!.surface;
    const endsWithModifier =
      looksLikeAdjective(lastSurface) ||
      last === "physical" ||
      last === "smart" ||
      last === "same" ||
      /[‘'"]smart[’'"]/i.test(lastSurface) ||
      /^[‘'"].+[’'"]$/.test(lastSurface);
    if (
      endsWithModifier &&
      looksLikeNoun(tokens[next.start]!.surface) &&
      !PREPOSITIONS.has(firstNext) &&
      !AUX_MODAL.has(firstNext) &&
      !CLAUSE_CONJ.has(firstNext) &&
      next.end - r.start + 1 <= 6
    ) {
      ranges.splice(i, 2, {
        start: r.start,
        end: next.end,
        type: "noun-phrase",
      });
      i -= 1;
    }
  }

  // Prefer "for hours and hours" / "hours and hours" as one unit
  for (let i = 0; i < ranges.length - 1; i++) {
    const a = ranges[i]!;
    const b = ranges[i + 1]!;
    const joined = tokens
      .slice(a.start, b.end + 1)
      .map((t) => bareLower(t.surface))
      .join(" ");
    if (/hours and hours/.test(joined) && b.end - a.start + 1 <= 6) {
      ranges.splice(i, 2, {
        start: a.start,
        end: b.end,
        type: "fixed-expression",
      });
      // if merged chunk ends with "hours and hours every day", split every day off later if long
      i -= 1;
      continue;
    }
    // "yet we don't" + "allow ourselves" → one connector VP when short
    const aText = tokens
      .slice(a.start, a.end + 1)
      .map((t) => bareLower(t.surface))
      .join(" ");
    if (
      /^(yet|but|and) we (don.?t|do not)$/i.test(aText) &&
      b.end - a.start + 1 <= 7
    ) {
      ranges.splice(i, 2, {
        start: a.start,
        end: b.end,
        type: "connector",
      });
      i -= 1;
    }
  }

  // Split trailing "every day" from overly long hours chunk
  for (let i = 0; i < ranges.length; i++) {
    const r = ranges[i]!;
    const n = r.end - r.start + 1;
    if (n < 5) continue;
    if (
      bareLower(tokens[r.end]!.surface) === "day" &&
      bareLower(tokens[r.end - 1]?.surface ?? "") === "every"
    ) {
      ranges.splice(
        i,
        1,
        { start: r.start, end: r.end - 2, type: r.type },
        { start: r.end - 1, end: r.end, type: "fixed-expression" }
      );
    }
  }

  const chunks = buildChunksFromRanges(sentenceId, tokens, ranges);
  const v = validateWordOrderChunksDetailed(english, chunks);
  if (!v.ok) {
    console.warn("[WordOrderChunks] fallback validation failed", {
      sentenceId,
      issues: v.issues,
      chunks: chunks.map((c) => c.text).join(" / "),
    });
    return null;
  }
  return chunks;
}

/** Try to read pre-stored phrase/chunk arrays from arbitrary lesson-pack JSON. */
export function extractStoredChunksFromPack(
  pack: unknown,
  sentenceId: string,
  english: string
): WordOrderChunk[] | null {
  if (!pack || typeof pack !== "object") return null;
  const root = pack as Record<string, unknown>;
  const candidates: unknown[] = [];
  for (const key of [
    "wordOrderChunks",
    "semanticChunks",
    "phraseChunks",
    "syntaxUnits",
    "readingChunks",
    "chunks",
  ]) {
    if (root[key] != null) candidates.push(root[key]);
  }
  if (root.wordOrderChunkCache && typeof root.wordOrderChunkCache === "object") {
    candidates.push(root.wordOrderChunkCache);
  }

  for (const c of candidates) {
    const parsed = tryParseStoredSentenceChunks(c, sentenceId, english);
    if (parsed) return parsed;
  }
  return null;
}

function tryParseStoredSentenceChunks(
  raw: unknown,
  sentenceId: string,
  english: string
): WordOrderChunk[] | null {
  if (!raw) return null;
  const tokens = tokenizeForWordOrder(english);

  if (typeof raw === "object" && raw && "sentences" in raw) {
    const sentences = (raw as { sentences?: unknown }).sentences;
    if (Array.isArray(sentences)) {
      const row = sentences.find(
        (s) =>
          s &&
          typeof s === "object" &&
          String((s as { sentenceId?: string }).sentenceId) === sentenceId
      ) as { chunks?: unknown } | undefined;
      if (row?.chunks) {
        return chunksFromTextList(sentenceId, tokens, row.chunks, english);
      }
    }
  }

  if (typeof raw === "object" && raw && sentenceId in (raw as object)) {
    const list = (raw as Record<string, unknown>)[sentenceId];
    return chunksFromTextList(sentenceId, tokens, list, english);
  }

  return null;
}

function chunksFromTextList(
  sentenceId: string,
  tokens: WordOrderToken[],
  list: unknown,
  english: string
): WordOrderChunk[] | null {
  if (!Array.isArray(list) || list.length < 2) return null;
  const texts = list.map((x) => {
    if (typeof x === "string") return normalizeWhitespace(x);
    if (x && typeof x === "object" && "text" in x) {
      return normalizeWhitespace(String((x as { text: unknown }).text ?? ""));
    }
    return "";
  });
  if (texts.some((t) => !t)) return null;

  const ranges: Array<{ start: number; end: number }> = [];
  let cursor = 0;
  for (const text of texts) {
    const parts = text.split(/\s+/).filter(Boolean);
    if (cursor + parts.length > tokens.length) return null;
    for (let i = 0; i < parts.length; i++) {
      if (bareLower(tokens[cursor + i]!.surface) !== bareLower(parts[i]!)) {
        return null;
      }
    }
    ranges.push({ start: cursor, end: cursor + parts.length - 1 });
    cursor += parts.length;
  }
  if (cursor !== tokens.length) return null;
  const chunks = buildChunksFromRanges(sentenceId, tokens, ranges);
  const v = validateWordOrderChunksDetailed(english, chunks);
  return v.ok ? chunks : null;
}
