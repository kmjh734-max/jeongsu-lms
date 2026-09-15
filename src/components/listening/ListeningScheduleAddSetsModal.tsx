"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/layout/NavIcon";
import { ListeningSetFolderPicker } from "@/components/listening/ListeningSetFolderPicker";
import { Button } from "@/components/ui/Button";

interface SetOption {
  id: string;
  title: string;
  folder_id?: string | null;
}

interface FolderOption {
  id: string;
  name: string;
}

interface ListeningScheduleAddSetsModalProps {
  title?: string;
  description?: string;
  existingSetIds: string[];
  availableSets: SetOption[];
  folders?: FolderOption[];
  onClose: () => void;
  /** 고른 세트 (누른 순서대로) */
  onSubmit: (setIds: string[]) => Promise<void> | void;
}

/** 폴더별로 묶인 세트 고르기 창 */
export function ListeningScheduleAddSetsModal({
  title = "세트 추가",
  description,
  existingSetIds,
  availableSets,
  folders = [],
  onClose,
  onSubmit,
}: ListeningScheduleAddSetsModalProps) {
  const existing = new Set(existingSetIds);
  const addableSets = availableSets.filter((s) => !existing.has(s.id));
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function handleSubmit() {
    if (selectedIds.length === 0) {
      setError("더할 세트를 골라 주세요.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await onSubmit(selectedIds);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "세트를 더하지 못했어요.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="flex max-h-[85vh] w-full max-w-md flex-col rounded-lg border border-slate-200 bg-white shadow-card-hover"
      >
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">{title}</h2>
            {description ? <p className="mt-1 text-sm text-slate-500">{description}</p> : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <Icon name="x" size={18} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          {addableSets.length === 0 ? (
            <p className="text-sm text-slate-500">더할 수 있는 세트가 없어요.</p>
          ) : (
            <>
              <p className="mb-2 text-xs text-slate-500">폴더 이름을 고르면 폴더 안 세트를 모두 골라요.</p>
              <ListeningSetFolderPicker
                sets={addableSets.map((s) => ({
                  id: s.id,
                  title: s.title,
                  folder_id: s.folder_id ?? null,
                }))}
                folders={folders}
                selectedIds={selectedIds}
                onChange={setSelectedIds}
              />
            </>
          )}
          {error ? <p className="mt-3 text-sm text-rose-700">{error}</p> : null}
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-100 px-5 py-3">
          <Button variant="secondary" onClick={onClose}>
            취소
          </Button>
          <Button
            disabled={busy || addableSets.length === 0}
            onClick={() => void handleSubmit()}
          >
            {busy ? "더하는 중…" : `${selectedIds.length}개 더하기`}
          </Button>
        </div>
      </div>
    </div>
  );
}
