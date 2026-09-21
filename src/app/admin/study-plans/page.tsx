import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/ui/PageHeader";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { createAdminClient } from "@/lib/supabase/admin";
import { loadStudyPlan } from "@/lib/study-plan";
import { isStudyPlanEnabled } from "@/lib/study-plan/access";
import { StudyPlanEditor, type PlanStudent } from "@/components/study-plan/StudyPlanEditor";
import { listTextbooks } from "@/lib/textbooks";

interface PageProps {
  searchParams: Promise<{ student?: string; year?: string; month?: string }>;
}

const WEEKDAY = ["월", "화", "수", "목", "금", "토", "일"];

/** 학습일정표 — 학생 한 명의 한 달 계획을 채운다 */
export default async function StudyPlansPage({ searchParams }: PageProps) {
  const [profile, sp] = await Promise.all([getCurrentProfile(), searchParams]);
  if (!(await isStudyPlanEnabled(profile?.academy_id))) notFound();
  const admin = createAdminClient();
  const academyId = profile?.academy_id ?? null;
  const now = new Date();
  const year = Number(sp.year) || now.getFullYear();
  const month = Number(sp.month) || now.getMonth() + 1;

  const { data: students } = academyId
    ? await admin
        .from("profiles")
        .select("id, name, school, school_grade, phone, parent_phone, enrolled_on")
        .eq("academy_id", academyId)
        .eq("role", "student")
        .not("approved_at", "is", null)
        .order("name")
    : { data: [] as Record<string, unknown>[] };

  const list = students ?? [];
  const studentId = sp.student || (list[0]?.id as string | undefined) || "";
  const row = list.find((s) => s.id === studentId);

  // 반·수업 시간(일정표 머리에 그대로 들어간다)
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
  const classTime = cls
    ? [
        (cls.weekdays ?? []).map((d) => WEEKDAY[d] ?? "").join(""),
        [String(cls.start_time ?? "").slice(0, 5), String(cls.end_time ?? "").slice(0, 5)].filter(Boolean).join("~"),
      ]
        .filter(Boolean)
        .join(" ")
    : null;

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

  const monthHref = (y: number, m: number) => `/admin/study-plans?student=${studentId}&year=${y}&month=${m}`;
  const prev = month === 1 ? { y: year - 1, m: 12 } : { y: year, m: month - 1 };
  const next = month === 12 ? { y: year + 1, m: 1 } : { y: year, m: month + 1 };

  return (
    <div>
      <PageHeader
        title="학습일정표"
        description="학생마다 한 달 계획을 적어요. 학생은 자기 아이디로 로그인해 자기 것만 봐요."
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <form className="flex items-center gap-2">
          <input type="hidden" name="year" value={year} />
          <input type="hidden" name="month" value={month} />
          <select name="student" defaultValue={studentId} className="ui-input h-9 w-56 text-sm">
            {list.map((s) => (
              <option key={String(s.id)} value={String(s.id)}>
                {String(s.name)} {s.school ? `· ${s.school}` : ""}
              </option>
            ))}
          </select>
          <button type="submit" className="h-9 rounded-lg border border-slate-200 px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">
            학생 바꾸기
          </button>
        </form>
        <div className="ml-auto flex items-center gap-1">
          <Link href={monthHref(prev.y, prev.m)} className="h-9 rounded-lg border border-slate-200 px-3 text-sm leading-9 text-slate-600 hover:bg-slate-50">
            ‹ 지난달
          </Link>
          <span className="px-2 text-sm font-bold text-slate-900">
            {year}년 {month}월
          </span>
          <Link href={monthHref(next.y, next.m)} className="h-9 rounded-lg border border-slate-200 px-3 text-sm leading-9 text-slate-600 hover:bg-slate-50">
            다음달 ›
          </Link>
        </div>
      </div>

      {student ? (
        <StudyPlanEditor student={student} year={year} month={month} plan={plan} books={books} />
      ) : (
        <p className="rounded-2xl border border-slate-200 bg-white px-5 py-8 text-center text-sm text-slate-500">
          등록된 학생이 없어요.
        </p>
      )}
    </div>
  );
}
