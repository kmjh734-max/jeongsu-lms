import { mkdtemp, readFile, rm, writeFile } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";
import { generateElevenLabsSpeechSegment } from "@/lib/listening/audioProviders/elevenlabsTts";
import { shouldSaveTtsSegments } from "@/lib/listening/audioProviders/elevenlabs-config";
import {
  resolveListeningVoiceIds,
  type ListeningSetVoiceOverrides,
  type ResolvedListeningVoices,
} from "@/lib/listening/elevenlabs/resolve-voices";
import { runWithConcurrency } from "@/lib/run-with-concurrency";
import { createAdminClient } from "@/lib/supabase/admin";
import { concatMp3Files } from "@/lib/listening/concat-mp3";
import {
  defaultContinuationQuestionText,
  isNonSpokenSegmentText,
} from "@/lib/listening/fix-continuation-question";
import { trimElevenLabsSegmentPadding } from "@/lib/listening/mp3-frame-utils";
import { getPauseBufferMs } from "@/lib/listening/pause-mp3";
import {
  finalStoragePath,
  publicAudioUrl,
  segmentStoragePath,
  storagePathFromPublicUrl,
} from "@/lib/listening/storage-paths";
import {
  repairMwDialogueSegmentsInDb,
  repairSetMwDialogueInDb,
} from "@/lib/listening/ensure-mw-dialogue";
import { voiceForSpeaker } from "@/lib/listening/speaker-voices";
import {
  DEFAULT_SPEECH_SPEED_PRESET,
  EXAM_DEFAULT_SPEECH_SPEED,
  speedFromPreset,
} from "@/lib/listening/speech-speed";
import type { ListeningSegmentRow, ListeningSpeakerType } from "@/lib/listening/types";

const BUCKET = "listening-audio";

/** 19~20번: 빈칸·응답 대사는 음원에서 제외 */
function segmentsForAudio(
  rows: ListeningSegmentRow[],
  orderIndex: number
): ListeningSegmentRow[] {
  const filtered = rows.filter((r) => !isNonSpokenSegmentText(r.text));
  if (orderIndex === 19) {
    let lastW = -1;
    for (let i = 0; i < filtered.length; i++) {
      if (filtered[i]!.speaker_type === "W") lastW = i;
    }
    if (lastW >= 0) return filtered.slice(0, lastW + 1);
  }
  if (orderIndex === 20) {
    let lastM = -1;
    for (let i = 0; i < filtered.length; i++) {
      if (filtered[i]!.speaker_type === "M") lastM = i;
    }
    if (lastM >= 0) return filtered.slice(0, lastM + 1);
  }
  return filtered;
}

export interface GenerateAudioResult {
  audioUrl: string;
  provider: "elevenlabs";
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
  await writeFile(destPath, Buffer.from(await data.arrayBuffer()));
}

async function updateQuestionAudioUrl(
  admin: ReturnType<typeof createAdminClient>,
  questionId: string,
  audioUrl: string
): Promise<void> {
  const { error } = await admin
    .from("listening_questions")
    .update({ audio_url: audioUrl })
    .eq("id", questionId);
  if (error) {
    throw new Error(`문항 audio_url 저장 실패: ${error.message}`);
  }
}

async function synthesizeSegmentToFile(
  resolved: ResolvedListeningVoices,
  speaker: ListeningSpeakerType,
  text: string,
  speed: number,
  destPath: string
): Promise<Buffer> {
  const raw = await generateElevenLabsSpeechSegment({
    text,
    speaker,
    apiKey: resolved.apiKey,
    voiceId: resolved.voiceIds[speaker],
    speed,
  });
  const buffer = trimElevenLabsSegmentPadding(raw);
  await writeFile(destPath, buffer);
  return buffer;
}

async function loadSetVoiceOverrides(
  admin: ReturnType<typeof createAdminClient>,
  setId: string
): Promise<ListeningSetVoiceOverrides> {
  const { data } = await admin
    .from("listening_sets")
    .select("voice_ann_id, voice_m_id, voice_w_id")
    .eq("id", setId)
    .maybeSingle();
  return {
    voice_ann_id: data?.voice_ann_id ?? null,
    voice_m_id: data?.voice_m_id ?? null,
    voice_w_id: data?.voice_w_id ?? null,
  };
}

