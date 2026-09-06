"use client";

import Link from "next/link";
import { useState } from "react";
import { WorkbookCreateModal } from "@/components/lesson-materials/WorkbookCreateModal";

/** Floating purple action bar when library items are selected. */
export function LessonMaterialsSelectionBar({
  role,
  selectedCount,
  selectedIds,
  onEdit,
}: {
  role: "admin" | "teacher";
  selectedCount: number;
  selectedIds: string[];
  onEdit?: () => void;
}) {
  const [workbookOpen, setWorkbookOpen] = useState(false);
  if (selectedCount <= 0) return null;

  const base =
    role === "admin" ? "/admin/lesson-materials" : "/teacher/lesson-materials";
  const packHref = `${base}/lesson-pack?ids=${encodeURIComponent(
    selectedIds.join(",")
  )}`;
  const analysisHref = `${base}/analysis-report?ids=${encodeURIComponent(
    selectedIds.join(",")
  )}`;
  const singleEditHref =
    selectedIds.length === 1
      ? `${base}/project/${selectedIds[0]}`
      : null;

  const btn =
    "inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-2 text-xs font-bold text-violet-700 shadow-sm hover:bg-violet-50 disabled:cursor-not-allowed disabled:opacity-40";

  return (
    <>
      <div className="pointer-events-none fixed inset-x-0 bottom-6 z-40 flex justify-center px-4">
        <div className="pointer-events-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 rounded-2xl bg-violet-600 px-4 py-3 text-white shadow-xl">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 text-xs">
              ✓
            </span>
            {selectedCount}개 자료 선택됨
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {singleEditHref ? (
              <Link href={singleEditHref} className={btn} onClick={onEdit}>
                ✏ 수정
              </Link>
            ) : (
              <button type="button" className={btn} disabled>
                ✏ 수정
              </button>
            )}
            <Link
              href={packHref}
              className={btn}
              target="_blank"
              rel="noopener noreferrer"
            >
              ✦ 수업용 자료 제작
            </Link>
            <Link
              href={analysisHref}
              className={btn}
              target="_blank"
              rel="noopener noreferrer"
            >
              📄 지문 분석서 제작
            </Link>
            <button type="button" className={btn} disabled title="준비 중">
              ✒ 문제 제작
            </button>
            <button
              type="button"
              className={btn}
              onClick={() => setWorkbookOpen(true)}
            >
              📘 워크북 제작
            </button>
            <button type="button" className={btn} disabled title="준비 중">
              📃 1장 직보자료 제작
            </button>
          </div>
        </div>
      </div>

      <WorkbookCreateModal
        role={role}
        projectIds={selectedIds}
        open={workbookOpen}
        onClose={() => setWorkbookOpen(false)}
      />
    </>
  );
}
