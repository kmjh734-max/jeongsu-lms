"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Icon } from "@/components/layout/NavIcon";

/** 시험 분석 지우기 (목록 카드·보고서 화면) */
export function ExamDeleteButton({
  id,
  label,
  redirectTo,
  variant = "icon",
}: {
  id: string;
  label: string;
  redirectTo?: string;
  variant?: "icon" | "button";
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function remove(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm(`「${label}」 분석을 지울까요? 되돌릴 수 없어요.`)) return;
    setBusy(true);
    const res = await fetch(`/api/exam-analysis/${id}`, { method: "DELETE" });
    setBusy(false);
    if (!res.ok) {
      window.alert("지우지 못했어요. 잠시 뒤 다시 해 주세요.");
      return;
    }
    if (redirectTo) router.push(redirectTo);
    router.refresh();
  }

  if (variant === "button") {
    return (
      <button
        type="button"
        onClick={remove}
        disabled={busy}
        className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 text-sm font-semibold text-slate-600 hover:border-red-300 hover:text-red-600 disabled:opacity-50"
      >
        <Icon name="trash" size={15} /> {busy ? "지우는 중…" : "삭제"}
      </button>
    );
  }
  return (
    <button
      type="button"
      onClick={remove}
      disabled={busy}
      aria-label={`${label} 삭제`}
      title="삭제"
      className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
    >
      <Icon name="trash" size={15} />
    </button>
  );
}
