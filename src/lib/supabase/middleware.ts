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

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { supabase, user, supabaseResponse };
}
