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

  function startRangeTicker(fromPct: number, toPct: number, label: string) {
    clearTicker();
    const lo = Math.max(0, fromPct);
    const hi = Math.max(lo + 1, toPct);
    let soft = lo;
    setProgressPercent(Math.round(lo));
    setProgressLabel(`${Math.round(lo)}% · ${label}`);
    tickRef.current = setInterval(() => {
      const room = hi - soft;
      soft = Math.min(hi - 0.3, soft + Math.max(0.4, room * 0.08));
      const pct = Math.round(soft);
      setProgressPercent(pct);
      setProgressLabel(`${pct}% · ${label}`);
    }, 900);
  }

  async function handleClick() {
    if (passages.length === 0) {
      window.alert("세트에 지문이 없습니다.");
      return;
    }
    if (
      !window.confirm(
        `「${setTitle}」세트 지문 ${passages.length}개 전체에 워크북(1~10단계)을 만들까요?\n지문당 보통 1~2분 걸립니다. 완료될 때까지 창을 닫지 마세요.`
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
      const span = 100 / total;
      const base = (i / total) * 100;
      const shellEnd = base + span * 0.35;
      const aiEnd = base + span * 0.92;
      try {
        const result = await postGenerateWorkbook({
          passageId: p.id,
          title: `${p.title} · 10단계 WORKBOOK`,
          onPhase: ({ phase, status }) => {
            if (phase === "shell" && status === "start") {
              startRangeTicker(
                base,
                shellEnd,
                `${i + 1}/${total} · ${p.title} · 규칙`
              );
            } else if (phase === "ai56" && status === "start") {
              startRangeTicker(
                shellEnd,
                aiEnd,
                `${i + 1}/${total} · ${p.title} · 어법 AI`
              );
            }
          },
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
