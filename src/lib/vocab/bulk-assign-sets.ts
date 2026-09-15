import type { SupabaseClient } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  InsufficientCreditsError,
  debitMonthlyStudentSeat,
} from "@/lib/credits";
import { loadAssignerScope } from "@/lib/vocab/assignment-scope";
import { chunkIds, fetchAllPages, fetchByIdChunks } from "@/lib/vocab/fetch-all";

export interface BulkAssignResult {
  ok: true;
  assigned: number;
  skipped: number;
  setCount: number;
  studentCount: number;
}

type InsertRow = {
  set_id: string;
  student_id: string;
  class_id: string | null;
  assigned_by: string;
};

type InsertedRow = { id: string; set_id: string; student_id: string };

export async function bulkAssignSets(
  supabase: SupabaseClient,
  setIds: string[],
  assignedBy: string,
  options: {
    classId?: string;
    studentIds?: string[];
    academyId?: string | null;
  }
): Promise<BulkAssignResult | { ok: false; message: string }> {
  const uniqueSetIds = [...new Set(setIds.filter(Boolean))];
  if (uniqueSetIds.length === 0) {
    return { ok: false, message: "배정할 단어장이 없습니다." };
  }

  const admin = createAdminClient();
  const scope = await loadAssignerScope(assignedBy, admin);
  if (!scope) return { ok: false, message: "권한을 확인하지 못했어요." };

  // 단어장: 부르는 사람이 읽을 수 있는 것(RLS)만, 학원이 하나여야 한다
  const sets = await fetchByIdChunks<{ id: string; academy_id: string | null }>(
    uniqueSetIds,
    (chunk, from, to) =>
      supabase
        .from("vocab_sets")
        .select("id, academy_id")
        .in("id", chunk)
        .order("id")
        .range(from, to)
  );
  if (sets.length !== uniqueSetIds.length) {
    return { ok: false, message: "배정할 수 없는 단어장이 섞여 있어요." };
  }
  const setAcademies = new Set(sets.map((s) => s.academy_id).filter(Boolean));
  if (setAcademies.size > 1) {
    return { ok: false, message: "다른 학원의 단어장은 함께 배정할 수 없어요." };
  }
  const targetAcademyId =
    ([...setAcademies][0] as string | undefined) ?? scope.academyId ?? null;

  const classId = options.classId ?? null;
  let classMemberIds: Set<string> | null = null;
  if (classId) {
    const members = await fetchAllPages<{ student_id: string }>((from, to) =>
      supabase
        .from("class_students")
        .select("student_id")
        .eq("class_id", classId)
        .order("id")
        .range(from, to)
    );
    classMemberIds = new Set(members.map((m) => m.student_id));
  }

  let targetIds: string[] = [];
  if (options.studentIds?.length) {
    targetIds = [...new Set(options.studentIds.filter(Boolean))];
  } else if (classMemberIds) {
    targetIds = [...classMemberIds];
  } else {
    return { ok: false, message: "배정할 반 또는 학생을 선택해 주세요." };
  }

  if (targetIds.length === 0) {
    return { ok: false, message: "배정할 학생이 없습니다." };
  }

  if (classMemberIds && targetIds.some((sid) => !classMemberIds!.has(sid))) {
    return { ok: false, message: "이 반에 등록된 학생이 아닙니다." };
  }

  // 학생 확인: 같은 학원 학생이어야 하고, 강사는 담당 반·직접 등록한 학생만
  const profiles = await fetchByIdChunks<{
    id: string;
    role: string;
    academy_id: string | null;
  }>(targetIds, (chunk, from, to) =>
    admin
      .from("profiles")
      .select("id, role, academy_id")
      .in("id", chunk)
      .order("id")
      .range(from, to)
  );
  const profileById = new Map(profiles.map((p) => [p.id, p]));
  for (const sid of targetIds) {
    const p = profileById.get(sid);
    if (!p || p.role !== "student") {
      return { ok: false, message: "학생 계정에만 배정할 수 있어요." };
    }
    if (targetAcademyId && p.academy_id !== targetAcademyId) {
      return { ok: false, message: "우리 학원 학생에게만 배정할 수 있어요." };
    }
    if (scope.studentIds && !scope.studentIds.has(sid)) {
      return {
        ok: false,
        message: "담당 반 학생이나 직접 등록한 학생에게만 배정할 수 있어요.",
      };
    }
  }

  // 이미 배정된 짝은 건너뛴다
  const existingKeys = new Set<string>();
  for (const setChunk of chunkIds(uniqueSetIds)) {
    const rows = await fetchByIdChunks<{ set_id: string; student_id: string }>(
      targetIds,
      (chunk, from, to) =>
        supabase
          .from("vocab_assignments")
          .select("set_id, student_id")
          .in("set_id", setChunk)
          .in("student_id", chunk)
          .order("id")
          .range(from, to)
    );
    for (const r of rows) existingKeys.add(`${r.set_id}:${r.student_id}`);
  }

  const toInsert: InsertRow[] = [];
  for (const setId of uniqueSetIds) {
    for (const studentId of targetIds) {
      if (!existingKeys.has(`${setId}:${studentId}`)) {
        toInsert.push({
          set_id: setId,
          student_id: studentId,
          class_id: classId,
          assigned_by: assignedBy,
        });
      }
    }
  }

  const totalPairs = uniqueSetIds.length * targetIds.length;

  if (toInsert.length === 0) {
    return {
      ok: true,
      assigned: 0,
      skipped: totalPairs,
      setCount: uniqueSetIds.length,
      studentCount: targetIds.length,
    };
  }

  // 1) 먼저 넣고, 실제로 들어간 줄만 센다 (그 사이 다른 사람이 넣은 줄은 건너뜀)
  const inserted: InsertedRow[] = [];
  let insertError: string | null = null;
  const chunkSize = 100;
  outer: for (let i = 0; i < toInsert.length; i += chunkSize) {
    const chunk = toInsert.slice(i, i + chunkSize);
    const { data, error } = await supabase
      .from("vocab_assignments")
      .insert(chunk)
      .select("id, set_id, student_id");
    if (!error) {
      inserted.push(...((data ?? []) as InsertedRow[]));
      continue;
    }
    if (error.code !== "23505") {
      insertError = error.message;
      break;
    }
    // 묶음 중 일부가 이미 있으면 묶음 전체가 실패하므로 한 줄씩 다시 넣는다
    for (const row of chunk) {
      const one = await supabase
        .from("vocab_assignments")
        .insert(row)
        .select("id, set_id, student_id")
        .maybeSingle();
      if (!one.error) {
        if (one.data) inserted.push(one.data as InsertedRow);
        continue;
      }
      if (one.error.code === "23505") continue;
      insertError = one.error.message;
      break outer;
    }
  }

  // 2) 새로 배정된 학생만 이번 달 이용료를 낸다 (학생·월마다 한 번, 다시 불러도 중복 차감 없음)
  const chargeAcademyId = options.academyId ?? scope.academyId;
  let rolledBack = 0;
  let creditMessage: string | null = null;
  if (chargeAcademyId && inserted.length > 0) {
    const newStudents = [...new Set(inserted.map((r) => r.student_id))];
    const unpaid = new Set<string>();
    for (const studentId of newStudents) {
      try {
        await debitMonthlyStudentSeat(admin, {
          academyId: chargeAcademyId,
          studentId,
          kind: "vocab",
          actorId: assignedBy,
        });
      } catch (e) {
        unpaid.add(studentId);
        if (!creditMessage) {
          creditMessage =
            e instanceof InsufficientCreditsError
              ? e.message
              : e instanceof Error
                ? e.message
                : "크레딧 차감 실패";
        }
      }
    }
    if (unpaid.size > 0) {
      // 이용료를 내지 못한 학생의 새 배정은 되돌린다
      const rollbackIds = inserted
        .filter((r) => unpaid.has(r.student_id))
        .map((r) => r.id);
      for (const idChunk of chunkIds(rollbackIds)) {
        await admin.from("vocab_assignments").delete().in("id", idChunk);
      }
      rolledBack = rollbackIds.length;
    }
  }

  const assigned = inserted.length - rolledBack;

  if (creditMessage) {
    return {
      ok: false,
      message:
        assigned > 0
          ? `${creditMessage} (${assigned}건은 배정됐어요)`
          : creditMessage,
    };
  }
  if (insertError) {
    return {
      ok: false,
      message:
        assigned > 0 ? `${insertError} (${assigned}건은 배정됐어요)` : insertError,
    };
  }

  return {
    ok: true,
    assigned,
    skipped: totalPairs - assigned,
    setCount: uniqueSetIds.length,
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
