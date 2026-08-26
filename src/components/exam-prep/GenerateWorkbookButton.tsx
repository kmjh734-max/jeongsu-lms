"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { postGenerateWorkbook } from "@/lib/exam-prep/post-generate-workbook";

export function GenerateWorkbookButton({
  passageId,
  basePath,
  passageTitle,
}: {
  passageId: string;
  basePath: string;
  passageTitle?: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [notes, setNotes] = useState<string[]>([]);
  const [progress, setProgress] = useState<string | null>(null);

  async function handleClick() {
    if (
      !window.confirm(
        "한글 해석이 비어 있으면 AI로 채우고, 1~10단계 문제를 자동 생성한 뒤 워크북을 만듭니다. 계속할까요?"
      )
    ) {
      return;
    }
    setLoading(true);
    setMessage(null);
    setNotes([]);
    setProgress("규칙 생성 중…");
    const result = await postGenerateWorkbook({
      passageId,
      title: passageTitle ? `${passageTitle} · 10단계 WORKBOOK` : "10단계 WORKBOOK",
      publishStages: true,
      enhanceGrammarAi: false,
      onPhase: ({ phase, status }) => {
        if (phase === "shell") {
          setProgress(status === "start" ? "규칙 생성 중…" : "완료");
        }
      },
    });
    setLoading(false);
    setProgress(null);
    if (!result.ok) {
      setMessage(result.message);
      if (result.notes?.length) setNotes(result.notes);
      return;
    }
    setMessage(result.message ?? "완료");
    setNotes(result.notes ?? []);
    router.push(`${basePath}/workbooks/${result.workbookId}/edit`);
    router.refresh();
  }

  return (
    <div className="rounded-xl border border-brand-200 bg-brand-50/60 p-4 space-y-3">
      <div>
        <h3 className="text-base font-semibold text-slate-900">
          원클릭 워크북 생성
        </h3>
        <p className="mt-1 text-sm text-slate-600">
          지문·문장만 준비되면 1~10단계 문제·워크북을 규칙으로 빠르게 만듭니다.
        </p>
      </div>
      <Button type="button" disabled={loading} onClick={() => void handleClick()}>
        {loading ? progress ?? "생성 중…" : "워크북 생성 (빠른 규칙)"}
      </Button>
      {message && (
        <p className="text-sm text-slate-700 whitespace-pre-wrap">{message}</p>
      )}
      {notes.length > 0 && (
        <ul className="text-xs text-slate-600 list-disc pl-4 space-y-0.5">
          {notes.map((n) => (
            <li key={n}>{n}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
