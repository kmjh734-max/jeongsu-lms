"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { loadOwnAnalysis, requireExamStaff } from "@/lib/exam-analysis/access";
import { refreshMaterialMatches } from "@/lib/exam-analysis/match-materials";

export async function matchAction(id: string, enabled: boolean, uploads?: Array<{ name: string; text: string }>) {
  const auth = await requireExamStaff();
  if ("error" in auth) {
    throw new Error("Unauthorized");
  }
  if (!(await loadOwnAnalysis(id, auth.profile.academy_id))) {
    throw new Error("분석을 찾을 수 없어요.");
  }
  
  const matched = await refreshMaterialMatches(
    createAdminClient(),
    id,
    auth.profile.academy_id,
    enabled,
    uploads
  );
  
  return { ok: true, matched };
}
