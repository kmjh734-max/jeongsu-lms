/**
 * 1지문 다문항 — 표시형 문항이 만든 공용 지문을 뒤 문항에 알려 주는 메모.
 * (문항끼리 답이 새는지 보던 세트 검수는 2026-10-11 뺐다 — 연습용이라 겹쳐도 괜찮다는 선생님 결정)
 */
import type { GeneratedQuestionPayload } from "@/lib/question-generator/types";

/** 표시형 문항이 만든 공용 지문 — 없으면 원문 */
export function sharedPassageOf(marker: GeneratedQuestionPayload | null, original: string): string {
  const mod = String(marker?.passageModified ?? "").trim();
  return mod || original;
}

/** 뒤에 만드는 문항에 붙이는 메모: 학생이 보는 공용 지문 모양 */
export function setNoteFor(opts: { size: number; position: number; sharedPassage: string | null }): string {
  const lines = [
    `This is item ${opts.position + 1} of a ${opts.size}-item set. All items share one printed passage; students answer every item from it.`,
  ];
  if (opts.sharedPassage) {
    lines.push(
      `Students see the passage WITH another item's marks (blank/underlines). Your item must be answerable from that printed passage:\n${opts.sharedPassage.slice(0, 1200)}`
    );
  }
  return lines.join("\n");
}
