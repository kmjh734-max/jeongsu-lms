import type { Metadata } from "next";
import { DiagNotice } from "@/components/vocab-diagnostic/DiagNotice";
import { DiagResultView } from "@/components/vocab-diagnostic/DiagResultView";
import { loadResult } from "@/lib/vocab-diagnostic/server";
import { cleanToken } from "@/lib/vocab-diagnostic/tokens";
import { DIAG_TARGETS } from "@/lib/vocab-diagnostic/types";

export const dynamic = "force-dynamic";

/** 공유 미리보기·검색에 이름·성적이 나가지 않게 고정 제목 */
export const metadata: Metadata = {
  title: "어휘 진단 결과",
  robots: { index: false, follow: false },
  openGraph: { title: "어휘 진단 결과", description: "개인 결과 링크" },
};

export default async function DiagResultPage({ params }: { params: Promise<{ token: string }> }) {
  const token = cleanToken((await params).token);
  const r = token ? await loadResult(token) : ({ kind: "invalid" } as const);
  if (r.kind !== "ok") {
    const text =
      r.kind === "expired" ? "결과 링크 기간이 지났습니다. 학원에 새 링크를 요청해 주세요."
      : r.kind === "revoked" ? "학원에서 회수한 결과 링크입니다. 학원에 문의해 주세요."
      : "올바르지 않은 결과 링크입니다.";
    return <DiagNotice academyName="" text={text} />;
  }
  return (
    <main className="mx-auto min-h-dvh w-full max-w-md bg-white px-4 pb-10 pt-5">
      <DiagResultView
        academyName={r.academyName}
        candidateName={r.candidateName}
        targetLabel={DIAG_TARGETS[r.target].label}
        title={r.title}
        submittedAt={r.submittedAt}
        summary={r.summary}
      />
    </main>
  );
}
