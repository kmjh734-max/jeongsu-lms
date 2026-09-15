import type { SupabaseClient } from "@supabase/supabase-js";
import { getKoreaDayUtcBounds, getTodayIsoKorea } from "@/lib/date/korea-today";
import type { VocabTodayStatusRow, VocabTodayStatusTable } from "@/lib/learning-status/types";
import { listReportStudents } from "@/lib/reports/list-students";
import type { ReportStudentOption } from "@/lib/reports/types";
import { chunkIds, fetchAllPages, fetchByIdChunks } from "@/lib/vocab/fetch-all";
import type { UserRole } from "@/types/database";

interface AssignedPair {
  studentId: string;
  setId: string;
  setTitle: string;
}

type SetJoin = { title?: string; teacher_id?: string | null; is_locked?: boolean | null };

type AssignmentRow = {
  set_id: string;
  student_id: string | null;
  class_id: string | null;
  assigned_by: string | null;
  set: SetJoin | SetJoin[] | null;
};

type PageResult<T> = PromiseLike<{
  data: T[] | null;
  error: { message: string } | null;
}>;

function one<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

async function loadAssignedPairs(
  supabase: SupabaseClient,
  studentIds: string[],
  role: UserRole,
  viewerId: string
): Promise<AssignedPair[]> {
  if (studentIds.length === 0) return [];

  const studentIdSet = new Set(studentIds);

  // 학생이 많은 학원도 1000줄에서 잘리지 않게 나눠서 모두 받는다
  const [classLinks, teacherClassIds] = await Promise.all([
    fetchByIdChunks<{ student_id: string; class_id: string }>(
      studentIds,
      (chunk, from, to) =>
        supabase
          .from("class_students")
          .select("student_id, class_id")
          .in("student_id", chunk)
          .order("id")
          .range(from, to)
    ),
    role === "teacher"
      ? fetchAllPages<{ id: string }>((from, to) =>
          supabase
            .from("classes")
            .select("id")
            .eq("teacher_id", viewerId)
            .order("id")
            .range(from, to)
        ).then((rows) => new Set(rows.map((r) => r.id)))
      : Promise.resolve(null),
  ]);

  const classIdsByStudent = new Map<string, Set<string>>();
  const classIdSet = new Set<string>();
  for (const row of classLinks) {
    const set = classIdsByStudent.get(row.student_id) ?? new Set<string>();
    set.add(row.class_id);
    classIdsByStudent.set(row.student_id, set);
    classIdSet.add(row.class_id);
  }

  const select =
    "set_id, student_id, class_id, assigned_by, set:vocab_sets(title, teacher_id, is_locked)";
  const [byStudent, byClass] = await Promise.all([
    fetchByIdChunks<AssignmentRow>(studentIds, (chunk, from, to) =>
      supabase
        .from("vocab_assignments")
        .select(select)
        .in("student_id", chunk)
        .order("id")
        .range(from, to)
    ),
    fetchByIdChunks<AssignmentRow>([...classIdSet], (chunk, from, to) =>
      supabase
        .from("vocab_assignments")
        .select(select)
        .in("class_id", chunk)
        .order("id")
        .range(from, to)
    ),
  ]);

  /**
   * 강사: 본인 단어장뿐 아니라 본인이 배정한 것(커리큘럼·복사본 포함),
   * 본인 반에 걸린 배정, 학원 공용(잠금) 교재까지 본다.
   */
  function visibleToViewer(row: AssignmentRow): boolean {
    if (!teacherClassIds) return true;
    const set = one(row.set);
    if (set?.teacher_id === viewerId) return true;
    if (row.assigned_by === viewerId) return true;
    if (row.class_id && teacherClassIds.has(row.class_id)) return true;
    if (set?.is_locked) return true;
    return false;
  }

  const pairs: AssignedPair[] = [];
  const seen = new Set<string>();

  function addPair(studentId: string, setId: string, setTitle: string) {
    const key = `${studentId}:${setId}`;
    if (seen.has(key)) return;
    seen.add(key);
    pairs.push({ studentId, setId, setTitle });
  }

  for (const row of [...byStudent, ...byClass]) {
    if (!visibleToViewer(row)) continue;
    const setId = row.set_id;
    const setTitle = one(row.set)?.title ?? "단어세트";

    if (row.student_id) {
      if (studentIdSet.has(row.student_id)) {
        addPair(row.student_id, setId, setTitle);
      }
      continue;
    }

    const classId = row.class_id;
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
    /** 이미 불러온 학생 목록이 있으면 다시 조회하지 않는다 */
    students?: ReportStudentOption[];
  }
): Promise<VocabTodayStatusTable> {
  const dateIso = options.dateIso?.trim() || getTodayIsoKorea();
  const { start, end } = getKoreaDayUtcBounds(dateIso);

  const students =
    options.students ??
    (await listReportStudents(supabase, role, viewerId, {
      classId: options.classId,
      nameQuery: options.nameQuery,
      loginQuery: options.loginQuery,
    }));

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
  const setIdLookup = new Set(setIds);
  const activityByPair = new Map<string, string[]>();

  if (setIds.length > 0) {
    // 한 번에 1000줄까지만 오므로 학생·단어장을 나눠 모두 받는다
    const setIdChunks = chunkIds(setIds);
    function bySetChunks<T>(
      build: (studentChunk: string[], setChunk: string[], from: number, to: number) => PageResult<T>
    ): Promise<T[]> {
      return Promise.all(
        setIdChunks.map((setChunk) =>
          fetchByIdChunks<T>(studentIds, (chunk, from, to) =>
            build(chunk, setChunk, from, to)
          )
        )
      ).then((parts) => parts.flat());
    }

    // 시험은 제출 시각(없으면 시작 시각)으로 본다. 시험이 하루를 넘기지는 않으니 전날부터 받는다.
    const testWindowStart = new Date(
      new Date(start).getTime() - 24 * 60 * 60 * 1000
    ).toISOString();

    const [progressRows, spellingRows, exampleRows, testRows, finalRows] =
      await Promise.all([
        fetchByIdChunks<{
          student_id: string;
          item: { set_id?: string } | { set_id?: string }[] | null;
        }>(studentIds, (chunk, from, to) =>
          supabase
            .from("vocab_progress")
            .select("student_id, item_id, item:vocab_items!inner(set_id)")
            .in("student_id", chunk)
            .gte("last_studied_at", start)
            .lte("last_studied_at", end)
            .order("id")
            .range(from, to)
        ),
        bySetChunks<{ student_id: string; set_id: string }>(
          (chunk, setChunk, from, to) =>
            supabase
              .from("vocab_spelling_attempts")
              .select("student_id, set_id")
              .in("student_id", chunk)
              .in("set_id", setChunk)
              .gte("created_at", start)
              .lte("created_at", end)
              .order("id")
              .range(from, to)
        ),
        bySetChunks<{ student_id: string; set_id: string }>(
          (chunk, setChunk, from, to) =>
            supabase
              .from("vocab_example_attempts")
              .select("student_id, set_id")
              .in("student_id", chunk)
              .in("set_id", setChunk)
              .gte("created_at", start)
              .lte("created_at", end)
              .order("id")
              .range(from, to)
        ),
        bySetChunks<{
          student_id: string;
          set_id: string;
          submitted_at: string | null;
          started_at: string | null;
        }>((chunk, setChunk, from, to) =>
          supabase
            .from("vocab_test_attempts")
            .select("student_id, set_id, submitted_at, started_at")
            .in("student_id", chunk)
            .in("set_id", setChunk)
            .gte("started_at", testWindowStart)
            .lte("started_at", end)
            .order("id")
            .range(from, to)
        ),
        bySetChunks<{ student_id: string; set_id: string }>(
          (chunk, setChunk, from, to) =>
            supabase
              .from("vocab_final_test_attempts")
              .select("student_id, set_id")
              .in("student_id", chunk)
              .in("set_id", setChunk)
              .gte("submitted_at", start)
              .lte("submitted_at", end)
              .order("id")
              .range(from, to)
        ),
      ]);

    for (const row of progressRows) {
      const setId = one(row.item)?.set_id;
      if (!setId || !setIdLookup.has(setId)) continue;
      const key = `${row.student_id}:${setId}`;
      const list = activityByPair.get(key) ?? [];
      mergeActivityLabels(list, "1단계 카드학습");
      activityByPair.set(key, list);
    }

    for (const row of spellingRows) {
      const key = `${row.student_id}:${row.set_id}`;
      const list = activityByPair.get(key) ?? [];
      mergeActivityLabels(list, "2단계 철자");
      activityByPair.set(key, list);
    }

    for (const row of exampleRows) {
      const key = `${row.student_id}:${row.set_id}`;
      const list = activityByPair.get(key) ?? [];
      mergeActivityLabels(list, "3단계 예문");
      activityByPair.set(key, list);
    }

    for (const row of testRows) {
      const ts = row.submitted_at ?? row.started_at;
      if (!ts || ts < start || ts > end) continue;
      const key = `${row.student_id}:${row.set_id}`;
      const list = activityByPair.get(key) ?? [];
      mergeActivityLabels(list, "2단계 테스트");
      activityByPair.set(key, list);
    }

    for (const row of finalRows) {
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
