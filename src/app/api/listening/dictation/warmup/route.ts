import { NextResponse } from "next/server";
import { prebuildDictationForQuestion } from "@/lib/listening/dictation/prebuild-question";
import { assertStudentListeningQuestionAccess } from "@/lib/listening/dictation/student-access";

export const maxDuration = 120;

function jsonError(message: string, status = 200) {
  return NextResponse.json({ ok: false, message }, { status });
}

/** 학생이 객관식 풀 때 백그라운드 Dictation 빈칸 준비 */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      setId?: string;
      questionId?: string;
    };

    const setId = body.setId?.trim();
    const questionId = body.questionId?.trim();
    if (!setId || !questionId) {
      return jsonError("setId와 questionId가 필요합니다.");
    }

    const access = await assertStudentListeningQuestionAccess(setId, questionId);
    if (!access.ok) return jsonError(access.message, access.status);

    if (!access.settings.dictation_enabled) {
      return NextResponse.json({ ok: true, prepared: false, skipped: true });
    }

    // 저장된 빈칸이 있어도 지금 대본과 맞는지 확인한다(대본을 고친 뒤 남은 빈칸은 다시 만든다).
    // 맞으면 캐시를 그대로 쓰고, 맞지 않거나 뻔한 칸이 섞였을 때만 새로 만든다.
    const built = await prebuildDictationForQuestion(questionId, {
      includeVariants: false,
    });

    if (!built.ok) {
      return jsonError(built.message ?? "Dictation 준비 실패");
    }

    return NextResponse.json({
      ok: true,
      prepared: true,
      itemCount: built.itemCount ?? 0,
      cached: built.cached === true,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Dictation 준비 오류";
    return jsonError(message);
  }
}
