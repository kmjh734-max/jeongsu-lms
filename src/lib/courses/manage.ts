import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentProfile } from "@/lib/auth/get-profile";

/**
 * 동영상강좌 관리 — 휴지통·보관·폴더.
 *
 * 선생님 요청(2026-09-28): 강좌를 지우면 학생 진도 기록까지 영영 사라지고 되돌릴 수 없었다.
 * 삭제를 휴지통으로 옮기기로 바꾸고, 끝난 강좌는 보관해 목록에서 접어 둔다.
 * 관리자는 학원 강좌 전부, 강사는 자기 강좌만 손댄다.
 */

import { TRASH_DAYS } from "@/lib/courses/trash-days";

export type CourseActionResult = { ok: boolean; message: string };
export { TRASH_DAYS };

const ok = (message: string): CourseActionResult => ({ ok: true, message });
const fail = (message: string): CourseActionResult => ({ ok: false, message });

type Staff = { id: string; role: string; academyId: string };

async function requireStaff(): Promise<
  { staff: Staff; error: null } | { staff: null; error: CourseActionResult }
> {
  const profile = await getCurrentProfile();
  if (!profile || (profile.role !== "admin" && profile.role !== "teacher")) {
    return { staff: null, error: fail("권한이 없어요.") };
  }
  if (!profile.academy_id) {
    return { staff: null, error: fail("학원 정보를 찾지 못했어요.") };
  }
  return {
    staff: { id: profile.id, role: profile.role, academyId: profile.academy_id },
    error: null,
  };
}

/**
 * 손댈 수 있는 강좌만 남긴다.
 * 강사는 자기가 담당인 강좌만. 남의 강좌가 섞여 있으면 그것만 빼고 나머지를 처리한다.
 */
async function mineOnly(staff: Staff, courseIds: string[]): Promise<string[]> {
  if (courseIds.length === 0) return [];
  const admin = createAdminClient();
  let q = admin
    .from("courses")
    .select("id")
    .in("id", courseIds)
    .eq("academy_id", staff.academyId);
  if (staff.role === "teacher") q = q.eq("teacher_id", staff.id);
  const { data } = await q;
  return (data ?? []).map((r) => String(r.id));
}

function skipped(asked: number, allowed: number): string {
  const n = asked - allowed;
  return n > 0 ? ` (담당이 아닌 ${n}개는 그대로 뒀어요)` : "";
}

/** 휴지통으로 옮기기 — 진도 기록은 지우지 않는다 */
export async function trashCourses(courseIds: string[]): Promise<CourseActionResult> {
  const { staff, error } = await requireStaff();
  if (!staff) return error;
  const ids = await mineOnly(staff, courseIds);
  if (ids.length === 0) return fail("옮길 수 있는 강좌가 없어요.");

  const { error: dbError } = await createAdminClient()
    .from("courses")
    .update({ deleted_at: new Date().toISOString() })
    .in("id", ids);
  if (dbError) return fail(`휴지통으로 옮기지 못했어요: ${dbError.message}`);

  return ok(
    `${ids.length}개를 휴지통으로 옮겼어요. ${TRASH_DAYS}일 안에 되돌릴 수 있어요.${skipped(courseIds.length, ids.length)}`
  );
}

/** 휴지통에서 꺼내기 */
export async function restoreCourses(courseIds: string[]): Promise<CourseActionResult> {
  const { staff, error } = await requireStaff();
  if (!staff) return error;
  const ids = await mineOnly(staff, courseIds);
  if (ids.length === 0) return fail("되돌릴 수 있는 강좌가 없어요.");

  const { error: dbError } = await createAdminClient()
    .from("courses")
    .update({ deleted_at: null })
    .in("id", ids);
  if (dbError) return fail(`되돌리지 못했어요: ${dbError.message}`);

  return ok(`${ids.length}개를 되돌렸어요.${skipped(courseIds.length, ids.length)}`);
}

/**
 * 완전히 지우기 — 관리자만. 영상·수강 배정·진도 기록이 함께 사라진다.
 * 휴지통에 있는 강좌만 지울 수 있다(목록에서 바로 지우는 길을 막는다).
 */
