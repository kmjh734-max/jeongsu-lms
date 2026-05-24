"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface ClassOption {
  id: string;
  name: string;
}

interface ListeningAssignPanelProps {
  setId: string;
  classes: ClassOption[];
  assignedClassNames: string[];
  isPublished: boolean;
}

export function ListeningAssignPanel({
  setId,
  classes,
  assignedClassNames,
  isPublished,
}: ListeningAssignPanelProps) {
  const router = useRouter();
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
    if (!data.ok) {
      setMessage(data.message ?? "배정 실패");
      return;
    }
    setMessage(data.message ?? "반에 배정되었습니다.");
    router.refresh();
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
        반에 배정하면 <strong>자동으로 학생에게 공개</strong>됩니다. 해당 반에 소속된
        학생만 「듣기학습」 메뉴에서 볼 수 있습니다.
      </p>
      {!isPublished && (
        <p className="mt-2 rounded-lg bg-amber-50 px-2 py-1 text-xs text-amber-800">
          현재 비공개 상태입니다. 반 배정 시 자동으로 공개됩니다.
        </p>
      )}
      {assignedClassNames.length > 0 && (
        <p className="mt-2 text-xs text-slate-600">
          배정된 반: {assignedClassNames.join(", ")}
        </p>
      )}
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
