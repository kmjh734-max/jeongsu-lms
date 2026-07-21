import { BrandLogo } from "@/components/branding/BrandLogo";
import {
  DIRECTOR_CAPTION,
  DIRECTOR_IMAGE_SRC,
  LOGIN_TAGLINE,
  SITE_MEANING,
  SITE_NAME,
  SITE_SLOGANS,
} from "@/lib/branding";
import type { AcademyBranding } from "@/lib/tenant/academy-branding";
import Image from "next/image";

interface LoginHeroProps {
  compact?: boolean;
  academy?: AcademyBranding | null;
}

function DirectorPortrait({ className = "" }: { className?: string }) {
  if (!DIRECTOR_IMAGE_SRC) return null;

  return (
    <div className={`flex flex-col items-center ${className}`.trim()}>
      <div className="relative h-28 w-28 overflow-hidden rounded-full border-4 border-white/20 shadow-xl sm:h-36 sm:w-36">
        <Image
          src={DIRECTOR_IMAGE_SRC}
          alt=""
          fill
          className="object-cover object-top"
          sizes="(max-width: 640px) 112px, 144px"
          priority
        />
      </div>
      {DIRECTOR_CAPTION ? (
        <p className="mt-3 text-sm font-medium text-slate-300">
          {DIRECTOR_CAPTION}
        </p>
      ) : null}
    </div>
  );
}

function SloganList({ className = "" }: { className?: string }) {
  return (
    <ul className={`space-y-1.5 text-sm text-slate-300 ${className}`.trim()}>
      {SITE_SLOGANS.map((s) => (
        <li key={s}>{s}</li>
      ))}
    </ul>
  );
}

export function LoginHero({ compact = false, academy = null }: LoginHeroProps) {
  const isTenant = Boolean(academy?.id && academy.name);
  const title = isTenant ? academy!.name : SITE_NAME;
  const tagline = isTenant
    ? `${academy!.name} 온라인 학습관`
    : LOGIN_TAGLINE;
  const logoSrc = isTenant ? academy!.logoUrl || null : null;
  const showLogo = isTenant ? Boolean(logoSrc) : false;

  if (compact) {
    return (
      <div className="bg-gradient-to-br from-brand-900 via-slate-950 to-black px-6 py-8 text-white">
        <BrandLogo
          variant="login"
          showSiteName
          showAcademyLogo={showLogo}
          logoSrc={logoSrc}
          displayName={isTenant ? title : SITE_NAME}
          onDark
          className="mx-auto"
        />
        <p className="mt-4 text-center text-sm font-medium text-brand-100">
          {tagline}
        </p>
        <p className="mt-2 text-center text-xs leading-relaxed text-slate-400">
          {isTenant ? SITE_NAME : SITE_MEANING}
        </p>
        {!isTenant ? <DirectorPortrait className="mt-6" /> : null}
      </div>
    );
  }

  return (
    <aside className="relative hidden min-h-screen w-[44%] max-w-[560px] flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-brand-900 via-[#0f172a] to-black px-10 py-12 lg:flex">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_30%_30%,rgba(37,99,235,0.35),transparent_55%)]"
        aria-hidden
      />
      <div className="relative z-10 flex w-full max-w-sm flex-col items-center text-center">
        <BrandLogo
          variant="login"
          showSiteName
          showAcademyLogo={showLogo}
          logoSrc={logoSrc}
          displayName={isTenant ? title : SITE_NAME}
          onDark
        />
        <p className="mt-5 text-lg font-semibold text-white">{tagline}</p>
        <p className="mt-2 text-xs leading-relaxed text-slate-400">
          {isTenant
            ? "영어학원의 모든 것을 하나로 · Powered by EngCore"
            : SITE_MEANING}
        </p>
        {!isTenant ? <SloganList className="mt-8 text-left" /> : null}
        {!isTenant ? <DirectorPortrait className="mt-10" /> : null}
        <p className="mt-6 text-[11px] tracking-wide text-slate-500">
          {SITE_NAME} Platform
        </p>
      </div>
    </aside>
  );
}
