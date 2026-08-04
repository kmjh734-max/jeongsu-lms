"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import {
  saveStage5ItemsAction,
  setStage5PublishedAction,
} from "@/lib/exam-prep/stage5-staff-actions";
import {
  STAGE5_GRAMMAR_CATEGORIES,
  STAGE5_GRAMMAR_LABELS,
  buildEnglishWithVerbSlots,
  collectStage5Warnings,
  formatCueDisplay,
  parseCueWords,
  validateStage5ItemAgainstText,
  type ExamStage5Item,
  type Stage5GrammarCategory,
  type Stage5ItemDraft,
} from "@/lib/exam-prep/stage5-types";
import type { ExamPassageSentence } from "@/lib/exam-prep/types";

type LocalItem = Stage5ItemDraft & { localKey: string };

function toLocal(rows: ExamStage5Item[]): LocalItem[] {
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
    cue_words: parseCueWords(b.cue_words),
    grammar_category: Array.isArray(b.grammar_category)
      ? b.grammar_category
      : [],
    hint: b.hint,
    explanation: b.explanation,
    is_required: b.is_required,
    case_sensitive: b.case_sensitive,
    ignore_extra_spaces: b.ignore_extra_spaces,
    ignore_punctuation: b.ignore_punctuation,
  }));
}

