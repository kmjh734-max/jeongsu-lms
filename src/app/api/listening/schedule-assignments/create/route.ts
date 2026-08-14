import { after, NextResponse } from "next/server";
import { bootstrapDailyTasksForAssignment } from "@/lib/listening/schedule/generate-daily-tasks";
import { sortSetIdsByRound } from "@/lib/listening/schedule/question-queue";
import {
  assertScheduleManager,
  teacherCanAccessClass,
  teacherCanAccessSet,
} from "@/lib/listening/schedule/schedule-access";

export const maxDuration = 120;

function jsonError(message: string, status = 200) {
  return NextResponse.json({ ok: false, message }, { status });
}

export async function POST(request: Request) {
  try {
    const access = await assertScheduleManager();
    if (!access.ok) return jsonError(access.message, access.status);

    const body = (await request.json()) as {
      title?: string;
      description?: string;
      targetType?: "class" | "student";
      targetClassId?: string | null;
      targetStudentId?: string | null;
      setIds?: string[];
      startDate?: string;
      endDate?: string | null;
      daysOfWeek?: number[];
      questionsPerDay?: number;
      requireDictationPass?: boolean;
      dictationPassScore?: number;
      lockNextUntilTodayComplete?: boolean;
    };

    const title = body.title?.trim();
    const targetType = body.targetType;
    const setIds = (body.setIds ?? []).filter(Boolean);
    const startDate = body.startDate?.slice(0, 10);
    const daysOfWeek = body.daysOfWeek ?? [1, 2, 3, 4, 5];

    if (!title) return jsonError("과제명이 필요합니다.");
    if (targetType !== "class" && targetType !== "student") {
      return jsonError("배정 대상을 선택하세요.");
    }
    if (setIds.length === 0) return jsonError("듣기 세트를 1개 이상 선택하세요.");
    if (!startDate) return jsonError("시작일이 필요합니다.");
    if (!daysOfWeek.length) return jsonError("학습 요일을 선택하세요.");

    const targetClassId =
      targetType === "class" ? body.targetClassId?.trim() ?? null : null;
    const targetStudentId =
      targetType === "student" ? body.targetStudentId?.trim() ?? null : null;

    if (targetType === "class" && !targetClassId) {
      return jsonError("반을 선택하세요.");
    }
    if (targetType === "student" && !targetStudentId) {
      return jsonError("학생을 선택하세요.");
    }

    if (targetStudentId) {
      const { data: student } = await access.admin
        .from("profiles")
        .select("id, academy_id")
        .eq("id", targetStudentId)
        .eq("role", "student")
        .maybeSingle();
      if (!student || student.academy_id !== access.profile.academy_id) {
        return jsonError("같은 학원 학생만 배정할 수 있습니다.", 403);
      }
    }

    for (const setId of setIds) {
      const allowed = await teacherCanAccessSet(
        access.profile.id,
        access.profile.role,
        setId,
        access.profile.academy_id
      );
      if (!allowed) return jsonError("접근할 수 없는 듣기 세트가 포함되어 있습니다.", 403);
    }

    if (targetClassId) {
      const allowed = await teacherCanAccessClass(
        access.profile.id,
        access.profile.role,
        targetClassId,
        access.profile.academy_id
      );
      if (!allowed) return jsonError("담당 반만 배정할 수 있습니다.", 403);
    }

    const { admin } = access;

    const { data: setTitleRows } = await admin
      .from("listening_sets")
      .select("id, title")
      .in("id", setIds);
    const titleById = new Map(
      (setTitleRows ?? []).map((row) => [row.id as string, (row.title as string) ?? ""])
    );
    const orderedSetIds = sortSetIdsByRound(setIds, titleById);

    const { data: inserted, error } = await admin
      .from("listening_schedule_assignments")
      .insert({
        title,
        description: body.description?.trim() || null,
        assigned_by: access.profile.id,
        target_type: targetType,
        target_class_id: targetClassId,
        target_student_id: targetStudentId,
        start_date: startDate,
        end_date: body.endDate?.slice(0, 10) ?? null,
        days_of_week: daysOfWeek,
        questions_per_day: body.questionsPerDay ?? 5,
        require_dictation_pass: body.requireDictationPass !== false,
        dictation_pass_score: body.dictationPassScore ?? 80,
        lock_next_until_today_complete:
          body.lockNextUntilTodayComplete !== false,
        is_active: true,
        academy_id: access.profile.academy_id,
      })
      .select("id")
      .single();

    if (error || !inserted) {
      return jsonError(error?.message ?? "과제 저장 실패");
    }

    const setRows = orderedSetIds.map((setId, i) => ({
      assignment_id: inserted.id,
      set_id: setId,
      order_index: i + 1,
    }));

    const { error: setErr } = await admin
      .from("listening_schedule_assignment_sets")
      .insert(setRows);

    if (setErr) {
      await admin
        .from("listening_schedule_assignments")
        .delete()
        .eq("id", inserted.id);
      return jsonError(setErr.message);
    }

    const { data: assignment } = await admin
      .from("listening_schedule_assignments")
      .select("*")
      .eq("id", inserted.id)
      .single();

    if (assignment) {
      after(() => {
        void bootstrapDailyTasksForAssignment(admin, assignment).catch(
          () => undefined
        );
      });
    }

    return NextResponse.json({
      ok: true,
      assignmentId: inserted.id,
      message: "듣기 스케줄 과제를 배정했습니다.",
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "배정 오류";
    return jsonError(message);
  }
}
