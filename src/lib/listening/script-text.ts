import type { ListeningScriptSegment } from "@/lib/listening/types";

export function buildScriptText(segments: ListeningScriptSegment[]): string {
  return segments
    .map((s) => `${s.speaker}: ${s.text.trim()}`)
    .join("\n");
}