export async function generateQuestionAudio(opts: {
  setId: string;
  questionId: string;
  segmentId?: string;
  speechSpeed?: number;
  resolvedVoices?: ResolvedListeningVoices;
  skipRepair?: boolean;
  skipIfFinalExists?: boolean;
}): Promise<GenerateAudioResult> {
  const { setId, questionId, segmentId } = opts;
  const speed = opts.speechSpeed ?? EXAM_DEFAULT_SPEECH_SPEED;
  const saveSegments = shouldSaveTtsSegments();

  const admin = createAdminClient();
  const resolved =
    opts.resolvedVoices ??
    (await resolveListeningVoiceIds(
      await loadSetVoiceOverrides(admin, setId)
    ));
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) throw new Error("NEXT_PUBLIC_SUPABASE_URL이 설정되지 않았습니다.");

  const { data: questionMeta } = await admin
    .from("listening_questions")
    .select("order_index, question_text, audio_url")
    .eq("id", questionId)
    .maybeSingle();

  const orderIndex = questionMeta?.order_index ?? 0;

  if (
    opts.skipIfFinalExists &&
    !segmentId &&
    questionMeta?.audio_url?.trim()
  ) {
    return { audioUrl: questionMeta.audio_url.trim(), provider: "elevenlabs" };
  }

  if (!opts.skipRepair) {
    await repairMwDialogueSegmentsInDb(admin, questionId, orderIndex);
  }

  if (
    (orderIndex === 19 || orderIndex === 20) &&
    !questionMeta?.question_text?.trim()
  ) {
    await admin
      .from("listening_questions")
      .update({
        question_text: defaultContinuationQuestionText(orderIndex as 19 | 20),
      })
      .eq("id", questionId);
  }

  const { data: segments, error: segErr } = await admin
    .from("listening_question_segments")
    .select("*")
    .eq("question_id", questionId)
    .order("order_index", { ascending: true });

  if (segErr) throw new Error(segErr.message);
  if (!segments?.length) throw new Error("대본 segment가 없습니다.");

  const workDir = await mkdtemp(join(tmpdir(), "listening-audio-"));
  const segmentOnlyPaths: string[] = [];

  try {
    const rows = segmentsForAudio(segments as ListeningSegmentRow[], orderIndex);
    if (!rows.length) {
      throw new Error("음원으로 만들 spoken segment가 없습니다. 대본을 확인하세요.");
    }
    const segmentPaths = await runWithConcurrency(
      rows,
      1,
      async (seg, i) => {
        const speaker = seg.speaker_type as ListeningSpeakerType;
        const localPath = join(
          workDir,
          `${String(seg.order_index + 1).padStart(2, "0")}-${speaker.toLowerCase()}.mp3`
        );

        const mustSynthesize = !segmentId || seg.id === segmentId;

        if (mustSynthesize) {
          const buffer = await synthesizeSegmentToFile(
            resolved,
            speaker,
            seg.text,
            speed,
            localPath
          );
          const voiceId = resolved.voiceIds[speaker];

          if (saveSegments) {
            const storagePath = segmentStoragePath(setId, questionId, seg.id);
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
                voice_name: voiceForSpeaker(speaker, voiceId),
              })
              .eq("id", seg.id);
          } else {
            await admin
              .from("listening_question_segments")
              .update({ voice_name: voiceForSpeaker(speaker, voiceId) })
              .eq("id", seg.id);
          }
        } else if (saveSegments && seg.audio_url) {
          await downloadSegmentToFile(admin, supabaseUrl, seg.audio_url, localPath);
        } else {
          await synthesizeSegmentToFile(
            resolved,
            speaker,
            seg.text,
            speed,
            localPath
          );
        }

        return { localPath, index: i };
      }
    );

    segmentPaths
      .sort((a, b) => a.index - b.index)
      .forEach((p) => segmentOnlyPaths.push(p.localPath));

    if (segmentOnlyPaths.length === 0) {
      throw new Error("합칠 segment 음성이 없습니다.");
    }

    const mergePaths: string[] = [];
    for (let i = 0; i < segmentOnlyPaths.length; i++) {
      mergePaths.push(segmentOnlyPaths[i]!);
      if (i < segmentOnlyPaths.length - 1) {
        const speaker = rows[i]!.speaker_type as ListeningSpeakerType;
        const pauseMs: 500 | 700 = speaker === "ANN" ? 700 : 500;
        const pauseBuf = await getPauseBufferMs(pauseMs);
        const pausePath = join(workDir, `pause-${i}.mp3`);
        await writeFile(pausePath, pauseBuf);
        mergePaths.push(pausePath);
      }
    }

    const finalLocal = join(workDir, "final.mp3");
    try {
      await concatMp3Files(mergePaths, finalLocal);
    } catch (mergeErr) {
      try {
        await concatMp3Files(segmentOnlyPaths, finalLocal);
      } catch {
        const hint =
          mergeErr instanceof Error ? mergeErr.message : "mp3 병합 실패";
        throw new Error(
          `${hint} (대사만 이어 붙이기도 실패했습니다. Vercel에 ffmpeg가 포함되어 있는지 확인해 주세요.)`
        );
      }
    }
    const stat = await import("fs/promises").then((fs) => fs.stat(finalLocal));
    if (stat.size < 500) {
      throw new Error("합성된 mp3가 비어 있습니다. 음원을 다시 생성해 주세요.");
    }

    const finalBuffer = await readFile(finalLocal);
    const finalPath = finalStoragePath(setId, questionId);
    const { error: finalUpErr } = await admin.storage
      .from(BUCKET)
      .upload(finalPath, finalBuffer, {
        contentType: "audio/mpeg",
        upsert: true,
      });
    if (finalUpErr) throw new Error(`최종 mp3 업로드 실패: ${finalUpErr.message}`);

    const audioUrl = publicAudioUrl(supabaseUrl, finalPath);
    await updateQuestionAudioUrl(admin, questionId, audioUrl);

    return { audioUrl, provider: "elevenlabs" };
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

