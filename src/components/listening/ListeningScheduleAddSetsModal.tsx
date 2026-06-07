"use client";

import { useState } from "react";

interface SetOption {
  id: string;
  title: string;
}

interface ListeningScheduleAddSetsModalProps {
  assignmentTitle: string;
  existingSetIds: string[];
  availableSets: SetOption[];
  onClose: () => void;
  onSubmit: (setIds: string[]) => Promise<void>;
}

export function ListeningScheduleAddSetsModal({
  assignmentTitle,
  existingSetIds,
  availableSets,
  onClose,
  onSubmit,
}: ListeningScheduleAddSetsModalProps) {
  const existing = new Set(existingSetIds);
  const addableSets = availableSets.filter((s) => !existing.has(s.id));
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggleSet(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  async function handleSubmit() {
    if (selectedIds.length === 0) {
      setError("추가할 듣기 세트를 선택하세요.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await onSubmit(selectedIds);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "추가 실패");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[85vh] w-full max-w-md overflow-y-auto rounded-xl bg-white p-5 shadow-xl">
        <h2 className="text-lg font-semibold text-slate-900">듣기 세트 추가</h2>
        <p className="mt-1 text-sm text-slate-600">
          「{assignmentTitle}」에 세트를 더합니다. 기존 순서 뒤에 이어서
          배정됩니다.
        </p>

        {addableSets.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">
            추가할 수 있는 세트가 없습니다.
          </p>
        ) : (
          <ul className="mt-4 max-h-56 space-y-1 overflow-y-auto rounded-lg border border-slate-200 p-2">
            {addableSets.map((s) => (
              <li key={s.id}>
                <label className="flex cursor-pointer items-center gap-2 rounded px-1 py-1.5 hover:bg-slate-50">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(s.id)}
                    onChange={() => toggleSet(s.id)}
                  />
                  <span className="text-sm text-slate-800">{s.title}</span>
                </label>
              </li>
            ))}
          </ul>
        )}

        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm"
          >
            취소
          </button>
          <button
            type="button"
            disabled={busy || addableSets.length === 0}
            onClick={() => void handleSubmit()}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {busy ? "추가 중…" : `추가 (${selectedIds.length})`}
          </button>
        </div>
      </div>
    </div>
  );
}
