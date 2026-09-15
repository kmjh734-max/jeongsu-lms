import { VocabTodayStatusPanel } from "@/components/learning-status/VocabTodayStatusPanel";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { listReportClasses } from "@/lib/reports/list-students";
import { createClient } from "@/lib/supabase/server";
import { loadVocabModuleData } from "@/lib/vocab/load-module-data";
import type { VocabRole } from "@/lib/vocab/module-types";

/** 현황 탭 — 학생 × 단어장 진행표 */
export async function renderVocabStatusPage(role: VocabRole) {
  const profile = await getCurrentProfile();
  const supabase = await createClient();
  const [classes, data] = await Promise.all([
    listReportClasses(supabase, role, profile!.id),
    loadVocabModuleData(role),
  ]);

  const scopeOptions = [
    ...data.folders
      .filter((f) => f.setCount > 0)
      .map((f) => ({
        value: f.id,
        label: f.isCurriculum ? `${f.name} (학원 교재)` : f.name,
      })),
    ...(data.unfiledCount + data.lockedUnfiledCount > 0
      ? [{ value: "unfiled", label: "폴더 없는 단어장" }]
      : []),
  ];

  return <VocabTodayStatusPanel initialClasses={classes} scopeOptions={scopeOptions} />;
}
