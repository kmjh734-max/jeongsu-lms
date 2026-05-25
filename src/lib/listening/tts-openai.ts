/**
 * @deprecated 듣기 음원 생성에는 사용하지 않습니다. ElevenLabs만 사용합니다.
 * (src/lib/listening/audioProviders/elevenlabsTts.ts)
 */
import { sanitizeSegmentTextForTts } from "@/lib/listening/sanitize-segment-text";
import type { ListeningSpeakerType } from "@/lib/listening/types";

const OPENAI_VOICE_MAP: Record<ListeningSpeakerType, string> = {
  ANN: "alloy",
  M: "echo",
  W: "nova",
};

/**
 * OpenAI TTS `input`은 그대로 읽힙니다.
 * 속도·톤 지시문을 input에 넣으면 지문과 다른 내용이 읽히므로 넣지 않습니다.
 */
export async function synthesizeSegmentMp3(
  apiKey: string,
  speaker: ListeningSpeakerType,
  text: string,
  speed = 0.9
): Promise<Buffer> {
  const spoken = sanitizeSegmentTextForTts(text);
  if (!spoken) {
    throw new Error("빈 대사는 음성으로 만들 수 없습니다.");
  }

  const voice = OPENAI_VOICE_MAP[speaker];
  const clampedSpeed = Math.min(Math.max(speed, 0.25), 4);

  const response = await fetch("https://api.openai.com/v1/audio/speech", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "tts-1",
      input: spoken,
      voice,
      speed: clampedSpeed,
      response_format: "mp3",
    }),
  });

  if (!response.ok) {
    const bodyText = await response.text();
    throw new Error(
      `OpenAI TTS 실패 (HTTP ${response.status}): ${bodyText.slice(0, 200)}`
    );
  }

  return Buffer.from(await response.arrayBuffer());
}
