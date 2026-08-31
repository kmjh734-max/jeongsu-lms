"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import * as adminActions from "@/app/admin/lesson-materials/actions";
import * as teacherActions from "@/app/teacher/lesson-materials/actions";
import { LessonMaterialComingSoonTab } from "@/components/lesson-materials/LessonMaterialComingSoonTab";
import { LessonMaterialExportTab } from "@/components/lesson-materials/LessonMaterialExportTab";
import { LessonMaterialPassageTab } from "@/components/lesson-materials/LessonMaterialPassageTab";
import { LineInterpretationTab } from "@/components/lesson-materials/LineInterpretationTab";
import { Button } from "@/components/ui/Button";
import type { LessonMaterialProjectDetail } from "@/lib/lesson-materials/load-project";

const TABS = [
  { id: "passage", label: "자료" },
  { id: "line", label: "한줄해석" },
  { id: "vocab", label: "어휘·분석" },
  { id: "workbook", label: "워크북" },
  { id: "export", label: "내보내기" },
] as const;

type TabId = (typeof TABS)[number]["id"];

function parseTab(raw: string | null): TabId {
  if (TABS.some((t) => t.id === raw)) return raw as TabId;
  return "passage";
}

export function LessonMaterialProjectWorkspace({
  role,
  project,
}: {
  role: "admin" | "teacher";
  project: LessonMaterialProjectDetail;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = parseTab(searchParams.get("tab"));
  const base =
    role === "admin" ? "/admin/lesson-materials" : "/teacher/lesson-materials";
  const actions = role === "admin" ? adminActions : teacherActions;

  const setTab = useCallback(
    (next: TabId) => {
      router.replace(`${base}/project/${project.id}?tab=${next}`);
    },
    [base, project.id, router]
  );

  async function handleDelete() {
    if (!window.confirm(`「${project.title}」 자료를 삭제할까요?`)) return;
    const result = await actions.deleteLessonMaterialProject(project.id);
    if (!result.ok) {
      window.alert(result.message);
      return;
    }
    router.push(`${base}/projects`);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link
            href={`${base}/projects`}
            className="text-sm text-brand-600 hover:underline"
          >
            ← 전체 자료
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-slate-900">
            {project.title}
          </h1>
          {project.lesson_label ? (
            <p className="mt-1 text-sm text-slate-500">{project.lesson_label}</p>
          ) : null}
        </div>
        <Button type="button" variant="danger" size="sm" onClick={() => void handleDelete()}>
          자료 삭제
        </Button>
      </div>

      <nav className="flex gap-1 overflow-x-auto border-b border-slate-200 pb-px">
        {TABS.map((item) => {
          const active = tab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={`shrink-0 rounded-t-lg px-4 py-2.5 text-sm font-medium transition ${
                active
                  ? "border border-b-white border-slate-200 bg-white text-brand-700"
                  : "text-slate-600 hover:bg-white/70 hover:text-slate-900"
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="rounded-b-xl rounded-tr-xl border border-slate-200 bg-white p-4 sm:p-6">
        {tab === "passage" ? (
          <LessonMaterialPassageTab role={role} project={project} />
        ) : null}
        {tab === "line" ? (
          <LineInterpretationTab role={role} project={project} />
        ) : null}
        {tab === "vocab" ? (
          <LessonMaterialComingSoonTab
            title="어휘·분석"
            description="어휘표, 동의어·반의어, 지문 핵심 정리(제목·주제·요지)를 이 탭에서 작업합니다."
          />
        ) : null}
        {tab === "workbook" ? (
          <LessonMaterialComingSoonTab
            title="워크북"
            description="삽화, 한눈에 정리 등 수업용 워크북 레이아웃을 구성합니다."
          />
        ) : null}
        {tab === "export" ? (
          <LessonMaterialExportTab project={project} />
        ) : null}
      </div>
    </div>
  );
}
