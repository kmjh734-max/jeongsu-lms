import type { DictationBlankItem } from "@/lib/listening/dictation/types";
import { collectSpokenLines } from "@/lib/listening/dictation/spoken-lines";

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

function normalizeLineKey(text: string): string {
  return text
    .replace(/^(M|W)\s*:\s*/i, "")
    .replace(/_{2,}/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function lineKeyFromBlankItem(item: DictationBlankItem): string {
  const raw = item.original_sentence?.trim() || item.display_sentence;
  return normalizeLineKey(raw);
}

function applyBlankToLine(lineText: string, answer: string): string {
  const re = new RegExp(
    `\\b${answer.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`,
    "i"
  );
  if (!re.test(lineText)) return lineText;
  return lineText.replace(re, "________");
}

export function buildDictationClientPayload(
  blankItems: DictationBlankItem[],
  opts: {
    scriptText: string;
    segments?: Array<{ speaker: string; text: string }>;
  }
): DictationClientPayload {
  const spoken = collectSpokenLines(opts);
  const blanksByLine = new Map<string, DictationBlankItem[]>();

  for (const item of blankItems) {
    const key = lineKeyFromBlankItem(item);
    const list = blanksByLine.get(key) ?? [];
    list.push(item);
    blanksByLine.set(key, list);
  }

  const passageLines: DictationPassageLine[] = [];
  const blankInputs: DictationBlankInputClient[] = [];
  let labelIndex = 0;

  for (const line of spoken) {
    const key = normalizeLineKey(line.text);
    const items = blanksByLine.get(key) ?? [];
    let displayText = line.text;
    const blankIds: string[] = [];

    for (const item of items) {
      displayText = applyBlankToLine(displayText, item.answer);
      blankIds.push(item.id);
      blankInputs.push({
        id: item.id,
        label: CIRCLED[labelIndex] ?? `${labelIndex + 1}`,
      });
      labelIndex++;
    }

    passageLines.push({
      speaker: line.speaker,
      text: items.length > 0 ? displayText : line.text,
      blankIds,
    });
  }

  const usedBlankIds = new Set(blankInputs.map((b) => b.id));

  for (const item of blankItems) {
    if (usedBlankIds.has(item.id)) continue;
    const answer = item.answer.trim();
    let attached = false;
    for (let i = 0; i < passageLines.length; i++) {
      const pl = passageLines[i]!;
      const lineText = spoken[i]?.text ?? pl.text;
      if (!answer || !new RegExp(`\\b${answer.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i").test(lineText)) {
        continue;
      }
      pl.text = applyBlankToLine(lineText, answer);
      pl.blankIds.push(item.id);
      blankInputs.push({
        id: item.id,
        label: CIRCLED[labelIndex] ?? `${labelIndex + 1}`,
      });
      labelIndex++;
      usedBlankIds.add(item.id);
      attached = true;
      break;
    }
    if (!attached) {
      let text = item.display_sentence.replace(/^(M|W)\s*:\s*/i, "").trim();
      if (answer) text = applyBlankToLine(text, answer);
      blankInputs.push({
        id: item.id,
        label: CIRCLED[labelIndex] ?? `${labelIndex + 1}`,
      });
      labelIndex++;
      passageLines.push({
        speaker: String(item.speaker).toUpperCase() === "W" ? "W" : "M",
        text,
        blankIds: [item.id],
      });
    }
  }

  return { passageLines, blanks: blankInputs };
}
