"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type GenResult =
  | {
      ok: true;
      workbookId: string;
      notes?: string[];
      message?: string;
    }
  | { ok: false; message: string; notes?: string[] };

async function generateOneWorkbook(input: {
  passageId: string;
  title: string;
}): Promise<GenResult> {
  const res = await fetch("/api/exam-prep/generate-workbook", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      passageId: input.passageId,
      title: input.title,
      publishStages: true,
    }),
  });
  let data: GenResult | null = null;
  try {
    data = (await res.json()) as GenResult;
  } catch {
    return {
      ok: false,
      message: `서버 응답 오류 (HTTP ${res.status}). 시간 초과일 수 있습니다.`,
    };
  }
  if (!res.ok && data && typeof data === "object") {
    return {
      ok: false,
      message:
        "message" in data && data.message
          ? String(data.message)
          : `생성 실패 (HTTP ${res.status})`,
      notes: "notes" in data ? data.notes : undefined,
    };
  }
  return data;
}

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
  const [progress, setProgress] = useState<string | null>(null);
  const [lines, setLines] = useState<string[]>([]);

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
    const okIds: string[] = [];
    const failNotes: string[] = [];

    for (let i = 0; i < passages.length; i++) {
      const p = passages[i]!;
      setProgress(`${i + 1}/${passages.length} · ${p.title}`);
      try {
        const result = await generateOneWorkbook({
          passageId: p.id,
          title: `${p.title} · 10단계 WORKBOOK`,
        });
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
        const msg = e instanceof Error ? e.message : "네트워크 오류";
        failNotes.push(`${p.title}: ${msg}`);
        setLines((prev) => [...prev, `✗ ${p.title}: ${msg}`]);
      }
    }

    setLoading(false);
    setProgress(null);
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
          ? progress ?? "생성 중…"
          : `세트 워크북 생성 (${passages.length})`}
      </button>
      {loading && (
        <p className="max-w-[14rem] text-right text-[10px] text-amber-700">
          생성 중입니다. 페이지를 닫지 마세요.
        </p>
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
