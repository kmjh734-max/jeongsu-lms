"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { LessonMaterialLogicalFlow } from "@/components/lesson-materials/LessonMaterialLogicalFlow";
import { LessonMaterialComicFrame } from "@/components/lesson-materials/LessonMaterialComicFrame";
import type { LessonMaterialAnalysisCard } from "@/lib/lesson-materials/generate-organization";
import { translateLessonMaterialLinesAction } from "@/lib/lesson-materials/line-actions";
import { saveLessonMaterialProjectWorkspace } from "@/lib/lesson-materials/library-ops";
import { generateLessonMaterialsOrganizationDraftAction as generateAdminOrganizationDraft } from "@/app/admin/lesson-materials/actions";
import { generateLessonMaterialsOrganizationDraftAction as generateTeacherOrganizationDraft } from "@/app/teacher/lesson-materials/actions";

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
  illustration_prompt,
  illustration_url,
  illustration_captions,
}: {
  role: "admin" | "teacher";
  project: { id: string; title: string };
  items: LessonMaterialItemDraft[];
  analysis_json?: unknown;
  illustration_prompt?: string | null;
  illustration_url?: string | null;
  illustration_captions?: string[] | null;
}) {
  const router = useRouter();
  const generateAction =
    role === "admin"
      ? generateAdminOrganizationDraft
      : generateTeacherOrganizationDraft;

  const [title, setTitle] = useState(project.title);
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
  const [analysisCards, setAnalysisCards] = useState<
    LessonMaterialAnalysisCard[]
  >(() =>
    Array.isArray(analysis_json)
      ? (analysis_json as LessonMaterialAnalysisCard[])
      : []
  );
  const [illustrationPrompt, setIllustrationPrompt] = useState(
    illustration_prompt ?? ""
  );
  const [illustrationUrl, setIllustrationUrl] = useState<string | null>(
    illustration_url ?? null
  );
  const [comicCaptions, setComicCaptions] = useState<string[]>(() =>
    Array.isArray(illustration_captions)
      ? illustration_captions.map((c) => String(c ?? ""))
      : []
  );
  const [editingEnglish, setEditingEnglish] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);
  const [generatingOrganization, setGeneratingOrganization] = useState(false);
  const [generatingIllustration, setGeneratingIllustration] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const totalCount = itemsDraft.length;
  const koreanCount = useMemo(
    () => itemsDraft.filter((it) => it.korean_text.trim().length > 0).length,
    [itemsDraft]
  );

  const base =
    role === "admin" ? "/admin/lesson-materials" : "/teacher/lesson-materials";

  function updateItem(
    id: string,
    patch: Partial<{ english_text: string; korean_text: string }>
  ) {
    setItemsDraft((prev) =>
      prev.map((row) => (row.id === id ? { ...row, ...patch } : row))
    );
  }

  async function persist(extra?: {
    analysisCards?: LessonMaterialAnalysisCard[];
    illustrationPrompt?: string;
    illustrationUrl?: string | null;
    comicCaptions?: string[];
    title?: string;
  }) {
    const res = await saveLessonMaterialProjectWorkspace(role, {
      projectId: project.id,
      title: extra?.title ?? title,
      analysisCards: extra?.analysisCards ?? analysisCards,
      illustrationPrompt: extra?.illustrationPrompt ?? illustrationPrompt,
      illustrationUrl:
        extra?.illustrationUrl !== undefined
          ? extra.illustrationUrl
          : illustrationUrl,
      illustrationCaptions: extra?.comicCaptions ?? comicCaptions,
      items: itemsDraft.map((it) => ({
        id: it.id,
        english: it.english_text,
        korean: it.korean_text,
      })),
    });
    return res;
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const out = await persist();
      if (!out.ok) {
        setError(out.message);
        return;
      }
      setMessage("저장되었습니다.");
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  async function handleRegenerateFlow() {
    setGeneratingOrganization(true);
    setError(null);
    setMessage(null);
    try {
      const res = await generateAction({
        items: itemsDraft.map((it) => ({
          english: it.english_text,
          korean: it.korean_text,
        })),
      });
      if (!res.ok) {
        setError(res.message);
        return;
      }
      setAnalysisCards(res.analysisCards);
      setIllustrationPrompt(res.illustrationPrompt);
      setComicCaptions(res.comicCaptions ?? []);
      if (res.passageTitle) setTitle(res.passageTitle);

      const saved = await persist({
        analysisCards: res.analysisCards,
        illustrationPrompt: res.illustrationPrompt,
        comicCaptions: res.comicCaptions ?? [],
        title: res.passageTitle || title,
      });
      if (!saved.ok) {
        setError(saved.message);
        return;
      }
      setMessage("논리 흐름을 다시 만들었습니다.");
      router.refresh();
    } finally {
      setGeneratingOrganization(false);
    }
  }

  async function handleRegenerateIllustration() {
    const prompt = illustrationPrompt.trim();
    if (prompt.length < 8) {
      setError("먼저 논리 흐름을 생성해 주세요.");
      return;
    }
    setGeneratingIllustration(true);
    setError(null);
    setMessage(null);
    try {
      const captions =
        comicCaptions.length > 0
          ? comicCaptions
          : [
              "이게 정말 맞을까?",
              "잠깐, 문제가 보이네",
              "다시 생각해 보자",
              "이제 이해가 됐어!",
            ];
      const res = await fetch("/api/lesson-materials/illustration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          illustrationPrompt: prompt,
          passageHint: itemsDraft
            .map((it) => it.english_text)
            .join("\n")
            .slice(0, 800),
          captions,
        }),
      });
      let img: { ok: true; url: string } | { ok: false; message: string };
      try {
        img = (await res.json()) as typeof img;
      } catch {
        setError(`삽화 응답을 읽지 못했습니다 (HTTP ${res.status}).`);
        return;
      }
      if (!res.ok || !img.ok) {
        setError(!img.ok ? img.message : `삽화 생성 실패 (HTTP ${res.status})`);
        return;
      }
      setIllustrationUrl(img.url);
      const saved = await persist({
        illustrationUrl: img.url,
        comicCaptions: captions,
        illustrationPrompt: prompt,
      });
      if (!saved.ok) {
        setError(saved.message);
        return;
      }
      setMessage("삽화를 만들었습니다.");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "삽화 생성 중 오류");
    } finally {
      setGeneratingIllustration(false);
    }
  }

  async function translateOne(id: string) {
    const target = itemsDraft.find((it) => it.id === id);
    if (!target?.english_text.trim()) return;
    setTranslating(true);
    setError(null);
    try {
      const res = await translateLessonMaterialLinesAction({
        lines: [target.english_text],
      });
      if (!res.ok) {
        setError(res.message);
        return;
      }
      updateItem(id, { korean_text: res.korean[0] ?? "" });
    } finally {
      setTranslating(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-6">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <input
            className="w-full border-0 bg-transparent text-2xl font-bold text-slate-900 outline-none"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <p className="mt-1 text-sm text-slate-600">
            {totalCount}개 문장 • 한글 입력 {koreanCount}개
          </p>
        </div>
        <Link
          href={base}
          className="inline-flex shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          자료함으로 ←
        </Link>
      </div>

      {error ? <Alert variant="error">{error}</Alert> : null}
      {message ? <Alert variant="success">{message}</Alert> : null}

      <section className="grid gap-4 lg:grid-cols-[1fr_420px]">
        <LessonMaterialLogicalFlow
          cards={analysisCards.length > 0 ? analysisCards : null}
          loading={generatingOrganization && analysisCards.length === 0}
          regenerating={generatingOrganization}
          onRegenerate={() => void handleRegenerateFlow()}
        />
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <h2 className="text-sm font-bold text-slate-900">4컷 만화 삽화</h2>
          <div className="mt-3">
            <LessonMaterialComicFrame
              imageUrl={illustrationUrl}
              emptyHint={
                generatingIllustration
                  ? "4컷 만화를 그리는 중입니다. 최대 1~2분 걸릴 수 있습니다."
                  : "「삽화 만들기」를 누르면 생성됩니다."
              }
            />
          </div>
          {comicCaptions.length > 0 ? (
            <div className="mt-3 grid grid-cols-2 gap-2">
              {comicCaptions.map((c, i) => (
                <input
                  key={i}
                  className="rounded-lg border border-slate-200 px-2 py-1.5 text-xs"
                  value={c}
                  onChange={(e) => {
                    const v = e.target.value;
                    setComicCaptions((prev) => {
                      const next = [...prev];
                      next[i] = v;
                      return next;
                    });
                  }}
                  placeholder={`${i + 1}컷 대사`}
                />
              ))}
            </div>
          ) : null}
          <div className="mt-3">
            <Button
              type="button"
              size="sm"
              className="bg-brand-600 hover:bg-brand-700"
              disabled={
                generatingIllustration ||
                generatingOrganization ||
                illustrationPrompt.trim().length < 8
              }
              onClick={() => void handleRegenerateIllustration()}
            >
              {generatingIllustration
                ? "생성 중…"
                : illustrationUrl
                  ? "삽화만 다시 그리기"
                  : "삽화 만들기"}
            </Button>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        {itemsDraft
          .slice()
          .sort((a, b) => a.order_index - b.order_index)
          .map((it, idx) => {
            const isEditing = editingEnglish.has(it.id);
            return (
              <div
                key={it.id}
                className="rounded-xl border border-slate-200 bg-white px-4 py-3"
              >
                <div className="mb-2 text-xs font-bold text-slate-500">
                  문장 {idx + 1}
                </div>
                <div className="grid gap-3 lg:grid-cols-2">
                  <div className="rounded-xl bg-rose-50 p-3">
                    <div className="text-xs font-bold text-rose-600">영어</div>
                    {isEditing ? (
                      <textarea
                        className="mt-1 min-h-[72px] w-full resize-y rounded-lg border border-rose-200 bg-white px-3 py-2 text-sm text-rose-900"
                        value={it.english_text}
                        onChange={(e) =>
                          updateItem(it.id, { english_text: e.target.value })
                        }
                      />
                    ) : (
                      <div className="mt-1 whitespace-pre-wrap text-sm text-rose-900">
                        {it.english_text.trim() || "영어 지문이 비어 있습니다."}
                      </div>
                    )}
                  </div>
                  <div className="rounded-xl border border-slate-200 p-3">
                    <div className="text-xs font-bold text-slate-600">
                      한글 해석
                    </div>
                    <textarea
                      className="mt-2 min-h-[72px] w-full resize-y rounded-lg border border-slate-200 px-3 py-2 text-sm"
                      value={it.korean_text}
                      onChange={(e) =>
                        updateItem(it.id, { korean_text: e.target.value })
                      }
                      placeholder="한글 해석을 입력하세요."
                    />
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-600"
                    onClick={() => {
                      setEditingEnglish((prev) => {
                        const next = new Set(prev);
                        if (next.has(it.id)) next.delete(it.id);
                        else next.add(it.id);
                        return next;
                      });
                    }}
                  >
                    {isEditing ? "영어 편집 완료" : "영어 편집하기"}
                  </button>
                  <button
                    type="button"
                    className="rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs text-brand-700 disabled:opacity-50"
                    disabled={translating || !it.english_text.trim()}
                    onClick={() => void translateOne(it.id)}
                  >
                    한글 해석 (자동)
                  </button>
                </div>
              </div>
            );
          })}
      </section>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button
          type="button"
          variant="ghost"
          disabled={saving || generatingOrganization || generatingIllustration}
          onClick={() => {
            setTitle(project.title);
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
            setAnalysisCards(
              Array.isArray(analysis_json)
                ? (analysis_json as LessonMaterialAnalysisCard[])
                : []
            );
            setIllustrationPrompt(illustration_prompt ?? "");
            setIllustrationUrl(illustration_url ?? null);
            setComicCaptions(
              Array.isArray(illustration_captions)
                ? illustration_captions.map((c) => String(c ?? ""))
                : []
            );
            setError(null);
            setMessage(null);
          }}
        >
          변경 취소
        </Button>
        <Button
          type="button"
          variant="primary"
          onClick={() => void handleSave()}
          disabled={saving || generatingOrganization || generatingIllustration}
        >
          {saving ? "저장 중…" : "변경 사항 저장"}
        </Button>
      </div>
    </div>
  );
}
