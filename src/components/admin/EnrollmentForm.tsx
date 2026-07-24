"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { assignEnrollment } from "@/app/admin/students/actions";
import { SearchableTreePicker } from "@/components/ui/SearchableTreePicker";
import type { TreeNode } from "@/lib/ui/tree-types";

interface EnrollmentFormProps {
  studentTree: TreeNode[];
  courseTree: TreeNode[];
}

export function EnrollmentForm({
  studentTree,
  courseTree,
}: EnrollmentFormProps) {
  const router = useRouter();
  const [studentId, setStudentId] = useState("");
  const [courseId, setCourseId] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!studentId || !courseId) return;

    setLoading(true);
    setMessage(null);
    setIsSuccess(false);

    const result = await assignEnrollment(studentId, courseId);

    setMessage(result.message);
    setIsSuccess(result.ok);

    if (result.ok) {
      setStudentId("");
      setCourseId("");
      router.refresh();
    }

    setLoading(false);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
    >
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_auto] lg:items-end">
        <SearchableTreePicker
          label="학생"
          required
          tree={studentTree}
          value={studentId}
          onChange={setStudentId}
          searchPlaceholder="학생·반 이름 검색"
          emptyLabel="학생 선택"
        />
        <SearchableTreePicker
          label="강좌"
          required
          tree={courseTree}
          value={courseId}
          onChange={setCourseId}
          searchPlaceholder="강좌 제목 검색"
          emptyLabel="강좌 선택"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50 sm:col-span-2 lg:col-span-1"
        >
          {loading ? "배정 중..." : "배정하기"}
        </button>
      </div>
      {message && (
        <p
          className={`mt-3 text-sm ${
            isSuccess ? "text-green-700" : "text-red-600"
          }`}
          role="status"
        >
          {message}
        </p>
      )}
    </form>
  );
}
