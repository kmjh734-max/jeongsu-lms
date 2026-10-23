import { VocabTodayStatusPanel } from "@/components/learning-status/VocabTodayStatusPanel";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { listReportClasses } from "@/lib/reports/list-students";
import { createClient } from "@/lib/supabase/server";
import { getAcademyBrandingForCurrentUser } from "@/lib/tenant/academy-branding";
import type { VocabRole } from "@/lib/vocab/module-types";

/** 현황 탭 — 학생 한 줄 요약(지금 하는 단어장·어디까지·최근·오늘) */
export async function renderVocabStatusPage(role: VocabRole) {
  const profile = await getCurrentProfile();
  const supabase = await createClient();
  const [classes, branding] = await Promise.all([
    listReportClasses(supabase, role, profile!.id),
    getAcademyBrandingForCurrentUser(),
  ]);

  return <VocabTodayStatusPanel initialClasses={classes} academyName={branding.name} />;
}
