import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireExamPrepStaff } from "@/lib/exam-prep/require-exam-prep";
import { generateStepQuestionsWithAi } from "@/lib/exam-prep/generate-ai-questions";
import { CREDIT_FEATURES, debitFeatureCredits } from "@/lib/credits";
import type { ExamPassageSentence, ExamStepType } from "@/lib/exam-prep/types";

export const runtime = "nodejs";
export const maxDuration = 120;

/**
 * AI 워크북 문항 생성.
 * OpenAI JSON 시도 → 실패 시 규칙 기반 폴백 (지문 원문 미수정).
 * AI로 하나라도 성공한 경우에만 크레딧 차감.
 */
export async function POST(request: Request) {
  try {
    const profile = await requireExamPrepStaff();
    const body = (await request.json()) as {
      workbookId?: string;
      stepId?: string;
      force?: boolean;
    };
    if (!body.workbookId) {
      return NextResponse.json(
        { ok: false, message: "workbookId 필요" },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const { data: wb } = await supabase
      .from("exam_workbooks")
      .select("id, passage_id, status, academy_id")
      .eq("id", body.workbookId)
      .eq("academy_id", profile.academy_id!)
      .maybeSingle();
    if (!wb) {
      return NextResponse.json(
        { ok: false, message: "워크북 없음" },
        { status: 404 }
      );
    }
    if (wb.status === "approved" && !body.force) {
      return NextResponse.json(
        { ok: false, message: "승인된 워크북은 덮어쓰기 전에 확인이 필요합니다." },
        { status: 400 }
      );
    }

    const { data: passageRow } = await supabase
      .from("exam_passages")
      .select("original_text, grade, title")
      .eq("id", wb.passage_id)
      .maybeSingle();

    const { data: sentences } = await supabase
      .from("exam_passage_sentences")
      .select("*")
      .eq("passage_id", wb.passage_id)
      .order("sentence_order", { ascending: true });

    let stepsQuery = supabase
      .from("exam_workbook_steps")
      .select("*")
      .eq("workbook_id", body.workbookId)
      .order("step_order", { ascending: true });
    if (body.stepId) stepsQuery = stepsQuery.eq("id", body.stepId);
    const { data: steps } = await stepsQuery;

    const sentenceRows = (sentences ?? []) as ExamPassageSentence[];
    const passageText =
      (passageRow?.original_text as string | undefined)?.trim() ||
      sentenceRows.map((s) => s.english_text).join(" ");
    let total = 0;
    let aiSteps = 0;
    let ruleSteps = 0;
    const aiErrors: string[] = [];

    for (const step of steps ?? []) {
      await supabase
        .from("exam_workbook_questions")
        .delete()
        .eq("step_id", step.id);

      const generated = await generateStepQuestionsWithAi(
        step.step_type as ExamStepType,
        sentenceRows,
        step.difficulty ?? "medium",
        {
          passageText,
          settings: (step.settings ?? {}) as Record<string, unknown>,
          grade: (passageRow?.grade as string | null) ?? "고1",
          sourceDetail: (passageRow?.title as string | null) ?? undefined,
        }
      );
      if (generated.source === "ai") aiSteps += 1;
      else {
        ruleSteps += 1;
        if (generated.aiError) aiErrors.push(`${step.step_type}: ${generated.aiError}`);
      }

      const questions = generated.questions;
      if (questions.length === 0) continue;

      await supabase.from("exam_workbook_questions").insert(
        questions.map((q) => ({
          academy_id: profile.academy_id,
          workbook_id: body.workbookId,
          step_id: step.id,
          sentence_id: q.sentence_id,
          question_type: q.question_type,
          question_order: q.question_order,
          question_text: q.question_text,
          question_data: q.question_data,
          correct_answer: q.correct_answer,
          acceptable_answers: q.acceptable_answers,
          explanation: q.explanation,
          difficulty: q.difficulty,
          points: q.points,
          is_active: true,
          ai_generated: q.ai_generated === true,
        }))
      );
      total += questions.length;
    }

    let charged = false;
    if (aiSteps > 0) {
      try {
        await debitFeatureCredits(supabase, {
          academyId: profile.academy_id!,
          featureKey: CREDIT_FEATURES.exam_prep_workbook_ai,
          actorId: profile.id,
          idempotencyKey: `exam_prep_ai:${body.workbookId}:${body.stepId ?? "all"}:${Date.now()}`,
          quantity: 1,
          metadata: {
            workbookId: body.workbookId,
            aiSteps,
            ruleSteps,
            questionCount: total,
          },
        });
        charged = true;
      } catch (e) {
        const msg = e instanceof Error ? e.message : "크레딧 차감 실패";
        // 문항은 이미 생성됨 — 크레딧 부족이면 안내만 (삭제하지 않음)
        await supabase
          .from("exam_workbooks")
          .update({
            status: "reviewing",
            updated_at: new Date().toISOString(),
          })
          .eq("id", body.workbookId);

        return NextResponse.json(
          {
            ok: true,
            source: aiSteps > 0 ? "ai" : "rule",
            questionCount: total,
            aiSteps,
            ruleSteps,
            charged: false,
            creditWarning: msg,
            message: `문항 ${total}개 생성(AI ${aiSteps}/규칙 ${ruleSteps}). 크레딧: ${msg}`,
          },
          { status: 200 }
        );
      }
    }

    await supabase
      .from("exam_workbooks")
      .update({
        status: "reviewing",
        updated_at: new Date().toISOString(),
      })
      .eq("id", body.workbookId);

    const source =
      aiSteps > 0 && ruleSteps === 0
        ? "ai"
        : aiSteps > 0
          ? "mixed"
          : "rule";

    return NextResponse.json({
      ok: true,
      source,
      questionCount: total,
      aiSteps,
      ruleSteps,
      charged,
      aiErrors: aiErrors.slice(0, 5),
      message:
        source === "ai"
          ? `AI로 문항 ${total}개를 생성했습니다. 검수 후 승인해 주세요.`
          : source === "mixed"
            ? `AI ${aiSteps}단계 + 규칙 ${ruleSteps}단계로 문항 ${total}개 생성. 검수 후 승인해 주세요.`
            : `규칙 기반으로 문항 ${total}개를 생성했습니다. (AI 미사용·크레딧 미차감) 검수 후 승인해 주세요.`,
    });
  } catch (e) {
    if (e instanceof Response) return e;
    return NextResponse.json(
      { ok: false, message: e instanceof Error ? e.message : "오류" },
      { status: 500 }
    );
  }
}
