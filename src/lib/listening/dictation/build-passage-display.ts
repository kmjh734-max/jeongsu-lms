import type { DictationBlankItem } from "@/lib/listening/dictation/types";
import { collectSpokenLines, type SpokenLine } from "@/lib/listening/dictation/spoken-lines";
import { speakerPrefix } from "@/lib/listening/dictation/word-only";

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

function wordInLine(lineText: string, word: string): boolean {
  return new RegExp(`\\b${escapeRegExp(word)}\\b`, "i").test(lineText);
}

function applyBlankToLine(lineText: string, answer: string): string {
  const re = new RegExp(`\\b${escapeRegExp(answer)}\\b`, "i");
  if (!re.test(lineText)) return lineText;
  return lineText.replace(re, "________");
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
      const core = (item.original_sentence || item.display_sentence)
        .replace(/^(M|W)\s*:\s*/i, "")
        .trim();
      if (core && wordInLine(core, answer)) {
        passageLines.push({
          speaker: speakerPrefix(item.speaker),
          text: applyBlankToLine(core, answer),
          blankIds: [],
        });
        lineIdx = passageLines.length - 1;
        spoken.push({
          speaker: speakerPrefix(item.speaker) as "M" | "W",
          text: core,
        });
      } else {
        continue;
      }
    }

    usedLineBlank.add(`${lineIdx}:${answer.toLowerCase()}`);
    const pl = passageLines[lineIdx]!;
    pl.text = applyBlankToLine(pl.text, answer);
    pl.blankIds.push(item.id);
    blankInputs.push({
      id: item.id,
      label: CIRCLED[labelIndex] ?? `${labelIndex + 1}`,
    });
    labelIndex++;
  }

  return { passageLines, blanks: blankInputs };
}
