import { readFile } from "fs/promises";
import { join } from "path";
import { concatMp3Buffers } from "@/lib/listening/concat-mp3-buffers";

let cached500: Buffer | null = null;

/** public/audio/listening-pause-500ms.mp3 — TTS로 1회 생성해 커밋한 무음 파일 */
async function loadPause500(): Promise<Buffer> {
  if (cached500) return cached500;
  const path = join(process.cwd(), "public", "audio", "listening-pause-500ms.mp3");
  cached500 = await readFile(path);
  return cached500;
}

export async function getPauseBufferMs(ms: 500 | 700): Promise<Buffer> {
  const base = await loadPause500();
  if (ms <= 500) return base;
  return concatMp3Buffers([base, base]);
}
