import type { Metadata } from "next";
import { DiagTakeClient } from "@/components/vocab-diagnostic/DiagTakeClient";
import { DiagNotice } from "@/components/vocab-diagnostic/DiagNotice";
import { loadInvite } from "@/lib/vocab-diagnostic/server";
import { cleanToken } from "@/lib/vocab-diagnostic/tokens";
import { DIAG_TARGETS } from "@/lib/vocab-diagnostic/types";

export const dynamic = "force-dynamic";

/** 공유 미리보기·검색에 이름이나 성적이 나가지 않게 제목은 고정 */
export const metadata: Metadata = {
  title: "어휘 진단",
  robots: { index: false, follow: false },
  openGraph: { title: "어휘 진단", description: "개인 응시 링크" },
};

export default async function DiagTakePage({ params }: { params: Promise<{ token: string }> }) {
  const token = cleanToken((await params).token);
  const state = token ? await loadInvite(token) : ({ kind: "invalid" } as const);

  if (!("inviteId" in state)) {
    const text =
      state.kind === "expired" ? "링크 사용 기간이 지났습니다. 학원에 새 링크를 요청해 주세요."
      : state.kind === "revoked" ? "학원에서 회수한 링크입니다. 학원에 문의해 주세요."
      : state.kind === "inactive" ? "지금은 응시할 수 없는 시험입니다. 학원에 문의해 주세요."
      : "올바르지 않은 링크입니다. 받은 주소를 그대로 열었는지 확인해 주세요.";
    return <DiagNotice academyName={"academyName" in state ? state.academyName : ""} text={text} />;
  }

  return (
    <DiagTakeClient
      token={token!}
      initialState={state.kind}
      academyName={state.academyName}
      candidateName={state.candidateName}
      candidateGrade={state.candidateGrade}
      targetLabel={`${DIAG_TARGETS[state.test.target].label} (${DIAG_TARGETS[state.test.target].who})`}
      title={state.test.title}
      questionCount={state.test.question_count}
      minutes={state.test.recommended_minutes}
      intro={state.test.intro_text}
    />
  );
}
