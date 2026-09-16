import type { SupabaseClient } from "@supabase/supabase-js";
import { answerOfStoredQuestion } from "@/lib/listening/answer-variety-pool";
import type { ListeningGradeLevel } from "@/lib/listening/grade-level";
import { inferExamTypeIdForFixes } from "@/lib/listening/infer-exam-type-id";

/**
 * 같은 과정(같은 학원·같은 학년의 다른 회차)에서 유형별로 이미 쓴 정답 목록 + 회차 번호.
 * 다양화 풀이 이 목록을 보고 덜 쓴 정답부터 배정한다 (DB 읽기만, 모델 호출 없음).
 * 회차 번호는 같은 학원·학년에서 이 세트가 몇 번째로 만들어졌는지(0부터)로,
 * 상황·이름·첫 대사 은행을 회차마다 한 칸씩 돌려 쓰는 데 쓴다 (무작위로 뽑으면 22회차 안에서도 겹쳤다).
 */
export async function loadCurriculumVariety(
  admin: SupabaseClient,
  setId: string,
  gradeLevel: ListeningGradeLevel,
  opts?: { excludeQuestionId?: string }
): Promise<{ usage: Record<number, string[]>; rotation: number }> {
  const usage: Record<number, string[]> = {};
  let rotation = -1;
  try {
    const { data: setRow } = await admin
      .from("listening_sets")
      .select("id, academy_id, folder_id, created_at")
      .eq("id", setId)
      .maybeSingle();
    if (!setRow) return { usage, rotation };

    let setsQuery = admin
      .from("listening_sets")
      .select("id, created_at")
      .eq("grade_level", gradeLevel)
      .limit(200);
    if (setRow.academy_id) setsQuery = setsQuery.eq("academy_id", setRow.academy_id);
    else if (setRow.folder_id) setsQuery = setsQuery.eq("folder_id", setRow.folder_id);
    else return { usage, rotation };

    const { data: sets } = await setsQuery;
    const setIds = (sets ?? []).map((s) => s.id as string);
    // 나보다 먼저 만들어진 같은 학년 세트 수 = 이번 회차 번호
    rotation = (sets ?? []).filter(
      (s) => String(s.created_at ?? "") < String(setRow.created_at ?? "")
    ).length;
    if (setIds.length === 0) return { usage, rotation };

    for (let i = 0; i < setIds.length; i += 50) {
      const { data: rows } = await admin
        .from("listening_questions")
        .select("id, set_id, order_index, question_type, instruction, choices, correct_answer")
        .in("set_id", setIds.slice(i, i + 50));
      for (const r of rows ?? []) {
        if (opts?.excludeQuestionId && r.id === opts.excludeQuestionId) continue;
        const typeId = inferExamTypeIdForFixes(
          {
            order_index: Number(r.order_index),
            question_type: String(r.question_type ?? ""),
            instruction: String(r.instruction ?? ""),
          },
          gradeLevel
        );
        const answer = answerOfStoredQuestion(r);
        if (answer) (usage[typeId] ||= []).push(answer);
      }
    }
  } catch {
    // 사용 이력을 못 읽어도 생성은 계속한다 (풀에서 무작위 배정)
  }
  return { usage, rotation };
}
