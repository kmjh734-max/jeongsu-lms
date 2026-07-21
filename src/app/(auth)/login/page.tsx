import { Suspense } from "react";
import { cookies, headers } from "next/headers";
import type { Metadata } from "next";
import { BrandLogo } from "@/components/branding/BrandLogo";
import { LoginForm } from "@/components/auth/LoginForm";
import { LoginHero } from "@/components/auth/LoginHero";
import { LOGIN_TAGLINE, SITE_NAME } from "@/lib/branding";
import { getActiveAcademyBySlug } from "@/lib/tenant/academy-branding";
import {
  ACADEMY_COOKIE,
  resolveAcademySlug,
} from "@/lib/tenant/resolve-login-academy";

interface PageProps {
  searchParams: Promise<{ inactive?: string; academy?: string }>;
}

export async function generateMetadata({
  searchParams,
}: PageProps): Promise<Metadata> {
  const sp = await searchParams;
  const headerList = await headers();
  const cookieStore = await cookies();
  const slug = resolveAcademySlug({
    queryAcademy: sp.academy,
    host: headerList.get("host"),
    cookieAcademy: cookieStore.get(ACADEMY_COOKIE)?.value,
  });
  const academy = slug ? await getActiveAcademyBySlug(slug) : null;
  if (academy) {
    return {
      title: `${academy.name} 로그인`,
      description: `${academy.name} 온라인 학습관 · ${SITE_NAME}`,
    };
  }
  return {
    title: `${SITE_NAME} 로그인`,
  };
}

export default async function LoginPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const { inactive, academy: academyParam } = sp;

  const headerList = await headers();
  const cookieStore = await cookies();
  const slug = resolveAcademySlug({
    queryAcademy: academyParam,
    host: headerList.get("host"),
    cookieAcademy: cookieStore.get(ACADEMY_COOKIE)?.value,
  });

  const academy = slug ? await getActiveAcademyBySlug(slug) : null;
  const academyMissing = Boolean(slug && !academy);
  const isTenant = Boolean(academy);

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 lg:flex-row">
      <div className="lg:hidden">
        <LoginHero compact academy={academy} />
      </div>
      <LoginHero academy={academy} />

      <main className="flex flex-1 flex-col items-center justify-center px-4 py-10 sm:px-8 lg:px-12">
        <div className="w-full max-w-[420px]">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_8px_30px_rgb(15_23_42/0.08)] sm:p-9">
            <div className="mb-8 text-center">
              <BrandLogo
                variant="login"
                showSiteName
                showAcademyLogo={isTenant ? Boolean(academy?.logoUrl) : false}
                logoSrc={isTenant ? academy?.logoUrl || null : undefined}
                displayName={isTenant ? academy!.name : SITE_NAME}
                className="mx-auto"
              />
              <p className="mt-4 text-sm font-medium text-brand-800">
                {isTenant
                  ? `${academy!.name} 온라인 학습관`
                  : LOGIN_TAGLINE}
              </p>
              <p className="mt-2 text-xs leading-relaxed text-slate-500">
                {isTenant
                  ? "영어학원의 모든 것을 하나로 · EngCore"
                  : "영어학원의 모든 것을 하나로"}
              </p>
              {academyMissing ? (
                <p className="mt-3 text-xs text-amber-700">
                  학원 코드 <span className="font-mono">{slug}</span>를 찾을 수
                  없습니다. 주소를 확인해 주세요.
                </p>
              ) : null}
            </div>
            <Suspense
              fallback={
                <p className="text-center text-sm text-slate-500">로딩 중…</p>
              }
            >
              <LoginForm
                expectedAcademyId={academy?.id ?? null}
                expectedAcademyName={academy?.name ?? null}
                initialError={
                  inactive
                    ? "비활성화된 계정입니다. 학원에 문의해 주세요."
                    : undefined
                }
              />
            </Suspense>
          </div>
          <p className="mt-6 text-center text-xs text-slate-400">
            {isTenant ? (
              <>
                {academy!.name}
                <span className="mx-1.5 text-slate-300">·</span>
                {SITE_NAME}
              </>
            ) : (
              SITE_NAME
            )}
          </p>
        </div>
      </main>
    </div>
  );
}
