"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import {
  addStudentToClass,
  assignCourseToClass,
  removeCourseFromClass,
  removeStudentFromClass,
  type ClassActionResult,
} from "@/lib/classes/class-assignments";
import {
  assignVocabSetToStudent,
  removeVocabAssignment,
} from "@/lib/vocab/class-assignments";
import { revalidateVocabPaths } from "@/lib/vocab/revalidate";

async function requireAdmin(): Promise<
  | { ok: true; profileId: string; academyId: string }
  | { ok: false; message: string }
> {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== "admin") {
    return { ok: false, message: "관리자 권한이 필요합니다." };
  }
  if (!profile.academy_id) {
    return {
      ok: false,
      message:
        "소속 학원 정보가 없습니다. EngCore Admin에서 학원 관리자로 연결해 주세요.",
    };
  }
  return { ok: true, profileId: profile.id, academyId: profile.academy_id };
}

function revalidateClassPaths(classId?: string) {
  revalidatePath("/admin/classes");
  revalidatePath("/admin/students");
  revalidatePath("/student");
  if (classId) {
    revalidatePath(`/admin/classes/${classId}`);
  }
}

export async function createClass(input: {
  name: string;
  description?: string;
  teacherId?: string;
  isActive?: boolean;
}): Promise<ClassActionResult & { classId?: string }> {
  const auth = await requireAdmin();
  if (!auth.ok) return { ok: false, message: auth.message };

  const name = input.name?.trim();
  if (!name) {
    return { ok: false, message: "반 이름을 입력해 주세요." };
  }

  // 인증 후 service role로 삽입 — RLS academy 헬퍼 불일치로 생성이 깨지지 않게
  const admin = createAdminClient();

  if (input.teacherId) {
    const { data: teacher } = await admin
      .from("profiles")
      .select("id, role, academy_id")
      .eq("id", input.teacherId)
      .maybeSingle();
    if (!teacher || teacher.role !== "teacher") {
      return { ok: false, message: "담당 강사 정보가 올바르지 않습니다." };
    }
    if (
      teacher.academy_id != null &&
      teacher.academy_id !== auth.academyId
    ) {
      return { ok: false, message: "다른 학원 강사는 지정할 수 없습니다." };
    }
    if (teacher.academy_id == null) {
      await admin
        .from("profiles")
        .update({ academy_id: auth.academyId })
        .eq("id", teacher.id)
        .is("academy_id", null);
    }
  }

  const { data, error } = await admin
    .from("classes")
    .insert({
      name,
      description: input.description?.trim() || null,
      teacher_id: input.teacherId || null,
      created_by: auth.profileId,
      is_active: input.isActive ?? true,
      academy_id: auth.academyId,
    })
    .select("id")
    .single();

  if (error || !data) {
    const msg = error?.message ?? "반 생성에 실패했습니다.";
    const lower = msg.toLowerCase();
    return {
      ok: false,
      message:
        lower.includes("row-level security") || lower.includes("rls")
          ? "권한 문제로 반을 만들 수 없습니다. 소속 학원 연결을 확인해 주세요."
          : lower.includes("academy")
            ? "학원 정보가 없어 반을 만들 수 없습니다. EngCore Admin에서 학원 관리자로 연결해 주세요."
            : msg,
    };
  }

  revalidateClassPaths(data.id);
  return { ok: true, message: "반이 생성되었습니다.", classId: data.id };
}

export async function updateClass(
  classId: string,
  input: {
    name?: string;
    description?: string;
    teacherId?: string;
    isActive?: boolean;
  }
): Promise<ClassActionResult> {
  const auth = await requireAdmin();
  if (!auth.ok) return { ok: false, message: auth.message };

  const payload: Record<string, unknown> = {};
  if (input.name !== undefined) payload.name = input.name.trim();
  if (input.description !== undefined) {
    payload.description = input.description.trim() || null;
  }
  if (input.teacherId !== undefined) {
    payload.teacher_id = input.teacherId || null;
  }
  if (input.isActive !== undefined) payload.is_active = input.isActive;

  const admin = createAdminClient();
  const { error } = await admin
    .from("classes")
    .update(payload)
    .eq("id", classId)
    .eq("academy_id", auth.academyId);

  if (error) {
    return { ok: false, message: error.message };
  }

  revalidateClassPaths(classId);
  return { ok: true, message: "반 정보가 저장되었습니다." };
}

