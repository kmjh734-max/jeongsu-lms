"use client";

import type { ListeningSpeakerType } from "@/lib/listening/types";

export interface SegmentDraft {
  id?: string;
  speaker: ListeningSpeakerType;
  text: string;
}

interface SegmentScriptEditorProps {
  segments: SegmentDraft[];
  onChange: (segments: SegmentDraft[]) => void;
}

const SPEAKERS: ListeningSpeakerType[] = ["ANN", "M", "W"];

export function SegmentScriptEditor({
  segments,
  onChange,
}: SegmentScriptEditorProps) {
  function updateRow(index: number, patch: Partial<SegmentDraft>) {
    const next = segments.map((s, i) => (i === index ? { ...s, ...patch } : s));
    onChange(next);
  }

  function removeRow(index: number) {
    onChange(segments.filter((_, i) => i !== index));
  }

  function addRow() {
    onChange([...segments, { speaker: "ANN", text: "" }]);
  }

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-slate-500">대본 (화자별)</p>
      {segments.map((seg, index) => (
        <div
          key={seg.id ?? `draft-${index}`}
          className="flex flex-wrap items-start gap-2 rounded-lg border border-slate-200 bg-white p-2"
        >
          <select
            value={seg.speaker}
            onChange={(e) =>
              updateRow(index, {
                speaker: e.target.value as ListeningSpeakerType,
              })
            }
            className="h-9 rounded-md border border-slate-200 px-2 text-sm font-semibold text-slate-700"
            aria-label="화자"
          >
            {SPEAKERS.map((sp) => (
              <option key={sp} value={sp}>
                [{sp}]
              </option>
            ))}
          </select>
          <textarea
            value={seg.text}
            onChange={(e) => updateRow(index, { text: e.target.value })}
            rows={2}
            className="min-h-[2.25rem] min-w-[12rem] flex-1 rounded-md border border-slate-200 px-2 py-1.5 text-sm"
            placeholder="대사 입력"
          />
          <button
            type="button"
            onClick={() => removeRow(index)}
            className="rounded-md px-2 py-1 text-xs text-red-600 hover:bg-red-50"
          >
            삭제
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={addRow}
        className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
      >
        + 줄 추가
      </button>
    </div>
  );
}
