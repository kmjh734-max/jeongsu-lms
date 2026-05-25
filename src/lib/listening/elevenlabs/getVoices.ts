export interface ElevenLabsVoiceSummary {
  voice_id: string;
  name: string;
  category: string | null;
  labels: Record<string, string>;
}

interface ElevenLabsVoicesResponse {
  voices?: Array<{
    voice_id?: string;
    name?: string;
    category?: string;
    labels?: Record<string, string | number | boolean>;
  }>;
}

function normalizeLabels(
  raw: Record<string, string | number | boolean> | undefined
): Record<string, string> {
  if (!raw || typeof raw !== "object") return {};
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(raw)) {
    if (v != null) out[k.toLowerCase()] = String(v).toLowerCase();
  }
  return out;
}

export async function fetchElevenLabsVoices(apiKey: string): Promise<ElevenLabsVoiceSummary[]> {
  const response = await fetch("https://api.elevenlabs.io/v1/voices", {
    method: "GET",
    headers: {
      "xi-api-key": apiKey,
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const bodyText = await response.text();
    if (response.status === 401) {
      throw new Error("ElevenLabs API 키가 올바르지 않습니다. ELEVENLABS_API_KEY를 확인해 주세요.");
    }
    throw new Error(
      `ElevenLabs voice 목록을 가져오지 못했습니다 (HTTP ${response.status}): ${bodyText.slice(0, 200)}`
    );
  }

  const data = (await response.json()) as ElevenLabsVoicesResponse;
  const list = data.voices ?? [];

  const voices: ElevenLabsVoiceSummary[] = [];
  for (const v of list) {
    const voice_id = v.voice_id?.trim();
    if (!voice_id) continue;
    voices.push({
      voice_id,
      name: v.name?.trim() || voice_id,
      category: v.category?.trim() || null,
      labels: normalizeLabels(v.labels),
    });
  }

  if (voices.length === 0) {
    throw new Error("ElevenLabs 계정에서 사용 가능한 voice가 없습니다.");
  }

  return voices;
}
