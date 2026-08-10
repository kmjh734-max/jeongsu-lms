import { NextResponse } from "next/server";
import type { DictationBlankItem } from "@/lib/listening/dictation/types";
import { resolveDictationBlankItems } from "@/lib/listening/dictation/resolve-blanks";
import {
  assertStudentListeningQuestionAccess,
  formatDictationStartResponse,
} from "@/lib/listening/dictation/student-access";
import { normalizeDictationText } from "@/lib/listening/dictation/normalize-text";

export const maxDuration = 120;

function jsonError(message: string, status = 200) {
  return NextResponse.json({ ok: false, message }, { status });
}

function collectPreviousBlankWords(
  attempts: Array<{ blank_items: unknown; submitted_at: string | null }>
): string[] {
  const words: string[] = [];
  for (const a of attempts) {
    const items = Array.isArray(a.blank_items)
      ? (a.blank_items as DictationBlankItem[])
      : [];
    for (const item of items) {
      if (item.answer) words.push(item.answer);
    }
  }
  return [...new Set(words.map((w) => normalizeDictationText(w)))].filter(Boolean);
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      setId?: string;
      questionId?: string;
      attemptNo?: number;
      previousBlankWords?: string[];
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

    const { admin, profile, question, settings, segments } = access;
    const dailyTaskId = body.dailyTaskId?.trim();

    let effectivePassScore = settings.dictation_pass_score;
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
          effectivePassScore = assignment.dictation_pass_score as number;
        }
      }
    }

    const { data: priorAttempts } = await admin
      .from("listening_dictation_attempts")
      .select("id, blank_items, submitted_at, attempt_no, passed, score")
      .eq("student_id", profile.id)
      .eq("question_id", questionId)
      .order("attempt_no", { ascending: true });

    const bestScore = (priorAttempts ?? [])
      .filter((a) => a.submitted_at && a.score != null)
      .reduce((m, a) => Math.max(m, a.score as number), -1);

    if (bestScore >= effectivePassScore) {
      return NextResponse.json({
        ok: true,
        alreadyPassed: true,
        score: bestScore,
        passScore: effectivePassScore,
        attemptId: "",
        passageLines: [],
        blanks: [],
      });
    }

    const weakPassed = (priorAttempts ?? []).filter(
      (a) => a.passed && (a.score == null || (a.score as number) < effectivePassScore)
    );
    if (weakPassed.length > 0) {
      await admin
        .from("listening_dictation_attempts")
        .update({ passed: false })
        .in(
          "id",
          weakPassed.map((a) => a.id as string)
        );
    } else if ((priorAttempts ?? []).some((a) => a.passed) && !dailyTaskId) {
      return jsonError("이미 Dictation을 통과한 문항입니다.");
    }

    const openAttempt = (priorAttempts ?? []).find((a) => !a.submitted_at);
    if (openAttempt) {
      await admin
        .from("listening_dictation_attempts")
        .delete()
        .eq("id", openAttempt.id);
    }

    const maxNo = (priorAttempts ?? []).reduce(
      (m, a) => Math.max(m, a.attempt_no ?? 0),
      0
    );
    const attemptNo = body.attemptNo ?? maxNo + 1;

    const previousBlankWords =
      body.previousBlankWords ??
      (settings.dictation_randomize_on_retry
        ? collectPreviousBlankWords(
            (priorAttempts ?? []).filter((a) => a.submitted_at)
          )
        : []);

    const blankItems = await resolveDictationBlankItems({
      admin,
      questionId,
      scriptText: question.script_text ?? "",
      questionType: question.question_type ?? "",
      answerClue: question.answer_clue ?? "",
      segments,
      settings,
      attemptNo,
      avoidWords: previousBlankWords,
    });

    if (!blankItems.length) {
      return jsonError("Dictation 빈칸을 만들 수 없습니다. 대본을 확인하세요.");
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
      settings,
    });
    if (!payload.blanks?.length) {
      return jsonError("Dictation 빈칸을 표시하지 못했습니다. 다시 시도해 주세요.");
    }

    return NextResponse.json({
      ok: true,
      ...payload,
      attemptNo: inserted.attempt_no,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Dictation 생성 오류";
    return jsonError(message);
  }
}
