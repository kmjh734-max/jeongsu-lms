import Link from "next/link";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/ui/PageHeader";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { isExamPrepEnabled } from "@/lib/academy-features";
import { createClient } from "@/lib/supabase/server";
import type { ExamAssignmentStudentStatus } from "@/lib/exam-prep/types";

type TabKey = "all" | "in_progress" | "completed";

type AssignmentCard = {
  id: string;
  status: ExamAssignmentStudentStatus;
  progress_rate: number;
  total_score: number | null;
  last_studied_at: string | null;
  due_at: string | null;
  title: string;
  teacher_message: string | null;
};

interface PageProps {
  searchParams: Promise<{ tab?: string }>;
}

export default async function StudentExamPrepPage({ searchParams }: PageProps) {
  if (!isExamPrepEnabled()) redirect("/student");
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== "student") redirect("/login");

  const sp = await searchParams;
  const tab = (["all", "in_progress", "completed"].includes(sp.tab ?? "")
    ? sp.tab
    : "all") as TabKey;

  const supabase = await createClient();
  const { data } = await supabase
    .from("exam_assignment_students")
    .select(
      "id, status, progress_rate, total_score, last_studied_at, exam_assignments(title, due_at, teacher_message)"
    )
    .eq("student_id", profile.id)
    .order("last_studied_at", { ascending: false, nullsFirst: false });

  const cards: AssignmentCard[] = (data ?? []).map((row) => {
    const raw = row.exam_assignments as
      | {
          title: string;
          due_at: string | null;
          teacher_message: string | null;
        }
      | {
          title: string;
          due_at: string | null;
          teacher_message: string | null;
        }[]
      | null;
    const a = Array.isArray(raw) ? raw[0] ?? null : raw;
    return {
      id: row.id as string,
      status: row.status as ExamAssignmentStudentStatus,
      progress_rate: Number(row.progress_rate) || 0,
      total_score:
        row.total_score != null ? Number(row.total_score) : null,
      last_studied_at: row.last_studied_at as string | null,
      due_at: a?.due_at ?? null,
      title: a?.title ?? "내신대비 학습",
      teacher_message: a?.teacher_message ?? null,
    };
  });

  const filtered = cards.filter((c) => {
    if (tab === "all") return true;
    if (tab === "completed") return c.status === "completed";
    return (
      c.status === "in_progress" ||
      c.status === "not_started" ||
      c.status === "needs_retry" ||
      c.status === "overdue"
    );
  });

  const tabs: { key: TabKey; label: string }[] = [
    { key: "all", label: "전체" },
    { key: "in_progress", label: "진행 중" },
    { key: "completed", label: "완료" },
  ];

  return (
    <div>
      <PageHeader
        title="내신대비학습"
        description="배정된 본문 학습을 단계별로 진행합니다."
        action={
          <Link
            href="/student/exam-prep/wrong"
            className="text-sm font-medium text-brand-700 hover:underline"
          >
            내 오답
          </Link>
        }
      />

      <div className="mb-4 flex flex-wrap gap-1 border-b border-slate-200 pb-3">
        {tabs.map((t) => (
          <Link
            key={t.key}
            href={
              t.key === "all"
                ? "/student/exam-prep"
                : `/student/exam-prep?tab=${t.key}`
            }
            className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
              tab === t.key
                ? "bg-brand-600 text-white"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {filtered.map((c) => (
          <Link
            key={c.id}
            href={`/student/exam-prep/${c.id}`}
            className="rounded-xl border border-slate-200 bg-white p-4 transition hover:border-brand-300 hover:shadow-sm"
          >
            <div className="flex items-start justify-between gap-2">
              <h2 className="font-semibold text-slate-900">{c.title}</h2>
              <StatusPill status={c.status} />
            </div>
            <p className="mt-2 text-sm text-slate-600">
              진행률 {c.progress_rate}%
              {c.total_score != null ? ` · 점수 ${c.total_score}` : ""}
            </p>
            {c.due_at && (
              <p className="mt-1 text-xs text-slate-500">
                마감 {new Date(c.due_at).toLocaleString("ko-KR")}
              </p>
            )}
            {c.teacher_message && (
              <p className="mt-2 line-clamp-2 text-xs text-slate-500">
                {c.teacher_message}
              </p>
            )}
          </Link>
        ))}
        {filtered.length === 0 && (
          <p className="col-span-full rounded-xl border border-dashed border-slate-200 px-4 py-10 text-center text-sm text-slate-500">
            배정된 학습이 없습니다.
          </p>
        )}
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    not_started: "bg-slate-100 text-slate-700",
    in_progress: "bg-blue-100 text-blue-800",
    needs_retry: "bg-amber-100 text-amber-800",
    completed: "bg-green-100 text-green-800",
    overdue: "bg-red-100 text-red-800",
  };
  const labels: Record<string, string> = {
    not_started: "미시작",
    in_progress: "진행중",
    needs_retry: "재도전",
    completed: "완료",
    overdue: "기한초과",
  };
  return (
    <span
      className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
        map[status] ?? "bg-slate-100 text-slate-600"
      }`}
    >
      {labels[status] ?? status}
    </span>
  );
}
