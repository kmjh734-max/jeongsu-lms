"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";

interface NeltStudentReportActionsProps {
  role: "admin" | "teacher";
  studentName: string;
}

export function NeltStudentReportActions({
  studentName,
}: NeltStudentReportActionsProps) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function regenerate() {
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/nelt/growth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentName }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(json.message ?? "재생성에 실패했습니다.");
      }
      setMsg("성장 리포트를 다시 만들었습니다.");
      router.refresh();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "오류");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button
        type="button"
        size="sm"
        variant="secondary"
        disabled={busy}
        onClick={() => void regenerate()}
      >
        {busy ? "생성 중…" : "성장 리포트 다시 만들기"}
      </Button>
      {msg && <span className="text-xs text-slate-600">{msg}</span>}
    </div>
  );
}
