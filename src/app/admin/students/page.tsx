import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { EnrollmentForm } from "@/components/admin/EnrollmentForm";
import { EnrollmentList } from "@/components/admin/EnrollmentList";
import { StudentManagement } from "@/components/admin/StudentManagement";
import { StudentsPagePagination } from "@/components/admin/StudentsPagePagination";
import { loadStudentsPageData } from "@/lib/admin/list-students-page";
import {
  buildCoursePickerTree,
  buildStudentPickerTree,
} from "@/lib/ui/build-enrollment-trees";
import { parseClassStudentLinks } from "@/lib/ui/parse-class-links";
import type { Course, Profile } from "@/types/database";

interface PageProps {
  searchParams: Promise<{ page?: string; q?: string }>;
}

export default async function AdminStudentsPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const search = sp.q?.trim() ?? "";

  const supabase = await createClient();
  const data = await loadStudentsPageData(supabase, { page, search });

  const studentList = data.students;
  const pickerList = data.pickerStudents;
  const activeStudents = pickerList.filter((s) => s.is_active !== false);
  const courseList = data.courses;
  const studentClassLinks = parseClassStudentLinks(
    data.classStudents as Parameters<typeof parseClassStudentLinks>[0]
  );
  const studentTree = buildStudentPickerTree(pickerList, studentClassLinks);
  const courseTree = buildCoursePickerTree(courseList);

  return (
    <div className="space-y-10">
      <div>
        <h2 className="text-xl font-semibold">학생 · 수강 관리</h2>
        <p className="mt-1 text-sm text-slate-600">
          학생 계정을 등록·수정하고, 강좌 배정 및 수강 현황을 관리합니다.
        </p>
      </div>

      <form method="get" className="flex flex-wrap items-end gap-2">
        <label className="text-sm font-medium text-slate-700">
          이름 검색
          <input
            name="q"
            defaultValue={search}
            placeholder="학생 이름"
            className="mt-1 block rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
        </label>
        <button
          type="submit"
          className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white"
        >
          검색
        </button>
        {search && (
          <Link href="/admin/students" className="text-sm text-indigo-600 hover:underline">
            검색 초기화
          </Link>
        )}
      </form>

      <StudentsPagePagination
        page={data.page}
        total={data.totalStudents}
        pageSize={data.pageSize}
        search={search}
      />

      <section id="students" className="scroll-mt-8">
        <StudentManagement students={studentList} studentTree={studentTree} />
      </section>

      <section id="assign" className="scroll-mt-8">
        <h3 className="mb-3 font-semibold">수강 배정</h3>
        <EnrollmentForm
          studentTree={buildStudentPickerTree(activeStudents, studentClassLinks)}
          courseTree={courseTree}
        />
      </section>

      <section id="enrollment-status" className="scroll-mt-8">
        <h3 className="mb-3 font-semibold">배정 내역 (최근 500건)</h3>
        <EnrollmentList
          variant="admin"
          rows={data.enrollments.map((e) => ({
            id: e.id as string,
            studentName:
              (e.student as { name: string } | null)?.name ?? "—",
            courseTitle:
              (e.course as { title: string } | null)?.title ?? "—",
            createdAt: e.created_at as string,
          }))}
        />
      </section>
    </div>
  );
}
