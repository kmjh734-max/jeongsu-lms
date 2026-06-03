import { NextResponse } from "next/server";
import {
  pickPreparedBlankItems,
  prebuildDictationForQuestion,
} from "@/lib/listening/dictation/prebuild-question";
import type { DictationBlankItem } from "@/lib/listening/dictation/types";
import {
  assertStudentListeningQuestionAccess,
  stripBlankAnswersForClient,
} from "@/lib/listening/dictation/student-access";

export const maxDuration = 30;

function jsonError(message: string, status = 200) {
  return NextResponse.json({ ok: false, message }, { status });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      setId?: string;
      questionId?: string;
      attemptNo?: number;
    };

    const setId = body.setId?.trim();
    const questionId = body.questionId?.trim();
    if (!setId || !questionId) {
      return jsonError("setId와 questionId가 필요합니다.");
    }

    const access = await assertStudentListeningQuestionAccess(setId, questionId);
    if (!access.ok) return jsonError(access.message, access.status);

    if (!access.settings.dictation_enabled) {
      return jsonError("이 세트는 Dictation을 사용하지 않습니다.");
    }

    const { admin, profile, question } = access;

    const { data: priorAttempts } = await admin
      .from("listening_dictation_attempts")
      .select("id, blank_items, submitted_at, attempt_no, passed")
      .eq("student_id", profile.id)
      .eq("question_id", questionId)
      .order("attempt_no", { ascending: true });

    if ((priorAttempts ?? []).some((a) => a.passed)) {
      return jsonError("이미 Dictation을 통과한 문항입니다.");
    }

    const openAttempt = (priorAttempts ?? []).find((a) => !a.submitted_at);
    if (openAttempt) {
      const items = openAttempt.blank_items as DictationBlankItem[];
      return NextResponse.json({
        ok: true,
        attemptId: openAttempt.id,
        attemptNo: openAttempt.attempt_no,
        blankItems: stripBlankAnswersForClient(items),
        resumed: true,
        prepared: true,
      });
    }

    const maxNo = (priorAttempts ?? []).reduce(
      (m, a) => Math.max(m, a.attempt_no ?? 0),
      0
    );
    const attemptNo = body.attemptNo ?? maxNo + 1;

    const { data: qRow } = await admin
      .from("listening_questions")
      .select("dictation_blank_items, dictation_blank_variants, dictation_prepared_at")
      .eq("id", questionId)
      .maybeSingle();

    let blankItems = qRow ? pickPreparedBlankItems(qRow, attemptNo) : null;

    if (!blankItems?.length) {
      const built = await prebuildDictationForQuestion(questionId);
      if (!built.ok) {
        return jsonError(
          built.message ??
            "Dictation이 아직 준비되지 않았습니다. 잠시 후 다시 시도하거나 선생님에게 문의하세요."
        );
      }
      const { data: refreshed } = await admin
        .from("listening_questions")
        .select("dictation_blank_items, dictation_blank_variants")
        .eq("id", questionId)
        .maybeSingle();
      blankItems = refreshed ? pickPreparedBlankItems(refreshed, attemptNo) : null;
    }

    if (!blankItems?.length) {
      return jsonError("Dictation 빈칸이 준비되지 않았습니다.");
    }

    const { data: inserted, error: insErr } = await admin
      .from("listening_dictation_attempts")
      .insert({
        student_id: profile.id,
        set_id: setId,
        question_id: questionId,
        attempt_no: attemptNo,
        blank_items: blankItems,
        student_answers: {},
        passed: false,
      })
      .select("id, attempt_no")
      .single();

    if (insErr || !inserted) {
      return jsonError(insErr?.message ?? "Dictation 시도 저장 실패");
    }

    return NextResponse.json({
      ok: true,
      attemptId: inserted.id,
      attemptNo: inserted.attempt_no,
      blankItems: stripBlankAnswersForClient(blankItems),
      prepared: true,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Dictation 시작 오류";
    return jsonError(message);
  }
}
