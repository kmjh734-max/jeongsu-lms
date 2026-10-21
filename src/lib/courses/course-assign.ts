import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { assignCourseToClass, ensureEnrollment } from "@/lib/classes/class-assignments";

/**
 * 강좌를 반·학생에게 배정하기(강좌 목록에서 여러 강좌를 골라 한꺼번에, 또는 강좌 화면에서 하나).
 *
 * 선생님 요청(2026-09-28): 「배정하기」를 누르면 반 관리로 보내서, 이 강좌에 누구를 넣을지 그 자리에서
 * 정할 수 없었다. 단어·듣기 배정과 같은 고르기 창을 쓴다.
 * 선생님 요청(2026-10-21): 동영상 강좌도 관리 화면에서 체크하고 배정할 수 있게(단어장 배정과 비슷하게).
 * 강좌 목록에서 여러 강좌를 고르고 아래 막대의 「배정」으로 연다. 배정된 곳을 보고 해제할 수도 있다.
 *
 * 쓰기는 service role로 하므로 권한은 여기서 따진다: 관리자는 자기 학원, 강사는 자기 반과 그 반 학생만.
 */

export interface CourseAssignPanelData {
  classes: { id: string; name: string; studentCount: number }[];
  students: { id: string; name: string; classLabel: string }[];
  /** 고른 강좌를 모두 받고 있는 곳 */
  assignedClassIds: string[];
  assignedStudentIds: string[];
  /** 고른 강좌 가운데 몇 개를 받고 있는지(여러 강좌를 골랐을 때 「일부 배정」) */
  classCoverage: Record<string, number>;
  studentCoverage: Record<string, number>;
  courseCount: number;
}

type Profile = NonNullable<Awaited<ReturnType<typeof getCurrentProfile>>>;

/** 이 사람이 배정할 수 있는 반과 학생(강사는 자기 반과 그 반 학생만) */
async function loadScope(admin: ReturnType<typeof createAdminClient>, profile: Profile) {
  let classQuery = admin
    .from("classes")
    .select("id, name, teacher_id, is_active")
    .eq("academy_id", profile.academy_id!)
    .order("name");
  if (profile.role === "teacher") classQuery = classQuery.eq("teacher_id", profile.id);
  const { data: classRows } = await classQuery;
  const classes = (classRows ?? []).filter((c) => c.is_active !== false);
  const classIds = classes.map((c) => String(c.id));
  const { data: members } = classIds.length
    ? await admin.from("class_students").select("class_id, student_id").in("class_id", classIds)
    : { data: [] as { class_id: string; student_id: string }[] };
  const memberRows = (members ?? []) as { class_id: string; student_id: string }[];

  let studentQuery = admin
    .from("profiles")
    .select("id, name, username")
    .eq("academy_id", profile.academy_id!)
    .eq("role", "student")
    .eq("is_active", true)
    .order("name");
  if (profile.role === "teacher") {
    const mine = [...new Set(memberRows.map((m) => String(m.student_id)))];
    studentQuery = studentQuery.in("id", mine.length ? mine : ["00000000-0000-0000-0000-000000000000"]);
  }
  const { data: studentRows } = await studentQuery;
  return { classes, memberRows, students: studentRows ?? [] };
}

function ids(input: string | string[]): string[] {
  return [...new Set((Array.isArray(input) ? input : [input]).map(String).filter(Boolean))];
}

