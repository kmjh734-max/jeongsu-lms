"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import {
  proposeStage3FromStage2Action,
  proposeStage3FromVocabAction,
  saveStage3BlanksAction,
  setStage3PublishedAction,
} from "@/lib/exam-prep/stage3-staff-actions";
import {
  buildEnglishWithBlankSlots,
  collectEnglishBlankWarnings,
  validateEnglishBlankAgainstText,
  type ExamStage3Blank,
  type Stage3BlankDraft,
} from "@/lib/exam-prep/stage3-types";
import { parseVocabMarks } from "@/lib/exam-prep/vocab-marks";
import type { ExamPassageSentence } from "@/lib/exam-prep/types";

type LocalBlank = Stage3BlankDraft & { localKey: string };

function toLocal(rows: ExamStage3Blank[]): LocalBlank[] {
  return rows.map((b) => ({
    localKey: b.id,
    id: b.id,
    sentence_id: b.sentence_id,
    blank_order: b.blank_order,
    answer_text: b.answer_text,
    accepted_answers: b.accepted_answers ?? [],
    english_start: b.english_start,
    english_end: b.english_end,
    selected_text: b.selected_text || b.answer_text,
    linked_vocabulary_mark_id: b.linked_vocabulary_mark_id,
    linked_korean_text: b.linked_korean_text,
    linked_korean_start: b.linked_korean_start,
    linked_korean_end: b.linked_korean_end,
    hint: b.hint,
    explanation: b.explanation,
    is_required: b.is_required,
    case_sensitive: b.case_sensitive,
    ignore_extra_spaces: b.ignore_extra_spaces,
    ignore_punctuation: b.ignore_punctuation,
  }));
}

