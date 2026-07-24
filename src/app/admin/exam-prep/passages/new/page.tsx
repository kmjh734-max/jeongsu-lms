import Link from "next/link";
import { redirect } from "next/navigation";
import { ExamPrepStaffNav } from "@/components/exam-prep/ExamPrepStaffNav";
import { PassageBulkGrid } from "@/components/exam-prep/PassageBulkGrid";
import { PassageForm } from "@/components/exam-prep/PassageForm";
import { PageHeader } from "@/components/ui/PageHeader";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { isExamPrepEnabled } from "@/lib/academy-features";

const BASE = "/admin/exam-prep";

interface PageProps {
  searchParams: Promise<{ mode?: string }>;
}

export default async function AdminExamPrepPassageNewPage({
  searchParams,
}: PageProps) {
  if (!isExamPrepEnabled()) redirect("/admin");
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== "admin") redirect("/login");

  const sp = await searchParams;
  const single = sp.mode === "single";

  return (
    <div className="space-y-4">
      <PageHeader
        title={single ? "지문 상세 등록" : "지문 일괄 추가"}
        description={
          single
            ? "원문과 메타정보를 자세히 입력합니다."
            : "엑셀처럼 여러 지문을 빠르게 입력한 뒤 한 번에 저장합니다."
        }
        action={
          single ? (
            <Link
              href={`${BASE}/passages/new`}
              className="text-sm font-medium text-brand-700 hover:underline"
            >
              ← 일괄 입력
            </Link>
          ) : undefined
        }
      />
      <ExamPrepStaffNav basePath={BASE} current="passages" />
      {single ? (
        <PassageForm mode="create" basePath={BASE} />
      ) : (
        <PassageBulkGrid basePath={BASE} />
      )}
    </div>
  );
}
