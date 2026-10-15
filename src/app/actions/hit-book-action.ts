"use server";

import { getCurrentProfile } from "@/lib/auth/get-profile";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAcademyFeatureOn } from "@/lib/academies/features";

/** 이 학원에 적중 자료집이 열려 있는지 (정수학원 먼저 — 2026-10-15) */
export async function hitBookOpenAction(): Promise<boolean> {
  const profile = await getCurrentProfile();
  if (!profile?.academy_id || (profile.role !== "admin" && profile.role !== "teacher")) return false;
  return isAcademyFeatureOn(createAdminClient(), profile.academy_id, "exam_hit_book");
}
