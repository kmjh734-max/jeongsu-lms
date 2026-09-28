"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  setCoursesArchivedAction,
  trashCoursesAction,
} from "@/app/admin/courses/actions";
import { TRASH_DAYS } from "@/lib/courses/trash-days";
import type { CourseFolder } from "@/lib/courses/load-courses-page";
import type { Course, Profile } from "@/types/database";

interface CourseSettingsFormProps {
  course: Course;
  variant: "admin" | "teacher";
  teachers?: Profile[];
  listHref: string;
  folders?: CourseFolder[];
  /** 지금 이 강좌를 듣는 학생 수 — 휴지통에 넣기 전에 알려 준다 */
  studentCount?: number;
}

export function CourseSettingsForm({
  course,
  variant,
  teachers = [],
  listHref,
  folders = [],
  studentCount = 0,
}: CourseSettingsFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState(course.title);
  const [description, setDescription] = useState(course.description ?? "");
  const [folderId, setFolderId] = useState(course.folder_id ?? "");
  const [teacherId, setTeacherId] = useState(course.teacher_id ?? "");
  const [isPublished, setIsPublished] = useState(course.is_published);
  const [loading, setLoading] = useState(false);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const archived = Boolean(course.archived_at);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const payload: {
      title: string;
      description: string | null;
      folder_id: string | null;
      is_published: boolean;
      teacher_id?: string | null;
    } = {
      title: title.trim(),
      description: description.trim() || null,
      folder_id: folderId || null,
      is_published: isPublished,
    };

    if (variant === "admin") {
      payload.teacher_id = teacherId || null;
    }

    const { error: updateError } = await supabase
      .from("courses")
      .update(payload)
      .eq("id", course.id);

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    router.refresh();
    setLoading(false);
  }

  /**
   * 삭제가 아니라 휴지통으로 옮긴다.
   * 선생님 지적(2026-09-28): 예전에는 확인 창 한 번에 학생 진도 기록까지 영영 사라졌다.
   */
  async function handleTrash() {
    const who = studentCount > 0 ? `\n지금 ${studentCount}명이 듣고 있어요.` : "";
    if (
      !window.confirm(
        `「${course.title}」 강좌를 휴지통으로 옮길까요?${who}\n\n학생 화면에서 바로 사라지지만, ${TRASH_DAYS}일 안에 되돌릴 수 있어요. 진도 기록은 지워지지 않아요.`
      )
    ) {
      return;
    }
    setWorking(true);
    setError(null);
    const r = await trashCoursesAction([course.id]);
    if (!r.ok) {
      setError(r.message);
      setWorking(false);
      return;
    }
    router.push(`${listHref}?보기=휴지통`);
    router.refresh();
  }

  async function handleArchive() {
    if (
      !archived &&
      !window.confirm(
        `「${course.title}」 강좌를 보관할까요?\n\n목록에서 접히고 새로 배정할 수 없게 되지만, 듣던 학생은 계속 볼 수 있어요.`
      )
    ) {
      return;
    }
    setWorking(true);
    setError(null);
    const r = await setCoursesArchivedAction([course.id], !archived);
    if (!r.ok) setError(r.message);
    setWorking(false);
    router.refresh();
  }

  const busy = loading || working;

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-3.5">
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-600">강좌명</label>
          <input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="ui-input h-9 w-full text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-600" htmlFor="course-folder">
            카테고리
          </label>
          <select
            id="course-folder"
            value={folderId}
            onChange={(e) => setFolderId(e.target.value)}
            className="ui-input h-9 w-full text-sm"
          >
            <option value="">미분류</option>
            {folders.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>
          {folders.length === 0 ? (
            <p className="mt-1 text-[11px] text-slate-400">
              강좌 목록 왼쪽 ‘카테고리 +’에서 폴더를 만들 수 있어요.
            </p>
          ) : null}
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-600">설명</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            placeholder="학생 화면 강좌 제목 아래에 보여요"
            className="ui-input w-full py-2 text-sm"
          />
        </div>
        {variant === "admin" && (
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600">담당 강사</label>
            <select
              value={teacherId}
              onChange={(e) => setTeacherId(e.target.value)}
              className="ui-input h-9 w-full text-sm"
            >
              <option value="">선택 안 함</option>
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
        )}
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={isPublished}
            onChange={(e) => setIsPublished(e.target.checked)}
          />
          학생에게 강좌 공개
        </label>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={busy}
          className="h-9 w-full rounded-lg bg-slate-900 px-4 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
        >
          {loading ? "저장 중..." : "저장"}
        </button>
      </form>

      <div className="flex flex-col gap-1.5 border-t border-slate-100 pt-3">
        <button
          type="button"
          disabled={busy}
          onClick={() => void handleArchive()}
          className="h-8 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
        >
          {archived ? "보관 풀기" : "보관함으로 옮기기"}
        </button>
        <p className="text-[11px] leading-snug text-slate-400">
          {archived
            ? "지금 보관함에 있어요. 새로 배정할 수 없지만 듣던 학생은 계속 봅니다."
            : "끝난 강좌를 목록에서 접어 둡니다. 듣던 학생은 계속 볼 수 있어요."}
        </p>
        <button
          type="button"
          disabled={busy}
          onClick={() => void handleTrash()}
          className="mt-1 h-8 rounded-lg border border-rose-200 text-xs font-semibold text-rose-700 hover:bg-rose-50 disabled:opacity-50"
        >
          {working ? "옮기는 중..." : "휴지통으로 옮기기"}
        </button>
        <p className="text-[11px] leading-snug text-slate-400">
          {TRASH_DAYS}일 안에 되돌릴 수 있어요. 진도 기록은 지워지지 않습니다.
        </p>
      </div>
    </div>
  );
}
