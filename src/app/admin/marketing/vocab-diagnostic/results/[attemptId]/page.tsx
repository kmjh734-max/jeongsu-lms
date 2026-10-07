import Link from "next/link";
import { notFound } from "next/navigation";
import { DiagResultLinkBar } from "@/components/vocab-diagnostic/DiagResultLinkBar";
import { DiagResultView } from "@/components/vocab-diagnostic/DiagResultView";
import { createAdminClient } from "@/lib/supabase/admin";
import { getDiagStaff } from "@/lib/vocab-diagnostic/access";
import { summarize } from "@/lib/vocab-diagnostic/scoring";
import { diagToken, resultPath } from "@/lib/vocab-diagnostic/tokens";
import { DIAG_TARGETS, type DiagAnswers, type DiagQuestion, type DiagTarget } from "@/lib/vocab-diagnostic/types";

export const dynamic = "force-dynamic";

export default async function DiagResultDetailPage({ params }: { params: Promise<{ attemptId: string }> }) {
  const staff = await getDiagStaff();
  if (!staff) notFound();
  const admin = createAdminClient();
  const { data: a } = await admin
    .from("vocab_diag_attempts")
    .select("id, invite_id, test_id, target, questions, answers, started_at, submitted_at, result_nonce, result_revoked_at")
    .eq("id", (await params).attemptId)
    .eq("academy_id", staff.academyId)
    .maybeSingle();
  if (!a || !a.submitted_at) notFound();
  const [{ data: inv }, { data: test }, { data: academy }] = await Promise.all([
    admin.from("vocab_diag_invites").select("candidate_id").eq("id", a.invite_id).single(),
    admin.from("vocab_diag_tests").select("title").eq("id", a.test_id).single(),
    admin.from("academies").select("name").eq("id", staff.academyId).single(),
  ]);
  const { data: cand } = await admin.from("vocab_diag_candidates").select("name, grade, school").eq("id", inv?.candidate_id ?? "").maybeSingle();
  const target = a.target as DiagTarget;
  const minutes = Math.max(0, Math.round((new Date(a.submitted_at).getTime() - new Date(a.started_at).getTime()) / 60000));

  return (
    <div className="p-4 sm:p-6">
      <Link href="/admin/marketing/vocab-diagnostic" className="text-xs font-semibold text-brand-700 hover:underline">← 어휘 진단</Link>
      <div className="mt-3 grid gap-6 lg:grid-cols-[minmax(0,28rem)_1fr]">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <DiagResultView
            academyName={academy?.name ?? ""}
            candidateName={cand?.name ?? ""}
            targetLabel={DIAG_TARGETS[target].label}
            title={test?.title ?? ""}
            submittedAt={a.submitted_at}
            summary={summarize(a.questions as DiagQuestion[], (a.answers ?? {}) as DiagAnswers)}
            showAll
          />
        </div>
        <aside className="space-y-3 text-sm">
          <dl className="grid grid-cols-[5rem_1fr] gap-y-1.5 rounded-xl border border-slate-200 bg-white p-4">
            <dt className="text-slate-500">응시자</dt>
            <dd className="font-semibold">{cand?.name}</dd>
            <dt className="text-slate-500">대상</dt>
            <dd>{cand?.grade || "-"}</dd>
            <dt className="text-slate-500">학교</dt>
            <dd>{cand?.school || "-"}</dd>
            <dt className="text-slate-500">걸린 시간</dt>
            <dd>{minutes}분</dd>
          </dl>
          <DiagResultLinkBar
            attemptId={a.id}
            link={a.result_nonce && !a.result_revoked_at ? resultPath(diagToken("result", a.id, a.result_nonce)) : null}
          />
        </aside>
      </div>
    </div>
  );
}
