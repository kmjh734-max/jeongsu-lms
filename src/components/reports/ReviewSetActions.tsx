"use client";

import { useState } from "react";
import type { StudentReport } from "@/lib/reports/types";

/**
 * 리포트의 복습할 단어로 재시험지를 만든다 — 새 단어장을 만들어 시험지로 바로 열거나 학생에게 배정한다.
 */
export function ReviewSetActions({ report }: { report: StudentReport }) {
  const [busy, setBusy] = useState<"print" | "assign" | null>(null);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const itemIds = report.reviewWords.map((w) => w.itemId);
  if (itemIds.length === 0) return null;

  async function make(assign: boolean) {
    setBusy(assign ? "assign" : "print");
    setMessage(null);
    // 새 창은 클릭 순간에 열어 둬야 팝업 차단에 걸리지 않는다
    const win = assign ? null : window.open("about:blank", "_blank");
    try {
      const res = await fetch("/api/reports/review-set", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId: report.student.id, itemIds, assign }),
      });
      const data = (await res.json()) as { ok?: boolean; message?: string; printUrl?: string; title?: string };
      if (!data.ok) throw new Error(data.message ?? "만들지 못했어요.");
      if (win && data.printUrl) win.location.href = data.printUrl;
      setMessage({ ok: true, text: assign ? `「${data.title}」을 배정했어요.` : `「${data.title}」 시험지를 열었어요.` });
    } catch (e) {
      win?.close();
      setMessage({ ok: false, text: e instanceof Error ? e.message : "만들지 못했어요." });
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="mb-3 flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={() => void make(false)}
        disabled={busy !== null}
        className="inline-flex h-9 items-center rounded-md bg-brand-600 px-3 text-xs font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
      >
        {busy === "print" ? "만드는 중…" : `틀린 단어 ${itemIds.length}개로 재시험지 출력`}
      </button>
      <button
        type="button"
        onClick={() => void make(true)}
        disabled={busy !== null}
        className="inline-flex h-9 items-center rounded-md border border-brand-200 bg-white px-3 text-xs font-semibold text-brand-800 hover:bg-brand-50 disabled:opacity-60"
      >
        {busy === "assign" ? "배정하는 중…" : "복습 단어장으로 학생에게 배정"}
      </button>
      {message ? (
        <span className={`text-xs ${message.ok ? "text-emerald-700" : "text-rose-700"}`}>{message.text}</span>
      ) : null}
    </div>
  );
}
