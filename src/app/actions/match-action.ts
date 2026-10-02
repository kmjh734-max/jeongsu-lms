"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { loadOwnAnalysis, requireExamStaff } from "@/lib/exam-analysis/access";
import { refreshMaterialMatches } from "@/lib/exam-analysis/match-materials";

export async function matchActionCompressed(formData: FormData) {
  const id = formData.get("id") as string;
  const enabled = formData.get("enabled") === "true";

  const auth = await requireExamStaff();
  if ("error" in auth) {
    throw new Error("Unauthorized");
  }
  if (!(await loadOwnAnalysis(id, auth.profile.academy_id))) {
    throw new Error(`분석을 찾을 수 없어요. (요청 ID: ${id}, 학원 ID: ${auth.profile.academy_id})`);
  }
  
  let uploads: Array<{ name: string; text: string }> | undefined = undefined;
  if (formData) {
    const file = formData.get("uploads") as File | null;
    if (file) {
      try {
        const ds = new DecompressionStream("gzip");
        const decompressedStream = file.stream().pipeThrough(ds);
        const text = await new Response(decompressedStream).text();
        uploads = JSON.parse(text);
      } catch (e) {
        console.error("Failed to decompress uploads:", e);
        throw new Error("업로드 데이터 압축 해제 실패");
      }
    }
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
