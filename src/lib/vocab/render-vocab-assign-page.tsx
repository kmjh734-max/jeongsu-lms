import { VocabAssignmentsOverview } from "@/components/vocab/VocabAssignmentsOverview";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { createClient } from "@/lib/supabase/server";
import { loadVocabAssignmentOverview } from "@/lib/vocab/load-assignment-overview";
import { loadVocabModuleData } from "@/lib/vocab/load-module-data";
import type { VocabRole } from "@/lib/vocab/module-types";

/** 배정 탭 — 반·학생별로 지금 배정된 단어장 */
export async function renderVocabAssignPage(role: VocabRole) {
  const supabase = await createClient();
  const [data, profile] = await Promise.all([
    loadVocabModuleData(role),
    getCurrentProfile(),
  ]);
  const groups = await loadVocabAssignmentOverview(
    supabase,
    data.sets,
    profile ? { role: profile.role, id: profile.id } : undefined
  );

  return (
    <VocabAssignmentsOverview
      role={role}
      groups={groups}
      sets={data.sets}
      folders={data.folders}
    />
  );
}
