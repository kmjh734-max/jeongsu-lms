import { NextResponse } from "next/server";
import { adminJsonError, getAdminClientSafe } from "@/lib/admin/api-json";
import { createManagedAccount } from "@/lib/admin/manage-user";
import { pickStudentDetails, saveStudentDetails } from "@/lib/accounts/student-details";
import { requireAdminApi } from "@/lib/auth/require-admin-api";
import { addStudentToClass } from "@/lib/classes/class-assignments";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const auth = await requireAdminApi();
    if ("error" in auth && auth.error) {
      return auth.error;
    }

    const clientResult = getAdminClientSafe();
    if (!clientResult.ok) {
      return clientResult.response;
    }

    let body: Record<string, unknown> & { name?: string; username?: string; password?: string };
    try {
      body = await request.json();
    } catch {
      return adminJsonError("요청 형식이 올바르지 않습니다.", 400);
    }

    const result = await createManagedAccount(clientResult.admin, {
      name: body.name ?? "",
      username: body.username ?? "",
      password: body.password ?? "",
      role: "student",
      createdBy: auth.profile.id,
      academyId: auth.profile.academy_id,
    });

    if (!result.ok) {
      return adminJsonError(result.message, result.status);
    }

    // 생년월일·연락처는 계정을 만든 뒤 함께 저장한다(학습일정표·리포트 발송에 쓴다)
    const newId = (result.profile as { id?: string } | null)?.id;
    if (newId) await saveStudentDetails(clientResult.admin, newId, pickStudentDetails(body));

    // 등록하면서 고른 반에 바로 넣는다 — 반의 강좌·단어·듣기가 함께 따라간다
    const classIds = Array.isArray(body.classIds)
      ? [...new Set(body.classIds.map((v) => String(v)).filter(Boolean))]
      : [];
    const failed: string[] = [];
    if (newId && classIds.length > 0) {
      for (const classId of classIds) {
        const r = await addStudentToClass(clientResult.admin, {
          classId,
          studentId: newId,
          assignedBy: auth.profile.id,
          academyId: auth.profile.academy_id ?? undefined,
        });
        if (!r.ok) failed.push(r.message);
      }
    }

    const added = classIds.length - failed.length;
    return NextResponse.json({
      ok: true,
      message:
        failed.length > 0
          ? `${result.message} 반 넣기에서 막힌 것이 있어요: ${failed[0]}`
          : added > 0
            ? `${result.message} 반 ${added}개에 넣었어요.`
            : result.message,
      student: result.profile,
    });
  } catch (error) {
    console.error("[POST /api/admin/students] unexpected error:", error);
    const message =
      error instanceof Error ? error.message : "서버 오류가 발생했습니다.";
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}
