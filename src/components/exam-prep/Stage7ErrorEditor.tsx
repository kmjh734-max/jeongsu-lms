"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import {
  initStage7DisplayFromOriginalAction,
  saveStage7CandidatesAction,
  saveStage7DisplayTextsAction,
  setStage7PublishedAction,
} from "@/lib/exam-prep/stage7-staff-actions";
import {
  STAGE7_ERROR_SUBS,
  STAGE7_ERROR_SUB_LABELS,
  buildDisplayWithCandidateSlots,
  collectStage7Warnings,
  validateCandidateAgainstDisplay,
  type ExamStage7Candidate,
  type Stage7CandidateDraft,
  type Stage7ErrorSub,
} from "@/lib/exam-prep/stage7-types";
import type { ExamPassageSentence } from "@/lib/exam-prep/types";

type LocalCand = Stage7CandidateDraft & { localKey: string };

function toLocal(rows: ExamStage7Candidate[]): LocalCand[] {
  return rows.map((b) => ({
    localKey: b.id,
    id: b.id,
    sentence_id: b.sentence_id,
    blank_order: b.blank_order,
    english_start: b.english_start,
    english_end: b.english_end,
    displayed_text: b.selected_text || b.answer_snapshot,
    is_error: b.is_error,
    correction_text: b.is_error ? b.answer_text : "",
    accepted_corrections: b.accepted_answers ?? [],
    error_subcategory: b.grammar_category ?? [],
    hint: b.hint,
    explanation: b.explanation,
  }));
}

