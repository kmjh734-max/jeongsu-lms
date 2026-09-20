import { execFileSync } from "child_process";
import { readFileSync, rmSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";
import ffmpeg from "@ffmpeg-installer/ffmpeg";

/**
 * 발화 사이 쉼(무음) mp3.
 *
 * Edge 음성과 같은 포맷(24kHz·48kbps·모노)으로 ffmpeg가 만들어 준다. 손으로 빈 프레임을 만들면
 * ffmpeg가 이어 붙이다 중간에 멈춰서 음원이 잘린다(2026-09-21에 겪음).
 */
const cache = new Map<number, Buffer>();

export function silenceBufferMs(ms: number): Buffer {
  const cached = cache.get(ms);
  if (cached) return cached;
  const out = join(tmpdir(), `listening-pause-${ms}.mp3`);
  execFileSync(
    ffmpeg.path,
    [
      "-f", "lavfi",
      "-i", "anullsrc=r=24000:cl=mono",
      "-t", (ms / 1000).toFixed(3),
      "-c:a", "libmp3lame",
      "-b:a", "48k",
      "-y", out,
    ],
    { stdio: "pipe" }
  );
  const buf = readFileSync(out);
  rmSync(out, { force: true });
  cache.set(ms, buf);
  return buf;
}

export async function getPauseBufferMs(ms: 500 | 700): Promise<Buffer> {
  return silenceBufferMs(ms);
}
