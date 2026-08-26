"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import {
  EXAM_PRESETS,
  EXAM_PRESET_STEP_NUMBERS,
  WORKBOOK_10_STEPS,
} from "@/lib/exam-prep/presets";
import { createWorkbookAction } from "@/lib/exam-prep/staff-actions";
import { postGenerateWorkbook } from "@/lib/exam-prep/post-generate-workbook";
import type { ExamPresetType } from "@/lib/exam-prep/types";

const ALL_STEPS = WORKBOOK_10_STEPS.map((s) => s.number);

export type WorkbookCreatePassage = {
  id: string;
  title: string;
  status?: string;
  set_id?: string | null;
  passage_number?: string | null;
};

export type WorkbookCreateSet = {
  id: string;
  title: string;
  passages: WorkbookCreatePassage[];
};

function passageLabel(p: WorkbookCreatePassage) {
  return p.passage_number != null
    ? `#${p.passage_number} ${p.title}`
    : p.title;
}

export function WorkbookCreateForm({
  basePath,
  passages,
  sets = [],
}: {
  basePath: string;
  passages: WorkbookCreatePassage[];
  sets?: WorkbookCreateSet[];
}) {
  const router = useRouter();
  const [mode, setMode] = useState<"set" | "passage">(
    sets.length > 0 ? "set" : "passage"
  );
  const [setId, setSetId] = useState(sets[0]?.id ?? "");
  const [passageId, setPassageId] = useState(passages[0]?.id ?? "");
  const [title, setTitle] = useState("");
  const [selected, setSelected] = useState<number[]>(() => [...ALL_STEPS]);
  const [autoGenerate, setAutoGenerate] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [progressLabel, setProgressLabel] = useState<string | null>(null);
  const [progressPercent, setProgressPercent] = useState(0);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const selectedSet = useMemo(() => new Set(selected), [selected]);
  const activeSet = sets.find((s) => s.id === setId);
  const targetPassages = useMemo(() => {
    if (mode === "set") {
      return activeSet?.passages ?? [];
    }
    const one = passages.find((p) => p.id === passageId);
    return one ? [one] : [];
  }, [mode, activeSet, passages, passageId]);

  function clearTicker() {
    if (tickRef.current) {
      clearInterval(tickRef.current);
      tickRef.current = null;
    }
  }

  /** 지문 i/N 구간에서 대기 중일 때 부드럽게 % 상승 (완료 전까지 구간 상한의 92%) */
  function startPassageTicker(
    index: number,
    total: number,
    label: string
  ) {
    clearTicker();
    const span = 100 / total;
    const base = (index / total) * 100;
    const ceiling = base + span * 0.92;
    let soft = base;
    setProgressPercent(Math.round(base));
    setProgressLabel(`${Math.round(base)}% · ${index + 1}/${total} · ${label}`);
    tickRef.current = setInterval(() => {
      soft = Math.min(ceiling, soft + span * 0.035);
      const pct = Math.round(soft);
      setProgressPercent(pct);
      setProgressLabel(`${pct}% · ${index + 1}/${total} · ${label}`);
    }, 1800);
  }

  function markPassageDone(index: number, total: number, label: string) {
    clearTicker();
    const pct = Math.round(((index + 1) / total) * 100);
    setProgressPercent(pct);
    setProgressLabel(`${pct}% · ${index + 1}/${total} · ${label} 완료`);
  }

  function toggle(n: number) {
    setSelected((prev) =>
      prev.includes(n)
        ? prev.filter((x) => x !== n)
        : [...prev, n].sort((a, b) => a - b)
    );
  }

  function applyPreset(key: Exclude<ExamPresetType, "custom">) {
    setSelected([...EXAM_PRESET_STEP_NUMBERS[key]]);
  }

  async function generateFull(p: WorkbookCreatePassage, wbTitle: string) {
    const data = await postGenerateWorkbook({
      passageId: p.id,
      title: wbTitle,
      publishStages: true,
      onPhase: ({ phase, index, total: phaseTotal }) => {
        const span = 100 / Math.max(1, targetPassages.length);
        // find current passage index from label progress — use soft percent within current passage
        const base = Math.round(
          ((targetPassages.findIndex((x) => x.id === p.id) || 0) / targetPassages.length) *
            100
        );
        const within = Math.round((index / phaseTotal) * span * 0.95);
        const pct = Math.min(99, base + within);
        const phaseLabel =
          phase === "shell"
            ? "규칙 생성"
            : phase === "ai56"
              ? "어법·어휘 AI"
              : "오류찾기 AI";
        setProgressPercent(pct);
        setProgressLabel(
          `${pct}% · ${passageLabel(p)} · ${phaseLabel} (${index}/${phaseTotal})`
        );
      },
    });
    if (!data.ok || !data.workbookId) {
      throw new Error(!data.ok ? data.message : "생성 실패");
    }
    return data;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (selected.length === 0) {
      setMessage("1~10단계 중 하나 이상 선택해 주세요.");
      return;
    }
    if (targetPassages.length === 0) {
      setMessage(
        mode === "set"
          ? "세트에 지문이 없습니다."
          : "지문을 선택해 주세요."
      );
      return;
    }

    setLoading(true);
    setMessage(null);
    setProgressLabel(null);
    setProgressPercent(0);

    const okIds: string[] = [];
    const fails: string[] = [];
    const noteLines: string[] = [];
    const baseTitle = title.trim();
    const total = targetPassages.length;

    try {
      for (let i = 0; i < total; i++) {
        const p = targetPassages[i]!;
        const label = passageLabel(p);
        startPassageTicker(i, total, label);

        const wbTitle =
          total === 1
            ? baseTitle || `${p.title} · 10단계 WORKBOOK`
            : baseTitle
              ? `${baseTitle} · ${label}`
              : `${label} · 10단계 WORKBOOK`;

        if (autoGenerate) {
          try {
            const data = await generateFull(p, wbTitle);
            okIds.push(data.workbookId!);
            if (data.notes?.length) {
              noteLines.push(
                ...data.notes
                  .filter((n) => /어법|어휘|5단계|6단계/.test(n))
                  .slice(0, 4)
                  .map((n) => `${label}: ${n}`)
              );
            }
            markPassageDone(i, total, label);
          } catch (err) {
            clearTicker();
            fails.push(
              `${label}: ${err instanceof Error ? err.message : "실패"}`
            );
          }
        } else {
          const result = await createWorkbookAction({
            passage_id: p.id,
            title: wbTitle,
            preset_type: "custom",
            step_numbers: selected,
          });
          if (!result.ok) {
            fails.push(`${label}: ${result.message}`);
          } else {
            okIds.push(result.id);
            markPassageDone(i, total, label);
          }
        }
      }
    } finally {
      clearTicker();
      setLoading(false);
      if (okIds.length > 0 && fails.length === 0) {
        setProgressPercent(100);
        setProgressLabel("100% · 완료");
      }
    }

    if (okIds.length === 1 && fails.length === 0) {
      router.push(`${basePath}/workbooks/${okIds[0]}/edit`);
      return;
    }
    if (okIds.length > 0) {
      setMessage(
        [
          `워크북 ${okIds.length}개 생성`,
          fails.length ? `실패 ${fails.length}개: ${fails.join(" / ")}` : "",
          ...noteLines.slice(0, 6),
        ]
          .filter(Boolean)
          .join("\n")
      );
      router.push(`${basePath}/workbooks`);
      router.refresh();
      return;
    }
    setProgressLabel(null);
    setProgressPercent(0);
    setMessage(fails.join("\n") || "워크북 생성에 실패했습니다.");
  }

  const inputClass =
    "mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100";

  return (
    <form onSubmit={handleSubmit} className="ui-section-card space-y-5">
      {sets.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setMode("set")}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
              mode === "set"
                ? "bg-brand-600 text-white"
                : "border border-slate-200 bg-white text-slate-700"
            }`}
          >
            세트별
          </button>
          <button
            type="button"
            onClick={() => setMode("passage")}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
              mode === "passage"
                ? "bg-brand-600 text-white"
                : "border border-slate-200 bg-white text-slate-700"
            }`}
          >
            지문별
          </button>
        </div>
      )}

      {mode === "set" ? (
        <label className="block text-sm font-medium text-slate-700">
          지문 세트
          <select
            required
            className={inputClass}
            value={setId}
            onChange={(e) => setSetId(e.target.value)}
          >
            {sets.length === 0 && (
              <option value="">등록된 세트가 없습니다</option>
            )}
            {sets.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title} (지문 {s.passages.length}개)
              </option>
            ))}
          </select>
          {activeSet && (
            <p className="mt-1 text-xs text-slate-500">
              포함 지문:{" "}
              {activeSet.passages
                .map((p) => p.passage_number || p.title)
                .join(", ") || "없음"}
            </p>
          )}
        </label>
      ) : (
        <label className="block text-sm font-medium text-slate-700">
          지문
          <select
            required
            className={inputClass}
            value={passageId}
            onChange={(e) => setPassageId(e.target.value)}
          >
            {passages.length === 0 && (
              <option value="">등록된 지문이 없습니다</option>
            )}
            {passages.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
                {p.status === "draft" ? " (작성중)" : ""}
              </option>
            ))}
          </select>
        </label>
      )}

      {targetPassages.length === 0 && (
        <p className="text-sm text-amber-700">
          {mode === "set"
            ? "선택한 세트에 지문이 없습니다. 지문 관리에서 세트를 확인해 주세요."
            : "지문 관리에서 본문을 먼저 등록해 주세요."}
        </p>
      )}

      <label className="block text-sm font-medium text-slate-700">
        워크북 제목
        <input
          className={inputClass}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={
            mode === "set"
              ? "예: 샘플 · 10단계 WORKBOOK (비우면 지문별로 자동)"
              : "예: 2026.7 인천 학평 · 10단계 WORKBOOK"
          }
          required={mode === "passage" && !autoGenerate}
        />
      </label>

      <label className="flex items-start gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700">
        <input
          type="checkbox"
          className="mt-0.5"
          checked={autoGenerate}
          onChange={(e) => setAutoGenerate(e.target.checked)}
        />
        <span>
          <span className="font-semibold">1~10단계 문제 자동 생성</span>
          <span className="mt-0.5 block text-xs text-slate-500">
            규칙으로 빠르게 만든 뒤 어법·어휘·오류찾기를 AI로 보강합니다. 지문당
            보통 1~2분입니다.
            {!autoGenerate &&
              " (끄면 단계 껍데기만 만들고, 문제는 나중에 채웁니다.)"}
          </span>
        </span>
      </label>

      {!autoGenerate && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-medium text-slate-700">
              학습 단계 (인천 학평 10단계 WORKBOOK)
            </p>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setSelected([...ALL_STEPS])}
                className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
              >
                전체 선택
              </button>
              <button
                type="button"
                onClick={() => setSelected([])}
                className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
              >
                전체 해제
              </button>
              {(
                Object.keys(EXAM_PRESETS) as Array<
                  Exclude<ExamPresetType, "custom">
                >
              ).map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => applyPreset(key)}
                  className="rounded-md border border-brand-200 bg-brand-50 px-2 py-1 text-xs font-medium text-brand-800 hover:bg-brand-100"
                >
                  {EXAM_PRESETS[key].label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            {WORKBOOK_10_STEPS.map((s) => {
              const on = selectedSet.has(s.number);
              return (
                <label
                  key={s.number}
                  className={`flex cursor-pointer items-start gap-3 rounded-xl border px-3 py-2.5 transition ${
                    on
                      ? "border-brand-500 bg-brand-50"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <input
                    type="checkbox"
                    className="mt-1"
                    checked={on}
                    onChange={() => toggle(s.number)}
                  />
                  <span>
                    <span className="block text-sm font-semibold text-slate-900">
                      {s.number}단계 · {s.shortLabel}
                    </span>
                    <span className="text-xs text-slate-500">{s.prompt}</span>
                  </span>
                </label>
              );
            })}
          </div>
        </div>
      )}

      {(loading || progressLabel) && (
        <div className="space-y-2" role="status" aria-live="polite">
          <div className="flex items-center justify-between gap-2 text-sm">
            <p className="font-medium text-brand-800">
              {progressLabel ?? "준비 중…"}
            </p>
            <span className="tabular-nums font-semibold text-brand-700">
              {progressPercent}%
            </span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-brand-600 transition-[width] duration-500 ease-out"
              style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
            />
          </div>
          {loading && (
            <p className="text-xs text-amber-700">
              생성 중입니다. 페이지를 닫지 마세요.
            </p>
          )}
        </div>
      )}
      {message && (
        <p className="whitespace-pre-wrap text-sm text-red-600" role="status">
          {message}
        </p>
      )}

      <Button
        type="submit"
        disabled={
          loading ||
          targetPassages.length === 0 ||
          (!autoGenerate && selected.length === 0)
        }
      >
        {loading
          ? `${progressPercent}% 생성 중…`
          : mode === "set"
            ? `세트 워크북 생성 (${targetPassages.length}개 지문)`
            : "워크북 생성"}
      </Button>
    </form>
  );
}
