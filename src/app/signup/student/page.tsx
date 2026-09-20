import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PublicHeader } from "@/components/site/PublicHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { getDashboardPathForRole } from "@/lib/auth/roles";
import { StudentSignupForm } from "./StudentSignupForm";

export const metadata: Metadata = { title: "학생 가입 | EngCore" };

export default async function StudentSignupPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>;
}) {
  const [profile, sp] = await Promise.all([getCurrentProfile(), searchParams]);
  if (profile) redirect(getDashboardPathForRole(profile.role));

  return (
    <div className="min-h-screen bg-slate-50">
      <PublicHeader />
      <main className="mx-auto max-w-lg px-4 py-10 sm:py-14">
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">학생 가입</h1>
        <p className="mt-1.5 text-sm leading-6 text-slate-500">
          다니는 학원에서 받은 가입 코드로 가입해요. 휴대전화 번호가 아이디가 됩니다. 가입하면 바로 쓸 수 있어요.
        </p>
        <div className="mt-6">
          <StudentSignupForm initialCode={sp.code ?? ""} />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
