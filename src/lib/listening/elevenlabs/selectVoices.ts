import type { ElevenLabsVoiceSummary } from "@/lib/listening/elevenlabs/getVoices";
import type { ListeningSpeakerType } from "@/lib/listening/types";

export type AutoSelectedVoices = Record<ListeningSpeakerType, string>;

function hay(voice: ElevenLabsVoiceSummary): string {
  const parts = [
    voice.name,
    voice.category ?? "",
    ...Object.entries(voice.labels).map(([k, val]) => `${k}:${val}`),
  ];
  return parts.join(" ").toLowerCase();
}

function labelGender(voice: ElevenLabsVoiceSummary): string {
  return (
    voice.labels.gender ??
    voice.labels["gender"] ??
    ""
  ).toLowerCase();
}

function scoreAnn(voice: ElevenLabsVoiceSummary): number {
  const h = hay(voice);
  let score = 0;
  if (/neutral|narrator|calm|professional|announcer|news/.test(h)) score += 10;
  if (/male|female|boy|girl|child/.test(h)) score -= 2;
  if (voice.category === "premade") score += 1;
  return score;
}

function scoreMale(voice: ElevenLabsVoiceSummary): number {
  const g = labelGender(voice);
  const h = hay(voice);
  let score = 0;
  if (g === "male" || g.includes("male")) score += 15;
  if (/male|man|deep|narrator|boy/.test(h)) score += 8;
  if (g === "female" || g.includes("female")) score -= 10;
  return score;
}

function scoreFemale(voice: ElevenLabsVoiceSummary): number {
  const g = labelGender(voice);
  const h = hay(voice);
  let score = 0;
  if (g === "female" || g.includes("female")) score += 15;
  if (/female|woman|bright|clear|girl/.test(h)) score += 8;
  if (g === "male" || g.includes("male")) score -= 10;
  return score;
}

function pickBest(
  voices: ElevenLabsVoiceSummary[],
  scoreFn: (v: ElevenLabsVoiceSummary) => number,
  exclude: Set<string>
): string {
  const candidates = voices.filter((v) => !exclude.has(v.voice_id));
  const pool = candidates.length > 0 ? candidates : voices;
  let best = pool[0]!;
  let bestScore = -Infinity;
  for (const v of pool) {
    const s = scoreFn(v);
    if (s > bestScore) {
      bestScore = s;
      best = v;
    }
  }
  return best.voice_id;
}

/**
 * ElevenLabs voice 목록에서 ANN/M/W 자동 배정
 */
export function autoSelectElevenLabsVoices(
  voices: ElevenLabsVoiceSummary[]
): AutoSelectedVoices {
  if (voices.length === 0) {
    throw new Error("자동 선택할 ElevenLabs voice가 없습니다.");
  }

  const ann = pickBest(voices, scoreAnn, new Set());
  const used = new Set([ann]);
  const m = pickBest(voices, scoreMale, used);
  used.add(m);
  const w = pickBest(voices, scoreFemale, used);

  return { ANN: ann, M: m, W: w };
}