export function Stage7ErrorEditor({
  passageId,
  sentences,
  initialCandidates,
  initiallyPublished,
  initialRequiredErrorCount,
}: {
  passageId: string;
  sentences: ExamPassageSentence[];
  initialCandidates: ExamStage7Candidate[];
  initiallyPublished: boolean;
  initialRequiredErrorCount: number;
}) {
  const ordered = useMemo(
    () => [...sentences].sort((a, b) => a.sentence_order - b.sentence_order),
    [sentences]
  );
  const [displayMap, setDisplayMap] = useState<Record<string, string>>(() => {
    const m: Record<string, string> = {};
    for (const s of ordered) {
      m[s.id] =
        (s as ExamPassageSentence & { stage7_display_text?: string | null })
          .stage7_display_text ??
        s.english_text ??
        "";
    }
    return m;
  });
  const [cands, setCands] = useState(() => toLocal(initialCandidates));
  const [published, setPublished] = useState(initiallyPublished);
  const [requiredCount, setRequiredCount] = useState(
    initialRequiredErrorCount || 3
  );
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [preview, setPreview] = useState(false);
  const [activeId, setActiveId] = useState(ordered[0]?.id ?? "");
  const displayRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    setCands(toLocal(initialCandidates));
  }, [initialCandidates]);

  const active = ordered.find((s) => s.id === activeId);
  const sentenceCands = cands
    .filter((c) => c.sentence_id === activeId)
    .sort((a, b) => a.english_start - b.english_start);

  const warnings = useMemo(() => {
    const map = new Map(Object.entries(displayMap));
    return collectStage7Warnings(map, cands, requiredCount);
  }, [displayMap, cands, requiredCount]);

  async function initDisplay() {
    setLoading(true);
    const result = await initStage7DisplayFromOriginalAction(passageId);
    setLoading(false);
    if (!result.ok) {
      setMessage(result.message);
      return;
    }
    const next: Record<string, string> = {};
    for (const s of ordered) next[s.id] = s.english_text ?? "";
    setDisplayMap(next);
    setMessage("원문을 7단계 표시 문장으로 복사했습니다. 오류를 직접 수정하세요.");
  }

  async function saveDisplay() {
    setLoading(true);
    const result = await saveStage7DisplayTextsAction(
      passageId,
      ordered.map((s) => ({
        sentenceId: s.id,
        stage7DisplayText: displayMap[s.id] ?? "",
      }))
    );
    setLoading(false);
    setMessage(result.ok ? "표시 문장 저장됨 (버전 갱신)" : result.message);
  }

  function captureCandidate() {
    if (!active) return;
    const el = displayRef.current;
    const sel = window.getSelection();
    if (!el || !sel || sel.rangeCount === 0 || sel.isCollapsed) {
      setMessage("표시 문장에서 밑줄 후보를 드래그해 선택하세요.");
      return;
    }
    const range = sel.getRangeAt(0);
    if (!el.contains(range.commonAncestorContainer)) {
      setMessage("현재 문장의 표시 문장 안에서 선택해 주세요.");
      return;
    }
    const display = displayMap[active.id] ?? "";
    const pre = document.createRange();
    pre.selectNodeContents(el);
    pre.setEnd(range.startContainer, range.startOffset);
    const start = pre.toString().length;
    const selected = sel.toString();
    const end = start + selected.length;
    if (display.slice(start, end) !== selected) {
      setMessage("선택 범위를 다시 확인해 주세요.");
      return;
    }
    const err = validateCandidateAgainstDisplay(display, {
      english_start: start,
      english_end: end,
      displayed_text: selected,
      is_error: true,
      correction_text: selected,
    });
    if (err && !err.includes("수정 정답")) {
      setMessage(err);
      return;
    }
    setCands((prev) => [
      ...prev,
      {
        localKey: `new-${Date.now()}`,
        sentence_id: active.id,
        blank_order: prev.length + 1,
        english_start: start,
        english_end: end,
        displayed_text: selected,
        is_error: true,
        correction_text: "",
        accepted_corrections: [],
        error_subcategory: [],
        hint: "",
        explanation: "",
      },
    ]);
    setMessage(`후보 「${selected}」 추가. 오류/올바른 여부와 수정 정답을 설정하세요.`);
    sel.removeAllRanges();
  }

  function updateCand(localKey: string, patch: Partial<LocalCand>) {
    setCands((prev) =>
      prev.map((c) => (c.localKey === localKey ? { ...c, ...patch } : c))
    );
  }

  async function handleSave() {
    setLoading(true);
    setMessage(null);
    await saveStage7DisplayTextsAction(
      passageId,
      ordered.map((s) => ({
        sentenceId: s.id,
        stage7DisplayText: displayMap[s.id] ?? "",
      }))
    );
    const drafts: Stage7CandidateDraft[] = cands.map((c, i) => ({
      id: c.id,
      sentence_id: c.sentence_id,
      blank_order: i + 1,
      english_start: c.english_start,
      english_end: c.english_end,
      displayed_text: c.displayed_text,
      is_error: c.is_error,
      correction_text: c.correction_text,
      accepted_corrections: c.accepted_corrections,
      error_subcategory: c.error_subcategory,
      hint: c.hint,
      explanation: c.explanation,
    }));
    const result = await saveStage7CandidatesAction(
      passageId,
      drafts,
      requiredCount
    );
    setLoading(false);
    if (!result.ok) {
      setMessage(result.message);
      return;
    }
    setMessage(
      `저장됨 (${result.count}개)${
        result.warnings?.length ? ` · 경고 ${result.warnings.length}건` : ""
      }`
    );
  }

  async function handlePublish(next: boolean) {
    setLoading(true);
    const result = await setStage7PublishedAction(passageId, next);
    setLoading(false);
    if (!result.ok) {
      setMessage(result.message);
      return;
    }
    setPublished(next);
    setMessage(next ? "7단계를 공개했습니다." : "7단계를 비공개로 전환했습니다.");
  }

  return (
    <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-base font-semibold text-slate-900">
            7단계 · 어색한 곳 찾아 고쳐 쓰기
          </h3>
          <p className="text-xs text-slate-500">
            원본은 유지하고, 표시 문장에만 의도적 오류를 넣습니다. AI 자동 생성 없음.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="secondary" disabled={loading} onClick={() => void initDisplay()}>
            원문→표시문장 복사
          </Button>
          <Button type="button" variant="secondary" onClick={() => setPreview((p) => !p)}>
            {preview ? "편집" : "미리보기"}
          </Button>
          <Button type="button" disabled={loading} onClick={() => void handleSave()}>
            저장
          </Button>
          <Button
            type="button"
            variant={published ? "secondary" : "primary"}
            disabled={loading}
            onClick={() => void handlePublish(!published)}
          >
            {published ? "비공개" : "공개"}
          </Button>
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-slate-700">
        찾을 오류 개수
        <input
          type="number"
          min={1}
          max={20}
          className="w-20 rounded border border-slate-200 px-2 py-1"
          value={requiredCount}
          onChange={(e) => setRequiredCount(Number(e.target.value) || 3)}
        />
      </label>

      {message && (
        <p className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700">
          {message}
        </p>
      )}
      {warnings.length > 0 && (
        <ul className="max-h-36 list-disc space-y-1 overflow-y-auto rounded-lg border border-amber-200 bg-amber-50 px-5 py-2 text-xs text-amber-900">
          {warnings.slice(0, 25).map((w) => (
            <li key={w}>{w}</li>
          ))}
        </ul>
      )}

      <div className="flex flex-wrap gap-2">
        {ordered.map((s) => (
          <button
            key={s.id}
            type="button"
            className={`rounded-lg px-3 py-1.5 text-xs font-medium ${
              s.id === activeId ? "bg-slate-900 text-white" : "bg-slate-100"
            }`}
            onClick={() => setActiveId(s.id)}
          >
            {s.sentence_order}번
          </button>
        ))}
      </div>

      {active && !preview && (
        <div className="space-y-3">
          <p className="text-xs text-slate-500">원본 (읽기 전용)</p>
          <p className="rounded-lg bg-slate-50 p-3 font-mono text-sm text-slate-600">
            {active.english_text}
          </p>
          <p className="text-xs text-slate-500">7단계 표시 문장 (편집 가능)</p>
          <textarea
            rows={3}
            className="w-full rounded-lg border border-slate-200 p-3 font-mono text-sm"
            value={displayMap[active.id] ?? ""}
            onChange={(e) =>
              setDisplayMap((prev) => ({ ...prev, [active.id]: e.target.value }))
            }
          />
          <Button type="button" variant="secondary" onClick={() => void saveDisplay()}>
            이 문장 표시문 저장
          </Button>
          <p
            ref={displayRef}
            className="select-text rounded-lg border border-rose-100 bg-rose-50/40 p-3 font-mono text-sm leading-relaxed"
          >
            {displayMap[active.id]}
          </p>
          <Button type="button" onClick={captureCandidate}>
            밑줄 후보로 지정
          </Button>

          {sentenceCands.map((c) => (
            <div key={c.localKey} className="space-y-2 rounded-lg border p-3">
              <div className="flex justify-between gap-2">
                <p className="font-mono text-sm font-semibold">
                  「{c.displayed_text}」
                </p>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() =>
                    setCands((prev) =>
                      prev.filter((x) => x.localKey !== c.localKey)
                    )
                  }
                >
                  삭제
                </Button>
              </div>
              <div className="flex gap-2 text-xs">
                <button
                  type="button"
                  className={`rounded-full px-3 py-1 ${
                    c.is_error ? "bg-rose-700 text-white" : "bg-slate-100"
                  }`}
                  onClick={() => updateCand(c.localKey, { is_error: true })}
                >
                  오류 후보
                </button>
                <button
                  type="button"
                  className={`rounded-full px-3 py-1 ${
                    !c.is_error ? "bg-emerald-700 text-white" : "bg-slate-100"
                  }`}
                  onClick={() =>
                    updateCand(c.localKey, {
                      is_error: false,
                      correction_text: "",
                    })
                  }
                >
                  올바른 후보
                </button>
              </div>
              {c.is_error && (
                <label className="block text-xs">
                  수정 정답
                  <input
                    className="mt-1 w-full rounded border px-2 py-1.5 font-mono text-sm"
                    value={c.correction_text}
                    onChange={(e) =>
                      updateCand(c.localKey, {
                        correction_text: e.target.value,
                      })
                    }
                  />
                </label>
              )}
              {c.is_error && (
                <div className="flex flex-wrap gap-1">
                  {STAGE7_ERROR_SUBS.map((sub) => (
                    <button
                      key={sub}
                      type="button"
                      className={`rounded-full px-2 py-0.5 text-xs ${
                        c.error_subcategory.includes(sub)
                          ? "bg-slate-900 text-white"
                          : "bg-slate-100"
                      }`}
                      onClick={() => {
                        const on = c.error_subcategory.includes(sub);
                        updateCand(c.localKey, {
                          error_subcategory: on
                            ? c.error_subcategory.filter((x) => x !== sub)
                            : [...c.error_subcategory, sub],
                        });
                      }}
                    >
                      {STAGE7_ERROR_SUB_LABELS[sub as Stage7ErrorSub]}
                    </button>
                  ))}
                </div>
              )}
              <label className="block text-xs">
                힌트
                <input
                  className="mt-1 w-full rounded border px-2 py-1.5 text-sm"
                  value={c.hint ?? ""}
                  onChange={(e) =>
                    updateCand(c.localKey, { hint: e.target.value })
                  }
                />
              </label>
            </div>
          ))}
        </div>
      )}

      {preview && (
        <div className="space-y-2 rounded-lg border p-4 text-sm leading-relaxed">
          {ordered.map((s) => {
            const display = displayMap[s.id] ?? "";
            const list = cands
              .filter((c) => c.sentence_id === s.id)
              .sort((a, b) => a.english_start - b.english_start);
            const slots = buildDisplayWithCandidateSlots(
              display,
              list.map((c) => ({
                id: c.localKey,
                english_start: c.english_start,
                english_end: c.english_end,
              }))
            );
            return (
              <p key={s.id} className="font-mono">
                {slots.map((seg, i) =>
                  seg.type === "text" ? (
                    <span key={i}>{seg.text}</span>
                  ) : (
                    <span
                      key={seg.id}
                      className="mx-0.5 underline decoration-2 underline-offset-2"
                    >
                      {list.find((c) => c.localKey === seg.id)?.displayed_text}
                    </span>
                  )
                )}
              </p>
            );
          })}
        </div>
      )}
    </section>
  );
}
