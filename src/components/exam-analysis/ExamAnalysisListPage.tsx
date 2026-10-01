import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { ExamUploadPanel } from "@/components/exam-analysis/ExamUploadPanel";
import { ExamDeleteButton } from "@/components/exam-analysis/ExamDeleteButton";
import { loadExamAnalyses } from "@/lib/exam-analysis/load";

const STATUS_LABEL = { reading: "읽는 중", analyzing: "분석 중", ready: "", failed: "분석 실패" } as const;

/** 내신 시험 분석 목록 + 올리기 (관리자·선생님 공통) */
export async function ExamAnalysisListPage({ academyId, basePath }: { academyId: string; basePath: string }) {
  const list = await loadExamAnalyses(academyId);
  return (
    <div className="space-y-5">
      <PageHeader
        title="내신 시험 분석"
        description="학교 시험지를 올리면 문항마다 유형·난이도·배점을 정리한 분석 보고서를 만들어요."
      />
      <ExamUploadPanel basePath={basePath} />

      {list.length ? (
        <Link
          href={`${basePath}/pattern`}
          className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-brand-200 bg-brand-50 px-4 py-3 hover:bg-brand-100"
        >
          <span>
            <span className="text-sm font-bold text-brand-900">학교별 출제 버릇 보기</span>
            <span className="mt-0.5 block text-xs text-brand-800">
              같은 학교 시험을 모아 어디서 어떤 유형으로 내는지 보여 줍니다. 다음 시험에 무엇을 만들지 고르실 때 보세요.
            </span>
          </span>
          <span className="text-sm font-semibold text-brand-700">보기 →</span>
        </Link>
      ) : null}

      {list.length ? (
        <section>
          <h2 className="mb-2.5 text-sm font-bold text-slate-700">분석한 시험 {list.length}</h2>
          <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {list.map((a) => (
              <li key={a.id} className="relative">
                <div className="absolute right-2.5 top-2.5 z-10">
                  <ExamDeleteButton
                    id={a.id}
                    label={[a.school_name ?? "학교 미입력", a.grade ? `${a.grade}학년` : "", a.exam_label ?? ""].filter(Boolean).join(" ")}
                  />
                </div>
                <Link
                  href={`${basePath}/${a.id}`}
                  className="flex h-full flex-col rounded-xl border border-slate-200 bg-white p-4 shadow-card transition hover:border-brand-200"
                >
                  <span className="flex items-center gap-2 pr-8">
                    <span className="font-bold text-slate-900">
                      {[a.school_name ?? "학교 미입력", a.grade ? `${a.grade}학년` : ""].filter(Boolean).join(" ")}
                    </span>
                    {STATUS_LABEL[a.status] ? (
                      <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${a.status === "failed" ? "bg-red-50 text-red-700" : "bg-slate-100 text-slate-600"}`}>
                        {STATUS_LABEL[a.status]}
                      </span>
                    ) : null}
                  </span>
                  <span className="mt-0.5 text-sm text-slate-600">{[a.subject, a.exam_label].filter(Boolean).join(" · ") || "시험 정보 없음"}</span>
                  {a.status === "ready" ? (
                    <span className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500">
                      <span><b className="text-slate-800">{a.counts.n}</b>문항</span>
                      <span>서술형 <b className="text-slate-800">{a.counts.subj}</b></span>
                      <span>고난도 <b className="text-slate-800">{a.counts.hard}</b></span>
                      {a.counts.matched ? <span>수업자료 적중 <b className="text-brand-700">{a.counts.matched}</b></span> : null}
                    </span>
                  ) : null}
                  <span className="mt-auto pt-3 text-[11px] text-slate-400">{new Date(a.created_at).toLocaleDateString("ko-KR")}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
