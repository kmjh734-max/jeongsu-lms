"use client";

import { createClient } from "@/lib/supabase/client";
import { clearKeepLoginCookieClient } from "@/lib/auth/keep-login";
import { clearRoleCookieClient } from "@/lib/auth/role-cookie";
import { Button } from "@/components/ui/Button";

export function SignOutButton() {
  async function handleSignOut() {
    clearRoleCookieClient();
    const supabase = createClient();
    await supabase.auth.signOut();
    clearKeepLoginCookieClient();
    window.location.assign("/login");
  }

  return (
    <Button type="button" variant="secondary" size="sm" onClick={handleSignOut}>
      로그아웃
    </Button>
  );
}
