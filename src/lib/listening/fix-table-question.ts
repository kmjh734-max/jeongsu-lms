import { normalizeTableData } from "@/lib/listening/table-data";
import type { GeneratedListeningQuestion } from "@/lib/listening/types";

/** 14번 표/정보 불일치 문항 보정 */
export function fixTableQuestion(
  q: GeneratedListeningQuestion,
  typeId: number
): GeneratedListeningQuestion {
  if (typeId !== 14) return q;

  const table_data = normalizeTableData(q.table_data) ?? normalizeTableData(
    (q as { table_data?: unknown }).table_data
  );
  if (!table_data) return { ...q, table_data: null };

  const correct_answer = table_data.mismatch_no;
  const answer_clue =
    q.answer_clue?.trim() || table_data.mismatch_reason || q.answer_clue;

  return {
    ...q,
    table_data,
    correct_answer,
    question_text: "",
    answer_clue,
  };
}
