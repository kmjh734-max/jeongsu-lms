import type { DictationBlankItem } from "@/lib/listening/dictation/types";
import { collectSpokenLines, type SpokenLine } from "@/lib/listening/dictation/spoken-lines";
import { speakerPrefix, wordInLine } from "@/lib/listening/dictation/word-only";

const CIRCLED = ["①", "②", "③", "④", "⑤", "⑥", "⑦", "⑧", "⑨", "⑩"];

export interface DictationPassageLine {
  speaker: string;
  text: string;
  blankIds: string[];
}

export interface DictationBlankInputClient {
  id: string;
  label: string;
}

export interface DictationClientPayload {
  passageLines: DictationPassageLine[];
  blanks: DictationBlankInputClient[];
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function wordPosition(sentence: string, answer: string): number {
  const re = new RegExp(`\\b${escapeRegExp(answer)}\\b`, "i");
  const m = re.exec(sentence);
  return m?.index ?? 99999;
}

function applyBlankToLine(lineText: string, answer: string): string {
  const re = new RegExp(`\\b${escapeRegExp(answer)}\\b`, "i");
  if (!re.test(lineText)) return lineText;
  return lineText.replace(re, "________");
}

function findLineIndex(spoken: SpokenLine[], item: DictationBlankItem): number {
  const sp = speakerPrefix(item.speaker);
  const answer = item.answer.trim();

  for (let i = 0; i < spoken.length; i++) {
    const line = spoken[i]!;
    if (line.speaker === sp && wordInLine(line.text, answer)) return i;
  }
  for (let i = 0; i < spoken.length; i++) {
    if (wordInLine(spoken[i]!.text, answer)) return i;
  }
  return -1;
}

function applyBlanksToLine(
  pl: DictationPassageLine,
  originalText: string,
  items: DictationBlankItem[],
  blankInputs: DictationBlankInputClient[],
  labelIndex: number
): number {
  const sorted = [...items].sort(
    (a, b) => wordPosition(originalText, a.answer) - wordPosition(originalText, b.answer)
  );

  pl.text = originalText;
  pl.blankIds = [];

  for (const item of sorted) {
    const answer = item.answer.trim();
    pl.text = applyBlankToLine(pl.text, answer);
    pl.blankIds.push(item.id);
    blankInputs.push({
      id: item.id,
      label: CIRCLED[labelIndex] ?? `${labelIndex + 1}`,
    });
    labelIndex++;
  }

  return labelIndex;
}

export function buildDictationClientPayload(
  blankItems: DictationBlankItem[],
  opts: {
    scriptText: string;
    segments?: Array<{ speaker: string; text: string }>;
  }
): DictationClientPayload {
  const spoken = collectSpokenLines(opts);

  const passageLines: DictationPassageLine[] = spoken.map((line) => ({
    speaker: line.speaker,
    text: line.text,
    blankIds: [],
  }));

  const blankInputs: DictationBlankInputClient[] = [];
  const itemsByLine = new Map<number, DictationBlankItem[]>();
  const seenItemIds = new Set<string>();

  function addToLine(lineIdx: number, item: DictationBlankItem) {
    if (seenItemIds.has(item.id)) return;
    seenItemIds.add(item.id);
    const list = itemsByLine.get(lineIdx) ?? [];
    list.push(item);
    itemsByLine.set(lineIdx, list);
  }

  for (const item of blankItems) {
    const answer = item.answer.trim();
    if (!answer) continue;

    let lineIdx = findLineIndex(spoken, item);
    if (lineIdx < 0) {
      const sp = speakerPrefix(item.speaker);
      const core = (item.original_sentence || item.display_sentence)
        .replace(/^(M|W)\s*:\s*/i, "")
        .trim();
      if (!core || !wordInLine(core, answer)) continue;

      lineIdx = spoken.findIndex((l) => l.speaker === sp && wordInLine(l.text, answer));
      if (lineIdx < 0) {
        spoken.push({ speaker: sp as "M" | "W", text: core });
        passageLines.push({ speaker: sp, text: core, blankIds: [] });
        lineIdx = spoken.length - 1;
      }
    }
    addToLine(lineIdx, item);
  }

  let labelIndex = 0;
  for (const [lineIdx, items] of itemsByLine) {
    const original = spoken[lineIdx]?.text ?? passageLines[lineIdx]?.text ?? "";
    if (!passageLines[lineIdx]) continue;
    labelIndex = applyBlanksToLine(
      passageLines[lineIdx]!,
      original,
      items,
      blankInputs,
      labelIndex
    );
  }

  return { passageLines, blanks: blankInputs };
}
