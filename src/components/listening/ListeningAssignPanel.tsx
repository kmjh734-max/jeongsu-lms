"use client";

import { useState } from "react";

interface ClassOption {
  id: string;
  name: string;
}

interface ListeningAssignPanelProps {
  setId: string;
  classes: ClassOption[];
}

export function ListeningAssignPanel({ setId, classes }: ListeningAssignPanelProps) {
  const [classId, setClassId] = useState(classes[0]?.id ?? "");
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function assign() {
    if (!classId) return;
    setBusy(true);
    setMessage(null);
    const res = await fetch("/api/listening/assign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ setId, classId }),
    });
    const data = (await res.json()) as { ok?: boolean; message?: string };
    setBusy(false);
    setMessage(data.ok ? "반에 배정되었습니다." : data.message ?? "배정 실패");
  }

  if (classes.length === 0) {
    return (
      <section className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
        배정할 반이 없습니다. 먼저 반을 만든 뒤 배정해 주세요.
      </section>
    );
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4">
      <h2 className="font-semibold text-slate-900">반 배정</h2>
      <p className="mt-1 text-xs text-slate-600">
        공개(is_published)된 세트만 학생에게 보입니다.
      </p>
      <div className="mt-3 flex flex-wrap items-end gap-2">
        <select
          value={classId}
          onChange={(e) => setClassId(e.target.value)}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
        >
          {classes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <button
          type="button"
          disabled={busy}
          onClick={assign}
          className="rounded-lg bg-slate-800 px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {busy ? "배정 중…" : "반에 배정"}
        </button>
      </div>
      {message && <p className="mt-2 text-sm text-slate-600">{message}</p>}
    </section>
  );
}
