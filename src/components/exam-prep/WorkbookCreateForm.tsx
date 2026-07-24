"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { EXAM_PRESETS } from "@/lib/exam-prep/presets";
import { createWorkbookAction } from "@/lib/exam-prep/staff-actions";
import type { ExamPresetType } from "@/lib/exam-prep/types";

const PRESET_OPTIONS = Object.entries(EXAM_PRESETS).map(([key, meta]) => ({
  value: key as Exclude<ExamPresetType, "custom">,
  label: meta.label,
  description: meta.description,
}));

export function WorkbookCreateForm({
  basePath,
  passages,
}: {
  basePath: string;
  passages: { id: string; title: string }[];
}) {
  const router = useRouter();
  const [passageId, setPassageId] = useState(passages[0]?.id ?? "");
  const [title, setTitle] = useState("");
  const [preset, setPreset] =
    useState<Exclude<ExamPresetType, "custom">>("basic");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    const result = await createWorkbookAction({
      passage_id: passageId,
      title,
      preset_type: preset,
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
    <form onSubmit={handleSubmit} className="ui-section-card space-y-4">
      <label className="block text-sm font-medium text-slate-700">
        지문 (ready)
        <select
          required
          className={inputClass}
          value={passageId}
          onChange={(e) => setPassageId(e.target.value)}
        >
          {passages.length === 0 && <option value="">ready 지문 없음</option>}
          {passages.map((p) => (
            <option key={p.id} value={p.id}>
              {p.title}
            </option>
          ))}
        </select>
      </label>

      <label className="block text-sm font-medium text-slate-700">
        워크북 제목
        <input
          required
          className={inputClass}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="예: 중간고사 Unit 3 기본 코스"
        />
      </label>

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium text-slate-700">프리셋</legend>
        {PRESET_OPTIONS.map((opt) => (
          <label
            key={opt.value}
            className={`flex cursor-pointer gap-3 rounded-xl border p-3 ${
              preset === opt.value
                ? "border-brand-500 bg-brand-50"
                : "border-slate-200 bg-white"
            }`}
          >
            <input
              type="radio"
              name="preset"
              className="mt-1"
              checked={preset === opt.value}
              onChange={() => setPreset(opt.value)}
            />
            <span>
              <span className="block text-sm font-medium text-slate-900">
                {opt.label}
              </span>
              <span className="text-xs text-slate-600">{opt.description}</span>
            </span>
          </label>
        ))}
      </fieldset>

      {message && (
        <p className="text-sm text-red-600" role="status">
          {message}
        </p>
      )}

      <Button type="submit" disabled={loading || !passageId}>
        {loading ? "생성 중..." : "워크북 생성"}
      </Button>
    </form>
  );
}
