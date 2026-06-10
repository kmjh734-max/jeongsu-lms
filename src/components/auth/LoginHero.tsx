import Image from "next/image";
import { BrandLogo } from "@/components/branding/BrandLogo";
import {
  ACADEMY_MOTTO,
  DIRECTOR_CAPTION,
  DIRECTOR_IMAGE_SRC,
  LOGIN_TAGLINE,
  SITE_NAME,
} from "@/lib/branding";

interface LoginHeroProps {
  compact?: boolean;
}

function DirectorPortrait({ className = "" }: { className?: string }) {
  if (!DIRECTOR_IMAGE_SRC) return null;

  return (
    <div className={`flex flex-col items-center ${className}`.trim()}>
      <div className="relative h-36 w-36 overflow-hidden rounded-full border-4 border-white/20 shadow-xl sm:h-44 sm:w-44">
        <Image
          src={DIRECTOR_IMAGE_SRC}
          alt=""
          fill
          className="object-cover object-top"
          sizes="(max-width: 640px) 144px, 176px"
          priority
        />
      </div>
      {DIRECTOR_CAPTION ? (
        <p className="mt-4 text-sm font-medium text-slate-300">{DIRECTOR_CAPTION}</p>
      ) : null}
      {ACADEMY_MOTTO ? (
        <p className="mt-3 text-xs leading-relaxed text-brand-100/90">{ACADEMY_MOTTO}</p>
      ) : null}
    </div>
  );
}

export function LoginHero({ compact = false }: LoginHeroProps) {
  if (compact) {
    return (
      <div className="bg-gradient-to-br from-brand-900 via-slate-950 to-black px-6 py-8 text-white">
        <BrandLogo variant="login" showSiteName={false} onDark className="mx-auto" />
        <DirectorPortrait className="mt-6" />
        <p className="mt-4 text-center text-xs font-medium tracking-wide text-brand-100/90">
          {SITE_NAME}
        </p>
        <p className="mt-2 text-center text-sm leading-relaxed text-slate-300">
          {LOGIN_TAGLINE}
        </p>
      </div>
    );
  }

  return (
    <aside className="relative hidden min-h-screen w-[44%] max-w-[560px] flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-brand-900 via-[#0f172a] to-black px-10 py-12 lg:flex">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_30%_30%,rgba(227,6,19,0.2),transparent_60%)]"
        aria-hidden
      />
      <div className="relative z-10 flex w-full max-w-sm flex-col items-center text-center">
        <BrandLogo variant="login" showSiteName={false} onDark />
        <DirectorPortrait className="mt-8" />
        <p className="mt-6 text-lg font-semibold text-white">{SITE_NAME}</p>
        <p className="mt-3 text-sm leading-relaxed text-slate-300">
          {LOGIN_TAGLINE}
        </p>
      </div>
    </aside>
  );
}
