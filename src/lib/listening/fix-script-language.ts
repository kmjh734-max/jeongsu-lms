import { buildScriptText } from "@/lib/listening/script-text";
import type {
  GeneratedListeningQuestion,
  ListeningScriptSegment,
} from "@/lib/listening/types";

function hangulCount(text: string): number {
  return (text.match(/[\uAC00-\uD7A3\u3131-\u318E]/g) ?? []).length;
}

function latinCount(text: string): number {
  return (text.match(/[a-zA-Z]/g) ?? []).length;
}

export function isMostlyKorean(text: string): boolean {
  const t = text.trim();
  if (!t) return false;
  return hangulCount(t) > latinCount(t);
}

export function isMostlyEnglish(text: string): boolean {
  const t = text.trim();
  if (!t) return false;
  return latinCount(t) > hangulCount(t) * 2;
}

export function parseScriptText(script: string): ListeningScriptSegment[] {
  const lines = script.split("\n").filter((l) => l.trim());
  const out: ListeningScriptSegment[] = [];
  for (const line of lines) {
    const m = line.match(/^(ANN|M|W):\s*(.+)$/i);
    if (!m) continue;
    const speaker = m[1]!.toUpperCase();
    if (speaker !== "ANN" && speaker !== "M" && speaker !== "W") continue;
    out.push({ speaker, text: m[2]!.trim() });
  }
  return out;
}

function splitEnglishSentences(text: string): string[] {
  return text
    .trim()
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function koreanTranslationFromSegments(
  segments: ListeningScriptSegment[]
): string {
  return segments
    .map((s) => {
      const who =
        s.speaker === "M" ? "남" : s.speaker === "W" ? "여" : "안내";
      return `${who}: ${s.text.trim()}`;
    })
    .join("\n");
}

function englishSegmentsFromText(
  english: string,
  template: ListeningScriptSegment[]
): ListeningScriptSegment[] {
  const trimmed = english.trim();
  if (!trimmed) return template;

  const fromScript = parseScriptText(trimmed);
  if (fromScript.length > 0) return fromScript;

  const speaker =
    template.find((s) => s.speaker === "M" || s.speaker === "W")?.speaker ?? "W";

  if (template.length <= 1) {
    return [{ speaker, text: trimmed }];
  }

  const sentences = splitEnglishSentences(trimmed);
  if (sentences.length === template.length) {
    return template.map((t, i) => ({
      speaker: t.speaker === "M" || t.speaker === "W" ? t.speaker : speaker,
      text: sentences[i]!,
    }));
  }

  return [{ speaker, text: trimmed }];
}

/**
 * segments에 한국어·script_translation에 영어가 들어간 경우 교정
 * (듣기 대본은 segments 영어, script_translation 한국어)
 */
export function fixSwappedScriptLanguage(
  q: GeneratedListeningQuestion
): GeneratedListeningQuestion {
  const segCombined = q.segments.map((s) => s.text).join(" ");
  const translation = q.script_translation?.trim() ?? "";
  const scriptText = q.script_text?.trim() ?? "";

  const segmentsKorean = isMostlyKorean(segCombined);
  const translationEnglish =
    translation.length > 0 && isMostlyEnglish(translation);

  if (!segmentsKorean || !translationEnglish) {
    return q;
  }

  const koTranslation =
    koreanTranslationFromSegments(q.segments) || segCombined;

  let englishSegments: ListeningScriptSegment[] = [];

  if (scriptText && isMostlyEnglish(scriptText)) {
    englishSegments = parseScriptText(scriptText);
    if (englishSegments.length === 0 && isMostlyEnglish(scriptText)) {
      englishSegments = englishSegmentsFromText(scriptText, q.segments);
    }
  }

  if (englishSegments.length === 0) {
    englishSegments = englishSegmentsFromText(translation, q.segments);
  }

  const script_text = buildScriptText(englishSegments);

  return {
    ...q,
    segments: englishSegments,
    script_text,
    script_translation: koTranslation,
  };
}
