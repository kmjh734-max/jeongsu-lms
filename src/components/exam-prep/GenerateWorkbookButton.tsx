"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { generateFullExamPrepWorkbookAction } from "@/lib/exam-prep/generate-full-workbook-action";

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
    const result = await generateFullExamPrepWorkbookAction({
      passageId,
      title: passageTitle ? `${passageTitle} · 10단계 WORKBOOK` : undefined,
      publishStages: true,
    });
    setLoading(false);
    if (!result.ok) {
      setMessage(result.message);
      if ("notes" in result && Array.isArray(result.notes)) {
        setNotes(result.notes);
      }
      return;
    }
    setMessage(result.message);
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
          지문·문장만 준비되면 한글 해석(필요 시)·1~10단계 문제·워크북을 한 번에
          만듭니다. 이후 세부 수정은 아래 단계 편집에서 가능합니다.
        </p>
      </div>
      <Button type="button" disabled={loading} onClick={() => void handleClick()}>
        {loading ? "생성 중… (1~2분 걸릴 수 있음)" : "워크북 생성 (1~10단계 자동)"}
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
