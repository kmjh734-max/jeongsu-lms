import type { SupabaseClient } from "@supabase/supabase-js";

/** 관리자 API: 이 강좌가 내 학원 것인지 (다른 학원 강좌 id로 고치지 못하게). 슈퍼관리자는 통과 */
export async function adminOwnsCourse(
  db: SupabaseClient,
  profile: { role: string; academy_id: string | null },
  courseId: string
): Promise<boolean> {
  if (profile.role === "super_admin") return true;
  const { data } = await db.from("courses").select("academy_id").eq("id", courseId).maybeSingle();
  return Boolean(data && profile.academy_id && data.academy_id === profile.academy_id);
}

/** 선생님 API: 내가 담당한 강좌인지 */
export async function teacherOwnsCourse(db: SupabaseClient, teacherId: string, courseId: string): Promise<boolean> {
  const { data } = await db.from("courses").select("id").eq("id", courseId).eq("teacher_id", teacherId).maybeSingle();
  return Boolean(data);
}

/** 영상 순서 저장: 받은 순서대로 1, 2, 3 … (이 강좌 영상만) */
export async function reorderCourseLessons(
  db: SupabaseClient,
  courseId: string,
  lessonIds: string[]
): Promise<{ ok: true } | { ok: false; message: string }> {
  const { data: rows, error } = await db.from("lessons").select("id").eq("course_id", courseId);
  if (error) return { ok: false, message: error.message };
  const valid = new Set((rows ?? []).map((r) => r.id as string));
  const ids = lessonIds.filter((id) => valid.has(id));
  if (ids.length !== valid.size) return { ok: false, message: "영상 목록이 바뀌었어요. 새로고침 후 다시 해 주세요." };
  const results = await Promise.all(
    ids.map((id, i) => db.from("lessons").update({ order_index: i + 1 }).eq("id", id).eq("course_id", courseId))
  );
  const failed = results.find((r) => r.error);
  return failed?.error ? { ok: false, message: failed.error.message } : { ok: true };
}
