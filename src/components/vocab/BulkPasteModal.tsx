"use client";

import { useState } from "react";
import { parseBulkPaste } from "@/lib/vocab/parse-bulk-paste";

interface BulkPasteModalProps {
  open: boolean;
  onClose: () => void;
  onApply: (
    text: string
  ) => { added: number; duplicates: string[] };
}

export function BulkPasteModal({ open, onClose, onApply }: BulkPasteModalProps) {
  const [text, setText] = useState("");
  const [hint, setHint] = useState<string | null>(null);

  if (!open) return null;

  function handleApply() {
    const parsed = parseBulkPaste(text);
    if (parsed.length === 0) {
      setHint(
        "붙여넣은 내용에서 단어를 찾지 못했습니다. 탭·콤마·공백 구분을 확인해 주세요."
      );
      return;
    }
    const result = onApply(text);
    setHint(
      result.duplicates.length > 0
        ? `${result.added}개 추가됨. 중복 제외: ${result.duplicates.join(", ")}`
        : `${result.added}개 단어가 추가되었습니다.`
    );
    if (result.added > 0) {
      setText("");
      setTimeout(() => {
        setHint(null);
        onClose();
      }, 1200);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-2xl overflow-hidden rounded-lg bg-white shadow-2xl">
        <div className="relative bg-[#b8e986] px-6 py-3 text-center">
          <h2 className="text-lg font-bold text-slate-900">자료 가져오기</h2>
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-2xl text-slate-700"
            aria-label="닫기"
          >
            ×
          </button>
        </div>
        <div className="p-6">
          <p className="text-sm text-slate-600">
            엑셀·구글시트에서 복사한 내용을 붙여넣으세요. 탭, 콤마, 여러 공백으로
            구분됩니다.
          </p>
          <textarea
            className="ui-input mt-4 min-h-[200px] font-mono text-sm"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={`단어\t뜻\nprovide\t제공하다\nimportant\t중요한`}
          />
          {hint && (
            <p className="mt-2 text-sm text-slate-600" role="status">
              {hint}
            </p>
          )}
          <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              닫기
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="rounded-lg bg-[#7cb518] px-5 py-2 text-sm font-bold text-white hover:bg-[#6aa014]"
            >
              표에 추가
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
