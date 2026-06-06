import { NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { createClient } from "@/lib/supabase/server";
import { canViewStudentReport } from "@/lib/reports/access";
import { analyzeStudentRecord } from "@/lib/student-records/analyze";
import { parseStudentRecordUpload } from "@/lib/student-records/parse-upload";

export const runtime = "nodejs";
export const maxDuration = 180;

function jsonError(message: string, status = 200) {
  return NextResponse.json({ ok: false, message }, { status });
}

export async function POST(request: Request) {
  try {
    const profile = await getCurrentProfile();
    if (!profile || (profile.role !== "admin" && profile.role !== "teacher")) {
      return jsonError("권한이 없습니다.", 403);
    }

    const formData = await request.formData();
    const studentId = String(formData.get("studentId") ?? "").trim();
    if (!studentId) {
      return jsonError("학생을 선택해 주세요.");
    }

    const supabase = await createClient();
    const allowed = await canViewStudentReport(
      supabase,
      profile.role,
      profile.id,
      studentId
    );
    if (!allowed) {
      return jsonError("해당 학생 자료에 접근할 수 없습니다.", 403);
    }

    const { data: student } = await supabase
      .from("profiles")
      .select("id, name")
      .eq("id", studentId)
      .eq("role", "student")
      .maybeSingle();

    if (!student) {
      return jsonError("학생을 찾을 수 없습니다.");
    }

    let parsed;
    try {
      parsed = await parseStudentRecordUpload(formData);
    } catch (e) {
      return jsonError(
        e instanceof Error ? e.message : "파일을 처리하지 못했습니다."
      );
    }

    const combinedText = parsed.textParts.join("\n\n");
    if (!combinedText.trim() && parsed.imageDataUrls.length === 0) {
      return jsonError(
        "학생부 텍스트를 붙여넣거나, PDF/이미지 파일을 업로드해 주세요."
      );
    }

    const result = await analyzeStudentRecord({
      studentId,
      studentName: student.name as string,
      text: combinedText,
      imageDataUrls: parsed.imageDataUrls,
    });

    if (!result.ok) {
      return jsonError(result.message);
    }

    return NextResponse.json({
      ok: true,
      html: result.html,
      studentId,
      studentName: student.name,
      generatedAt: new Date().toISOString(),
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "분석 오류";
    return jsonError(message, 500);
  }
}
