import type { SupabaseClient } from "@supabase/supabase-js";
import { loadCourseCards, type CourseCard } from "@/lib/courses/course-cards";
import type { Course } from "@/types/database";

/**
 * 동영상강좌 목록 화면에 필요한 것 한 묶음.
 *
 * 선생님 요청(2026-09-28): 카테고리를 폴더로, 지난 강좌는 보관함으로, 삭제는 휴지통으로.
 * 그래서 목록을 보는 자리(살아 있는 것·보관함·휴지통)를 함께 읽어 온다.
 */

export type CourseScope = "alive" | "archived" | "trash";

export interface CourseFolder {
  id: string;
  name: string;
  orderIndex: number;
}

export interface CoursesPageData {
  cards: CourseCard[];
  folders: CourseFolder[];
  counts: { alive: number; archived: number; trash: number };
}

type CourseRow = Course & { teacher?: { name: string | null } | null };

export async function loadCoursesPage(
  supabase: SupabaseClient,
  opts: { scope: CourseScope; teacherId?: string }
): Promise<CoursesPageData> {
  let q = supabase
    .from("courses")
    .select("*, teacher:profiles!courses_teacher_id_fkey(name)")
    .order("order_index")
    .order("created_at", { ascending: false });

  if (opts.teacherId) q = q.eq("teacher_id", opts.teacherId);

  if (opts.scope === "trash") {
    q = q.not("deleted_at", "is", null);
  } else if (opts.scope === "archived") {
    q = q.is("deleted_at", null).not("archived_at", "is", null);
  } else {
    q = q.is("deleted_at", null).is("archived_at", null);
  }

  // 왼쪽에 보여 줄 세 자리의 개수는 한 번에 센다
  let countQ = supabase.from("courses").select("deleted_at, archived_at");
  if (opts.teacherId) countQ = countQ.eq("teacher_id", opts.teacherId);

  const [{ data: courses }, { data: folderRows }, { data: all }] = await Promise.all([
    q,
    supabase.from("course_folders").select("id, name, order_index").order("order_index"),
    countQ,
  ]);

  const counts = { alive: 0, archived: 0, trash: 0 };
  for (const r of (all ?? []) as { deleted_at: string | null; archived_at: string | null }[]) {
    if (r.deleted_at) counts.trash += 1;
    else if (r.archived_at) counts.archived += 1;
    else counts.alive += 1;
  }

  return {
    cards: await loadCourseCards(supabase, (courses ?? []) as CourseRow[]),
    folders: (folderRows ?? []).map((f) => ({
      id: String(f.id),
      name: String(f.name),
      orderIndex: Number(f.order_index ?? 0),
    })),
    counts,
  };
}
