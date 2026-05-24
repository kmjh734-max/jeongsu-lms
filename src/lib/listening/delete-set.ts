import { createAdminClient } from "@/lib/supabase/admin";
import {
  finalStoragePath,
  segmentStoragePath,
} from "@/lib/listening/storage-paths";

const BUCKET = "listening-audio";

/** 세트 삭제 전 storage 음원 파일 제거 */
export async function deleteListeningSetAssets(setId: string): Promise<void> {
  const admin = createAdminClient();

  const { data: questions } = await admin
    .from("listening_questions")
    .select("id")
    .eq("set_id", setId);

  const questionIds = (questions ?? []).map((q) => q.id);
  const paths: string[] = [];

  for (const qid of questionIds) {
    paths.push(finalStoragePath(setId, qid));
  }

  if (questionIds.length > 0) {
    const { data: segments } = await admin
      .from("listening_question_segments")
      .select("id, question_id")
      .in("question_id", questionIds);

    for (const seg of segments ?? []) {
      paths.push(segmentStoragePath(setId, seg.question_id, seg.id));
    }
  }

  if (paths.length > 0) {
    await admin.storage.from(BUCKET).remove(paths);
  }
}

export async function deleteListeningSet(setId: string): Promise<void> {
  const admin = createAdminClient();
  await deleteListeningSetAssets(setId);
  const { error } = await admin.from("listening_sets").delete().eq("id", setId);
  if (error) throw new Error(error.message);
}
