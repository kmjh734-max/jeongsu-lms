import { VocabAssignmentsOverview } from "@/components/vocab/VocabAssignmentsOverview";
import { createClient } from "@/lib/supabase/server";
import { loadVocabAssignmentOverview } from "@/lib/vocab/load-assignment-overview";
import { loadVocabModuleData } from "@/lib/vocab/load-module-data";
import type { VocabRole } from "@/lib/vocab/module-types";

/** 배정 탭 — 반·학생별로 지금 배정된 단어장 */
export async function renderVocabAssignPage(role: VocabRole) {
  const supabase = await createClient();
  const data = await loadVocabModuleData(role);
  const groups = await loadVocabAssignmentOverview(supabase, data.sets);

  return (
    <VocabAssignmentsOverview
      role={role}
      groups={groups}
      sets={data.sets}
      folders={data.folders}
    />
  );
}
