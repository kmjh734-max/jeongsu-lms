"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  createEmptyVideoRow,
  validateVideoDraftRows,
  type VideoDraftRow,
} from "@/lib/courses/course-lessons";
import {
  lessonDisplayVideoUrl,
  lessonProviderLabel,
} from "@/lib/video/lesson-fields";
import { VideoListEditor } from "@/components/courses/VideoListEditor";
import { formatDuration } from "@/lib/video/format-duration";
import type { Lesson } from "@/types/database";

interface CourseVideoManagerProps {
  courseId: string;
  teacherId: string;
  lessons: Lesson[];
  /** admin: 서버 API로 저장(RLS 우회), teacher: 담당 강좌만 */
  apiVariant: "admin" | "teacher";
  /** 영상별 미리보기 그림·길이 (서버에서 받아 둔 것) */
  meta?: Record<string, { thumbnail: string | null; durationSeconds: number | null }>;
}

type Message = { type: "success" | "error"; text: string } | null;

function lessonsApiBase(variant: "admin" | "teacher", courseId: string) {
  return `/api/${variant}/courses/${courseId}/lessons`;
}

export function CourseVideoManager({
  courseId,
  teacherId,
  lessons: initialLessons,
  apiVariant,
  meta = {},
}: CourseVideoManagerProps) {
  const router = useRouter();
  const [lessons, setLessons] = useState(initialLessons);

  useEffect(() => {
    setLessons(initialLessons);
  }, [initialLessons]);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editVideoUrl, setEditVideoUrl] = useState("");
  const [editPublished, setEditPublished] = useState(true);
  const [newRows, setNewRows] = useState<VideoDraftRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<Message>(null);

  const displayLessons = lessons;

  function startEdit(lesson: Lesson) {
    setEditingId(lesson.id);
    setEditTitle(lesson.title);
    setEditVideoUrl(lesson.youtube_url ?? lesson.vimeo_url ?? "");
    setEditPublished(lesson.is_published);
    setMessage(null);
  }

  function cancelEdit() {
    setEditingId(null);
  }

  async function saveEdit(lessonId: string) {
    if (!editTitle.trim()) {
      setMessage({ type: "error", text: "동영상 제목을 입력해 주세요." });
      return;
    }
    if (!editVideoUrl.trim()) {
      setMessage({ type: "error", text: "동영상 링크를 입력해 주세요." });
      return;
    }
    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch(
        `${lessonsApiBase(apiVariant, courseId)}/${lessonId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: editTitle.trim(),
            videoUrl: editVideoUrl.trim(),
            isPublished: editPublished,
          }),
        }
      );
      const data = (await res.json()) as {
        ok?: boolean;
        message?: string;
        lesson?: Lesson;
      };

      if (!res.ok || !data.ok || !data.lesson) {
        setMessage({
          type: "error",
          text: data.message ?? "영상 수정에 실패했습니다.",
        });
        setLoading(false);
        return;
      }

      setLessons((prev) =>
        prev.map((l) => (l.id === lessonId ? data.lesson! : l))
      );
      setEditingId(null);
      setMessage({ type: "success", text: "영상이 수정되었습니다." });
      router.refresh();
    } catch {
      setMessage({ type: "error", text: "영상 수정 중 오류가 발생했습니다." });
    } finally {
      setLoading(false);
    }
  }

  async function deleteLesson(lesson: Lesson, index: number) {
    if (
      !window.confirm(
        `${index + 1}번 「${lesson.title}」 영상을 삭제할까요?\n진도 기록도 함께 삭제됩니다.`
      )
    ) {
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch(
        `${lessonsApiBase(apiVariant, courseId)}/${lesson.id}`,
        { method: "DELETE" }
      );
      const data = (await res.json()) as { ok?: boolean; message?: string };

      if (!res.ok || !data.ok) {
        setMessage({
          type: "error",
          text: data.message ?? "영상 삭제에 실패했습니다.",
        });
        setLoading(false);
        return;
      }

      setLessons((prev) => prev.filter((l) => l.id !== lesson.id));
      if (editingId === lesson.id) setEditingId(null);
      setMessage({ type: "success", text: "영상이 삭제되었습니다." });
      router.refresh();
    } catch {
      setMessage({ type: "error", text: "영상 삭제 중 오류가 발생했습니다." });
    } finally {
      setLoading(false);
    }
  }

  async function move(index: number, dir: -1 | 1) {
    const to = index + dir;
    if (to < 0 || to >= lessons.length) return;
    const next = [...lessons];
    [next[index], next[to]] = [next[to]!, next[index]!];
    const before = lessons;
    setLessons(next);
    setMessage(null);
    try {
      const res = await fetch(`${lessonsApiBase(apiVariant, courseId)}/reorder`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: next.map((l) => l.id) }),
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; message?: string };
      if (!res.ok || !data.ok) {
        setLessons(before);
        setMessage({ type: "error", text: data.message ?? "순서를 저장하지 못했어요." });
        return;
      }
      router.refresh();
    } catch {
      setLessons(before);
      setMessage({ type: "error", text: "순서를 저장하지 못했어요." });
    }
  }

  async function saveNewVideos() {
    if (newRows.length === 0) return;

    const videoCheck = validateVideoDraftRows(newRows);
    if (!videoCheck.ok) {
      setMessage({ type: "error", text: videoCheck.message });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch(lessonsApiBase(apiVariant, courseId), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teacherId,
          rows: newRows,
        }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        message?: string;
        lessons?: Lesson[];
      };

      if (!res.ok || !data.ok || !data.lessons?.length) {
        setMessage({
          type: "error",
          text: data.message ?? "영상 저장에 실패했습니다.",
        });
        setLoading(false);
        return;
      }

      setLessons((prev) => [...prev, ...data.lessons!]);
      setNewRows([]);
      setMessage({ type: "success", text: "새 영상이 추가되었습니다." });
      router.refresh();
    } catch {
      setMessage({ type: "error", text: "영상 추가 중 오류가 발생했습니다." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-slate-900">
            영상 <span className="text-brand-700">{displayLessons.length}</span>
          </h3>
          <p className="mt-0.5 text-xs text-slate-500">위에서부터 1강, 2강 … 순서로 학생에게 보여요. 화살표로 순서를 바꿀 수 있어요.</p>
        </div>
        <button
          type="button"
          disabled={loading}
          onClick={() => setNewRows((rows) => [...rows, createEmptyVideoRow()])}
          className="inline-flex h-9 shrink-0 items-center gap-1 rounded-lg bg-brand-600 px-3.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
        >
          + 영상 추가
        </button>
      </div>

      {newRows.length > 0 ? (
        <div className="rounded-xl border border-brand-200 bg-brand-50/40 p-4">
          <p className="mb-3 text-sm font-bold text-slate-900">새 영상</p>
          <VideoListEditor rows={newRows} onChange={setNewRows} disabled={loading} hideHeader />
          <div className="mt-4 flex gap-2">
            <button
              type="button"
              disabled={loading}
              onClick={saveNewVideos}
              className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
            >
              {loading ? "저장 중..." : `${newRows.length}개 저장`}
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() => setNewRows([])}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
            >
              취소
            </button>
          </div>
        </div>
      ) : null}

      {message && (
        <p
          role="status"
          className={`rounded-lg px-3 py-2 text-sm ${
            message.type === "success" ? "bg-green-50 text-green-800" : "bg-red-50 text-red-700"
          }`}
        >
          {message.text}
        </p>
      )}

      {displayLessons.length === 0 ? (
        newRows.length === 0 ? (
          <button
            type="button"
            onClick={() => setNewRows([createEmptyVideoRow()])}
            className="flex w-full flex-col items-center gap-1 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-10 text-sm text-slate-500 hover:border-brand-300 hover:text-brand-700"
          >
            <span className="font-semibold">아직 영상이 없어요</span>
            <span>Vimeo·YouTube 링크를 붙여 넣어 첫 영상을 올려 보세요</span>
          </button>
        ) : null
      ) : (
        <ul className="space-y-2">
          {displayLessons.map((lesson, index) => {
            const isEditing = editingId === lesson.id;
            const m = meta[lesson.id];

            if (isEditing) {
              return (
                <li key={lesson.id} className="rounded-xl border border-brand-200 bg-brand-50/40 p-4">
                  <p className="mb-3 text-sm font-bold text-slate-900">{index + 1}강 수정</p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="block">
                      <span className="mb-1 block text-xs font-medium text-slate-600">동영상 제목</span>
                      <input
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="ui-input h-9 w-full text-sm"
                      />
                    </label>
                    <label className="block">
                      <span className="mb-1 block text-xs font-medium text-slate-600">동영상 링크</span>
                      <input
                        value={editVideoUrl}
                        onChange={(e) => setEditVideoUrl(e.target.value)}
                        className="ui-input h-9 w-full text-sm"
                      />
                    </label>
                  </div>
                  <label className="mt-3 flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={editPublished} onChange={(e) => setEditPublished(e.target.checked)} />
                    학생에게 공개
                  </label>
                  <div className="mt-4 flex gap-2">
                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => saveEdit(lesson.id)}
                      className="rounded-lg bg-brand-600 px-3.5 py-1.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
                    >
                      저장
                    </button>
                    <button
                      type="button"
                      disabled={loading}
                      onClick={cancelEdit}
                      className="rounded-lg border border-slate-300 bg-white px-3.5 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
                    >
                      취소
                    </button>
                  </div>
                </li>
              );
            }

            return (
              <li
                key={lesson.id}
                className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-2 pr-3 hover:border-slate-300"
              >
                <div className="flex shrink-0 flex-col">
                  <button
                    type="button"
                    aria-label={`${index + 1}강 위로`}
                    disabled={loading || index === 0}
                    onClick={() => move(index, -1)}
                    className="flex h-6 w-6 items-center justify-center rounded text-[10px] text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-25"
                  >
                    ▲
                  </button>
                  <button
                    type="button"
                    aria-label={`${index + 1}강 아래로`}
                    disabled={loading || index === displayLessons.length - 1}
                    onClick={() => move(index, 1)}
                    className="flex h-6 w-6 items-center justify-center rounded text-[10px] text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-25"
                  >
                    ▼
                  </button>
                </div>
                <span className="relative aspect-video w-[112px] shrink-0 overflow-hidden rounded-lg bg-slate-800">
                  {m?.thumbnail ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={m.thumbnail} alt="" loading="lazy" className="h-full w-full object-cover" />
                  ) : null}
                  {m?.durationSeconds ? (
                    <span className="absolute bottom-1 right-1 rounded bg-black/75 px-1 text-[10px] font-semibold tabular-nums text-white">
                      {formatDuration(m.durationSeconds)}
                    </span>
                  ) : null}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-400">{index + 1}강</p>
                  <p className="truncate font-semibold text-slate-900">{lesson.title}</p>
                  <p className="mt-0.5 truncate text-xs text-slate-500">
                    {lessonProviderLabel(lesson) ? `${lessonProviderLabel(lesson)} · ` : ""}
                    {lessonDisplayVideoUrl(lesson)}
                  </p>
                </div>
                <span
                  className={`hidden shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold sm:inline ${
                    lesson.is_published ? "bg-green-50 text-green-700" : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {lesson.is_published ? "공개" : "숨김"}
                </span>
                <div className="flex shrink-0 gap-3 text-sm">
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => startEdit(lesson)}
                    className="font-semibold text-brand-700 hover:underline disabled:opacity-50"
                  >
                    수정
                  </button>
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => deleteLesson(lesson, index)}
                    className="text-slate-400 hover:text-red-600 disabled:opacity-50"
                  >
                    삭제
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
