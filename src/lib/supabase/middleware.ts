import {
  createServerClient,
  type CookieOptions,
} from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { FORWARDED_USER_ID_HEADER } from "@/lib/auth/forwarded-user";

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
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // RSC가 getUser를 한 번 더 치지 않도록, 검증된 user id만 요청 헤더로 전달
  const requestHeaders = new Headers(request.headers);
  requestHeaders.delete(FORWARDED_USER_ID_HEADER);
  if (user?.id) {
    requestHeaders.set(FORWARDED_USER_ID_HEADER, user.id);
  }

  const withUserHeader = NextResponse.next({
    request: { headers: requestHeaders },
  });
  supabaseResponse.cookies.getAll().forEach((cookie) => {
    withUserHeader.cookies.set(cookie);
  });

  return { supabase, user, supabaseResponse: withUserHeader };
}
