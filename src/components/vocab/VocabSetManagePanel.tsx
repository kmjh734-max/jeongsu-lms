"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import * as adminActions from "@/app/admin/vocab/actions";
import * as teacherActions from "@/app/teacher/vocab/actions";
import { Button } from "@/components/ui/Button";
import type { VocabRole, VocabTeacherOption } from "@/lib/vocab/module-types";
import type { VocabSet } from "@/types/database";

/** 세트 상세 [설정] 탭 — 제목·설명·담당 강사·폴더, 맨 아래 삭제 */
export function VocabSetManagePanel({
  set,
  role,
  teachers,
  folders,
  readOnly,
  listHref,
  onMessage,
}: {
  set: VocabSet;
  role: VocabRole;
  teachers: VocabTeacherOption[];
  /** 옮길 수 있는 폴더 (지금 폴더가 목록에 없으면 따로 붙인다) */
  folders: { id: string; name: string }[];
  readOnly: boolean;
  listHref: string;
  onMessage: (text: string, tone?: "good" | "bad") => void;
}) {
  const router = useRouter();
  const actions = role === "admin" ? adminActions : teacherActions;
  const [title, setTitle] = useState(set.title);
  const [description, setDescription] = useState(set.description ?? "");
  const [teacherId, setTeacherId] = useState(set.teacher_id ?? "");
  const [folderId, setFolderId] = useState(set.folder_id ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dirty =
    title.trim() !== set.title ||
    description.trim() !== (set.description ?? "") ||
    (role === "admin" && teacherId !== (set.teacher_id ?? "")) ||
    folderId !== (set.folder_id ?? "");

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setError("제목을 적어 주세요.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const result = await actions.updateVocabSet(set.id, {
        title,
        description,
        ...(role === "admin" ? { teacherId: teacherId || null } : {}),
      });
      if (!result.ok) {
        setError(result.message);
        return;
      }
      if (folderId !== (set.folder_id ?? "")) {
        const moved = await actions.moveVocabSet(set.id, folderId || null);
        if (!moved.ok) {
          setError(moved.message);
          return;
        }
      }
      onMessage("설정을 저장했어요.");
      router.refresh();
    } catch {
      setError("저장하지 못했어요. 잠시 뒤 다시 해 주세요.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (
      !window.confirm(
        `‘${set.title}’ 단어장을 지울까요?\n단어와 배정, 학생 학습 기록이 함께 지워지고 되돌릴 수 없어요.`
      )
    ) {
      return;
    }
    setSaving(true);
    try {
      const result = await actions.deleteVocabSet(set.id, set.folder_id);
      if (!result.ok) {
        onMessage(result.message, "bad");
        return;
      }
      router.push(listHref);
      router.refresh();
    } catch {
      onMessage("지우지 못했어요. 잠시 뒤 다시 해 주세요.", "bad");
    } finally {
      setSaving(false);
    }
  }

  const folderOptions =
    set.folder_id && !folders.some((f) => f.id === set.folder_id)
      ? [{ id: set.folder_id, name: "지금 폴더 (학원 교재)" }, ...folders]
      : folders;

  return (
    <div className="max-w-2xl space-y-4">
      <form
        onSubmit={handleSave}
        className="space-y-4 rounded-lg border border-slate-200 bg-white p-5 shadow-card sm:p-6"
      >
        <div>
          <label className="ui-label" htmlFor="vocab-set-title">
            제목
          </label>
          <input
            id="vocab-set-title"
            className="ui-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={readOnly || saving}
          />
        </div>
        <div>
          <label className="ui-label" htmlFor="vocab-set-desc">
            설명 <span className="font-normal text-slate-400">(선택)</span>
          </label>
          <textarea
            id="vocab-set-desc"
            className="ui-input min-h-[80px]"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={readOnly || saving}
          />
        </div>
        {role === "admin" ? (
          <div>
            <label className="ui-label" htmlFor="vocab-set-teacher">
              담당 강사
            </label>
            <select
              id="vocab-set-teacher"
              className="ui-select"
              value={teacherId}
              onChange={(e) => setTeacherId(e.target.value)}
              disabled={readOnly || saving}
            >
              <option value="">정하지 않음</option>
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
        ) : null}
        <div>
          <label className="ui-label" htmlFor="vocab-set-folder">
            폴더
          </label>
          <select
            id="vocab-set-folder"
            className="ui-select"
            value={folderId}
            onChange={(e) => setFolderId(e.target.value)}
            disabled={readOnly || saving}
          >
            <option value="">미분류</option>
            {folderOptions.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>
        </div>
        {error ? (
          <p className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700" role="alert">
            {error}
          </p>
        ) : null}
        {!readOnly ? (
          <div className="flex justify-end">
            <Button type="submit" disabled={saving || !dirty}>
              {saving ? "저장 중…" : "저장"}
            </Button>
          </div>
        ) : null}
      </form>

      {!set.is_locked ? (
        <section className="flex flex-col gap-3 rounded-lg border border-rose-200 bg-white p-5 shadow-card sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div>
            <h3 className="text-sm font-bold text-slate-900">단어장 삭제</h3>
            <p className="mt-1 text-[13px] text-slate-500">
              단어와 배정, 학생 학습 기록이 함께 지워져요. 되돌릴 수 없어요.
            </p>
          </div>
          <Button variant="danger" onClick={() => void handleDelete()} disabled={saving}>
            단어장 삭제
          </Button>
        </section>
      ) : null}
    </div>
  );
}
