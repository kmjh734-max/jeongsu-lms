/**
 * Toss Payments env (test ↔ live by swapping keys in Vercel / .env.local).
 * Never expose TOSS_SECRET_KEY to the client.
 */

export type TossEnvMode = "test" | "live" | "unset";

export function getTossEnvMode(): TossEnvMode {
  const raw = (process.env.TOSS_ENV || "").trim().toLowerCase();
  if (raw === "live" || raw === "production") return "live";
  if (raw === "test" || raw === "sandbox") return "test";
  if (process.env.TOSS_SECRET_KEY?.trim() || process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY?.trim()) {
    return "test";
  }
  return "unset";
}

export function getTossClientKey(): string | null {
  const key = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY?.trim();
  return key || null;
}

export function getTossSecretKey(): string | null {
  const key = process.env.TOSS_SECRET_KEY?.trim();
  return key || null;
}

export function getAppBaseUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_APP_URL?.trim()?.replace(/\/$/, "");
  if (fromEnv) return fromEnv;
  if (process.env.VERCEL_URL?.trim()) {
    return `https://${process.env.VERCEL_URL.trim().replace(/\/$/, "")}`;
  }
  return "http://localhost:3000";
}

export function assertTossServerConfigured(): {
  secretKey: string;
  mode: TossEnvMode;
} {
  const secretKey = getTossSecretKey();
  if (!secretKey) {
    throw new Error(
      "TOSS_SECRET_KEY가 설정되지 않았습니다. 토스페이먼츠 테스트 시크릿 키를 환경변수에 넣어 주세요."
    );
  }
  return { secretKey, mode: getTossEnvMode() };
}

/**
 * 테스트 키로 도는 동안에는 결제가 실제로 일어나지 않는데도 크레딧이 들어간다.
 * 그래서 테스트 결제창은 카드사 심사용 학원(TOSS_TEST_ACADEMIES, 쉼표로 여럿)에만 연다.
 * 실제 키(live)로 바꾸면 모든 학원에 열린다.
 */
export function isCheckoutOpenForAcademySlug(slug: string | null | undefined): boolean {
  const mode = getTossEnvMode();
  if (mode === "live") return true;
  if (mode !== "test" || !slug) return false;
  const allowed = (process.env.TOSS_TEST_ACADEMIES ?? "tosstest")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return allowed.includes(slug);
}
