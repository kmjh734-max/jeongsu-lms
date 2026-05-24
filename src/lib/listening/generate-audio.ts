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
import {
  AFTER_ANN_PAUSE_SEC,
  BEFORE_FIRST_LINE_PAUSE_SEC,
  generateSilenceMp3,
  SEGMENT_PAUSE_SEC,
} from "@/lib/listening/silence-mp3";
import { synthesizeSegmentMp3 } from "@/lib/listening/tts-openai";
import { voiceForSpeaker } from "@/lib/listening/speaker-voices";
import { DEFAULT_SPEECH_SPEED_PRESET, speedFromPreset } from "@/lib/listening/speech-speed";
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

function appendSegmentPath(
  concatPaths: string[],
  localPath: string
): void {
  concatPaths.push(localPath);
}

async function appendPausesAroundSegment(
  workDir: string,
  concatPaths: string[],
  localPath: string,
  speaker: ListeningSpeakerType,
  index: number,
  isLast: boolean,
  usePauses: boolean
): Promise<void> {
  if (!usePauses) {
    appendSegmentPath(concatPaths, localPath);
    return;
  }

  try {
    if (index === 0) {
      const pre = join(workDir, `pause-pre-${index}.mp3`);
      await generateSilenceMp3(BEFORE_FIRST_LINE_PAUSE_SEC, pre);
      concatPaths.push(pre);
    }
    concatPaths.push(localPath);
    if (!isLast) {
      const gap = speaker === "ANN" ? AFTER_ANN_PAUSE_SEC : SEGMENT_PAUSE_SEC;
      const pausePath = join(workDir, `pause-after-${index}.mp3`);
      await generateSilenceMp3(gap, pausePath);
      concatPaths.push(pausePath);
    }
  } catch {
    appendSegmentPath(concatPaths, localPath);
  }
}

async function buildFinalMp3(
  workDir: string,
  concatPaths: string[],
  segmentOnlyPaths: string[]
): Promise<string> {
  const finalLocal = join(workDir, "final.mp3");
  try {
    await concatMp3Files(concatPaths, finalLocal);
  } catch {
    await concatMp3Files(segmentOnlyPaths, finalLocal);
  }
  const stat = await import("fs/promises").then((fs) => fs.stat(finalLocal));
  if (stat.size < 500) {
    throw new Error("합성된 mp3 파일이 비어 있습니다. ffmpeg 설치를 확인해 주세요.");
  }
  return finalLocal;
}

export async function generateQuestionAudio(opts: {
  setId: string;
  questionId: string;
  segmentId?: string;
  apiKey: string;
  speechSpeed?: number;
}): Promise<GenerateAudioResult> {
  const { setId, questionId, segmentId, apiKey } = opts;
  const speed = opts.speechSpeed ?? speedFromPreset(DEFAULT_SPEECH_SPEED_PRESET);

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
  const concatPaths: string[] = [];
  const segmentOnlyPaths: string[] = [];
  const resultSegments: Array<{ id: string; speaker: string; audioUrl: string }> = [];
  const usePauses = true;

  try {
    const rows = segments as ListeningSegmentRow[];
    for (let i = 0; i < rows.length; i++) {
      const seg = rows[i]!;
      const speaker = seg.speaker_type as ListeningSpeakerType;
      const localPath = join(
        workDir,
        `${String(seg.order_index + 1).padStart(2, "0")}-${speaker.toLowerCase()}.mp3`
      );

      const shouldRegenerate = !segmentId || seg.id === segmentId;

      if (shouldRegenerate) {
        const buffer = await synthesizeSegmentMp3(apiKey, speaker, seg.text, speed);
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
          .update({
            audio_url: audioUrl,
            voice_name: voiceForSpeaker(speaker),
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
        const buffer = await synthesizeSegmentMp3(apiKey, speaker, seg.text, speed);
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

      segmentOnlyPaths.push(localPath);
      await appendPausesAroundSegment(
        workDir,
        concatPaths,
        localPath,
        speaker,
        i,
        i === rows.length - 1,
        usePauses
      );
    }

    const finalLocal = await buildFinalMp3(workDir, concatPaths, segmentOnlyPaths);
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

export interface BatchAudioItemResult {
  questionId: string;
  orderIndex: number;
  ok: boolean;
  audioUrl?: string;
  message?: string;
}

/** 세트 내 문항 음원 일괄 생성 */
export async function generateSetQuestionAudio(opts: {
  setId: string;
  apiKey: string;
  speechSpeed?: number;
  questionIds?: string[];
}): Promise<BatchAudioItemResult[]> {
  const admin = createAdminClient();
  let query = admin
    .from("listening_questions")
    .select("id, order_index")
    .eq("set_id", opts.setId)
    .order("order_index", { ascending: true });

  if (opts.questionIds?.length) {
    query = query.in("id", opts.questionIds);
  }

  const { data: questions, error } = await query;
  if (error) throw new Error(error.message);
  if (!questions?.length) {
    throw new Error("음원을 만들 문항이 없습니다.");
  }

  const results: BatchAudioItemResult[] = [];

  for (const q of questions) {
    try {
      const { data: segCheck } = await admin
        .from("listening_question_segments")
        .select("id")
        .eq("question_id", q.id)
        .limit(1);
      if (!segCheck?.length) {
        results.push({
          questionId: q.id,
          orderIndex: q.order_index,
          ok: false,
          message: "대본 segment가 없습니다. 문항을 다시 저장하세요.",
        });
        continue;
      }

      const out = await generateQuestionAudio({
        setId: opts.setId,
        questionId: q.id,
        apiKey: opts.apiKey,
        speechSpeed: opts.speechSpeed,
      });
      results.push({
        questionId: q.id,
        orderIndex: q.order_index,
        ok: true,
        audioUrl: out.audioUrl,
      });
    } catch (e) {
      results.push({
        questionId: q.id,
        orderIndex: q.order_index,
        ok: false,
        message: e instanceof Error ? e.message : "음원 생성 실패",
      });
    }
  }

  return results;
}
