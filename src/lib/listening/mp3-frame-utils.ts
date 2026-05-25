const BITRATES_V1_L3 = [
  0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320, 0,
] as const;
const SAMPLE_RATES_V1 = [44100, 48000, 32000, 0] as const;

/** MPEG1 Layer III 프레임 길이(바이트, 헤더 포함) */
export function mpeg1Layer3FrameLengthAt(buf: Buffer, offset: number): number | null {
  if (offset + 4 > buf.length) return null;
  if (buf[offset] !== 0xff || (buf[offset + 1]! & 0xe0) !== 0xe0) return null;

  const version = (buf[offset + 1]! >> 3) & 3;
  const layer = (buf[offset + 1]! >> 1) & 3;
  if (version !== 3 || layer !== 1) return null; // MPEG1 Layer III

  const bitrateIdx = (buf[offset + 2]! >> 4) & 0xf;
  const sampleRateIdx = (buf[offset + 2]! >> 2) & 3;
  const padding = (buf[offset + 2]! >> 1) & 1;
  const bitrate = BITRATES_V1_L3[bitrateIdx]! * 1000;
  const sampleRate = SAMPLE_RATES_V1[sampleRateIdx]!;
  if (!bitrate || !sampleRate) return null;

  return Math.floor((144 * bitrate) / sampleRate) + padding;
}

export function firstMpeg1Layer3FrameOffset(buf: Buffer): number {
  let i = 0;
  if (buf.length >= 10 && buf.toString("ascii", 0, 3) === "ID3") {
    const size =
      ((buf[6]! & 0x7f) << 21) |
      ((buf[7]! & 0x7f) << 14) |
      ((buf[8]! & 0x7f) << 7) |
      (buf[9]! & 0x7f);
    i = 10 + size;
  }
  for (; i < buf.length - 4; i++) {
    const len = mpeg1Layer3FrameLengthAt(buf, i);
    if (len != null && len >= 24) return i;
  }
  return 0;
}

/** 버퍼 끝에서 연속 MPEG 프레임만 추출 (인코더 패딩 무음 구간) */
export function extractTrailingMpegFrames(buf: Buffer, targetBytes: number): Buffer {
  let end = buf.length;
  if (end >= 128 && buf.toString("ascii", end - 128, end - 125) === "TAG") {
    end -= 128;
  }

  const frames: Buffer[] = [];
  let total = 0;
  let pos = end;

  while (pos > 4 && total < targetBytes) {
    let found = -1;
    for (let i = pos - 4; i >= Math.max(0, pos - 2000); i--) {
      const len = mpeg1Layer3FrameLengthAt(buf, i);
      if (len != null && i + len === pos) {
        found = i;
        break;
      }
    }
    if (found < 0) break;
    const len = mpeg1Layer3FrameLengthAt(buf, found)!;
    frames.unshift(buf.subarray(found, found + len));
    total += len;
    pos = found;
  }

  if (frames.length === 0) {
    throw new Error("MP3 끝에서 무음 프레임을 찾지 못했습니다.");
  }

  const out: Buffer[] = [];
  let written = 0;
  while (written < targetBytes) {
    for (const f of frames) {
      out.push(f);
      written += f.length;
      if (written >= targetBytes) break;
    }
  }
  return Buffer.concat(out);
}

/** 동일 프레임 반복으로 지정 시간(대략) 무음 mp3 생성 */
export function repeatMpegFrame(frame: Buffer, targetBytes: number): Buffer {
  if (frame.length < 4) throw new Error("유효하지 않은 MPEG 프레임");
  const parts: Buffer[] = [];
  let n = 0;
  while (n < targetBytes) {
    parts.push(frame);
    n += frame.length;
  }
  return Buffer.concat(parts);
}

export function collectMpeg1Layer3Frames(buf: Buffer): Buffer[] {
  const frames: Buffer[] = [];
  let i = firstMpeg1Layer3FrameOffset(buf);
  let guard = 0;
  while (i < buf.length - 4 && guard < 10_000) {
    guard++;
    const len = mpeg1Layer3FrameLengthAt(buf, i);
    if (len == null || len < 4) {
      i++;
      continue;
    }
    frames.push(buf.subarray(i, i + len));
    i += len;
  }
  return frames;
}

/**
 * ElevenLabs TTS 끝의 동일 패딩 프레임만 제거 (과도하게 자르면 다음 대사가 끊김)
 */
export function trimElevenLabsSegmentPadding(buf: Buffer): Buffer {
  const headerEnd = firstMpeg1Layer3FrameOffset(buf);
  const prefix = buf.subarray(0, headerEnd);
  const frames = collectMpeg1Layer3Frames(buf);
  if (frames.length <= 2) return buf;

  const tailRef = frames[frames.length - 1]!;
  let end = frames.length;
  let stripped = 0;
  const maxStrip = 6;

  while (end > 1 && stripped < maxStrip && frames[end - 1]!.equals(tailRef)) {
    end--;
    stripped++;
  }

  if (end >= frames.length) return buf;
  return Buffer.concat([prefix, ...frames.slice(0, end)]);
}
