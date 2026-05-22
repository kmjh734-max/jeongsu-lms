import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { fetchStudentVocabSummaries } from "@/lib/vocab/student-sets";
import { vocabTestTypeLabel } from "@/lib/vocab/test-types";
import { PageHeader } from "@/components/ui/PageHeader";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { ButtonLink } from "@/components/ui/Button";

export default async function StudentVocabPage() {
  const profile = await getCurrentProfile();
  const supabase = await createClient();

  const summaries = await fetchStudentVocabSummaries(supabase, profile!.id);

  return (
    <div className="space-y-8">
      <PageHeader
        title="단어학습"
        description="배정된 단어장을 카드로 학습하거나 테스트할 수 있습니다."
      />

      {summaries.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
          <p className="text-slate-600">배정된 단어장이 없습니다.</p>
          <p className="mt-1 text-sm text-slate-500">
            강사가 단어장을 배정하면 이곳에 표시됩니다.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {summaries.map(
            ({
              set,
              itemCount,
              knownCount,
              reviewCount,
              completionPercent,
              latestTestScore,
              latestTestAt,
              latestTestType,
            }) => (
              <div
                key={set.id}
                className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-card"
              >
                <h3 className="font-semibold text-slate-900">{set.title}</h3>
                {set.description && (
                  <p className="mt-1 line-clamp-2 text-sm text-slate-600">
                    {set.description}
                  </p>
                )}
                <dl className="mt-4 grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <dt className="text-slate-500">단어 수</dt>
                    <dd className="font-medium">{itemCount}개</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">복습 필요</dt>
                    <dd className="font-medium text-amber-700">
                      {reviewCount}개
                    </dd>
                  </div>
                </dl>
                <div className="mt-4">
                  <ProgressBar
                    percent={completionPercent}
                    label={`알아요 ${knownCount} / ${itemCount}`}
                  />
                </div>
                <div className="mt-3 text-sm">
                  {latestTestAt && latestTestScore !== null ? (
                    <p className="text-slate-600">
                      최근 테스트:{" "}
                      <span className="font-semibold text-brand-700">
                        {latestTestScore}점
                      </span>
                      {latestTestType && (
                        <span className="text-slate-500">
                          {" "}
                          ({vocabTestTypeLabel(latestTestType)})
                        </span>
                      )}
                      <span className="block text-xs text-slate-400">
                        {new Date(latestTestAt).toLocaleDateString("ko-KR")}
                      </span>
                    </p>
                  ) : itemCount >= 2 ? (
                    <p className="text-amber-700">테스트 미응시</p>
                  ) : null}
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {itemCount > 0 ? (
                    <>
                      <ButtonLink href={`/student/vocab/${set.id}`} size="sm">
                        열기
                      </ButtonLink>
                      <ButtonLink
                        href={`/student/vocab/${set.id}/study`}
                        variant="secondary"
                        size="sm"
                      >
                        카드 학습
                      </ButtonLink>
                    </>
                  ) : (
                    <span className="inline-flex h-8 items-center rounded-lg bg-slate-100 px-3 text-xs font-medium text-slate-500">
                      단어가 없습니다
                    </span>
                  )}
                </div>
              </div>
            )
          )}
        </div>
      )}

      <p className="text-center text-sm text-slate-500">
        <Link href="/student" className="text-brand-600 hover:underline">
          내 강의실로 돌아가기
        </Link>
      </p>
    </div>
  );
}
