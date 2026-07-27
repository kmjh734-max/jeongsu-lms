import type { SupabaseClient } from "@supabase/supabase-js";

export type ClassDashboardRow = {
  classId: string;
  className: string;
  studentCount: number;
  assignmentCount: number;
  avgProgress: number;
  avgScore: number | null;
  completedCount: number;
  needsReviewCount: number;
  wrongOpenCount: number;
};

/** 학원 단위 반별 내신대비 현황 */
export async function loadExamPrepClassDashboard(
  supabase: SupabaseClient,
  academyId: string
): Promise<ClassDashboardRow[]> {
  const { data: classes } = await supabase
    .from("classes")
    .select("id, name")
    .eq("academy_id", academyId)
    .order("name", { ascending: true });

  if (!classes?.length) return [];

  const { data: assignments } = await supabase
    .from("exam_assignments")
    .select("id, class_id")
    .eq("academy_id", academyId)
    .not("class_id", "is", null);

  const assignmentIds = (assignments ?? []).map((a) => a.id as string);
  const byClassAssign = new Map<string, string[]>();
  for (const a of assignments ?? []) {
    if (!a.class_id) continue;
    const list = byClassAssign.get(a.class_id) ?? [];
    list.push(a.id);
    byClassAssign.set(a.class_id, list);
  }

  let asRows: Array<{
    id: string;
    assignment_id: string;
    status: string;
    progress_rate: number;
    total_score: number | null;
  }> = [];
  if (assignmentIds.length > 0) {
    const { data } = await supabase
      .from("exam_assignment_students")
      .select("id, assignment_id, status, progress_rate, total_score")
      .eq("academy_id", academyId)
      .in("assignment_id", assignmentIds);
    asRows = (data ?? []) as typeof asRows;
  }

  const asIds = asRows.map((r) => r.id);
  const reviewCountByAs = new Map<string, number>();
  const wrongOpenByAs = new Map<string, number>();

  if (asIds.length > 0) {
    const { data: attempts } = await supabase
      .from("exam_attempts")
      .select("id, assignment_student_id")
      .in("assignment_student_id", asIds)
      .eq("status", "submitted");
    const attemptToAs = new Map(
      (attempts ?? []).map((a) => [
        a.id as string,
        a.assignment_student_id as string,
      ])
    );
    const attemptIds = [...attemptToAs.keys()];
    if (attemptIds.length > 0) {
      const { data: answers } = await supabase
        .from("exam_answers")
        .select("attempt_id")
        .in("attempt_id", attemptIds)
        .eq("grading_status", "needs_review");
      for (const ans of answers ?? []) {
        const asId = attemptToAs.get(ans.attempt_id as string);
        if (!asId) continue;
        reviewCountByAs.set(asId, (reviewCountByAs.get(asId) ?? 0) + 1);
      }
    }

    const { data: wrongs } = await supabase
      .from("exam_wrong_answers")
      .select("assignment_student_id")
      .eq("academy_id", academyId)
      .eq("is_mastered", false)
      .in("assignment_student_id", asIds);
    for (const w of wrongs ?? []) {
      const asId = w.assignment_student_id as string;
      wrongOpenByAs.set(asId, (wrongOpenByAs.get(asId) ?? 0) + 1);
    }
  }

  const asByAssign = new Map<string, typeof asRows>();
  for (const r of asRows) {
    const list = asByAssign.get(r.assignment_id) ?? [];
    list.push(r);
    asByAssign.set(r.assignment_id, list);
  }

  return classes.map((c) => {
    const assignIds = byClassAssign.get(c.id) ?? [];
    const students: typeof asRows = [];
    for (const aid of assignIds) {
      students.push(...(asByAssign.get(aid) ?? []));
    }
    // 학생 중복(여러 배정) 시 평균은 행 기준
    const n = students.length;
    const avgProgress =
      n > 0
        ? Math.round(
            (students.reduce((s, r) => s + (Number(r.progress_rate) || 0), 0) /
              n) *
              10
          ) / 10
        : 0;
    const scored = students.filter((r) => r.total_score != null);
    const avgScore =
      scored.length > 0
        ? Math.round(
            (scored.reduce((s, r) => s + Number(r.total_score), 0) /
              scored.length) *
              10
          ) / 10
        : null;
    const completedCount = students.filter((r) => r.status === "completed")
      .length;
    let needsReviewCount = 0;
    let wrongOpenCount = 0;
    for (const r of students) {
      needsReviewCount += reviewCountByAs.get(r.id) ?? 0;
      wrongOpenCount += wrongOpenByAs.get(r.id) ?? 0;
    }

    return {
      classId: c.id as string,
      className: c.name as string,
      studentCount: n,
      assignmentCount: assignIds.length,
      avgProgress,
      avgScore,
      completedCount,
      needsReviewCount,
      wrongOpenCount,
    };
  });
}
