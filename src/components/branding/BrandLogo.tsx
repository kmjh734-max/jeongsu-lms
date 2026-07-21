import Image from "next/image";
import { LOGO_SRC, SITE_NAME, SITE_NAME_FULL } from "@/lib/branding";

type BrandLogoVariant = "login" | "header";

interface BrandLogoProps {
  variant?: BrandLogoVariant;
  showSiteName?: boolean;
  /** 어두운 배경: 흰 카드 안에 컬러 로고 표시 */
  onDark?: boolean;
  /** 학원 로고 이미지 표시 (기본: 로그인만 숨기고 EngCore 워드마크 우선) */
  showAcademyLogo?: boolean;
  className?: string;
}

const variantStyles: Record<
  BrandLogoVariant,
  { image: string; name: string; wrap: string; wordmark: string }
> = {
  login: {
    wrap: "flex flex-col items-center gap-2",
    image: "h-10 w-auto max-w-[160px]",
    name: "text-lg font-semibold text-brand-900",
    wordmark:
      "text-3xl font-black tracking-tight text-brand-900 sm:text-4xl",
  },
  header: {
    wrap: "flex min-w-0 items-center gap-2.5",
    image: "h-7 w-auto max-w-[100px] sm:max-w-[120px]",
    name: "truncate text-sm font-semibold text-slate-900 sm:text-[15px]",
    wordmark: "truncate text-base font-black tracking-tight text-brand-800",
  },
};

export function BrandLogo({
  variant = "header",
  showSiteName = true,
  onDark = false,
  showAcademyLogo = variant === "header",
  className = "",
}: BrandLogoProps) {
  const styles = variantStyles[variant];

  const wordmark = showSiteName ? (
    <span
      className={
        onDark
          ? "text-2xl font-black tracking-tight text-brand-900 sm:text-3xl"
          : styles.wordmark
      }
    >
      {SITE_NAME}
    </span>
  ) : null;

  const academyLogo = showAcademyLogo ? (
    <Image
      src={LOGO_SRC}
      alt={SITE_NAME_FULL}
      width={200}
      height={56}
      priority={variant === "login"}
      unoptimized={variant === "login"}
      className={`object-contain object-left ${styles.image}`}
      sizes="200px"
    />
  ) : null;

  const content =
    variant === "login" ? (
      <>
        {wordmark}
        {academyLogo}
      </>
    ) : (
      <>
        {academyLogo}
        {wordmark}
      </>
    );

  if (onDark) {
    return (
      <div
        className={`inline-flex rounded-xl bg-white px-5 py-4 shadow-[0_8px_24px_rgb(0_0_0/0.25)] ${className}`.trim()}
      >
        <div className={styles.wrap}>{content}</div>
      </div>
    );
  }

  return (
    <div className={`${styles.wrap} ${className}`.trim()}>{content}</div>
  );
}
