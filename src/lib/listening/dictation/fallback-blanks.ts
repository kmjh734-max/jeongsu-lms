import { blankCountRange } from "@/lib/listening/dictation/blank-level";
import { collectSpokenLines, type SpokenLine } from "@/lib/listening/dictation/spoken-lines";
import type {
  DictationBlankItem,
  DictationBlankLevel,
} from "@/lib/listening/dictation/types";
import { normalizeDictationText } from "@/lib/listening/dictation/normalize-text";
import { wordInLine } from "@/lib/listening/dictation/word-only";

const SKIP_WORDS = new Set([
  "a",
  "an",
  "the",
  "i",
  "you",
  "he",
  "she",
  "it",
  "we",
  "they",
  "me",
  "my",
  "your",
  "his",
  "her",
  "our",
  "their",
  "am",
  "is",
  "are",
  "was",
  "were",
  "be",
  "been",
  "to",
  "of",
  "in",
  "on",
  "at",
  "for",
  "and",
  "or",
  "but",
  "so",
  "do",
  "does",
  "did",
  "can",
  "will",
  "would",
  "could",
  "should",
  "let",
  "lets",
  "let's",
]);

/** 문장당 추가 빈칸 상한 (단어 1개씩) */
const MAX_BLANKS_PER_SENTENCE = 3;

function sentenceKey(sentence: string): string {
  return normalizeDictationText(sentence);
}

function wordCandidates(line: string): Array<{ word: string; importance: number }> {
  const tokens = line.match(/[A-Za-z]+(?:'[A-Za-z]+)?/g) ?? [];
  const out: Array<{ word: string; importance: number }> = [];
  for (const raw of tokens) {
    const word = raw.replace(/^['"]|['"]$/g, "");
    const key = word.toLowerCase();
    if (key.length < 3 || SKIP_WORDS.has(key)) continue;
    let importance = Math.min(10, 3 + Math.floor(word.length / 2));
    if (
      /(subway|bus|library|museum|station|poster|science|lunch|worried|drawing|pictures|because|before|after|tomorrow|yesterday|monday|tuesday|happy|sad|angry|teacher|doctor|police)/i.test(
        word
      )
    ) {
      importance += 4;
    }
    out.push({ word, importance });
  }
  return out.sort((a, b) => b.importance - a.importance);
}

function makeBlankInSentence(sentence: string, word: string): string {
  const re = new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
  return sentence.replace(re, "________");
}

function pushBlankItem(
  items: DictationBlankItem[],
  p: {
    speaker: "M" | "W";
    sentence: string;
    word: string;
    importance: number;
  },
  usedWords: Set<string>
): void {
  const wKey = normalizeDictationText(p.word);
  if (usedWords.has(wKey)) return;
  usedWords.add(wKey);
  items.push({
    id: `blank_${items.length + 1}`,
    speaker: p.speaker,
    original_sentence: p.sentence,
    display_sentence: makeBlankInSentence(p.sentence, p.word),
    answer: p.word,
    answer_type: "word",
    importance: p.importance >= 8 ? "key_information" : "key_expression",
  });
}

function sentenceHasBlank(
  items: DictationBlankItem[],
  line: SpokenLine
): boolean {
  const key = sentenceKey(line.text);
  for (const it of items) {
    const orig = (it.original_sentence || "")
      .replace(/^(M|W)\s*:\s*/i, "")
      .trim();
    if (sentenceKey(orig) === key) return true;
    if (wordInLine(line.text, it.answer)) return true;
  }
  return false;
}

/** AI·수동 생성 결과에 문장당 최소 1빈칸 보장 */
export function ensureOneBlankPerSpokenLine(
  items: DictationBlankItem[],
  spoken: SpokenLine[],
  avoidWords: string[] = []
): DictationBlankItem[] {
  const avoid = new Set(avoidWords.map((w) => normalizeDictationText(w)));
  const out = [...items];
  const usedWords = new Set(
    out.map((i) => normalizeDictationText(i.answer)).filter(Boolean)
  );

  for (const line of spoken) {
    if (sentenceHasBlank(out, line)) continue;

    const candidates = wordCandidates(line.text);
    for (const c of candidates) {
      const wKey = normalizeDictationText(c.word);
      if (avoid.has(wKey) || usedWords.has(wKey)) continue;
      pushBlankItem(
        out,
        {
          speaker: line.speaker,
          sentence: line.text,
          word: c.word,
          importance: c.importance,
        },
        usedWords
      );
      break;
    }
  }

  return out;
}

export function buildFallbackDictationBlanks(opts: {
  scriptText: string;
  segments?: Array<{ speaker: string; text: string }>;
  blankLevel: DictationBlankLevel;
  previousBlankWords?: string[];
  answerClue?: string;
}): DictationBlankItem[] {
  const spoken = collectSpokenLines({
    scriptText: opts.scriptText,
    segments: opts.segments,
  });

  const avoid = new Set(
    (opts.previousBlankWords ?? []).map((w) => normalizeDictationText(w))
  );

  const pool: Array<{
    speaker: "M" | "W";
    sentence: string;
    word: string;
    importance: number;
  }> = [];

  for (const line of spoken) {
    for (const c of wordCandidates(line.text)) {
      if (avoid.has(normalizeDictationText(c.word))) continue;
      pool.push({
        speaker: line.speaker,
        sentence: line.text,
        word: c.word,
        importance: c.importance,
      });
    }
  }

  pool.sort((a, b) => b.importance - a.importance);

  const { min, max } = blankCountRange(opts.blankLevel, spoken.length);
  const target = Math.min(max, Math.max(min, pool.length));
  const usedWords = new Set<string>();
  const blanksPerSentence = new Map<string, number>();
  const items: DictationBlankItem[] = [];

  for (const line of spoken) {
    const sk = sentenceKey(line.text);
    if ((blanksPerSentence.get(sk) ?? 0) > 0) continue;

    const linePool = pool.filter((p) => sentenceKey(p.sentence) === sk);
    for (const p of linePool) {
      pushBlankItem(items, p, usedWords);
      blanksPerSentence.set(sk, 1);
      break;
    }
  }

  for (const p of pool) {
    if (items.length >= target) break;
    const wKey = normalizeDictationText(p.word);
    if (usedWords.has(wKey)) continue;
    const sk = sentenceKey(p.sentence);
    const countInSentence = blanksPerSentence.get(sk) ?? 0;
    if (countInSentence >= MAX_BLANKS_PER_SENTENCE) continue;

    usedWords.add(wKey);
    blanksPerSentence.set(sk, countInSentence + 1);
    pushBlankItem(items, p, usedWords);
  }

  return ensureOneBlankPerSpokenLine(items, spoken, opts.previousBlankWords ?? []);
}
