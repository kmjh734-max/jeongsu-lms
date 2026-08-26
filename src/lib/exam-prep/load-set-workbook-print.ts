import { createClient } from "@/lib/supabase/server";
import { loadWorkbookPrintData } from "@/lib/exam-prep/load-workbook-print";

export type SetWorkbookPrintBundle = {
  setId: string;
  setTitle: string;
  workbooks: NonNullable<Awaited<ReturnType<typeof loadWorkbookPrintData>>>[];
  missingPassageTitles: string[];
};

/**
 * 지문 세트에 속한 지문들의 워크북을 모아 한 번에 인쇄할 데이터.
 * 지문당 최신 워크북 1개씩.
 */
export async function loadSetWorkbookPrintData(
  setId: string,
  academyId: string,
  showAnswers: boolean
): Promise<SetWorkbookPrintBundle | null> {
  const supabase = await createClient();

  const { data: setRow } = await supabase
    .from("exam_passage_sets")
    .select("id, title")
    .eq("id", setId)
    .eq("academy_id", academyId)
    .maybeSingle();
  if (!setRow) return null;

  const { data: passages } = await supabase
    .from("exam_passages")
    .select("id, title, passage_number")
    .eq("set_id", setId)
    .eq("academy_id", academyId)
    .order("passage_number", { ascending: true });

  const list = passages ?? [];
  if (list.length === 0) {
    return {
      setId,
      setTitle: String(setRow.title ?? "세트"),
      workbooks: [],
      missingPassageTitles: [],
    };
  }

  const passageIds = list.map((p) => p.id as string);
  const { data: wbs } = await supabase
    .from("exam_workbooks")
    .select("id, passage_id, updated_at")
    .eq("academy_id", academyId)
    .in("passage_id", passageIds)
    .order("updated_at", { ascending: false });

  const latestByPassage = new Map<string, string>();
  for (const w of wbs ?? []) {
    const pid = String(w.passage_id);
    if (!latestByPassage.has(pid)) {
      latestByPassage.set(pid, String(w.id));
    }
  }

  const workbooks: SetWorkbookPrintBundle["workbooks"] = [];
  const missingPassageTitles: string[] = [];

  for (const p of list) {
    const wbId = latestByPassage.get(p.id as string);
    if (!wbId) {
      missingPassageTitles.push(
        String(p.passage_number ? `#${p.passage_number} ${p.title}` : p.title)
      );
      continue;
    }
    const data = await loadWorkbookPrintData(wbId, academyId, showAnswers);
    if (data) workbooks.push(data);
    else {
      missingPassageTitles.push(
        String(p.passage_number ? `#${p.passage_number} ${p.title}` : p.title)
      );
    }
  }

  return {
    setId,
    setTitle: String(setRow.title ?? "세트"),
    workbooks,
    missingPassageTitles,
  };
}
