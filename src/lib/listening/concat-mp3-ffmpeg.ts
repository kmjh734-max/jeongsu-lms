import { execFileSync } from "child_process";
import { writeFile } from "fs/promises";
import { dirname, join } from "path";
import ffmpeg from "@ffmpeg-installer/ffmpeg";

function escapeConcatPath(filePath: string): string {
  return filePath.replace(/\\/g, "/").replace(/'/g, "'\\''");
}

/**
 * ffmpeg concat + libmp3lame 재인코딩.
 * 서로 다른 인코더(ElevenLabs + lavf pause)를 버퍼로 이어붙이면 브라우저가 2번째 대사부터 재생하지 않음.
 */
export async function concatMp3FilesWithFfmpeg(
  inputPaths: string[],
  outputPath: string
): Promise<void> {
  if (inputPaths.length === 0) {
    throw new Error("합칠 음성 파일이 없습니다.");
  }

  const listPath = join(dirname(outputPath), `concat-${Date.now()}.txt`);
  const listBody = inputPaths
    .map((p) => `file '${escapeConcatPath(p)}'`)
    .join("\n");
  await writeFile(listPath, listBody, "utf8");

  execFileSync(
    ffmpeg.path,
    [
      "-f",
      "concat",
      "-safe",
      "0",
      "-i",
      listPath,
      "-ar",
      "44100",
      "-ac",
      "2",
      "-b:a",
      "128k",
      "-c:a",
      "libmp3lame",
      "-y",
      outputPath,
    ],
    { stdio: "pipe", maxBuffer: 32 * 1024 * 1024 }
  );
}
