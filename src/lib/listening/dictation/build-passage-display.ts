import type { DictationBlankItem } from "@/lib/listening/dictation/types";
import { collectSpokenLines, type SpokenLine } from "@/lib/listening/dictation/spoken-lines";
import {
  normalizeLineForMatch,
  speakerPrefix,
  wordInLine,
} from "@/lib/listening/dictation/word-only";

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

function applyBlankToLine(lineText: string, answer: string): string {
  const line = normalizeLineForMatch(lineText);
  const w = normalizeLineForMatch(answer);
  const re = new RegExp(`\\b${escapeRegExp(w)}\\b`, "i");
  if (!re.test(line)) return lineText;
  return line.replace(re, "________");
}

function findLineForBlank(
  spoken: SpokenLine[],
  item: DictationBlankItem,
  usedLineBlank: Set<string>
): number {
  const sp = speakerPrefix(item.speaker);
  const answer = item.answer.trim();

  for (let i = 0; i < spoken.length; i++) {
    const key = `${i}:${answer.toLowerCase()}`;
    if (usedLineBlank.has(key)) continue;
    const line = spoken[i]!;
    if (line.speaker !== sp) continue;
    if (wordInLine(line.text, answer)) return i;
  }

  for (let i = 0; i < spoken.length; i++) {
    const key = `${i}:${answer.toLowerCase()}`;
    if (usedLineBlank.has(key)) continue;
    if (wordInLine(spoken[i]!.text, answer)) return i;
  }

  return -1;
}

function attachBlank(
  passageLines: DictationPassageLine[],
  item: DictationBlankItem,
  lineIdx: number,
  blankInputs: DictationBlankInputClient[],
  usedLineBlank: Set<string>,
  labelIndex: number
): number {
  const answer = item.answer.trim();
  usedLineBlank.add(`${lineIdx}:${answer.toLowerCase()}`);
  const pl = passageLines[lineIdx]!;
  pl.text = applyBlankToLine(pl.text, answer);
  pl.blankIds.push(item.id);
  blankInputs.push({
    id: item.id,
    label: CIRCLED[labelIndex] ?? `${labelIndex + 1}`,
  });
  return labelIndex + 1;
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
  const usedLineBlank = new Set<string>();
  let labelIndex = 0;

  for (const item of blankItems) {
    const answer = item.answer.trim();
    if (!answer) continue;

    let lineIdx = findLineForBlank(spoken, item, usedLineBlank);

    if (lineIdx < 0) {
      let core = (item.original_sentence || item.display_sentence)
        .replace(/^(M|W)\s*:\s*/i, "")
        .trim();
      if (item.display_sentence.includes("________")) {
        core = item.display_sentence.replace(/^(M|W)\s*:\s*/i, "").trim();
      }
      if (core && wordInLine(core, answer)) {
        const sp = speakerPrefix(item.speaker);
        const existing = passageLines.findIndex(
          (pl) => pl.speaker === sp && wordInLine(pl.text, answer)
        );
        if (existing >= 0) {
          lineIdx = existing;
        } else {
          passageLines.push({
            speaker: sp,
            text: applyBlankToLine(core, answer),
            blankIds: [],
          });
          lineIdx = passageLines.length - 1;
        }
      } else {
        continue;
      }
    }

    labelIndex = attachBlank(
      passageLines,
      item,
      lineIdx,
      blankInputs,
      usedLineBlank,
      labelIndex
    );
  }

  if (blankInputs.length === 0 && blankItems.length > 0) {
    for (const item of blankItems) {
      const answer = item.answer.trim();
      if (!answer) continue;
      const sp = speakerPrefix(item.speaker);
      let text = (item.display_sentence || "")
        .replace(/^(M|W)\s*:\s*/i, "")
        .trim();
      if (!text.includes("________")) {
        const core = (item.original_sentence || "").trim();
        text = core ? applyBlankToLine(core, answer) : text;
      }
      if (!text.includes("________")) continue;

      let lineIdx = passageLines.findIndex(
        (pl) => pl.speaker === sp && pl.text === text
      );
      if (lineIdx < 0) {
        passageLines.push({ speaker: sp, text, blankIds: [] });
        lineIdx = passageLines.length - 1;
      }

      if (blankInputs.some((b) => b.id === item.id)) continue;
      labelIndex = attachBlank(
        passageLines,
        item,
        lineIdx,
        blankInputs,
        usedLineBlank,
        labelIndex
      );
    }
  }

  return { passageLines, blanks: blankInputs };
}
