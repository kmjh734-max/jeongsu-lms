"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import {
  proposeBlanksFromVocabAction,
  saveKoreanBlanksAction,
  setStage2PublishedAction,
} from "@/lib/exam-prep/stage2-staff-actions";
import {
  blankCoverageRatio,
  buildKoreanWithBlankSlots,
  excludeTrailingJosaFromBlank,
  findOverlappingBlanks,
  validateBlankAgainstKorean,
  type BlankDraft,
  type ExamKoreanBlank,
} from "@/lib/exam-prep/stage2-types";
import { parseVocabMarks } from "@/lib/exam-prep/vocab-marks";
import { splitKoreanParticle } from "@/lib/exam-prep/blank-importance";
import type { ExamPassageSentence } from "@/lib/exam-prep/types";

type LocalBlank = BlankDraft & { localKey: string };

function toLocal(rows: ExamKoreanBlank[], sentences: ExamPassageSentence[]): LocalBlank[] {
  const koreanById = new Map(
    sentences.map((s) => [s.id, String(s.korean_text ?? "")])
  );
  return rows.map((b) => {
    const normalized = excludeTrailingJosaFromBlank(
      koreanById.get(b.sentence_id) ?? "",
      b
    );
    return {
      localKey: normalized.id,
      sentence_id: normalized.sentence_id,
      blank_order: normalized.blank_order,
      answer_text: normalized.answer_text,
      accepted_answers: normalized.accepted_answers ?? [],
      korean_start: normalized.korean_start,
      korean_end: normalized.korean_end,
      linked_vocabulary_mark_id: normalized.linked_vocabulary_mark_id,
      linked_english_text: normalized.linked_english_text,
      linked_english_start: normalized.linked_english_start,
      linked_english_end: normalized.linked_english_end,
      linked_english_occurrence: normalized.linked_english_occurrence,
      hint: normalized.hint ?? "",
      explanation: normalized.explanation ?? "",
      is_required: normalized.is_required,
      ignore_punctuation: normalized.ignore_punctuation,
      flexible_spacing: normalized.flexible_spacing,
      id: normalized.id,
    };
  });
}

