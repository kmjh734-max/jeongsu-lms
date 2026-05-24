import type { ListeningSpeakerType } from "@/lib/listening/types";

const BUCKET = "listening-audio";

export function segmentStoragePath(
  setId: string,
  questionId: string,
  orderIndex: number,
  speaker: ListeningSpeakerType
): string {
  const num = String(orderIndex + 1).padStart(2, "0");
  return `listening/${setId}/${questionId}/segments/${num}-${speaker.toLowerCase()}.mp3`;
}

export function finalStoragePath(setId: string, questionId: string): string {
  return `listening/${setId}/${questionId}/final.mp3`;
}

export function publicAudioUrl(supabaseUrl: string, storagePath: string): string {
  const base = supabaseUrl.replace(/\/$/, "");
  return `${base}/storage/v1/object/public/${BUCKET}/${storagePath}`;
}

export function storagePathFromPublicUrl(
  supabaseUrl: string,
  publicUrl: string
): string | null {
  const marker = `/storage/v1/object/public/${BUCKET}/`;
  const base = supabaseUrl.replace(/\/$/, "");
  const normalized = publicUrl.replace(/\/$/, "");
  const prefix = `${base}${marker}`;
  if (!normalized.startsWith(prefix)) return null;
  return normalized.slice(prefix.length);
}
