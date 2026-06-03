import { NextResponse } from "next/server";
import { assertStudentProfile } from "@/lib/listening/schedule/schedule-access";
import { updateDailyTaskQuestionProgress } from "@/lib/listening/schedule/update-progress";

function jsonError(message: string, status = 200) {
  return NextResponse.json({ ok: false, message }, { status });
}

export async function POST(request: Request) {
  try {
    const access = await assertStudentProfile();
    if (!access.ok) return jsonError(access.message, access.status);

    const body = (await request.json()) as {
      dailyTaskId?: string;
      questionId?: string;
      objectiveCompleted?: boolean;
      dictationCompleted?: boolean;
      dictationScore?: number;
    };

    const dailyTaskId = body.dailyTaskId?.trim();
    const questionId = body.questionId?.trim();
    if (!dailyTaskId || !questionId) {
      return jsonError("dailyTaskId와 questionId가 필요합니다.");
    }

    const result = await updateDailyTaskQuestionProgress(access.admin, {
      dailyTaskId,
      studentId: access.profile.id,
      questionId,
      objectiveCompleted: !!body.objectiveCompleted,
      dictationCompleted: body.dictationCompleted,
      dictationScore: body.dictationScore,
      requireDictationPass: true,
      dictationPassScore: 80,
    });

    if (!result.ok) return jsonError(result.message ?? "저장 실패");

    return NextResponse.json({
      ok: true,
      taskCompleted: result.taskCompleted ?? false,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "진행 저장 오류";
    return jsonError(message);
  }
}
