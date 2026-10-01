"use client";

import { createClient } from "@/lib/supabase/client";
import { clearKeepLoginCookieClient } from "@/lib/auth/keep-login";
import { clearRoleCookieClient } from "@/lib/auth/role-cookie";
import { clearAcademyCookieClient } from "@/lib/tenant/academy-cookie-client";
import { Button } from "@/components/ui/Button";

export function SignOutButton() {
  async function handleSignOut() {
    clearRoleCookieClient();
    const supabase = createClient();
    await supabase.auth.signOut();
    clearKeepLoginCookieClient();
    clearAcademyCookieClient();
    // 처음 메인 화면으로 보낸다. 학원 주소로 들어와 있으면 거기서 그 학원 로그인으로 간다.
    window.location.assign("/");
  }

  return (
    <Button type="button" variant="secondary" size="sm" onClick={handleSignOut}>
      로그아웃
    </Button>
  );
}
