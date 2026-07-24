import Link from "next/link";
import { redirect } from "next/navigation";
import { ExamPrepStaffNav } from "@/components/exam-prep/ExamPrepStaffNav";
import { PageHeader } from "@/components/ui/PageHeader";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { isExamPrepEnabled } from "@/lib/academy-features";
import { createClient } from "@/lib/supabase/server";
import type { ExamPassage } from "@/lib/exam-prep/types";

const BASE = "/teacher/exam-prep";

export default async function TeacherExamPrepPassagesPage() {
  if (!isExamPrepEnabled()) redirect("/teacher");
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== "teacher" || !profile.academy_id) {
    redirect("/login");
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("exam_passages")
    .select(
      "id, title, grade, school_name, status, unit_name, updated_at, passage_number"
    )
    .eq("academy_id", profile.academy_id)
    .order("updated_at", { ascending: false });

  const passages = (data ?? []) as Pick<
    ExamPassage,
    | "id"
    | "title"
    | "grade"
    | "school_name"
    | "status"
    | "unit_name"
    | "updated_at"
    | "passage_number"
  >[];

  return (
    <div>
      <PageHeader
        title="지문 관리"
        description="내신 대비용 본문을 등록하고 문장을 편집합니다."
        action={
          <Link
            href={`${BASE}/passages/new`}
            className="inline-flex h-10 items-center rounded-lg bg-brand-600 px-4 text-sm font-medium text-white hover:bg-brand-700"
          >
            지문 일괄 추가
          </Link>
        }
      />
      <ExamPrepStaffNav basePath={BASE} current="passages" />

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">제목</th>
              <th className="px-4 py-3 font-medium">학년</th>
              <th className="px-4 py-3 font-medium">학교</th>
              <th className="px-4 py-3 font-medium">단원</th>
              <th className="px-4 py-3 font-medium">상태</th>
              <th className="px-4 py-3 font-medium">수정일</th>
            </tr>
          </thead>
          <tbody>
            {passages.map((p) => (
              <tr key={p.id} className="border-b border-slate-100 last:border-0">
                <td className="px-4 py-3">
                  <Link
                    href={`${BASE}/passages/${p.id}`}
                    className="font-medium text-brand-700 hover:underline"
                  >
                    {p.title}
                  </Link>
                  {p.passage_number && (
                    <span className="ml-2 text-xs text-slate-400">
                      #{p.passage_number}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-slate-600">{p.grade ?? "-"}</td>
                <td className="px-4 py-3 text-slate-600">
                  {p.school_name ?? "-"}
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {p.unit_name ?? "-"}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={p.status} />
                </td>
                <td className="px-4 py-3 text-slate-500">
                  {new Date(p.updated_at).toLocaleDateString("ko-KR")}
                </td>
              </tr>
            ))}
            {passages.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-8 text-center text-slate-500"
                >
                  등록된 지문이 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    draft: "bg-slate-100 text-slate-700",
    ready: "bg-green-100 text-green-800",
    archived: "bg-amber-100 text-amber-800",
  };
  const labels: Record<string, string> = {
    draft: "초안",
    ready: "준비완료",
    archived: "보관",
  };
  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
        styles[status] ?? "bg-slate-100 text-slate-600"
      }`}
    >
      {labels[status] ?? status}
    </span>
  );
}
