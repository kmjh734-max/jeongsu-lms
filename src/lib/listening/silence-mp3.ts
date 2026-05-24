import { mkdir } from "fs/promises";
import { dirname } from "path";
import { execFile } from "child_process";
import { promisify } from "util";

const execFileAsync = promisify(execFile);

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

/** 짧은 무음 mp3 생성 (segment 사이 pause) */
export async function generateSilenceMp3(
  durationSec: number,
  outputPath: string
): Promise<void> {
  const duration = Math.min(Math.max(durationSec, 0.1), 3);
  await mkdir(dirname(outputPath), { recursive: true });
  const ffmpeg = await resolveFfmpegPath();
  await execFileAsync(ffmpeg, [
    "-f",
    "lavfi",
    "-i",
    "anullsrc=r=44100:cl=mono",
    "-t",
    String(duration),
    "-c:a",
    "libmp3lame",
    "-q:a",
    "9",
    "-y",
    outputPath,
  ]);
}

export const SEGMENT_PAUSE_SEC = 0.5;
export const AFTER_ANN_PAUSE_SEC = 0.65;
export const BEFORE_FIRST_LINE_PAUSE_SEC = 0.35;
