import Link from "next/link";
import { redirect } from "next/navigation";
import { ExamPrepStaffNav } from "@/components/exam-prep/ExamPrepStaffNav";
import {
  PassageListClient,
  type PassageListItem,
  type PassageSetListItem,
} from "@/components/exam-prep/PassageListClient";
import { PageHeader } from "@/components/ui/PageHeader";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { isExamPrepEnabled } from "@/lib/academy-features";
import { createClient } from "@/lib/supabase/server";

const BASE = "/admin/exam-prep";

type PassageRow = PassageListItem & { set_id: string | null };

type SetRow = {
  id: string;
  title: string;
  grade: string | null;
  school_name: string | null;
  status: string;
  updated_at: string;
};

export default async function AdminExamPrepPassagesPage() {
  if (!isExamPrepEnabled()) redirect("/admin");
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== "admin" || !profile.academy_id) {
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
  const bySet = new Map<string, PassageListItem[]>();
  const orphans: PassageListItem[] = [];
  for (const p of passageList) {
    const item: PassageListItem = {
      id: p.id,
      title: p.title,
      status: p.status,
      passage_number: p.passage_number,
      exam_range: p.exam_range,
      updated_at: p.updated_at,
    };
    if (p.set_id) {
      const list = bySet.get(p.set_id) ?? [];
      list.push(item);
      bySet.set(p.set_id, list);
    } else {
      orphans.push(item);
    }
  }

  const setItems: PassageSetListItem[] = setList.map((set) => ({
    ...set,
    passages: bySet.get(set.id) ?? [],
  }));

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
      <PassageListClient
        basePath={BASE}
        sets={setItems}
        orphans={orphans}
      />
    </div>
  );
}