export async function purgeCourses(courseIds: string[]): Promise<CourseActionResult> {
  const { staff, error } = await requireStaff();
  if (!staff) return error;
  if (staff.role !== "admin") {
    return fail("완전히 지우는 것은 관리자만 할 수 있어요.");
  }
  if (courseIds.length === 0) return fail("지울 강좌가 없어요.");

  const admin = createAdminClient();
  const { data } = await admin
    .from("courses")
    .select("id")
    .in("id", courseIds)
    .eq("academy_id", staff.academyId)
    .not("deleted_at", "is", null);
  const ids = (data ?? []).map((r) => String(r.id));
  if (ids.length === 0) return fail("휴지통에 있는 강좌만 지울 수 있어요.");

  const { error: dbError } = await admin.from("courses").delete().in("id", ids);
  if (dbError) return fail(`지우지 못했어요: ${dbError.message}`);

  return ok(`${ids.length}개를 완전히 지웠어요.`);
}

/** 30일이 지난 휴지통 강좌를 비운다. 휴지통 화면을 열 때 함께 돈다. */
export async function purgeExpiredTrash(academyId: string): Promise<number> {
  const cutoff = new Date(Date.now() - TRASH_DAYS * 24 * 60 * 60 * 1000).toISOString();
  const admin = createAdminClient();
  const { data } = await admin
    .from("courses")
    .select("id")
    .eq("academy_id", academyId)
    .not("deleted_at", "is", null)
    .lt("deleted_at", cutoff);
  const ids = (data ?? []).map((r) => String(r.id));
  if (ids.length === 0) return 0;
  await admin.from("courses").delete().in("id", ids);
  return ids.length;
}

/** 보관하거나 되돌리기 — 듣던 학생은 계속 본다. 새로 배정만 막는다. */
export async function setCoursesArchived(
  courseIds: string[],
  archived: boolean
): Promise<CourseActionResult> {
  const { staff, error } = await requireStaff();
  if (!staff) return error;
  const ids = await mineOnly(staff, courseIds);
  if (ids.length === 0) return fail("바꿀 수 있는 강좌가 없어요.");

  const { error: dbError } = await createAdminClient()
    .from("courses")
    .update({ archived_at: archived ? new Date().toISOString() : null })
    .in("id", ids);
  if (dbError) return fail(`바꾸지 못했어요: ${dbError.message}`);

  return ok(
    archived
      ? `${ids.length}개를 보관함으로 옮겼어요. 듣던 학생은 계속 볼 수 있어요.${skipped(courseIds.length, ids.length)}`
      : `${ids.length}개를 보관함에서 꺼냈어요.${skipped(courseIds.length, ids.length)}`
  );
}

/** 학생에게 공개하거나 감추기 */
export async function setCoursesPublished(
  courseIds: string[],
  published: boolean
): Promise<CourseActionResult> {
  const { staff, error } = await requireStaff();
  if (!staff) return error;
  const ids = await mineOnly(staff, courseIds);
  if (ids.length === 0) return fail("바꿀 수 있는 강좌가 없어요.");

  const { error: dbError } = await createAdminClient()
    .from("courses")
    .update({ is_published: published })
    .in("id", ids);
  if (dbError) return fail(`바꾸지 못했어요: ${dbError.message}`);

  return ok(
    `${ids.length}개를 ${published ? "공개" : "비공개"}로 바꿨어요.${skipped(courseIds.length, ids.length)}`
  );
}

/** 폴더 옮기기. folderId가 null이면 미분류로 */
export async function moveCoursesToFolder(
  courseIds: string[],
  folderId: string | null
): Promise<CourseActionResult> {
  const { staff, error } = await requireStaff();
  if (!staff) return error;
  const ids = await mineOnly(staff, courseIds);
  if (ids.length === 0) return fail("옮길 수 있는 강좌가 없어요.");

  const admin = createAdminClient();
  if (folderId) {
    const { data: folder } = await admin
      .from("course_folders")
      .select("id")
      .eq("id", folderId)
      .eq("academy_id", staff.academyId)
      .maybeSingle();
    if (!folder) return fail("그 폴더를 찾지 못했어요.");
  }

  const { error: dbError } = await admin
    .from("courses")
    .update({ folder_id: folderId })
    .in("id", ids);
  if (dbError) return fail(`옮기지 못했어요: ${dbError.message}`);

  return ok(`${ids.length}개를 옮겼어요.${skipped(courseIds.length, ids.length)}`);
}

