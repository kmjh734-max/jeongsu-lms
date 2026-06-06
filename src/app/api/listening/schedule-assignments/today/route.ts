import { after, NextResponse } from "next/server";
import { assertStudentProfile } from "@/lib/listening/schedule/schedule-access";
import { getStudentListeningCalendar } from "@/lib/listening/schedule/calendar";
import { getTodayIsoKorea } from "@/lib/date/korea-today";
import {
  ensureStudentScheduleDailyTasks,
  getStudentScheduleTodaySummaryReadOnly,
} from "@/lib/listening/schedule/today-summary";

function jsonError(message: string, status = 200) {
  return NextResponse.json({ ok: false, message }, { status });
}

export async function GET(request: Request) {
  try {
    const access = await assertStudentProfile();
    if (!access.ok) return jsonError(access.message, access.status);

    const todayIso = getTodayIsoKorea();
    const url = new URL(request.url);
    const yearParam = url.searchParams.get("year");
    const monthParam = url.searchParams.get("month");
    const year = yearParam ? Number(yearParam) : Number(todayIso.slice(0, 4));
    const month = monthParam ? Number(monthParam) : Number(todayIso.slice(5, 7));

    const [summary, calendar] = await Promise.all([
      getStudentScheduleTodaySummaryReadOnly(
        access.admin,
        access.profile.id,
        todayIso
      ),
      getStudentListeningCalendar(
        access.admin,
        access.profile.id,
        year,
        month,
        todayIso
      ),
    ]);

    after(() => {
      void ensureStudentScheduleDailyTasks(
        access.admin,
        access.profile.id,
        todayIso,
        { futureDays: 45 }
      );
    });

    return NextResponse.json({
      ok: true,
      todayIso: summary.todayIso,
      isStudyDayToday: summary.isStudyDayToday,
      todayTask: summary.todayTask,
      missedTasks: summary.missedTasks,
      nextStudyDate: summary.nextStudyDate,
      calendar,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "조회 오류";
    return jsonError(message);
  }
}
