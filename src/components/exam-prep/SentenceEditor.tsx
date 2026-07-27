"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import {
  addSentenceAction,
  deleteSentenceAction,
  enrichPassageSentencesAction,
  reorderSentencesAction,
  resplitPassageSentencesAction,
  saveSentencesAction,
} from "@/lib/exam-prep/staff-actions";
import type { ExamPassageSentence } from "@/lib/exam-prep/types";

type LocalSentence = {
  id: string;
  english_text: string;
  korean_text: string;
  is_important_writing: boolean;
  sentence_order: number;
  vocabulary: Array<{ word: string; meaning: string }>;
  grammar_points: string[];
};

function parseVocab(v: unknown): Array<{ word: string; meaning: string }> {
  if (!Array.isArray(v)) return [];
  return v
    .filter((x) => x && typeof x === "object")
    .map((x) => {
      const o = x as Record<string, unknown>;
      return {
        word: String(o.word ?? ""),
        meaning: String(o.meaning ?? ""),
      };
    })
    .filter((x) => x.word);
}

function parseGrammar(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v.map((x) => String(x)).filter(Boolean);
}

function toLocal(rows: ExamPassageSentence[]): LocalSentence[] {
  return [...rows]
    .sort((a, b) => a.sentence_order - b.sentence_order)
    .map((s) => ({
      id: s.id,
      english_text: s.english_text,
      korean_text: s.korean_text ?? "",
      is_important_writing: s.is_important_writing,
      sentence_order: s.sentence_order,
      vocabulary: parseVocab(s.vocabulary),
      grammar_points: parseGrammar(s.grammar_points),
    }));
}

