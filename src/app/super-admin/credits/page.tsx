import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { PageHeader } from "@/components/ui/PageHeader";
import { SuperAdminCreditsClient } from "@/components/super-admin/SuperAdminCreditsClient";

export default async function SuperAdminCreditsPage() {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== "super_admin") {
    redirect("/login");
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <PageHeader
        title="크레딧 관리"
        description="학원별 잔액 지급·차감과 기능 단가를 관리합니다."
        action={
          <Link
            href="/super-admin"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
          >
            ← 학원 목록
          </Link>
        }
      />
      <SuperAdminCreditsClient />
    </div>
  );
}
