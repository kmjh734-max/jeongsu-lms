import type { SupabaseClient } from "@supabase/supabase-js";
import { fetchByIdChunks } from "@/lib/vocab/fetch-all";
import type { VocabSetStats } from "@/lib/vocab/module-types";
import { stage4Passed } from "@/lib/vocab/stage-progress-fields";
import type { VocabStageProgress } from "@/types/database";

type AssignmentRow = {
  set_id: string;
  student_id: string | null;
  class_id: string | null;
};

type ProgressRow = Pick<
  VocabStageProgress,
  | "set_id"
  | "student_id"
  | "stage1_completed"
  | "stage2_completed"
  | "stage3_completed"
  | "stage3_passed"
  | "stage4_passed"
  | "stage4_attempt_count"
>;

export const EMPTY_SET_STATS: VocabSetStats = {
  assignLabel: null,
  assignedCount: 0,
  avgProgress: null,
  passedCount: 0,
};

/** 끝낸 단계 수 (0~4) — 4단계는 최종 시험 합격 */
export function completedStageCount(p: ProgressRow | undefined): number {
  if (!p) return 0;
  return (
    (p.stage1_completed ? 1 : 0) +
    (p.stage2_completed ? 1 : 0) +
    (p.stage3_completed ? 1 : 0) +
    (stage4Passed(p as VocabStageProgress) ? 1 : 0)
  );
}

function formatAssignLabel(classNames: string[], directCount: number): string | null {
  const parts: string[] = [];
  if (classNames.length > 0) {
    const shown = classNames.slice(0, 2).join(" · ");
    parts.push(
      classNames.length > 2 ? `${shown} 외 ${classNames.length - 2}개 반` : shown
    );
  }
  if (directCount > 0) {
    parts.push(parts.length > 0 ? `학생 ${directCount}` : `학생 ${directCount}명`);
  }
  return parts.length > 0 ? parts.join(" · ") : null;
}

/**
 * 세트별 배정 요약·평균 진행·합격 수.
 * 배정 → 반 학생 → 진행 기록 순서로 몇 번만 조회한다(세트마다 따로 조회하지 않음).
 * 반으로 배정된 세트는 지금 그 반에 있는 학생 모두를 배정된 학생으로 센다.
 */
export async function loadVocabSetStats(
  supabase: SupabaseClient,
  setIds: string[]
): Promise<Map<string, VocabSetStats>> {
  const result = new Map<string, VocabSetStats>();
  if (setIds.length === 0) return result;

  const [assignments, progressRows] = await Promise.all([
    fetchByIdChunks<AssignmentRow>(setIds, (chunk, from, to) =>
      supabase
        .from("vocab_assignments")
        .select("set_id, student_id, class_id")
        .in("set_id", chunk)
        .range(from, to)
    ),
    fetchByIdChunks<ProgressRow>(setIds, (chunk, from, to) =>
      supabase
        .from("vocab_stage_progress")
        .select(
          "set_id, student_id, stage1_completed, stage2_completed, stage3_completed, stage3_passed, stage4_passed, stage4_attempt_count"
        )
        .in("set_id", chunk)
        .range(from, to)
    ),
  ]);

  const classIds = [
    ...new Set(
      assignments.map((a) => a.class_id).filter((id): id is string => !!id)
    ),
  ];

  const [classRows, memberRows] = await Promise.all([
    fetchByIdChunks<{ id: string; name: string }>(classIds, (chunk, from, to) =>
      supabase.from("classes").select("id, name").in("id", chunk).range(from, to)
    ),
    fetchByIdChunks<{ class_id: string; student_id: string }>(
      classIds,
      (chunk, from, to) =>
        supabase
          .from("class_students")
          .select("class_id, student_id")
          .in("class_id", chunk)
          .range(from, to)
    ),
  ]);

  const classNameById = new Map(classRows.map((c) => [c.id, c.name]));
  const membersByClass = new Map<string, string[]>();
  for (const m of memberRows) {
    const list = membersByClass.get(m.class_id) ?? [];
    list.push(m.student_id);
    membersByClass.set(m.class_id, list);
  }

  const progressByKey = new Map<string, ProgressRow>();
  for (const p of progressRows) {
    progressByKey.set(`${p.set_id}:${p.student_id}`, p);
  }

  const bySet = new Map<
    string,
    { classIds: Set<string>; direct: Set<string>; students: Set<string> }
  >();
  for (const a of assignments) {
    const entry = bySet.get(a.set_id) ?? {
      classIds: new Set<string>(),
      direct: new Set<string>(),
      students: new Set<string>(),
    };
    if (a.class_id) {
      entry.classIds.add(a.class_id);
      for (const sid of membersByClass.get(a.class_id) ?? []) {
        entry.students.add(sid);
      }
    } else if (a.student_id) {
      entry.direct.add(a.student_id);
    }
    if (a.student_id) entry.students.add(a.student_id);
    bySet.set(a.set_id, entry);
  }

  for (const setId of setIds) {
    const entry = bySet.get(setId);
    if (!entry || entry.students.size === 0) {
      result.set(setId, {
        ...EMPTY_SET_STATS,
        assignLabel: entry
          ? formatAssignLabel(
              [...entry.classIds].map((id) => classNameById.get(id) ?? "반"),
              entry.direct.size
            )
          : null,
      });
      continue;
    }
    let stageSum = 0;
    let passed = 0;
    for (const sid of entry.students) {
      const p = progressByKey.get(`${setId}:${sid}`);
      stageSum += completedStageCount(p);
      if (p && stage4Passed(p as VocabStageProgress)) passed += 1;
    }
    const classNames = [...entry.classIds]
      .map((id) => classNameById.get(id) ?? "반")
      .sort((a, b) => a.localeCompare(b, "ko", { numeric: true }));
    result.set(setId, {
      assignLabel: formatAssignLabel(classNames, entry.direct.size),
      assignedCount: entry.students.size,
      avgProgress: Math.round((stageSum / (entry.students.size * 4)) * 100),
      passedCount: passed,
    });
  }

  return result;
}
