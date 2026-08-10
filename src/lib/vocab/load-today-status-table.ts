import type { SupabaseClient } from "@supabase/supabase-js";
import { getKoreaDayUtcBounds, getTodayIsoKorea } from "@/lib/date/korea-today";
import type { VocabTodayStatusRow, VocabTodayStatusTable } from "@/lib/learning-status/types";
import { listReportStudents } from "@/lib/reports/list-students";
import type { UserRole } from "@/types/database";

interface AssignedPair {
  studentId: string;
  setId: string;
  setTitle: string;
}

async function loadAssignedPairs(
  supabase: SupabaseClient,
  studentIds: string[],
  role: UserRole,
  viewerId: string
): Promise<AssignedPair[]> {
  if (studentIds.length === 0) return [];

  const studentIdSet = new Set(studentIds);

  let scopedSetIds: string[] | null = null;
  if (role === "teacher") {
    const { data: teacherSets } = await supabase
      .from("vocab_sets")
      .select("id")
      .eq("teacher_id", viewerId);
    scopedSetIds = (teacherSets ?? []).map((r) => r.id as string);
    if (scopedSetIds.length === 0) return [];
  }

  const { data: classLinks } = await supabase
    .from("class_students")
    .select("student_id, class_id")
    .in("student_id", studentIds);

  const classIdsByStudent = new Map<string, Set<string>>();
  const classIdSet = new Set<string>();
  for (const row of classLinks ?? []) {
    const sid = row.student_id as string;
    const cid = row.class_id as string;
    const set = classIdsByStudent.get(sid) ?? new Set<string>();
    set.add(cid);
    classIdsByStudent.set(sid, set);
    classIdSet.add(cid);
  }

  const classIds = [...classIdSet];
  const orParts: string[] = [`student_id.in.(${studentIds.join(",")})`];
  if (classIds.length > 0) {
    orParts.push(`class_id.in.(${classIds.join(",")})`);
  }

  let assignmentQuery = supabase
    .from("vocab_assignments")
    .select("set_id, student_id, class_id, set:vocab_sets(title)")
    .or(orParts.join(","));
  if (scopedSetIds) {
    assignmentQuery = assignmentQuery.in("set_id", scopedSetIds);
  }

  const { data: assignments } = await assignmentQuery;

  const pairs: AssignedPair[] = [];
  const seen = new Set<string>();

  function addPair(studentId: string, setId: string, setTitle: string) {
    const key = `${studentId}:${setId}`;
    if (seen.has(key)) return;
    seen.add(key);
    pairs.push({ studentId, setId, setTitle });
  }

  for (const row of assignments ?? []) {
    const setId = row.set_id as string;
    const set = row.set as { title?: string } | { title?: string }[] | null;
    const setTitle = Array.isArray(set)
      ? (set[0]?.title ?? "단어세트")
      : (set?.title ?? "단어세트");

    if (row.student_id) {
      const sid = row.student_id as string;
      if (studentIdSet.has(sid)) {
        addPair(sid, setId, setTitle);
      }
      continue;
    }

    const classId = row.class_id as string | null;
    if (!classId) continue;

    for (const studentId of studentIds) {
      const classes = classIdsByStudent.get(studentId);
      if (classes?.has(classId)) {
        addPair(studentId, setId, setTitle);
      }
    }
  }

  return pairs;
}

function mergeActivityLabels(existing: string[], label: string): string[] {
  if (!existing.includes(label)) existing.push(label);
  return existing;
}