export async function deleteClass(classId: string): Promise<ClassActionResult> {
  const auth = await requireAdmin();
  if (!auth.ok) return { ok: false, message: auth.message };

  const admin = createAdminClient();

  const { data: existing } = await admin
    .from("classes")
    .select("id, name")
    .eq("id", classId)
    .eq("academy_id", auth.academyId)
    .maybeSingle();

  if (!existing) {
    return { ok: false, message: "반을 찾을 수 없습니다." };
  }

  const { error } = await admin
    .from("classes")
    .update({ is_active: false })
    .eq("id", classId)
    .eq("academy_id", auth.academyId);

  if (error) {
    return { ok: false, message: error.message };
  }

  revalidateClassPaths();
  return {
    ok: true,
    message: `「${existing.name}」 반이 비활성화되었습니다.`,
  };
}

export async function adminAddStudentToClass(
  classId: string,
  studentId: string
): Promise<ClassActionResult> {
  const auth = await requireAdmin();
  if (!auth.ok) return { ok: false, message: auth.message };

  const admin = createAdminClient();
  const result = await addStudentToClass(admin, {
    classId,
    studentId,
    assignedBy: auth.profileId,
    academyId: auth.academyId,
  });

  if (result.ok) revalidateClassPaths(classId);
  return result;
}

export async function adminRemoveStudentFromClass(
  classId: string,
  studentId: string
): Promise<ClassActionResult> {
  const auth = await requireAdmin();
  if (!auth.ok) return { ok: false, message: auth.message };

  const admin = createAdminClient();
  const result = await removeStudentFromClass(admin, classId, studentId);

  if (result.ok) revalidateClassPaths(classId);
  return result;
}

export async function adminAssignCourseToClass(
  classId: string,
  courseId: string
): Promise<ClassActionResult> {
  const auth = await requireAdmin();
  if (!auth.ok) return { ok: false, message: auth.message };

  const admin = createAdminClient();
  const result = await assignCourseToClass(admin, {
    classId,
    courseId,
    assignedBy: auth.profileId,
    allowAnyCourse: true,
    academyId: auth.academyId,
  });

  if (result.ok) revalidateClassPaths(classId);
  return result;
}

export async function adminRemoveCourseFromClass(
  classId: string,
  courseId: string
): Promise<ClassActionResult> {
  const auth = await requireAdmin();
  if (!auth.ok) return { ok: false, message: auth.message };

  const admin = createAdminClient();
  const result = await removeCourseFromClass(admin, classId, courseId);

  if (result.ok) revalidateClassPaths(classId);
  return result;
}

export async function adminAssignVocabSetToStudent(
  classId: string,
  studentId: string,
  setId: string
): Promise<ClassActionResult> {
  const auth = await requireAdmin();
  if (!auth.ok) return { ok: false, message: auth.message };

  const supabase = await createClient();
  const result = await assignVocabSetToStudent(
    supabase,
    setId,
    studentId,
    classId,
    auth.profileId,
    auth.academyId
  );

  if (result.ok) {
    revalidateClassPaths(classId);
    revalidateVocabPaths("admin", { classId });
  }
  return result.ok
    ? { ok: true, message: "학생에게 단어장이 배정되었습니다." }
    : { ok: false, message: result.message };
}

export async function adminRemoveVocabSetFromStudent(
  classId: string,
  assignmentId: string
): Promise<ClassActionResult> {
  const auth = await requireAdmin();
  if (!auth.ok) return { ok: false, message: auth.message };

  const supabase = await createClient();
  const result = await removeVocabAssignment(supabase, assignmentId);

  if (result.ok) {
    revalidateClassPaths(classId);
    revalidateVocabPaths("admin", { classId });
  }
  return result.ok
    ? { ok: true, message: "단어장 배정이 해제되었습니다." }
    : { ok: false, message: result.message };
}
