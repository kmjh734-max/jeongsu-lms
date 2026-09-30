import {
  jsonError,
  jsonOk,
  requireStaffProfile,
} from "@/lib/question-generator/api-helpers";
import { createClient } from "@/lib/supabase/server";

/**
 * 골라 묶은 시험지를 인쇄 화면이 읽을 수 있는 모양으로 내준다.
 *
 * 선생님 요청(2026-09-30): 유형별로 골라 새 시험지를 조립하고 싶다.
 * 묶기만 하고 인쇄가 안 되면 시험지가 아니므로, 생성 묶음 인쇄와 같은 모양으로
 * 맞춰 준다(QuestionPrintView 가 그대로 쓴다). 차례는 묶을 때 정한 차례를 따른다.
 */
export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const profile = await requireStaffProfile();
    const { id } = await ctx.params;
    const supabase = await createClient();

    let setQuery = supabase
      .from("english_question_sets")
      .select("id, title, items")
      .eq("id", id)
      .eq("academy_id", profile.academy_id!);
    if (profile.role === "teacher") setQuery = setQuery.eq("created_by", profile.id);
    const { data: set, error: setError } = await setQuery.maybeSingle();
    if (setError) return jsonError(setError.message, 500);
    if (!set) return jsonError("시험지를 찾을 수 없습니다.", 404);

    const items = (set.items ?? []) as Array<{
      questionId: string;
      orderIndex: number;
    }>;
    const order = new Map(items.map((it) => [it.questionId, it.orderIndex]));
    const ids = items.map((it) => it.questionId);
    if (ids.length === 0) {
      return jsonOk({
        job: { request_config: { title: set.title } },
        questions: [],
        passages: [],
      });
    }

    const { data: rows, error } = await supabase
      .from("generated_english_questions")
      .select("*")
      .eq("academy_id", profile.academy_id!)
      .in("id", ids);
    if (error) return jsonError(error.message, 500);

    const questions = (rows ?? []).sort(
      (a, b) =>
        (order.get(a.id as string) ?? 0) - (order.get(b.id as string) ?? 0)
    );

    const passageIds = [
      ...new Set(
        questions.map((q) => q.passage_id as string | null).filter(Boolean)
      ),
    ] as string[];
    const { data: passages } = passageIds.length
      ? await supabase
          .from("english_source_passages")
          .select("id, title, source_detail, grade")
          .in("id", passageIds)
      : { data: [] };

    return jsonOk({
      job: { request_config: { title: set.title } },
      questions,
      passages: passages ?? [],
    });
  } catch (e) {
    if (e instanceof Response) return e;
    return jsonError("시험지 조회 실패", 500);
  }
}
