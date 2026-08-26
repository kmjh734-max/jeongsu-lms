/**
 * 워크북 5·6단계(어법/어휘 고르기) 문항을 stage6 초안과 동기화.
 * 리뷰 화면이 빈칸(english_blank) 폴백으로 오염되지 않게 한다.
 */
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { isExamPrepEnabled } from "@/lib/academy-features";
import { stage6DraftsToQuestions } from "@/lib/exam-prep/generate-ai-questions";
import type { Stage6ItemDraft } from "@/lib/exam-prep/stage6-types";
import type { ExamPassageSentence } from "@/lib/exam-prep/types";

async function requireStaff() {
  if (!isExamPrepEnabled()) {
    return { ok: false as const, message: "기능을 사용할 수 없습니다." };
  }
  const profile = await getCurrentProfile();
  if (
    !profile ||
    (profile.role !== "admin" && profile.role !== "teacher") ||
    !profile.academy_id
  ) {
    return { ok: false as const, message: "권한이 없습니다." };
  }
  return { ok: true as const, profile };
}

export async function syncWorkbookChoiceQuestionsAction(
  workbookId: string,
  drafts: Stage6ItemDraft[],
  sentences: ExamPassageSentence[],
  opts?: { aiGenerated?: boolean }
): Promise<
  | { ok: true; grammar: number; vocab: number }
  | { ok: false; message: string }
> {
  const auth = await requireStaff();
  if (!auth.ok) return auth;
  const supabase = await createClient();
  const academyId = auth.profile.academy_id!;

  const { data: wb } = await supabase
    .from("exam_workbooks")
    .select("id, status, academy_id")
    .eq("id", workbookId)
    .eq("academy_id", academyId)
    .maybeSingle();
  if (!wb) return { ok: false, message: "워크북 없음" };
  if (wb.status === "approved") {
    return { ok: false, message: "승인된 워크북은 문항을 덮어쓸 수 없습니다." };
  }

  const { data: steps } = await supabase
    .from("exam_workbook_steps")
    .select("id, step_type")
    .eq("workbook_id", workbookId)
    .eq("academy_id", academyId);

  const aiGenerated = opts?.aiGenerated === true;
  let grammarCount = 0;
  let vocabCount = 0;

  for (const step of steps ?? []) {
    const st = String(step.step_type);
    if (st !== "grammar_choice" && st !== "vocab_choice") continue;
    const cat = st === "grammar_choice" ? "grammar" : "vocabulary";
    const questions = stage6DraftsToQuestions(
      drafts,
      sentences,
      aiGenerated,
      cat
    );
    if (questions.length === 0) continue;

    await supabase
      .from("exam_workbook_questions")
      .delete()
      .eq("step_id", step.id)
      .eq("academy_id", academyId);

    const { error } = await supabase.from("exam_workbook_questions").insert(
      questions.map((q) => ({
        academy_id: academyId,
        workbook_id: workbookId,
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
    if (error) return { ok: false, message: error.message };
    if (cat === "grammar") grammarCount = questions.length;
    else vocabCount = questions.length;
  }

  return { ok: true, grammar: grammarCount, vocab: vocabCount };
}
