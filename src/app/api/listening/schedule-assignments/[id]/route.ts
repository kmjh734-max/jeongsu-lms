import { after, NextResponse } from "next/server";
import { getTodayIsoKorea } from "@/lib/date/korea-today";
import {
  buildScheduleEditPatch,
  hasScheduleEditFields,
  loadScheduleTaskHistory,
  rebuildUpcomingScheduleTasks,
  type ScheduleEditBody,
} from "@/lib/listening/schedule/edit-assignment";
import { bootstrapDailyTasksForAssignment } from "@/lib/listening/schedule/generate-daily-tasks";
import { teacherCanManageAssignment } from "@/lib/listening/schedule/list-assignments";
import {
  pauseScheduleAssignment,
} from "@/lib/listening/schedule/pause-assignment";
import { sortSetIdsByRound } from "@/lib/listening/schedule/question-queue";
import {
  assertScheduleManager,
  teacherCanAccessSet,
} from "@/lib/listening/schedule/schedule-access";
import type { ScheduleAssignmentRow } from "@/lib/listening/schedule/types";

export const maxDuration = 120;

function jsonError(message: string, status = 200) {
  return NextResponse.json({ ok: false, message }, { status });
}

type ManagerAccess = Extract<
  Awaited<ReturnType<typeof assertScheduleManager>>,
  { ok: true }
>;

/** 수정 창을 열 때: 시작일을 바꿀 수 있는지, 뺄 수 없는 세트는 무엇인지 */
export async function GET(
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
      id,
      access.profile.academy_id
    );
    if (!allowed) return jsonError("이 과제를 볼 권한이 없습니다.", 403);

    const { data: links } = await access.admin
      .from("listening_schedule_assignment_sets")
      .select("set_id")
      .eq("assignment_id", id);
    const setIds = (links ?? []).map((row) => row.set_id as string);

    const history = await loadScheduleTaskHistory(access.admin, id, setIds);
    return NextResponse.json({ ok: true, ...history });
  } catch (e) {
    const message = e instanceof Error ? e.message : "불러오기 오류";
    return jsonError(message);
  }
}

