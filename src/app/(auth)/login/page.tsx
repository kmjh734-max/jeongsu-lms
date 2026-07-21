import { Suspense } from "react";
import { BrandLogo } from "@/components/branding/BrandLogo";
import { LoginForm } from "@/components/auth/LoginForm";
import { LoginHero } from "@/components/auth/LoginHero";
import { LOGIN_TAGLINE, SITE_NAME } from "@/lib/branding";

interface PageProps {
  searchParams: Promise<{ inactive?: string }>;
}

export default async function LoginPage({ searchParams }: PageProps) {
  const { inactive } = await searchParams;

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 lg:flex-row">
      <div className="lg:hidden">
        <LoginHero compact />
      </div>
      <LoginHero />

      <main className="flex flex-1 flex-col items-center justify-center px-4 py-10 sm:px-8 lg:px-12">
        <div className="w-full max-w-[420px]">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_8px_30px_rgb(15_23_42/0.08)] sm:p-9">
            <div className="mb-8 text-center">
              <BrandLogo
                variant="login"
                showSiteName
                showAcademyLogo={false}
                className="mx-auto"
              />
              <p className="mt-4 text-sm font-medium text-brand-800">
                {LOGIN_TAGLINE}
              </p>
              <p className="mt-2 text-xs leading-relaxed text-slate-500">
                영어학원의 모든 것을 하나로
              </p>
            </div>
            <Suspense fallback={<p className="text-center text-sm text-slate-500">로딩 중…</p>}>
              <LoginForm
                initialError={
                  inactive
                    ? "비활성화된 계정입니다. 학원에 문의해 주세요."
                    : undefined
                }
              />
            </Suspense>
          </div>
          <p className="mt-6 text-center text-xs text-slate-400">{SITE_NAME}</p>
        </div>
      </main>
    </div>
  );
}
