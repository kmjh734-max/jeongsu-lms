import { createAdminClient } from "@/lib/supabase/admin";
import { fetchAllRows } from "@/lib/supabase/fetch-all-rows";
import { diagToken, invitePath, resultPath } from "./tokens";
import { rateText } from "./scoring";
import type { DiagTarget, DiagTestRow } from "./types";

/** 관리자 화면용 읽기. 부르는 쪽에서 requireDiagStaff/getDiagStaff 로 학원을 확인한 뒤 academyId 를 넘긴다. */

export async function listTests(academyId: string): Promise<DiagTestRow[]> {
  const { data, error } = await createAdminClient()
    .from("vocab_diag_tests")
    .select("*")
    .eq("academy_id", academyId)
    .order("target")
    .order("version", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as DiagTestRow[];
}

export async function getTest(academyId: string, id: string): Promise<DiagTestRow | null> {
  const { data } = await createAdminClient().from("vocab_diag_tests").select("*").eq("academy_id", academyId).eq("id", id).maybeSingle();
  return (data as DiagTestRow | null) ?? null;
}

export type InviteListRow = {
  id: string;
  testId: string;
  testTitle: string;
  target: DiagTarget;
  version: number;
  candidateName: string;
  grade: string;
  school: string;
  createdAt: string;
  expiresAt: string;
  link: string;
  linkState: "active" | "expired" | "revoked";
  status: "not_started" | "in_progress" | "submitted";
  attemptId: string | null;
};

export async function listInvites(academyId: string): Promise<InviteListRow[]> {
  const admin = createAdminClient();
  const invites = await fetchAllRows<{ id: string; test_id: string; candidate_id: string; token_nonce: string; expires_at: string; revoked_at: string | null; created_at: string }>(
    (from, to) => admin.from("vocab_diag_invites").select("id, test_id, candidate_id, token_nonce, expires_at, revoked_at, created_at").eq("academy_id", academyId).order("created_at", { ascending: false }).range(from, to),
  );
  const [tests, cands, attempts] = await Promise.all([
    listTests(academyId),
    fetchAllRows<{ id: string; name: string; grade: string; school: string }>((from, to) => admin.from("vocab_diag_candidates").select("id, name, grade, school").eq("academy_id", academyId).range(from, to)),
    fetchAllRows<{ id: string; invite_id: string; submitted_at: string | null }>((from, to) => admin.from("vocab_diag_attempts").select("id, invite_id, submitted_at").eq("academy_id", academyId).range(from, to)),
  ]);
  const t = new Map(tests.map((x) => [x.id, x]));
  const c = new Map(cands.map((x) => [x.id, x]));
  const a = new Map(attempts.map((x) => [x.invite_id, x]));
  const now = Date.now();
  return invites.map((i) => {
    const test = t.get(i.test_id);
    const cand = c.get(i.candidate_id);
    const att = a.get(i.id);
    return {
      id: i.id,
      testId: i.test_id,
      testTitle: test?.title ?? "",
      target: (test?.target ?? "pre_high1") as DiagTarget,
      version: test?.version ?? 1,
      candidateName: cand?.name ?? "",
      grade: cand?.grade ?? "",
      school: cand?.school ?? "",
      createdAt: i.created_at,
      expiresAt: i.expires_at,
      link: invitePath(diagToken("invite", i.id, i.token_nonce)),
      linkState: i.revoked_at ? "revoked" : new Date(i.expires_at).getTime() < now ? "expired" : "active",
      status: att?.submitted_at ? "submitted" : att ? "in_progress" : "not_started",
      attemptId: att?.id ?? null,
    };
  });
}

export type ResultListRow = {
  attemptId: string;
  candidateName: string;
  grade: string;
  school: string;
  target: DiagTarget;
  testTitle: string;
  version: number;
  startedAt: string;
  submittedAt: string;
  correct: number;
  total: number;
  rateText: string;
  minutes: number;
  resultLink: string | null;
};

export async function listResults(academyId: string): Promise<ResultListRow[]> {
  const admin = createAdminClient();
  const rows = await fetchAllRows<{ id: string; invite_id: string; test_id: string; target: string; started_at: string; submitted_at: string; correct_count: number; total_count: number; result_nonce: string | null; result_revoked_at: string | null }>(
    (from, to) =>
      admin
        .from("vocab_diag_attempts")
        .select("id, invite_id, test_id, target, started_at, submitted_at, correct_count, total_count, result_nonce, result_revoked_at")
        .eq("academy_id", academyId)
        .not("submitted_at", "is", null)
        .order("submitted_at", { ascending: false })
        .range(from, to),
  );
  const invites = await listInvites(academyId);
  const inv = new Map(invites.map((i) => [i.id, i]));
  return rows.map((r) => {
    const i = inv.get(r.invite_id);
    return {
      attemptId: r.id,
      candidateName: i?.candidateName ?? "",
      grade: i?.grade ?? "",
      school: i?.school ?? "",
      target: r.target as DiagTarget,
      testTitle: i?.testTitle ?? "",
      version: i?.version ?? 1,
      startedAt: r.started_at,
      submittedAt: r.submitted_at,
      correct: r.correct_count ?? 0,
      total: r.total_count ?? 0,
      rateText: rateText(r.correct_count ?? 0, r.total_count ?? 0),
      minutes: Math.max(0, Math.round((new Date(r.submitted_at).getTime() - new Date(r.started_at).getTime()) / 60000)),
      resultLink: r.result_nonce && !r.result_revoked_at ? resultPath(diagToken("result", r.id, r.result_nonce)) : null,
    };
  });
}

/** 기존 응시자와 재원생(학생 계정) — 같은 사람을 거듭 등록하지 않게 고를 수 있게 한다 */
export async function listPeople(academyId: string): Promise<{
  candidates: { id: string; name: string; grade: string; school: string; studentId: string | null }[];
  students: { id: string; name: string }[];
}> {
  const admin = createAdminClient();
  const [cands, students] = await Promise.all([
    fetchAllRows<{ id: string; name: string; grade: string; school: string; student_id: string | null }>((from, to) =>
      admin.from("vocab_diag_candidates").select("id, name, grade, school, student_id").eq("academy_id", academyId).order("created_at", { ascending: false }).range(from, to),
    ),
    fetchAllRows<{ id: string; name: string | null; full_name?: string | null }>((from, to) =>
      admin.from("profiles").select("id, name").eq("academy_id", academyId).eq("role", "student").order("name").range(from, to),
    ),
  ]);
  return {
    candidates: cands.map((x) => ({ id: x.id, name: x.name, grade: x.grade, school: x.school, studentId: x.student_id })),
    students: students.map((s) => ({ id: s.id, name: s.name ?? "" })).filter((s) => s.name),
  };
}
