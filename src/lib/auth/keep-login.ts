import type { CookieOptions } from "@supabase/ssr";

/**
 * 「로그인 유지」 선택 — "0"이면 브라우저를 닫을 때 로그아웃된다.
 * 이 쿠키 자체도 세션 쿠키라서 브라우저를 닫으면 함께 사라진다.
 * 없거나 "0"이 아니면 예전처럼 로그인이 유지된다.
 */
export const KEEP_LOGIN_COOKIE = "ec_keep_login";

export function isKeepLoginOff(value: string | undefined | null): boolean {
  return value === "0";
}

/** 지우는 쿠키(maxAge 0 등)인지 */
function isRemoval(options: CookieOptions | undefined): boolean {
  if (!options) return false;
  if (typeof options.maxAge === "number" && options.maxAge <= 0) return true;
  if (options.expires instanceof Date && options.expires.getTime() <= Date.now()) return true;
  return false;
}

/**
 * 로그인 유지를 끈 경우, 인증 쿠키를 세션 쿠키로 바꾼다(Max-Age·Expires 제거).
 * @supabase/ssr은 cookieOptions를 합친 뒤 maxAge를 400일로 덮어쓰므로
 * cookieOptions로는 뺄 수 없고, setAll에서 직접 지워야 한다.
 * 쿠키를 지우는 호출(maxAge 0)은 그대로 둔다.
 */
export function applyKeepLoginToCookieOptions(
  options: CookieOptions | undefined,
  keepLoginOff: boolean
): CookieOptions | undefined {
  if (!keepLoginOff || !options || isRemoval(options)) return options;
  const next: CookieOptions = { ...options };
  delete next.maxAge;
  delete next.expires;
  return next;
}

/* ── 브라우저 ── */

function secureFlag(): string {
  return typeof window !== "undefined" && window.location.protocol === "https:"
    ? "; Secure"
    : "";
}

export function readKeepLoginOffClient(): boolean {
  if (typeof document === "undefined") return false;
  const hit = document.cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${KEEP_LOGIN_COOKIE}=`));
  return isKeepLoginOff(hit?.slice(KEEP_LOGIN_COOKIE.length + 1));
}

/** 로그인하기 전에 불러서, 이어서 쓰이는 인증 쿠키에 선택이 반영되게 한다. */
export function setKeepLoginCookieClient(keep: boolean) {
  if (typeof document === "undefined") return;
  if (keep) {
    clearKeepLoginCookieClient();
    return;
  }
  // Max-Age 없음 → 세션 쿠키
  document.cookie = `${KEEP_LOGIN_COOKIE}=0; Path=/; SameSite=Lax${secureFlag()}`;
}

export function clearKeepLoginCookieClient() {
  if (typeof document === "undefined") return;
  document.cookie = `${KEEP_LOGIN_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`;
}
