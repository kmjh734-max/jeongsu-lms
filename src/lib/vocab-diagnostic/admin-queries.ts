import { createAdminClient } from "@/lib/supabase/admin";
import { fetchAllRows } from "@/lib/supabase/fetch-all-rows";
import { diagToken, openPath, resultPath } from "./tokens";
import { rateText } from "./scoring";
import type { DiagTarget, DiagTestRow } from "./types";

/** 관리자 화면용 읽기. 부르는 쪽에서 requireDiagStaff/getDiagStaff 로 학원을 확인한 뒤 academyId 를 넘긴다. */

export type DiagSetup = {
  link: { path: string; isActive: boolean } | null;
  tests: DiagTestRow[];
};

export async function loadSetup(academyId: string): Promise<DiagSetup> {
  const admin = createAdminClient();
  const [{ data: link }, { data: tests, error }] = await Promise.all([
    admin.from("vocab_diag_links").select("public_nonce, is_active").eq("academy_id", academyId).maybeSingle(),
    admin.from("vocab_diag_tests").select("*").eq("academy_id", academyId),
  ]);
  if (error) throw new Error(error.message);
  return {
    link: link ? { path: openPath(diagToken("open", academyId, link.public_nonce)), isActive: link.is_active } : null,
    tests: ((tests ?? []) as DiagTestRow[]).sort((a, b) => (a.target === "pre_high1" ? 0 : 1) - (b.target === "pre_high1" ? 0 : 1)),
  };
}

export type ResultListRow = {
  attemptId: string;
  candidateName: string;
  grade: string;
  school: string;
  target: DiagTarget;
  status: "in_progress" | "submitted";
  answered: number;
  startedAt: string;
  submittedAt: string | null;
  correct: number;
  total: number;
  rateText: string;
  minutes: number | null;
  resultLink: string | null;
};

/** 응시 목록(응시 중 포함), 최근 것부터 */
export async function listResults(academyId: string): Promise<ResultListRow[]> {
  const admin = createAdminClient();
  const [rows, invites, cands] = await Promise.all([
    fetchAllRows<{ id: string; invite_id: string; target: string; questions: unknown[]; answers: Record<string, unknown> | null; started_at: string; submitted_at: string | null; correct_count: number | null; total_count: number | null; result_nonce: string | null; result_revoked_at: string | null }>(
      (from, to) =>
        admin
          .from("vocab_diag_attempts")
          .select("id, invite_id, target, questions, answers, started_at, submitted_at, correct_count, total_count, result_nonce, result_revoked_at")
          .eq("academy_id", academyId)
          .order("started_at", { ascending: false })
          .range(from, to),
    ),
    fetchAllRows<{ id: string; candidate_id: string }>((from, to) => admin.from("vocab_diag_invites").select("id, candidate_id").eq("academy_id", academyId).range(from, to)),
    fetchAllRows<{ id: string; name: string; grade: string; school: string }>((from, to) => admin.from("vocab_diag_candidates").select("id, name, grade, school").eq("academy_id", academyId).range(from, to)),
  ]);
  const candOfInvite = new Map(invites.map((i) => [i.id, i.candidate_id]));
  const cand = new Map(cands.map((c) => [c.id, c]));
  return rows.map((r) => {
    const c = cand.get(candOfInvite.get(r.invite_id) ?? "");
    const total = r.total_count ?? r.questions.length;
    return {
      attemptId: r.id,
      candidateName: c?.name ?? "",
      grade: c?.grade ?? "",
      school: c?.school ?? "",
      target: r.target as DiagTarget,
      status: r.submitted_at ? "submitted" : "in_progress",
      answered: Object.keys(r.answers ?? {}).length,
      startedAt: r.started_at,
      submittedAt: r.submitted_at,
      correct: r.correct_count ?? 0,
      total,
      rateText: rateText(r.correct_count ?? 0, total),
      minutes: r.submitted_at ? Math.max(0, Math.round((new Date(r.submitted_at).getTime() - new Date(r.started_at).getTime()) / 60000)) : null,
      resultLink: r.submitted_at && r.result_nonce && !r.result_revoked_at ? resultPath(diagToken("result", r.id, r.result_nonce)) : null,
    };
  });
}
