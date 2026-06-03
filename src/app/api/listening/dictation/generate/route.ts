import { NextResponse } from "next/server";
import { assertListeningOpenAiEnv } from "@/lib/listening/assert-listening-openai";
import { generateDictationBlanks } from "@/lib/listening/dictation/generate-blanks";
import type { DictationBlankItem } from "@/lib/listening/dictation/types";
import {
  assertStudentListeningQuestionAccess,
  stripBlankAnswersForClient,
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

    const { data: priorAttempts } = await admin
      .from("listening_dictation_attempts")
      .select("id, blank_items, submitted_at, attempt_no, passed")
      .eq("student_id", profile.id)
      .eq("question_id", questionId)
      .order("attempt_no", { ascending: true });

    const submitted = (priorAttempts ?? []).filter((a) => a.submitted_at);
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
      });
    }

    const maxNo = (priorAttempts ?? []).reduce(
      (m, a) => Math.max(m, a.attempt_no ?? 0),
      0
    );
    const attemptNo = body.attemptNo ?? maxNo + 1;

    const previousBlankWords =
      body.previousBlankWords ??
      (settings.dictation_randomize_on_retry
        ? collectPreviousBlankWords(submitted)
        : []);

    let apiKey: string | undefined;
    try {
      ({ apiKey } = assertListeningOpenAiEnv());
    } catch {
      apiKey = undefined;
    }

    const blankItems = apiKey
      ? await generateDictationBlanks({
          apiKey,
          questionType: question.question_type ?? "",
          scriptText: question.script_text ?? "",
          segments,
          answerClue: question.answer_clue ?? "",
          blankLevel: settings.dictation_blank_level,
          previousBlankWords,
        })
      : await import("@/lib/listening/dictation/fallback-blanks").then((m) =>
          m.buildFallbackDictationBlanks({
            scriptText: question.script_text ?? "",
            segments,
            blankLevel: settings.dictation_blank_level,
            previousBlankWords,
            answerClue: question.answer_clue ?? "",
          })
        );

    if (blankItems.length === 0) {
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

    return NextResponse.json({
      ok: true,
      attemptId: inserted.id,
      attemptNo: inserted.attempt_no,
      blankItems: stripBlankAnswersForClient(blankItems),
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Dictation 생성 오류";
    return jsonError(message);
  }
}
