"use client";

import { useEffect, useMemo, useState } from "react";
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
import {
  buildHighlightSegments,
  countOccurrences,
  nextVocabStyleKey,
  parseVocabMarks,
  VOCAB_STYLE_CLASSES,
  type VocabMark,
} from "@/lib/exam-prep/vocab-marks";
import type { ExamPassageSentence } from "@/lib/exam-prep/types";

type LocalSentence = {
  id: string;
  english_text: string;
  korean_text: string;
  is_important_writing: boolean;
  sentence_order: number;
  paragraph_number: number;
  is_paragraph_start: boolean;
  teacher_note: string;
  student_note: string;
  vocabulary: VocabMark[];
  grammar_points: string[];
};

function toLocal(rows: ExamPassageSentence[]): LocalSentence[] {
  return [...rows]
    .sort((a, b) => a.sentence_order - b.sentence_order)
    .map((s) => ({
      id: s.id,
      english_text: s.english_text,
      korean_text: s.korean_text ?? "",
      is_important_writing: s.is_important_writing,
      sentence_order: s.sentence_order,
      paragraph_number: s.paragraph_number ?? 1,
      is_paragraph_start: s.is_paragraph_start ?? false,
      teacher_note: s.teacher_note ?? "",
      student_note: s.student_note ?? "",
      vocabulary: parseVocabMarks(s.vocabulary),
      grammar_points: Array.isArray(s.grammar_points)
        ? s.grammar_points.map((x) => String(x)).filter(Boolean)
        : [],
    }));
}

function validateRows(rows: LocalSentence[]): string[] {
  const issues: string[] = [];
  const orders = new Set<number>();
  rows.forEach((r, i) => {
    const n = i + 1;
    if (!r.english_text.trim()) {
      issues.push(`${n}번: 영어 문장이 비어 있습니다.`);
    }
    if (!r.korean_text.trim()) {
      issues.push(`${n}번: 우리말 해석이 없습니다.`);
    }
    if (orders.has(r.sentence_order)) {
      issues.push(`${n}번: sentenceOrder 중복 (${r.sentence_order})`);
    }
    orders.add(r.sentence_order);
    if (r.paragraph_number < 1) {
      issues.push(`${n}번: 문단 번호가 올바르지 않습니다.`);
    }
    for (const m of r.vocabulary) {
      if (!r.english_text.includes(m.englishText)) {
        issues.push(
          `${n}번: 강조 어휘 「${m.englishText}」가 영어 문장에 없습니다.`
        );
      }
      if (m.koreanText && !r.korean_text.includes(m.koreanText)) {
        issues.push(
          `${n}번: 강조 어휘 「${m.koreanText}」가 해석에 없습니다.`
        );
      }
    }
  });
  return issues;
}

