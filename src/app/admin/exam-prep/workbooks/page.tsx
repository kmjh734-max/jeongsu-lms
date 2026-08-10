import Link from "next/link";
import { redirect } from "next/navigation";
import { ExamPrepStaffNav } from "@/components/exam-prep/ExamPrepStaffNav";
import {
  WorkbookListClient,
  type WorkbookListItem,
} from "@/components/exam-prep/WorkbookListClient";
import { PageHeader } from "@/components/ui/PageHeader";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { isExamPrepEnabled } from "@/lib/academy-features";
import { createClient } from "@/lib/supabase/server";

const BASE = "/admin/exam-prep";

type WorkbookRow = {
  id: string;
  title: string;
  status: string;
  preset_type: string | null;
  updated_at: string;
  exam_passages: { title: string } | { title: string }[] | null;
};

function passageTitleOf(
  passages: WorkbookRow["exam_passages"]
): string | null {
  if (!passages) return null;
  if (Array.isArray(passages)) return passages[0]?.title ?? null;
  return passages.title ?? null;
}

export default async function AdminExamPrepWorkbooksPage() {
  if (!isExamPrepEnabled()) redirect("/admin");
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== "admin" || !profile.academy_id) {
    redirect("/login");
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("exam_workbooks")
    .select(
      "id, title, status, preset_type, updated_at, exam_passages(title)"
    )
    .eq("academy_id", profile.academy_id)
    .order("updated_at", { ascending: false });

  const workbooks: WorkbookListItem[] = (
    (data ?? []) as unknown as WorkbookRow[]
  ).map((w) => ({
    id: w.id,
    title: w.title,
    status: w.status,
    preset_type: w.preset_type,
    updated_at: w.updated_at,
    passageTitle: passageTitleOf(w.exam_passages),
  }));

  return (
    <div>
      <PageHeader
        title="워크북 관리"
        description="프리셋으로 학습 단계를 만들고 문항을 검수·승인합니다."
        action={
          <Link
            href={`${BASE}/workbooks/new`}
            className="inline-flex h-10 items-center rounded-lg bg-brand-600 px-4 text-sm font-medium text-white hover:bg-brand-700"
          >
            워크북 생성
          </Link>
        }
      />
      <ExamPrepStaffNav basePath={BASE} current="workbooks" />
      <WorkbookListClient basePath={BASE} workbooks={workbooks} />
    </div>
  );
}
