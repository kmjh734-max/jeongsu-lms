"use client";

import { useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import {
  DEFAULT_WORKBOOK_TF_OPTIONS,
  WORKBOOK_TYPE_CATALOG,
  clampTfCount,
  defaultWorkbookTitle,
  type WorkbookData,
  type WorkbookTfOptions,
  type WorkbookTypeId,
} from "@/lib/lesson-materials/workbook-types";

export const WORKBOOK_SESSION_KEY = "lesson-materials-workbook-v1";
export const WORKBOOK_PENDING_KEY = "lesson-materials-workbook-pending-v1";

export type WorkbookPendingPayload = {
  projectIds: string[];
  selectedTypes: WorkbookTypeId[];
  tfOptions: WorkbookTfOptions;
  title: string;
};

export function saveWorkbookToSession(workbook: WorkbookData) {
  try {
    sessionStorage.setItem(WORKBOOK_SESSION_KEY, JSON.stringify(workbook));
  } catch {
    /* ignore */
  }
}

export function loadWorkbookFromSession(): WorkbookData | null {
  try {
    const raw = sessionStorage.getItem(WORKBOOK_SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as WorkbookData;
  } catch {
    return null;
  }
}

export function saveWorkbookPending(payload: WorkbookPendingPayload) {
  try {
    sessionStorage.setItem(WORKBOOK_PENDING_KEY, JSON.stringify(payload));
  } catch {
    /* ignore */
  }
}

export function loadWorkbookPending(): WorkbookPendingPayload | null {
  try {
    const raw = sessionStorage.getItem(WORKBOOK_PENDING_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as WorkbookPendingPayload;
  } catch {
    return null;
  }
}

export function clearWorkbookPending() {
  try {
    sessionStorage.removeItem(WORKBOOK_PENDING_KEY);
  } catch {
    /* ignore */
  }
}

type Step = "types" | "options";

export function WorkbookCreateModal({
  role,
  projectIds,
  open,
  onClose,
}: {
  role: "admin" | "teacher";
  projectIds: string[];
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("types");
  const [selected, setSelected] = useState<Set<WorkbookTypeId>>(
    () => new Set(["tf"])
  );
  const [tfOptions, setTfOptions] = useState<WorkbookTfOptions>(
    DEFAULT_WORKBOOK_TF_OPTIONS
  );
  const [title, setTitle] = useState(() => defaultWorkbookTitle());
  const [error, setError] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);

  const readySelected = useMemo(
    () => [...selected].filter((id) => id === "tf"),
    [selected]
  );
  const hasPendingSelected = useMemo(
    () =>
      [...selected].some(
        (id) => WORKBOOK_TYPE_CATALOG.find((c) => c.id === id)?.ready === false
      ),
    [selected]
  );

  if (!open) return null;

  function toggleType(id: WorkbookTypeId, ready: boolean) {
    if (!ready) return;
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function goNext() {
    setError(null);
    if (selected.size === 0) {
      setError("문제 유형을 하나 이상 선택해 주세요.");
      return;
    }
    if (hasPendingSelected) {
      setError("준비 중인 유형이 포함되어 있습니다. T/F만 선택해 주세요.");
      return;
    }
    if (!selected.has("tf")) {
      setError("현재는 T/F 문제만 생성할 수 있습니다.");
      return;
    }
    setStep("options");
  }

  function handleStart() {
    setError(null);
    if (projectIds.length === 0) {
      setError("선택된 자료가 없습니다.");
      return;
    }
    setStarting(true);
    const payload: WorkbookPendingPayload = {
      projectIds: [...projectIds],
      selectedTypes: readySelected,
      tfOptions: {
        ...tfOptions,
        count: clampTfCount(tfOptions.count),
      },
      title: title.trim() || defaultWorkbookTitle(),
    };
    saveWorkbookPending(payload);
    const base =
      role === "admin"
        ? "/admin/lesson-materials/workbook"
        : "/teacher/lesson-materials/workbook";
    const href = `${base}?ids=${encodeURIComponent(projectIds.join(","))}`;
    // Same-tab navigation avoids popup blockers after async work
    router.push(href);
    onClose();
    setStep("types");
    setStarting(false);
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4">
      <div className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <header className="flex items-center justify-between bg-gradient-to-r from-orange-400 via-rose-400 to-violet-500 px-5 py-4 text-white">
          <div className="flex items-center gap-2">
            <span className="text-lg" aria-hidden>
              📘
            </span>
            <h2 className="text-base font-bold">워크북 만들기</h2>
          </div>
          <button
            type="button"
            className="rounded-lg px-2 py-1 text-lg leading-none hover:bg-white/20"
            onClick={onClose}
            aria-label="닫기"
          >
            ×
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-auto px-5 py-4">
          {step === "types" ? (
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {WORKBOOK_TYPE_CATALOG.map((t) => {
                const on = selected.has(t.id);
                return (
                  <button
                    key={t.id}
                    type="button"
                    disabled={!t.ready}
                    onClick={() => toggleType(t.id, t.ready)}
                    className={`flex items-start gap-3 rounded-xl border px-3 py-3 text-left transition ${
                      !t.ready
                        ? "cursor-not-allowed border-slate-100 bg-slate-50 opacity-60"
                        : on
                          ? "border-violet-400 bg-violet-50 ring-1 ring-violet-300"
                          : "border-slate-200 bg-white hover:border-violet-200"
                    }`}
                  >
                    <span
                      className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border text-[11px] font-bold ${
                        on && t.ready
                          ? "border-violet-600 bg-violet-600 text-white"
                          : "border-slate-300 bg-white text-transparent"
                      }`}
                    >
                      ✓
                    </span>
                    <span className="min-w-0">
                      <span className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900">
                          {t.title}
                        </span>
                        {!t.ready ? (
                          <span className="rounded bg-slate-200 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600">
                            준비 중
                          </span>
                        ) : null}
                      </span>
                      <span className="mt-0.5 block text-[11px] leading-snug text-slate-500">
                        {t.subtitle}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="space-y-4">
              <label className="block space-y-1">
                <span className="text-xs font-bold text-slate-600">
                  워크북 제목
                </span>
                <input
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </label>

              <p className="text-sm font-bold text-slate-900">옵션 설정</p>

              <div className="space-y-0 overflow-hidden rounded-xl border border-slate-200">
                <OptionRow tone="coral" label="T/F 선택지 갯수">
                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      type="number"
                      min={1}
                      max={8}
                      className="w-16 rounded border border-slate-200 px-2 py-1 text-sm"
                      value={tfOptions.count}
                      onChange={(e) =>
                        setTfOptions((o) => ({
                          ...o,
                          count: clampTfCount(e.target.value),
                        }))
                      }
                    />
                    <button
                      type="button"
                      className="rounded-md bg-rose-500 px-2.5 py-1 text-[11px] font-bold text-white"
                      onClick={() =>
                        setTfOptions((o) => ({ ...o, count: 8 }))
                      }
                    >
                      최대 갯수
                    </button>
                    <span className="text-[11px] text-rose-600">
                      지문 1개당 T/F 선택지 {tfOptions.count}개
                    </span>
                  </div>
                </OptionRow>

                <OptionRow tone="coral" label="T/F 선택지 언어">
                  <TogglePair
                    tone="coral"
                    left={{ id: "en", label: "English" }}
                    right={{ id: "ko", label: "한국어" }}
                    value={tfOptions.language}
                    onChange={(language) =>
                      setTfOptions((o) => ({
                        ...o,
                        language: language as "en" | "ko",
                      }))
                    }
                  />
                </OptionRow>

                <OptionRow tone="coral" label="T/F 문제 난이도">
                  <TogglePair
                    tone="coral"
                    left={{ id: "normal", label: "일반" }}
                    right={{ id: "hard", label: "난이도 UP" }}
                    value={tfOptions.difficulty}
                    onChange={(difficulty) =>
                      setTfOptions((o) => ({
                        ...o,
                        difficulty: difficulty as "normal" | "hard",
                      }))
                    }
                  />
                </OptionRow>
              </div>
            </div>
          )}

          {error ? (
            <div className="mt-4">
              <Alert variant="error">{error}</Alert>
            </div>
          ) : null}
        </div>

        <footer className="flex items-center justify-between border-t border-slate-100 px-5 py-3">
          {step === "types" ? (
            <>
              <Button type="button" variant="secondary" size="sm" onClick={onClose}>
                ← 취소
              </Button>
              <Button
                type="button"
                size="sm"
                disabled={selected.size === 0}
                onClick={goNext}
              >
                다음 →
              </Button>
            </>
          ) : (
            <>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={starting}
                onClick={() => setStep("types")}
              >
                ← 이전
              </Button>
              <Button
                type="button"
                size="sm"
                disabled={starting}
                onClick={handleStart}
              >
                {starting ? "이동 중…" : "워크북 생성"}
              </Button>
            </>
          )}
        </footer>
      </div>
    </div>
  );
}

function OptionRow({
  label,
  tone,
  children,
}: {
  label: string;
  tone: "coral" | "violet";
  children: ReactNode;
}) {
  const bg = tone === "coral" ? "bg-rose-50/80" : "bg-violet-50/80";
  return (
    <div
      className={`flex flex-col gap-2 border-b border-slate-100 px-3 py-3 last:border-b-0 sm:flex-row sm:items-center sm:justify-between ${bg}`}
    >
      <span className="shrink-0 text-xs font-bold text-slate-700">{label} :</span>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

function TogglePair({
  left,
  right,
  value,
  onChange,
  tone,
}: {
  left: { id: string; label: string };
  right: { id: string; label: string };
  value: string;
  onChange: (id: string) => void;
  tone: "coral" | "violet";
}) {
  const active =
    tone === "coral"
      ? "bg-rose-500 text-white"
      : "bg-violet-600 text-white";
  const idle = "bg-white text-slate-600 ring-1 ring-slate-200";
  return (
    <div className="flex flex-wrap gap-1.5">
      {[left, right].map((opt) => (
        <button
          key={opt.id}
          type="button"
          onClick={() => onChange(opt.id)}
          className={`rounded-md px-3 py-1 text-xs font-bold ${
            value === opt.id ? active : idle
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
