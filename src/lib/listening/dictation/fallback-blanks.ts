import { blankCountRange } from "@/lib/listening/dictation/blank-level";
import {
  collectDictationLines,
  type SpokenLine,
} from "@/lib/listening/dictation/spoken-lines";
import type {
  DictationBlankItem,
  DictationBlankLevel,
} from "@/lib/listening/dictation/types";
import { normalizeDictationText } from "@/lib/listening/dictation/normalize-text";
import {
  buildWordFrequency,
  scoreContentWords,
  scoreFallbackWords,
} from "@/lib/listening/dictation/content-word-score";
import {
  isTrivialDictationBlank,
  wordInLine,
} from "@/lib/listening/dictation/word-only";

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

/**
 * 한 줄의 빈칸 후보. 예전에는 단어 목록을 코드에 적어 두고 그 단어에만 가산점을 줬다
 * (목록에 없는 소재는 늘 짧은 단어가 뽑혔다). 이제 내용어 규칙·대본 빈도로 점수를 낸다.
 */
function wordCandidates(
  line: string,
  frequency?: Map<string, number>
): Array<{ word: string; importance: number }> {
  const keep = (c: { word: string; score: number }) =>
    !SKIP_WORDS.has(c.word.toLowerCase()) &&
    // "What am I?"의 What, "Yes." 같은 뻔한 칸은 만들지 않는다 (짧은 문장은 빈칸 없이 둔다)
    !isTrivialDictationBlank({ answer: c.word, original_sentence: line });

  const strict = scoreContentWords(line, frequency).filter(keep);
  if (strict.length > 0) return strict.map((c) => ({ word: c.word, importance: c.score }));
  // 내용어가 없는 줄은 느슨한 기준으로라도 한 칸을 만든다 (예전에는 이 줄 때문에 모델을 불렀다)
  return scoreFallbackWords(line)
    .filter(keep)
    .map((c) => ({ word: c.word, importance: c.score }));
}

function makeBlankInSentence(sentence: string, word: string): string {
  const re = new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
  return sentence.replace(re, "________");
}

function pushBlankItem(
  items: DictationBlankItem[],
  p: {
    speaker: string;
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
    if (it.speaker !== line.speaker) continue;
    const orig = (it.original_sentence || "")
      .replace(/^(M|W)\s*:\s*/i, "")
      .trim();
    if (!orig || sentenceKey(orig) !== key) continue;
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
  const frequency = buildWordFrequency(spoken.map((l) => l.text));

  for (const line of spoken) {
    if (sentenceHasBlank(out, line)) continue;

    const candidates = wordCandidates(line.text, frequency);
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
  const spoken = collectDictationLines({
    scriptText: opts.scriptText,
    segments: opts.segments,
  });

  const avoid = new Set(
    (opts.previousBlankWords ?? []).map((w) => normalizeDictationText(w))
  );

  const pool: Array<{
    speaker: string;
    sentence: string;
    word: string;
    importance: number;
  }> = [];

  const frequency = buildWordFrequency(spoken.map((l) => l.text));
  for (const line of spoken) {
    for (const c of wordCandidates(line.text, frequency)) {
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
