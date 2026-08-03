import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  ClassCoursesPanel,
  ClassInfoPanel,
  ClassStudentsPanel,
} from "@/components/classes/ClassDetailPanels";
import { ClassVocabPanel } from "@/components/vocab/ClassVocabPanel";
import { isVocabEnabled } from "@/lib/academy-features";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { loadClassVocabPanelData } from "@/lib/vocab/load-class-vocab";
import { unwrapRelation } from "@/lib/progress/enrollment-progress";
import * as classActions from "@/app/admin/classes/actions";
import type { Class, Course, Profile } from "@/types/database";

interface PageProps {
  params: Promise<{ classId: string }>;
}

export default async function AdminClassDetailPage({ params }: PageProps) {
  const { classId } = await params;
  const profile = await getCurrentProfile();
  const supabase = await createClient();
  const academyId = profile?.academy_id ?? null;

  const { data: classRow } = await supabase
    .from("classes")
    .select("*")
    .eq("id", classId)
    .single();

  if (!classRow) notFound();

  const typedClass = classRow as Class;

  // RLS와 동일하게 학원 범위만 — service role로 조회해 목록이 비는 경우 방지
  const admin = createAdminClient();
  let teachersQ = admin
    .from("profiles")
    .select("*")
    .eq("role", "teacher")
    .eq("is_active", true)
    .order("name");
  let studentsQ = admin
    .from("profiles")
    .select("*")
    .eq("role", "student")
    .eq("is_active", true)
    .order("name");
  let coursesQ = admin.from("courses").select("*").order("title");
  if (academyId) {
    teachersQ = teachersQ.eq("academy_id", academyId);
    studentsQ = studentsQ.eq("academy_id", academyId);
    coursesQ = coursesQ.eq("academy_id", academyId);
  }

  const [
    { data: teachersRaw },
    { data: studentsRaw },
    { data: coursesRaw },
    { data: members },
    { data: classCourses },
  ] = await Promise.all([
    teachersQ,
    studentsQ,
    coursesQ,
    supabase
      .from("class_students")
      .select(
        "id, student_id, student:profiles!class_students_student_id_fkey(name, username)"
      )
      .eq("class_id", classId)
      .order("created_at"),
    supabase
      .from("class_courses")
      .select("id, course_id, course:courses(title)")
      .eq("class_id", classId)
      .order("created_at"),
  ]);

  const memberList = (members ?? []).map((m) => {
    const student = unwrapRelation(m.student);
    return {
      id: m.id as string,
      student_id: m.student_id as string,
      name: student?.name ?? "—",
      username: student?.username ?? null,
    };
  });

  const courseList = (classCourses ?? []).map((cc) => {
    const course = unwrapRelation(cc.course);
    return {
      id: cc.id as string,
      course_id: cc.course_id as string,
      title: course?.title ?? "—",
    };
  });

  const vocabPanel = isVocabEnabled()
    ? await loadClassVocabPanelData(supabase, "admin", profile!.id, classId)
    : null;

  return (
    <div className="space-y-10">
      <div>
        <Link
          href="/admin/classes"
          className="text-sm text-brand-600 hover:underline"
        >
          ← 반 목록
        </Link>
        <h2 className="mt-2 text-xl font-semibold">반 관리</h2>
        <p className="text-sm text-slate-600">{typedClass.name}</p>
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 font-semibold">반 기본 정보</h3>
        <ClassInfoPanel
          variant="admin"
          classId={classId}
          initialName={typedClass.name}
          initialDescription={typedClass.description ?? ""}
          initialTeacherId={typedClass.teacher_id ?? ""}
          initialIsActive={typedClass.is_active}
          teachers={(teachersRaw ?? []) as Profile[]}
        />
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 font-semibold">학생 관리</h3>
        <ClassStudentsPanel
          variant="admin"
          classId={classId}
          members={memberList}
          studentOptions={(studentsRaw ?? []) as Profile[]}
        />
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 font-semibold">강좌 일괄 배정</h3>
        <ClassCoursesPanel
          variant="admin"
          classId={classId}
          classCourses={courseList}
          courseOptions={(coursesRaw ?? []) as Course[]}
        />
      </section>

      {vocabPanel && (
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 font-semibold">학생별 단어장 배정</h3>
          <ClassVocabPanel
            classId={classId}
            students={vocabPanel.students}
            setOptions={vocabPanel.setOptions}
            onAssign={classActions.adminAssignVocabSetToStudent}
            onRemove={(assignmentId, cid) =>
              classActions.adminRemoveVocabSetFromStudent(cid, assignmentId)
            }
          />
        </section>
      )}
    </div>
  );
}
