import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/ui/PageHeader";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { createAdminClient } from "@/lib/supabase/admin";
import { loadStudyPlan } from "@/lib/study-plan";
import { isStudyPlanEnabled } from "@/lib/study-plan/access";
import { weekdayLabel } from "@/lib/study-plan/weekday-dates";
import { StudyPlanEditor, type PlanStudent } from "@/components/study-plan/StudyPlanEditor";
import {
  StudyPlanPicker,
  type PickerClass,
  type PickerTeacher,
} from "@/components/study-plan/StudyPlanPicker";
import { listTextbooks } from "@/lib/textbooks";

interface PageProps {
  searchParams: Promise<{
    student?: string;
    class?: string;
    teacher?: string;
    year?: string;
    month?: string;
  }>;
}

/** 반 이름 옆에 붙는 한 줄: "월수금 17:00~19:00" */
function classTimeLabel(c: {
  weekdays?: number[] | null;
  start_time?: string | null;
  end_time?: string | null;
}): string | null {
  const time = [String(c.start_time ?? "").slice(0, 5), String(c.end_time ?? "").slice(0, 5)]
    .filter(Boolean)
    .join("~");
  const label = [weekdayLabel(c.weekdays), time].filter(Boolean).join(" ");
  return label || null;
}

/** 학습일정표 — 반을 고르고, 그 반 학생의 한 달 계획을 채운다 */
export default async function StudyPlansPage({ searchParams }: PageProps) {
  const [profile, sp] = await Promise.all([getCurrentProfile(), searchParams]);
  if (!(await isStudyPlanEnabled(profile?.academy_id))) notFound();
  const admin = createAdminClient();
  const academyId = profile?.academy_id ?? null;
  const now = new Date();
  const year = Number(sp.year) || now.getFullYear();
  const month = Number(sp.month) || now.getMonth() + 1;

  const [{ data: students }, { data: classRows }, { data: memberRows }, { data: teacherRows }] =
    await Promise.all([
    academyId
      ? admin
          .from("profiles")
          .select("id, name, school, school_grade, phone, parent_phone, enrolled_on")
          .eq("academy_id", academyId)
          .eq("role", "student")
          .not("approved_at", "is", null)
          .order("name")
      : Promise.resolve({ data: [] as Record<string, unknown>[] }),
    academyId
      ? admin
          .from("classes")
          .select("id, name, weekdays, start_time, end_time, is_active, teacher_id")
          .eq("academy_id", academyId)
          .order("name")
      : Promise.resolve({ data: [] as Record<string, unknown>[] }),
      academyId
        ? admin.from("class_students").select("class_id, student_id")
        : Promise.resolve({ data: [] as Record<string, unknown>[] }),
      academyId
        ? admin
            .from("profiles")
            .select("id, name")
            .eq("academy_id", academyId)
            .in("role", ["teacher", "admin"])
            .order("name")
        : Promise.resolve({ data: [] as Record<string, unknown>[] }),
    ]);

  const list = students ?? [];
  const byId = new Map(list.map((s) => [String(s.id), s]));

  // 반 → 학생. 어느 반에도 없는 학생은 맨 뒤 '반 없음' 칸으로.
  const studentIdsByClass = new Map<string, string[]>();
  const inSomeClass = new Set<string>();
  for (const m of memberRows ?? []) {
    const cid = String(m.class_id);
    const sid = String(m.student_id);
    if (!byId.has(sid)) continue;
    const arr = studentIdsByClass.get(cid) ?? [];
    arr.push(sid);
    studentIdsByClass.set(cid, arr);
    inSomeClass.add(sid);
  }

  const toPicker = (sid: string) => {
    const r = byId.get(sid)!;
    return { id: sid, name: String(r.name ?? ""), school: (r.school as string | null) ?? null };
  };

  const classes: PickerClass[] = (classRows ?? [])
    .filter((c) => c.is_active !== false)
    .map((c) => ({
      id: String(c.id),
      name: String(c.name ?? ""),
      time: classTimeLabel(
        c as { weekdays?: number[] | null; start_time?: string | null; end_time?: string | null },
      ),
      teacherId: String(c.teacher_id ?? ""),
      students: (studentIdsByClass.get(String(c.id)) ?? []).map(toPicker),
    }));
  const loose = list.filter((s) => !inSomeClass.has(String(s.id))).map((s) => toPicker(String(s.id)));
  if (loose.length > 0) {
    classes.push({ id: "", name: "반 없음", time: null, teacherId: "", students: loose });
  }

  // 반을 맡고 있는 선생님만 보여 준다. 담당이 비어 있는 반은 '담당 없음' 칸으로.
  const teacherName = new Map((teacherRows ?? []).map((t) => [String(t.id), String(t.name ?? "")]));
  const usedTeacherIds = [...new Set(classes.map((c) => c.teacherId))];
  const teachers: PickerTeacher[] = usedTeacherIds
    .filter((id) => id !== "")
    .map((id) => ({ id, name: teacherName.get(id) ?? "이름 없음" }))
    .sort((a, b) => a.name.localeCompare(b.name, "ko"));
  if (usedTeacherIds.includes("")) teachers.push({ id: "", name: "담당 없음" });

  // 고른 선생님·반·학생 — 주소에 없으면 학생이 있는 첫 반의 첫 학생
  const wantedClass = sp.class ?? null;
  const currentClass =
    (wantedClass !== null ? classes.find((c) => c.id === wantedClass) : null) ??
    classes.find((c) => c.students.some((s) => s.id === sp.student)) ??
    classes.find((c) => c.students.length > 0) ??
    classes[0] ??
    null;
  const classId = currentClass?.id ?? "";
  const teacherId =
    (sp.teacher !== undefined && teachers.some((t) => t.id === sp.teacher) ? sp.teacher : null) ??
    currentClass?.teacherId ??
    teachers[0]?.id ??
    "";
  const studentId =
    (sp.student && currentClass?.students.some((s) => s.id === sp.student) ? sp.student : null) ??
    currentClass?.students[0]?.id ??
    "";
  const row = studentId ? byId.get(studentId) : undefined;

  // 일정표 머리에 넣을 반·수업 시간
  const { data: classRow } = studentId
    ? await admin
        .from("class_students")
        .select("classes(name, weekdays, start_time, end_time)")
        .eq("student_id", studentId)
        .limit(1)
        .maybeSingle()
    : { data: null };
  const cls = (classRow?.classes ?? null) as
    | { name?: string; weekdays?: number[] | null; start_time?: string | null; end_time?: string | null }
    | null;
  const classTime = cls ? classTimeLabel(cls) : null;

  const [plan, books] = await Promise.all([
    studentId ? loadStudyPlan(admin, studentId, year, month) : Promise.resolve(null),
    academyId ? listTextbooks(admin, academyId) : Promise.resolve([]),
  ]);
  const student: PlanStudent | null = row
    ? {
        id: String(row.id),
        name: String(row.name ?? ""),
        school: (row.school as string | null) ?? null,
        schoolGrade: (row.school_grade as string | null) ?? null,
        phone: (row.phone as string | null) ?? null,
        parentPhone: (row.parent_phone as string | null) ?? null,
        enrolledOn: (row.enrolled_on as string | null) ?? null,
        className: cls?.name ?? null,
        classTime,
      }
    : null;

  const link = (o: {
    teacherId?: string;
    classId?: string;
    studentId?: string;
    y?: number;
    m?: number;
  }) => {
    const q = new URLSearchParams({
      teacher: o.teacherId ?? teacherId,
      class: o.classId ?? classId,
      student: o.studentId ?? studentId,
      year: String(o.y ?? year),
      month: String(o.m ?? month),
    });
    return `/admin/study-plans?${q.toString()}`;
  };
  const prev = month === 1 ? { y: year - 1, m: 12 } : { y: year, m: month - 1 };
  const next = month === 12 ? { y: year + 1, m: 1 } : { y: year, m: month + 1 };

  return (
    <div>
      <PageHeader
        title="학습일정표"
        description="선생님 → 반 → 학생 차례로 고르면 그 달 계획이 나와요. 학생은 자기 아이디로 로그인해 자기 것만 봐요."
      />

      <StudyPlanPicker
        teachers={teachers}
        classes={classes}
        selectedTeacherId={teacherId}
        selectedClassId={classId}
        selectedStudentId={studentId}
        href={(o) => link({ teacherId: o.teacherId, classId: o.classId, studentId: o.studentId })}
      />

      <div className="mb-4 flex items-center justify-end gap-1">
        <Link
          href={link({ y: prev.y, m: prev.m })}
          className="h-9 rounded-lg border border-slate-200 px-3 text-sm leading-9 text-slate-600 hover:bg-slate-50"
        >
          ‹ 지난달
        </Link>
        <span className="px-2 text-sm font-bold text-slate-900">
          {year}년 {month}월
        </span>
        <Link
          href={link({ y: next.y, m: next.m })}
          className="h-9 rounded-lg border border-slate-200 px-3 text-sm leading-9 text-slate-600 hover:bg-slate-50"
        >
          다음달 ›
        </Link>
      </div>

      {student ? (
        <StudyPlanEditor student={student} year={year} month={month} plan={plan} books={books} />
      ) : (
        <p className="rounded-2xl border border-slate-200 bg-white px-5 py-8 text-center text-sm text-slate-500">
          {classes.length === 0 ? "등록된 학생이 없어요." : "이 반에 학생이 없어요. 다른 반을 골라 주세요."}
        </p>
      )}
    </div>
  );
}
