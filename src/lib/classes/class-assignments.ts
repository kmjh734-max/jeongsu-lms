import type { SupabaseClient } from "@supabase/supabase-js";

export type ClassActionResult =
  | { ok: true; message: string; enrolledCount?: number }
  | { ok: false; message: string };

function humanizeDbError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("row-level security") || m.includes("rls")) {
    return "권한(RLS) 문제로 저장되지 않았습니다. 소속 학원 연결을 확인해 주세요.";
  }
  if (m.includes("not-null") && m.includes("academy")) {
    return "학원 정보가 비어 있어 저장할 수 없습니다. 관리자 계정에 학원을 연결해 주세요.";
  }
  if (m.includes("foreign key") || m.includes("violates foreign")) {
    return "연결된 학생·강사·강좌 정보가 올바르지 않습니다.";
  }
  return message;
}

function academyMismatch(
  rowAcademyId: string | null | undefined,
  expectedAcademyId: string | undefined
): boolean {
  if (!expectedAcademyId) return false;
  // null은 미지정 레거시 → 같은 학원으로 취급(추가 시 백필)
  if (rowAcademyId == null) return false;
  return rowAcademyId !== expectedAcademyId;
}

/** Insert enrollment if missing; never removes existing rows. */
export async function ensureEnrollment(
  supabase: SupabaseClient,
  studentId: string,
  courseId: string,
  assignedBy: string | null
): Promise<{ created: boolean; error?: string }> {
  const { data: existing, error: lookupError } = await supabase
    .from("enrollments")
    .select("id")
    .eq("student_id", studentId)
    .eq("course_id", courseId)
    .maybeSingle();

  if (lookupError) {
    return { created: false, error: lookupError.message };
  }

  if (existing) {
    return { created: false };
  }

  const { error: insertError } = await supabase.from("enrollments").insert({
    student_id: studentId,
    course_id: courseId,
    assigned_by: assignedBy,
  });

  if (insertError) {
    const duplicate =
      insertError.code === "23505" ||
      insertError.message.toLowerCase().includes("unique");
    if (duplicate) {
      return { created: false };
    }
    return { created: false, error: insertError.message };
  }

  return { created: true };
}

/** Enroll one student in all courses assigned to the class. */
export async function syncEnrollmentsForStudent(
  supabase: SupabaseClient,
  classId: string,
  studentId: string,
  assignedBy: string | null
): Promise<{ enrolledCount: number; errors: string[] }> {
  const { data: classCourses, error } = await supabase
    .from("class_courses")
    .select("course_id")
    .eq("class_id", classId);

  if (error) {
    return { enrolledCount: 0, errors: [error.message] };
  }

  let enrolledCount = 0;
  const errors: string[] = [];

  for (const row of classCourses ?? []) {
    const result = await ensureEnrollment(
      supabase,
      studentId,
      row.course_id,
      assignedBy
    );
    if (result.error) {
      errors.push(result.error);
    } else if (result.created) {
      enrolledCount += 1;
    }
  }

  return { enrolledCount, errors };
}

/** Enroll all students in the class for one course. */
export async function syncEnrollmentsForCourse(
  supabase: SupabaseClient,
  classId: string,
  courseId: string,
  assignedBy: string | null
): Promise<{ enrolledCount: number; errors: string[] }> {
  const { data: classStudents, error } = await supabase
    .from("class_students")
    .select("student_id")
    .eq("class_id", classId);

  if (error) {
    return { enrolledCount: 0, errors: [error.message] };
  }

  let enrolledCount = 0;
  const errors: string[] = [];

  for (const row of classStudents ?? []) {
    const result = await ensureEnrollment(
      supabase,
      row.student_id,
      courseId,
      assignedBy
    );
    if (result.error) {
      errors.push(result.error);
    } else if (result.created) {
      enrolledCount += 1;
    }
  }

  return { enrolledCount, errors };
}

