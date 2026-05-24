import { voiceForSpeaker } from "@/lib/listening/speaker-voices";
import type { ListeningSpeakerType } from "@/lib/listening/types";

export async function synthesizeSegmentMp3(
  apiKey: string,
  speaker: ListeningSpeakerType,
  text: string
): Promise<Buffer> {
  const trimmed = text.trim();
  if (!trimmed) {
    throw new Error("빈 대사는 음성으로 만들 수 없습니다.");
  }

  const voice = voiceForSpeaker(speaker);
  const response = await fetch("https://api.openai.com/v1/audio/speech", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "tts-1",
      input: trimmed,
      voice,
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
