import { seatLockScreen } from "@/components/credits/SeatLockedNotice";
import { vocabSetsRangeTitle } from "@/lib/vocab/print-title";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { VocabSetPrintView } from "@/components/vocab/VocabSetPrintView";
import { getAcademyBrandingForCurrentUser } from "@/lib/tenant/academy-branding";
import { loadVocabSetsPrintData } from "@/lib/vocab/load-vocab-set-print";
import { createClient } from "@/lib/supabase/server";

interface PageProps {
  searchParams: Promise<{ sets?: string; back?: string }>;
}

export default async function AdminVocabBulkPrintPage({
  searchParams,
}: PageProps) {
  const { sets: setsParam, back } = await searchParams;
  // 이용 확인은 자료를 불러오는 동안 함께 한다
  const lockPromise = seatLockScreen("vocab", "/admin", "/admin/vocab/sets");
  const setIds = (setsParam ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  if (setIds.length === 0) {
    redirect("/admin/vocab/sets");
  }

  const supabase = await createClient();
  const [sections, branding] = await Promise.all([
    loadVocabSetsPrintData(supabase, setIds),
    getAcademyBrandingForCurrentUser(),
  ]);
  if (sections.length === 0) notFound();

  const backHref = back?.startsWith("/admin/") ? back : "/admin/vocab/sets";

  const locked = await lockPromise;
  if (locked) return locked;

  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-sm text-slate-500">인쇄 미리보기 준비 중…</div>
      }
    >
      <VocabSetPrintView
        sections={sections}
        backHref={backHref}
        documentTitle={
          vocabSetsRangeTitle(sections.map((s) => s.title))
        }
        academyName={branding.name}
        logoSrc={branding.logoUrl}
      />
    </Suspense>
  );
}
