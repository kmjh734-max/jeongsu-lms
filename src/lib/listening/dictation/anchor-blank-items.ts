import { normalizeDictationText } from "@/lib/listening/dictation/normalize-text";
import {
  collectDictationLines,
  type SpokenLine,
} from "@/lib/listening/dictation/spoken-lines";
import type { DictationBlankItem } from "@/lib/listening/dictation/types";
import { speakerPrefix, wordInLine } from "@/lib/listening/dictation/word-only";

function sentenceKey(text: string): string {
  return normalizeDictationText(text.replace(/^(M|W)\s*:\s*/i, "").trim());
}

/** 빈칸이 속한 M/W 대본 줄 인덱스 (없으면 -1) */
export function findSpokenLineIndexForBlank(
  spoken: SpokenLine[],
  item: DictationBlankItem
): number {
  const sp = speakerPrefix(item.speaker);
  const answer = item.answer.trim();
  if (!answer || spoken.length === 0) return -1;

  const coreFromItem = (item.original_sentence || item.display_sentence || "")
    .replace(/^(M|W)\s*:\s*/i, "")
    .trim();

  if (coreFromItem) {
    const itemKey = sentenceKey(coreFromItem);
    for (let i = 0; i < spoken.length; i++) {
      const line = spoken[i]!;
      if (line.speaker !== sp) continue;
      if (sentenceKey(line.text) !== itemKey) continue;
      if (wordInLine(line.text, answer)) return i;
    }
  }

  const sameSpeaker: number[] = [];
  for (let i = 0; i < spoken.length; i++) {
    const line = spoken[i]!;
    if (line.speaker !== sp) continue;
    if (wordInLine(line.text, answer)) sameSpeaker.push(i);
  }

  if (sameSpeaker.length === 0) return -1;

  if (coreFromItem) {
    const itemKey = sentenceKey(coreFromItem);
    for (const i of sameSpeaker) {
      const lineKey = sentenceKey(spoken[i]!.text);
      if (lineKey === itemKey) return i;
    }
    for (const i of sameSpeaker) {
      const lineKey = sentenceKey(spoken[i]!.text);
      if (lineKey.includes(itemKey) || itemKey.includes(lineKey)) return i;
    }
    return -1;
  }

  if (sameSpeaker.length === 1) return sameSpeaker[0]!;

  let globalMatches = 0;
  let globalIdx = -1;
  for (let i = 0; i < spoken.length; i++) {
    if (!wordInLine(spoken[i]!.text, answer)) continue;
    globalMatches++;
    globalIdx = i;
  }
  if (globalMatches === 1 && globalIdx >= 0) return globalIdx;

  return -1;
}

/** AI 빈칸을 실제 M/W 지문 줄에만 붙인다 (지문 밖·다른 화자 줄 제거) */
export function anchorDictationBlankItems(
  items: DictationBlankItem[],
  opts: {
    scriptText: string;
    segments?: Array<{ speaker: string; text: string }>;
  }
): DictationBlankItem[] {
  const spoken = collectDictationLines(opts);
  if (!spoken.length) return [];

  const out: DictationBlankItem[] = [];
  const used = new Set<string>();

  for (const raw of items) {
    const lineIdx = findSpokenLineIndexForBlank(spoken, raw);
    if (lineIdx < 0) continue;

    const line = spoken[lineIdx]!;
    const sp = line.speaker;
    const sentence = line.text;
    const answer = raw.answer.trim();
    const dedupeKey = `${sentenceKey(sentence)}::${answer.toLowerCase()}`;
    if (used.has(dedupeKey)) continue;
    used.add(dedupeKey);

    const re = new RegExp(
      `\\b${answer.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`,
      "i"
    );
    const displayCore = re.test(sentence)
      ? sentence.replace(re, "________")
      : sentence;

    out.push({
      ...raw,
      speaker: sp,
      answer,
      answer_type: "word",
      original_sentence: sentence,
      display_sentence: displayCore.includes("________")
        ? `${sp}: ${displayCore}`
        : `${sp}: ${sentence}`,
    });
  }

  return out;
}
