import { createClient } from "@/lib/supabase/server";
import type { NeltStudentGroup } from "@/types/nelt";

/** 등록 학생과 무관 — student_name_raw 기준으로 그룹 */
export async function listNeltStudentGroups(
  academyId: string
): Promise<NeltStudentGroup[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("nelt_reports")
    .select("student_name_raw, test_date, overall_level, created_at")
    .eq("academy_id", academyId)
    .order("test_date", { ascending: false, nullsFirst: false });

  if (error || !data) return [];

  const map = new Map<
    string,
    {
      count: number;
      latestTestDate: string | null;
      latestOverallLevel: string | null;
      latestCreated: string;
    }
  >();

  for (const row of data) {
    const name = (row.student_name_raw as string)?.trim() || "이름 없음";
    const existing = map.get(name);
    const testDate = (row.test_date as string | null) ?? null;
    const created = row.created_at as string;
    if (!existing) {
      map.set(name, {
        count: 1,
        latestTestDate: testDate,
        latestOverallLevel: (row.overall_level as string | null) ?? null,
        latestCreated: created,
      });
      continue;
    }
    existing.count += 1;
    const newer =
      (testDate && existing.latestTestDate && testDate > existing.latestTestDate) ||
      (!existing.latestTestDate && testDate) ||
      (testDate === existing.latestTestDate && created > existing.latestCreated);
    if (newer) {
      existing.latestTestDate = testDate ?? existing.latestTestDate;
      existing.latestOverallLevel =
        (row.overall_level as string | null) ?? existing.latestOverallLevel;
      existing.latestCreated = created;
    }
  }

  return [...map.entries()]
    .map(([studentName, v]) => ({
      studentName,
      reportCount: v.count,
      latestTestDate: v.latestTestDate,
      latestOverallLevel: v.latestOverallLevel,
    }))
    .sort((a, b) => a.studentName.localeCompare(b.studentName, "ko"));
}
