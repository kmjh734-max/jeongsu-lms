import { copyFile, mkdir, writeFile } from "fs/promises";
import { dirname, join } from "path";
import { execFile } from "child_process";
import { promisify } from "util";

const execFileAsync = promisify(execFile);

/** OpenAI TTS mp3와 동일하게 맞춤 */
export const TTS_SAMPLE_RATE = 24000;

async function resolveFfmpegPath(): Promise<string> {
  try {
    const mod = await import("ffmpeg-static");
    const path = mod.default;
    if (typeof path === "string" && path.length > 0) return path;
  } catch {
    /* optional */
  }
  return "ffmpeg";
}

/**
 * MP3 파일 순서대로 합치기 (재인코딩 — TTS·무음 포맷이 달라도 안전).
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
    await copyFile(inputPaths[0], outputPath);
    return;
  }

  const listPath = join(dirname(outputPath), "concat-list.txt");
  const listContent = inputPaths
    .map((p) => `file '${p.replace(/\\/g, "/").replace(/'/g, "'\\''")}'`)
    .join("\n");
  await writeFile(listPath, listContent, "utf8");

  const ffmpeg = await resolveFfmpegPath();
  await execFileAsync(ffmpeg, [
    "-f",
    "concat",
    "-safe",
    "0",
    "-i",
    listPath,
    "-ar",
    String(TTS_SAMPLE_RATE),
    "-ac",
    "1",
    "-c:a",
    "libmp3lame",
    "-q:a",
    "4",
    "-y",
    outputPath,
  ]);
}
