import { NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  chargeMonthlySeatOrError,
  chargeMonthlySeatsForStudents,
} from "@/lib/credits/charge";
import { assertListeningSetAccess } from "@/lib/listening/listening-api-auth";

function jsonError(message: string, status = 200) {
  return NextResponse.json({ ok: false, message }, { status });
}

export async function POST(request: Request) {
  try {
    const profile = await getCurrentProfile();
    if (!profile || (profile.role !== "admin" && profile.role !== "teacher")) {
      return jsonError("권한이 없습니다.", 403);
    }
    if (!profile.academy_id) {
      return jsonError("소속 학원 정보가 없습니다.", 403);
    }

    const body = (await request.json()) as {
      setId?: string;
      classId?: string;
      studentId?: string;
    };
    const setId = body.setId?.trim();
    const classId = body.classId?.trim();
    const studentId = body.studentId?.trim();

    if (!setId) return jsonError("setId가 필요합니다.");
    if (!classId && !studentId) {
      return jsonError("classId 또는 studentId가 필요합니다.");
    }
    if (classId && studentId) {
      return jsonError("반 배정과 학생 배정은 한 번에 하나만 가능합니다.");
    }

    const setAccess = await assertListeningSetAccess(setId);
    if (!setAccess.ok) {
      return jsonError(setAccess.message, setAccess.status);
    }

    const supabase = await createClient();
    const admin = createAdminClient();

    if (studentId) {
      const { data: student } = await admin
        .from("profiles")
        .select("id, academy_id")
        .eq("id", studentId)
        .eq("role", "student")
        .maybeSingle();
      if (!student || student.academy_id !== profile.academy_id) {
        return jsonError("같은 학원 학생만 배정할 수 있습니다.", 403);
      }

      const seatErr = await chargeMonthlySeatOrError({
        academyId: profile.academy_id,
        studentId,
        kind: "listening",
        actorId: profile.id,
      });
      if (seatErr) return seatErr;

      const { error } = await supabase.from("listening_assignments").insert({
        set_id: setId,
        student_id: studentId,
        class_id: null,
        assigned_by: profile.id,
      });

      if (error) {
        if (error.code === "23505") {
          return NextResponse.json({
            ok: true,
            message: "이미 배정된 학생입니다.",
          });
        }
        return jsonError(error.message);
      }

      return NextResponse.json({
        ok: true,
        message: "학생에게 배정했습니다.",
      });
    }

    const { data: cls } = await admin
      .from("classes")
      .select("id, academy_id, teacher_id")
      .eq("id", classId!)
      .maybeSingle();
    if (!cls || cls.academy_id !== profile.academy_id) {
      return jsonError("같은 학원 반만 배정할 수 있습니다.", 403);
    }
    if (profile.role === "teacher" && cls.teacher_id !== profile.id) {
      return jsonError("담당 반만 배정할 수 있습니다.", 403);
    }

    const { data: members } = await admin
      .from("class_students")
      .select("student_id")
      .eq("class_id", classId!);
    const studentIds = (members ?? []).map((m) => m.student_id as string);
    const seatsErr = await chargeMonthlySeatsForStudents({
      academyId: profile.academy_id,
      studentIds,
      kind: "listening",
      actorId: profile.id,
    });
    if (seatsErr) return seatsErr;

    const { error } = await supabase.from("listening_assignments").insert({
      set_id: setId,
      class_id: classId,
      student_id: null,
      assigned_by: profile.id,
    });

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json({
          ok: true,
          message: "이미 배정된 반입니다.",
        });
      }
      return jsonError(error.message);
    }

    return NextResponse.json({
      ok: true,
      message: "반에 배정했습니다.",
    });
  } catch (e) {
    return jsonError(e instanceof Error ? e.message : "배정 실패", 500);
  }
}
