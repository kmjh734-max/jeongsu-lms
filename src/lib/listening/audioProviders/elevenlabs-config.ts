export { getElevenLabsApiKey, resolveListeningVoiceIds } from "@/lib/listening/elevenlabs/resolve-voices";
export type {
  ListeningSetVoiceOverrides,
  ResolvedListeningVoices,
} from "@/lib/listening/elevenlabs/resolve-voices";

export const ELEVENLABS_TTS_MODEL = "eleven_multilingual_v2";

export const ELEVENLABS_VOICE_SETTINGS = {
  stability: 0.6,
  similarity_boost: 0.75,
  style: 0.1,
  use_speaker_boost: true,
} as const;

export function shouldSaveTtsSegments(): boolean {
  return process.env.SAVE_TTS_SEGMENTS === "true";
}
