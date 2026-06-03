import type { SupabaseClient } from "@supabase/supabase-js";
import type { Course, Profile } from "@/types/database";

export const STUDENTS_PAGE_SIZE = 50;

export interface StudentsPageData {
  students: Profile[];
  pickerStudents: Profile[];
  courses: Course[];
  enrollments: Array<Record<string, unknown>>;
  classStudents: Array<Record<string, unknown>>;
  page: number;
  totalStudents: number;
  pageSize: number;
  search: string;
}

export async function loadStudentsPageData(
  supabase: SupabaseClient,
  options: { page?: number; search?: string }
): Promise<StudentsPageData> {
  const page = Math.max(1, options.page ?? 1);
  const search = options.search?.trim() ?? "";
  const from = (page - 1) * STUDENTS_PAGE_SIZE;
  const to = from + STUDENTS_PAGE_SIZE - 1;

  let countQuery = supabase
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .eq("role", "student");

  let listQuery = supabase
    .from("profiles")
    .select("*")
    .eq("role", "student")
    .order("name")
    .range(from, to);

  if (search) {
    countQuery = countQuery.ilike("name", `%${search}%`);
    listQuery = listQuery.ilike("name", `%${search}%`);
  }

  const [
    { count },
    { data: students },
    { data: pickerStudents },
    { data: courses },
    { data: enrollments },
    { data: classStudents },
  ] = await Promise.all([
    countQuery,
    listQuery,
    supabase
      .from("profiles")
      .select("id, name, email, is_active, username, role, created_by, created_at")
      .eq("role", "student")
      .order("name"),
    supabase.from("courses").select("*").order("title").limit(200),
    supabase
      .from("enrollments")
      .select("*, student:profiles!enrollments_student_id_fkey(name), course:courses(title)")
      .order("created_at", { ascending: false })
      .limit(500),
    supabase
      .from("class_students")
      .select("student_id, class_id, class:classes(id, name)")
      .limit(2000),
  ]);

  return {
    students: (students ?? []) as Profile[],
    pickerStudents: (pickerStudents ?? []) as Profile[],
    courses: (courses ?? []) as Course[],
    enrollments: enrollments ?? [],
    classStudents: classStudents ?? [],
    page,
    totalStudents: count ?? 0,
    pageSize: STUDENTS_PAGE_SIZE,
    search,
  };
}
