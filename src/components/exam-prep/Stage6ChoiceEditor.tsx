"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import {
  saveStage6ItemsAction,
  setStage6PublishedAction,
} from "@/lib/exam-prep/stage6-staff-actions";
import {
  STAGE6_GRAMMAR_SUBS,
  STAGE6_GRAMMAR_SUB_LABELS,
  STAGE6_VOCAB_SUBS,
  STAGE6_VOCAB_SUB_LABELS,
  buildEnglishWithChoiceSlots,
  collectStage6Warnings,
  newOptionId,
  parseChoiceOptions,
  validateStage6ItemAgainstText,
  type ExamStage6Item,
  type Stage6ChoiceOption,
  type Stage6GrammarSub,
  type Stage6ItemDraft,
  type Stage6VocabSub,
} from "@/lib/exam-prep/stage6-types";
import type { ExamPassageSentence } from "@/lib/exam-prep/types";

type LocalItem = Stage6ItemDraft & { localKey: string };

function toLocal(rows: ExamStage6Item[]): LocalItem[] {
  return rows.map((b) => ({
    localKey: b.id,
    id: b.id,
    sentence_id: b.sentence_id,
    blank_order: b.blank_order,
    answer_text: b.answer_text,
    english_start: b.english_start,
    english_end: b.english_end,
    selected_text: b.selected_text || b.answer_text,
    choice_options: parseChoiceOptions(b.choice_options),
    question_category: (b.question_category ?? "grammar") as
      | "grammar"
      | "vocabulary",
    grammar_subcategory: b.grammar_subcategory ?? [],
    vocabulary_subcategory: b.vocabulary_subcategory ?? [],
    shuffle_options: b.shuffle_options !== false,
    hint: b.hint,
    explanation: b.explanation,
    is_required: b.is_required,
  }));
}

