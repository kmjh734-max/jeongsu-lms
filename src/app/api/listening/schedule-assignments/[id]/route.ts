import { NextResponse } from "next/server";
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
