import type { DictationBlankItem } from "@/lib/listening/dictation/types";

/** 빈칸 정답은 공백 없는 영어 단어 하나만 허용 (I'm, don't 등 축약 허용) */
export function isDictationSingleWord(answer: string): boolean {
  const t = answer.trim();
  if (!t || /\s/.test(t)) return false;
  return /^[A-Za-z]+(?:'[A-Za-z]+)?$/.test(t);
}

/**
 * 받아쓰기로 의미 없는 빈칸: "What am I?"의 What, "Yes." 같은 인사·기능어.
 * 이런 칸이 122개 있었다 — 새로 만들 때 빼고, 이미 있으면 다시 만든다.
 */
const TRIVIAL_BLANK_WORDS = new Set([
  "a", "an", "the", "i", "you", "he", "she", "it", "we", "they", "me", "my", "your",
  "is", "am", "are", "was", "were", "be", "do", "does", "did",
  "yes", "no", "ok", "okay", "oh", "hi", "hello", "bye", "sure", "well", "so",
  "what", "who", "how", "and", "or", "but", "to", "of", "in", "on", "at",
  "thanks", "please", "i'm", "it's", "that's",
]);

export function isTrivialDictationBlank(item: {
  answer: string;
  original_sentence?: string;
  display_sentence?: string;
}): boolean {
  const word = item.answer.trim().toLowerCase().replace(/[’`]/g, "'");
  if (!word || TRIVIAL_BLANK_WORDS.has(word)) return true;
  const sentence = (item.original_sentence || item.display_sentence || "")
    .replace(/^(M|W|ANN)\s*:\s*/i, "")
    .trim();
  // 세 단어 이하 짧은 문장("What am I?", "Yes, I do.")의 빈칸은 들을 필요가 없다
  const words = sentence.split(/\s+/).filter(Boolean).length;
  return words > 0 && words <= 3;
}

/** 이미 만든 빈칸 중 다시 만들어야 할 만큼 뻔한 칸 (좁은 기준 — 멀쩡한 빈칸까지 다시 만들지 않게) */
const CLEARLY_TRIVIAL_WORDS = new Set(["what", "yes", "no", "ok", "okay", "hi", "hello", "bye", "oh"]);

export function isClearlyTrivialDictationBlank(item: {
  answer: string;
  original_sentence?: string;
  display_sentence?: string;
}): boolean {
  const word = item.answer.trim().toLowerCase();
  if (!CLEARLY_TRIVIAL_WORDS.has(word)) return false;
  if (word !== "what") return true;
  // What은 "What am I?"처럼 짧은 문장일 때만
  const sentence = (item.original_sentence || item.display_sentence || "")
    .replace(/^(M|W|ANN)\s*:\s*/i, "")
    .trim();
  return sentence.split(/\s+/).filter(Boolean).length <= 4;
}

export function normalizeLineForMatch(text: string): string {
  return text
    .replace(/[\u2018\u2019\u2032`´]/g, "'")
    .replace(/\u2013|\u2014/g, "-");
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function wordInLine(lineText: string, word: string): boolean {
  const line = normalizeLineForMatch(lineText);
  const w = normalizeLineForMatch(word);
  return new RegExp(`\\b${escapeRegExp(w)}\\b`, "i").test(line);
}

function blankWordInSentence(sentence: string, word: string): string {
  const line = normalizeLineForMatch(sentence);
  const w = normalizeLineForMatch(word);
  const re = new RegExp(`\\b${escapeRegExp(w)}\\b`, "i");
  if (!re.test(line)) return sentence;
  return line.replace(re, "________");
}

export function speakerPrefix(speaker: string): string {
  const sp = String(speaker).toUpperCase();
  if (sp === "W") return "W";
  if (sp === "ANN" || sp === "N" || sp === "NARRATOR" || sp === "A") return "ANN";
  return "M";
}

/** 예전 phrase 빈칸 → 대본에 있는 단어 하나로 변환 */
export function coercePhraseItemToWord(
  item: DictationBlankItem
): DictationBlankItem | null {
  const sentence = (item.original_sentence || item.display_sentence || "")
    .replace(/^(M|W|ANN)\s*:\s*/i, "")
    .trim();
  if (!sentence) return null;

  const candidates: string[] = [];
  if (item.answer?.trim()) candidates.push(item.answer.trim());
  candidates.push(...(item.answer.match(/[A-Za-z]+(?:'[A-Za-z]+)?/g) ?? []));

  const seen = new Set<string>();
  const sorted = [...candidates].sort((a, b) => b.length - a.length);

  for (const raw of sorted) {
    const word = raw.trim();
    const key = word.toLowerCase();
    if (seen.has(key) || word.length < 3) continue;
    seen.add(key);
    if (!isDictationSingleWord(word)) continue;
    if (!wordInLine(sentence, word)) continue;

    const sp = speakerPrefix(item.speaker);
    const blanked = blankWordInSentence(sentence, word);
    return {
      ...item,
      speaker: sp,
      answer: word,
      answer_type: "word",
      original_sentence: sentence,
      display_sentence: blanked.includes("________")
        ? `${sp}: ${blanked}`
        : item.display_sentence,
    };
  }

  return null;
}

/** 구(phrase) → 단어 변환 후 단어만 유지 */
export function filterWordOnlyBlankItems(
  items: DictationBlankItem[]
): DictationBlankItem[] {
  const out: DictationBlankItem[] = [];
  const used = new Set<string>();

  for (const raw of items) {
    let item = raw;
    if (!isDictationSingleWord(item.answer)) {
      const coerced = coercePhraseItemToWord(item);
      if (!coerced) continue;
      item = coerced;
    }

    const answerKey = item.answer.trim().toLowerCase();
    const lineKey = (item.original_sentence || item.display_sentence || "")
      .replace(/^(M|W|ANN)\s*:\s*/i, "")
      .trim()
      .toLowerCase();
    const dedupeKey = `${lineKey}::${answerKey}`;
    if (used.has(dedupeKey)) continue;
    used.add(dedupeKey);

    const sp = speakerPrefix(item.speaker);
    const sentence = (item.original_sentence || item.display_sentence || "").trim();
    const displayCore = sentence.replace(/^(M|W|ANN)\s*:\s*/i, "").trim();
    const blanked = displayCore
      ? blankWordInSentence(displayCore, item.answer)
      : "";

    out.push({
      ...item,
      speaker: sp,
      answer: item.answer.trim(),
      answer_type: "word",
      original_sentence: displayCore || item.original_sentence,
      display_sentence: blanked.includes("________")
        ? `${sp}: ${blanked}`
        : item.display_sentence,
    });
  }

  return out;
}
