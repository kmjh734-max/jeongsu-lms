import type { ListeningSpeakerType } from "@/lib/listening/types";

export const ELEVENLABS_TTS_MODEL = "eleven_multilingual_v2";

export const ELEVENLABS_VOICE_SETTINGS = {
  stability: 0.6,
  similarity_boost: 0.75,
  style: 0.1,
  use_speaker_boost: true,
} as const;

const SPEAKERS: ListeningSpeakerType[] = ["ANN", "M", "W"];

function envVoiceId(speaker: ListeningSpeakerType): string | undefined {
  const key = `ELEVENLABS_VOICE_${speaker}` as const;
  return process.env[key]?.trim() || undefined;
}

export interface ElevenLabsListeningConfig {
  apiKey: string;
  voiceIds: Record<ListeningSpeakerType, string>;
}

/** 서버 전용 — ElevenLabs 듣기 음원 생성 설정 검증 */
export function getElevenLabsListeningConfig(): ElevenLabsListeningConfig {
  const apiKey = process.env.ELEVENLABS_API_KEY?.trim();
  if (!apiKey) {
    throw new Error(
      "ELEVENLABS_API_KEY가 설정되어 있지 않습니다. .env.local 또는 Vercel 환경변수에 추가한 뒤 서버를 재시작해 주세요."
    );
  }

  const missing: ListeningSpeakerType[] = [];
  const voiceIds = {} as Record<ListeningSpeakerType, string>;

  for (const speaker of SPEAKERS) {
    const id = envVoiceId(speaker);
    if (!id) {
      missing.push(speaker);
    } else {
      voiceIds[speaker] = id;
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `ElevenLabs 화자 voice_id가 설정되어 있지 않습니다: ${missing.join(", ")}. ` +
        `ELEVENLABS_VOICE_ANN, ELEVENLABS_VOICE_M, ELEVENLABS_VOICE_W를 설정해 주세요.`
    );
  }

  return { apiKey, voiceIds };
}

export function voiceIdForSpeaker(
  config: ElevenLabsListeningConfig,
  speaker: ListeningSpeakerType
): string {
  const id = config.voiceIds[speaker];
  if (!id) {
    throw new Error(
      `ElevenLabs ${speaker} voice_id가 설정되어 있지 않습니다. (ELEVENLABS_VOICE_${speaker})`
    );
  }
  return id;
}

export function shouldSaveTtsSegments(): boolean {
  return process.env.SAVE_TTS_SEGMENTS === "true";
}