export function Stage2BlankEditor({
  passageId,
  sentences,
  initialBlanks,
  initiallyPublished,
}: {
  passageId: string;
  sentences: ExamPassageSentence[];
  initialBlanks: ExamKoreanBlank[];
  initiallyPublished: boolean;
}) {
  const ordered = useMemo(
    () => [...sentences].sort((a, b) => a.sentence_order - b.sentence_order),
    [sentences]
  );
  const [blanks, setBlanks] = useState(() => toLocal(initialBlanks, sentences));
  const [published, setPublished] = useState(initiallyPublished);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [preview, setPreview] = useState(false);
  const [activeSentenceId, setActiveSentenceId] = useState(
    ordered[0]?.id ?? ""
  );
  const koreanRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    setBlanks(toLocal(initialBlanks, sentences));
  }, [initialBlanks, sentences]);

  const activeSentence = ordered.find((s) => s.id === activeSentenceId);
  const sentenceBlanks = blanks
    .filter((b) => b.sentence_id === activeSentenceId)
    .sort((a, b) => a.korean_start - b.korean_start);

  const validationIssues = useMemo(() => {
    const issues: string[] = [];
    for (const s of ordered) {
      const korean = s.korean_text ?? "";
      const list = blanks.filter((b) => b.sentence_id === s.id);
      for (const b of list) {
        const err = validateBlankAgainstKorean(korean, b);
        if (err) issues.push(`${s.sentence_order}번: ${err}`);
      }
      const overlap = findOverlappingBlanks(list);
      if (overlap) issues.push(`${s.sentence_order}번: ${overlap}`);
      if (list.length === 0) {
        issues.push(`${s.sentence_order}번: 빈칸 없음 (경고)`);
      }
      if (korean && blankCoverageRatio(korean, list) >= 0.6) {
        issues.push(
          `${s.sentence_order}번: 빈칸 비율 60% 이상 (경고)`
        );
      }
      if (
        list.some(
          (b) => b.korean_start === 0 && b.korean_end >= korean.length && korean.length > 0
        )
      ) {
        issues.push(`${s.sentence_order}번: 문장 전체 빈칸 (경고)`);
      }
    }
    if (blanks.length === 0) {
      issues.push("지문 전체에 빈칸이 없습니다. 공개할 수 없습니다.");
    }
    return issues;
  }, [blanks, ordered]);

  function captureSelection() {
    if (!activeSentence) return;
    const el = koreanRef.current;
    const sel = window.getSelection();
    if (!el || !sel || sel.rangeCount === 0 || sel.isCollapsed) {
      setMessage("우리말 해석에서 빈칸으로 만들 부분을 드래그해 선택하세요.");
      return;
    }
    const range = sel.getRangeAt(0);
    if (!el.contains(range.commonAncestorContainer)) {
      setMessage("현재 문장의 우리말 해석 안에서 선택해 주세요.");
      return;
    }
    const korean = activeSentence.korean_text ?? "";
    const preRange = document.createRange();
    preRange.selectNodeContents(el);
    preRange.setEnd(range.startContainer, range.startOffset);
    const start = preRange.toString().length;
    const selected = sel.toString();
    const end = start + selected.length;
    if (!selected.trim()) {
      setMessage("공백만 선택할 수 없습니다.");
      return;
    }
    if (korean.slice(start, end) !== selected) {
      setMessage("선택 범위를 다시 확인해 주세요.");
      return;
    }

    const { stem, particle } = splitKoreanParticle(selected);
    const blankStart = start;
    const blankEnd = particle ? start + stem.length : end;
    const blankText = particle ? stem : selected;
    if (!blankText.trim() || korean.slice(blankStart, blankEnd) !== blankText) {
      setMessage("선택 범위를 다시 확인해 주세요.");
      return;
    }

    const marks = parseVocabMarks(activeSentence.vocabulary);
    const matchMark = marks.find(
      (m) => m.koreanText === blankText || m.koreanText === selected
    );
    const draft: LocalBlank = {
      localKey: `new-${Date.now()}`,
      sentence_id: activeSentence.id,
      blank_order: blanks.length + 1,
      answer_text: blankText,
      accepted_answers: [],
      korean_start: blankStart,
      korean_end: blankEnd,
      linked_vocabulary_mark_id: matchMark?.id ?? null,
      linked_english_text: matchMark?.englishText ?? null,
      linked_english_occurrence: matchMark?.englishOccurrence ?? null,
      hint: matchMark?.meaning ?? "",
      explanation: matchMark
        ? `${matchMark.englishText}: ${matchMark.koreanText}`
        : "",
      is_required: true,
    };
    setBlanks((prev) => [...prev, draft]);
    setMessage(
      matchMark
        ? `빈칸 「${blankText}」 지정 · 연결 후보: ${matchMark.englishText}${
            particle ? ` (조사 「${particle}」 제외)` : ""
          }`
        : `빈칸 「${blankText}」 지정${
            particle ? ` (조사 「${particle}」 제외)` : ""
          }`
    );
    sel.removeAllRanges();
  }

  async function handleSave() {
    const hard = validationIssues.filter((x) => !x.includes("(경고)"));
    if (hard.length > 0) {
      setMessage(hard[0]!);
      return;
    }
    setLoading(true);
    setMessage(null);
    const orderedBlanks = [...blanks]
      .sort((a, b) => a.korean_start - b.korean_start || a.blank_order - b.blank_order)
      .map((b, i) => ({ ...b, blank_order: i + 1 }));
    const result = await saveKoreanBlanksAction(passageId, orderedBlanks);
    setLoading(false);
    if (!result.ok) {
      setMessage(result.message);
      return;
    }
    setWarnings(result.warnings ?? []);
    setMessage(`${result.count}개 빈칸을 저장했습니다.`);
  }

  async function handlePropose() {
    setLoading(true);
    setMessage(null);
    const result = await proposeBlanksFromVocabAction(passageId);
    setLoading(false);
    if (!result.ok) {
      setMessage(result.message);
      return;
    }
    if (result.proposals.length === 0) {
      setMessage("제안할 1단계 어휘가 없습니다.");
      return;
    }
    setBlanks(
      result.proposals.map((p, i) => ({
        ...p,
        localKey: `prop-${i}-${p.sentence_id}-${p.korean_start}`,
      }))
    );
    setMessage(
      `${result.proposals.length}개 빈칸을 제안했습니다. 검토 후 「제안 적용(저장)」을 누르세요.`
    );
  }

  async function handlePublish(next: boolean) {
    setLoading(true);
    const result = await setStage2PublishedAction(passageId, next);
    setLoading(false);
    if (!result.ok) {
      setMessage(result.message);
      return;
    }
    setPublished(next);
    setMessage(next ? "2단계를 공개했습니다." : "2단계를 비공개로 전환했습니다.");
  }

  return (
    <div className="ui-section-card space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="font-semibold text-slate-900">
            2단계 · 우리말 빈칸 완성하기
          </h3>
          <p className="text-xs text-slate-500">
            우리말에서 드래그 선택 → 빈칸 지정. 원본 해석은 변경되지 않습니다.
            {published ? " · 공개됨" : " · 비공개"}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={loading}
            onClick={() => setPreview((v) => !v)}
          >
            {preview ? "편집으로" : "학생 미리보기"}
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={loading}
            onClick={() => void handlePropose()}
          >
            1단계 어휘 기준으로 빈칸 제안
          </Button>
          <Button
            type="button"
            size="sm"
            disabled={loading}
            onClick={() => void handleSave()}
          >
            {loading ? "처리 중…" : "제안 적용(저장)"}
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={loading}
            onClick={() => void handlePublish(!published)}
          >
            {published ? "비공개" : "2단계 공개"}
          </Button>
        </div>
      </div>

      {message && (
        <p className="text-sm text-slate-700" role="status">
          {message}
        </p>
      )}
      {warnings.length > 0 && (
        <ul className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
          {warnings.map((w) => (
            <li key={w}>{w}</li>
          ))}
        </ul>
      )}
      {validationIssues.length > 0 && (
        <div className="max-h-28 overflow-auto rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
          검수 {validationIssues.length}건 — {validationIssues[0]}
        </div>
      )}

      {preview ? (
        <div className="space-y-3 rounded-xl border border-indigo-100 bg-indigo-50/40 p-4">
          <p className="text-sm font-semibold text-indigo-900">
            학생 화면 미리보기 (정답 표시는 강사 전용)
          </p>
          {ordered.map((s) => {
            const list = blanks
              .filter((b) => b.sentence_id === s.id)
              .map((b, i) => ({
                id: b.localKey,
                korean_start: b.korean_start,
                korean_end: b.korean_end,
                answer: b.answer_text,
              }));
            const slots = buildKoreanWithBlankSlots(
              s.korean_text ?? "",
              list.map((b) => ({
                id: b.id,
                korean_start: b.korean_start,
                korean_end: b.korean_end,
              }))
            );
            return (
              <div
                key={s.id}
                className="rounded-lg border border-white bg-white/80 p-3 text-sm"
              >
                <p className="text-xs text-slate-400">{s.sentence_order}.</p>
                <p className="mt-1 font-medium text-slate-900">
                  {s.english_text}
                </p>
                <p className="mt-2 leading-relaxed text-slate-700">
                  {slots.map((seg, i) =>
                    seg.type === "text" ? (
                      <span key={i}>{seg.text}</span>
                    ) : (
                      <span
                        key={i}
                        className="mx-0.5 inline-block min-w-[3rem] rounded border border-dashed border-indigo-300 bg-indigo-50 px-1 text-center text-xs text-indigo-700"
                      >
                        [{list.find((b) => b.id === seg.blankId)?.answer}]
                      </span>
                    )
                  )}
                </p>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[220px_1fr]">
          <ul className="max-h-[28rem] space-y-1 overflow-auto">
            {ordered.map((s) => {
              const count = blanks.filter((b) => b.sentence_id === s.id).length;
              return (
                <li key={s.id}>
                  <button
                    type="button"
                    className={`w-full rounded-lg border px-3 py-2 text-left text-sm ${
                      activeSentenceId === s.id
                        ? "border-brand-500 bg-brand-50"
                        : "border-slate-200 bg-white"
                    }`}
                    onClick={() => setActiveSentenceId(s.id)}
                  >
                    {s.sentence_order}번 · 빈칸 {count}
                  </button>
                </li>
              );
            })}
          </ul>

          {activeSentence && (
            <div className="space-y-3">
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="text-xs font-medium text-slate-500">영어 원문</p>
                <p className="mt-1 text-sm text-slate-900">
                  {activeSentence.english_text}
                </p>
                <p className="mt-3 text-xs font-medium text-slate-500">
                  우리말 해석 (드래그 선택)
                </p>
                <p
                  ref={koreanRef}
                  className="mt-1 select-text text-sm leading-relaxed text-slate-800"
                >
                  {activeSentence.korean_text || (
                    <span className="text-slate-400">해석 없음</span>
                  )}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button type="button" size="sm" onClick={captureSelection}>
                    빈칸 지정
                  </Button>
                </div>
                {parseVocabMarks(activeSentence.vocabulary).length > 0 && (
                  <p className="mt-2 text-xs text-slate-500">
                    1단계 어휘:{" "}
                    {parseVocabMarks(activeSentence.vocabulary)
                      .map((m) => `${m.englishText}↔${m.koreanText}`)
                      .join(" · ")}
                  </p>
                )}
              </div>

              <ul className="space-y-2">
                {sentenceBlanks.map((b) => (
                  <li
                    key={b.localKey}
                    className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="font-medium text-slate-900">
                          정답: {b.answer_text}
                          <span className="ml-2 text-xs font-normal text-slate-500">
                            [{b.korean_start}, {b.korean_end})
                          </span>
                        </p>
                        <label className="mt-2 block text-xs text-slate-600">
                          연결 영어
                          <input
                            className="mt-1 w-full rounded border border-slate-200 px-2 py-1"
                            value={b.linked_english_text ?? ""}
                            onChange={(e) =>
                              setBlanks((prev) =>
                                prev.map((x) =>
                                  x.localKey === b.localKey
                                    ? {
                                        ...x,
                                        linked_english_text:
                                          e.target.value || null,
                                      }
                                    : x
                                )
                              )
                            }
                          />
                        </label>
                        <label className="mt-2 block text-xs text-slate-600">
                          복수 정답 (쉼표 구분)
                          <input
                            className="mt-1 w-full rounded border border-slate-200 px-2 py-1"
                            value={(b.accepted_answers ?? []).join(", ")}
                            onChange={(e) =>
                              setBlanks((prev) =>
                                prev.map((x) =>
                                  x.localKey === b.localKey
                                    ? {
                                        ...x,
                                        accepted_answers: e.target.value
                                          .split(",")
                                          .map((s) => s.trim())
                                          .filter(Boolean),
                                      }
                                    : x
                                )
                              )
                            }
                          />
                        </label>
                        <label className="mt-2 block text-xs text-slate-600">
                          힌트
                          <input
                            className="mt-1 w-full rounded border border-slate-200 px-2 py-1"
                            value={b.hint ?? ""}
                            onChange={(e) =>
                              setBlanks((prev) =>
                                prev.map((x) =>
                                  x.localKey === b.localKey
                                    ? { ...x, hint: e.target.value }
                                    : x
                                )
                              )
                            }
                          />
                        </label>
                      </div>
                      <button
                        type="button"
                        className="text-xs text-red-600 hover:underline"
                        onClick={() =>
                          setBlanks((prev) =>
                            prev.filter((x) => x.localKey !== b.localKey)
                          )
                        }
                      >
                        삭제
                      </button>
                    </div>
                  </li>
                ))}
                {sentenceBlanks.length === 0 && (
                  <p className="text-xs text-slate-500">
                    이 문장에 지정된 빈칸이 없습니다.
                  </p>
                )}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
