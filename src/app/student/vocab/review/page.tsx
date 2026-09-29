import Link from "next/link";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { createAdminClient } from "@/lib/supabase/admin";
import { PageHeader } from "@/components/ui/PageHeader";
import { VocabReviewClient } from "@/components/vocab/VocabReviewClient";
import { loadDueReview, loadReviewCounts } from "@/lib/vocab/review";

/** 틀린 단어 복습 — 오늘 낼 단어만 모아서 푼다 */
export default async function VocabReviewPage() {
  const profile = await getCurrentProfile();
  const admin = createAdminClient();
  const [cards, counts] = await Promise.all([
    loadDueReview(admin, profile!.id),
    loadReviewCounts(admin, profile!.id),
  ]);

  return (
    <div>
      <PageHeader
        title="틀린 단어 복습"
        description="전에 틀린 단어를 날짜를 띄워 가며 다시 물어요. 연속 두 번 맞히면 목록에서 빠져요."
      />
      {cards.length === 0 ? (
        <div className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <p className="text-base font-bold text-slate-900">오늘 복습할 단어가 없어요.</p>
          <p className="mt-1 text-sm text-slate-500">
            {counts.total > 0
              ? `모아 둔 단어 ${counts.total}개는 다음 복습 날짜를 기다리는 중이에요.`
              : "틀린 단어가 생기면 여기에 모여요."}
          </p>
          <Link href="/student/vocab" className="mt-4 inline-block text-sm font-semibold text-brand-700 hover:underline">
            단어학습으로 돌아가기 →
          </Link>
        </div>
      ) : (
        <VocabReviewClient cards={cards} graduated={counts.graduated} />
      )}
    </div>
  );
}
