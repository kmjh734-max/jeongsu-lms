import { cache } from "react";
import {
  createServerClient,
  type CookieOptions,
} from "@supabase/ssr";
import { cookies } from "next/headers";
import {
  applyKeepLoginToCookieOptions,
  isKeepLoginOff,
  KEEP_LOGIN_COOKIE,
} from "@/lib/auth/keep-login";

/** 요청당 1개 클라이언트 (cookies() + 인스턴스 재사용) */
export const createClient = cache(async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(
          cookiesToSet: {
            name: string;
            value: string;
            options?: CookieOptions;
          }[]
        ) {
          // 로그인 유지를 끄면 인증 쿠키를 세션 쿠키로 (브라우저를 닫으면 로그아웃)
          const keepLoginOff = isKeepLoginOff(cookieStore.get(KEEP_LOGIN_COOKIE)?.value);
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(
                name,
                value,
                applyKeepLoginToCookieOptions(options, keepLoginOff)
              )
            );
          } catch {
            // Called from Server Component; middleware will refresh session.
          }
        },
      },
    }
  );
});
