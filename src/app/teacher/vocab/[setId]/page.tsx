import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { VocabSetManagePanel } from "@/components/vocab/VocabSetManagePanel";
import { VocabTableEditor } from "@/components/vocab/VocabTableEditor";
import { VocabAssignForm } from "@/components/vocab/VocabAssignForm";
import { VocabAssignmentList } from "@/components/vocab/VocabAssignmentList";
import { TeacherVocabProgressTable } from "@/components/vocab/TeacherVocabProgressTable";
import { buildClassPickerTree } from "@/lib/ui/build-class-tree";
import { buildStudentPickerTree } from "@/lib/ui/build-enrollment-trees";
import { parseClassStudentLinks } from "@/lib/ui/parse-class-links";
import { buildTeacherVocabProgressRows } from "@/lib/vocab/teacher-progress";
import * as actions from "@/app/teacher/vocab/actions";
import type { Class, Profile, VocabAssignment, VocabItem, VocabSet } from "@/types/database";

interface PageProps {
  params: Promise<{ setId: string }>;
  searchParams: Promise<{ import?: string }>;
}

export default async function TeacherVocabDetailPage({
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

  const { data: teacherClasses } = await supabase
    .from("classes")
    .select("*")
    .eq("teacher_id", teacherId)
    .order("name");

  const classIds = (teacherClasses ?? []).map((c) => c.id);

  const [
    { data: items },
    { data: assignments },
    { data: students },
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
      .eq("set_id", setId),
    supabase
      .from("profiles")
      .select("*")
      .eq("role", "student")
      .eq("created_by", teacherId)
      .order("name"),
    classIds.length > 0
      ? supabase
          .from("class_students")
          .select("student_id, class_id, class:classes(id, name)")
          .in("class_id", classIds)
      : { data: [] },
  ]);

  const itemList = (items ?? []) as VocabItem[];
  const itemIds = itemList.map((i) => i.id);
  const progressRows = await buildTeacherVocabProgressRows(
    supabase,
    setId,
    itemIds
  );

  const classStudentLinks = parseClassStudentLinks(classStudents);

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/teacher/vocab"
          className="text-sm text-brand-600 hover:underline"
        >
          ← 단어학습 목록
        </Link>
        <h1 className="mt-2 text-xl font-semibold">{(set as VocabSet).title}</h1>
      </div>

      <VocabSetManagePanel
        set={set as VocabSet}
        role="teacher"
        onUpdate={actions.updateVocabSet}
        onDelete={actions.deleteVocabSet}
        listHref="/teacher/vocab"
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
          studentTree={buildStudentPickerTree(
            (students ?? []) as Profile[],
            classStudentLinks
          )}
          classTree={buildClassPickerTree((teacherClasses ?? []) as Class[])}
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

      <section>
        <h2 className="mb-3 font-semibold">학생별 학습 상태</h2>
        <TeacherVocabProgressTable rows={progressRows} />
      </section>
    </div>
  );
}
