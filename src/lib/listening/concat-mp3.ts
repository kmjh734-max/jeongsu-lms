import { copyFile, mkdir, writeFile } from "fs/promises";
import { dirname, join } from "path";
import { execFile } from "child_process";
import { promisify } from "util";

const execFileAsync = promisify(execFile);

async function resolveFfmpegPath(): Promise<string> {
  try {
    const mod = await import("ffmpeg-static");
    const path = mod.default;
    if (typeof path === "string" && path.length > 0) return path;
  } catch {
    /* optional dependency */
  }
  return "ffmpeg";
}

/**
 * Concatenate MP3 files in order (ffmpeg concat demuxer, stream copy).
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
    "-c",
    "copy",
    "-y",
    outputPath,
  ]);
}
