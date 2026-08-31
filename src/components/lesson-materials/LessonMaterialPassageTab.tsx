"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import * as adminActions from "@/app/admin/lesson-materials/actions";
import * as teacherActions from "@/app/teacher/lesson-materials/actions";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { defaultProjectTitle } from "@/lib/lesson-materials/project-content";
import type { LessonMaterialItemDetail } from "@/lib/lesson-materials/load-items";

export function LessonMaterialPassageTab({
  role,
  item,
}: {
  role: "admin" | "teacher";
  item: LessonMaterialItemDetail;
}) {
  const router = useRouter();
  const actions = role === "admin" ? adminActions : teacherActions;

  const [label, setLabel] = useState(item.label ?? "");
  const [title, setTitle] = useState(item.title);
  const [passage, setPassage] = useState(item.source_passage ?? "");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSave = useCallback(async () => {
    setBusy(true);
    setError(null);
    setMessage(null);

    const nextTitle =
      title.trim() ||
      (passage.trim() ? defaultProjectTitle(passage) : "새 지문");

    const result = await actions.updateLessonMaterialItem(item.id, {
      title: nextTitle,
      label,
      sourcePassage: passage,
    });

    setBusy(false);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    setTitle(nextTitle);
    setMessage("저장되었습니다.");
    router.refresh();
  }, [actions, item.id, label, passage, router, title]);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">자료</h2>
        <p className="mt-1 text-sm text-slate-600">
          지문과 라벨을 수정·저장한 뒤 다른 탭에서 한줄해석 등을 생성하세요.
        </p>
      </div>

      {error ? <Alert variant="error">{error}</Alert> : null}
      {message ? <Alert variant="success">{message}</Alert> : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-xs text-slate-600">
          <span className="font-medium">구분 라벨</span>
          <input
            type="text"
            className="h-10 rounded-md border border-slate-300 px-3 text-sm"
            placeholder="예: 미디어영어 5과 본문1-1"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-slate-600">
          <span className="font-medium">제목</span>
          <input
            type="text"
            className="h-10 rounded-md border border-slate-300 px-3 text-sm"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </label>
      </div>

      <label className="flex flex-col gap-1 text-xs text-slate-600">
        <span className="font-medium">영어 지문</span>
        <textarea
          className="min-h-[320px] w-full rounded-md border border-slate-300 px-3 py-2 text-sm leading-relaxed text-slate-800"
          value={passage}
          onChange={(e) => setPassage(e.target.value)}
        />
        <span className="text-slate-400">{passage.trim().length}자</span>
      </label>

      <Button type="button" disabled={busy} onClick={() => void handleSave()}>
        {busy ? "저장 중…" : "저장"}
      </Button>
    </div>
  );
}