export async function loadCourseAssignPanel(
  courseIdOrIds: string | string[]
): Promise<CourseAssignPanelData | null> {
  const profile = await getCurrentProfile();
  if (!profile || (profile.role !== "admin" && profile.role !== "teacher")) return null;
  if (!profile.academy_id) return null;
  const courseIds = ids(courseIdOrIds);
  if (courseIds.length === 0) return null;

  const admin = createAdminClient();
  const [{ classes, memberRows, students }, { data: links }, { data: enrolled }] = await Promise.all([
    loadScope(admin, profile),
    admin.from("class_courses").select("class_id, course_id").in("course_id", courseIds),
    admin.from("enrollments").select("student_id, course_id").in("course_id", courseIds),
  ]);

  const classNameById = new Map(classes.map((c) => [String(c.id), String(c.name)]));
  const classOf = new Map<string, string[]>();
  for (const m of memberRows) {
    const name = classNameById.get(String(m.class_id));
    if (!name) continue;
    const list = classOf.get(String(m.student_id)) ?? [];
    list.push(name);
    classOf.set(String(m.student_id), list);
  }

  const count = (rows: Array<Record<string, unknown>> | null, key: string) => {
    const m: Record<string, number> = {};
    const seen = new Set<string>();
    for (const r of rows ?? []) {
      const k = `${r[key]}|${r.course_id}`;
      if (seen.has(k)) continue;
      seen.add(k);
      m[String(r[key])] = (m[String(r[key])] ?? 0) + 1;
    }
    return m;
  };
  const classCoverage = count(links as Array<Record<string, unknown>> | null, "class_id");
  const studentCoverage = count(enrolled as Array<Record<string, unknown>> | null, "student_id");

  return {
    classes: classes.map((c) => ({
      id: String(c.id),
      name: String(c.name),
      studentCount: memberRows.filter((m) => String(m.class_id) === String(c.id)).length,
    })),
    students: students.map((s) => ({
      id: String(s.id),
      name: String(s.name ?? s.username ?? "학생"),
      classLabel: (classOf.get(String(s.id)) ?? []).join(", ") || "반 없음",
    })),
    assignedClassIds: Object.keys(classCoverage).filter((k) => classCoverage[k]! >= courseIds.length),
    assignedStudentIds: Object.keys(studentCoverage).filter((k) => studentCoverage[k]! >= courseIds.length),
    classCoverage,
    studentCoverage,
    courseCount: courseIds.length,
  };
}

/** 고른 반·학생에게 고른 강좌들을 배정한다. 이미 받고 있는 곳은 건너뛴다. */
export async function assignCourse(
  courseIdOrIds: string | string[],
  classIds: string[],
  studentIds: string[]
): Promise<{ ok: boolean; message: string }> {
  const profile = await getCurrentProfile();
  if (!profile || (profile.role !== "admin" && profile.role !== "teacher") || !profile.academy_id) {
    return { ok: false, message: "권한이 없어요." };
  }
  if (classIds.length === 0 && studentIds.length === 0) {
    return { ok: false, message: "배정할 반이나 학생을 골라 주세요." };
  }
  const courseIds = ids(courseIdOrIds);
  const admin = createAdminClient();

  // 강사는 자기 반·자기 반 학생에게만
  const scope = await loadScope(admin, profile);
  const allowedClasses = new Set(scope.classes.map((c) => String(c.id)));
  const allowedStudents = new Set(scope.students.map((s) => String(s.id)));
  if (classIds.some((id) => !allowedClasses.has(id)) || studentIds.some((id) => !allowedStudents.has(id))) {
    return { ok: false, message: "배정할 수 없는 반이나 학생이 들어 있어요." };
  }

  const { data: courses } = await admin
    .from("courses")
    .select("id, title, deleted_at, archived_at, academy_id")
    .in("id", courseIds);
  const usable: string[] = [];
  const skipped: string[] = [];
  for (const course of courses ?? []) {
    if (course.deleted_at || course.archived_at) skipped.push(String(course.title));
    else if (course.academy_id && course.academy_id !== profile.academy_id) skipped.push(String(course.title));
    else usable.push(String(course.id));
  }
  if (usable.length === 0) {
    return {
      ok: false,
      message: skipped.length
        ? "보관했거나 휴지통에 있는 강좌는 배정할 수 없어요. 보관을 먼저 풀어 주세요."
        : "강좌를 찾지 못했어요.",
    };
  }

  const failures: string[] = [];
  let classDone = 0;
  let studentDone = 0;
  for (const courseId of usable) {
    for (const classId of classIds) {
      const r = await assignCourseToClass(admin, {
        classId,
        courseId,
        assignedBy: profile.id,
        allowAnyCourse: true,
        academyId: profile.academy_id ?? undefined,
      });
      // 이미 배정된 반은 실패로 치지 않는다
      if (r.ok || r.message.includes("이미")) classDone += 1;
      else failures.push(r.message);
    }
    for (const studentId of studentIds) {
      const r = await ensureEnrollment(admin, studentId, courseId, profile.id);
      if (r.error) failures.push(r.error);
      else studentDone += 1;
    }
  }

  if (failures.length > 0 && classDone + studentDone === 0) {
    return { ok: false, message: failures[0]! };
  }
  const parts: string[] = [];
  if (classIds.length) parts.push(`반 ${classIds.length}개`);
  if (studentIds.length) parts.push(`학생 ${studentIds.length}명`);
  const what = usable.length > 1 ? `강좌 ${usable.length}개를 ` : "";
  const tail =
    (failures.length > 0 ? ` (${failures.length}곳은 못 했어요)` : "") +
    (skipped.length > 0 ? ` · 보관·휴지통 강좌 ${skipped.length}개는 건너뜀` : "");
  return { ok: true, message: `${parts.join(" · ")}에 ${what}배정했어요.${tail}` };
}

