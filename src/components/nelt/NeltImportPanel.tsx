"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Icon } from "@/components/layout/NavIcon";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import type { NeltExtractedDraft } from "@/lib/nelt/types-draft";

interface NeltImportPanelProps {
  role: "admin" | "teacher";
  /** 기존 학생에 회차 추가할 때 미리 채울 이름 */
  initialStudentName?: string;
  onClose?: () => void;
}

type SlotState = {
  id: string;
  url: string;
  /** 마지막으로 읽은 링크 (같은 링크를 다시 읽지 않도록) */
  readUrl: string;
  status: "idle" | "loading" | "ok" | "error";
  message: string;
  draft: NeltExtractedDraft | null;
  duplicates: Array<{ id: string; testDate: string | null }>;
};

const MAX_SLOTS = 6;

let slotSeq = 0;
function emptySlot(): SlotState {
  slotSeq += 1;
  return {
    id: `slot-${slotSeq}`,
    url: "",
    readUrl: "",
    status: "idle",
    message: "",
    draft: null,
    duplicates: [],
  };
}

function shortUrl(url: string): string {
  return url.replace(/^https?:\/\/(www\.)?/, "");
}

/** NELT 결과 링크(1·2차 + 추가 회차)를 읽어 저장 → 성장 리포트. 이름은 링크에서 읽는다 */
export function NeltImportPanel({
  role,
  initialStudentName = "",
  onClose,
}: NeltImportPanelProps) {
  const base = role === "admin" ? "/admin/nelt" : "/teacher/nelt";
  const router = useRouter();
  const [slots, setSlots] = useState<SlotState[]>(() => [emptySlot(), emptySlot()]);
  const [nameOverride, setNameOverride] = useState(initialStudentName);
  const [showEditor, setShowEditor] = useState(false);
  /** save = 회차 저장 · narrative = 리포트 문장 쓰기 */
  const [saving, setSaving] = useState<"save" | "narrative" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [savedName, setSavedName] = useState<string | null>(null);

  const okSlots = useMemo(() => slots.filter((s) => s.status === "ok" && s.draft), [slots]);
  const loadingAny = slots.some((s) => s.status === "loading");
  const pendingSlots = slots.filter(
    (s) => s.url.trim() && (s.status === "idle" || s.url.trim() !== s.readUrl)
  );

  const extractedName = useMemo(() => {
    for (const s of okSlots) {
      const n = s.draft?.studentName?.trim();
      if (n) return n;
    }
    return "";
  }, [okSlots]);

  const studentName = nameOverride.trim() || extractedName;

  function updateSlot(id: string, patch: Partial<SlotState>) {
    setSlots((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  }

  function addSlot() {
    if (slots.length >= MAX_SLOTS) return;
    setSlots((prev) => [...prev, emptySlot()]);
  }

  function removeSlot(id: string) {
    if (slots.length <= 2) return;
    setSlots((prev) => prev.filter((s) => s.id !== id));
  }

  async function readSlot(slotId: string, rawUrl: string, attemptNumber: number) {
    const url = rawUrl.trim();
    if (!url) return false;
    updateSlot(slotId, { url, readUrl: url, status: "loading", message: "", draft: null });
    try {
      const res = await fetch("/api/nelt/import-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, attemptNumber }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(json.message ?? "링크를 읽지 못했어요.");
      }
      const result = Array.isArray(json.results) ? json.results[0] : null;
      if (!result?.ok) {
        throw new Error(result?.message ?? json.message ?? "링크에서 NELT 결과를 찾지 못했어요.");
      }
      const draft = result.draft as NeltExtractedDraft;
      if (draft.studentName) {
        setNameOverride((prev) => (prev.trim() ? prev : draft.studentName ?? ""));
      }
      updateSlot(slotId, {
        status: "ok",
        message: "",
        draft,
        duplicates: result.duplicates ?? [],
      });
      return true;
    } catch (e) {
      updateSlot(slotId, {
        status: "error",
        message: e instanceof Error ? e.message : "링크를 읽지 못했어요.",
        draft: null,
      });
      return false;
    }
  }

  function readIfChanged(slot: SlotState, index: number, value = slot.url) {
    const url = value.trim();
    if (!url || (url === slot.readUrl && slot.status !== "error")) return;
    void readSlot(slot.id, url, index + 1);
  }

  async function readPending() {
    setError(null);
    await Promise.all(
      slots.map((s, i) =>
        s.url.trim() && (s.status !== "ok" || s.url.trim() !== s.readUrl)
          ? readSlot(s.id, s.url, i + 1)
          : Promise.resolve(true)
      )
    );
  }

  function patchDraft(slotId: string, patch: (d: NeltExtractedDraft) => NeltExtractedDraft) {
    setSlots((prev) =>
      prev.map((s) => (s.id === slotId && s.draft ? { ...s, draft: patch(s.draft) } : s))
    );
  }

  function openReport(name: string) {
    router.push(`${base}/student/${encodeURIComponent(name)}`);
    router.refresh();
  }

  async function saveAndOpenReport() {
    if (okSlots.length < 2) {
      setError("2회차 이상 읽어야 성장 리포트를 만들 수 있어요.");
      return;
    }
    const name = studentName;
    if (!name) {
      setError("링크에서 학생 이름을 찾지 못했어요. 이름을 적어 주세요.");
      setShowEditor(true);
      return;
    }
    setSaving("save");
    setError(null);
    try {
      const sorted = [...okSlots].sort((a, b) =>
        (a.draft?.testDate ?? "").localeCompare(b.draft?.testDate ?? "")
      );
      const res = await fetch("/api/nelt/reports/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentName: name,
          items: sorted.map((s) => ({
            draft: { ...s.draft!, studentName: name },
            sourceUrl: s.url,
            overwriteId: s.duplicates[0]?.id ?? null,
          })),
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(json.message ?? "저장하지 못했어요.");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "저장하지 못했어요.");
      setSaving(null);
      return;
    }

    // 저장한 회차로 리포트 문장을 쓴 뒤 리포트를 연다
    setSaving("narrative");
    try {
      const res = await fetch("/api/nelt/report-narratives", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentName: name, force: true }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok || !json.narratives?.overallSummary) {
        throw new Error(json.message ?? "리포트 문장을 쓰지 못했어요.");
      }
      openReport(name);
    } catch (e) {
      setSavedName(name);
      setError(
        `${name} 학생 결과는 저장했어요. 다만 리포트 문장은 쓰지 못했어요. (${
          e instanceof Error ? e.message : "잠시 후 다시 해 주세요"
        }) 리포트 화면에서 「문장 다시 쓰기」를 눌러 주세요.`
      );
      setSaving(null);
    }
  }

  const canSave = okSlots.length >= 2 && !loadingAny && pendingSlots.length === 0;

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-base font-bold text-slate-900">결과 넣기</h2>
        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="-mr-1 -mt-1 flex h-8 w-8 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <Icon name="x" size={18} />
          </button>
        ) : null}
      </div>
      <p className="mt-1 text-sm text-slate-500">
        NELT 결과 페이지 링크를 붙여 넣으세요. 이름·날짜·점수를 읽어 옵니다.
      </p>
      {studentName ? (
        <p className="mt-2 text-sm text-slate-700">
          학생 <span className="font-semibold text-slate-900">{studentName}</span>
          {okSlots.length > 0 ? (
            <button
              type="button"
              onClick={() => setShowEditor((v) => !v)}
              className="ml-2 text-xs font-semibold text-brand-700 hover:underline"
            >
              {showEditor ? "고치기 닫기" : "이름·날짜 고치기"}
            </button>
          ) : null}
        </p>
      ) : null}

      <div className="mt-3 min-h-0 flex-1 space-y-2 overflow-y-auto pb-1">
        {slots.map((slot, index) => {
          const d = slot.draft;
          const focused = slot.status === "loading";
          return (
            <div
              key={slot.id}
              className={`rounded-md border px-3 py-2.5 transition ${
                focused
                  ? "border-brand-600 ring-1 ring-brand-600"
                  : slot.status === "error"
                    ? "border-rose-200"
                    : "border-slate-200"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="w-7 shrink-0 text-sm font-bold text-slate-900">
                  {index + 1}차
                </span>
                <input
                  type="url"
                  value={slot.url}
                  onChange={(e) =>
                    updateSlot(slot.id, {
                      url: e.target.value,
                      ...(slot.status === "error" ? { status: "idle", message: "" } : {}),
                    })
                  }
                  onBlur={(e) => readIfChanged(slot, index, e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      readIfChanged(slot, index, (e.target as HTMLInputElement).value);
                    }
                  }}
                  onPaste={(e) => {
                    const text = e.clipboardData.getData("text").trim();
                    if (text && !slot.url.trim()) {
                      e.preventDefault();
                      updateSlot(slot.id, { url: text });
                      readIfChanged({ ...slot, url: text }, index, text);
                    }
                  }}
                  placeholder="https://www.netutor.co.kr/s_url/?…"
                  aria-label={`${index + 1}차 결과 링크`}
                  className="min-w-0 flex-1 border-0 bg-transparent p-0 text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-0"
                  title={slot.url ? shortUrl(slot.url) : undefined}
                  disabled={saving !== null}
                />
                {slot.status === "ok" ? (
                  <Icon name="check" size={17} strokeWidth={2.25} className="text-green-700" />
                ) : slot.status === "loading" ? (
                  <span className="h-2 w-2 shrink-0 animate-pulse rounded-full bg-brand-600" />
                ) : slot.status === "error" ? (
                  <button
                    type="button"
                    onClick={() => void readSlot(slot.id, slot.url, index + 1)}
                    aria-label="다시 읽기"
                    className="flex h-6 w-6 items-center justify-center rounded text-rose-600 hover:bg-rose-50"
                  >
                    <Icon name="rotate" size={15} />
                  </button>
                ) : null}
                {slots.length > 2 && slot.status !== "loading" ? (
                  <button
                    type="button"
                    onClick={() => removeSlot(slot.id)}
                    aria-label={`${index + 1}차 빼기`}
                    className="flex h-6 w-6 items-center justify-center rounded text-slate-300 hover:bg-slate-100 hover:text-slate-600"
                  >
                    <Icon name="x" size={14} />
                  </button>
                ) : null}
              </div>
              {slot.status === "loading" ? (
                <p className="mt-1 pl-9 text-xs text-slate-500">읽는 중…</p>
              ) : slot.status === "error" ? (
                <p className="mt-1 pl-9 text-xs text-rose-700">{slot.message}</p>
              ) : d ? (
                <>
                  <p className="mt-1 truncate pl-9 text-xs tabular-nums text-green-700">
                    {[d.studentName ?? "이름 없음", d.testDate ?? "날짜 없음", d.overallLevel]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                  {d.domains.length > 0 ? (
                    <p className="mt-0.5 truncate pl-9 text-xs tabular-nums text-slate-400">
                      {d.domains
                        .map((x) => `${x.difficultyCode ?? "?"} ${x.rawScore ?? "—"}점`)
                        .join(" · ")}
                    </p>
                  ) : null}
                  {slot.duplicates.length > 0 ? (
                    <p className="mt-0.5 pl-9 text-xs text-amber-700">
                      이미 저장된 회차예요. 저장하면 새 결과로 바꿔요.
                    </p>
                  ) : null}
                  {showEditor ? (
                    <label className="mt-2 flex items-center gap-2 pl-9 text-xs text-slate-500">
                      시험일
                      <input
                        type="date"
                        className="ui-input h-8 w-auto py-1 text-xs"
                        value={d.testDate ?? ""}
                        onChange={(e) =>
                          patchDraft(slot.id, (x) => ({ ...x, testDate: e.target.value || null }))
                        }
                      />
                    </label>
                  ) : null}
                </>
              ) : null}
            </div>
          );
        })}

        <button
          type="button"
          onClick={addSlot}
          disabled={slots.length >= MAX_SLOTS || saving !== null}
          className="flex w-full items-center justify-center gap-1.5 rounded-md border border-dashed border-slate-300 px-3 py-2 text-sm text-slate-500 transition hover:border-brand-300 hover:bg-brand-50/40 hover:text-brand-700 disabled:opacity-40"
        >
          <Icon name="plus" size={15} />
          회차 추가
          <span className="text-xs tabular-nums text-slate-400">
            {slots.length}/{MAX_SLOTS}
          </span>
        </button>

        {showEditor && okSlots.length > 0 ? (
          <label className="block pt-1">
            <span className="ui-label">학생 이름</span>
            <input
              className="ui-input"
              value={nameOverride || extractedName}
              onChange={(e) => setNameOverride(e.target.value)}
              placeholder="링크에서 읽은 이름"
            />
          </label>
        ) : null}
      </div>

      <div className="mt-3 space-y-2 border-t border-slate-100 pt-3">
        {error ? (
          <Alert variant="error">
            {error}
            {savedName ? (
              <button
                type="button"
                onClick={() => openReport(savedName)}
                className="ml-1 font-semibold underline"
              >
                성장 리포트 열기
              </button>
            ) : null}
          </Alert>
        ) : null}
        {saving ? (
          <div>
            <p className="text-xs font-semibold text-slate-700">
              {saving === "save" ? "저장하고 있어요…" : "리포트 문장을 쓰고 있어요…"}
            </p>
            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full w-2/5 animate-indeterminate rounded-full bg-brand-600" />
            </div>
            {saving === "narrative" ? (
              <p className="mt-1 text-xs text-slate-400">보통 30초쯤 걸려요. 다 쓰면 리포트가 열려요.</p>
            ) : null}
          </div>
        ) : null}
        {pendingSlots.length > 0 && !loadingAny ? (
          <Button className="h-10 w-full" onClick={() => void readPending()} disabled={saving !== null}>
            링크 읽기
          </Button>
        ) : (
          <Button
            className="h-10 w-full"
            disabled={!canSave || saving !== null}
            onClick={() => void saveAndOpenReport()}
          >
            {saving ? "만드는 중…" : "확인하고 저장"}
          </Button>
        )}
        <p className="text-center text-xs text-slate-400">
          {okSlots.length < 2
            ? "2회차 이상 읽으면 저장할 수 있어요."
            : "시험일 순으로 1·2·3차가 매겨져요."}
        </p>
      </div>
    </div>
  );
}
