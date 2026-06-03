import { blankCountRange } from "@/lib/listening/dictation/blank-level";
import { collectSpokenLines } from "@/lib/listening/dictation/spoken-lines";
import type {
  DictationBlankItem,
  DictationBlankLevel,
} from "@/lib/listening/dictation/types";
import { normalizeDictationText } from "@/lib/listening/dictation/normalize-text";

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

function wordCandidates(line: string): Array<{ word: string; importance: number }> {
  const tokens = line.match(/[A-Za-z]+(?:'[A-Za-z]+)?/g) ?? [];
  const out: Array<{ word: string; importance: number }> = [];
  for (const raw of tokens) {
    const word = raw.replace(/^['"]|['"]$/g, "");
    const key = word.toLowerCase();
    if (key.length < 3 || SKIP_WORDS.has(key)) continue;
    let importance = Math.min(10, 3 + Math.floor(word.length / 2));
    if (/(subway|bus|library|museum|station|faster|slower|because|before|after|tomorrow|yesterday|monday|tuesday|happy|sad|angry|teacher|doctor|police)/i.test(word)) {
      importance += 4;
    }
    out.push({ word, importance });
  }
  return out;
}

function makeBlankInSentence(sentence: string, word: string): string {
  const re = new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
  return sentence.replace(re, "________");
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

  for (const p of pool) {
    if (items.length >= target) break;
    const wKey = normalizeDictationText(p.word);
    if (usedWords.has(wKey)) continue;
    const sentenceKey = normalizeDictationText(p.sentence);
    const countInSentence = blanksPerSentence.get(sentenceKey) ?? 0;
    if (countInSentence >= 2 && items.length >= min) continue;

    usedWords.add(wKey);
    blanksPerSentence.set(sentenceKey, countInSentence + 1);
    const id = `blank_${items.length + 1}`;
    items.push({
      id,
      speaker: p.speaker,
      original_sentence: p.sentence,
      display_sentence: makeBlankInSentence(p.sentence, p.word),
      answer: p.word,
      answer_type: "word",
      importance:
        p.importance >= 8 ? "key_information" : "key_expression",
    });
  }

  return items;
}
