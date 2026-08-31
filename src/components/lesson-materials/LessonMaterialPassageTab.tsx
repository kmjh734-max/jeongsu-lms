"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import * as adminActions from "@/app/admin/lesson-materials/actions";
import * as teacherActions from "@/app/teacher/lesson-materials/actions";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { defaultProjectTitle } from "@/lib/lesson-materials/project-content";
import type { LessonMaterialProjectDetail } from "@/lib/lesson-materials/load-project";
import { useLessonMaterialsSidebar } from "@/components/lesson-materials/LessonMaterialsSidebarContext";

export function LessonMaterialPassageTab({
  role,
  project,
}: {
  role: "admin" | "teacher";
  project: LessonMaterialProjectDetail;
}) {
  const router = useRouter();
  const { folders } = useLessonMaterialsSidebar();
  const actions = role === "admin" ? adminActions : teacherActions;

  const [title, setTitle] = useState(project.title);
  const [lessonLabel, setLessonLabel] = useState(project.lesson_label ?? "");
  const [passage, setPassage] = useState(project.source_passage ?? "");
  const [folderId, setFolderId] = useState(project.folder_id ?? "");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSave = useCallback(async () => {
    setBusy(true);
    setError(null);
    setMessage(null);

    const nextTitle =
      title.trim() ||
      (passage.trim() ? defaultProjectTitle(passage) : "새 수업자료");

    const result = await actions.updateLessonMaterialProject(project.id, {
      title: nextTitle,
      lessonLabel,
      sourcePassage: passage,
      folderId: folderId || null,
    });

    setBusy(false);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    setTitle(nextTitle);
    setMessage("저장되었습니다.");
    router.refresh();
  }, [
    actions,
    folderId,
    lessonLabel,
    passage,
    project.id,
    router,
    title,
  ]);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">자료</h2>
        <p className="mt-1 text-sm text-slate-600">
          지문과 기본 정보를 입력·저장한 뒤, 다른 탭에서 한줄해석 등을
          생성하세요.
        </p>
      </div>

      {error ? <Alert variant="error">{error}</Alert> : null}
      {message ? <Alert variant="success">{message}</Alert> : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-xs text-slate-600">
          <span className="font-medium">자료 제목</span>
          <input
            type="text"
            className="h-10 rounded-md border border-slate-300 px-3 text-sm"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="비우면 지문 첫 줄로 자동 입력"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-slate-600">
          <span className="font-medium">단원·과 라벨</span>
          <input
            type="text"
            className="h-10 rounded-md border border-slate-300 px-3 text-sm"
            value={lessonLabel}
            onChange={(e) => setLessonLabel(e.target.value)}
            placeholder="예: 영어독해와 작문 미래엔 1과"
          />
        </label>
      </div>

      <label className="flex flex-col gap-1 text-xs text-slate-600">
        <span className="font-medium">폴더</span>
        <select
          className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm"
          value={folderId}
          onChange={(e) => setFolderId(e.target.value)}
        >
          <option value="">미분류</option>
          {folders.map((f) => (
            <option key={f.id} value={f.id}>
              {f.name}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1 text-xs text-slate-600">
        <span className="font-medium">영어 지문</span>
        <textarea
          className="min-h-[320px] w-full rounded-md border border-slate-300 px-3 py-2 text-sm leading-relaxed text-slate-800"
          placeholder="교과서·모의고사 지문을 붙여 넣으세요."
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
