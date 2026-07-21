import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { PageHeader } from "@/components/ui/PageHeader";

export default async function SuperAdminHomePage() {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== "super_admin") {
    redirect("/login");
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <PageHeader
        title="EngCore Admin"
        description="전체 학원 운영 콘솔입니다. 학원 목록·생성·중지 기능은 다음 단계에서 연결됩니다."
      />
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-700">
          로그인: <span className="font-medium">{profile.email}</span>
        </p>
        <p className="mt-2 text-sm text-slate-600">
          역할: <span className="font-semibold text-brand-800">super_admin</span>
        </p>
        <p className="mt-4 text-sm text-slate-500">
          DB에 academies / academy_id가 적용되었습니다. 학원 CRUD UI는 이어서 구현합니다.
        </p>
      </div>
    </div>
  );
}
