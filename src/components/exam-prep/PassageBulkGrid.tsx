"use client";

import { useCallback, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { createPassagesBulkAction } from "@/lib/exam-prep/staff-actions";

type RowKey = string;

function newKey(): RowKey {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

const EMPTY_COUNT = 8;

export function PassageBulkGrid({ basePath }: { basePath: string }) {
  const router = useRouter();
  const [rowKeys, setRowKeys] = useState<RowKey[]>(() =>
    Array.from({ length: EMPTY_COUNT }, () => newKey())
  );
  const [sharedGrade, setSharedGrade] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  const addRows = useCallback((n = 5) => {
    setRowKeys((prev) => [
      ...prev,
      ...Array.from({ length: n }, () => newKey()),
    ]);
  }, []);

  const removeRow = useCallback((key: RowKey) => {
    setRowKeys((prev) => (prev.length <= 1 ? prev : prev.filter((k) => k !== key)));
  }, []);

  /** 엑셀에서 복사한 표(탭/줄바꿈) 붙여넣기 → 여러 행으로 채움 */
  function handlePaste(
    e: React.ClipboardEvent<HTMLTextAreaElement>,
    startIndex: number,
    field: "text" | "source"
  ) {
    const raw = e.clipboardData.getData("text");
    if (!raw.includes("\t") && !raw.includes("\n")) return;

    // 단일 셀에 긴 문단만 붙이는 경우는 기본 동작 유지
    const lines = raw.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");
    // 긴 지문 여러 줄은 한 셀로 — 탭이 있을 때만 표로 처리
    if (!raw.includes("\t")) return;

    e.preventDefault();
    const parsed = lines
      .map((line) => {
        const parts = line.split("\t");
        if (parts.length >= 2) {
          // 출처 | 지문  or 지문 | 출처
          const a = parts[0]?.trim() ?? "";
          const b = parts.slice(1).join("\t").trim();
          // 짧은 쪽이 출처로 추정
          if (a.length < 40 && b.length > a.length) {
            return { source: a, text: b };
          }
          return { source: b.length < 40 ? b : "", text: a || b };
        }
        return { source: "", text: line.trim() };
      })
      .filter((r) => r.text || r.source);

    if (parsed.length === 0) return;

    setRowKeys((prev) => {
      const need = startIndex + parsed.length - prev.length;
      const next =
        need > 0
          ? [...prev, ...Array.from({ length: need }, () => newKey())]
          : [...prev];
      // DOM fill after paint
      queuePromise.resolve().then(() => {
        const form = formRef.current;
        if (!form) return;
        parsed.forEach((row, i) => {
          const idx = startIndex + i;
          const textEl = form.querySelector<HTMLTextAreaElement>(
            `textarea[name="text_${idx}"]`
          );
          const sourceEl = form.querySelector<HTMLInputElement>(
            `input[name="source_${idx}"]`
          );
          if (textEl && row.text) textEl.value = row.text;
          if (sourceEl && row.source) sourceEl.value = row.source;
        });
      });
      return next;
    });
  }

  function collectRows(): Array<{
    original_text: string;
    source: string | null;
  }> {
    const form = formRef.current;
    if (!form) return [];
    const out: Array<{ original_text: string; source: string | null }> = [];
    rowKeys.forEach((_, idx) => {
      const text =
        form.querySelector<HTMLTextAreaElement>(`textarea[name="text_${idx}"]`)
          ?.value ?? "";
      const source =
        form.querySelector<HTMLInputElement>(`input[name="source_${idx}"]`)
          ?.value ?? "";
      const t = text.trim();
      if (!t) return;
      out.push({
        original_text: t,
        source: source.trim() || null,
      });
    });
    return out;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    const rows = collectRows();
    if (rows.length === 0) {
      setMessage("영어 지문을 한 줄 이상 입력해 주세요.");
      return;
    }
    startTransition(async () => {
      const result = await createPassagesBulkAction({
        grade: sharedGrade.trim() || null,
        rows,
      });
      if (!result.ok) {
        setMessage(result.message);
        return;
      }
      setMessage(`${result.count}개 지문을 등록했습니다.`);
      router.push(`${basePath}/passages`);
      router.refresh();
    });
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-slate-900">
            영어 지문 일괄 입력
          </h3>
          <p className="mt-0.5 text-xs text-slate-500">
            엑셀처럼 행을 채운 뒤 한 번에 저장합니다. 출처 열에 탭으로 붙여넣으면
            여러 행이 채워집니다.
          </p>
        </div>
        <label className="text-sm text-slate-700">
          공통 학년
          <input
            value={sharedGrade}
            onChange={(e) => setSharedGrade(e.target.value)}
            placeholder="예: 고3"
            className="ml-2 w-28 rounded-lg border border-slate-300 px-2 py-1.5 text-sm"
          />
        </label>
      </div>

      <div className="overflow-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full min-w-[720px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-center text-xs font-bold text-slate-600">
              <th className="w-20 px-2 py-2.5">#</th>
              <th className="px-2 py-2.5">영어 지문</th>
              <th className="w-44 px-2 py-2.5">지문 출처</th>
              <th className="w-12 px-1 py-2.5" />
            </tr>
          </thead>
          <tbody>
            {rowKeys.map((key, idx) => (
              <tr key={key} className="border-b border-slate-100 align-top">
                <td className="bg-slate-50/80 px-2 py-2 text-center text-xs font-bold text-slate-500">
                  지문 {idx + 1}
                </td>
                <td className="p-1.5">
                  <textarea
                    name={`text_${idx}`}
                    rows={5}
                    placeholder="영어 원문을 붙여넣으세요"
                    spellCheck={false}
                    onPaste={(e) => handlePaste(e, idx, "text")}
                    className="w-full resize-y rounded-md border border-transparent bg-transparent px-2 py-1.5 font-mono text-[13px] leading-relaxed text-slate-800 outline-none focus:border-brand-300 focus:bg-white focus:ring-1 focus:ring-brand-200"
                  />
                </td>
                <td className="p-1.5">
                  <input
                    name={`source_${idx}`}
                    placeholder="예: 25년 9월 18번"
                    onPaste={(e) => handlePaste(e, idx, "source")}
                    className="w-full rounded-md border border-transparent bg-transparent px-2 py-1.5 text-sm text-slate-800 outline-none focus:border-brand-300 focus:bg-white focus:ring-1 focus:ring-brand-200"
                  />
                </td>
                <td className="p-1 text-center">
                  <button
                    type="button"
                    onClick={() => removeRow(key)}
                    className="text-xs text-slate-400 hover:text-red-600"
                    title="행 삭제"
                  >
                    ✕
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" variant="secondary" onClick={() => addRows(5)}>
          행 5개 추가
        </Button>
        <Button type="submit" disabled={pending}>
          {pending ? "저장 중…" : "일괄 저장"}
        </Button>
        <button
          type="button"
          onClick={() => router.push(`${basePath}/passages/new?mode=single`)}
          className="ml-auto text-sm text-slate-500 hover:text-brand-700 hover:underline"
        >
          단건 상세 등록 →
        </button>
      </div>

      {message && (
        <p
          className={`text-sm ${
            message.includes("등록") ? "text-green-700" : "text-red-600"
          }`}
          role="status"
        >
          {message}
        </p>
      )}
    </form>
  );
}
