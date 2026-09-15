import {
  createServerClient,
  type CookieOptions,
} from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import {
  applyKeepLoginToCookieOptions,
  isKeepLoginOff,
  KEEP_LOGIN_COOKIE,
} from "@/lib/auth/keep-login";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(
          cookiesToSet: {
            name: string;
            value: string;
            options?: CookieOptions;
          }[]
        ) {
          // 로그인 유지를 끄면 인증 쿠키를 세션 쿠키로 (브라우저를 닫으면 로그아웃)
          const keepLoginOff = isKeepLoginOff(
            request.cookies.get(KEEP_LOGIN_COOKIE)?.value
          );
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(
              name,
              value,
              applyKeepLoginToCookieOptions(options, keepLoginOff)
            )
          );
        },
      },
    }
  );

  // 토큰이 비대칭 서명(ES256)이라 인증 서버에 묻지 않고 여기서 바로 검증한다.
  // (만료된 토큰은 getClaims 가 getSession 으로 새로 받아 쿠키를 갱신한다)
  const { data: claimsData } = await supabase.auth.getClaims();
  const claims = claimsData?.claims;
  const user = claims?.sub
    ? { id: claims.sub, email: typeof claims.email === "string" ? claims.email : undefined }
    : null;

  return { supabase, user, supabaseResponse };
}