export function Stage5VerbFormEditor({
  passageId,
  sentences,
  initialItems,
  initiallyPublished,
}: {
  passageId: string;
  sentences: ExamPassageSentence[];
  initialItems: ExamStage5Item[];
  initiallyPublished: boolean;
}) {
  const ordered = useMemo(
    () => [...sentences].sort((a, b) => a.sentence_order - b.sentence_order),
    [sentences]
  );
  const [items, setItems] = useState(() => toLocal(initialItems));
  const [published, setPublished] = useState(initiallyPublished);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [preview, setPreview] = useState(false);
  const [activeSentenceId, setActiveSentenceId] = useState(ordered[0]?.id ?? "");
  const [cueInput, setCueInput] = useState("");
  const englishRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    setItems(toLocal(initialItems));
  }, [initialItems]);

  const activeSentence = ordered.find((s) => s.id === activeSentenceId);
  const sentenceItems = items
    .filter((b) => b.sentence_id === activeSentenceId)
    .sort((a, b) => a.english_start - b.english_start);

  const validationIssues = useMemo(() => {
    const issues: string[] = [];
    for (const s of ordered) {
      const english = s.english_text ?? "";
      const list = items.filter((b) => b.sentence_id === s.id);
      for (const b of list) {
        const err = validateStage5ItemAgainstText(english, b);
        if (err) issues.push(`${s.sentence_order}번: ${err}`);
      }
      issues.push(
        ...collectStage5Warnings(english, list).map(
          (w) => `${s.sentence_order}번: ${w}`
        )
      );
      if (list.length === 0) {
        issues.push(`${s.sentence_order}번: 동사형 항목 없음 (경고)`);
      }
    }
    if (items.filter((i) => i.is_required !== false).length === 0) {
      issues.push("지문 전체에 필수 항목이 없습니다. 공개할 수 없습니다.");
    }
    return issues;
  }, [items, ordered]);

  function captureSelection() {
    if (!activeSentence) return;
    const el = englishRef.current;
    const sel = window.getSelection();
    if (!el || !sel || sel.rangeCount === 0 || sel.isCollapsed) {
      setMessage("영어 원문에서 정답 구간을 드래그해 선택하세요.");
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

    const draft: LocalItem = {
      localKey: `new-${Date.now()}`,
      sentence_id: activeSentence.id,
      blank_order: items.length + 1,
      answer_text: selected,
      selected_text: selected,
      accepted_answers: [],
      english_start: start,
      english_end: end,
      cue_words: [],
      grammar_category: [],
      hint: "",
      explanation: "",
      is_required: true,
      case_sensitive: false,
      ignore_extra_spaces: true,
      ignore_punctuation: false,
    };
    setItems((prev) => [...prev, draft]);
    setMessage(`정답 「${selected}」를 지정했습니다. 제시어를 입력하세요.`);
    sel.removeAllRanges();
  }

  function updateItem(localKey: string, patch: Partial<LocalItem>) {
    setItems((prev) =>
      prev.map((b) => (b.localKey === localKey ? { ...b, ...patch } : b))
    );
  }

  function removeItem(localKey: string) {
    setItems((prev) => prev.filter((b) => b.localKey !== localKey));
  }

  function addCue(localKey: string, word: string) {
    const w = word.trim();
    if (!w) return;
    setItems((prev) =>
      prev.map((b) =>
        b.localKey === localKey
          ? { ...b, cue_words: [...b.cue_words, w] }
          : b
      )
    );
    setCueInput("");
  }

  function removeCue(localKey: string, index: number) {
    setItems((prev) =>
      prev.map((b) =>
        b.localKey === localKey
          ? {
              ...b,
              cue_words: b.cue_words.filter((_, i) => i !== index),
            }
          : b
      )
    );
  }

  function moveCue(localKey: string, index: number, dir: -1 | 1) {
    setItems((prev) =>
      prev.map((b) => {
        if (b.localKey !== localKey) return b;
        const next = [...b.cue_words];
        const j = index + dir;
        if (j < 0 || j >= next.length) return b;
        const tmp = next[index]!;
        next[index] = next[j]!;
        next[j] = tmp;
        return { ...b, cue_words: next };
      })
    );
  }

  function toggleCategory(localKey: string, cat: Stage5GrammarCategory) {
    setItems((prev) =>
      prev.map((b) => {
        if (b.localKey !== localKey) return b;
        const has = b.grammar_category.includes(cat);
        return {
          ...b,
          grammar_category: has
            ? b.grammar_category.filter((c) => c !== cat)
            : [...b.grammar_category, cat],
        };
      })
    );
  }

  async function handleSave() {
    setLoading(true);
    setMessage(null);
    const drafts: Stage5ItemDraft[] = items.map((b, i) => ({
      id: b.id,
      sentence_id: b.sentence_id,
      blank_order: i + 1,
      answer_text: b.answer_text,
      accepted_answers: b.accepted_answers,
      english_start: b.english_start,
      english_end: b.english_end,
      selected_text: b.selected_text,
      cue_words: b.cue_words,
      grammar_category: b.grammar_category,
      hint: b.hint,
      explanation: b.explanation,
      is_required: b.is_required,
      case_sensitive: b.case_sensitive,
      ignore_extra_spaces: b.ignore_extra_spaces,
      ignore_punctuation: b.ignore_punctuation,
    }));
    const result = await saveStage5ItemsAction(passageId, drafts);
    setLoading(false);
    if (!result.ok) {
      setMessage(result.message);
      return;
    }
    setMessage(
      `저장됨 (${result.count}개)${
        result.warnings?.length
          ? ` · 경고 ${result.warnings.length}건`
          : ""
      }`
    );
  }

  async function handlePublish(next: boolean) {
    setLoading(true);
    setMessage(null);
    const result = await setStage5PublishedAction(passageId, next);
    setLoading(false);
    if (!result.ok) {
      setMessage(result.message);
      return;
    }
    setPublished(next);
    setMessage(next ? "5단계를 공개했습니다." : "5단계를 비공개로 전환했습니다.");
  }

  return (
    <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-base font-semibold text-slate-900">
            5단계 · 동사형 연습하기
          </h3>
          <p className="text-xs text-slate-500">
            원문 구간을 선택하고 괄호 제시어를 배열로 설정합니다. AI 자동 생성 없음.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="secondary" onClick={() => setPreview((p) => !p)}>
            {preview ? "편집" : "학생 미리보기"}
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

      {message && (
        <p className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700">
          {message}
        </p>
      )}

      {validationIssues.length > 0 && (
        <ul className="max-h-40 list-disc space-y-1 overflow-y-auto rounded-lg border border-amber-200 bg-amber-50 px-5 py-2 text-xs text-amber-900">
          {validationIssues.slice(0, 30).map((w) => (
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
              s.id === activeSentenceId
                ? "bg-slate-900 text-white"
                : "bg-slate-100 text-slate-700"
            }`}
            onClick={() => setActiveSentenceId(s.id)}
          >
            {s.sentence_order}번
            {items.some((i) => i.sentence_id === s.id) ? " ·" : ""}
          </button>
        ))}
      </div>

      {activeSentence && !preview && (
        <div className="space-y-3">
          <p className="text-sm text-slate-600">
            {activeSentence.korean_text || "(해석 없음)"}
          </p>
          <p
            ref={englishRef}
            className="select-text rounded-lg border border-slate-200 bg-slate-50 p-3 font-mono text-sm leading-relaxed text-slate-900"
          >
            {activeSentence.english_text}
          </p>
          <Button type="button" onClick={captureSelection}>
            동사형 문제로 지정
          </Button>

          <div className="space-y-4">
            {sentenceItems.map((item) => (
              <div
                key={item.localKey}
                className="space-y-3 rounded-lg border border-slate-200 p-3"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="text-xs text-slate-500">
                      [{item.english_start}, {item.english_end})
                    </p>
                    <p className="font-mono text-sm font-semibold text-slate-900">
                      {item.answer_text}
                    </p>
                    <p className="mt-1 text-sm text-teal-800">
                      ({formatCueDisplay(item.cue_words) || "제시어 없음"})
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => removeItem(item.localKey)}
                  >
                    삭제
                  </Button>
                </div>

                <div>
                  <p className="mb-1 text-xs font-medium text-slate-600">제시어</p>
                  <div className="flex flex-wrap gap-1">
                    {item.cue_words.map((c, i) => (
                      <span
                        key={`${c}-${i}`}
                        className="inline-flex items-center gap-1 rounded-full bg-teal-50 px-2 py-0.5 text-xs text-teal-900"
                      >
                        {c}
                        <button type="button" onClick={() => moveCue(item.localKey, i, -1)}>
                          ↑
                        </button>
                        <button type="button" onClick={() => moveCue(item.localKey, i, 1)}>
                          ↓
                        </button>
                        <button type="button" onClick={() => removeCue(item.localKey, i)}>
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="mt-2 flex gap-2">
                    <input
                      className="flex-1 rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
                      value={cueInput}
                      onChange={(e) => setCueInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addCue(item.localKey, cueInput);
                        }
                      }}
                      placeholder="제시어 입력 후 Enter"
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => addCue(item.localKey, cueInput)}
                    >
                      추가
                    </Button>
                  </div>
                </div>

                <div>
                  <p className="mb-1 text-xs font-medium text-slate-600">문법 유형</p>
                  <div className="flex flex-wrap gap-1">
                    {STAGE5_GRAMMAR_CATEGORIES.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        className={`rounded-full px-2 py-0.5 text-xs ${
                          item.grammar_category.includes(cat)
                            ? "bg-slate-900 text-white"
                            : "bg-slate-100 text-slate-700"
                        }`}
                        onClick={() => toggleCategory(item.localKey, cat)}
                      >
                        {STAGE5_GRAMMAR_LABELS[cat]}
                      </button>
                    ))}
                  </div>
                </div>

                <label className="block text-xs text-slate-600">
                  허용 정답 (쉼표 구분)
                  <input
                    className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
                    value={(item.accepted_answers ?? []).join(", ")}
                    onChange={(e) =>
                      updateItem(item.localKey, {
                        accepted_answers: e.target.value
                          .split(",")
                          .map((x) => x.trim())
                          .filter(Boolean),
                      })
                    }
                  />
                </label>
                <label className="block text-xs text-slate-600">
                  힌트
                  <input
                    className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
                    value={item.hint ?? ""}
                    onChange={(e) =>
                      updateItem(item.localKey, { hint: e.target.value })
                    }
                  />
                </label>
                <label className="block text-xs text-slate-600">
                  해설
                  <textarea
                    rows={2}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
                    value={item.explanation ?? ""}
                    onChange={(e) =>
                      updateItem(item.localKey, { explanation: e.target.value })
                    }
                  />
                </label>
                <label className="flex items-center gap-2 text-xs text-slate-600">
                  <input
                    type="checkbox"
                    checked={item.is_required !== false}
                    onChange={(e) =>
                      updateItem(item.localKey, { is_required: e.target.checked })
                    }
                  />
                  필수 문제
                </label>
                <label className="flex items-center gap-2 text-xs text-slate-600">
                  <input
                    type="checkbox"
                    checked={Boolean(item.case_sensitive)}
                    onChange={(e) =>
                      updateItem(item.localKey, {
                        case_sensitive: e.target.checked,
                      })
                    }
                  />
                  대소문자 구분
                </label>
              </div>
            ))}
          </div>
        </div>
      )}

      {preview && (
        <div className="space-y-4">
          {ordered.map((s) => {
            const list = items
              .filter((b) => b.sentence_id === s.id)
              .sort((a, b) => a.english_start - b.english_start);
            if (list.length === 0) return null;
            const slots = buildEnglishWithVerbSlots(
              s.english_text ?? "",
              list.map((b) => ({
                id: b.localKey,
                english_start: b.english_start,
                english_end: b.english_end,
              }))
            );
            return (
              <article
                key={s.id}
                className="rounded-lg border border-slate-200 p-3 text-sm"
              >
                <p className="text-xs text-slate-400">{s.sentence_order}.</p>
                <p className="mt-1 text-slate-700">{s.korean_text}</p>
                <p className="mt-2 leading-relaxed text-slate-900">
                  {slots.map((seg, i) =>
                    seg.type === "text" ? (
                      <span key={i}>{seg.text}</span>
                    ) : (
                      <span
                        key={seg.itemId}
                        className="mx-0.5 inline-block rounded bg-teal-50 px-1 font-medium text-teal-900"
                      >
                        (
                        {formatCueDisplay(
                          list.find((x) => x.localKey === seg.itemId)
                            ?.cue_words ?? []
                        )}
                        )
                      </span>
                    )
                  )}
                </p>
                <div className="mt-2 space-y-2">
                  {list.map((item, idx) => (
                    <div key={item.localKey} className="text-xs text-slate-600">
                      {idx + 1}. ({formatCueDisplay(item.cue_words)}) →{" "}
                      <span className="font-mono text-slate-900">
                        {item.answer_text}
                      </span>
                    </div>
                  ))}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
