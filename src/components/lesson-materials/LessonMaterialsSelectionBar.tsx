"use client";

import Link from "next/link";
import { useState } from "react";
import { WorkbookCreateModal } from "@/components/lesson-materials/WorkbookCreateModal";
import { PickExamForMockModal } from "@/components/exam-analysis/PickExamForMockModal";
import { openNewDocument } from "@/components/lesson-materials/open-new-document";
import { defaultDocumentName, type LessonMaterialDocumentKind } from "@/lib/lesson-materials/documents";
import { askCreditConfirm } from "@/lib/credits/confirm-store";
import { materialConfirm } from "@/lib/credits/material-confirm";


/** Floating purple action bar when library items are selected. */
export function LessonMaterialsSelectionBar({
  role,
  selectedCount,
  selectedIds,
  onEdit,
  onIntegrated,
}: {
  role: "admin" | "teacher";
  selectedCount: number;
  selectedIds: string[];
  onEdit?: () => void;
  /** 최종통합자료 제작: 고른 지문으로 만든 파일을 골라 둔 생성 창을 연다. */
  onIntegrated?: () => void;
}) {
  const [workbookOpen, setWorkbookOpen] = useState(false);
  const [mockOpen, setMockOpen] = useState(false);
  const [openError, setOpenError] = useState<string | null>(null);
  const [opening, setOpening] = useState(false);
  /** 1장 자료는 만들기 전에 제목(파일 이름)을 먼저 적는다. */
  const [naming, setNaming] = useState<{ kind: "one_page_summary" | "one_page_test"; name: string } | null>(null);
  if (selectedCount <= 0) return null;

  async function make(kind: LessonMaterialDocumentKind, name?: string) {
    setOpenError(null);
    // 만들면 크레딧이 나간다. 잘못 눌러도 되돌릴 수 없으니 견본과 값을 보여 주고 한 번 더 묻는다.
    if (!(await askCreditConfirm(materialConfirm(kind, selectedIds.length)))) return;
    setOpening(true);
    const err = await openNewDocument(role, kind, selectedIds, name ? { name } : undefined);
    setOpening(false);
    if (err) setOpenError(err);
  }

  const base =
    role === "admin" ? "/admin/lesson-materials" : "/teacher/lesson-materials";
  const questionBase =
    role === "admin" ? "/admin/question-generator" : "/teacher/question-generator";
  const singleEditHref =
    selectedIds.length === 1
      ? `${base}/project/${selectedIds[0]}`
      : null;

  const btn =
    "inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-2 text-xs font-bold text-violet-700 shadow-sm hover:bg-violet-50 disabled:cursor-not-allowed disabled:opacity-40";

  return (
    <>
      <div className="pointer-events-none fixed inset-x-0 bottom-6 z-40 lg:left-[244px] flex justify-center px-4">
        <div className="pointer-events-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 rounded-2xl bg-violet-600 px-4 py-3 text-white shadow-xl">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 text-xs">
              ✓
            </span>
            {selectedCount}개 자료 선택됨
            {openError ? (
              <span className="rounded-md bg-white/90 px-2 py-0.5 text-xs font-semibold text-rose-600">
                {openError}
              </span>
            ) : null}
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
            <button
              type="button"
              className={btn}
              disabled={opening}
              onClick={() => void make("lesson_pack")}
            >
              ✦ 수업용 자료 제작
            </button>
            <button
              type="button"
              className={btn}
              disabled={opening}
              onClick={() => void make("analysis_report")}
            >
              📄 지문 분석서 제작
            </button>
            <button
              type="button"
              className={btn}
              onClick={() => setWorkbookOpen(true)}
            >
              📘 워크북 제작
            </button>
            <button
              type="button"
              className={btn}
              title="고른 지문으로 변형문제를 만듭니다"
              onClick={() =>
                window.open(
                  `${questionBase}/new?fromLesson=${encodeURIComponent(selectedIds.join(","))}`,
                  "_blank",
                  "noopener,noreferrer"
                )
              }
            >
              ✒ 문제 제작
            </button>
            <button
              type="button"
              className={btn}
              title="고른 지문으로, 분석한 학교 시험과 같은 모양의 시험지를 만듭니다"
              onClick={() => setMockOpen(true)}
            >
              🎯 동형모의고사 제작
            </button>
            <button
              type="button"
              className={btn}
              disabled={!onIntegrated}
              onClick={onIntegrated}
            >
              🗂 최종통합자료 제작
            </button>
            <button
              type="button"
              className={btn}
              disabled={opening}
              onClick={() => setNaming({ kind: "one_page_summary", name: defaultDocumentName("one_page_summary") })}
            >
              📃 1장 요약직보자료 제작
            </button>
            <button
              type="button"
              className={btn}
              disabled={opening}
              onClick={() => setNaming({ kind: "one_page_test", name: defaultDocumentName("one_page_test") })}
            >
              📝 1장 테스트 제작
            </button>
          </div>
        </div>
      </div>

      {naming ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4">
          <form
            className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl"
            onSubmit={(e) => {
              e.preventDefault();
              const { kind, name } = naming;
              setNaming(null);
              void make(kind, name.trim() || defaultDocumentName(kind));
            }}
          >
            <header className="flex items-center justify-between bg-violet-600 px-5 py-4 text-white">
              <h2 className="text-base font-bold">
                {naming.kind === "one_page_summary" ? "📃 1장 요약직보자료 만들기" : "📝 1장 테스트 만들기"}
              </h2>
              <button
                type="button"
                className="rounded-lg px-2 py-1 text-lg leading-none hover:bg-white/20"
                onClick={() => setNaming(null)}
                aria-label="닫기"
              >
                ×
              </button>
            </header>
            <div className="space-y-1 px-5 py-4">
              <label className="block space-y-1">
                <span className="text-xs font-bold text-slate-600">자료 제목</span>
                <input
                  autoFocus
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  value={naming.name}
                  maxLength={80}
                  onChange={(e) => setNaming({ ...naming, name: e.target.value })}
                  onFocus={(e) => e.target.select()}
                />
              </label>
              <p className="text-[11px] text-slate-500">
                고른 지문 {selectedIds.length}개 · 자료함에 이 이름으로 저장됩니다. 나중에 자료 화면에서 바꿀 수 있어요.
              </p>
            </div>
            <div className="flex justify-end gap-2 border-t border-slate-100 px-5 py-3">
              <button
                type="button"
                className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100"
                onClick={() => setNaming(null)}
              >
                취소
              </button>
              <button
                type="submit"
                className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-bold text-white hover:bg-violet-700"
              >
                만들기
              </button>
            </div>
          </form>
        </div>
      ) : null}
      {mockOpen ? (
        <PickExamForMockModal role={role} projectIds={selectedIds} onClose={() => setMockOpen(false)} />
      ) : null}
      <WorkbookCreateModal
        role={role}
        projectIds={selectedIds}
        open={workbookOpen}
        onClose={() => setWorkbookOpen(false)}
      />
    </>
  );
}
