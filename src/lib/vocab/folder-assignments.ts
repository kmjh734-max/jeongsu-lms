import type { SupabaseClient } from "@supabase/supabase-js";
import { assignVocabSetToStudent } from "@/lib/vocab/class-assignments";

export async function bulkAssignFolderSets(
  supabase: SupabaseClient,
  folderId: string,
  classId: string,
  assignedBy: string,
  studentIds?: string[]
): Promise<
  | { ok: true; assigned: number; skipped: number; setCount: number; studentCount: number }
  | { ok: false; message: string }
> {
  const { data: sets, error: setsError } = await supabase
    .from("vocab_sets")
    .select("id")
    .eq("folder_id", folderId);

  if (setsError) return { ok: false, message: setsError.message };
  if (!sets?.length) {
    return { ok: false, message: "이 폴더에 단어장이 없습니다. 먼저 단어세트를 만드세요." };
  }

  const { data: members, error: membersError } = await supabase
    .from("class_students")
    .select("student_id")
    .eq("class_id", classId);

  if (membersError) return { ok: false, message: membersError.message };

  const targetIds = new Set(
    studentIds?.length
      ? studentIds
      : (members ?? []).map((m) => m.student_id as string)
  );

  if (targetIds.size === 0) {
    return { ok: false, message: "배정할 학생이 없습니다. 반에 학생을 먼저 등록하세요." };
  }

  let assigned = 0;
  let skipped = 0;

  for (const set of sets) {
    for (const studentId of targetIds) {
      const result = await assignVocabSetToStudent(
        supabase,
        set.id as string,
        studentId,
        classId,
        assignedBy
      );
      if (result.ok) {
        assigned++;
      } else if (result.message.includes("이미")) {
        skipped++;
      } else if (result.message.includes("이 반에 등록된 학생이 아닙니다")) {
        skipped++;
      } else {
        return result;
      }
    }
  }

  return {
    ok: true,
    assigned,
    skipped,
    setCount: sets.length,
    studentCount: targetIds.size,
  };
}
