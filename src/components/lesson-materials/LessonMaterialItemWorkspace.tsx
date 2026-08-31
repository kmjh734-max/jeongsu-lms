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
import type { LessonMaterialItemDetail } from "@/lib/lesson-materials/load-items";

const TABS = [
  { id: "passage", label: "자료" },
  { id: "line", label: "한줄해석" },
  { id: "vocab", label: "어휘·분석" },
  { id: "export", label: "내보내기" },
] as const;

type TabId = (typeof TABS)[number]["id"];

function parseTab(raw: string | null): TabId {
  if (TABS.some((t) => t.id === raw)) return raw as TabId;
  return "passage";
}

export function LessonMaterialItemWorkspace({
  role,
  item,
}: {
  role: "admin" | "teacher";
  item: LessonMaterialItemDetail;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = parseTab(searchParams.get("tab"));
  const base =
    role === "admin" ? "/admin/lesson-materials" : "/teacher/lesson-materials";
  const actions = role === "admin" ? adminActions : teacherActions;

  const setTab = useCallback(
    (next: TabId) => {
      router.replace(
        `${base}/project/${item.project_id}/item/${item.id}?tab=${next}`
      );
    },
    [base, item.id, item.project_id, router]
  );

  async function handleDelete() {
    if (!window.confirm(`「${item.title}」 지문을 삭제할까요?`)) return;
    const result = await actions.deleteLessonMaterialItems([item.id]);
    if (!result.ok) {
      window.alert(result.message);
      return;
    }
    router.push(`${base}/project/${item.project_id}?tab=materials`);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link
            href={`${base}/project/${item.project_id}?tab=materials`}
            className="text-sm text-brand-600 hover:underline"
          >
            ← {item.project_title}
          </Link>
          {item.label ? (
            <p className="mt-2 text-xs font-medium text-brand-600">{item.label}</p>
          ) : null}
          <h1 className="mt-1 text-2xl font-bold text-slate-900">{item.title}</h1>
        </div>
        <Button type="button" variant="danger" size="sm" onClick={() => void handleDelete()}>
          지문 삭제
        </Button>
      </div>

      <nav className="flex gap-1 overflow-x-auto border-b border-slate-200 pb-px">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`shrink-0 rounded-t-lg px-4 py-2.5 text-sm font-medium ${
              tab === t.id
                ? "border border-b-white border-slate-200 bg-white text-brand-700"
                : "text-slate-600 hover:bg-white/70"
            }`}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <div className="rounded-b-xl rounded-tr-xl border border-slate-200 bg-white p-4 sm:p-6">
        {tab === "passage" ? (
          <LessonMaterialPassageTab role={role} item={item} />
        ) : null}
        {tab === "line" ? <LineInterpretationTab role={role} item={item} /> : null}
        {tab === "vocab" ? (
          <LessonMaterialComingSoonTab
            title="어휘·분석"
            description="어휘표, 동의어·반의어, 지문 핵심 정리를 이 탭에서 작업합니다."
          />
        ) : null}
        {tab === "export" ? <LessonMaterialExportTab item={item} /> : null}
      </div>
    </div>
  );
}