/**
 * 고른 강좌들의 배정 빼기.
 * - 반: 반 연결을 빼고, 그 반 학생의 수강도 함께 뺀다(같은 강좌를 다른 반으로 받는 학생은 그대로).
 *   예전에는 반 연결만 빼서 학생들이 계속 강좌를 보았다.
 * - 학생: 그 학생의 수강을 뺀다. 학습 기록은 남는다.
 */
export async function unassignCourse(
  courseIdOrIds: string | string[],
  opts: { classId?: string; studentId?: string }
): Promise<{ ok: boolean; message: string }> {
  const profile = await getCurrentProfile();
  if (!profile || (profile.role !== "admin" && profile.role !== "teacher") || !profile.academy_id) {
    return { ok: false, message: "권한이 없어요." };
  }
  const courseIds = ids(courseIdOrIds);
  if (courseIds.length === 0) return { ok: false, message: "강좌를 골라 주세요." };
  const admin = createAdminClient();
  const scope = await loadScope(admin, profile);

  if (opts.classId) {
    if (!scope.classes.some((c) => String(c.id) === opts.classId)) {
      return { ok: false, message: "뺄 수 없는 반이에요." };
    }
    const { error } = await admin
      .from("class_courses")
      .delete()
      .eq("class_id", opts.classId)
      .in("course_id", courseIds);
    if (error) return { ok: false, message: `빼지 못했어요: ${error.message}` };

    // 이 반 학생의 수강도 뺀다. 같은 강좌를 다른 반으로 받는 학생은 남긴다.
    const { data: members } = await admin.from("class_students").select("student_id").eq("class_id", opts.classId);
    const memberIds = (members ?? []).map((m) => String(m.student_id));
    let removed = 0;
    if (memberIds.length) {
      for (const courseId of courseIds) {
        const { data: otherLinks } = await admin
          .from("class_courses")
          .select("class_id")
          .eq("course_id", courseId);
        const otherClassIds = (otherLinks ?? []).map((l) => String(l.class_id));
        const { data: covered } = otherClassIds.length
          ? await admin.from("class_students").select("student_id").in("class_id", otherClassIds).in("student_id", memberIds)
          : { data: [] as { student_id: string }[] };
        const keep = new Set((covered ?? []).map((c) => String(c.student_id)));
        const drop = memberIds.filter((id) => !keep.has(id));
        if (drop.length === 0) continue;
        const { data: gone } = await admin
          .from("enrollments")
          .delete()
          .eq("course_id", courseId)
          .in("student_id", drop)
          .select("id");
        removed += gone?.length ?? 0;
      }
    }
    return {
      ok: true,
      message: `반 배정을 뺐어요${removed ? ` (학생 수강 ${removed}건도 함께)` : ""}. 학습 기록은 남아요.`,
    };
  }

  if (opts.studentId) {
    if (!scope.students.some((s) => String(s.id) === opts.studentId)) {
      return { ok: false, message: "뺄 수 없는 학생이에요." };
    }
    const { error } = await admin
      .from("enrollments")
      .delete()
      .eq("student_id", opts.studentId)
      .in("course_id", courseIds);
    if (error) return { ok: false, message: `빼지 못했어요: ${error.message}` };
    return { ok: true, message: "학생 수강을 뺐어요. 학습 기록은 남아요." };
  }

  return { ok: false, message: "무엇을 뺄지 알 수 없어요." };
}