export async function generateSetQuestionAudio(opts: {
  setId: string;
  speechSpeed?: number;
  questionIds?: string[];
  skipExisting?: boolean;
}): Promise<BatchAudioItemResult[]> {
  const admin = createAdminClient();
  let query = admin
    .from("listening_questions")
    .select("id, order_index, audio_url")
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

  await repairSetMwDialogueInDb(admin, opts.setId);

  const setOverrides = await loadSetVoiceOverrides(admin, opts.setId);
  const resolved = await resolveListeningVoiceIds(setOverrides);
  const speechSpeed =
    opts.speechSpeed ?? speedFromPreset(DEFAULT_SPEECH_SPEED_PRESET);

  const results = await runWithConcurrency(questions, 1, async (q) => {
    try {
      if (opts.skipExisting && q.audio_url?.trim()) {
        return {
          questionId: q.id,
          orderIndex: q.order_index,
          ok: true,
          audioUrl: q.audio_url.trim(),
        };
      }

      const { data: segCheck } = await admin
        .from("listening_question_segments")
        .select("id")
        .eq("question_id", q.id)
        .limit(1);
      if (!segCheck?.length) {
        return {
          questionId: q.id,
          orderIndex: q.order_index,
          ok: false,
          message: "대본 segment가 없습니다. 문항을 다시 저장하세요.",
        };
      }

      const out = await generateQuestionAudio({
        setId: opts.setId,
        questionId: q.id,
        speechSpeed,
        resolvedVoices: resolved,
        skipRepair: true,
        skipIfFinalExists: opts.skipExisting,
      });
      return {
        questionId: q.id,
        orderIndex: q.order_index,
        ok: true,
        audioUrl: out.audioUrl,
      };
    } catch (e) {
      return {
        questionId: q.id,
        orderIndex: q.order_index,
        ok: false,
        message: e instanceof Error ? e.message : "음원 생성 실패",
      };
    }
  });

  return results;
}
