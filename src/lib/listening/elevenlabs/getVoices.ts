function parseElevenLabsDetail(bodyText: string): string | null {
  try {
    const j = JSON.parse(bodyText) as {
      detail?: { message?: string } | string;
    };
    if (typeof j.detail === "string") return j.detail;
    return j.detail?.message ?? null;
  } catch {
    return bodyText.trim().slice(0, 200) || null;
  }
}

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
    const detail = parseElevenLabsDetail(bodyText);
    if (response.status === 401) {
      throw new Error(
        detail
          ? `ElevenLabs 인증 실패: ${detail} (.env.local 키·따옴표·서버 재시작 확인)`
          : "ElevenLabs API 키가 올바르지 않습니다. ELEVENLABS_API_KEY를 확인한 뒤 npm run dev를 다시 실행해 주세요."
      );
    }
    throw new Error(
      `ElevenLabs voice 목록을 가져오지 못했습니다 (HTTP ${response.status}): ${detail || bodyText.slice(0, 200)}`
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
