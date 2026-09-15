import { createAdminClient } from "@/lib/supabase/admin";
import { jsonError, jsonOk } from "@/lib/question-generator/api-helpers";
import { dedupeExamVocabRowsKeepIds } from "@/lib/question-generator/exam-vocab";

export const dynamic = "force-dynamic";

/**
 * 공개: exam_compact 단어장만 (시험지 QR, 로그인 불필요).
 * 읽기 전용 — 겹치는 단어는 화면에서만 하나로 보여 주고 DB는 건드리지 않는다
 * (예전에는 여기서 단어를 모두 지우고 다시 넣어 학생 기록이 사라졌다).
 */
export async function GET(
  _req: Request,
  ctx: { params: Promise<{ setId: string }> }
) {
  try {
    const { setId } = await ctx.params;
    if (!setId) return jsonError("세트 ID가 필요합니다.", 400);

    const admin = createAdminClient();
    const { data: set, error } = await admin
      .from("vocab_sets")
      .select("id, title, exam_compact")
      .eq("id", setId)
      .maybeSingle();

    if (error || !set) return jsonError("단어장을 찾을 수 없습니다.", 404);
    if (!set.exam_compact) {
      return jsonError("시험 연계 단어장이 아닙니다.", 403);
    }

    const { data: items } = await admin
      .from("vocab_items")
      .select(
        "id, set_id, word, meaning, example_sentence, example_meaning, order_index, created_at"
      )
      .eq("set_id", setId)
      .order("order_index")
      .order("created_at");

    return jsonOk({
      set: { id: set.id, title: set.title || "보기 단어" },
      items: dedupeExamVocabRowsKeepIds(items ?? []),
    });
  } catch {
    return jsonError("불러오기에 실패했습니다.", 500);
  }
}