export function Stage3BlankEditor({
  passageId,
  sentences,
  initialBlanks,
  initiallyPublished,
}: {
  passageId: string;
  sentences: ExamPassageSentence[];
  initialBlanks: ExamStage3Blank[];
  initiallyPublished: boolean;
}) {
  const ordered = useMemo(
    () => [...sentences].sort((a, b) => a.sentence_order - b.sentence_order),
    [sentences]
  );
  const [blanks, setBlanks] = useState(() => toLocal(initialBlanks));
  const [published, setPublished] = useState(initiallyPublished);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [preview, setPreview] = useState(false);
  const [activeSentenceId, setActiveSentenceId] = useState(
    ordered[0]?.id ?? ""
  );
  const englishRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    setBlanks(toLocal(initialBlanks));
  }, [initialBlanks]);

  const activeSentence = ordered.find((s) => s.id === activeSentenceId);
  const sentenceBlanks = blanks
    .filter((b) => b.sentence_id === activeSentenceId)
    .sort((a, b) => a.english_start - b.english_start);

  const validationIssues = useMemo(() => {
    const issues: string[] = [];
    for (const s of ordered) {
      const english = s.english_text ?? "";
      const list = blanks.filter((b) => b.sentence_id === s.id);
      for (const b of list) {
        const err = validateEnglishBlankAgainstText(english, b);
        if (err) issues.push(`${s.sentence_order}번: ${err}`);
      }
      issues.push(
        ...collectEnglishBlankWarnings(english, list).map(
          (w) => `${s.sentence_order}번: ${w}`
        )
      );
      if (list.length === 0) {
        issues.push(`${s.sentence_order}번: 영문 빈칸 없음 (경고)`);
      }
    }
    if (blanks.length === 0) {
      issues.push("지문 전체에 영문 빈칸이 없습니다. 공개할 수 없습니다.");
    }
    return issues;
  }, [blanks, ordered]);

  function captureSelection() {
    if (!activeSentence) return;
    const el = englishRef.current;
    const sel = window.getSelection();
    if (!el || !sel || sel.rangeCount === 0 || sel.isCollapsed) {
      setMessage("영어 원문에서 빈칸으로 만들 부분을 드래그해 선택하세요.");
      return;
    }
    const range = sel.getRangeAt(0);
    if (!el.contains(range.commonAncestorContainer)) {
      setMessage("현재 문장의 영어 원문 안에서 선택해 주세요.");
      return;
    }
    const english = activeSentence.english_text ?? "";
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
    if (english.slice(start, end) !== selected) {
      setMessage("선택 범위를 다시 확인해 주세요.");
      return;
    }

    const marks = parseVocabMarks(activeSentence.vocabulary);
    const matchMark = marks.find((m) => m.englishText === selected);
    const draft: LocalBlank = {
      localKey: `new-${Date.now()}`,
      sentence_id: activeSentence.id,
      blank_order: blanks.length + 1,
      answer_text: selected,
      selected_text: selected,
      accepted_answers: [],
      english_start: start,
      english_end: end,
      linked_vocabulary_mark_id: matchMark?.id ?? null,
      linked_korean_text: matchMark?.koreanText ?? null,
      hint: matchMark?.meaning ?? "",
      explanation: matchMark
        ? `${matchMark.englishText}: ${matchMark.koreanText}`
        : "",
      is_required: true,
      case_sensitive: false,
      ignore_extra_spaces: true,
      ignore_punctuation: false,
    };
    setBlanks((prev) => [...prev, draft]);
    setMessage(
      matchMark
        ? `영문 빈칸 「${selected}」 지정 · 우리말 후보: ${matchMark.koreanText}`
        : `영문 빈칸 「${selected}」 지정`
    );
    sel.removeAllRanges();
  }

  async function handleSave() {
    const hard = validationIssues.filter(
      (x) => !x.includes("(경고)") && !x.includes("일부만") && !x.includes("60%")
    );
    if (hard.some((x) => x.includes("일치하지") || x.includes("올바르지") || x.includes("공백") || x.includes("부호"))) {
      setMessage(hard[0]!);
      return;
    }
    const overlap = hard.find((x) => x.includes("겹칩"));
    if (overlap) {
      setMessage(overlap);
      return;
    }
    setLoading(true);
    setMessage(null);
    const orderedBlanks = [...blanks]
      .sort(
        (a, b) =>
          a.english_start - b.english_start || a.blank_order - b.blank_order
      )
      .map((b, i) => ({ ...b, blank_order: i + 1 }));
    const result = await saveStage3BlanksAction(passageId, orderedBlanks);
    setLoading(false);
    if (!result.ok) {
      setMessage(result.message);
      return;
    }
    setWarnings(result.warnings ?? []);
    setMessage(`${result.count}개 영문 빈칸을 저장했습니다.`);
  }

  async function applyProposals(
    kind: "vocab" | "stage2"
  ) {
    setLoading(true);
    setMessage(null);
    const result =
      kind === "vocab"
        ? await proposeStage3FromVocabAction(passageId)
        : await proposeStage3FromStage2Action(passageId);
    setLoading(false);
    if (!result.ok) {
      setMessage(result.message);
      return;
    }
    if (result.proposals.length === 0) {
      setMessage(
        kind === "vocab"
          ? "제안할 1단계 어휘가 없습니다."
          : "2단계 연결 영어 표현으로 제안할 항목이 없습니다."
      );
      return;
    }
    setBlanks(
      result.proposals.map((p, i) => ({
        ...p,
        localKey: `prop-${kind}-${i}-${p.sentence_id}-${p.english_start}`,
      }))
    );
    setMessage(
      `${result.proposals.length}개 빈칸을 제안했습니다. 검토 후 「제안 적용(저장)」을 누르세요.`
    );
  }

  async function handlePublish(next: boolean) {
    setLoading(true);
    const result = await setStage3PublishedAction(passageId, next);
    setLoading(false);
    if (!result.ok) {
      setMessage(result.message);
      return;
    }
    setPublished(next);
    setMessage(next ? "3단계를 공개했습니다." : "3단계를 비공개로 전환했습니다.");
  }

  return (
    <div className="ui-section-card space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="font-semibold text-slate-900">
            3단계 · 영문 빈칸 완성하기
          </h3>
          <p className="text-xs text-slate-500">
            영어 원문에서 드래그 선택 → 영문 빈칸 지정. 원문은 변경되지 않습니다.
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
            onClick={() => void applyProposals("vocab")}
          >
            1단계 어휘 기준 제안
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={loading}
            onClick={() => void applyProposals("stage2")}
          >
            2단계 연결 어휘로 영문 빈칸 제안
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
            {published ? "비공개" : "3단계 공개"}
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
        <div className="space-y-3 rounded-xl border border-teal-100 bg-teal-50/40 p-4">
          <p className="text-sm font-semibold text-teal-900">
            학생 화면 미리보기 (정답 표시는 강사 전용)
          </p>
          {ordered.map((s) => {
            const list = blanks.filter((b) => b.sentence_id === s.id);
            const slots = buildEnglishWithBlankSlots(
              s.english_text ?? "",
              list.map((b) => ({
                id: b.localKey,
                english_start: b.english_start,
                english_end: b.english_end,
              }))
            );
            return (
              <div
                key={s.id}
                className="rounded-lg border border-white bg-white/80 p-3 text-sm"
              >
                <p className="text-xs text-slate-400">{s.sentence_order}.</p>
                <p className="mt-1 text-slate-700">{s.korean_text}</p>
                <p className="mt-2 leading-relaxed text-slate-900">
                  {slots.map((seg, i) =>
                    seg.type === "text" ? (
                      <span key={i}>{seg.text}</span>
                    ) : (
                      <span
                        key={i}
                        className="mx-0.5 inline-block min-w-[3rem] rounded border border-dashed border-teal-300 bg-teal-50 px-1 text-center text-xs text-teal-800"
                      >
                        [
                        {
                          list.find((b) => b.localKey === seg.blankId)
                            ?.answer_text
                        }
                        ]
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
                <p className="text-xs font-medium text-slate-500">우리말 해석</p>
                <p className="mt-1 text-sm text-slate-800">
                  {activeSentence.korean_text || (
                    <span className="text-slate-400">해석 없음</span>
                  )}
                </p>
                <p className="mt-3 text-xs font-medium text-slate-500">
                  영어 원문 (드래그 선택)
                </p>
                <p
                  ref={englishRef}
                  className="mt-1 select-text text-sm leading-relaxed text-slate-900"
                >
                  {activeSentence.english_text}
                </p>
                <div className="mt-3">
                  <Button type="button" size="sm" onClick={captureSelection}>
                    영문 빈칸 지정
                  </Button>
                </div>
              </div>

              <ul className="space-y-2">
                {sentenceBlanks.map((b) => (
                  <li
                    key={b.localKey}
                    className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="min-w-0 flex-1 space-y-2">
                        <p className="font-medium text-slate-900">
                          정답: {b.answer_text}
                          <span className="ml-2 text-xs font-normal text-slate-500">
                            [{b.english_start}, {b.english_end})
                          </span>
                        </p>
                        <label className="block text-xs text-slate-600">
                          연결 우리말
                          <input
                            className="mt-1 w-full rounded border border-slate-200 px-2 py-1"
                            value={b.linked_korean_text ?? ""}
                            onChange={(e) =>
                              setBlanks((prev) =>
                                prev.map((x) =>
                                  x.localKey === b.localKey
                                    ? {
                                        ...x,
                                        linked_korean_text:
                                          e.target.value || null,
                                      }
                                    : x
                                )
                              )
                            }
                          />
                        </label>
                        <label className="block text-xs text-slate-600">
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
                        <label className="block text-xs text-slate-600">
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
                        <div className="flex flex-wrap gap-3 text-xs text-slate-600">
                          <label className="flex items-center gap-1">
                            <input
                              type="checkbox"
                              checked={Boolean(b.case_sensitive)}
                              onChange={(e) =>
                                setBlanks((prev) =>
                                  prev.map((x) =>
                                    x.localKey === b.localKey
                                      ? {
                                          ...x,
                                          case_sensitive: e.target.checked,
                                        }
                                      : x
                                  )
                                )
                              }
                            />
                            대소문자 구분
                          </label>
                          <label className="flex items-center gap-1">
                            <input
                              type="checkbox"
                              checked={b.ignore_extra_spaces !== false}
                              onChange={(e) =>
                                setBlanks((prev) =>
                                  prev.map((x) =>
                                    x.localKey === b.localKey
                                      ? {
                                          ...x,
                                          ignore_extra_spaces: e.target.checked,
                                        }
                                      : x
                                  )
                                )
                              }
                            />
                            여분 공백 허용
                          </label>
                          <label className="flex items-center gap-1">
                            <input
                              type="checkbox"
                              checked={Boolean(b.ignore_punctuation)}
                              onChange={(e) =>
                                setBlanks((prev) =>
                                  prev.map((x) =>
                                    x.localKey === b.localKey
                                      ? {
                                          ...x,
                                          ignore_punctuation: e.target.checked,
                                        }
                                      : x
                                  )
                                )
                              }
                            />
                            문장부호 무시
                          </label>
                        </div>
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
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
