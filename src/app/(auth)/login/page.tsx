import { Suspense } from "react";
import { cookies, headers } from "next/headers";
import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/LoginForm";
import { LoginHero, LoginHeroCompact } from "@/components/auth/LoginHero";
import { SITE_NAME } from "@/lib/branding";
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

function AcademyMark({ name, logoUrl }: { name: string; logoUrl: string | null }) {
  if (logoUrl) {
    return (
      <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-[10px] border border-slate-200 bg-white">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logoUrl} alt="" className="h-full w-full object-contain p-1" />
      </span>
    );
  }
  return (
    <span
      aria-hidden
      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px] bg-side text-lg font-extrabold text-white"
    >
      {name.trim().charAt(0) || "E"}
    </span>
  );
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
  const displayName = academy ? academy.name : SITE_NAME;

  return (
    <div className="flex min-h-screen flex-col bg-white lg:flex-row">
      <LoginHero />
      <LoginHeroCompact />

      <main className="relative -mt-3.5 flex flex-1 justify-center rounded-t-2xl bg-white px-6 pb-10 pt-[26px] lg:mt-0 lg:items-center lg:rounded-none lg:px-12 lg:py-12">
        <div className="flex w-full max-w-[380px] flex-col gap-4 lg:gap-5">
          <div className="flex items-center gap-3">
            <AcademyMark
              name={displayName}
              logoUrl={academy?.logoUrl ? academy.logoUrl : null}
            />
            <div className="flex min-w-0 flex-col gap-0.5">
              <span className="truncate text-lg font-bold text-slate-900">
                {displayName}
              </span>
              <span className="text-xs text-slate-500">
                {academy ? `${SITE_NAME}로 운영하는 학원이에요` : "영어교육의 중심"}
              </span>
            </div>
          </div>

          <div className="mt-1 flex flex-col gap-1.5 lg:mt-3">
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 lg:text-[28px]">
              로그인
            </h1>
            <p className="text-sm text-slate-500">
              학생·선생님·원장님 모두 여기서 들어와요.
            </p>
            {academyMissing ? (
              <p className="mt-1 rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-700">
                학원 주소 <span className="font-mono">{slug}</span>를 찾지 못했어요.
                주소를 다시 확인해 주세요.
              </p>
            ) : null}
          </div>

          <Suspense
            fallback={<p className="text-sm text-slate-500">불러오는 중…</p>}
          >
            <LoginForm
              expectedAcademyId={academy?.id ?? null}
              expectedAcademyName={academy?.name ?? null}
              initialError={
                inactive
                  ? "쉬는 중인 계정이에요. 학원에 문의해 주세요."
                  : undefined
              }
            />
          </Suspense>
        </div>
      </main>
    </div>
  );
}
