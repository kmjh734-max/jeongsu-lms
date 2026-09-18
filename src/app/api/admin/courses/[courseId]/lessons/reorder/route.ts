import { NextResponse } from "next/server";
import { adminJsonError, getAdminClientSafe } from "@/lib/admin/api-json";
import { requireAdminApi } from "@/lib/auth/require-admin-api";
import { adminOwnsCourse, reorderCourseLessons } from "@/lib/courses/course-access";

export const runtime = "nodejs";

/** 영상 순서 바꾸기 { ids: 새 순서의 영상 id } */
export async function POST(request: Request, context: { params: Promise<{ courseId: string }> }) {
  const auth = await requireAdminApi();
  if ("error" in auth && auth.error) return auth.error;
  const clientResult = getAdminClientSafe();
  if (!clientResult.ok) return clientResult.response;
  const { courseId } = await context.params;
  if (!(await adminOwnsCourse(clientResult.admin, auth.profile!, courseId))) {
    return adminJsonError("강좌를 찾을 수 없습니다.", 404);
  }
  const body = (await request.json().catch(() => ({}))) as { ids?: unknown };
  const ids = Array.isArray(body.ids) ? body.ids.filter((x): x is string => typeof x === "string") : [];
  if (ids.length === 0) return adminJsonError("순서를 바꿀 영상이 없습니다.", 400);
  const result = await reorderCourseLessons(clientResult.admin, courseId, ids);
  if (!result.ok) return adminJsonError(result.message, 400);
  return NextResponse.json({ ok: true });
}
