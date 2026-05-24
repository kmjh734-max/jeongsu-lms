import { copyFile, mkdir, readFile, writeFile } from "fs/promises";
import { dirname } from "path";
import { concatMp3Buffers } from "@/lib/listening/concat-mp3-buffers";

/** OpenAI TTS mp3와 동일하게 맞춤 (레거시 ffmpeg 무음 생성용) */
export const TTS_SAMPLE_RATE = 24000;

/**
 * MP3 파일 순서대로 합치기 (동일 TTS 포맷 — ffmpeg 없이 버퍼 병합).
 */
export async function concatMp3Files(
  inputPaths: string[],
  outputPath: string
): Promise<void> {
  if (inputPaths.length === 0) {
    throw new Error("합칠 음성 파일이 없습니다.");
  }

  await mkdir(dirname(outputPath), { recursive: true });

  if (inputPaths.length === 1) {
    await copyFile(inputPaths[0]!, outputPath);
    return;
  }

  const buffers = await Promise.all(inputPaths.map((p) => readFile(p)));
  const merged = concatMp3Buffers(buffers);
  if (merged.length < 500) {
    throw new Error("합성된 mp3가 비어 있습니다.");
  }
  await writeFile(outputPath, merged);
}
