import { notFound } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { getAcademyBrandingForCurrentUser } from "@/lib/tenant/academy-branding";
import { loadExamAnalysis } from "@/lib/exam-analysis/load";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAcademyFeatureOn } from "@/lib/academies/features";
import { buildHitBook } from "@/lib/exam-analysis/hit-book";
import { ExamHitBook } from "@/components/exam-analysis/ExamHitBook";

/** 적중 자료집 쪽 — 관리자·선생님 화면이 같이 쓴다 */
export async function HitBookPage({ id, backHref }: { id: string; backHref: string }) {
  const profile = await getCurrentProfile();
  const academyId = profile?.academy_id;
  if (!academyId) notFound();
  const admin = createAdminClient();
  const [data, branding, open] = await Promise.all([
    loadExamAnalysis(id, academyId),
    getAcademyBrandingForCurrentUser(),
    isAcademyFeatureOn(admin, academyId, "exam_hit_book"),
  ]);
  if (!data || !open) notFound();
  const book = await buildHitBook(admin, data.analysis, data.items, data.analysis.created_at);
  return <ExamHitBook book={book} academyName={branding.name} backHref={backHref} />;
}