export async function assignCourseToClass(
  supabase: SupabaseClient,
  params: {
    classId: string;
    courseId: string;
    assignedBy: string;
    /** When false, course.teacher_id must match class.teacher_id (teacher flow). */
    allowAnyCourse?: boolean;
    /** When set, class and course must belong to this academy. */
    academyId?: string;
  }
): Promise<ClassActionResult> {
  const {
    classId,
    courseId,
    assignedBy,
    allowAnyCourse = false,
    academyId,
  } = params;

  const { data: classRow, error: classError } = await supabase
    .from("classes")
    .select("id, teacher_id, name, is_active, academy_id")
    .eq("id", classId)
    .single();

  if (classError || !classRow) {
    return { ok: false, message: "반 정보를 찾을 수 없습니다." };
  }

  if (academyMismatch(classRow.academy_id, academyId)) {
    return { ok: false, message: "다른 학원 반에는 배정할 수 없습니다." };
  }

  if (!classRow.is_active) {
    return { ok: false, message: "비활성화된 반에는 강좌를 배정할 수 없습니다." };
  }

  const { data: course, error: courseError } = await supabase
    .from("courses")
    .select("id, title, teacher_id, academy_id")
    .eq("id", courseId)
    .single();

  if (courseError || !course) {
    return { ok: false, message: "강좌를 찾을 수 없습니다." };
  }

  if (academyMismatch(course.academy_id, academyId)) {
    return { ok: false, message: "다른 학원 강좌는 배정할 수 없습니다." };
  }

  if (!allowAnyCourse) {
    if (!classRow.teacher_id || course.teacher_id !== classRow.teacher_id) {
      return {
        ok: false,
        message: "담당 강사의 강좌만 이 반에 배정할 수 있습니다.",
      };
    }
  }

  const { data: existingLink } = await supabase
    .from("class_courses")
    .select("id")
    .eq("class_id", classId)
    .eq("course_id", courseId)
    .maybeSingle();

  if (existingLink) {
    return { ok: false, message: "이미 이 반에 배정된 강좌입니다." };
  }

  const { error: linkError } = await supabase.from("class_courses").insert({
    class_id: classId,
    course_id: courseId,
    assigned_by: assignedBy,
  });

  if (linkError) {
    const duplicate =
      linkError.code === "23505" ||
      linkError.message.toLowerCase().includes("unique");
    return {
      ok: false,
      message: duplicate
        ? "이미 이 반에 배정된 강좌입니다."
        : humanizeDbError(linkError.message),
    };
  }

  // 강좌 academy 미지정이면 반 학원으로 맞춤
  if (academyId && course.academy_id == null) {
    await supabase
      .from("courses")
      .update({ academy_id: academyId })
      .eq("id", courseId)
      .is("academy_id", null);
  }

  const { enrolledCount, errors } = await syncEnrollmentsForCourse(
    supabase,
    classId,
    courseId,
    assignedBy
  );

  if (errors.length > 0) {
    return {
      ok: true,
      message: `강좌가 반에 배정되었습니다. 수강 배정 ${enrolledCount}건 완료 (일부 오류: ${errors[0]})`,
      enrolledCount,
    };
  }

  return {
    ok: true,
    message:
      enrolledCount > 0
        ? `강좌가 반에 배정되었고, 학생 ${enrolledCount}명에게 수강이 등록되었습니다.`
        : "강좌가 반에 배정되었습니다. (반에 학생이 없어 수강 배정은 없습니다.)",
    enrolledCount,
  };
}

