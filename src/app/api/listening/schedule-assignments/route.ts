import { NextResponse } from "next/server";
import { listScheduleAssignments } from "@/lib/listening/schedule/list-assignments";
import { assertScheduleManager } from "@/lib/listening/schedule/schedule-access";

function jsonError(message: string, status = 200) {
  return NextResponse.json({ ok: false, message }, { status });
}

export async function GET() {
  try {
    const access = await assertScheduleManager();
    if (!access.ok) return jsonError(access.message, access.status);

    const assignments = await listScheduleAssignments(
      access.admin,
      access.profile.role,
      access.profile.id
    );

    return NextResponse.json({ ok: true, assignments });
  } catch (e) {
    const message = e instanceof Error ? e.message : "조회 오류";
    return jsonError(message);
  }
}