function PreviewLine({
  english,
  korean,
  marks,
}: {
  english: string;
  korean: string;
  marks: VocabMark[];
}) {
  return (
    <div className="grid gap-2 border-b border-slate-100 py-2 text-sm last:border-0 sm:grid-cols-2">
      <p>
        {buildHighlightSegments(english, marks, "english").map((seg, i) =>
          seg.mark ? (
            <mark
              key={i}
              className={VOCAB_STYLE_CLASSES[seg.mark.styleKey].en}
            >
              {seg.text}
            </mark>
          ) : (
            <span key={i}>{seg.text}</span>
          )
        )}
      </p>
      <p className="text-slate-700">
        {buildHighlightSegments(korean, marks, "korean").map((seg, i) =>
          seg.mark ? (
            <mark
              key={i}
              className={VOCAB_STYLE_CLASSES[seg.mark.styleKey].ko}
            >
              {seg.text}
            </mark>
          ) : (
            <span key={i}>{seg.text}</span>
          )
        )}
      </p>
    </div>
  );
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
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [markDraft, setMarkDraft] = useState<
    Record<string, { en: string; ko: string; meaning: string }>
  >({});

  useEffect(() => {
    setRows(toLocal(initial));
  }, [initial]);

  const issues = useMemo(() => validateRows(rows), [rows]);

  function updateRow(index: number, patch: Partial<LocalSentence>) {
    setRows((prev) =>
      prev.map((r, i) => (i === index ? { ...r, ...patch } : r))
    );
  }

  async function persistOrder(next: LocalSentence[]) {
    setLoading(true);
    const result = await reorderSentencesAction(
      passageId,
      next.map((r) => r.id)
    );
    setLoading(false);
    if (!result.ok) {
      setMessage(result.message);
      return;
    }
    router.refresh();
  }

  async function handleSave() {
    const errs = validateRows(rows);
    if (errs.length > 0) {
      setMessage(`저장 전 확인: ${errs[0]}${errs.length > 1 ? ` 외 ${errs.length - 1}건` : ""}`);
      return;
    }
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
        paragraph_number: r.paragraph_number,
        is_paragraph_start: r.is_paragraph_start,
        teacher_note: r.teacher_note || null,
        student_note: r.student_note || null,
        vocabulary: r.vocabulary,
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
        "AI로 비어 있는 해석·어휘만 채웁니다. 이미 입력한 영문·해석은 수정하지 않습니다."
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

  function addMark(index: number) {
    const row = rows[index]!;
    const draft = markDraft[row.id] ?? { en: "", ko: "", meaning: "" };
    const en = draft.en.trim();
    const ko = draft.ko.trim();
    if (!en) {
      setMessage("영어 어휘를 입력해 주세요.");
      return;
    }
    if (!row.english_text.includes(en)) {
      setMessage(`영어 문장에 「${en}」가 없습니다. 원문 그대로 선택해 주세요.`);
      return;
    }
    if (ko && !row.korean_text.includes(ko)) {
      setMessage(`해석에 「${ko}」가 없습니다. 해석 원문 그대로 입력해 주세요.`);
      return;
    }
    const enOccUsed = row.vocabulary.filter((m) => m.englishText === en).length;
    const enTotal = countOccurrences(row.english_text, en);
    if (enOccUsed >= enTotal) {
      setMessage("같은 영어 표현을 더 이상 연결할 수 없습니다.");
      return;
    }
    const mark: VocabMark = {
      id: `mark-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      englishText: en,
      koreanText: ko,
      englishOccurrence: enOccUsed,
      koreanOccurrence: ko
        ? row.vocabulary.filter((m) => m.koreanText === ko).length
        : 0,
      styleKey: nextVocabStyleKey(row.vocabulary),
      meaning: draft.meaning.trim() || undefined,
    };
    updateRow(index, { vocabulary: [...row.vocabulary, mark] });
    setMarkDraft((prev) => ({
      ...prev,
      [row.id]: { en: "", ko: "", meaning: "" },
    }));
    setMessage(null);
  }

  return (
    <div className="ui-section-card space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-semibold text-slate-900">
          문장 편집 ({rows.length}) · 1단계 지문 익히기
        </h3>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={loading}
            onClick={() => setShowPreview((v) => !v)}
          >
            {showPreview ? "편집으로" : "학생 미리보기"}
          </Button>
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
            AI 해석 채우기(빈칸만)
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={loading}
            onClick={() =>
              void handleAdd(
                rows.length > 0 ? rows[rows.length - 1]!.sentence_order : 0
              )
            }
          >
            문장 추가
          </Button>
          <Button type="button" size="sm" disabled={loading} onClick={handleSave}>
            {loading ? "처리 중..." : "저장"}
          </Button>
        </div>
      </div>

      <p className="text-xs text-slate-500">
        영문·해석은 입력한 그대로 저장됩니다. AI가 내용을 임의로 고치지 않습니다.
      </p>

      {issues.length > 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
          미리보기 경고 {issues.length}건 — 예: {issues[0]}
        </div>
      )}

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

      {showPreview ? (
        <div className="rounded-xl border border-indigo-100 bg-indigo-50/40 p-4">
          <p className="mb-3 text-sm font-semibold text-indigo-900">
            학생 화면 미리보기 (데스크톱=좌우 / 모바일=문장별 세로)
          </p>
          <div className="hidden text-xs font-medium text-slate-500 sm:grid sm:grid-cols-2">
            <span>영어</span>
            <span>우리말</span>
          </div>
          {rows.map((r) => (
            <div
              key={r.id}
              className="space-y-1 border-b border-slate-100 py-2 last:border-0 sm:hidden"
            >
              <p className="text-xs font-medium text-slate-400">
                #{r.sentence_order}
              </p>
              <p className="text-sm text-slate-900">
                {buildHighlightSegments(
                  r.english_text,
                  r.vocabulary,
                  "english"
                ).map((seg, i) =>
                  seg.mark ? (
                    <mark
                      key={i}
                      className={VOCAB_STYLE_CLASSES[seg.mark.styleKey].en}
                    >
                      {seg.text}
                    </mark>
                  ) : (
                    <span key={i}>{seg.text}</span>
                  )
                )}
              </p>
              <p className="text-sm text-slate-700">
                {buildHighlightSegments(
                  r.korean_text,
                  r.vocabulary,
                  "korean"
                ).map((seg, i) =>
                  seg.mark ? (
                    <mark
                      key={i}
                      className={VOCAB_STYLE_CLASSES[seg.mark.styleKey].ko}
                    >
                      {seg.text}
                    </mark>
                  ) : (
                    <span key={i}>{seg.text}</span>
                  )
                )}
              </p>
            </div>
          ))}
          <div className="hidden sm:block">
            {rows.map((r) => (
              <PreviewLine
                key={r.id}
                english={r.english_text}
                korean={r.korean_text}
                marks={r.vocabulary}
              />
            ))}
          </div>
        </div>
      ) : (
        <ul className="space-y-3">
          {rows.map((row, index) => {
            const draft = markDraft[row.id] ?? {
              en: "",
              ko: "",
              meaning: "",
            };
            return (
              <li
                key={row.id}
                className="rounded-xl border border-slate-200 bg-white p-3"
              >
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-medium text-slate-500">
                    #{index + 1}
                  </span>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      className="rounded border border-slate-200 px-2 py-0.5 text-xs"
                      disabled={loading || index === 0}
                      onClick={() => {
                        const next = [...rows];
                        const [m] = next.splice(index, 1);
                        next.splice(index - 1, 0, m!);
                        const ordered = next.map((r, i) => ({
                          ...r,
                          sentence_order: i + 1,
                        }));
                        setRows(ordered);
                        void persistOrder(ordered);
                      }}
                    >
                      위로
                    </button>
                    <button
                      type="button"
                      className="rounded border border-slate-200 px-2 py-0.5 text-xs"
                      disabled={loading || index === rows.length - 1}
                      onClick={() => {
                        const next = [...rows];
                        const [m] = next.splice(index, 1);
                        next.splice(index + 1, 0, m!);
                        const ordered = next.map((r, i) => ({
                          ...r,
                          sentence_order: i + 1,
                        }));
                        setRows(ordered);
                        void persistOrder(ordered);
                      }}
                    >
                      아래로
                    </button>
                    <label className="flex items-center gap-1 text-xs text-slate-600">
                      문단
                      <input
                        type="number"
                        min={1}
                        className="w-14 rounded border border-slate-200 px-1 py-0.5"
                        value={row.paragraph_number}
                        onChange={(e) =>
                          updateRow(index, {
                            paragraph_number: Number(e.target.value) || 1,
                          })
                        }
                      />
                    </label>
                    <label className="flex items-center gap-1 text-xs text-slate-600">
                      <input
                        type="checkbox"
                        checked={row.is_paragraph_start}
                        onChange={(e) =>
                          updateRow(index, {
                            is_paragraph_start: e.target.checked,
                          })
                        }
                      />
                      문단 시작
                    </label>
                    <button
                      type="button"
                      className="text-xs text-red-600 hover:underline"
                      onClick={() => void handleDelete(row.id)}
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

                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                  <label className="block text-xs text-slate-600">
                    강사 메모
                    <input
                      className="mt-1 w-full rounded border border-slate-200 px-2 py-1 text-sm"
                      value={row.teacher_note}
                      onChange={(e) =>
                        updateRow(index, { teacher_note: e.target.value })
                      }
                    />
                  </label>
                  <label className="block text-xs text-slate-600">
                    학생 공개 설명
                    <input
                      className="mt-1 w-full rounded border border-slate-200 px-2 py-1 text-sm"
                      value={row.student_note}
                      onChange={(e) =>
                        updateRow(index, { student_note: e.target.value })
                      }
                    />
                  </label>
                </div>

                <div className="mt-3 rounded-lg bg-slate-50 p-2">
                  <p className="text-xs font-medium text-slate-700">
                    핵심 어휘 연결 (영어 표현 ↔ 우리말 표현)
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <input
                      placeholder="영어 선택 텍스트"
                      className="min-w-[8rem] flex-1 rounded border border-slate-200 px-2 py-1 text-xs"
                      value={draft.en}
                      onChange={(e) =>
                        setMarkDraft((prev) => ({
                          ...prev,
                          [row.id]: { ...draft, en: e.target.value },
                        }))
                      }
                    />
                    <input
                      placeholder="우리말 대응 텍스트"
                      className="min-w-[8rem] flex-1 rounded border border-slate-200 px-2 py-1 text-xs"
                      value={draft.ko}
                      onChange={(e) =>
                        setMarkDraft((prev) => ({
                          ...prev,
                          [row.id]: { ...draft, ko: e.target.value },
                        }))
                      }
                    />
                    <input
                      placeholder="뜻(선택)"
                      className="min-w-[6rem] rounded border border-slate-200 px-2 py-1 text-xs"
                      value={draft.meaning}
                      onChange={(e) =>
                        setMarkDraft((prev) => ({
                          ...prev,
                          [row.id]: { ...draft, meaning: e.target.value },
                        }))
                      }
                    />
                    <button
                      type="button"
                      className="rounded bg-slate-800 px-2 py-1 text-xs text-white"
                      onClick={() => addMark(index)}
                    >
                      연결 추가
                    </button>
                  </div>
                  {row.vocabulary.length > 0 && (
                    <ul className="mt-2 space-y-1">
                      {row.vocabulary.map((m) => (
                        <li
                          key={m.id}
                          className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-700"
                        >
                          <span>
                            <span
                              className={`mr-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold text-white ${VOCAB_STYLE_CLASSES[m.styleKey].badge}`}
                            >
                              {VOCAB_STYLE_CLASSES[m.styleKey].label}
                            </span>
                            {m.englishText}
                            {m.koreanText ? ` ↔ ${m.koreanText}` : ""}
                            {m.meaning ? ` (${m.meaning})` : ""}
                          </span>
                          <button
                            type="button"
                            className="text-red-600 hover:underline"
                            onClick={() =>
                              updateRow(index, {
                                vocabulary: row.vocabulary.filter(
                                  (x) => x.id !== m.id
                                ),
                              })
                            }
                          >
                            삭제
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {rows.length === 0 && (
        <p className="text-sm text-slate-500">
          문장이 없습니다. 「문장 자동 분리」또는 「문장 추가」를 사용하세요.
        </p>
      )}
    </div>
  );
}
