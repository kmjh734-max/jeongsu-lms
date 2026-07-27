"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import {
  EXAM_PRESETS,
  EXAM_PRESET_STEP_NUMBERS,
  WORKBOOK_VARIANT_STEPS,
} from "@/lib/exam-prep/presets";
import { createWorkbookAction } from "@/lib/exam-prep/staff-actions";
import type { ExamPresetType } from "@/lib/exam-prep/types";

const ALL_PACKS = WORKBOOK_VARIANT_STEPS.map((s) => s.number);

export function WorkbookCreateForm({
  basePath,
  passages,
}: {
  basePath: string;
  passages: { id: string; title: string; status?: string }[];
}) {
  const router = useRouter();
  const [passageId, setPassageId] = useState(passages[0]?.id ?? "");
  const [title, setTitle] = useState("");
  const [selected, setSelected] = useState<number[]>(() => [...ALL_PACKS]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const selectedSet = useMemo(() => new Set(selected), [selected]);

  function toggle(n: number) {
    setSelected((prev) =>
      prev.includes(n) ? prev.filter((x) => x !== n) : [...prev, n].sort((a, b) => a - b)
    );
  }

  function applyPreset(key: Exclude<ExamPresetType, "custom">) {
    setSelected([...EXAM_PRESET_STEP_NUMBERS[key]]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (selected.length === 0) {
      setMessage("유형 세트를 하나 이상 선택해 주세요.");
      return;
    }
    setLoading(true);
    setMessage(null);
    const result = await createWorkbookAction({
      passage_id: passageId,
      title,
      preset_type: "custom",
      step_numbers: selected,
    });
    setLoading(false);
    if (!result.ok) {
      setMessage(result.message);
      return;
    }
    router.push(`${basePath}/workbooks/${result.id}/edit`);
  }

  const inputClass =
    "mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100";

  return (
    <form onSubmit={handleSubmit} className="ui-section-card space-y-5">
      <label className="block text-sm font-medium text-slate-700">
        지문
        <select
          required
          className={inputClass}
          value={passageId}
          onChange={(e) => setPassageId(e.target.value)}
        >
          {passages.length === 0 && (
            <option value="">등록된 지문이 없습니다</option>
          )}
          {passages.map((p) => (
            <option key={p.id} value={p.id}>
              {p.title}
              {p.status === "draft" ? " (작성중)" : ""}
            </option>
          ))}
        </select>
      </label>
      {passages.length === 0 && (
        <p className="text-sm text-amber-700">
          지문 관리에서 본문을 먼저 등록해 주세요.
        </p>
      )}

      <label className="block text-sm font-medium text-slate-700">
        워크북 제목
        <input
          required
          className={inputClass}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="예: 중간고사 Unit 3 · 유형별 변형"
        />
      </label>

      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-medium text-slate-700">
            유형 세트 (PDF 예상·변형문제)
          </p>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => setSelected([...ALL_PACKS])}
              className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
            >
              전체 선택
            </button>
            <button
              type="button"
              onClick={() => setSelected([])}
              className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
            >
              전체 해제
            </button>
            {(Object.keys(EXAM_PRESETS) as Array<Exclude<ExamPresetType, "custom">>).map(
              (key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => applyPreset(key)}
                  className="rounded-md border border-brand-200 bg-brand-50 px-2 py-1 text-xs font-medium text-brand-800 hover:bg-brand-100"
                >
                  {EXAM_PRESETS[key].label}
                </button>
              )
            )}
          </div>
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          {WORKBOOK_VARIANT_STEPS.map((s) => {
            const on = selectedSet.has(s.number);
            return (
              <label
                key={s.number}
                className={`flex cursor-pointer items-start gap-3 rounded-xl border px-3 py-2.5 transition ${
                  on
                    ? "border-brand-500 bg-brand-50"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <input
                  type="checkbox"
                  className="mt-1"
                  checked={on}
                  onChange={() => toggle(s.number)}
                />
                <span>
                  <span className="block text-sm font-semibold text-slate-900">
                    {s.number}세트 · {s.shortLabel}
                  </span>
                  <span className="text-xs text-slate-500">
                    {s.optionKeys.length}문항 · 어법개수·주제·제목·요지 등
                  </span>
                </span>
              </label>
            );
          })}
        </div>
        <p className="text-xs text-slate-500">
          생성 후 검수 화면에서 「AI로 문항 생성」을 누르면 첨부 PDF와 같은
          유형별 객관식이 만들어집니다. 선택 {selected.length}개
        </p>
      </div>

      {message && (
        <p className="text-sm text-red-600" role="status">
          {message}
        </p>
      )}

      <Button type="submit" disabled={loading || !passageId || selected.length === 0}>
        {loading ? "생성 중..." : "워크북 생성"}
      </Button>
    </form>
  );
}
