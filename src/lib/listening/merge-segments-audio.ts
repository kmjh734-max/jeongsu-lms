import { mkdtemp, readFile, rm, writeFile } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";
import { createAdminClient } from "@/lib/supabase/admin";
import { concatMp3Files } from "@/lib/listening/concat-mp3";
import {
  finalStoragePath,
  legacySegmentStoragePath,
  publicAudioUrl,
  segmentStoragePath,
  storagePathFromPublicUrl,
} from "@/lib/listening/storage-paths";
import type { ListeningSpeakerType } from "@/lib/listening/types";

const BUCKET = "listening-audio";

async function downloadToFile(
  admin: ReturnType<typeof createAdminClient>,
  supabaseUrl: string,
  audioUrl: string,
  destPath: string
): Promise<void> {
  const storagePath = storagePathFromPublicUrl(supabaseUrl, audioUrl);
  if (storagePath) {
    const { data, error } = await admin.storage.from(BUCKET).download(storagePath);
    if (!error && data) {
      await writeFile(destPath, Buffer.from(await data.arrayBuffer()));
      return;
    }
  }
  const res = await fetch(audioUrl);
  if (!res.ok) throw new Error(`음원 다운로드 실패 (${res.status})`);
  await writeFile(destPath, Buffer.from(await res.arrayBuffer()));
}

/**
 * 이미 업로드된 segment mp3만 이어 붙여 final.mp3 생성 (TTS 재호출 없음).
 */
export async function mergeQuestionAudioFromSegments(opts: {
  setId: string;
  questionId: string;
}): Promise<string> {
  const { setId, questionId } = opts;
  const admin = createAdminClient();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) throw new Error("NEXT_PUBLIC_SUPABASE_URL이 설정되지 않았습니다.");

  const { data: segments, error: segErr } = await admin
    .from("listening_question_segments")
    .select("id, order_index, speaker_type, text, audio_url")
    .eq("question_id", questionId)
    .order("order_index", { ascending: true });

  if (segErr) throw new Error(segErr.message);
  if (!segments?.length) throw new Error("대본 segment가 없습니다.");

  const workDir = await mkdtemp(join(tmpdir(), "listening-merge-"));
  const localPaths: string[] = [];

  try {
    for (const seg of segments) {
      const localPath = join(workDir, `${seg.id}.mp3`);
      const primaryPath = segmentStoragePath(setId, questionId, seg.id);
      const legacyPath = legacySegmentStoragePath(
        setId,
        questionId,
        seg.order_index,
        seg.speaker_type as ListeningSpeakerType
      );

      if (seg.audio_url) {
        await downloadToFile(admin, supabaseUrl, seg.audio_url, localPath);
      } else {
        const { data, error } = await admin.storage.from(BUCKET).download(primaryPath);
        if (!error && data) {
          await writeFile(localPath, Buffer.from(await data.arrayBuffer()));
        } else {
          const legacy = await admin.storage.from(BUCKET).download(legacyPath);
          if (legacy.error || !legacy.data) {
            throw new Error(
              `${seg.order_index + 1}번째 줄(${seg.speaker_type}) 음원이 없습니다. 「음원 생성」을 실행하세요.`
            );
          }
          await writeFile(localPath, Buffer.from(await legacy.data.arrayBuffer()));
        }
      }
      localPaths.push(localPath);
    }

    const finalLocal = join(workDir, "final.mp3");
    await concatMp3Files(localPaths, finalLocal);
    const stat = await import("fs/promises").then((fs) => fs.stat(finalLocal));
    if (stat.size < 500) {
      throw new Error("병합된 mp3가 비어 있습니다.");
    }

    const finalBuffer = await readFile(finalLocal);
    const finalPath = finalStoragePath(setId, questionId);
    const { error: upErr } = await admin.storage
      .from(BUCKET)
      .upload(finalPath, finalBuffer, { contentType: "audio/mpeg", upsert: true });
    if (upErr) throw new Error(`최종 mp3 업로드 실패: ${upErr.message}`);

    const audioUrl = publicAudioUrl(supabaseUrl, finalPath);
    const { error: dbErr } = await admin
      .from("listening_questions")
      .update({ audio_url: audioUrl })
      .eq("id", questionId);
    if (dbErr) throw new Error(`문항 audio_url 저장 실패: ${dbErr.message}`);

    return audioUrl;
  } finally {
    await rm(workDir, { recursive: true, force: true }).catch(() => undefined);
  }
}

/** segment 음원이 없으면 storage 경로에서 직접 받아오기 시도 */
export async function ensureSegmentFilesExist(
  setId: string,
  questionId: string
): Promise<number> {
  const admin = createAdminClient();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;

  const { data: segments } = await admin
    .from("listening_question_segments")
    .select("id, order_index, speaker_type, audio_url")
    .eq("question_id", questionId)
    .order("order_index");

  if (!segments?.length) return 0;

  let fixed = 0;
  for (const seg of segments) {
    if (seg.audio_url) continue;
    const path = segmentStoragePath(setId, questionId, seg.id);
    const { data, error } = await admin.storage.from(BUCKET).download(path);
    if (error || !data) continue;
    const audioUrl = publicAudioUrl(supabaseUrl, path);
    await admin
      .from("listening_question_segments")
      .update({ audio_url: audioUrl })
      .eq("id", seg.id);
    fixed++;
  }
  return fixed;
}
