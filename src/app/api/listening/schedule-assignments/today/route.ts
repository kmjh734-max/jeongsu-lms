import { after, NextResponse } from "next/server";
import { assertStudentProfile } from "@/lib/listening/schedule/schedule-access";
import { getStudentListeningCalendar } from "@/lib/listening/schedule/calendar";
import { getTodayIsoKorea } from "@/lib/date/korea-today";
import {
  ensureStudentScheduleDailyTasks,
  loadStudentListeningTodayPayload,
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
    const mode = url.searchParams.get("mode"); // calendar = 달력만(빠른 월 이동)
    const year = yearParam ? Number(yearParam) : Number(todayIso.slice(0, 4));
    const month = monthParam ? Number(monthParam) : Number(todayIso.slice(5, 7));

    if (mode === "calendar") {
      const calendar = await getStudentListeningCalendar(
        access.admin,
        access.profile.id,
        year,
        month,
        todayIso
      );
      return NextResponse.json({
        ok: true,
        todayIso,
        calendar,
      });
    }

    // 동기: 오늘·미완료만 생성 후 요약·달력 (과제 목록은 한 번만 읽는다)
    const { context, summary, calendar } = await loadStudentListeningTodayPayload(
      access.admin,
      access.profile.id,
      { todayIso, year, month }
    );

    // 45일 미래 생성은 응답을 막지 않음 (끝날 때까지 함수가 살아 있도록 약속을 돌려준다)
    after(() =>
      ensureStudentScheduleDailyTasks(access.admin, access.profile.id, todayIso, {
        futureDays: 45,
        context,
      }).catch(() => undefined)
    );

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
