import { mkdtemp, readFile, rm, writeFile } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";
import { createAdminClient } from "@/lib/supabase/admin";
import { concatMp3Files } from "@/lib/listening/concat-mp3";
import {
  finalStoragePath,
  publicAudioUrl,
  segmentStoragePath,
  storagePathFromPublicUrl,
} from "@/lib/listening/storage-paths";
import { synthesizeSegmentMp3 } from "@/lib/listening/tts-openai";
import { voiceForSpeaker } from "@/lib/listening/speaker-voices";
import type { ListeningSegmentRow, ListeningSpeakerType } from "@/lib/listening/types";

const BUCKET = "listening-audio";

export interface GenerateAudioResult {
  audioUrl: string;
  segments: Array<{ id: string; speaker: string; audioUrl: string }>;
}

async function downloadSegmentToFile(
  admin: ReturnType<typeof createAdminClient>,
  supabaseUrl: string,
  audioUrl: string,
  destPath: string
): Promise<void> {
  const storagePath = storagePathFromPublicUrl(supabaseUrl, audioUrl);
  if (!storagePath) {
    throw new Error("기존 segment 음원 경로를 읽을 수 없습니다.");
  }
  const { data, error } = await admin.storage.from(BUCKET).download(storagePath);
  if (error || !data) {
    throw new Error(error?.message ?? "segment 음원 다운로드 실패");
  }
  const buf = Buffer.from(await data.arrayBuffer());
  await writeFile(destPath, buf);
}

export async function generateQuestionAudio(opts: {
  setId: string;
  questionId: string;
  segmentId?: string;
  apiKey: string;
}): Promise<GenerateAudioResult> {
  const { setId, questionId, segmentId, apiKey } = opts;
  const admin = createAdminClient();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) throw new Error("NEXT_PUBLIC_SUPABASE_URL이 설정되지 않았습니다.");

  const { data: segments, error: segErr } = await admin
    .from("listening_question_segments")
    .select("*")
    .eq("question_id", questionId)
    .order("order_index", { ascending: true });

  if (segErr) throw new Error(segErr.message);
  if (!segments?.length) throw new Error("대본 segment가 없습니다.");

  const workDir = await mkdtemp(join(tmpdir(), "listening-audio-"));
  const localPaths: string[] = [];
  const resultSegments: Array<{ id: string; speaker: string; audioUrl: string }> = [];

  try {
    for (const seg of segments as ListeningSegmentRow[]) {
      const speaker = seg.speaker_type as ListeningSpeakerType;
      const localPath = join(
        workDir,
        `${String(seg.order_index + 1).padStart(2, "0")}-${speaker.toLowerCase()}.mp3`
      );

      const shouldRegenerate = !segmentId || seg.id === segmentId;

      if (shouldRegenerate) {
        const buffer = await synthesizeSegmentMp3(apiKey, speaker, seg.text);
        await writeFile(localPath, buffer);

        const storagePath = segmentStoragePath(
          setId,
          questionId,
          seg.order_index,
          speaker
        );
        const { error: upErr } = await admin.storage
          .from(BUCKET)
          .upload(storagePath, buffer, {
            contentType: "audio/mpeg",
            upsert: true,
          });
        if (upErr) throw new Error(upErr.message);

        const audioUrl = publicAudioUrl(supabaseUrl, storagePath);
        const voice = voiceForSpeaker(speaker);

        await admin
          .from("listening_question_segments")
          .update({
            audio_url: audioUrl,
            voice_name: voice,
          })
          .eq("id", seg.id);

        resultSegments.push({ id: seg.id, speaker, audioUrl });
      } else if (seg.audio_url) {
        await downloadSegmentToFile(admin, supabaseUrl, seg.audio_url, localPath);
        resultSegments.push({
          id: seg.id,
          speaker,
          audioUrl: seg.audio_url,
        });
      } else {
        const buffer = await synthesizeSegmentMp3(apiKey, speaker, seg.text);
        await writeFile(localPath, buffer);
        const storagePath = segmentStoragePath(
          setId,
          questionId,
          seg.order_index,
          speaker
        );
        const { error: upErr } = await admin.storage
          .from(BUCKET)
          .upload(storagePath, buffer, {
            contentType: "audio/mpeg",
            upsert: true,
          });
        if (upErr) throw new Error(upErr.message);
        const audioUrl = publicAudioUrl(supabaseUrl, storagePath);
        await admin
          .from("listening_question_segments")
          .update({ audio_url: audioUrl, voice_name: voiceForSpeaker(speaker) })
          .eq("id", seg.id);
        resultSegments.push({ id: seg.id, speaker, audioUrl });
      }

      localPaths.push(localPath);
    }

    const finalLocal = join(workDir, "final.mp3");
    await concatMp3Files(localPaths, finalLocal);
    const finalBuffer = await readFile(finalLocal);

    const finalPath = finalStoragePath(setId, questionId);
    const { error: finalUpErr } = await admin.storage
      .from(BUCKET)
      .upload(finalPath, finalBuffer, {
        contentType: "audio/mpeg",
        upsert: true,
      });
    if (finalUpErr) throw new Error(finalUpErr.message);

    const audioUrl = publicAudioUrl(supabaseUrl, finalPath);
    await admin
      .from("listening_questions")
      .update({ audio_url: audioUrl })
      .eq("id", questionId);

    return { audioUrl, segments: resultSegments };
  } finally {
    await rm(workDir, { recursive: true, force: true }).catch(() => undefined);
  }
}
