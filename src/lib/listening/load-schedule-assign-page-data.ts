import type { SupabaseClient } from "@supabase/supabase-js";
import { listListeningSetFolders } from "@/lib/listening/folder-access";
import { listScheduleAssignments } from "@/lib/listening/schedule/list-assignments";
import type { ScheduleAssignmentListItem } from "@/lib/listening/schedule/list-assignments";
import {
  loadClassStudentCounts,
  loadListeningSetQuestionStats,
  loadScheduleAssignmentProgress,
  loadStudentClassNames,
  type ScheduleAssignmentProgress,
} from "@/lib/listening/load-listening-overview";
import { getTodayIsoKorea } from "@/lib/date/korea-today";
import { createAdminClient } from "@/lib/supabase/admin";
import type { UserRole } from "@/types/database";

export interface ScheduleStudentOption {
  id: string;
  name: string;
}

export interface ScheduleSetOption {
  id: string;
  title: string;
  folder_id: string | null;
  /** 문항 수 — 「이렇게 나가요」 미리보기 계산용 */
  questionCount: number;
  /** 세트 기본 받아쓰기 통과 점수 — 배정 창 기본값 */
  dictationPassScore: number;
}

export interface ScheduleAssignPageData {
  assignments: ScheduleAssignmentListItem[];
  classes: { id: string; name: string; studentCount: number }[];
  sets: ScheduleSetOption[];
  folders: { id: string; name: string }[];
  students: ScheduleStudentOption[];
  /** 반 배정 카드에 보일 학생 수 */
  classStudentCounts: Record<string, number>;
  /** 학생 배정 카드에 보일 소속 반 */
  studentClassNames: Record<string, string>;
  progressByAssignment: Record<string, ScheduleAssignmentProgress>;
  todayIso: string;
}

async function loadScheduleStudentOptions(
  supabase: SupabaseClient,
  role: UserRole,
  viewerId: string,
  academyId: string
): Promise<ScheduleStudentOption[]> {
  if (role === "teacher") {
    const { data: classes } = await supabase
      .from("classes")
      .select("id")
      .eq("teacher_id", viewerId)
      .eq("is_active", true);

    const classIds = (classes ?? []).map((c) => c.id as string);
    if (classIds.length === 0) return [];

    const { data: members } = await supabase
      .from("class_students")
      .select("student_id")
      .in("class_id", classIds);

    const studentIds = [
      ...new Set((members ?? []).map((m) => m.student_id as string)),
    ];
    if (studentIds.length === 0) return [];

    const { data } = await supabase
      .from("profiles")
      .select("id, name")
      .eq("role", "student")
      .in("id", studentIds)
      .order("name")
      .limit(500);

    return (data ?? []).map((s) => ({
      id: s.id as string,
      name: s.name as string,
    }));
  }

  const { data } = await supabase
    .from("profiles")
    .select("id, name")
    .eq("role", "student")
    .eq("is_active", true)
    .eq("academy_id", academyId)
    .order("name")
    .limit(500);

  return (data ?? []).map((s) => ({
    id: s.id as string,
    name: s.name as string,
  }));
}

