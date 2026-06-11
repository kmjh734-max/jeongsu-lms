import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { VocabSetAssignLauncher } from "@/components/vocab/VocabSetAssignLauncher";
import { VocabSetPageHeader } from "@/components/vocab/VocabSetPageHeader";
import { VocabSetManagePanel } from "@/components/vocab/VocabSetManagePanel";
import { VocabTableEditor } from "@/components/vocab/VocabTableEditor";
import { VocabStageProgressTable } from "@/components/vocab/VocabStageProgressTable";
import { loadSetAssignPanelData } from "@/lib/vocab/load-assign-panel";
import { loadSetStageProgressRows } from "@/lib/vocab/load-set-stage-progress";
import * as actions from "@/app/teacher/vocab/actions";
import type { VocabItem, VocabSet } from "@/types/database";

interface PageProps {
  params: Promise<{ setId: string }>;
  searchParams: Promise<{ import?: string }>;
}

export default async function TeacherVocabSetPage({
  params,
  searchParams,
}: PageProps) {
  const { setId } = await params;
  const { import: importParam } = await searchParams;
  const profile = await getCurrentProfile();
  const supabase = await createClient();
  const teacherId = profile!.id;

  const { data: set } = await supabase
    .from("vocab_sets")
    .select("*")
    .eq("id", setId)
    .or(`teacher_id.eq.${teacherId},created_by.eq.${teacherId}`)
    .single();

  if (!set) notFound();

  const typedSet = set as VocabSet;
  const listHref = typedSet.folder_id
    ? `/teacher/vocab/folder/${typedSet.folder_id}`
    : "/teacher/vocab/sets";

  const { data: items } = await supabase
    .from("vocab_items")
    .select("*")
    .eq("set_id", setId)
    .order("order_index")
    .order("created_at");

  const itemList = (items ?? []) as VocabItem[];

  const [stageRows, assignPanel] = await Promise.all([
    loadSetStageProgressRows(supabase, setId),
    loadSetAssignPanelData(supabase, "teacher", teacherId, setId),
  ]);

  const assignment = {
    variant: "set" as const,
    role: "teacher" as const,
    setId,
    scopeLabel: typedSet.title,
    setCount: assignPanel.setCount,
    setTitles: assignPanel.setTitles,
    classes: assignPanel.classes,
    allStudents: assignPanel.allStudents,
    assignments: assignPanel.assignments,
  };

  return (
    <div className="space-y-8">
      <VocabSetPageHeader
        title={typedSet.title}
        itemCount={itemList.length}
        backHref={listHref}
        printHref={`/teacher/vocab/set/${setId}/print`}
        assignLauncher={
          <VocabSetAssignLauncher
            title={`단어장 배정 — ${typedSet.title}`}
            assignment={assignment}
          />
        }
      />

      <VocabSetManagePanel
        set={typedSet}
        role="teacher"
        onUpdate={actions.updateVocabSet}
        onDelete={actions.deleteVocabSet}
        listHref={listHref}
      />

      <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="font-semibold text-slate-900">
          단어 입력 ({itemList.length}개 저장됨)
        </h2>
        <p className="text-sm text-slate-500">
          엑셀처럼 행을 추가·삭제하고, 붙여넣기 또는 AI로 예문을 채운 뒤 저장하세요.
        </p>
        <VocabTableEditor
          setId={setId}
          initialItems={itemList}
          initialImportOpen={importParam === "1"}
          onSave={actions.saveVocabItems}
        />
      </section>

      <section className="space-y-3">
        <h2 className="font-semibold text-slate-900">학생별 학습 진행</h2>
        <p className="text-sm text-slate-500">
          1·2·3단계 완료 여부와 종합테스트 점수입니다.
        </p>
        <VocabStageProgressTable rows={stageRows} />
      </section>
    </div>
  );
}
