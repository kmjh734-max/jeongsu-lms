"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { CourseCategoryInput, normalizeCourseCategory } from "@/components/courses/CourseCategoryInput";
import type { Course, Profile } from "@/types/database";

interface CourseSettingsFormProps {
  course: Course;
  variant: "admin" | "teacher";
  teachers?: Profile[];
  listHref: string;
  categories?: string[];
}

export function CourseSettingsForm({
  course,
  variant,
  teachers = [],
  listHref,
  categories = [],
}: CourseSettingsFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState(course.title);
  const [description, setDescription] = useState(course.description ?? "");
  const [category, setCategory] = useState(course.category ?? "");
  const [teacherId, setTeacherId] = useState(course.teacher_id ?? "");
  const [isPublished, setIsPublished] = useState(course.is_published);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const payload: {
      title: string;
      description: string | null;
      category: string | null;
      is_published: boolean;
      teacher_id?: string | null;
    } = {
      title: title.trim(),
      description: description.trim() || null,
      category: normalizeCourseCategory(category),
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

  async function handleDelete() {
    if (
      !window.confirm(
        `「${course.title}」 강좌를 삭제할까요?\n\n등록된 모든 영상, 수강 배정, 학습 진도 기록이 함께 삭제되며 되돌릴 수 없습니다.`
      )
    ) {
      return;
    }

    setDeleting(true);
    setError(null);
    const supabase = createClient();

    const { error: deleteError } = await supabase
      .from("courses")
      .delete()
      .eq("id", course.id);

    if (deleteError) {
      setError(deleteError.message);
      setDeleting(false);
      return;
    }

    router.push(listHref);
    router.refresh();
  }

  const busy = loading || deleting;

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
          <label className="mb-1 block text-xs font-semibold text-slate-600">카테고리</label>
          <CourseCategoryInput value={category} onChange={setCategory} existing={categories} compact />
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
      <button
        type="button"
        disabled={busy}
        onClick={handleDelete}
        className="text-xs text-slate-400 hover:text-red-600 disabled:opacity-50"
      >
        {deleting ? "삭제 중..." : "이 강좌 삭제 (영상·진도 기록 함께 삭제)"}
      </button>
    </div>
  );
}
