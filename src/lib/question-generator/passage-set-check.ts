/**
 * 1지문 다문항 세트 검수 — 세트를 다 만든 뒤 공용 지문과 문항을 한꺼번에 놓고,
 * 한 문항이 다른 문항의 답을 알려 주는지 본다(세트당 호출 한 번, 싼 모델).
 * 문항마다 따로 한 직접 풀기·검수로는 문항 사이의 새는 답을 볼 수 없다.
 * 호출이 실패하면 통과로 둔다.
 */
import { questionGeneratorChatJsonWithRetry } from "@/lib/question-generator/openai";
import type { GeneratedQuestionPayload } from "@/lib/question-generator/types";

const CHECK_MODEL =
  process.env.OPENAI_MODEL_QG_SOLVE?.trim() || process.env.OPENAI_MODEL_QG_REVIEW?.trim() || "gpt-5.6-terra";

const SYSTEM = `You check a SET of Korean high-school English exam items that share ONE printed passage.
Students read the passage once and answer every item. You see the passage as printed, each item, and each item's answer.
Find LEAKS only: an item whose question text, choices or statements give away the answer of ANOTHER item in the set —
e.g. a choice or statement that quotes or restates the blanked words, a topic/title choice that is the blank's answer word for word,
a statement that copies an underlined sentence and says whether it is right, a 요약문 that fills in another item's blank.
Sharing the same main idea is normal and is NOT a leak. Do not judge item quality otherwise.
Return ONE JSON object: {"leaks":[{"n":<number of the item that leaks>,"reason":"<Korean, one sentence: which item's answer it gives away and how>"}]} — empty array if none.`;

export interface SetCheckItem {
  n: number;
  payload: GeneratedQuestionPayload;
}

function itemText(p: GeneratedQuestionPayload): string {
  const choices = (p.choices ?? []).map((c) => `  ${c.number}. ${c.text}`).join("\n");
  return [
    `INSTRUCTION: ${p.instruction ?? ""}`,
    p.questionText ? `TEXT:\n${String(p.questionText).slice(0, 1500)}` : "",
    choices ? `CHOICES:\n${choices}` : "",
    `ANSWER: ${JSON.stringify(p.correctAnswer)}`,
  ]
    .filter(Boolean)
    .join("\n");
}

export async function checkPassageSetLeaks(opts: {
  sharedPassage: string;
  items: SetCheckItem[];
}): Promise<Array<{ n: number; reason: string }>> {
  if (opts.items.length < 2) return [];
  const user = [
    `PASSAGE (as printed):\n${opts.sharedPassage.slice(0, 6000)}`,
    ...opts.items.map((it) => `\n--- ITEM ${it.n} (${it.payload.type ?? ""}) ---\n${itemText(it.payload)}`),
  ].join("\n");
  try {
    const raw = (await questionGeneratorChatJsonWithRetry({
      system: SYSTEM,
      user,
      temperature: 0,
      maxTokens: 1200,
      reasoningEffort: "low",
      preferredModels: [CHECK_MODEL],
      cacheKey: "qg-set-leak",
    })) as { leaks?: Array<{ n?: unknown; reason?: unknown }> };
    const known = new Set(opts.items.map((i) => i.n));
    return (Array.isArray(raw.leaks) ? raw.leaks : [])
      .map((l) => ({ n: Number(l.n), reason: String(l.reason ?? "").slice(0, 300) }))
      .filter((l) => known.has(l.n));
  } catch {
    return [];
  }
}

/** 표시형 문항이 만든 공용 지문 — 없으면 원문 */
export function sharedPassageOf(marker: GeneratedQuestionPayload | null, original: string): string {
  const mod = String(marker?.passageModified ?? "").trim();
  return mod || original;
}

/**
 * 뒤에 만드는 문항에 붙이는 메모: 학생이 보는 공용 지문과, 이미 만든 문항의 정답·근거를 피하라는 말.
 */
export function setNoteFor(opts: {
  size: number;
  position: number;
  sharedPassage: string | null;
  made: GeneratedQuestionPayload[];
}): string {
  const lines = [
    `This is item ${opts.position + 1} of a ${opts.size}-item set. All items share one printed passage; students answer every item from it.`,
  ];
  if (opts.sharedPassage) {
    lines.push(
      `Students see the passage WITH another item's marks (blank/underlines). Your item must be answerable from that printed passage, and must not restate, quote or hint at the marked words:\n${opts.sharedPassage.slice(0, 1200)}`
    );
  }
  for (const p of opts.made) {
    lines.push(
      `Another item in the set (${p.type ?? ""}) has the answer ${JSON.stringify(p.correctAnswer).slice(0, 200)}. Do not give it away in your choices or statements, and build your answer from different sentences where you can.`
    );
  }
  return lines.join("\n");
}
