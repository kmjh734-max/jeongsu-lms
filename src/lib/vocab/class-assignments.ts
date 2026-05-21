import type { SupabaseClient } from "@supabase/supabase-js";

export async function assertStudentInClass(
  supabase: SupabaseClient,
  classId: string,
  studentId: string
): Promise<{ ok: true } | { ok: false; message: string }> {
  const { data, error } = await supabase
    .from("class_students")
    .select("id")
    .eq("class_id", classId)
    .eq("student_id", studentId)
    .maybeSingle();

  if (error) return { ok: false, message: error.message };
  if (!data) {
    return { ok: false, message: "이 반에 등록된 학생이 아닙니다." };
  }
  return { ok: true };
}

export async function assignVocabSetToStudent(
  supabase: SupabaseClient,
  setId: string,
  studentId: string,
  classId: string,
  assignedBy: string
): Promise<{ ok: true } | { ok: false; message: string }> {
  const memberCheck = await assertStudentInClass(supabase, classId, studentId);
  if (!memberCheck.ok) return memberCheck;

  const { data: existing } = await supabase
    .from("vocab_assignments")
    .select("id")
    .eq("set_id", setId)
    .eq("student_id", studentId)
    .maybeSingle();

  if (existing) {
    return { ok: false, message: "이 학생에게 이미 배정된 단어장입니다." };
  }

  const { error } = await supabase.from("vocab_assignments").insert({
    set_id: setId,
    student_id: studentId,
    class_id: classId,
    assigned_by: assignedBy,
  });

  if (error) {
    if (error.code === "23505") {
      return { ok: false, message: "이 학생에게 이미 배정된 단어장입니다." };
    }
    return { ok: false, message: error.message };
  }

  return { ok: true };
}

export async function removeVocabAssignment(
  supabase: SupabaseClient,
  assignmentId: string
): Promise<{ ok: true } | { ok: false; message: string }> {
  const { error } = await supabase
    .from("vocab_assignments")
    .delete()
    .eq("id", assignmentId);

  if (error) return { ok: false, message: error.message };
  return { ok: true };
}