async function handleScheduleEdit(
  access: ManagerAccess,
  id: string,
  body: ScheduleEditBody & { addSetIds?: string[] }
) {
  const { admin } = access;
  const todayIso = getTodayIsoKorea();

  const { data: currentRow } = await admin
    .from("listening_schedule_assignments")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (!currentRow) return jsonError("과제를 찾을 수 없습니다.", 404);
  const current = currentRow as ScheduleAssignmentRow;

  const { data: existingLinks } = await admin
    .from("listening_schedule_assignment_sets")
    .select("set_id, order_index")
    .eq("assignment_id", id);
  const links = existingLinks ?? [];
  const existingSetIds = links.map((row) => row.set_id as string);
  const existingSet = new Set(existingSetIds);

  const removeSetIds = [
    ...new Set((body.removeSetIds ?? []).filter(Boolean)),
  ];
  if (removeSetIds.some((setId) => !existingSet.has(setId))) {
    return jsonError("이 과제에 없는 세트가 들어 있어요.");
  }

  const addSetIds = [
    ...new Set((body.addSetIds ?? []).filter(Boolean)),
  ].filter((setId) => !existingSet.has(setId));
  for (const setId of addSetIds) {
    const canUse = await teacherCanAccessSet(
      access.profile.id,
      access.profile.role,
      setId,
      access.profile.academy_id
    );
    if (!canUse) {
      return jsonError("접근할 수 없는 듣기 세트가 포함되어 있습니다.", 403);
    }
  }

  if (existingSetIds.length - removeSetIds.length + addSetIds.length < 1) {
    return jsonError("세트를 하나 이상 남겨 주세요.");
  }

  const startChanging =
    typeof body.startDate === "string" &&
    body.startDate.slice(0, 10) !== current.start_date;
  const history =
    startChanging || removeSetIds.length > 0
      ? await loadScheduleTaskHistory(admin, id, existingSetIds, todayIso)
      : { hasHistory: false, reachedSetIds: [] as string[] };

  if (removeSetIds.length > 0) {
    const reached = new Set(history.reachedSetIds);
    const blocked = removeSetIds.filter((setId) => reached.has(setId));
    if (blocked.length > 0) {
      const { data: titleRows } = await admin
        .from("listening_sets")
        .select("id, title")
        .in("id", blocked);
      const names = (titleRows ?? [])
        .map((row) => `「${(row.title as string) ?? "세트"}」`)
        .join(", ");
      return jsonError(
        `${names || "고른 세트"}는 이미 학생들에게 나가서 뺄 수 없어요.`
      );
    }
  }

  const built = buildScheduleEditPatch(current, body, {
    todayIso,
    hasHistory: history.hasHistory,
  });
  if (!built.ok) return jsonError(built.message);

  const setsChanged = removeSetIds.length > 0 || addSetIds.length > 0;
  if (Object.keys(built.patch).length === 0 && !setsChanged) {
    return NextResponse.json({
      ok: true,
      changed: false,
      message: "바뀐 내용이 없어요.",
    });
  }

  const { error: updateErr } = await admin
    .from("listening_schedule_assignments")
    .update({ ...built.patch, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (updateErr) return jsonError(updateErr.message);

  if (removeSetIds.length > 0) {
    const { error } = await admin
      .from("listening_schedule_assignment_sets")
      .delete()
      .eq("assignment_id", id)
      .in("set_id", removeSetIds);
    if (error) return jsonError(error.message);
  }

  if (addSetIds.length > 0) {
    const { data: titleRows } = await admin
      .from("listening_sets")
      .select("id, title")
      .in("id", addSetIds);
    const titleById = new Map(
      (titleRows ?? []).map((row) => [
        row.id as string,
        (row.title as string) ?? "",
      ])
    );
    const ordered = sortSetIdsByRound(addSetIds, titleById);
    const maxOrder = Math.max(
      0,
      ...links.map((row) => row.order_index as number)
    );
    const { error } = await admin
      .from("listening_schedule_assignment_sets")
      .insert(
        ordered.map((setId, index) => ({
          assignment_id: id,
          set_id: setId,
          order_index: maxOrder + index + 1,
        }))
      );
    if (error) return jsonError(error.message);
  }

  let rebuilt: { removedTasks: number; keptStartedTasks: number } | null =
    null;
  if (built.rulesChanged || setsChanged) {
    const { data: fresh } = await admin
      .from("listening_schedule_assignments")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (fresh) {
      rebuilt = await rebuildUpcomingScheduleTasks(
        admin,
        fresh as ScheduleAssignmentRow,
        { todayIso }
      );
    }
  }

  return NextResponse.json({
    ok: true,
    changed: true,
    rebuilt: Boolean(rebuilt),
    message: rebuilt
      ? "배정을 고쳤어요. 아직 시작하지 않은 날부터 새 규칙으로 나가요."
      : "배정을 고쳤어요.",
  });
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
      id,
      access.profile.academy_id
    );
    if (!allowed) return jsonError("이 과제를 수정할 권한이 없습니다.", 403);

    const body = (await request.json()) as ScheduleEditBody & {
      isActive?: boolean;
      /** isActive와 동일 — 일시정지(false) / 재개(true) */
      isPaused?: boolean;
      addSetIds?: string[];
    };

    // 과제명·요일·기간·하루 문항 수·받아쓰기·세트 빼기 (세트 더하기도 함께)
    if (body && typeof body === "object" && hasScheduleEditFields(body)) {
      return await handleScheduleEdit(access, id, body);
    }

    if (Array.isArray(body.addSetIds) && body.addSetIds.length > 0) {
      const addSetIds = body.addSetIds.filter(Boolean);
      for (const setId of addSetIds) {
        const allowed = await teacherCanAccessSet(
          access.profile.id,
          access.profile.role,
          setId,
          access.profile.academy_id
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

      const { data: titleRows } = await access.admin
        .from("listening_sets")
        .select("id, title")
        .in("id", newSetIds);
      const titleById = new Map(
        (titleRows ?? []).map((row) => [
          row.id as string,
          (row.title as string) ?? "",
        ])
      );
      const orderedNewSetIds = sortSetIdsByRound(newSetIds, titleById);

      const maxOrder = Math.max(
        0,
        ...(existingLinks ?? []).map((row) => row.order_index as number)
      );

      const { error: insertErr } = await access.admin
        .from("listening_schedule_assignment_sets")
        .insert(
          orderedNewSetIds.map((setId, index) => ({
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

    const nextActive =
      typeof body.isActive === "boolean"
        ? body.isActive
        : typeof body.isPaused === "boolean"
          ? !body.isPaused
          : undefined;

    if (typeof nextActive === "boolean") {
      if (!nextActive) {
        const { clearedTasks } = await pauseScheduleAssignment(
          access.admin,
          id
        );
        return NextResponse.json({
          ok: true,
          isActive: false,
          clearedTasks,
          message: "듣기 과제를 일시정지했습니다. 재개하면 이어서 배정됩니다.",
        });
      }

      const { data: assignment } = await access.admin
        .from("listening_schedule_assignments")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (!assignment) return jsonError("과제를 찾을 수 없습니다.", 404);

      await access.admin
        .from("listening_schedule_assignments")
        .update({
          is_active: true,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      after(() => {
        void bootstrapDailyTasksForAssignment(
          access.admin,
          assignment as ScheduleAssignmentRow
        ).catch(() => undefined);
      });

      return NextResponse.json({
        ok: true,
        isActive: true,
        message: "듣기 과제를 재개했습니다. 학습 진행 위치부터 이어집니다.",
      });
    }

    return jsonError("변경할 상태(isActive)를 지정해 주세요.");
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
      id,
      access.profile.academy_id
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
