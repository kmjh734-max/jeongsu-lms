import { NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { createClient } from "@/lib/supabase/server";

function jsonError(message: string, status = 200) {
  return NextResponse.json({ ok: false, message }, { status });
}

async function publishSetForStudents(
  supabase: Awaited<ReturnType<typeof createClient>>,
  setId: string
) {
  await supabase
    .from("listening_sets")
    .update({ is_published: true })
    .eq("id", setId);
}

export async function POST(request: Request) {
  try {
    const profile = await getCurrentProfile();
    if (!profile || (profile.role !== "admin" && profile.role !== "teacher")) {
      return jsonError("권한이 없습니다.", 403);
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

    const supabase = await createClient();

    if (studentId) {
      const { error } = await supabase.from("listening_assignments").insert({
        set_id: setId,
        student_id: studentId,
        class_id: null,
        assigned_by: profile.id,
      });

      if (error) {
        if (error.code === "23505") {
          await publishSetForStudents(supabase, setId);
          return NextResponse.json({
            ok: true,
            message: "이미 배정된 학생입니다. 공개 상태로 맞춰 두었습니다.",
          });
        }
        return jsonError(error.message);
      }

      await publishSetForStudents(supabase, setId);
      return NextResponse.json({
        ok: true,
        message: "학생에게 배정했고 공개했습니다.",
      });
    }

    const { error } = await supabase.from("listening_assignments").insert({
      set_id: setId,
      class_id: classId,
      student_id: null,
      assigned_by: profile.id,
    });

    if (error) {
      if (error.code === "23505") {
        await publishSetForStudents(supabase, setId);
        return NextResponse.json({
          ok: true,
          message: "이미 배정된 반입니다. 학생에게 보이도록 공개 상태로 맞춰 두었습니다.",
        });
      }
      return jsonError(error.message);
    }

    await publishSetForStudents(supabase, setId);

    return NextResponse.json({
      ok: true,
      message: "반에 배정했고 학생에게 공개했습니다.",
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "배정 실패";
    return jsonError(message);
  }
}
