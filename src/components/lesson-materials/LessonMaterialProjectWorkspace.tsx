"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import * as adminActions from "@/app/admin/lesson-materials/actions";
import * as teacherActions from "@/app/teacher/lesson-materials/actions";
import { LessonMaterialComingSoonTab } from "@/components/lesson-materials/LessonMaterialComingSoonTab";
import { LessonMaterialItemsTab } from "@/components/lesson-materials/LessonMaterialItemsTab";
import { Button } from "@/components/ui/Button";
import type { LessonMaterialItemRow } from "@/lib/lesson-materials/load-items";
import type { LessonMaterialProjectDetail } from "@/lib/lesson-materials/load-project";

const TABS = [
  { id: "materials", label: "자료" },
  { id: "analysis", label: "분석 및 요약서" },
  { id: "questions", label: "변형 문제" },
  { id: "workbook", label: "워크북" },
  { id: "final", label: "최종 통합자료" },
] as const;

type TabId = (typeof TABS)[number]["id"];

function parseTab(raw: string | null): TabId {
  if (TABS.some((t) => t.id === raw)) return raw as TabId;
  return "materials";
}

export function LessonMaterialProjectWorkspace({
  role,
  project,
  items,
}: {
  role: "admin" | "teacher";
  project: LessonMaterialProjectDetail;
  items: LessonMaterialItemRow[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = parseTab(searchParams.get("tab"));
  const base =
    role === "admin" ? "/admin/lesson-materials" : "/teacher/lesson-materials";
  const actions = role === "admin" ? adminActions : teacherActions;

  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState(project.title);

  const setTab = useCallback(
    (next: TabId) => {
      router.replace(`${base}/project/${project.id}?tab=${next}`);
    },
    [base, project.id, router]
  );

  async function saveTitle() {
    const next = titleDraft.trim();
    if (!next) return;
    const res = await actions.updateLessonMaterialProject(project.id, {
      title: next,
    });
    if (!res.ok) {
      window.alert(res.message);
      return;
    }
    setEditingTitle(false);
    router.refresh();
  }

  async function handleDelete() {
    if (!window.confirm(`「${project.title}」 자료함과 안의 지문을 모두 삭제할까요?`))
      return;
    const result = await actions.deleteLessonMaterialProject(project.id);
    if (!result.ok) {
      window.alert(result.message);
      return;
    }
    router.push(`${base}/projects`);
    router.refresh();
  }

  return (
    <div className="space-y-0">
      <nav className="-mx-4 flex gap-6 overflow-x-auto border-b border-slate-200 px-4 sm:mx-0 sm:px-0">
        {TABS.map((item) => {
          const active = tab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={`shrink-0 border-b-2 pb-3 text-sm font-medium transition ${
                active
                  ? "border-brand-600 text-brand-700"
                  : "border-transparent text-slate-600 hover:text-slate-900"
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="pt-6">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <Link
              href={`${base}/projects`}
              className="text-sm text-brand-600 hover:underline"
            >
              ← 전체 자료
            </Link>
            {editingTitle ? (
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <input
                  className="h-10 rounded-md border border-slate-300 px-3 text-lg font-bold"
                  value={titleDraft}
                  onChange={(e) => setTitleDraft(e.target.value)}
                />
                <Button type="button" size="sm" onClick={() => void saveTitle()}>
                  저장
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setTitleDraft(project.title);
                    setEditingTitle(false);
                  }}
                >
                  취소
                </Button>
              </div>
            ) : (
              <button
                type="button"
                className="mt-2 flex items-center gap-2 text-left text-2xl font-bold text-slate-900 hover:text-brand-700"
                onClick={() => setEditingTitle(true)}
              >
                {project.title}
                <span className="text-base text-slate-400" aria-hidden>
                  ✏️
                </span>
              </button>
            )}
          </div>
          <Button type="button" variant="danger" size="sm" onClick={() => void handleDelete()}>
            자료함 삭제
          </Button>
        </div>

        {tab === "materials" ? (
          <LessonMaterialItemsTab role={role} project={project} items={items} />
        ) : null}
        {tab === "analysis" ? (
          <LessonMaterialComingSoonTab
            title="분석 및 요약서"
            description="지문 핵심 정리, 한줄해석, 어휘 분석을 모아 요약서 형태로 제작합니다. 개별 지문에서 「수업용 자료 제작」으로 먼저 작업할 수 있습니다."
          />
        ) : null}
        {tab === "questions" ? (
          <LessonMaterialComingSoonTab
            title="변형 문제"
            description="기존 AI 변형문제와 연동해 이 자료함의 지문으로 문제를 생성합니다."
          />
        ) : null}
        {tab === "workbook" ? (
          <LessonMaterialComingSoonTab
            title="워크북"
            description="삽화, 한눈에 정리 등 워크북 레이아웃을 구성합니다."
          />
        ) : null}
        {tab === "final" ? (
          <LessonMaterialComingSoonTab
            title="최종 통합자료"
            description="자료·분석·문제·워크북을 하나의 PDF/HTML로 묶어 내보냅니다."
          />
        ) : null}
      </div>
    </div>
  );
}
