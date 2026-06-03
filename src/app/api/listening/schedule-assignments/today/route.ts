import { NextResponse } from "next/server";
import { assertStudentProfile } from "@/lib/listening/schedule/schedule-access";
import { getStudentScheduleTodaySummary } from "@/lib/listening/schedule/today-summary";

function jsonError(message: string, status = 200) {
  return NextResponse.json({ ok: false, message }, { status });
}

export async function GET() {
  try {
    const access = await assertStudentProfile();
    if (!access.ok) return jsonError(access.message, access.status);

    const summary = await getStudentScheduleTodaySummary(
      access.admin,
      access.profile.id
    );

    return NextResponse.json({
      ok: true,
      todayIso: summary.todayIso,
      isStudyDayToday: summary.isStudyDayToday,
      todayTask: summary.todayTask,
      missedTasks: summary.missedTasks,
      nextStudyDate: summary.nextStudyDate,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "조회 오류";
    return jsonError(message);
  }
}
