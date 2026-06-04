import type { SupabaseClient } from "@supabase/supabase-js";

export interface ListeningAssignmentSummary {
  classNames: string[];
  studentNames: string[];
}

function resolveName(
  rel: { name?: string } | { name?: string }[] | null | undefined
): string | undefined {
  if (!rel) return undefined;
  if (Array.isArray(rel)) return rel[0]?.name;
  return rel.name;
}

/** 목록 화면 배정 패널용 — 세트별 반·학생 배정 요약 */
export async function loadListeningAssignmentSummaries(
  supabase: SupabaseClient,
  setIds: string[]
): Promise<Record<string, ListeningAssignmentSummary>> {
  if (setIds.length === 0) return {};

  const { data } = await supabase
    .from("listening_assignments")
    .select(
      "set_id, class_id, student_id, class:classes(name), student:profiles!listening_assignments_student_id_fkey(name)"
    )
    .in("set_id", setIds);

  const bySet = new Map<string, { classes: Set<string>; students: Set<string> }>();

  for (const row of data ?? []) {
    const setId = row.set_id as string;
    let entry = bySet.get(setId);
    if (!entry) {
      entry = { classes: new Set(), students: new Set() };
      bySet.set(setId, entry);
    }
    if (row.class_id) {
      const name = resolveName(
        row.class as { name?: string } | { name?: string }[] | null
      );
      if (name) entry.classes.add(name);
    }
    if (row.student_id) {
      const name = resolveName(
        row.student as { name?: string } | { name?: string }[] | null
      );
      if (name) entry.students.add(name);
    }
  }

  const out: Record<string, ListeningAssignmentSummary> = {};
  for (const [setId, entry] of bySet) {
    out[setId] = {
      classNames: [...entry.classes],
      studentNames: [...entry.students],
    };
  }
  return out;
}
