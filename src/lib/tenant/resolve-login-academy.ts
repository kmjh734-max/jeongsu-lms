/** 로그인/랜딩 학원 컨텍스트 (?academy= · 서브도메인 · 쿠키) */

export const ACADEMY_COOKIE = "engcore_academy";
export const ACADEMY_COOKIE_MAX_AGE = 60 * 60 * 24 * 90; // 90일

const RESERVED_SUBDOMAINS = new Set([
  "www",
  "app",
  "api",
  "admin",
  "login",
  "engcore",
  "mail",
  "cdn",
  "static",
]);

/** apex hosts that own academy subdomains */
const APEX_HOSTS = [
  "engcore.co.kr",
  "engcore-lms.vercel.app",
  "jeongsu-lms.vercel.app",
];

export function normalizeAcademySlug(
  raw: string | null | undefined
): string | null {
  if (!raw) return null;
  const s = raw.trim().toLowerCase().replace(/[^a-z0-9-]/g, "");
  if (!s || s.length > 64) return null;
  if (RESERVED_SUBDOMAINS.has(s)) return null;
  return s;
}

/**
 * born.engcore.co.kr → born
 * www.engcore.co.kr / engcore.co.kr → null
 * born.localhost → born (로컬 개발)
 */
export function academySlugFromHost(hostHeader: string | null): string | null {
  if (!hostHeader) return null;
  const hostname = hostHeader.split(":")[0]?.toLowerCase() ?? "";
  if (!hostname) return null;

  if (hostname.endsWith(".localhost")) {
    const sub = hostname.slice(0, -".localhost".length);
    if (!sub || sub.includes(".")) return null;
    return normalizeAcademySlug(sub);
  }

  for (const apex of APEX_HOSTS) {
    if (hostname === apex || hostname === `www.${apex}`) return null;
    const suffix = `.${apex}`;
    if (hostname.endsWith(suffix)) {
      const sub = hostname.slice(0, -suffix.length);
      if (!sub || sub.includes(".")) return null;
      return normalizeAcademySlug(sub);
    }
  }

  return null;
}

export function resolveAcademySlug(input: {
  queryAcademy?: string | null;
  host?: string | null;
  cookieAcademy?: string | null;
}): string | null {
  return (
    normalizeAcademySlug(input.queryAcademy) ||
    academySlugFromHost(input.host ?? null) ||
    normalizeAcademySlug(input.cookieAcademy)
  );
}

/** 학원 전용 로그인 URL (쿼리 방식 — DNS 없이도 동작) */
export function academyLoginPath(slug: string): string {
  const s = normalizeAcademySlug(slug);
  return s ? `/login?academy=${encodeURIComponent(s)}` : "/login";
}

export function academyLoginAbsoluteUrl(
  slug: string,
  siteUrl: string = process.env.NEXT_PUBLIC_SITE_URL || "https://engcore.co.kr"
): string {
  const base = siteUrl.replace(/\/$/, "");
  const s = normalizeAcademySlug(slug);
  return s ? `${base}/login?academy=${encodeURIComponent(s)}` : `${base}/login`;
}
