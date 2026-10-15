"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { askCreditConfirm } from "@/lib/credits/confirm-store";

/** 자료집 쪽마다 붙는 「이 문항 재검토」 단추 — 인쇄에는 나오지 않는다(2026-10-15) */
export function HitBookRecheck({ analysisId, itemId, no }: { analysisId: string; itemId: string; no: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function run() {
    if (
      !(await askCreditConfirm({
        title: `${no}번 재검토`,
        description: "이 문항만 다시 찾고 다시 판정해 자료집에 바꿔 넣습니다. 그사이 새로 만든 자료도 찾습니다.",
        subject: `${no}번 한 문항`,
        items: [{ feature: "exam_hit_book_recheck", quantity: 1 }],
      }))
    )
      return;
    setBusy(true);
    setMsg(null);
    try {
      const r = await fetch(`/api/exam-analysis/${analysisId}/hit-book/item`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ itemId }),
      });
      const j = (await r.json()) as { ok: boolean; message?: string };
      if (!j.ok) throw new Error(j.message ?? "재검토하지 못했어요.");
      router.refresh();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "재검토하지 못했어요.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <span className="hb-recheck">
      <button type="button" onClick={() => void run()} disabled={busy}>
        {busy ? "다시 판정하는 중…" : "이 문항 재검토"}
      </button>
      {msg ? <em>{msg}</em> : null}
    </span>
  );
}
