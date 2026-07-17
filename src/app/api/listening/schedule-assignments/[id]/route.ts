import { after, NextResponse } from "next/server";
import { bootstrapDailyTasksForAssignment } from "@/lib/listening/schedule/generate-daily-tasks";
import { teacherCanManageAssignment } from "@/lib/listening/schedule/list-assignments";
import {
  assertScheduleManager,
  teacherCanAccessSet,
} from "@/lib/listening/schedule/schedule-access";
import type { ScheduleAssignmentRow } from "@/lib/listening/schedule/types";

function jsonError(message: string, status = 200) {
  return NextResponse.json({ ok: false, message }, { status });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const access = await assertScheduleManager();
    if (!access.ok) return jsonError(access.message, access.status);

    const { id } = await params;
    const allowed = await teacherCanManageAssignment(
      access.admin,
      access.profile.role,
      access.profile.id,
      id
    );
    if (!allowed) return jsonError("이 과제를 수정할 권한이 없습니다.", 403);

    const body = (await request.json()) as {
      isActive?: boolean;
      addSetIds?: string[];
    };

    if (Array.isArray(body.addSetIds) && body.addSetIds.length > 0) {
      const addSetIds = body.addSetIds.filter(Boolean);
      for (const setId of addSetIds) {
        const allowed = await teacherCanAccessSet(
          access.profile.id,
          access.profile.role,
          setId
        );
        if (!allowed) {
          return jsonError("접근할 수 없는 듣기 세트가 포함되어 있습니다.", 403);
        }
      }

      const { data: existingLinks } = await access.admin
        .from("listening_schedule_assignment_sets")
        .select("set_id, order_index")
        .eq("assignment_id", id);

      const existingSetIds = new Set(
        (existingLinks ?? []).map((row) => row.set_id as string)
      );
      const newSetIds = addSetIds.filter((setId) => !existingSetIds.has(setId));
      if (newSetIds.length === 0) {
        return jsonError("선택한 세트는 이미 이 과제에 포함되어 있습니다.");
      }

      const maxOrder = Math.max(
        0,
        ...(existingLinks ?? []).map((row) => row.order_index as number)
      );

      const { error: insertErr } = await access.admin
        .from("listening_schedule_assignment_sets")
        .insert(
          newSetIds.map((setId, index) => ({
            assignment_id: id,
            set_id: setId,
            order_index: maxOrder + index + 1,
          }))
        );

      if (insertErr) return jsonError(insertErr.message);

      await access.admin
        .from("listening_schedule_assignments")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", id);

      const { data: assignment } = await access.admin
        .from("listening_schedule_assignments")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (assignment) {
        after(() => {
          void bootstrapDailyTasksForAssignment(
            access.admin,
            assignment as ScheduleAssignmentRow
          ).catch(() => undefined);
        });
      }

      return NextResponse.json({
        ok: true,
        addedSetIds: newSetIds,
        message: `듣기 세트 ${newSetIds.length}개를 추가했습니다.`,
      });
    }

    const patch: { is_active?: boolean; updated_at: string } = {
      updated_at: new Date().toISOString(),
    };
    if (typeof body.isActive === "boolean") {
      patch.is_active = body.isActive;
    }

    const { error } = await access.admin
      .from("listening_schedule_assignments")
      .update(patch)
      .eq("id", id);

    if (error) return jsonError(error.message);

    return NextResponse.json({ ok: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : "수정 오류";
    return jsonError(message);
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const access = await assertScheduleManager();
    if (!access.ok) return jsonError(access.message, access.status);

    const { id } = await params;
    const allowed = await teacherCanManageAssignment(
      access.admin,
      access.profile.role,
      access.profile.id,
      id
    );
    if (!allowed) return jsonError("이 과제를 삭제할 권한이 없습니다.", 403);

    const { error } = await access.admin
      .from("listening_schedule_assignments")
      .delete()
      .eq("id", id);

    if (error) return jsonError(error.message);

    return NextResponse.json({ ok: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : "삭제 오류";
    return jsonError(message);
  }
}
