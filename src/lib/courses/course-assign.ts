import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { assignCourseToClass, ensureEnrollment } from "@/lib/classes/class-assignments";

/**
 * 강좌 화면에서 바로 반·학생에게 배정하기.
 *
 * 선생님 요청(2026-09-28): 지금은 「배정하기」를 누르면 반 관리로 보내서, 이 강좌에
 * 누구를 넣을지 그 자리에서 정할 수 없었다. 단어·듣기 배정과 같은 고르기 창을 쓴다.
 */

export interface CourseAssignPanelData {
  classes: { id: string; name: string; studentCount: number }[];
  students: { id: string; name: string; classLabel: string }[];
  /** 지금 이 강좌를 받고 있는 곳 */
  assignedClassIds: string[];
  assignedStudentIds: string[];
}

export async function loadCourseAssignPanel(
  courseId: string
): Promise<CourseAssignPanelData | null> {
  const profile = await getCurrentProfile();
  if (!profile || (profile.role !== "admin" && profile.role !== "teacher")) return null;
  if (!profile.academy_id) return null;

  const admin = createAdminClient();
  const [{ data: classRows }, { data: members }, { data: studentRows }, { data: links }, { data: enrolled }] =
    await Promise.all([
      admin
        .from("classes")
        .select("id, name, teacher_id, is_active")
        .eq("academy_id", profile.academy_id)
        .order("name"),
      admin.from("class_students").select("class_id, student_id"),
      admin
        .from("profiles")
        .select("id, name, username")
        .eq("academy_id", profile.academy_id)
        .eq("role", "student")
        .eq("is_active", true)
        .order("name"),
      admin.from("class_courses").select("class_id").eq("course_id", courseId),
      admin.from("enrollments").select("student_id").eq("course_id", courseId),
    ]);

  const classes = (classRows ?? []).filter((c) => c.is_active !== false);
  const memberRows = (members ?? []) as { class_id: string; student_id: string }[];
  const classNameById = new Map(classes.map((c) => [String(c.id), String(c.name)]));

  const classOf = new Map<string, string[]>();
  for (const m of memberRows) {
    const name = classNameById.get(String(m.class_id));
    if (!name) continue;
    const list = classOf.get(String(m.student_id)) ?? [];
    list.push(name);
    classOf.set(String(m.student_id), list);
  }

  return {
    classes: classes.map((c) => ({
      id: String(c.id),
      name: String(c.name),
      studentCount: memberRows.filter((m) => String(m.class_id) === String(c.id)).length,
    })),
    students: (studentRows ?? []).map((s) => ({
      id: String(s.id),
      name: String(s.name ?? s.username ?? "학생"),
      classLabel: (classOf.get(String(s.id)) ?? []).join(", ") || "반 없음",
    })),
    assignedClassIds: (links ?? []).map((r) => String(r.class_id)),
    assignedStudentIds: (enrolled ?? []).map((r) => String(r.student_id)),
  };
}

/** 고른 반·학생에게 이 강좌를 배정한다. 이미 받고 있는 곳은 건너뛴다. */
export async function assignCourse(
  courseId: string,
  classIds: string[],
  studentIds: string[]
): Promise<{ ok: boolean; message: string }> {
  const profile = await getCurrentProfile();
  if (!profile || (profile.role !== "admin" && profile.role !== "teacher")) {
    return { ok: false, message: "권한이 없어요." };
  }
  if (classIds.length === 0 && studentIds.length === 0) {
    return { ok: false, message: "배정할 반이나 학생을 골라 주세요." };
  }

  const admin = createAdminClient();
  const { data: course } = await admin
    .from("courses")
    .select("id, title, deleted_at, archived_at, academy_id")
    .eq("id", courseId)
    .maybeSingle();
  if (!course) return { ok: false, message: "강좌를 찾지 못했어요." };
  if (course.deleted_at) return { ok: false, message: "휴지통에 있는 강좌는 배정할 수 없어요." };
  if (course.archived_at) {
    return { ok: false, message: "보관한 강좌는 새로 배정할 수 없어요. 보관을 먼저 풀어 주세요." };
  }
  if (course.academy_id && course.academy_id !== profile.academy_id) {
    return { ok: false, message: "다른 학원 강좌는 배정할 수 없어요." };
  }

  const failures: string[] = [];
  let classDone = 0;

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

  let studentDone = 0;
  for (const studentId of studentIds) {
    const r = await ensureEnrollment(admin, studentId, courseId, profile.id);
    if (r.error) failures.push(r.error);
    else studentDone += 1;
  }

  if (failures.length > 0 && classDone + studentDone === 0) {
    return { ok: false, message: failures[0]! };
  }

  const parts: string[] = [];
  if (classDone > 0) parts.push(`반 ${classDone}개`);
  if (studentDone > 0) parts.push(`학생 ${studentDone}명`);
  const tail = failures.length > 0 ? ` (${failures.length}곳은 못 했어요)` : "";
  return { ok: true, message: `${parts.join(" · ")}에 배정했어요.${tail}` };
}

/** 이 강좌 배정 빼기 — 반이면 연결을, 학생이면 수강을 뺀다 */
export async function unassignCourse(
  courseId: string,
  opts: { classId?: string; studentId?: string }
): Promise<{ ok: boolean; message: string }> {
  const profile = await getCurrentProfile();
  if (!profile || (profile.role !== "admin" && profile.role !== "teacher")) {
    return { ok: false, message: "권한이 없어요." };
  }
  const admin = createAdminClient();

  if (opts.classId) {
    const { error } = await admin
      .from("class_courses")
      .delete()
      .eq("class_id", opts.classId)
      .eq("course_id", courseId);
    if (error) return { ok: false, message: `빼지 못했어요: ${error.message}` };
    return { ok: true, message: "반 배정을 뺐어요. 학생 수강은 그대로 둡니다." };
  }

  if (opts.studentId) {
    const { error } = await admin
      .from("enrollments")
      .delete()
      .eq("student_id", opts.studentId)
      .eq("course_id", courseId);
    if (error) return { ok: false, message: `빼지 못했어요: ${error.message}` };
    return { ok: true, message: "학생 수강을 뺐어요. 학습 기록은 남아요." };
  }

  return { ok: false, message: "무엇을 뺄지 알 수 없어요." };
}
