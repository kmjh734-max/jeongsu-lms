import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { PageHeader } from "@/components/ui/PageHeader";
import { SignOutButton } from "@/components/layout/SignOutButton";
import { ContentReportsClient } from "@/components/super-admin/ContentReportsClient";

export default async function SuperAdminReportsPage() {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== "super_admin") redirect("/login");
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <PageHeader
        title="문항 오류 신고"
        description="학생·선생님이 듣기 문항과 단어에서 '이상해요'를 누른 것이 모여요."
        action={
          <div className="flex flex-wrap gap-2">
            <Link
              href="/super-admin"
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
            >
              ← 학원 목록
            </Link>
            <SignOutButton />
          </div>
        }
      />
      <ContentReportsClient />
    </div>
  );
}
