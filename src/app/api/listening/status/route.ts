import { NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import {
  formatKoreaMonth,
  getKoreaYearMonth,
  parseKoreaMonthParam,
} from "@/lib/date/korea-today";
import { loadListeningMonthlyStatusTable } from "@/lib/listening/load-monthly-status-table";
import { listReportClasses } from "@/lib/reports/list-students";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const profile = await getCurrentProfile();
  if (!profile || (profile.role !== "admin" && profile.role !== "teacher")) {
    return NextResponse.json(
      { ok: false, message: "권한이 없습니다." },
      { status: 403 }
    );
  }

  if (profile.role === "teacher" && profile.is_active === false) {
    return NextResponse.json(
      { ok: false, message: "비활성화된 계정입니다." },
      { status: 403 }
    );
  }

  const { searchParams } = new URL(request.url);
  const { year, month } = parseKoreaMonthParam(searchParams.get("month"));
  const classId = searchParams.get("classId") ?? undefined;
  const nameQuery = searchParams.get("name") ?? "";
  const loginQuery = searchParams.get("loginId") ?? "";

  const supabase = await createClient();
  const [classes, table] = await Promise.all([
    listReportClasses(supabase, profile.role, profile.id),
    loadListeningMonthlyStatusTable(supabase, profile.role, profile.id, {
      year,
      month,
      classId,
      nameQuery,
      loginQuery,
    }),
  ]);

  return NextResponse.json({
    ok: true,
    month: formatKoreaMonth(year, month),
    classes,
    table,
  });
}
