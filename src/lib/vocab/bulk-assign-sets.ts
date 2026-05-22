import type { SupabaseClient } from "@supabase/supabase-js";
import { assignVocabSetDirect } from "@/lib/vocab/class-assignments";

export interface BulkAssignResult {
  ok: true;
  assigned: number;
  skipped: number;
  setCount: number;
  studentCount: number;
}

export async function bulkAssignSets(
  supabase: SupabaseClient,
  setIds: string[],
  assignedBy: string,
  options: {
    classId?: string;
    studentIds?: string[];
  }
): Promise<BulkAssignResult | { ok: false; message: string }> {
  if (setIds.length === 0) {
    return { ok: false, message: "배정할 단어장이 없습니다." };
  }

  let targetIds: string[] = [];

  if (options.studentIds?.length) {
    targetIds = [...new Set(options.studentIds)];
  } else if (options.classId) {
    const { data: members, error: membersError } = await supabase
      .from("class_students")
      .select("student_id")
      .eq("class_id", options.classId);

    if (membersError) return { ok: false, message: membersError.message };
    targetIds = (members ?? []).map((m) => m.student_id as string);
  } else {
    return { ok: false, message: "배정할 반 또는 학생을 선택해 주세요." };
  }

  if (targetIds.length === 0) {
    return { ok: false, message: "배정할 학생이 없습니다." };
  }

  let assigned = 0;
  let skipped = 0;
  const classId = options.classId ?? null;

  for (const setId of setIds) {
    for (const studentId of targetIds) {
      const result = await assignVocabSetDirect(
        supabase,
        setId,
        studentId,
        assignedBy,
        classId
      );
      if (result.ok) {
        assigned++;
      } else if (
        result.message.includes("이미") ||
        result.message.includes("등록된 학생이 아닙니다")
      ) {
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
    setCount: setIds.length,
    studentCount: targetIds.length,
  };
}

export function formatBulkAssignSuccess(result: BulkAssignResult): string {
  const base = `단어장 ${result.setCount}개가 배정되었습니다. (신규 ${result.assigned}건`;
  if (result.skipped > 0) {
    return `${base}, ${result.skipped}건은 이미 배정됨)`;
  }
  return `${base})`;
}
