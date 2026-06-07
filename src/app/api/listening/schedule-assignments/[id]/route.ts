import { NextResponse } from "next/server";
import { teacherCanManageAssignment } from "@/lib/listening/schedule/list-assignments";
import { assertScheduleManager } from "@/lib/listening/schedule/schedule-access";

function jsonError(message: string, status = 200) {
  return NextResponse.json({ ok: false, message }, { status });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const access = await assertScheduleManager();
    if (!access.ok) return jsonError(access.message, access.status);

    const { id } = await params;
    const allowed = await teacherCanManageAssignment(
      access.admin,
      access.profile.role,
      access.profile.id,
      id
    );
    if (!allowed) return jsonError("이 과제를 수정할 권한이 없습니다.", 403);

    const body = (await request.json()) as { isActive?: boolean };

    const patch: { is_active?: boolean; updated_at: string } = {
      updated_at: new Date().toISOString(),
    };
    if (typeof body.isActive === "boolean") {
      patch.is_active = body.isActive;
    }

    const { error } = await access.admin
      .from("listening_schedule_assignments")
      .update(patch)
      .eq("id", id);

    if (error) return jsonError(error.message);

    return NextResponse.json({ ok: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : "수정 오류";
    return jsonError(message);
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const access = await assertScheduleManager();
    if (!access.ok) return jsonError(access.message, access.status);

    const { id } = await params;
    const allowed = await teacherCanManageAssignment(
      access.admin,
      access.profile.role,
      access.profile.id,
      id
    );
    if (!allowed) return jsonError("이 과제를 삭제할 권한이 없습니다.", 403);

    const { error } = await access.admin
      .from("listening_schedule_assignments")
      .delete()
      .eq("id", id);

    if (error) return jsonError(error.message);

    return NextResponse.json({ ok: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : "삭제 오류";
    return jsonError(message);
  }
}
