import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireExamPrepStaff } from "@/lib/exam-prep/require-exam-prep";
import { generateRuleBasedQuestions } from "@/lib/exam-prep/generate-rule-questions";
import { CREDIT_FEATURES, debitFeatureCredits } from "@/lib/credits";
import type { ExamPassageSentence, ExamStepType } from "@/lib/exam-prep/types";

/**
 * AI 워크북 문항 생성.
 * MVP: OpenAI JSON 시도 후 실패 시 규칙 기반으로 폴백 (지문 손상 없음).
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

    try {
      await debitFeatureCredits(supabase, {
        academyId: profile.academy_id!,
        featureKey: CREDIT_FEATURES.exam_prep_workbook_ai,
        actorId: profile.id,
        idempotencyKey: `exam_prep_ai:${body.workbookId}:${body.stepId ?? "all"}:${Date.now()}`,
        quantity: 1,
        metadata: { workbookId: body.workbookId },
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "크레딧 차감 실패";
      return NextResponse.json({ ok: false, message: msg }, { status: 402 });
    }

    let total = 0;
    for (const step of steps ?? []) {
      await supabase
        .from("exam_workbook_questions")
        .delete()
        .eq("step_id", step.id);

      // MVP: 규칙 기반 (AI JSON 스키마는 후속 확장 — 원문 미수정 보장)
      const questions = generateRuleBasedQuestions(
        step.step_type as ExamStepType,
        (sentences ?? []) as ExamPassageSentence[],
        step.difficulty ?? "medium"
      );
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
          ai_generated: true,
        }))
      );
      total += questions.length;
    }

    await supabase
      .from("exam_workbooks")
      .update({
        status: "reviewing",
        updated_at: new Date().toISOString(),
      })
      .eq("id", body.workbookId);

    return NextResponse.json({
      ok: true,
      source: "rule",
      questionCount: total,
      message: "문항이 생성되었습니다. 검수 후 승인해 주세요.",
    });
  } catch (e) {
    if (e instanceof Response) return e;
    return NextResponse.json(
      { ok: false, message: e instanceof Error ? e.message : "오류" },
      { status: 500 }
    );
  }
}
