import { createClient } from "@/lib/supabase/server";
import {
  buildPrintStagesFromPassage,
  type PrintBlankRow,
} from "@/lib/exam-prep/build-print-model";
import type { ExamPassageSentence } from "@/lib/exam-prep/types";

export async function loadWorkbookPrintData(
  workbookId: string,
  academyId: string,
  showAnswers: boolean
) {
  const supabase = await createClient();
  const { data: wb } = await supabase
    .from("exam_workbooks")
    .select(
      "id, title, passage_id, exam_passages(id, title, original_text, grade, school_level, source, exam_name, passage_number)"
    )
    .eq("id", workbookId)
    .eq("academy_id", academyId)
    .maybeSingle();
  if (!wb) return null;

  const passageRaw = wb.exam_passages as
    | Record<string, unknown>
    | Record<string, unknown>[]
    | null;
  const passage = Array.isArray(passageRaw)
    ? passageRaw[0] ?? null
    : passageRaw;
  if (!passage) return null;
  const passageId = String(passage.id);

  const [{ data: sentences }, { data: blanks }] = await Promise.all([
    supabase
      .from("exam_passage_sentences")
      .select("*")
      .eq("passage_id", passageId)
      .order("sentence_order", { ascending: true }),
    supabase
      .from("exam_stage_blanks")
      .select("*")
      .eq("passage_id", passageId)
      .in("stage_number", [2, 3, 5, 6, 7, 8, 9, 10])
      .order("blank_order", { ascending: true }),
  ]);

  const blanksByStage: Record<number, PrintBlankRow[]> = {};
  const stage7DisplayBySentence: Record<string, string> = {};

  for (const s of sentences ?? []) {
    const display = String(
      (s as { stage7_display_text?: string | null }).stage7_display_text ?? ""
    ).trim();
    if (display) stage7DisplayBySentence[s.id as string] = display;
  }

  for (const row of blanks ?? []) {
    const stage = Number((row as { stage_number: number }).stage_number);
    const list = blanksByStage[stage] ?? [];
    list.push(row as unknown as PrintBlankRow);
    blanksByStage[stage] = list;
  }

  const stages = buildPrintStagesFromPassage({
    sentences: (sentences ?? []) as ExamPassageSentence[],
    blanksByStage,
    stage7DisplayBySentence,
    showAnswers,
  });

  const metaLine = [
    [passage.school_level, passage.grade].filter(Boolean).join(" "),
    passage.source || passage.exam_name,
    passage.passage_number ? `${passage.passage_number}번` : "",
  ]
    .filter(Boolean)
    .join(" · ");

  return {
    workbookTitle: wb.title as string,
    passageTitle: String(passage.title ?? "-"),
    metaLine,
    stages,
  };
}