/** 강좌 차례 저장 — 학생 화면에도 이 차례로 보인다 */
export async function reorderCourses(orderedIds: string[]): Promise<CourseActionResult> {
  const { staff, error } = await requireStaff();
  if (!staff) return error;
  const ids = await mineOnly(staff, orderedIds);
  const allowed = new Set(ids);
  const admin = createAdminClient();

  let i = 0;
  for (const id of orderedIds) {
    i += 1;
    if (!allowed.has(id)) continue;
    const { error: dbError } = await admin
      .from("courses")
      .update({ order_index: i })
      .eq("id", id);
    if (dbError) return fail(`차례를 저장하지 못했어요: ${dbError.message}`);
  }
  return ok("차례를 바꿨어요.");
}

// ---------------------------------------------------------------------------
// 폴더
// ---------------------------------------------------------------------------

export async function createCourseFolder(name: string): Promise<CourseActionResult> {
  const { staff, error } = await requireStaff();
  if (!staff) return error;
  const trimmed = name.trim().replace(/\s+/g, " ").slice(0, 20);
  if (!trimmed) return fail("폴더 이름을 적어 주세요.");

  const admin = createAdminClient();
  const { data: last } = await admin
    .from("course_folders")
    .select("order_index")
    .eq("academy_id", staff.academyId)
    .order("order_index", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { error: dbError } = await admin.from("course_folders").insert({
    academy_id: staff.academyId,
    name: trimmed,
    order_index: (Number(last?.order_index) || 0) + 1,
  });
  if (dbError) {
    return fail(
      dbError.code === "23505"
        ? `「${trimmed}」 폴더가 이미 있어요.`
        : `폴더를 만들지 못했어요: ${dbError.message}`
    );
  }
  return ok(`「${trimmed}」 폴더를 만들었어요.`);
}

export async function renameCourseFolder(
  folderId: string,
  name: string
): Promise<CourseActionResult> {
  const { staff, error } = await requireStaff();
  if (!staff) return error;
  const trimmed = name.trim().replace(/\s+/g, " ").slice(0, 20);
  if (!trimmed) return fail("폴더 이름을 적어 주세요.");

  const { error: dbError } = await createAdminClient()
    .from("course_folders")
    .update({ name: trimmed })
    .eq("id", folderId)
    .eq("academy_id", staff.academyId);
  if (dbError) {
    return fail(
      dbError.code === "23505"
        ? `「${trimmed}」 폴더가 이미 있어요.`
        : `이름을 바꾸지 못했어요: ${dbError.message}`
    );
  }
  return ok("폴더 이름을 바꿨어요.");
}

/** 폴더를 지우면 안에 있던 강좌는 미분류로 간다(강좌는 지우지 않는다) */
export async function deleteCourseFolder(folderId: string): Promise<CourseActionResult> {
  const { staff, error } = await requireStaff();
  if (!staff) return error;

  const { error: dbError } = await createAdminClient()
    .from("course_folders")
    .delete()
    .eq("id", folderId)
    .eq("academy_id", staff.academyId);
  if (dbError) return fail(`폴더를 지우지 못했어요: ${dbError.message}`);
  return ok("폴더를 지웠어요. 안에 있던 강좌는 미분류로 옮겼어요.");
}

export async function reorderCourseFolders(orderedIds: string[]): Promise<CourseActionResult> {
  const { staff, error } = await requireStaff();
  if (!staff) return error;
  const admin = createAdminClient();
  let i = 0;
  for (const id of orderedIds) {
    i += 1;
    const { error: dbError } = await admin
      .from("course_folders")
      .update({ order_index: i })
      .eq("id", id)
      .eq("academy_id", staff.academyId);
    if (dbError) return fail(`폴더 차례를 저장하지 못했어요: ${dbError.message}`);
  }
  return ok("폴더 차례를 바꿨어요.");
}
