"use server";

import { revalidatePath } from "next/cache";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { createAdminClient } from "@/lib/supabase/admin";
import { assignVocabSetDirect, removeVocabAssignment } from "@/lib/vocab/class-assignments";
import { InsufficientCreditsError, debitMonthlyStudentSeat } from "@/lib/credits";

type Result = { ok: boolean; message: string };

async function staff() {
  const profile = await getCurrentProfile();
  if (!profile || !["admin", "teacher"].includes(profile.role) || !profile.academy_id) return null;
  return profile;
}

/** 이 학생이 우리 학원 학생인지 */
async function sameAcademyStudent(studentId: string, academyId: string): Promise<boolean> {
  const { data } = await createAdminClient()
    .from("profiles")
    .select("id, role, academy_id")
    .eq("id", studentId)
    .maybeSingle();
  return Boolean(data && data.role === "student" && data.academy_id === academyId);
}

function done(paths = ["/admin/students", "/teacher/students", "/student"]) {
  for (const p of paths) revalidatePath(p);
}

/** 학생 한 명에게 단어장을 붙인다 */
export async function assignVocabToStudent(studentId: string, setId: string): Promise<Result> {
  const profile = await staff();
  if (!profile) return { ok: false, message: "권한이 없어요." };
  if (!studentId || !setId) return { ok: false, message: "학생과 단어장을 골라 주세요." };
  const academyId = profile.academy_id as string;
  if (!(await sameAcademyStudent(studentId, academyId))) {
    return { ok: false, message: "우리 학원 학생이 아니에요." };
  }

  const admin = createAdminClient();
  const r = await assignVocabSetDirect(admin, setId, studentId, profile.id, null, academyId);
  if (!r.ok) return r;
  done();
  return { ok: true, message: "단어장을 배정했어요." };
}

/** 개별로 붙인 단어장을 뗀다 (반에서 온 것은 반 관리에서 뗀다) */
export async function removeVocabFromStudent(assignmentId: string): Promise<Result> {
  const profile = await staff();
  if (!profile) return { ok: false, message: "권한이 없어요." };
  if (!assignmentId) return { ok: false, message: "배정을 찾지 못했어요." };

  const admin = createAdminClient();
  const { data: row } = await admin
    .from("vocab_assignments")
    .select("id, student_id, class_id")
    .eq("id", assignmentId)
    .maybeSingle();
  if (!row) return { ok: false, message: "배정을 찾지 못했어요." };
  if (row.class_id) return { ok: false, message: "반에 배정된 단어장이라 여기서는 뺄 수 없어요." };
  if (!(await sameAcademyStudent(String(row.student_id), profile.academy_id as string))) {
    return { ok: false, message: "우리 학원 학생이 아니에요." };
  }

  const r = await removeVocabAssignment(admin, assignmentId);
  if (!r.ok) return r;
  done();
  return { ok: true, message: "단어장 배정을 뺐어요." };
}

/** 학생 한 명에게 듣기 세트를 붙인다 */
export async function assignListeningToStudent(studentId: string, setId: string): Promise<Result> {
  const profile = await staff();
  if (!profile) return { ok: false, message: "권한이 없어요." };
  if (!studentId || !setId) return { ok: false, message: "학생과 듣기 세트를 골라 주세요." };
  const academyId = profile.academy_id as string;
  if (!(await sameAcademyStudent(studentId, academyId))) {
    return { ok: false, message: "우리 학원 학생이 아니에요." };
  }

  const admin = createAdminClient();
  const { data: set } = await admin
    .from("listening_sets")
    .select("id, academy_id")
    .eq("id", setId)
    .maybeSingle();
  if (!set || set.academy_id !== academyId) {
    return { ok: false, message: "우리 학원 듣기 세트가 아니에요." };
  }

  const { data: existing } = await admin
    .from("listening_assignments")
    .select("id")
    .eq("set_id", setId)
    .eq("student_id", studentId)
    .maybeSingle();
  if (existing) return { ok: false, message: "이 학생에게 이미 배정된 듣기 세트예요." };

  try {
    await debitMonthlyStudentSeat(admin, {
      academyId,
      studentId,
      kind: "listening",
      actorId: profile.id,
    });
  } catch (e) {
    if (e instanceof InsufficientCreditsError) return { ok: false, message: e.message };
    return { ok: false, message: e instanceof Error ? e.message : "크레딧 차감 실패" };
  }

  const { error } = await admin.from("listening_assignments").insert({
    set_id: setId,
    student_id: studentId,
    assigned_by: profile.id,
  });
  if (error) {
    return {
      ok: false,
      message: error.code === "23505" ? "이 학생에게 이미 배정된 듣기 세트예요." : error.message,
    };
  }
  done();
  return { ok: true, message: "듣기 세트를 배정했어요." };
}

/** 개별로 붙인 듣기 세트를 뗀다 */
export async function removeListeningFromStudent(assignmentId: string): Promise<Result> {
  const profile = await staff();
  if (!profile) return { ok: false, message: "권한이 없어요." };
  if (!assignmentId) return { ok: false, message: "배정을 찾지 못했어요." };

  const admin = createAdminClient();
  const { data: row } = await admin
    .from("listening_assignments")
    .select("id, student_id, class_id")
    .eq("id", assignmentId)
    .maybeSingle();
  if (!row) return { ok: false, message: "배정을 찾지 못했어요." };
  if (row.class_id) return { ok: false, message: "반에 배정된 듣기 세트라 여기서는 뺄 수 없어요." };
  if (!row.student_id || !(await sameAcademyStudent(String(row.student_id), profile.academy_id as string))) {
    return { ok: false, message: "우리 학원 학생이 아니에요." };
  }

  const { error } = await admin.from("listening_assignments").delete().eq("id", assignmentId);
  if (error) return { ok: false, message: error.message };
  done();
  return { ok: true, message: "듣기 세트 배정을 뺐어요." };
}
