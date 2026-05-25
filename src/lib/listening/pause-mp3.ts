import { readFile } from "fs/promises";
import { join } from "path";
import { concatMp3Buffers } from "@/lib/listening/concat-mp3-buffers";

let cached500: Buffer | null = null;
let cached700: Buffer | null = null;

/** ffmpeg anullsrc 44.1kHz 128k stereo — scripts/generate-listening-pauses.ts 로 생성 */
async function loadPause500(): Promise<Buffer> {
  if (cached500) return cached500;
  const path = join(process.cwd(), "public", "audio", "listening-pause-500ms.mp3");
  cached500 = await readFile(path);
  return cached500;
}

async function loadPause700(): Promise<Buffer> {
  if (cached700) return cached700;
  const dedicated = join(process.cwd(), "public", "audio", "listening-pause-700ms.mp3");
  try {
    cached700 = await readFile(dedicated);
    return cached700;
  } catch {
    const base = await loadPause500();
    cached700 = concatMp3Buffers([base, base]);
    return cached700;
  }
}

export async function getPauseBufferMs(ms: 500 | 700): Promise<Buffer> {
  if (ms <= 500) return loadPause500();
  return loadPause700();
}
