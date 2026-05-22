import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { VocabSetManagePanel } from "@/components/vocab/VocabSetManagePanel";
import { VocabTableEditor } from "@/components/vocab/VocabTableEditor";
import { VocabTestResultsTable } from "@/components/vocab/VocabTestResultsTable";
import { loadSetTestResults } from "@/lib/vocab/load-set-test-results";
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
    : "/teacher/vocab";

  const { data: items } = await supabase
    .from("vocab_items")
    .select("*")
    .eq("set_id", setId)
    .order("order_index")
    .order("created_at");

  const itemList = (items ?? []) as VocabItem[];

  const testResults = await loadSetTestResults(supabase, setId);

  return (
    <div className="space-y-8">
      <div>
        <Link
          href={listHref}
          className="text-sm text-brand-600 hover:underline"
        >
          ← 폴더로 돌아가기
        </Link>
        <h1 className="mt-2 text-xl font-semibold">{typedSet.title}</h1>
        <p className="text-sm text-slate-500">
          학생 배정은 반 관리 → 해당 반 → 학생별 단어장 배정에서 합니다.
        </p>
      </div>

      <VocabSetManagePanel
        set={typedSet}
        role="teacher"
        onUpdate={actions.updateVocabSet}
        onDelete={actions.deleteVocabSet}
        listHref={listHref}
      />

      <section className="space-y-3">
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
        <h2 className="font-semibold text-slate-900">테스트 결과</h2>
        <p className="text-sm text-slate-500">
          담당 학생이 제출한 최근 테스트 결과입니다.
        </p>
        <VocabTestResultsTable rows={testResults} />
      </section>
    </div>
  );
}
