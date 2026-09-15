"use client";

import type { ReactNode } from "react";
import { Icon } from "@/components/layout/NavIcon";
import type { ListeningSpeakerType } from "@/lib/listening/types";

export interface SegmentDraft {
  id?: string;
  speaker: ListeningSpeakerType;
  text: string;
}

interface SegmentScriptEditorProps {
  segments: SegmentDraft[];
  onChange: (segments: SegmentDraft[]) => void;
  readOnly?: boolean;
  /** 줄 오른쪽에 붙일 버튼 (예: 이 줄만 다시 읽기) */
  renderRowAction?: (segment: SegmentDraft, index: number) => ReactNode;
}

const SPEAKERS: Array<{ value: ListeningSpeakerType; label: string }> = [
  { value: "ANN", label: "안내" },
  { value: "M", label: "M" },
  { value: "W", label: "W" },
];

export function SegmentScriptEditor({
  segments,
  onChange,
  readOnly = false,
  renderRowAction,
}: SegmentScriptEditorProps) {
  function updateRow(index: number, patch: Partial<SegmentDraft>) {
    onChange(segments.map((s, i) => (i === index ? { ...s, ...patch } : s)));
  }

  function removeRow(index: number) {
    onChange(segments.filter((_, i) => i !== index));
  }

  function addRow() {
    onChange([...segments, { speaker: "ANN", text: "" }]);
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white">
      <ul className="divide-y divide-slate-100">
        {segments.map((seg, index) => (
          <li key={seg.id ?? `draft-${index}`} className="flex items-start gap-2 px-2.5 py-2">
            <select
              value={seg.speaker}
              disabled={readOnly}
              onChange={(e) =>
                updateRow(index, { speaker: e.target.value as ListeningSpeakerType })
              }
              className="h-8 shrink-0 rounded-md border border-transparent bg-slate-50 px-1.5 text-xs font-bold text-slate-900 hover:border-slate-200 focus:border-brand-500 focus:outline-none disabled:opacity-100"
              aria-label="화자"
            >
              {SPEAKERS.map((sp) => (
                <option key={sp.value} value={sp.value}>
                  {sp.label}
                </option>
              ))}
            </select>
            <textarea
              value={seg.text}
              readOnly={readOnly}
              onChange={(e) => updateRow(index, { text: e.target.value })}
              rows={Math.max(1, Math.ceil(seg.text.length / 60))}
              className="min-h-[2rem] min-w-0 flex-1 resize-y rounded-md border border-transparent px-1.5 py-1 text-[13px] leading-relaxed text-slate-700 hover:border-slate-200 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100 read-only:hover:border-transparent"
              placeholder="대사를 적어 주세요"
              aria-label={`${index + 1}번째 줄`}
            />
            {renderRowAction ? renderRowAction(seg, index) : null}
            {!readOnly ? (
              <button
                type="button"
                onClick={() => removeRow(index)}
                aria-label={`${index + 1}번째 줄 지우기`}
                className="mt-1 shrink-0 rounded p-1 text-slate-300 hover:bg-rose-50 hover:text-rose-700"
              >
                <Icon name="x" size={14} />
              </button>
            ) : null}
          </li>
        ))}
      </ul>
      {!readOnly ? (
        <button
          type="button"
          onClick={addRow}
          className="flex w-full items-center gap-1 border-t border-slate-100 px-3 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-50 hover:text-slate-800"
        >
          <Icon name="plus" size={14} strokeWidth={2} />줄 추가
        </button>
      ) : null}
    </div>
  );
}
