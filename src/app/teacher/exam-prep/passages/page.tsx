import Link from "next/link";
import { redirect } from "next/navigation";
import { ExamPrepStaffNav } from "@/components/exam-prep/ExamPrepStaffNav";
import { PageHeader } from "@/components/ui/PageHeader";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { isExamPrepEnabled } from "@/lib/academy-features";
import { createClient } from "@/lib/supabase/server";

const BASE = "/teacher/exam-prep";

type PassageRow = {
  id: string;
  title: string;
  status: string;
  passage_number: string | null;
  exam_range: string | null;
  updated_at: string;
  set_id: string | null;
};

type SetRow = {
  id: string;
  title: string;
  grade: string | null;
  school_name: string | null;
  status: string;
  updated_at: string;
};

export default async function TeacherExamPrepPassagesPage() {
  if (!isExamPrepEnabled()) redirect("/teacher");
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== "teacher" || !profile.academy_id) {
    redirect("/login");
  }

  const supabase = await createClient();
  const [{ data: sets }, { data: passages }] = await Promise.all([
    supabase
      .from("exam_passage_sets")
      .select("id, title, grade, school_name, status, updated_at")
      .eq("academy_id", profile.academy_id)
      .order("updated_at", { ascending: false }),
    supabase
      .from("exam_passages")
      .select(
        "id, title, status, passage_number, exam_range, updated_at, set_id"
      )
      .eq("academy_id", profile.academy_id)
      .order("passage_number", { ascending: true }),
  ]);

  const setList = (sets ?? []) as SetRow[];
  const passageList = (passages ?? []) as PassageRow[];
  const bySet = new Map<string, PassageRow[]>();
  const orphans: PassageRow[] = [];
  for (const p of passageList) {
    if (p.set_id) {
      const list = bySet.get(p.set_id) ?? [];
      list.push(p);
      bySet.set(p.set_id, list);
    } else {
      orphans.push(p);
    }
  }

  return (
    <div>
      <PageHeader
        title="지문 관리"
        description="세트 제목 아래 여러 지문을 묶어 관리합니다."
        action={
          <Link
            href={`${BASE}/passages/new`}
            className="inline-flex h-10 items-center rounded-lg bg-brand-600 px-4 text-sm font-medium text-white hover:bg-brand-700"
          >
            지문 세트 추가
          </Link>
        }
      />
      <ExamPrepStaffNav basePath={BASE} current="passages" />

      <div className="space-y-4">
        {setList.map((set) => {
          const children = bySet.get(set.id) ?? [];
          return (
            <section
              key={set.id}
              className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
            >
              <header className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 bg-slate-50 px-4 py-3">
                <div>
                  <h3 className="text-base font-semibold text-slate-900">
                    {set.title}
                  </h3>
                  <p className="mt-0.5 text-xs text-slate-500">
                    지문 {children.length}개
                    {set.grade ? ` · ${set.grade}` : ""}
                    {set.school_name ? ` · ${set.school_name}` : ""}
                  </p>
                </div>
                <StatusBadge status={set.status} />
              </header>
              <ul className="divide-y divide-slate-100">
                {children.map((p, i) => (
                  <li
                    key={p.id}
                    className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5"
                  >
                    <Link
                      href={`${BASE}/passages/${p.id}`}
                      className="text-sm font-medium text-brand-700 hover:underline"
                    >
                      <span className="mr-2 text-slate-400">
                        {p.passage_number
                          ? `#${p.passage_number}`
                          : `지문 ${i + 1}`}
                      </span>
                      {p.exam_range || p.title}
                    </Link>
                    <div className="flex items-center gap-3">
                      <StatusBadge status={p.status} />
                      <span className="text-xs text-slate-400">
                        {new Date(p.updated_at).toLocaleDateString("ko-KR")}
                      </span>
                    </div>
                  </li>
                ))}
                {children.length === 0 && (
                  <li className="px-4 py-4 text-sm text-slate-500">
                    이 세트에 지문이 없습니다.
                  </li>
                )}
              </ul>
            </section>
          );
        })}

        {orphans.length > 0 && (
          <section className="overflow-hidden rounded-xl border border-dashed border-slate-300 bg-white">
            <header className="border-b border-slate-100 px-4 py-3 text-sm font-semibold text-slate-600">
              세트 없음 (이전 등록분)
            </header>
            <ul className="divide-y divide-slate-100">
              {orphans.map((p) => (
                <li key={p.id} className="px-4 py-2.5">
                  <Link
                    href={`${BASE}/passages/${p.id}`}
                    className="text-sm font-medium text-brand-700 hover:underline"
                  >
                    {p.title}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {setList.length === 0 && orphans.length === 0 && (
          <p className="rounded-xl border border-slate-200 bg-white px-4 py-10 text-center text-sm text-slate-500">
            등록된 지문 세트가 없습니다. 「지문 세트 추가」로 시작하세요.
          </p>
        )}
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
