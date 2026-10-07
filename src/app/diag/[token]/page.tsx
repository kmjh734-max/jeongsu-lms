import type { Metadata } from "next";
import { DiagTakeClient } from "@/components/vocab-diagnostic/DiagTakeClient";
import { DiagNotice } from "@/components/vocab-diagnostic/DiagNotice";
import { loadInvite } from "@/lib/vocab-diagnostic/server";
import { cleanToken } from "@/lib/vocab-diagnostic/tokens";
import { closedMessage } from "@/app/api/diag/shared";

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
    return <DiagNotice academyName={"academyName" in state ? state.academyName : ""} text={closedMessage(state.kind)} />;
  }
  return <DiagTakeClient token={token!} academyName={state.academyName} candidateName={state.candidateName} title={state.test.title} />;
}
