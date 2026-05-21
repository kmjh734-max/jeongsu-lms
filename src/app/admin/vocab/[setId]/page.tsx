import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { VocabSetManagePanel } from "@/components/vocab/VocabSetManagePanel";
import { VocabTableEditor } from "@/components/vocab/VocabTableEditor";
import { VocabAssignForm } from "@/components/vocab/VocabAssignForm";
import { VocabAssignmentList } from "@/components/vocab/VocabAssignmentList";
import { buildClassPickerTree } from "@/lib/ui/build-class-tree";
import {
  buildStudentPickerTree,
} from "@/lib/ui/build-enrollment-trees";
import { parseClassStudentLinks } from "@/lib/ui/parse-class-links";
import * as actions from "@/app/admin/vocab/actions";
import type { Class, Profile, VocabAssignment, VocabItem, VocabSet } from "@/types/database";

interface PageProps {
  params: Promise<{ setId: string }>;
  searchParams: Promise<{ import?: string }>;
}

export default async function AdminVocabDetailPage({
  params,
  searchParams,
}: PageProps) {
  const { setId } = await params;
  const { import: importParam } = await searchParams;
  const supabase = await createClient();

  const { data: set } = await supabase
    .from("vocab_sets")
    .select("*")
    .eq("id", setId)
    .single();

  if (!set) notFound();

  const [
    { data: items },
    { data: assignments },
    { data: students },
    { data: classes },
    { data: teachers },
    { data: classStudents },
  ] = await Promise.all([
    supabase
      .from("vocab_items")
      .select("*")
      .eq("set_id", setId)
      .order("order_index")
      .order("created_at"),
    supabase
      .from("vocab_assignments")
      .select(
        "*, student:profiles!vocab_assignments_student_id_fkey(id, name), class:classes(id, name)"
      )
      .eq("set_id", setId)
      .order("created_at", { ascending: false }),
    supabase.from("profiles").select("*").eq("role", "student").order("name"),
    supabase.from("classes").select("*").eq("is_active", true).order("name"),
    supabase
      .from("profiles")
      .select("*")
      .eq("role", "teacher")
      .eq("is_active", true)
      .order("name"),
    supabase
      .from("class_students")
      .select("student_id, class_id, class:classes(id, name)"),
  ]);

  const itemList = (items ?? []) as VocabItem[];
  const studentList = (students ?? []) as Profile[];
  const classList = (classes ?? []) as Class[];
  const links = parseClassStudentLinks(classStudents);

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/admin/vocab"
          className="text-sm text-brand-600 hover:underline"
        >
          ← 단어학습 목록
        </Link>
        <h1 className="mt-2 text-xl font-semibold">{(set as VocabSet).title}</h1>
      </div>

      <VocabSetManagePanel
        set={set as VocabSet}
        role="admin"
        teachers={(teachers ?? []) as Profile[]}
        onUpdate={actions.updateVocabSet}
        onDelete={actions.deleteVocabSet}
        listHref="/admin/vocab"
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

      <section className="grid gap-6 lg:grid-cols-2">
        <VocabAssignForm
          setId={setId}
          studentTree={buildStudentPickerTree(studentList, links)}
          classTree={buildClassPickerTree(classList)}
          onAssign={actions.assignVocabSet}
        />
        <div>
          <h3 className="mb-3 font-semibold">배정 내역</h3>
          <VocabAssignmentList
            setId={setId}
            assignments={(assignments ?? []) as VocabAssignment[]}
            onRemove={actions.removeVocabAssignment}
          />
        </div>
      </section>
    </div>
  );
}
