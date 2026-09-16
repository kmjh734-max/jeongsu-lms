import { NextResponse } from "next/server";
import type { ListeningDifficultyMode } from "@/lib/listening/exam-difficulty";
import { fetchListeningSetGradeLevel } from "@/lib/listening/fetch-set-grade";
import { assertListeningOpenAiEnv } from "@/lib/listening/assert-listening-openai";
import {
  generateSingleExamQuestion,
  type Type1RegenerationContext,
} from "@/lib/listening/generate-questions";
import {
  buildType1AvoidList,
  findType1SubjectFromAnswer,
} from "@/lib/listening/type1-subject-pool";
import { assertListeningSetWritable } from "@/lib/listening/listening-api-auth";
import { loadCurriculumVariety } from "@/lib/listening/curriculum-answer-usage";
import { CREDIT_FEATURES } from "@/lib/credits";
import { debitLessonCredits, lessonCreditShortfall } from "@/lib/credits/lesson-credits";
import { replaceGeneratedQuestion } from "@/lib/listening/persist-questions";
import {
  examTypeCode,
  getExamTypeById,
  templateForStoredQuestion,
} from "@/lib/listening/exam-types";
import { resolveQuestionTypeKey, variantOfStoredQuestion } from "@/lib/listening/legacy-type-map";

export const maxDuration = 300;

function jsonError(message: string, status = 200) {
  return NextResponse.json({ ok: false, message }, { status });
}

export async function POST(request: Request) {
  try {
    let apiKey: string;
    try {
      ({ apiKey } = assertListeningOpenAiEnv());
    } catch (e) {
      return jsonError(e instanceof Error ? e.message : "OpenAI 설정 오류");
    }

    const body = (await request.json()) as {
      setId?: string;
      questionId?: string;
      typeId?: number;
      orderIndex?: number;
      questionType?: string;
      difficultyMode?: ListeningDifficultyMode;
      previousProblems?: string[];
    };

    const setId = body.setId?.trim();
    const questionId = body.questionId?.trim();
    if (!setId || !questionId) {
      return jsonError("setId와 questionId가 필요합니다.");
    }

    const access = await assertListeningSetWritable(setId);
    if (!access.ok) return jsonError(access.message, access.status);

    // 문항 하나를 새로 만들 때마다 한 문항 값을 쓴다.
    const academyId = access.setRow.academy_id ?? access.profile.academy_id ?? null;
    if (academyId) {
      const shortfall = await lessonCreditShortfall(academyId, CREDIT_FEATURES.listening_generate_questions);
      if (shortfall) return jsonError(shortfall, 402);
    }

    const { data: existing } = await access.admin
      .from("listening_questions")
      .select(
        "id, order_index, question_type, instruction, question_text, blank_speaker, quality_issues, answer_validation, situation_type, choices, correct_answer, script_text"
      )
      .eq("id", questionId)
      .eq("set_id", setId)
      .maybeSingle();

    if (!existing) return jsonError("문항을 찾을 수 없습니다.");

    const gradeLevel = await fetchListeningSetGradeLevel(setId);
    // 번호가 아니라 저장된 문항의 이름·지시문으로 유형을 정한다.
    // 중2·중3의 예전 세트(중1 배치)는 지금 배치표와 번호별 유형이 달라, 번호로 찾으면 다른 유형으로 다시 만들어졌다.
    const stored = {
      order_index: Number(existing.order_index),
      question_type: existing.question_type as string | null,
      instruction: existing.instruction as string | null,
      question_text: existing.question_text as string | null,
      blank_speaker: existing.blank_speaker as string | null,
      choices: Array.isArray(existing.choices) ? (existing.choices as string[]) : [],
    };
    const typeKey = resolveQuestionTypeKey(stored, gradeLevel);
    const slotIndex = existing.order_index;
    const typeId = slotIndex;
    const type = typeKey
      ? templateForStoredQuestion(stored, gradeLevel)
      : getExamTypeById(body.typeId ?? body.orderIndex ?? existing.order_index, gradeLevel);
    if (!type) return jsonError("유형을 찾을 수 없습니다.");
    const code = examTypeCode(type);
    const variant = typeKey ? variantOfStoredQuestion(typeKey, stored) : undefined;

    const prevFromBody = body.previousProblems ?? [];
    const storedIssues = Array.isArray(existing.quality_issues)
      ? (existing.quality_issues as Array<{ message?: string }>).map(
          (i) => i.message ?? ""
        )
      : [];
    const storedValidation = existing.answer_validation as {
      problems?: string[];
    } | null;
    const prevFromValidation = storedValidation?.problems ?? [];
    const previousProblems = [
      ...prevFromBody,
      ...storedIssues.filter(Boolean),
      ...prevFromValidation,
    ];

    const existingChoices = Array.isArray(existing.choices)
      ? (existing.choices as string[])
      : [];
    const previousAnswer =
      existingChoices[(Number(existing.correct_answer) || 1) - 1] ?? "";
    const previousSubjectId = String(existing.situation_type ?? "").trim();
    const inferredSubjectId = findType1SubjectFromAnswer(previousAnswer)?.id;

    if (code === 1) {
      previousProblems.push(
        ...buildType1AvoidList([
          {
            order_index: existing.order_index,
            situation_type: previousSubjectId || inferredSubjectId,
            choices: existingChoices,
            correct_answer: Number(existing.correct_answer) || 1,
          },
        ])
      );
    }

    const trimmedProblems = previousProblems.filter(Boolean).slice(0, 12);

    let type1Regeneration: Type1RegenerationContext | undefined;
    if (code === 1) {
      const excludeSubjectIds = [
        ...new Set(
          [previousSubjectId, inferredSubjectId].filter((id): id is string =>
            Boolean(id)
          )
        ),
      ];
      type1Regeneration = {
        excludeSubjectIds,
        previousAnswer: previousAnswer || undefined,
        previousScript: String(existing.script_text ?? "").trim() || undefined,
      };
    }

    // 같은 과정에서 이미 쓴 정답 + 이번 문항의 이전 정답은 덜 고르게 한다
    const curriculum = await loadCurriculumVariety(access.admin, setId, gradeLevel);
    const usedAnswers = curriculum.usage[code] ?? [];
    if (previousAnswer) usedAnswers.push(previousAnswer, previousAnswer);

    const generated = await generateSingleExamQuestion(
      apiKey,
      typeId,
      body.difficultyMode ?? "auto",
      trimmedProblems.length ? trimmedProblems : undefined,
      gradeLevel,
      slotIndex,
      type1Regeneration,
      // 같은 유형·같은 변형(응답 방향 등)으로 다시 만든다 — 배치표 밖 유형(예전 배치)도 그대로
      { usedAnswers, typeKey: typeKey ?? type.key, variant: variant ?? "", rotation: curriculum.rotation }
    );

    if (academyId) {
      await debitLessonCredits({
        academyId,
        actorId: access.profile.id,
        featureKey: CREDIT_FEATURES.listening_generate_questions,
        metadata: { set_id: setId },
        note: "듣기 문항 1개 다시 만들기",
      });
    }
    const saved = await replaceGeneratedQuestion(
      setId,
      questionId,
      generated,
      gradeLevel
    );

    return NextResponse.json({
      ok: true,
      question: saved,
      needs_review: generated.needs_review,
      quality_score: generated.quality_score,
      answer_clarity_score: generated.answer_clarity_score,
      quality_issues: generated.quality_issues,
      answer_validation: generated.answer_validation,
      problems: generated.problems,
      audioNeedsRegeneration: true,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "재생성 실패";
    return jsonError(message);
  }
}
