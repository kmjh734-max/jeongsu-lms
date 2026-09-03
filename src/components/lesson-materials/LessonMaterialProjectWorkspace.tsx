"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { LessonMaterialLogicalFlow } from "@/components/lesson-materials/LessonMaterialLogicalFlow";
import { LessonMaterialComicFrame } from "@/components/lesson-materials/LessonMaterialComicFrame";
import type { LessonMaterialAnalysisCard } from "@/lib/lesson-materials/generate-organization";

import {
  updateLessonMaterialItemsKoreanText as updateAdminItems,
} from "@/app/admin/lesson-materials/actions";
import {
  updateLessonMaterialItemsKoreanText as updateTeacherItems,
} from "@/app/teacher/lesson-materials/actions";

export type LessonMaterialItemDraft = {
  id: string;
  label: string | null;
  title: string;
  english_text: string;
  korean_text: string | null;
  order_index: number;
};

export function LessonMaterialProjectWorkspace({
  role,
  project,
  items,
  analysis_json,
  illustration_url,
}: {
  role: "admin" | "teacher";
  project: { id: string; title: string };
  items: LessonMaterialItemDraft[];
  analysis_json?: unknown;
  illustration_prompt?: string | null;
  illustration_url?: string | null;
  illustration_captions?: string[] | null;
}) {
  const saveAction =
    role === "admin" ? updateAdminItems : updateTeacherItems;

  const [itemsDraft, setItemsDraft] = useState(() =>
    items.map((it) => ({
      id: it.id,
      label: it.label,
      title: it.title,
      english_text: it.english_text,
      korean_text: it.korean_text ?? "",
      order_index: it.order_index,
    }))
  );

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const totalCount = itemsDraft.length;

  const selectedCount = useMemo(() => {
    return itemsDraft.filter((it) => it.korean_text.trim().length > 0).length;
  }, [itemsDraft]);

  const analysisCards = useMemo((): LessonMaterialAnalysisCard[] => {
    if (!analysis_json) return [];
    if (Array.isArray(analysis_json)) return analysis_json as LessonMaterialAnalysisCard[];
    return [];
  }, [analysis_json]);

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      const out = await saveAction({
        items: itemsDraft.map((it) => ({
          id: it.id,
          korean: it.korean_text,
        })),
      });
      if (!out.ok) {
        setError(out.message);
        return;
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-6">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-bold text-slate-900">
            {project.title}
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            {totalCount}개 문장 • 한글 입력 {selectedCount}개
          </p>
        </div>
        <div className="shrink-0 text-right">
          <Link
            href={role === "admin" ? "/admin/lesson-materials" : "/teacher/lesson-materials"}
            className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            자료함으로 ←
          </Link>
        </div>
      </div>

      {error ? (
        <Alert variant="error">
          {error}
        </Alert>
      ) : null}

      {/* Step 2는 아직 연결 전이므로 placeholder만 표시 */}
      <section className="grid gap-4 lg:grid-cols-[1fr_420px]">
        <LessonMaterialLogicalFlow
          cards={analysisCards.length > 0 ? analysisCards : null}
        />
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <h2 className="text-sm font-bold text-slate-900">4컷 만화 삽화</h2>
          <div className="mt-3">
            <LessonMaterialComicFrame imageUrl={illustration_url} />
          </div>
        </div>
      </section>

      <section className="space-y-3">
        {itemsDraft
          .slice()
          .sort((a, b) => a.order_index - b.order_index)
          .map((it, idx) => (
            <div
              key={it.id}
              className="rounded-xl border border-slate-200 bg-white px-4 py-3"
            >
              <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[1fr_1fr_auto]">
                <div className="rounded-xl bg-slate-50 p-3">
                  <div className="text-xs font-bold text-rose-600">
                    영어
                  </div>
                  <div className="mt-1 whitespace-pre-wrap text-sm text-rose-900">
                    {it.english_text.trim()
                      ? it.english_text
                      : "영어 지문이 비어 있습니다."}
                  </div>
                </div>

                <label className="rounded-xl border border-slate-200 bg-white p-3">
                  <div className="text-xs font-bold text-slate-600">
                    한글 해석
                  </div>
                  <textarea
                    className="mt-2 min-h-[96px] w-full resize-y rounded-lg border border-slate-200 px-3 py-2 text-sm leading-relaxed text-slate-800"
                    value={it.korean_text}
                    onChange={(e) => {
                      const v = e.target.value;
                      setItemsDraft((prev) =>
                        prev.map((row) =>
                          row.id === it.id ? { ...row, korean_text: v } : row
                        )
                      );
                    }}
                    placeholder="한글 해석을 입력하세요."
                  />
                </label>

                <div className="flex items-start justify-end pt-1 lg:pl-3">
                  <div className="text-xs text-slate-500">
                    문장 {idx + 1}
                  </div>
                </div>
              </div>
            </div>
          ))}
      </section>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button
          type="button"
          variant="ghost"
          onClick={() => {
            setItemsDraft(
              items.map((it) => ({
                id: it.id,
                label: it.label,
                title: it.title,
                english_text: it.english_text,
                korean_text: it.korean_text ?? "",
                order_index: it.order_index,
              }))
            );
          }}
          disabled={saving}
        >
          변경 취소
        </Button>
        <Button
          type="button"
          variant="primary"
          onClick={() => void handleSave()}
          disabled={saving}
        >
          {saving ? "저장 중…" : "한글 해석 저장"}
        </Button>
      </div>
    </div>
  );
}

