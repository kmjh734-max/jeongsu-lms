import {
  jsonError,
  jsonOk,
  requireStaffProfile,
} from "@/lib/question-generator/api-helpers";
import { createClient } from "@/lib/supabase/server";

/**
 * 만들어 둔 문제 목록.
 *
 * 선생님 요청(2026-09-30): 이미 만들어 놓은 문제를 유형별로 따로 묶고 싶다.
 * 한 묶음에 여러 유형이 있는데 거기서 한 유형만 쓰고 새 유형을 더해 시험지를
 * 조립하고 싶은데 안 되니, 이미 만든 유형도 다시 만들게 된다.
 *
 * 그래서 유형·생성 묶음으로 거를 수 있게 하고, 한 번에 더 많이 내려준다.
 * 어느 묶음에서 나온 것인지도 함께 준다.
 */
export async function GET(req: Request) {
  try {
    const profile = await requireStaffProfile();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const optionKey = searchParams.get("optionKey");
    const jobId = searchParams.get("jobId");
    const keyword = (searchParams.get("q") ?? "").trim();
    const limit = Math.min(Number(searchParams.get("limit") ?? 300) || 300, 1000);
    const supabase = await createClient();

    let q = supabase
      .from("generated_english_questions")
      .select(
        "id, category, question_type, option_key, difficulty, choice_language, instruction, question_text, status, validation_score, created_at, passage_id, generation_job_id"
      )
      .eq("academy_id", profile.academy_id!)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (profile.role === "teacher") q = q.eq("created_by", profile.id);
    if (status) q = q.eq("status", status);
    if (optionKey) q = q.eq("option_key", optionKey);
    if (jobId) q = q.eq("generation_job_id", jobId);
    if (keyword) {
      q = q.or(
        `instruction.ilike.%${keyword}%,question_text.ilike.%${keyword}%`
      );
    }

    const { data, error } = await q;
    if (error) return jsonError(error.message, 500);

    const questions = data ?? [];

    // 어느 생성 묶음에서 나왔는지 이름을 붙여 준다 (골라 담을 때 알아보게)
    const jobIds = [
      ...new Set(
        questions.map((r) => r.generation_job_id as string | null).filter(Boolean)
      ),
    ] as string[];
    const jobTitles: Record<string, string> = {};
    if (jobIds.length > 0) {
      const { data: jobs } = await supabase
        .from("question_generation_jobs")
        .select("id, created_at, title:request_config->>title")
        .in("id", jobIds);
      for (const j of jobs ?? []) {
        jobTitles[j.id as string] =
          (j.title as string | null)?.trim() ||
          new Date(j.created_at as string).toLocaleDateString("ko-KR");
      }
    }

    return jsonOk({ questions, jobTitles });
  } catch (e) {
    if (e instanceof Response) return e;
    return jsonError("목록 조회 실패", 500);
  }
}
