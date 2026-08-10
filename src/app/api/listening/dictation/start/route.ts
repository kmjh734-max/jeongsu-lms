import { NextResponse } from "next/server";
import type { DictationBlankItem } from "@/lib/listening/dictation/types";
import { resolveDictationBlankItems } from "@/lib/listening/dictation/resolve-blanks";
import {
  assertStudentListeningQuestionAccess,
  formatDictationStartResponse,
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
      dailyTaskId?: string;
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

    const { admin, profile, question, segments } = access;
    const dailyTaskId = body.dailyTaskId?.trim();

    let assignmentPassScore: number | null = null;
    if (dailyTaskId) {
      const { data: task } = await admin
        .from("listening_daily_tasks")
        .select("assignment_id, student_id")
        .eq("id", dailyTaskId)
        .maybeSingle();
      if (task && task.student_id === profile.id) {
        const { data: assignment } = await admin
          .from("listening_schedule_assignments")
          .select("dictation_pass_score")
          .eq("id", task.assignment_id)
          .maybeSingle();
        if (assignment?.dictation_pass_score != null) {
          assignmentPassScore = assignment.dictation_pass_score as number;
        }
      }
    }
    const effectivePassScore =
      assignmentPassScore ?? access.settings.dictation_pass_score;

    const { data: priorAttempts } = await admin
      .from("listening_dictation_attempts")
      .select("id, blank_items, submitted_at, attempt_no, passed, score")
      .eq("student_id", profile.id)
      .eq("question_id", questionId)
      .order("attempt_no", { ascending: true });

    const bestPassed = (priorAttempts ?? [])
      .filter((a) => a.submitted_at && a.score != null)
      .sort((a, b) => (b.score as number) - (a.score as number))[0];

    if (bestPassed && (bestPassed.score as number) >= effectivePassScore) {
      return NextResponse.json({
        ok: true,
        alreadyPassed: true,
        score: bestPassed.score,
        passScore: effectivePassScore,
        attemptId: bestPassed.id,
        passageLines: [],
        blanks: [],
      });
    }

    // 세트 기준 passed 이지만 배정 점수 미달 → 재도전 허용
    if ((priorAttempts ?? []).some((a) => a.passed)) {
      const weak = (priorAttempts ?? []).filter(
        (a) =>
          a.passed &&
          a.score != null &&
          (a.score as number) < effectivePassScore
      );
      if (weak.length > 0) {
        await admin
          .from("listening_dictation_attempts")
          .update({ passed: false })
          .in(
            "id",
            weak.map((a) => a.id as string)
          );
      } else if (!dailyTaskId) {
        return jsonError("이미 Dictation을 통과한 문항입니다.");
      }
    }

    const openAttempt = (priorAttempts ?? []).find((a) => !a.submitted_at);
    if (openAttempt) {
      const resolved = await resolveDictationBlankItems({
        admin,
        questionId,
        scriptText: question.script_text ?? "",
        questionType: question.question_type ?? "",
        answerClue: question.answer_clue ?? "",
        segments,
        settings: access.settings,
        attemptNo: openAttempt.attempt_no ?? 1,
        seedItems: openAttempt.blank_items as DictationBlankItem[],
      });

      if (!resolved.length) {
        return jsonError("Dictation 빈칸을 불러오지 못했습니다.");
      }

      await admin
        .from("listening_dictation_attempts")
        .update({ blank_items: resolved })
        .eq("id", openAttempt.id);

      const payload = formatDictationStartResponse(openAttempt.id, resolved, {
        question,
        segments,
        settings: access.settings,
      });
      if (!payload.blanks?.length) {
        return jsonError("Dictation 빈칸을 표시하지 못했습니다. 다시 시도해 주세요.");
      }

      return NextResponse.json({
        ok: true,
        ...payload,
        attemptNo: openAttempt.attempt_no,
        resumed: true,
        prepared: true,
      });
    }

    const maxNo = (priorAttempts ?? []).reduce(
      (m, a) => Math.max(m, a.attempt_no ?? 0),
      0
    );
    const attemptNo = body.attemptNo ?? maxNo + 1;

    const blankItems = await resolveDictationBlankItems({
      admin,
      questionId,
      scriptText: question.script_text ?? "",
      questionType: question.question_type ?? "",
      answerClue: question.answer_clue ?? "",
      segments,
      settings: access.settings,
      attemptNo,
    });

    if (!blankItems.length) {
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

    const payload = formatDictationStartResponse(inserted.id, blankItems, {
      question,
      segments,
      settings: access.settings,
    });
    if (!payload.blanks?.length) {
      return jsonError("Dictation 빈칸을 표시하지 못했습니다. 다시 시도해 주세요.");
    }

    return NextResponse.json({
      ok: true,
      ...payload,
      attemptNo: inserted.attempt_no,
      prepared: true,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Dictation 시작 오류";
    return jsonError(message);
  }
}
