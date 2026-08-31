"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import * as adminActions from "@/app/admin/lesson-materials/actions";
import * as teacherActions from "@/app/teacher/lesson-materials/actions";
import { useLessonMaterialsSidebar } from "@/components/lesson-materials/LessonMaterialsSidebarContext";
import { Button } from "@/components/ui/Button";

interface LessonMaterialsListClientProps {
  role: "admin" | "teacher";
  folderId?: string | null;
  title: string;
  description: string;
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

export function LessonMaterialsListClient({
  role,
  folderId,
  title,
  description,
}: LessonMaterialsListClientProps) {
  const router = useRouter();
  const { projects } = useLessonMaterialsSidebar();
  const base =
    role === "admin" ? "/admin/lesson-materials" : "/teacher/lesson-materials";
  const actions = role === "admin" ? adminActions : teacherActions;

  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (folderId === undefined) return projects;
    if (folderId === null) return projects.filter((p) => !p.folder_id);
    return projects.filter((p) => p.folder_id === folderId);
  }, [projects, folderId]);

  async function handleCreate() {
    setCreating(true);
    setError(null);
    const result = await actions.createLessonMaterialProject({
      folderId: folderId ?? null,
    });
    setCreating(false);
    if (!result.ok || !result.projectId) {
      setError(result.message);
      return;
    }
    router.push(`${base}/project/${result.projectId}?tab=passage`);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
          <p className="mt-2 text-sm text-slate-600">{description}</p>
        </div>
        <Button type="button" disabled={creating} onClick={() => void handleCreate()}>
          {creating ? "생성 중…" : "+ 새 자료 추가"}
        </Button>
      </div>

      {error ? (
        <p className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </p>
      ) : null}

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
          <p className="text-4xl" aria-hidden>
            ✏️
          </p>
          <p className="mt-3 text-sm text-slate-600">
            {filtered.length === 0 ? "0개의 자료가 있습니다." : ""}
          </p>
          <p className="mt-1 text-sm text-slate-500">
            「새 자료 추가」로 지문부터 입력해 보세요.
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-slate-200 overflow-hidden rounded-xl border border-slate-200 bg-white">
          {filtered.map((project) => (
            <li key={project.id}>
              <Link
                href={`${base}/project/${project.id}`}
                className="flex flex-col gap-1 px-4 py-4 transition hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-slate-900">
                    {project.title}
                  </p>
                  {project.lesson_label ? (
                    <p className="truncate text-sm text-slate-500">
                      {project.lesson_label}
                    </p>
                  ) : null}
                </div>
                <p className="shrink-0 text-xs text-slate-400">
                  {formatDate(project.updated_at)}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
