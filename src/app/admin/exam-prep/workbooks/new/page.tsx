import { redirect } from "next/navigation";
import { ExamPrepStaffNav } from "@/components/exam-prep/ExamPrepStaffNav";
import {
  WorkbookCreateForm,
  type WorkbookCreatePassage,
  type WorkbookCreateSet,
} from "@/components/exam-prep/WorkbookCreateForm";
import { PageHeader } from "@/components/ui/PageHeader";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { isExamPrepEnabled } from "@/lib/academy-features";
import { createClient } from "@/lib/supabase/server";

const BASE = "/admin/exam-prep";

type PassageRow = WorkbookCreatePassage & {
  set_id: string | null;
};

type SetRow = {
  id: string;
  title: string;
};

export default async function AdminExamPrepWorkbookNewPage() {
  if (!isExamPrepEnabled()) redirect("/admin");
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== "admin" || !profile.academy_id) {
    redirect("/login");
  }

  const supabase = await createClient();
  const [{ data: setRows }, { data: passageRows }] = await Promise.all([
    supabase
      .from("exam_passage_sets")
      .select("id, title")
      .eq("academy_id", profile.academy_id)
      .order("updated_at", { ascending: false }),
    supabase
      .from("exam_passages")
      .select("id, title, status, set_id, passage_number")
      .eq("academy_id", profile.academy_id)
      .neq("status", "archived")
      .order("passage_number", { ascending: true }),
  ]);

  const passages = (passageRows ?? []) as PassageRow[];
  const bySet = new Map<string, WorkbookCreatePassage[]>();
  for (const p of passages) {
    if (!p.set_id) continue;
    const list = bySet.get(p.set_id) ?? [];
    list.push({
      id: p.id,
      title: p.title,
      status: p.status,
      set_id: p.set_id,
      passage_number: p.passage_number,
    });
    bySet.set(p.set_id, list);
  }

  const sets: WorkbookCreateSet[] = ((setRows ?? []) as SetRow[]).map((s) => ({
    id: s.id,
    title: s.title,
    passages: bySet.get(s.id) ?? [],
  }));

  return (
    <div>
      <PageHeader
        title="워크북 생성"
        description="세트 단위로 지문마다 10단계 WORKBOOK을 만들거나, 지문 하나만 선택할 수 있습니다."
      />
      <ExamPrepStaffNav basePath={BASE} current="workbooks" />
      <WorkbookCreateForm
        basePath={BASE}
        passages={passages.map((p) => ({
          id: p.id,
          title: p.title,
          status: p.status,
          set_id: p.set_id,
          passage_number: p.passage_number,
        }))}
        sets={sets}
      />
    </div>
  );
}