export function Stage6ChoiceEditor({
  passageId,
  sentences,
  initialItems,
  initiallyPublished,
}: {
  passageId: string;
  sentences: ExamPassageSentence[];
  initialItems: ExamStage6Item[];
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
        const err = validateStage6ItemAgainstText(english, b);
        if (err) issues.push(`${s.sentence_order}번: ${err}`);
      }
      issues.push(
        ...collectStage6Warnings(english, list).map(
          (w) => `${s.sentence_order}번: ${w}`
        )
      );
      if (list.length === 0) {
        issues.push(`${s.sentence_order}번: 선택형 항목 없음 (경고)`);
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

    const correct: Stage6ChoiceOption = {
      id: newOptionId(),
      text: selected,
      isCorrect: true,
      explanation: "",
    };
    const wrong: Stage6ChoiceOption = {
      id: newOptionId(),
      text: "",
      isCorrect: false,
      explanation: "",
    };
    const draft: LocalItem = {
      localKey: `new-${Date.now()}`,
      sentence_id: activeSentence.id,
      blank_order: items.length + 1,
      answer_text: selected,
      selected_text: selected,
      english_start: start,
      english_end: end,
      choice_options: [correct, wrong],
      question_category: "grammar",
      grammar_subcategory: [],
      vocabulary_subcategory: [],
      shuffle_options: true,
      hint: "",
      explanation: "",
      is_required: true,
    };
    setItems((prev) => [...prev, draft]);
    setMessage(`정답 「${selected}」를 지정했습니다. 오답 선택지를 입력하세요.`);
    sel.removeAllRanges();
  }

  function updateItem(localKey: string, patch: Partial<LocalItem>) {
    setItems((prev) =>
      prev.map((b) => (b.localKey === localKey ? { ...b, ...patch } : b))
    );
  }

  function updateOption(
    localKey: string,
    optionId: string,
    patch: Partial<Stage6ChoiceOption>
  ) {
    setItems((prev) =>
      prev.map((b) => {
        if (b.localKey !== localKey) return b;
        return {
          ...b,
          choice_options: b.choice_options.map((o) =>
            o.id === optionId ? { ...o, ...patch } : o
          ),
        };
      })
    );
  }

  function setCorrectOption(localKey: string, optionId: string) {
    setItems((prev) =>
      prev.map((b) => {
        if (b.localKey !== localKey) return b;
        return {
          ...b,
          choice_options: b.choice_options.map((o) => ({
            ...o,
            isCorrect: o.id === optionId,
          })),
          answer_text:
            b.choice_options.find((o) => o.id === optionId)?.text ||
            b.answer_text,
        };
      })
    );
  }

  async function handleSave() {
    setLoading(true);
    setMessage(null);
    const drafts: Stage6ItemDraft[] = items.map((b, i) => ({
      id: b.id,
      sentence_id: b.sentence_id,
      blank_order: i + 1,
      answer_text: b.answer_text,
      english_start: b.english_start,
      english_end: b.english_end,
      selected_text: b.selected_text,
      choice_options: b.choice_options,
      question_category: b.question_category,
      grammar_subcategory: b.grammar_subcategory,
      vocabulary_subcategory: b.vocabulary_subcategory,
      shuffle_options: b.shuffle_options,
      hint: b.hint,
      explanation: b.explanation,
      is_required: b.is_required,
    }));
    const result = await saveStage6ItemsAction(passageId, drafts);
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
    setMessage(null);
    const result = await setStage6PublishedAction(passageId, next);
    setLoading(false);
    if (!result.ok) {
      setMessage(result.message);
      return;
    }
    setPublished(next);
    setMessage(next ? "6단계를 공개했습니다." : "6단계를 비공개로 전환했습니다.");
  }

  return (
    <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-base font-semibold text-slate-900">
            6단계 · 어법·어휘 고르기
          </h3>
          <p className="text-xs text-slate-500">
            원문 구간을 정답으로 두고 오답 선택지를 직접 입력합니다. AI 자동 생성 없음.
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
            className="select-text rounded-lg border border-slate-200 bg-slate-50 p-3 font-mono text-sm leading-relaxed"
          >
            {activeSentence.english_text}
          </p>
          <Button type="button" onClick={captureSelection}>
            어법·어휘 문제로 지정
          </Button>

          {sentenceItems.map((item) => (
            <div
              key={item.localKey}
              className="space-y-3 rounded-lg border border-slate-200 p-3"
            >
              <div className="flex justify-between gap-2">
                <div>
                  <p className="text-xs text-slate-500">
                    [{item.english_start}, {item.english_end})
                  </p>
                  <p className="font-mono text-sm font-semibold">
                    {item.answer_text}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() =>
                    setItems((prev) =>
                      prev.filter((b) => b.localKey !== item.localKey)
                    )
                  }
                >
                  삭제
                </Button>
              </div>

              <div className="flex flex-wrap gap-2 text-xs">
                <button
                  type="button"
                  className={`rounded-full px-3 py-1 ${
                    item.question_category === "grammar"
                      ? "bg-slate-900 text-white"
                      : "bg-slate-100"
                  }`}
                  onClick={() =>
                    updateItem(item.localKey, { question_category: "grammar" })
                  }
                >
                  어법
                </button>
                <button
                  type="button"
                  className={`rounded-full px-3 py-1 ${
                    item.question_category === "vocabulary"
                      ? "bg-slate-900 text-white"
                      : "bg-slate-100"
                  }`}
                  onClick={() =>
                    updateItem(item.localKey, {
                      question_category: "vocabulary",
                    })
                  }
                >
                  어휘
                </button>
              </div>

              <div className="flex flex-wrap gap-1">
                {(item.question_category === "grammar"
                  ? STAGE6_GRAMMAR_SUBS
                  : STAGE6_VOCAB_SUBS
                ).map((cat) => {
                  const list =
                    item.question_category === "grammar"
                      ? item.grammar_subcategory
                      : item.vocabulary_subcategory;
                  const label =
                    item.question_category === "grammar"
                      ? STAGE6_GRAMMAR_SUB_LABELS[cat as Stage6GrammarSub]
                      : STAGE6_VOCAB_SUB_LABELS[cat as Stage6VocabSub];
                  const on = list.includes(cat);
                  return (
                    <button
                      key={cat}
                      type="button"
                      className={`rounded-full px-2 py-0.5 text-xs ${
                        on ? "bg-violet-700 text-white" : "bg-slate-100"
                      }`}
                      onClick={() => {
                        if (item.question_category === "grammar") {
                          updateItem(item.localKey, {
                            grammar_subcategory: on
                              ? list.filter((c) => c !== cat)
                              : [...list, cat],
                          });
                        } else {
                          updateItem(item.localKey, {
                            vocabulary_subcategory: on
                              ? list.filter((c) => c !== cat)
                              : [...list, cat],
                          });
                        }
                      }}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>

              <div className="space-y-2">
                <p className="text-xs font-medium text-slate-600">선택지</p>
                {item.choice_options.map((o, idx) => (
                  <div
                    key={o.id}
                    className="flex flex-wrap items-center gap-2 rounded border border-slate-100 p-2"
                  >
                    <span className="text-xs text-slate-400">{idx + 1}</span>
                    <input
                      className="min-w-[10rem] flex-1 rounded border border-slate-200 px-2 py-1 text-sm font-mono"
                      value={o.text}
                      onChange={(e) =>
                        updateOption(item.localKey, o.id, {
                          text: e.target.value,
                        })
                      }
                      placeholder={o.isCorrect ? "정답(원문)" : "오답"}
                    />
                    <label className="flex items-center gap-1 text-xs">
                      <input
                        type="radio"
                        name={`correct-${item.localKey}`}
                        checked={o.isCorrect}
                        onChange={() => setCorrectOption(item.localKey, o.id)}
                      />
                      정답
                    </label>
                    <Button
                      type="button"
                      variant="secondary"
                      disabled={item.choice_options.length <= 2}
                      onClick={() =>
                        updateItem(item.localKey, {
                          choice_options: item.choice_options.filter(
                            (x) => x.id !== o.id
                          ),
                        })
                      }
                    >
                      삭제
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() =>
                    updateItem(item.localKey, {
                      choice_options: [
                        ...item.choice_options,
                        {
                          id: newOptionId(),
                          text: "",
                          isCorrect: false,
                          explanation: "",
                        },
                      ],
                    })
                  }
                >
                  선택지 추가
                </Button>
              </div>

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
              <label className="flex items-center gap-2 text-xs">
                <input
                  type="checkbox"
                  checked={item.shuffle_options !== false}
                  onChange={(e) =>
                    updateItem(item.localKey, {
                      shuffle_options: e.target.checked,
                    })
                  }
                />
                선택지 섞기
              </label>
              <label className="flex items-center gap-2 text-xs">
                <input
                  type="checkbox"
                  checked={item.is_required !== false}
                  onChange={(e) =>
                    updateItem(item.localKey, { is_required: e.target.checked })
                  }
                />
                필수 문제
              </label>
            </div>
          ))}
        </div>
      )}

      {preview && (
        <div className="space-y-4">
          {ordered.map((s) => {
            const list = items
              .filter((b) => b.sentence_id === s.id)
              .sort((a, b) => a.english_start - b.english_start);
            if (list.length === 0) return null;
            const slots = buildEnglishWithChoiceSlots(
              s.english_text ?? "",
              list.map((b) => ({
                id: b.localKey,
                english_start: b.english_start,
                english_end: b.english_end,
              }))
            );
            return (
              <article key={s.id} className="rounded-lg border p-3 text-sm">
                <p className="text-xs text-slate-400">{s.sentence_order}.</p>
                <p className="mt-1 text-slate-700">{s.korean_text}</p>
                <p className="mt-2 leading-relaxed">
                  {slots.map((seg, i) =>
                    seg.type === "text" ? (
                      <span key={i}>{seg.text}</span>
                    ) : (
                      <span
                        key={seg.itemId}
                        className="mx-0.5 rounded bg-violet-50 px-1 font-medium text-violet-900"
                      >
                        [
                        {(
                          list.find((x) => x.localKey === seg.itemId)
                            ?.choice_options ?? []
                        )
                          .map((o) => o.text || "…")
                          .join(" / ")}
                        ]
                      </span>
                    )
                  )}
                </p>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