export function SentenceEditor({
  passageId,
  sentences: initial,
  basePath: _basePath,
}: {
  passageId: string;
  sentences: ExamPassageSentence[];
  basePath: string;
}) {
  const router = useRouter();
  const [rows, setRows] = useState(() => toLocal(initial));
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    setRows(toLocal(initial));
  }, [initial]);

  function updateRow(index: number, patch: Partial<LocalSentence>) {
    setRows((prev) =>
      prev.map((r, i) => (i === index ? { ...r, ...patch } : r))
    );
  }

  async function handleSave() {
    setLoading(true);
    setMessage(null);
    const result = await saveSentencesAction(
      passageId,
      rows.map((r, i) => ({
        id: r.id,
        english_text: r.english_text || " ",
        korean_text: r.korean_text || null,
        is_important_writing: r.is_important_writing,
        sentence_order: i + 1,
      }))
    );
    setLoading(false);
    if (!result.ok) {
      setMessage(result.message);
      return;
    }
    setMessage("문장이 저장되었습니다.");
    router.refresh();
  }

  async function handleResplit() {
    if (
      !confirm(
        "원문 기준으로 문장을 다시 분리합니다. 기존 문장·해석이 삭제됩니다. 계속할까요?"
      )
    ) {
      return;
    }
    setLoading(true);
    setMessage(null);
    const result = await resplitPassageSentencesAction(passageId);
    setLoading(false);
    if (!result.ok) {
      setMessage(result.message);
      return;
    }
    setMessage(`${result.count}개 문장으로 분리되었습니다.`);
    router.refresh();
  }

  async function handleAdd(afterOrder: number) {
    setLoading(true);
    setMessage(null);
    const result = await addSentenceAction(passageId, afterOrder);
    setLoading(false);
    if (!result.ok) {
      setMessage(result.message);
      return;
    }
    router.refresh();
  }

  async function handleDelete(sentenceId: string) {
    if (!confirm("이 문장을 삭제할까요?")) return;
    setLoading(true);
    setMessage(null);
    const result = await deleteSentenceAction(sentenceId);
    setLoading(false);
    if (!result.ok) {
      setMessage(result.message);
      return;
    }
    setRows((prev) => prev.filter((r) => r.id !== sentenceId));
    router.refresh();
  }

  async function handleEnrich() {
    if (
      !confirm(
        "AI로 빈 해석·핵심 어휘·문법 포인트를 채웁니다. (이미 있는 해석은 유지) 크레딧이 차감됩니다."
      )
    ) {
      return;
    }
    setLoading(true);
    setMessage(null);
    const result = await enrichPassageSentencesAction(passageId);
    setLoading(false);
    if (!result.ok) {
      setMessage(result.message);
      return;
    }
    setMessage(
      `AI 해석 초안 ${result.updated}개 문장에 반영했습니다. (생성 ${result.total})`
    );
    router.refresh();
  }

  async function handleDrop(targetIndex: number) {
    if (dragIndex === null || dragIndex === targetIndex) {
      setDragIndex(null);
      return;
    }
    const next = [...rows];
    const [moved] = next.splice(dragIndex, 1);
    next.splice(targetIndex, 0, moved);
    const reordered = next.map((r, i) => ({ ...r, sentence_order: i + 1 }));
    setRows(reordered);
    setDragIndex(null);
    setLoading(true);
    const result = await reorderSentencesAction(
      passageId,
      reordered.map((r) => r.id)
    );
    setLoading(false);
    if (!result.ok) {
      setMessage(result.message);
      return;
    }
    router.refresh();
  }

  return (
    <div className="ui-section-card space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-semibold text-slate-900">
          문장 편집 ({rows.length})
        </h3>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={loading}
            onClick={handleResplit}
          >
            문장 자동 분리
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={loading || rows.length === 0}
            onClick={() => void handleEnrich()}
          >
            AI 해석·어휘
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={loading}
            onClick={() =>
              handleAdd(rows.length > 0 ? rows[rows.length - 1].sentence_order : 0)
            }
          >
            문장 추가
          </Button>
          <Button type="button" size="sm" disabled={loading} onClick={handleSave}>
            {loading ? "처리 중..." : "저장"}
          </Button>
        </div>
      </div>

      {message && (
        <p
          className={`text-sm ${
            message.includes("저장") ||
            message.includes("분리") ||
            message.includes("반영")
              ? "text-green-700"
              : "text-red-600"
          }`}
          role="status"
        >
          {message}
        </p>
      )}

      <ul className="space-y-3">
        {rows.map((row, index) => (
          <li
            key={row.id}
            draggable
            onDragStart={() => setDragIndex(index)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDrop(index)}
            className="rounded-xl border border-slate-200 bg-white p-3"
          >
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <span className="cursor-grab text-xs font-medium text-slate-500">
                #{index + 1} · 드래그하여 순서 변경
              </span>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-1.5 text-xs text-slate-600">
                  <input
                    type="checkbox"
                    checked={row.is_important_writing}
                    onChange={(e) =>
                      updateRow(index, {
                        is_important_writing: e.target.checked,
                      })
                    }
                  />
                  중요 영작
                </label>
                <button
                  type="button"
                  className="text-xs text-red-600 hover:underline"
                  onClick={() => handleDelete(row.id)}
                  disabled={loading}
                >
                  삭제
                </button>
              </div>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <label className="block text-xs font-medium text-slate-600">
                영문
                <textarea
                  rows={3}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
                  value={row.english_text}
                  onChange={(e) =>
                    updateRow(index, { english_text: e.target.value })
                  }
                />
              </label>
              <label className="block text-xs font-medium text-slate-600">
                해석
                <textarea
                  rows={3}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
                  value={row.korean_text}
                  onChange={(e) =>
                    updateRow(index, { korean_text: e.target.value })
                  }
                />
              </label>
            </div>
            {(row.vocabulary.length > 0 || row.grammar_points.length > 0) && (
              <div className="mt-2 space-y-1 text-xs text-slate-500">
                {row.vocabulary.length > 0 && (
                  <p>
                    어휘:{" "}
                    {row.vocabulary
                      .map((v) => `${v.word}(${v.meaning})`)
                      .join(" · ")}
                  </p>
                )}
                {row.grammar_points.length > 0 && (
                  <p>문법: {row.grammar_points.join(" · ")}</p>
                )}
              </div>
            )}
          </li>
        ))}
      </ul>

      {rows.length === 0 && (
        <p className="text-sm text-slate-500">
          문장이 없습니다. 「문장 자동 분리」또는 「문장 추가」를 사용하세요.
        </p>
      )}
    </div>
  );
}
