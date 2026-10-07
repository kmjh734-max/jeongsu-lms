import type { Metadata } from "next";
import { DiagEntryForm } from "@/components/vocab-diagnostic/DiagEntryForm";
import { DiagNotice } from "@/components/vocab-diagnostic/DiagNotice";
import { loadOpenLink } from "@/lib/vocab-diagnostic/server";
import { cleanToken } from "@/lib/vocab-diagnostic/tokens";
import { DIAG_TARGETS } from "@/lib/vocab-diagnostic/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "어휘 진단",
  robots: { index: false, follow: false },
  openGraph: { title: "어휘 진단", description: "예비고1·예비중1 어휘 진단" },
};

export default async function DiagOpenPage({ params }: { params: Promise<{ token: string }> }) {
  const token = cleanToken((await params).token);
  const state = token ? await loadOpenLink(token) : ({ kind: "invalid" } as const);
  if (state.kind !== "ok") {
    return (
      <DiagNotice
        academyName={"academyName" in state ? state.academyName : ""}
        text={state.kind === "inactive" ? "지금은 진단을 받지 않습니다. 학원에 문의해 주세요." : "올바르지 않은 링크입니다. 받은 주소를 그대로 열었는지 확인해 주세요."}
      />
    );
  }
  return (
    <DiagEntryForm
      token={token!}
      academyName={state.academyName}
      tests={state.tests.map((t) => ({
        target: t.target,
        label: DIAG_TARGETS[t.target].label,
        who: DIAG_TARGETS[t.target].who,
        title: t.title,
        questionCount: t.question_count,
        minutes: t.recommended_minutes,
        intro: t.intro_text,
      }))}
    />
  );
}
