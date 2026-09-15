import { after, NextResponse } from "next/server";
import { getTodayIsoKorea } from "@/lib/date/korea-today";
import { addDaysIso } from "@/lib/listening/schedule/edit-assignment";
import { teacherCanManageAssignment } from "@/lib/listening/schedule/list-assignments";
import { loadSchedulePauses } from "@/lib/listening/schedule/load-pauses";
import {
  PAUSE_UNTIL_MAX_DAYS,
  pauseScheduleAssignment,
  regenerateUpcomingScheduleTasks,
  resumeScheduleAssignment,
} from "@/lib/listening/schedule/pause-assignment";
import {
  pauseStateOn,
  type SchedulePauseMember,
  type SchedulePauseState,
} from "@/lib/listening/schedule/pauses";
import { assertScheduleManager } from "@/lib/listening/schedule/schedule-access";
import type { ScheduleAssignmentRow } from "@/lib/listening/schedule/types";

export const maxDuration = 120;

function jsonError(message: string, status = 200) {
  return NextResponse.json({ ok: false, message }, { status });
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function isValidDateIso(value: string): boolean {
  if (!DATE_RE.test(value)) return false;
  const d = new Date(`${value}T12:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === value;
}

async function loadManagedAssignment(id: string) {
  const access = await assertScheduleManager();
  if (!access.ok) return { error: jsonError(access.message, access.status) };

  const allowed = await teacherCanManageAssignment(
    access.admin,
    access.profile.role,
    access.profile.id,
    id,
    access.profile.academy_id
  );
  if (!allowed) {
    return { error: jsonError("이 과제를 바꿀 권한이 없습니다.", 403) };
  }

  const { data: row } = await access.admin
    .from("listening_schedule_assignments")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (!row) return { error: jsonError("과제를 찾을 수 없습니다.", 404) };

  return { access, assignment: row as ScheduleAssignmentRow };
}

/** 반 배정의 학생 목록과 학생별 일시정지 상태 (펼쳐 볼 때 읽는다) */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const loaded = await loadManagedAssignment(id);
    if ("error" in loaded) return loaded.error;
    const { access, assignment } = loaded;
    const { admin } = access;

    if (assignment.target_type !== "class" || !assignment.target_class_id) {
      return NextResponse.json({ ok: true, members: [] as SchedulePauseMember[] });
    }

    const todayIso = getTodayIsoKorea();
    const [{ data: links }, pauseMap] = await Promise.all([
      admin
        .from("class_students")
        .select("student_id")
        .eq("class_id", assignment.target_class_id),
      loadSchedulePauses(admin, [assignment.id]),
    ]);
    const studentIds = [
      ...new Set((links ?? []).map((l) => l.student_id as string)),
    ];
    const ranges = pauseMap.get(assignment.id) ?? [];

    const stateByStudent = new Map<string, SchedulePauseState>();
    for (const sid of studentIds) {
      const state = pauseStateOn(
        ranges.filter((r) => r.studentId === sid),
        todayIso
      );
      if (state) stateByStudent.set(sid, state);
    }

    const profileIds = [
      ...new Set([
        ...studentIds,
        ...[...stateByStudent.values()]
          .map((s) => s.pausedBy)
          .filter((v): v is string => Boolean(v)),
      ]),
    ];
    const { data: profiles } = profileIds.length
      ? await admin
          .from("profiles")
          .select("id, name, is_active")
          .in("id", profileIds)
      : { data: [] as { id: string; name: string; is_active: boolean }[] };
    const profileById = new Map(
      (profiles ?? []).map((p) => [p.id as string, p])
    );

    const members: SchedulePauseMember[] = studentIds
      .filter((sid) => profileById.get(sid)?.is_active !== false)
      .map((sid) => {
        const state = stateByStudent.get(sid) ?? null;
        return {
          studentId: sid,
          name: (profileById.get(sid)?.name as string | undefined) ?? "학생",
          pause: state
            ? {
                ...state,
                pausedByName: state.pausedBy
                  ? ((profileById.get(state.pausedBy)?.name as string | undefined) ?? null)
                  : null,
              }
            : null,
        };
      })
      .sort((a, b) => a.name.localeCompare(b.name, "ko"));

    return NextResponse.json({ ok: true, members });
  } catch (e) {
    const message = e instanceof Error ? e.message : "불러오기 오류";
    return jsonError(message);
  }
}

/**
 * 일시정지 / 재개
 * body: { paused: boolean, studentId?: string | null, until?: "YYYY-MM-DD" | null }
 * - studentId 없음: 과제 전체 (반 배정·학생 배정)
 * - studentId 있음: 반 배정 안의 이 학생만
 * - until: 이날부터 저절로 다시 나간다 (멈출 때만)
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const loaded = await loadManagedAssignment(id);
    if ("error" in loaded) return loaded.error;
    const { access, assignment } = loaded;
    const { admin } = access;

    const body = (await request.json().catch(() => null)) as {
      paused?: unknown;
      studentId?: unknown;
      until?: unknown;
    } | null;
    if (!body || typeof body.paused !== "boolean") {
      return jsonError("일시정지 여부(paused)를 지정해 주세요.", 400);
    }

    const todayIso = getTodayIsoKorea();

    let studentId: string | null = null;
    if (typeof body.studentId === "string" && body.studentId) {
      if (assignment.target_type === "student") {
        // 학생 배정은 과제 전체가 곧 그 학생
        if (body.studentId !== assignment.target_student_id) {
          return jsonError("이 과제의 학생이 아니에요.", 400);
        }
      } else {
        const { data: member } = await admin
          .from("class_students")
          .select("student_id")
          .eq("class_id", assignment.target_class_id as string)
          .eq("student_id", body.studentId)
          .maybeSingle();
        if (!member) return jsonError("이 반의 학생이 아니에요.", 400);
        studentId = body.studentId;
      }
    }

    let untilIso: string | null = null;
    if (body.paused && typeof body.until === "string" && body.until) {
      if (!isValidDateIso(body.until)) {
        return jsonError("다시 시작할 날짜를 확인해 주세요.", 400);
      }
      if (body.until <= todayIso) {
        return jsonError("다시 시작할 날은 내일 이후로 골라 주세요.", 400);
      }
      if (body.until > addDaysIso(todayIso, PAUSE_UNTIL_MAX_DAYS)) {
        return jsonError("다시 시작할 날은 1년 안으로 골라 주세요.", 400);
      }
      untilIso = body.until;
    }

    const result = body.paused
      ? await pauseScheduleAssignment(admin, {
          assignment,
          studentId,
          untilIso,
          actorId: access.profile.id,
          todayIso,
        })
      : await resumeScheduleAssignment(admin, {
          assignment,
          studentId,
          actorId: access.profile.id,
          todayIso,
        });

    if (!result.ok) return jsonError(result.message);

    // 다시 나가는 날부터의 과제는 응답 뒤에 다시 짠다 (재개 · 다시 시작할 날을 정한 멈춤)
    if (!body.paused || untilIso) {
      after(() =>
        regenerateUpcomingScheduleTasks(
          admin,
          assignment.id,
          studentId ? [studentId] : null,
          todayIso
        ).catch(() => undefined)
      );
    }

    return NextResponse.json({ ok: true, message: result.message });
  } catch (e) {
    const message = e instanceof Error ? e.message : "처리 오류";
    return jsonError(message);
  }
}
