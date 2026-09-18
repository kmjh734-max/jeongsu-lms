import { NextResponse } from "next/server";
import { adminJsonError, getAdminClientSafe } from "@/lib/admin/api-json";
import { requireTeacherApi } from "@/lib/auth/require-teacher-api";
import { reorderCourseLessons, teacherOwnsCourse } from "@/lib/courses/course-access";

export const runtime = "nodejs";

/** 영상 순서 바꾸기 { ids: 새 순서의 영상 id } — 담당 강좌만 */
export async function POST(request: Request, context: { params: Promise<{ courseId: string }> }) {
  const auth = await requireTeacherApi();
  if ("error" in auth && auth.error) return auth.error;
  const clientResult = getAdminClientSafe();
  if (!clientResult.ok) return clientResult.response;
  const { courseId } = await context.params;
  if (!(await teacherOwnsCourse(clientResult.admin, auth.profile!.id, courseId))) {
    return adminJsonError("담당 강좌가 아니거나 강좌를 찾을 수 없습니다.", 403);
  }
  const body = (await request.json().catch(() => ({}))) as { ids?: unknown };
  const ids = Array.isArray(body.ids) ? body.ids.filter((x): x is string => typeof x === "string") : [];
  if (ids.length === 0) return adminJsonError("순서를 바꿀 영상이 없습니다.", 400);
  const result = await reorderCourseLessons(clientResult.admin, courseId, ids);
  if (!result.ok) return adminJsonError(result.message, 400);
  return NextResponse.json({ ok: true });
}
