import { createAdminClient } from "@/lib/supabase/admin";
import { jsonError, jsonOk } from "@/lib/question-generator/api-helpers";

export const dynamic = "force-dynamic";

/** 공개: exam_compact 단어장만 (시험지 QR용, 로그인 불필요) */
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
      .select("id, title, exam_compact, published")
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
      items: items ?? [],
    });
  } catch {
    return jsonError("불러오기에 실패했습니다.", 500);
  }
}
