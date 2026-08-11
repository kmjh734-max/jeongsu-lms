"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { generateFullExamPrepWorkbookAction } from "@/lib/exam-prep/generate-full-workbook-action";

/**
 * 세트에 속한 모든 지문에 대해 1~10단계 워크북을 순차 생성
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
  const [progress, setProgress] = useState<string | null>(null);
  const [lines, setLines] = useState<string[]>([]);

  async function handleClick() {
    if (passages.length === 0) {
      window.alert("세트에 지문이 없습니다.");
      return;
    }
    if (
      !window.confirm(
        `「${setTitle}」세트 지문 ${passages.length}개 전체에 워크북(1~10단계)을 만들까요?\n지문당 1~3분 걸릴 수 있습니다.`
      )
    ) {
      return;
    }

    setLoading(true);
    setLines([]);
    const okIds: string[] = [];
    const failNotes: string[] = [];

    for (let i = 0; i < passages.length; i++) {
      const p = passages[i]!;
      setProgress(`${i + 1}/${passages.length} · ${p.title}`);
      const result = await generateFullExamPrepWorkbookAction({
        passageId: p.id,
        title: `${p.title} · 10단계 WORKBOOK`,
        publishStages: true,
      });
      if (result.ok && "workbookId" in result && result.workbookId) {
        okIds.push(result.workbookId);
        setLines((prev) => [
          ...prev,
          `✓ ${p.title}`,
          ...((result.notes ?? []).slice(0, 4).map((n) => `  · ${n}`)),
        ]);
      } else {
        const msg = !result.ok ? result.message : "실패";
        failNotes.push(`${p.title}: ${msg}`);
        setLines((prev) => [...prev, `✗ ${p.title}: ${msg}`]);
      }
    }

    setLoading(false);
    setProgress(null);
    router.refresh();

    if (okIds.length === 1) {
      router.push(`${basePath}/workbooks/${okIds[0]}/edit`);
      return;
    }
    if (okIds.length > 1) {
      window.alert(
        `세트 워크북 ${okIds.length}/${passages.length}개 생성 완료.${
          failNotes.length ? `\n실패: ${failNotes.join(" / ")}` : ""
        }\n워크북 목록에서 확인하세요.`
      );
      router.push(`${basePath}/workbooks`);
    } else if (failNotes.length > 0) {
      window.alert(`워크북 생성 실패\n${failNotes.join("\n")}`);
    }
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
          ? progress ?? "생성 중…"
          : `세트 워크북 생성 (${passages.length})`}
      </button>
      {lines.length > 0 && (
        <ul className="max-w-xs text-right text-[10px] leading-snug text-slate-500">
          {lines.slice(-6).map((l) => (
            <li key={l}>{l}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
