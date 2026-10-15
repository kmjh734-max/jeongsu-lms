import { notFound } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { getAcademyBrandingForCurrentUser } from "@/lib/tenant/academy-branding";
import { loadExamAnalysis } from "@/lib/exam-analysis/load";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAcademyFeatureOn } from "@/lib/academies/features";
import type { HitBook } from "@/lib/exam-analysis/hit-book";
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
  // 담아 둔 자료집을 연다 — 만드는 일은 보고서 화면의 「적중 자료집 만들기」가 한다
  const { data: row } = await admin.from("school_exam_analyses").select("hit_book").eq("id", id).maybeSingle();
  const book = (row?.hit_book ?? null) as HitBook | null;
  if (!book) {
    return (
      <div className="mx-auto max-w-xl rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
        아직 적중 자료집을 만들지 않았어요. 분석 보고서의 「적중 자료집 만들기」를 먼저 눌러 주세요.
        <div className="mt-3">
          <a href={backHref} className="font-semibold text-brand-700 underline">
            ← 분석 보고서로
          </a>
        </div>
      </div>
    );
  }
  return <ExamHitBook book={book} academyName={branding.name} backHref={backHref} />;
}
