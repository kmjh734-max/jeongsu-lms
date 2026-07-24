import { cache } from "react";
import { headers } from "next/headers";
import { FORWARDED_USER_ID_HEADER } from "@/lib/auth/forwarded-user";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/types/database";

export const getCurrentProfile = cache(async (): Promise<Profile | null> => {
  const supabase = await createClient();

  const headerList = await headers();
  let userId = headerList.get(FORWARDED_USER_ID_HEADER);

  if (!userId) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;
    userId = user.id;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  return profile as Profile | null;
});
