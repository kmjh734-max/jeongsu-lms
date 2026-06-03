import { NextResponse } from "next/server";
import { formatDaysOfWeek } from "@/lib/listening/schedule/days-of-week";
import { assertScheduleManager } from "@/lib/listening/schedule/schedule-access";

function jsonError(message: string, status = 200) {
  return NextResponse.json({ ok: false, message }, { status });
}

export async function GET() {
  try {
    const access = await assertScheduleManager();
    if (!access.ok) return jsonError(access.message, access.status);

    const { data: rows } = await access.admin
      .from("listening_schedule_assignments")
      .select(
        "id, title, target_type, target_class_id, target_student_id, start_date, end_date, days_of_week, questions_per_day, is_active, created_at"
      )
      .order("created_at", { ascending: false })
      .limit(100);

    const assignments = [];
    for (const row of rows ?? []) {
      let targetLabel = "";
      if (row.target_type === "class" && row.target_class_id) {
        const { data: c } = await access.admin
          .from("classes")
          .select("name")
          .eq("id", row.target_class_id)
          .maybeSingle();
        targetLabel = c?.name ? `반 ${c.name}` : "반";
      } else if (row.target_student_id) {
        const { data: s } = await access.admin
          .from("profiles")
          .select("name")
          .eq("id", row.target_student_id)
          .maybeSingle();
        targetLabel = s?.name ? `학생 ${s.name}` : "학생";
      }

      const { data: setLinks } = await access.admin
        .from("listening_schedule_assignment_sets")
        .select("id")
        .eq("assignment_id", row.id);

      assignments.push({
        id: row.id,
        title: row.title,
        targetLabel,
        setCount: setLinks?.length ?? 0,
        startDate: row.start_date,
        endDate: row.end_date,
        daysLabel: formatDaysOfWeek((row.days_of_week as number[]) ?? []),
        questionsPerDay: row.questions_per_day,
        isActive: row.is_active,
      });
    }

    return NextResponse.json({ ok: true, assignments });
  } catch (e) {
    const message = e instanceof Error ? e.message : "조회 오류";
    return jsonError(message);
  }
}
