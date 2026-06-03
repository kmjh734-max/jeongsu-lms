import type { DictationBlankItem } from "@/lib/listening/dictation/types";

/** 빈칸 정답은 공백 없는 영어 단어 하나만 허용 (I'm, don't 등 축약 허용) */
export function isDictationSingleWord(answer: string): boolean {
  const t = answer.trim();
  if (!t || /\s/.test(t)) return false;
  return /^[A-Za-z]+(?:'[A-Za-z]+)?$/.test(t);
}

function blankWordInSentence(sentence: string, word: string): string {
  const re = new RegExp(
    `\\b${word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`,
    "i"
  );
  if (!re.test(sentence)) return sentence;
  return sentence.replace(re, "________");
}

export function speakerPrefix(speaker: string): string {
  return String(speaker).toUpperCase() === "W" ? "W" : "M";
}

/** 구(phrase) 빈칸 제거 · 단어 하나만 남김 */
export function filterWordOnlyBlankItems(
  items: DictationBlankItem[]
): DictationBlankItem[] {
  const out: DictationBlankItem[] = [];
  const used = new Set<string>();

  for (const item of items) {
    if (!isDictationSingleWord(item.answer)) continue;

    const key = item.answer.trim().toLowerCase();
    if (used.has(key)) continue;
    used.add(key);

    const sp = speakerPrefix(item.speaker);
    const sentence = (item.original_sentence || item.display_sentence || "").trim();
    const displayCore = sentence.replace(/^(M|W)\s*:\s*/i, "").trim();
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
