import { createBrowserClient, type CookieOptions } from "@supabase/ssr";
import {
  applyKeepLoginToCookieOptions,
  readKeepLoginOffClient,
} from "@/lib/auth/keep-login";

function readAllCookies(): { name: string; value: string }[] {
  if (typeof document === "undefined" || !document.cookie) return [];
  return document.cookie.split(";").flatMap((part) => {
    const eq = part.indexOf("=");
    if (eq === -1) return [];
    const name = part.slice(0, eq).trim();
    if (!name) return [];
    let value = part.slice(eq + 1).trim();
    if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
    if (value.includes("%")) {
      try {
        value = decodeURIComponent(value);
      } catch {
        /* 그대로 둔다 */
      }
    }
    return [{ name, value }];
  });
}

/** @supabase/ssr 기본 동작(cookie 패키지의 serialize)과 같은 모양으로 쓴다 */
function serializeCookie(name: string, value: string, options: CookieOptions = {}): string {
  let str = `${name}=${encodeURIComponent(value)}`;
  if (options.maxAge !== undefined) str += `; Max-Age=${Math.floor(options.maxAge)}`;
  if (options.domain) str += `; Domain=${options.domain}`;
  if (options.path) str += `; Path=${options.path}`;
  if (options.expires) str += `; Expires=${options.expires.toUTCString()}`;
  if (options.httpOnly) str += "; HttpOnly";
  if (options.secure) str += "; Secure";
  if (options.partitioned) str += "; Partitioned";
  if (options.priority) {
    const p = String(options.priority).toLowerCase();
    str += `; Priority=${p.charAt(0).toUpperCase()}${p.slice(1)}`;
  }
  if (options.sameSite) {
    const s = options.sameSite === true ? "strict" : String(options.sameSite).toLowerCase();
    str += `; SameSite=${s.charAt(0).toUpperCase()}${s.slice(1)}`;
  }
  return str;
}

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return readAllCookies();
        },
        setAll(
          cookiesToSet: { name: string; value: string; options: CookieOptions }[]
        ) {
          if (typeof document === "undefined") return;
          // 쓸 때마다 확인 — 로그인 직전에 바꾼 선택도 바로 반영된다
          const keepLoginOff = readKeepLoginOffClient();
          cookiesToSet.forEach(({ name, value, options }) => {
            document.cookie = serializeCookie(
              name,
              value,
              applyKeepLoginToCookieOptions(options, keepLoginOff)
            );
          });
        },
      },
    }
  );
}
