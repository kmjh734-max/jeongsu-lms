import {
  ELEVENLABS_TTS_MODEL,
  ELEVENLABS_VOICE_SETTINGS,
} from "@/lib/listening/audioProviders/elevenlabs-config";
import type { ListeningSpeakerType } from "@/lib/listening/types";

export interface GenerateElevenLabsSegmentOpts {
  text: string;
  speaker: ListeningSpeakerType;
  apiKey: string;
  voiceId: string;
  speed?: number;
}

function clampSpeed(speed: number): number {
  return Math.min(Math.max(speed, 0.25), 4);
}

function parseElevenLabsError(status: number, bodyText: string): string {
  if (status === 401) {
    try {
      const j = JSON.parse(bodyText) as { detail?: { message?: string } | string };
      const detail =
        typeof j.detail === "string" ? j.detail : j.detail?.message;
      if (detail) {
        return `ElevenLabs 인증 실패: ${detail}`;
      }
    } catch {
      /* ignore */
    }
    return "ElevenLabs API 키가 올바르지 않습니다. ELEVENLABS_API_KEY를 확인한 뒤 npm run dev를 다시 실행해 주세요.";
  }
  if (status === 404) {
    return "ElevenLabs voice_id를 찾을 수 없습니다. 고급 음성 설정을 확인해 주세요.";
  }
  if (status === 429) {
    return "ElevenLabs 사용량 한도에 도달했습니다. 잠시 후 다시 시도해 주세요.";
  }
  try {
    const j = JSON.parse(bodyText) as { detail?: { message?: string } | string };
    const detail =
      typeof j.detail === "string" ? j.detail : j.detail?.message;
    if (detail) return `ElevenLabs: ${detail}`;
  } catch {
    /* ignore */
  }
  return `ElevenLabs 음원 생성 실패 (HTTP ${status})`;
}

export async function generateElevenLabsSpeechSegment(
  opts: GenerateElevenLabsSegmentOpts
): Promise<Buffer> {
  const spoken = opts.text.trim();
  if (!spoken) {
    throw new Error("빈 대사는 음성으로 만들 수 없습니다.");
  }

  const voiceId = opts.voiceId.trim();
  if (!voiceId) {
    throw new Error(`ElevenLabs ${opts.speaker} voice_id가 비어 있습니다.`);
  }

  // ElevenLabs는 speed를 voice_settings 안에 넣어야 적용됨 (최상위 body.speed는 무시됨)
  const speed =
    typeof opts.speed === "number" && opts.speed > 0
      ? clampSpeed(opts.speed)
      : 1.0;

  const body: Record<string, unknown> = {
    text: spoken,
    model_id: ELEVENLABS_TTS_MODEL,
    voice_settings: {
      ...ELEVENLABS_VOICE_SETTINGS,
      speed,
    },
  };

  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voiceId)}`,
    {
      method: "POST",
      headers: {
        "xi-api-key": opts.apiKey,
        "Content-Type": "application/json",
        Accept: "audio/mpeg",
      },
      body: JSON.stringify(body),
    }
  );

  if (!response.ok) {
    const bodyText = await response.text();
    throw new Error(parseElevenLabsError(response.status, bodyText));
  }

  const buf = Buffer.from(await response.arrayBuffer());
  if (buf.length < 100) {
    throw new Error("ElevenLabs가 비어 있는 음원을 반환했습니다.");
  }
  return buf;
}
