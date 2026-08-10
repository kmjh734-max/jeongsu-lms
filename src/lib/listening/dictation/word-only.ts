import type { DictationBlankItem } from "@/lib/listening/dictation/types";

/** 빈칸 정답은 공백 없는 영어 단어 하나만 허용 (I'm, don't 등 축약 허용) */
export function isDictationSingleWord(answer: string): boolean {
  const t = answer.trim();
  if (!t || /\s/.test(t)) return false;
  return /^[A-Za-z]+(?:'[A-Za-z]+)?$/.test(t);
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
