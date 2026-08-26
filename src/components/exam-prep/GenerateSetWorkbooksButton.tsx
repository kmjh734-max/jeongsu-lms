"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { postGenerateWorkbook } from "@/lib/exam-prep/post-generate-workbook";

/**
 * 세트에 속한 모든 지문에 대해 1~10단계 워크북을 순차 생성
 * (서버 액션 대신 API maxDuration=300 사용 — 타임아웃으로 실패하던 문제 수정)
 */
export function GenerateSetWorkbooksButton({
  setTitle,
  passages,
  basePath,
}: {
  setTitle: string;
  passages: Array<{ id: string; title: string }>;
  basePath: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [progressLabel, setProgressLabel] = useState<string | null>(null);
  const [progressPercent, setProgressPercent] = useState(0);
  const [lines, setLines] = useState<string[]>([]);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function clearTicker() {
    if (tickRef.current) {
      clearInterval(tickRef.current);
      tickRef.current = null;
    }
  }

  function startPassageTicker(index: number, total: number, title: string) {
    clearTicker();
    const span = 100 / total;
    const base = (index / total) * 100;
    const ceiling = base + span * 0.92;
    let soft = base;
    setProgressPercent(Math.round(base));
    setProgressLabel(`${Math.round(base)}% · ${index + 1}/${total} · ${title}`);
    tickRef.current = setInterval(() => {
      soft = Math.min(ceiling, soft + span * 0.035);
      const pct = Math.round(soft);
      setProgressPercent(pct);
      setProgressLabel(`${pct}% · ${index + 1}/${total} · ${title}`);
    }, 1800);
  }

  async function handleClick() {
    if (passages.length === 0) {
      window.alert("세트에 지문이 없습니다.");
      return;
    }
    if (
      !window.confirm(
        `「${setTitle}」세트 지문 ${passages.length}개 전체에 워크북(1~10단계)을 만들까요?\n지문당 최대 5분 정도 걸릴 수 있습니다. 완료될 때까지 창을 닫지 마세요.`
      )
    ) {
      return;
    }

    setLoading(true);
    setLines([]);
    setProgressPercent(0);
    const okIds: string[] = [];
    const failNotes: string[] = [];
    const total = passages.length;

    for (let i = 0; i < total; i++) {
      const p = passages[i]!;
      startPassageTicker(i, total, p.title);
      try {
        const result = await postGenerateWorkbook({
          passageId: p.id,
          title: `${p.title} · 10단계 WORKBOOK`,
        });
        clearTicker();
        const pct = Math.round(((i + 1) / total) * 100);
        setProgressPercent(pct);
        setProgressLabel(`${pct}% · ${i + 1}/${total} · ${p.title} 완료`);
        if (result.ok && result.workbookId) {
          okIds.push(result.workbookId);
          setLines((prev) => [
            ...prev,
            `✓ ${p.title}`,
            ...((result.notes ?? []).slice(0, 3).map((n) => `  · ${n}`)),
          ]);
        } else {
          const msg = !result.ok ? result.message : "실패";
          failNotes.push(`${p.title}: ${msg}`);
          setLines((prev) => [...prev, `✗ ${p.title}: ${msg}`]);
        }
      } catch (e) {
        clearTicker();
        const msg = e instanceof Error ? e.message : "네트워크 오류";
        failNotes.push(`${p.title}: ${msg}`);
        setLines((prev) => [...prev, `✗ ${p.title}: ${msg}`]);
      }
    }

    clearTicker();
    setLoading(false);
    if (okIds.length > 0) {
      setProgressPercent(100);
      setProgressLabel("100% · 완료");
    } else {
      setProgressLabel(null);
      setProgressPercent(0);
    }
    router.refresh();

    if (okIds.length === 1) {
      window.alert("워크북 1개를 만들었습니다.");
      router.push(`${basePath}/workbooks/${okIds[0]}/edit`);
      return;
    }
    if (okIds.length > 1) {
      window.alert(
        `세트 워크북 ${okIds.length}/${passages.length}개 생성 완료.${
          failNotes.length ? `\n실패:\n${failNotes.join("\n")}` : ""
        }`
      );
      router.push(`${basePath}/workbooks`);
      return;
    }
    window.alert(
      `워크북 생성 실패\n${failNotes.join("\n") || "알 수 없는 오류"}`
    );
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        disabled={loading || passages.length === 0}
        onClick={() => void handleClick()}
        className="rounded-md border border-brand-300 bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-800 hover:bg-brand-100 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading
          ? `${progressPercent}% 생성 중…`
          : `세트 워크북 생성 (${passages.length})`}
      </button>
      {loading && (
        <div className="w-44 space-y-1">
          <div className="flex justify-between gap-1 text-[10px] text-brand-800">
            <span className="truncate">{progressLabel}</span>
            <span className="shrink-0 tabular-nums">{progressPercent}%</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-brand-600 transition-[width] duration-500"
              style={{
                width: `${Math.min(100, Math.max(0, progressPercent))}%`,
              }}
            />
          </div>
          <p className="text-right text-[10px] text-amber-700">
            생성 중입니다. 페이지를 닫지 마세요.
          </p>
        </div>
      )}
      {lines.length > 0 && (
        <ul className="max-w-xs text-right text-[10px] leading-snug text-slate-500">
          {lines.slice(-8).map((l) => (
            <li key={l}>{l}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
