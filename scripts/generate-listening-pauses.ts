/**
 * ffmpeg로 진짜 무음 pause mp3 생성 (44.1kHz / 128kbps stereo).
 * ElevenLabs 패딩 프레임 반복은 "엄/음" 잡음이 들어갑니다.
 *
 * 실행: npx tsx scripts/generate-listening-pauses.ts
 * (devDependency @ffmpeg-installer/ffmpeg 필요)
 */
import { execFileSync } from "child_process";
import { writeFileSync } from "fs";
import { join } from "path";
import ffmpeg from "@ffmpeg-installer/ffmpeg";

const outDir = join(process.cwd(), "public", "audio");

function writeSilentMp3(filename: string, seconds: number): void {
  const outPath = join(outDir, filename);
  execFileSync(
    ffmpeg.path,
    [
      "-f",
      "lavfi",
      "-i",
      "anullsrc=r=44100:cl=stereo",
      "-t",
      String(seconds),
      "-c:a",
      "libmp3lame",
      "-b:a",
      "128k",
      "-ar",
      "44100",
      "-ac",
      "2",
      "-y",
      outPath,
    ],
    { stdio: "pipe" }
  );
  console.log(`Wrote ${filename}`);
}

writeSilentMp3("listening-pause-500ms.mp3", 0.5);
writeSilentMp3("listening-pause-700ms.mp3", 0.7);
