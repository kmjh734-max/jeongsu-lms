"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

interface ParentMessageSectionProps {
  parentMessage: string;
  isEditing: boolean;
  onParentMessageChange: (value: string) => void;
  onEditingChange: (editing: boolean) => void;
  onReflectFromDraft: () => string;
  onOpenPrint: () => void;
  onPcKakaoPrepare: () => void | Promise<void>;
}

export function ParentMessageSection({
  parentMessage,
  isEditing,
  onParentMessageChange,
  onEditingChange,
  onReflectFromDraft,
  onOpenPrint,
  onPcKakaoPrepare,
}: ParentMessageSectionProps) {
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  function showStatus(message: string) {
    setStatusMessage(message);
    window.setTimeout(() => setStatusMessage(null), 4000);
  }

  function handleReflect() {
    const message = onReflectFromDraft();
    showStatus(message);
  }

  function handleToggleEdit() {
    if (isEditing) {
      onEditingChange(false);
      showStatus("수정 내용이 저장되었습니다.");
    } else {
      onEditingChange(true);
    }
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(parentMessage);
      showStatus("리포트 문구가 복사되었습니다.");
    } catch {
      showStatus("복사에 실패했습니다. 직접 선택해 복사해 주세요.");
    }
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h2 className="text-base font-semibold text-slate-900">
          학부모 발송용 문구
        </h2>
        <div className="flex flex-wrap justify-end gap-2">
          <Button type="button" variant="secondary" size="sm" onClick={handleReflect}>
            AI 학습리포트 내용 반영
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleToggleEdit}
          >
            {isEditing ? "수정 완료" : "수정"}
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => void handleCopy()}
          >
            리포트 문구 복사하기
          </Button>
          <Button type="button" variant="secondary" size="sm" onClick={onOpenPrint}>
            PDF 저장 / 인쇄
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={() => void onPcKakaoPrepare()}
          >
            PC 카톡 발송 준비
          </Button>
        </div>
      </div>

      {statusMessage && (
        <p className="mt-2 text-sm font-medium text-emerald-700" role="status">
          {statusMessage}
        </p>
      )}

      {isEditing ? (
        <textarea
          className="ui-input mt-4 min-h-[320px] w-full resize-y font-mono text-sm leading-relaxed"
          value={parentMessage}
          onChange={(e) => onParentMessageChange(e.target.value)}
          aria-label="학부모 발송용 문구 편집"
        />
      ) : (
        <pre className="mt-4 whitespace-pre-wrap rounded-xl bg-slate-50 p-4 text-sm leading-relaxed text-slate-800">
          {parentMessage}
        </pre>
      )}

    </section>
  );
}
