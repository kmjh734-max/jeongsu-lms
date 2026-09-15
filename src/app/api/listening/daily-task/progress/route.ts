import { NextResponse } from "next/server";
import { assertStudentProfile } from "@/lib/listening/schedule/schedule-access";
import { scheduleStudentMonthlySeat } from "@/lib/credits/monthly-seat";
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
      selectedAnswer?: number;
      dictationCompleted?: boolean;
      dictationScore?: number;
    };

    const dailyTaskId = body.dailyTaskId?.trim();
    const questionId = body.questionId?.trim();
    if (!dailyTaskId || !questionId) {
      return jsonError("dailyTaskId와 questionId가 필요합니다.");
    }

    const selectedAnswer =
      typeof body.selectedAnswer === "number" && body.selectedAnswer > 0
        ? Math.floor(body.selectedAnswer)
        : null;

    const result = await updateDailyTaskQuestionProgress(access.admin, {
      dailyTaskId,
      studentId: access.profile.id,
      questionId,
      objectiveCompleted: !!body.objectiveCompleted,
      selectedAnswer,
      dictationCompleted: body.dictationCompleted,
      dictationScore: body.dictationScore,
      requireDictationPass: true,
      dictationPassScore: 80,
    });

    if (!result.ok) return jsonError(result.message ?? "저장 실패");

    // 새 달에 처음 공부하면 이번 달 듣기 이용료를 낸다(응답 뒤에, 잔액이 모자라도 막지 않는다)
    scheduleStudentMonthlySeat({
      academyId: access.profile.academy_id,
      studentId: access.profile.id,
      kind: "listening",
      // 본인 스케줄 과제의 오늘 할 일을 저장했으니 배정은 확인된 셈이다
      assignmentVerified: true,
    });

    return NextResponse.json({
      ok: true,
      taskCompleted: result.taskCompleted ?? false,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "진행 저장 오류";
    return jsonError(message);
  }
}
