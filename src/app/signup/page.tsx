import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PublicHeader } from "@/components/site/PublicHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { getDashboardPathForRole } from "@/lib/auth/roles";
import { SignupForm } from "./SignupForm";

export const metadata: Metadata = { title: "회원가입 | EngCore" };

export default async function SignupPage() {
  const profile = await getCurrentProfile();
  if (profile) redirect(getDashboardPathForRole(profile.role));
  return (
    <div className="min-h-screen bg-slate-50">
      <PublicHeader />
      <main className="mx-auto max-w-lg px-4 py-10 sm:py-14">
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">회원가입</h1>
        <p className="mt-1.5 text-sm leading-6 text-slate-500">
          학원·공부방·교습소는 물론 개인 선생님도 가입할 수 있어요. 가입하면 2,000크레딧을 무료로 드립니다. 학생 계정은 가입 뒤 관리 화면에서 만듭니다.
        </p>
        <div className="mt-6">
          <SignupForm />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