export async function addStudentToClass(
  supabase: SupabaseClient,
  params: {
    classId: string;
    studentId: string;
    assignedBy: string;
    /** When set, class and student must belong to this academy. */
    academyId?: string;
  }
): Promise<ClassActionResult> {
  const { classId, studentId, assignedBy, academyId } = params;

  const { data: classRow, error: classError } = await supabase
    .from("classes")
    .select("id, is_active, academy_id")
    .eq("id", classId)
    .single();

  if (classError || !classRow) {
    return { ok: false, message: "반 정보를 찾을 수 없습니다." };
  }

  if (academyMismatch(classRow.academy_id, academyId)) {
    return { ok: false, message: "다른 학원 반에는 추가할 수 없습니다." };
  }

  if (!classRow.is_active) {
    return { ok: false, message: "비활성화된 반에는 학생을 추가할 수 없습니다." };
  }

  const { data: student, error: studentError } = await supabase
    .from("profiles")
    .select("id, role, is_active, name, academy_id")
    .eq("id", studentId)
    .single();

  if (studentError || !student) {
    return { ok: false, message: "학생을 찾을 수 없습니다." };
  }

  if (academyMismatch(student.academy_id, academyId)) {
    return { ok: false, message: "다른 학원 학생은 추가할 수 없습니다." };
  }

  if (student.role !== "student") {
    return { ok: false, message: "학생 계정만 반에 추가할 수 있습니다." };
  }

  if (student.is_active === false) {
    return { ok: false, message: "비활성화된 학생은 반에 추가할 수 없습니다." };
  }

  // 학원 미지정 학생 → 반/관리자 학원으로 자동 연결
  const targetAcademy = academyId ?? classRow.academy_id ?? null;
  if (targetAcademy && student.academy_id == null) {
    await supabase
      .from("profiles")
      .update({ academy_id: targetAcademy })
      .eq("id", studentId)
      .is("academy_id", null);
  }

  const { data: existingMember } = await supabase
    .from("class_students")
    .select("id")
    .eq("class_id", classId)
    .eq("student_id", studentId)
    .maybeSingle();

  if (existingMember) {
    return { ok: false, message: "이미 이 반에 등록된 학생입니다." };
  }

  const { error: memberError } = await supabase.from("class_students").insert({
    class_id: classId,
    student_id: studentId,
  });

  if (memberError) {
    const duplicate =
      memberError.code === "23505" ||
      memberError.message.toLowerCase().includes("unique");
    return {
      ok: false,
      message: duplicate
        ? "이미 이 반에 등록된 학생입니다."
        : humanizeDbError(memberError.message),
    };
  }

  const { enrolledCount, errors } = await syncEnrollmentsForStudent(
    supabase,
    classId,
    studentId,
    assignedBy
  );

  // 반 스케줄 듣기 배정이 있으면 새 학생 일일 과제도 생성
  try {
    const { ensureStudentScheduleDailyTasks } = await import(
      "@/lib/listening/schedule/today-summary"
    );
    const { getTodayIsoKorea } = await import("@/lib/date/korea-today");
    await ensureStudentScheduleDailyTasks(
      supabase,
      studentId,
      getTodayIsoKorea(),
      { futureDays: 45 }
    );
  } catch {
    // 듣기 과제 생성 실패해도 반 추가는 성공으로 유지
  }

  if (errors.length > 0) {
    return {
      ok: true,
      message: `${student.name} 학생이 반에 추가되었습니다. 수강 배정 ${enrolledCount}건 (일부 오류: ${errors[0]})`,
      enrolledCount,
    };
  }

  return {
    ok: true,
    message:
      enrolledCount > 0
        ? `${student.name} 학생이 반에 추가되었고, 강좌 ${enrolledCount}개가 수강 배정되었습니다.`
        : `${student.name} 학생이 반에 추가되었습니다.`,
    enrolledCount,
  };
}

export async function removeCourseFromClass(
  supabase: SupabaseClient,
  classId: string,
  courseId: string
): Promise<ClassActionResult> {
  const { error } = await supabase
    .from("class_courses")
    .delete()
    .eq("class_id", classId)
    .eq("course_id", courseId);

  if (error) {
    return { ok: false, message: humanizeDbError(error.message) };
  }

  return {
    ok: true,
    message:
      "반에서 강좌 배정이 해제되었습니다. 학생의 기존 수강 등록은 유지됩니다.",
  };
}

export async function removeStudentFromClass(
  supabase: SupabaseClient,
  classId: string,
  studentId: string
): Promise<ClassActionResult> {
  const { error } = await supabase
    .from("class_students")
    .delete()
    .eq("class_id", classId)
    .eq("student_id", studentId);

  if (error) {
    return { ok: false, message: humanizeDbError(error.message) };
  }

  return {
    ok: true,
    message:
      "반에서 학생이 제거되었습니다. 기존 수강 등록은 유지됩니다.",
  };
}
