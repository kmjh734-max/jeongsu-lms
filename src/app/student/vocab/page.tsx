import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { PageHeader } from "@/components/ui/PageHeader";
import { StudentVocabSetList } from "@/components/vocab/StudentVocabSetList";
import { fetchStudentVocabSummaries } from "@/lib/vocab/student-sets";
import { createAdminClient } from "@/lib/supabase/admin";
import { loadReviewCounts } from "@/lib/vocab/review";
import Link from "next/link";

export default async function StudentVocabPage() {
  const [profile, supabase] = await Promise.all([
    getCurrentProfile(),
    createClient(),
  ]);

  const [summaries, review] = await Promise.all([
    fetchStudentVocabSummaries(supabase, profile!.id),
    loadReviewCounts(createAdminClient(), profile!.id),
  ]);

  return (
    <div>
      <PageHeader
        title="단어학습"
        description="뜻 익히기 → 스펠링 → 예문 빈칸 → 종합테스트를 차례로 끝내면 합격이에요. 시험 연계 단어장은 예문 빈칸 없이 3단계예요."
      />
      {review.due > 0 || review.total > 0 ? (
        <Link
          href="/student/vocab/review"
          className="mb-4 flex items-center justify-between gap-3 rounded-2xl border border-brand-200 bg-brand-50/60 px-5 py-4 hover:bg-brand-50"
        >
          <span>
            <b className="block text-base text-slate-900">
              {review.due > 0 ? `오늘 복습할 단어 ${review.due}개` : "복습할 단어를 모으는 중"}
            </b>
            <span className="text-sm text-slate-600">
              {review.due > 0
                ? "전에 틀린 단어예요. 연속 두 번 맞히면 목록에서 빠져요."
                : `모아 둔 단어 ${review.total}개는 다음 복습 날짜를 기다려요.`}
            </span>
          </span>
          <span className="shrink-0 text-sm font-bold text-brand-700">{review.due > 0 ? "복습하기 →" : "보기 →"}</span>
        </Link>
      ) : null}
      <StudentVocabSetList summaries={summaries} />
    </div>
  );
}