export async function loadScheduleAssignPageData(
  supabase: SupabaseClient,
  role: UserRole,
  viewerId: string,
  academyId: string
): Promise<ScheduleAssignPageData> {
  const admin = createAdminClient();

  let setsQuery = supabase
    .from("listening_sets")
    .select("id, title, folder_id, order_index, dictation_pass_score")
    .order("order_index", { ascending: true })
    .order("created_at", { ascending: false })
    .limit(300);

  let classesQuery = supabase
    .from("classes")
    .select("id, name")
    .eq("is_active", true)
    .order("name");

  if (role === "teacher") {
    // 본인 세트 + 학원 커리큘럼 잠금 세트 (RLS가 academy 격리)
    setsQuery = setsQuery.or(
      `teacher_id.eq.${viewerId},description.ilike.%curriculum_locked%`
    );
    classesQuery = classesQuery.eq("teacher_id", viewerId);
  } else if (role === "admin") {
    // 관리자 RLS 와 같은 범위 — 학원을 직접 걸어 학원 색인으로 읽는다
    setsQuery = setsQuery.eq("academy_id", academyId);
    classesQuery = classesQuery.eq("academy_id", academyId);
  }

  const loadFolders = async (): Promise<{ id: string; name: string }[]> => {
    const academyFoldersPromise =
      role === "teacher"
        ? admin
            .from("listening_set_folders")
            .select("id, name")
            .eq("academy_id", academyId)
            .order("name")
        : null;

    let folders: { id: string; name: string }[] = [];
    try {
      const rows = await listListeningSetFolders(supabase, role, viewerId, academyId);
      folders = rows.map((f) => ({ id: f.id, name: f.name }));
    } catch {
      // RLS 미적용 환경 폴백: academy 폴더를 admin으로 조회
      const { data } = await admin
        .from("listening_set_folders")
        .select("id, name")
        .eq("academy_id", academyId)
        .order("name");
      folders = (data ?? []).map((f) => ({
        id: f.id as string,
        name: f.name as string,
      }));
    }

    // 교사에게 커리큘럼 폴더가 안 보이면 academy 폴더를 합침
    if (academyFoldersPromise) {
      const { data: academyFolders } = await academyFoldersPromise;
      const seen = new Set(folders.map((f) => f.id));
      for (const f of academyFolders ?? []) {
        if (!seen.has(f.id as string)) {
          folders.push({ id: f.id as string, name: f.name as string });
        }
      }
    }
    return folders;
  };

  const todayIso = getTodayIsoKorea();

  // 서로 기다릴 필요 없는 조회는 한꺼번에 출발하고,
  // 뒤따르는 조회(문항 수·학생 수·진행)는 필요한 앞 조회가 끝나는 대로 바로 잇는다.
  const assignmentsPromise = listScheduleAssignments(admin, role, viewerId, academyId);
  const classesPromise = Promise.resolve(classesQuery).then(({ data }) => data ?? []);
  const setsPromise = Promise.resolve(setsQuery).then(({ data }) => data ?? []);

  const [
    folders,
    assignments,
    classRows,
    setRows,
    students,
    questionStats,
    classStudentCounts,
    studentClassNames,
    progressByAssignment,
  ] = await Promise.all([
    loadFolders(),
    assignmentsPromise,
    classesPromise,
    setsPromise,
    loadScheduleStudentOptions(supabase, role, viewerId, academyId),
    setsPromise.then((rows) =>
      loadListeningSetQuestionStats(
        supabase,
        rows.map((s) => s.id as string)
      )
    ),
    Promise.all([classesPromise, assignmentsPromise]).then(([classes, list]) =>
      loadClassStudentCounts(admin, [
        ...new Set([
          ...classes.map((c) => c.id as string),
          ...list
            .map((a) => a.targetClassId)
            .filter((id): id is string => Boolean(id)),
        ]),
      ])
    ),
    assignmentsPromise.then((list) =>
      loadStudentClassNames(admin, [
        ...new Set(
          list
            .map((a) => a.targetStudentId)
            .filter((id): id is string => Boolean(id))
        ),
      ])
    ),
    assignmentsPromise.then((list) =>
      loadScheduleAssignmentProgress(
        admin,
        list.map((a) => a.id),
        todayIso
      )
    ),
  ]);

  return {
    assignments,
    classes: classRows.map((c) => ({
      id: c.id as string,
      name: c.name as string,
      studentCount: classStudentCounts[c.id as string] ?? 0,
    })),
    sets: setRows.map((s) => ({
      id: s.id as string,
      title: s.title as string,
      folder_id: (s.folder_id as string | null) ?? null,
      questionCount: questionStats[s.id as string]?.questionCount ?? 0,
      dictationPassScore: (s.dictation_pass_score as number | null) ?? 80,
    })),
    folders,
    students,
    classStudentCounts,
    studentClassNames,
    progressByAssignment,
    todayIso,
  };
}
