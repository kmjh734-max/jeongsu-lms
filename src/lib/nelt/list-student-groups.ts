import { createClient } from "@/lib/supabase/server";
import type { NeltStudentGroup, NeltStudentGroupAttempt } from "@/types/nelt";

type Row = {
  student_name_raw: string | null;
  test_date: string | null;
  overall_level: string | null;
  overall_percentile: number | string | null;
  student_grade_raw: string | null;
  created_at: string;
};

/** 등록 학생과 무관 — student_name_raw 기준으로 그룹 */
export async function listNeltStudentGroups(
  academyId: string
): Promise<NeltStudentGroup[]> {
  const supabase = await createClient();
  const [{ data, error }, { data: shares }] = await Promise.all([
    supabase
      .from("nelt_reports")
      .select(
        "student_name_raw, test_date, overall_level, overall_percentile, student_grade_raw, created_at"
      )
      .eq("academy_id", academyId)
      .eq("extraction_status", "completed")
      .order("test_date", { ascending: true, nullsFirst: true })
      .order("created_at", { ascending: true }),
    supabase
      .from("nelt_shared_reports")
      .select("student_name_raw, created_at")
      .eq("academy_id", academyId)
      .order("created_at", { ascending: false }),
  ]);

  if (error || !data) return [];

  const lastShared = new Map<string, string>();
  for (const row of shares ?? []) {
    const name = (row.student_name_raw as string | null)?.trim();
    if (name && !lastShared.has(name)) lastShared.set(name, row.created_at as string);
  }

  const map = new Map<string, { rows: Row[] }>();
  for (const row of data as Row[]) {
    const name = row.student_name_raw?.trim() || "이름 없음";
    const entry = map.get(name) ?? { rows: [] };
    entry.rows.push(row);
    map.set(name, entry);
  }

  return [...map.entries()]
    .map(([studentName, { rows }]) => {
      // 오래된 순으로 정렬돼 있음 — 날짜 없는 회차는 앞쪽
      const latest = rows[rows.length - 1]!;
      const attempts: NeltStudentGroupAttempt[] = rows.map((r) => ({
        testDate: r.test_date,
        overallLevel: r.overall_level,
        overallPercentile:
          r.overall_percentile != null && r.overall_percentile !== ""
            ? Number(r.overall_percentile)
            : null,
      }));
      const latestWithDate = [...rows].reverse().find((r) => r.test_date) ?? latest;
      return {
        studentName,
        reportCount: rows.length,
        latestTestDate: latestWithDate.test_date,
        latestOverallLevel: latestWithDate.overall_level,
        gradeRaw: [...rows].reverse().find((r) => r.student_grade_raw)?.student_grade_raw ?? null,
        attempts,
        lastSharedAt: lastShared.get(studentName) ?? null,
      };
    })
    .sort((a, b) => a.studentName.localeCompare(b.studentName, "ko"));
}
