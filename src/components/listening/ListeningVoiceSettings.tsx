"use client";

import { useEffect, useState } from "react";

interface VoiceOption {
  voice_id: string;
  name: string;
  category: string | null;
}

interface ListeningVoiceSettingsProps {
  setId: string;
  initialVoiceAnnId: string | null;
  initialVoiceMId: string | null;
  initialVoiceWId: string | null;
}

export function ListeningVoiceSettings({
  setId,
  initialVoiceAnnId,
  initialVoiceMId,
  initialVoiceWId,
}: ListeningVoiceSettingsProps) {
  const [open, setOpen] = useState(false);
  const [voices, setVoices] = useState<VoiceOption[]>([]);
  const [autoSelected, setAutoSelected] = useState<Record<string, string> | null>(
    null
  );
  const [voiceAnn, setVoiceAnn] = useState(initialVoiceAnnId ?? "");
  const [voiceM, setVoiceM] = useState(initialVoiceMId ?? "");
  const [voiceW, setVoiceW] = useState(initialVoiceWId ?? "");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const usesAuto =
    !initialVoiceAnnId && !initialVoiceMId && !initialVoiceWId;

  useEffect(() => {
    setVoiceAnn(initialVoiceAnnId ?? "");
    setVoiceM(initialVoiceMId ?? "");
    setVoiceW(initialVoiceWId ?? "");
  }, [initialVoiceAnnId, initialVoiceMId, initialVoiceWId]);

  async function loadVoices() {
    setLoading(true);
    setError(null);
    const res = await fetch("/api/listening/voices");
    const data = (await res.json()) as {
      ok?: boolean;
      message?: string;
      voices?: VoiceOption[];
      autoSelected?: Record<string, string>;
    };
    setLoading(false);
    if (!data.ok || !data.voices?.length) {
      setError(data.message ?? "voice 목록을 불러오지 못했습니다.");
      return;
    }
    setVoices(data.voices);
    setAutoSelected(data.autoSelected ?? null);
  }

  async function handleToggleAdvanced() {
    const next = !open;
    setOpen(next);
    if (next && voices.length === 0) {
      await loadVoices();
    }
  }

  async function saveVoices() {
    setSaving(true);
    setMessage(null);
    const res = await fetch(`/api/listening/sets/${setId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        voice_ann_id: voiceAnn || null,
        voice_m_id: voiceM || null,
        voice_w_id: voiceW || null,
      }),
    });
    const data = (await res.json()) as { ok?: boolean; message?: string };
    setSaving(false);
    if (!data.ok) {
      setMessage(data.message ?? "저장 실패");
      return;
    }
    setMessage("음성 설정이 저장되었습니다.");
  }

  function voiceName(id: string): string {
    const v = voices.find((x) => x.voice_id === id);
    return v ? v.name : id.slice(0, 12) + "…";
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4">
      <h2 className="text-sm font-semibold text-slate-800">음성 설정 (ElevenLabs)</h2>
      <p className="mt-1 text-xs text-slate-600">
        기본값은 ElevenLabs에서 사용 가능한 음성을 자동으로 배정합니다. 필요할 경우
        고급 설정에서 ANN/M/W 음성을 직접 선택할 수 있습니다.
      </p>
      <p className="mt-2 text-sm text-slate-700">
        {usesAuto ? (
          <span className="font-medium text-emerald-700">자동 선택 사용 중</span>
        ) : (
          <span className="font-medium text-indigo-700">일부/전체 직접 선택됨</span>
        )}
      </p>

      <button
        type="button"
        onClick={handleToggleAdvanced}
        className="mt-3 text-sm font-medium text-indigo-600 hover:underline"
      >
        {open ? "고급 설정 닫기" : "고급 설정 펼치기"}
      </button>

      {open && (
        <div className="mt-4 space-y-3 border-t border-slate-100 pt-4">
          {loading && (
            <p className="text-sm text-slate-500">ElevenLabs voice 목록 불러오는 중…</p>
          )}
          {error && <p className="text-sm text-red-600">{error}</p>}
          {autoSelected && !loading && (
            <p className="rounded-lg bg-slate-50 p-2 text-xs text-slate-600">
              자동 배정 예: ANN {voiceName(autoSelected.ANN)}, M{" "}
              {voiceName(autoSelected.M)}, W {voiceName(autoSelected.W)}
            </p>
          )}
          {voices.length > 0 && (
            <>
              <label className="block text-sm">
                ANN 안내 음성
                <select
                  value={voiceAnn}
                  onChange={(e) => setVoiceAnn(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                >
                  <option value="">자동</option>
                  {voices.map((v) => (
                    <option key={v.voice_id} value={v.voice_id}>
                      {v.name}
                      {v.category ? ` (${v.category})` : ""}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-sm">
                남성(M) 음성
                <select
                  value={voiceM}
                  onChange={(e) => setVoiceM(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                >
                  <option value="">자동</option>
                  {voices.map((v) => (
                    <option key={v.voice_id} value={v.voice_id}>
                      {v.name}
                      {v.category ? ` (${v.category})` : ""}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-sm">
                여성(W) 음성
                <select
                  value={voiceW}
                  onChange={(e) => setVoiceW(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                >
                  <option value="">자동</option>
                  {voices.map((v) => (
                    <option key={v.voice_id} value={v.voice_id}>
                      {v.name}
                      {v.category ? ` (${v.category})` : ""}
                    </option>
                  ))}
                </select>
              </label>
              <button
                type="button"
                disabled={saving}
                onClick={saveVoices}
                className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
              >
                {saving ? "저장 중…" : "음성 설정 저장"}
              </button>
            </>
          )}
        </div>
      )}
      {message && <p className="mt-2 text-sm text-slate-600">{message}</p>}
    </section>
  );
}
