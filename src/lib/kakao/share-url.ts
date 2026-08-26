import { SITE_URL } from "@/lib/branding";

/** 배포·카카오 공유용 HTTPS URL 정규화 */
export function normalizeShareUrl(url: string): string {
  try {
    const u = new URL(url);
    if (u.hostname !== "localhost" && u.hostname !== "127.0.0.1") {
      u.protocol = "https:";
    }
    return u.href;
  } catch {
    return url;
  }
}

export function getPublicSiteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  return (fromEnv || SITE_URL).replace(/\/$/, "");
}

export function getExpectedShareHostname(): string | null {
  try {
    return new URL(getPublicSiteUrl()).hostname;
  } catch {
    return null;
  }
}

/** www.engcore.co.kr ↔ engcore.co.kr 처럼 apex/www는 동일 사이트로 본다 */
export function hostnamesMatchForShare(a: string, b: string): boolean {
  const norm = (h: string) => h.toLowerCase().replace(/^www\./, "");
  return norm(a) === norm(b);
}

/**
 * 공유 링크를 NEXT_PUBLIC_SITE_URL 기준으로 맞춘다.
 * (브라우저가 www로 열려 있어도 카카오·리포트와 동일 도메인 사용)
 */
export function toPublicShareUrl(pathOrUrl: string): string {
  const base = getPublicSiteUrl();
  try {
    if (/^https?:\/\//i.test(pathOrUrl)) {
      const u = new URL(pathOrUrl);
      const expected = getExpectedShareHostname();
      if (expected && hostnamesMatchForShare(u.hostname, expected)) {
        const pub = new URL(base);
        pub.pathname = u.pathname;
        pub.search = u.search;
        pub.hash = u.hash;
        return normalizeShareUrl(pub.href);
      }
      return normalizeShareUrl(u.href);
    }
  } catch {
    /* fall through */
  }
  const path = pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`;
  return normalizeShareUrl(`${base}${path}`);
}

export type ShareUrlValidation = {
  ok: boolean;
  warning?: string;
};

/** 카카오톡에서 열 수 있는 공개 링크인지 점검 */
export function validateShareUrlForKakao(url: string): ShareUrlValidation {
  const siteUrl = getPublicSiteUrl();

  try {
    const u = new URL(url);
    if (u.hostname === "localhost" || u.hostname === "127.0.0.1") {
      return {
        ok: false,
        warning: `localhost 링크는 카카오톡에서 열리지 않습니다. 배포 사이트(${siteUrl})에서 링크를 다시 생성해 주세요.`,
      };
    }
    if (u.protocol !== "https:") {
      return {
        ok: false,
        warning: "카카오톡 공유 링크는 HTTPS여야 합니다.",
      };
    }
    const expected = getExpectedShareHostname();
    if (expected && !hostnamesMatchForShare(u.hostname, expected)) {
      return {
        ok: false,
        warning: `링크 도메인(${u.hostname})이 NEXT_PUBLIC_SITE_URL(${expected})과 다릅니다. Kakao 제품 링크·플랫폼 Web 도메인을 동일하게 맞춰 주세요.`,
      };
    }
    return { ok: true };
  } catch {
    return { ok: false, warning: "공유 URL 형식이 올바르지 않습니다." };
  }
}

export const KAKAO_PRODUCT_LINK_HINT = `카카오톡 공유(4019 등) 오류 시: Kakao Developers → 앱 → 플랫폼 → Web 사이트 도메인 + 제품 링크 관리 → 웹에 ${getPublicSiteUrl()} 을 등록하고, JavaScript 키를 NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY 로 설정하세요.`;
