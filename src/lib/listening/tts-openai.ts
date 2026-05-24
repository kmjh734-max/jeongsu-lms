import { voiceForSpeaker } from "@/lib/listening/speaker-voices";
import type { ListeningSpeakerType } from "@/lib/listening/types";

const MIDDLE1_TTS_HINT =
  "Speak clearly and slightly slowly for Korean middle school first-year students. Use natural pauses between phrases.";

function buildTtsInput(speaker: ListeningSpeakerType, text: string): string {
  const trimmed = text.trim();
  if (speaker === "ANN") {
    return `${MIDDLE1_TTS_HINT} Calm, clear announcer tone. ${trimmed}`;
  }
  return `${MIDDLE1_TTS_HINT} ${trimmed}`;
}

export async function synthesizeSegmentMp3(
  apiKey: string,
  speaker: ListeningSpeakerType,
  text: string,
  speed = 0.9
): Promise<Buffer> {
  const trimmed = text.trim();
  if (!trimmed) {
    throw new Error("빈 대사는 음성으로 만들 수 없습니다.");
  }

  const voice = voiceForSpeaker(speaker);
  const clampedSpeed = Math.min(Math.max(speed, 0.25), 4);

  const response = await fetch("https://api.openai.com/v1/audio/speech", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "tts-1",
      input: buildTtsInput(speaker, trimmed),
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
