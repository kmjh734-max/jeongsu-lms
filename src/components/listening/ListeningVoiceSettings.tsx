"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/layout/NavIcon";
import { Button } from "@/components/ui/Button";

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
  readOnly?: boolean;
}

export function ListeningVoiceSettings({
  setId,
  initialVoiceAnnId,
  initialVoiceMId,
  initialVoiceWId,
  readOnly = false,
}: ListeningVoiceSettingsProps) {
  const [open, setOpen] = useState(false);
  const [voices, setVoices] = useState<VoiceOption[]>([]);
  const [autoSelected, setAutoSelected] = useState<Record<string, string> | null>(null);
  const [voiceAnn, setVoiceAnn] = useState(initialVoiceAnnId ?? "");
  const [voiceM, setVoiceM] = useState(initialVoiceMId ?? "");
  const [voiceW, setVoiceW] = useState(initialVoiceWId ?? "");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const usesAuto = !voiceAnn && !voiceM && !voiceW;

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
      setError("목소리 목록을 불러오지 못했어요.");
      return;
    }
    setVoices(data.voices);
    setAutoSelected(data.autoSelected ?? null);
  }

  async function handleToggleAdvanced() {
    const next = !open;
    setOpen(next);
    if (next && voices.length === 0) await loadVoices();
  }

  async function saveVoices() {
    setSaving(true);
    setSaved(false);
    setError(null);
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
      setError(data.message ?? "저장하지 못했어요.");
      return;
    }
    setSaved(true);
  }

  function voiceName(id: string | undefined): string {
    if (!id) return "—";
    const v = voices.find((x) => x.voice_id === id);
    return v ? v.name : `${id.slice(0, 10)}…`;
  }

  const fields: Array<{
    label: string;
    value: string;
    set: (v: string) => void;
  }> = [
    { label: "안내 목소리", value: voiceAnn, set: setVoiceAnn },
    { label: "남자(M) 목소리", value: voiceM, set: setVoiceM },
    { label: "여자(W) 목소리", value: voiceW, set: setVoiceW },
  ];

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900">목소리 설정</h3>
          <p className="mt-1 text-xs text-slate-500">
            {usesAuto
              ? "안내·남자·여자 목소리를 알아서 골라요."
              : "직접 고른 목소리로 읽어요."}
          </p>
        </div>
        <span
          className={`shrink-0 rounded px-2 py-0.5 text-xs font-semibold ${
            usesAuto ? "bg-slate-100 text-slate-600" : "bg-brand-50 text-brand-700"
          }`}
        >
          {usesAuto ? "자동" : "직접 고름"}
        </span>
      </div>

      {!readOnly ? (
        <button
          type="button"
          onClick={() => void handleToggleAdvanced()}
          aria-expanded={open}
          className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900"
        >
          <Icon
            name="chevron"
            size={14}
            className={`transition-transform ${open ? "rotate-90" : ""}`}
          />
          직접 고르기
        </button>
      ) : null}

      {open ? (
        <div className="mt-3 space-y-3 border-t border-slate-100 pt-3">
          {loading ? <p className="text-xs text-slate-500">목소리 목록을 불러오는 중…</p> : null}
          {autoSelected && !loading ? (
            <p className="rounded-md bg-slate-50 px-2.5 py-2 text-xs text-slate-600">
              자동이면 안내 {voiceName(autoSelected.ANN)}, 남자 {voiceName(autoSelected.M)}, 여자{" "}
              {voiceName(autoSelected.W)}로 읽어요.
            </p>
          ) : null}
          {voices.length > 0 ? (
            <>
              {fields.map((f) => (
                <label key={f.label} className="block">
                  <span className="mb-1 block text-xs font-medium text-slate-600">{f.label}</span>
                  <select
                    value={f.value}
                    onChange={(e) => {
                      f.set(e.target.value);
                      setSaved(false);
                    }}
                    className="ui-select py-1.5"
                  >
                    <option value="">자동</option>
                    {voices.map((v) => (
                      <option key={v.voice_id} value={v.voice_id}>
                        {`${v.name}${v.category ? ` (${v.category})` : ""}`}
                      </option>
                    ))}
                  </select>
                </label>
              ))}
              <div className="flex items-center gap-2">
                <Button size="sm" disabled={saving} onClick={() => void saveVoices()}>
                  {saving ? "저장 중…" : "목소리 저장"}
                </Button>
                {saved ? (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700">
                    <Icon name="check" size={13} strokeWidth={2.4} />
                    저장했어요 · 음성을 다시 만들면 바뀌어요
                  </span>
                ) : null}
              </div>
            </>
          ) : null}
        </div>
      ) : null}
      {error ? <p className="mt-2 text-xs text-rose-700">{error}</p> : null}
    </section>
  );
}