export async function loadVocabTodayStatusTable(
  supabase: SupabaseClient,
  role: UserRole,
  viewerId: string,
  options: {
    dateIso?: string;
    classId?: string;
    nameQuery?: string;
    loginQuery?: string;
  }
): Promise<VocabTodayStatusTable> {
  const dateIso = options.dateIso?.trim() || getTodayIsoKorea();
  const { start, end } = getKoreaDayUtcBounds(dateIso);

  const students = await listReportStudents(supabase, role, viewerId, {
    classId: options.classId,
    nameQuery: options.nameQuery,
    loginQuery: options.loginQuery,
  });

  if (students.length === 0) {
    return { dateIso, rows: [] };
  }

  const studentIds = students.map((s) => s.id);
  const studentById = new Map(students.map((s) => [s.id, s]));
  const pairs = await loadAssignedPairs(
    supabase,
    studentIds,
    role,
    viewerId
  );

  const setIds = [...new Set(pairs.map((p) => p.setId))];
  const activityByPair = new Map<string, string[]>();

  if (setIds.length > 0) {
    const [
      { data: progressRows },
      { data: spellingRows },
      { data: exampleRows },
      { data: testRows },
      { data: finalRows },
    ] = await Promise.all([
      supabase
        .from("vocab_progress")
        .select(
          "student_id, item_id, last_studied_at, item:vocab_items!inner(set_id)"
        )
        .in("student_id", studentIds)
        .gte("last_studied_at", start)
        .lte("last_studied_at", end),
      supabase
        .from("vocab_spelling_attempts")
        .select("student_id, set_id, created_at")
        .in("student_id", studentIds)
        .in("set_id", setIds)
        .gte("created_at", start)
        .lte("created_at", end),
      supabase
        .from("vocab_example_attempts")
        .select("student_id, set_id, created_at")
        .in("student_id", studentIds)
        .in("set_id", setIds)
        .gte("created_at", start)
        .lte("created_at", end),
      supabase
        .from("vocab_test_attempts")
        .select("student_id, set_id, submitted_at, started_at")
        .in("student_id", studentIds)
        .in("set_id", setIds),
      supabase
        .from("vocab_final_test_attempts")
        .select("student_id, set_id, submitted_at")
        .in("student_id", studentIds)
        .in("set_id", setIds)
        .gte("submitted_at", start)
        .lte("submitted_at", end),
    ]);

    for (const row of progressRows ?? []) {
      const item = row.item as { set_id?: string } | { set_id?: string }[] | null;
      const setId = Array.isArray(item) ? item[0]?.set_id : item?.set_id;
      if (!setId || !setIds.includes(setId)) continue;
      const key = `${row.student_id}:${setId}`;
      const list = activityByPair.get(key) ?? [];
      mergeActivityLabels(list, "1단계 카드학습");
      activityByPair.set(key, list);
    }

    for (const row of spellingRows ?? []) {
      const key = `${row.student_id}:${row.set_id}`;
      const list = activityByPair.get(key) ?? [];
      mergeActivityLabels(list, "2단계 철자");
      activityByPair.set(key, list);
    }

    for (const row of exampleRows ?? []) {
      const key = `${row.student_id}:${row.set_id}`;
      const list = activityByPair.get(key) ?? [];
      mergeActivityLabels(list, "3단계 예문");
      activityByPair.set(key, list);
    }

    for (const row of testRows ?? []) {
      const ts = (row.submitted_at as string | null) ?? (row.started_at as string);
      if (!ts || ts < start || ts > end) continue;
      const key = `${row.student_id}:${row.set_id}`;
      const list = activityByPair.get(key) ?? [];
      mergeActivityLabels(list, "2단계 테스트");
      activityByPair.set(key, list);
    }

    for (const row of finalRows ?? []) {
      const key = `${row.student_id}:${row.set_id}`;
      const list = activityByPair.get(key) ?? [];
      mergeActivityLabels(list, "4단계 최종시험");
      activityByPair.set(key, list);
    }
  }

  const rows: VocabTodayStatusRow[] = pairs
    .map((pair) => {
      const student = studentById.get(pair.studentId);
      if (!student) return null;
      const key = `${pair.studentId}:${pair.setId}`;
      const activities = activityByPair.get(key) ?? [];
      const studiedToday = activities.length > 0;
      return {
        studentId: pair.studentId,
        studentName: student.name,
        classLabel: student.classNames.join(", ") || "—",
        setId: pair.setId,
        setTitle: pair.setTitle,
        activityLabel: studiedToday ? activities.join(", ") : "—",
        studiedToday,
      };
    })
    .filter((r): r is VocabTodayStatusRow => r != null)
    .sort((a, b) => {
      const classCmp = a.classLabel.localeCompare(b.classLabel, "ko");
      if (classCmp !== 0) return classCmp;
      const nameCmp = a.studentName.localeCompare(b.studentName, "ko");
      if (nameCmp !== 0) return nameCmp;
      // Day 1 < Day 2 < Day 10 (문자열 정렬이면 Day 10이 Day 2보다 앞)
      return a.setTitle.localeCompare(b.setTitle, "ko", { numeric: true });
    });

  return { dateIso, rows };
}
