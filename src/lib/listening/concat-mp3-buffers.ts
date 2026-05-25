type MpegFrameInfo = { offset: number; version: number; sampleRateIdx: number };

function readMpegFrameInfo(buf: Buffer, searchFrom = 0): MpegFrameInfo | null {
  let i = Math.max(searchFrom, id3v2Size(buf));
  for (; i < buf.length - 4; i++) {
    if (buf[i] !== 0xff || (buf[i + 1]! & 0xe0) !== 0xe0) continue;
    return {
      offset: i,
      version: (buf[i + 1]! >> 3) & 3,
      sampleRateIdx: (buf[i + 2]! >> 2) & 3,
    };
  }
  return null;
}

/** 서로 다른 샘플레이트/버전 MP3를 이어붙이면 브라우저가 2번째 구간부터 재생하지 않음 */
function assertCompatibleMp3Concat(buffers: Buffer[]): void {
  let ref: MpegFrameInfo | null = null;
  for (let n = 0; n < buffers.length; n++) {
    const info = readMpegFrameInfo(buffers[n]!);
    if (!info) continue;
    if (!ref) {
      ref = info;
      continue;
    }
    if (ref.version !== info.version || ref.sampleRateIdx !== info.sampleRateIdx) {
      throw new Error(
        `${n + 1}번째 mp3 포맷이 첫 파일과 다릅니다 (MPEG v${ref.version}/${ref.sampleRateIdx} vs v${info.version}/${info.sampleRateIdx}). ` +
          "ElevenLabs 음성과 OpenAI TTS pause 파일을 섞지 마세요. listening-pause-500ms.mp3를 다시 생성하세요."
      );
    }
  }
}

/** ID3v2 헤더 길이 (없으면 0) */
function id3v2Size(buf: Buffer): number {
  if (buf.length < 10 || buf.toString("ascii", 0, 3) !== "ID3") return 0;
  const size =
    ((buf[6]! & 0x7f) << 21) |
    ((buf[7]! & 0x7f) << 14) |
    ((buf[8]! & 0x7f) << 7) |
    (buf[9]! & 0x7f);
  return 10 + size;
}

/** 첫 MPEG 오디오 프레임 시작 오프셋 */
function firstMpegFrameOffset(buf: Buffer): number {
  const afterId3 = id3v2Size(buf);
  for (let i = afterId3; i < buf.length - 1; i++) {
    if (buf[i] === 0xff && (buf[i + 1]! & 0xe0) === 0xe0) return i;
  }
  return afterId3;
}

/** 끝 ID3v1 태그 제거 */
function withoutId3v1(buf: Buffer): Buffer {
  if (buf.length >= 128 && buf.toString("ascii", buf.length - 128, buf.length - 125) === "TAG") {
    return buf.subarray(0, buf.length - 128);
  }
  return buf;
}

/**
 * 동일 인코더(OpenAI TTS 등) MP3를 순서대로 이어 붙임.
 * Vercel 등 ffmpeg 바이너리 없는 환경에서 사용.
 */
export function concatMp3Buffers(buffers: Buffer[]): Buffer {
  if (buffers.length === 0) {
    throw new Error("합칠 음성 데이터가 없습니다.");
  }
  if (buffers.length === 1) {
    return buffers[0]!;
  }

  assertCompatibleMp3Concat(buffers);

  const parts: Buffer[] = [];
  for (let i = 0; i < buffers.length; i++) {
    const raw = buffers[i]!;
    if (raw.length === 0) {
      throw new Error(`${i + 1}번째 mp3가 비어 있습니다.`);
    }
    if (i === 0) {
      parts.push(withoutId3v1(raw));
    } else {
      parts.push(raw.subarray(firstMpegFrameOffset(raw)));
    }
  }
  return Buffer.concat(parts);
}
