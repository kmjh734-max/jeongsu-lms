"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Icon } from "@/components/layout/NavIcon";
import { Button } from "@/components/ui/Button";
import { BulkPasteModal } from "@/components/vocab/BulkPasteModal";
import { mergeParsedRows, type ParsedVocabRow } from "@/lib/vocab/parse-bulk-paste";
import { fetchGeneratedExamples, type ExampleLevel } from "@/lib/vocab/generate-examples-client";
import { fetchGeneratedRelatedWords } from "@/lib/vocab/generate-related-words-client";
import type { VocabItem } from "@/types/database";

export interface VocabEditorRow {
  rowKey: string;
  id?: string;
  word: string;
  meaning: string;
  example_sentence: string;
  example_meaning: string;
  synonyms: string;
  antonyms: string;
}

type Field = "word" | "meaning" | "example_sentence" | "example_meaning" | "synonyms" | "antonyms";
const FIELDS: Field[] = [
  "word",
  "meaning",
  "example_sentence",
  "example_meaning",
  "synonyms",
  "antonyms",
];

function newRowKey() {
  return `row-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function itemToRow(item: VocabItem): VocabEditorRow {
  return {
    rowKey: item.id,
    id: item.id,
    word: item.word,
    meaning: item.meaning,
    example_sentence: item.example_sentence ?? "",
    example_meaning: item.example_meaning ?? "",
    synonyms: item.synonyms ?? "",
    antonyms: item.antonyms ?? "",
  };
}

function emptyRow(rowKey = newRowKey()): VocabEditorRow {
  return {
    rowKey,
    word: "",
    meaning: "",
    example_sentence: "",
    example_meaning: "",
    synonyms: "",
    antonyms: "",
  };
}

function initialRows(items: VocabItem[], readOnly: boolean): VocabEditorRow[] {
  if (items.length > 0) return items.map(itemToRow);
  // 서버·브라우저 첫 화면이 같도록 처음 빈 줄은 정해진 키를 쓴다
  return readOnly ? [] : [emptyRow("init-0"), emptyRow("init-1"), emptyRow("init-2")];
}

const hasContent = (r: VocabEditorRow) => FIELDS.some((f) => r[f].trim());
const isComplete = (r: VocabEditorRow) => Boolean(r.word.trim() && r.meaning.trim());

/** 서버 메시지에 내부 동작(AI 등) 설명이 섞여 있으면 쉬운 말로 바꾼다 */
function friendly(message: string, fallback: string) {
  return /AI|OpenAI|OPENAI|HTTP/i.test(message) ? fallback : message;
}

interface VocabTableEditorProps {
  setId: string;
  initialItems: VocabItem[];
  initialImportOpen?: boolean;
  readOnly?: boolean;
  onSave: (
    setId: string,
    items: {
      id?: string;
      word: string;
      meaning: string;
      example_sentence?: string;
      example_meaning?: string;
      synonyms?: string;
      antonyms?: string;
      order_index: number;
    }[]
  ) => Promise<{ ok: boolean; message: string }>;
  onMessage?: (text: string, tone?: "good" | "bad") => void;
  /** 저장하지 않은 변경이 생기거나 없어질 때 */
  onDirtyChange?: (dirty: boolean) => void;
}

export function VocabTableEditor({
  setId,
  initialItems,
  initialImportOpen = false,
  readOnly = false,
  onSave,
  onMessage,
  onDirtyChange,
}: VocabTableEditorProps) {
  const router = useRouter();
  const [rows, setRows] = useState<VocabEditorRow[]>(() => initialRows(initialItems, readOnly));
  const [pasteOpen, setPasteOpen] = useState(initialImportOpen && !readOnly);
  const [exampleLevel, setExampleLevel] = useState<ExampleLevel>("middle");
  const [saving, setSaving] = useState(false);
  const [filling, setFilling] = useState(false);
  const [status, setStatus] = useState<{ text: string; tone: "good" | "bad" | "info" } | null>(
    null
  );
  const [invalidKeys, setInvalidKeys] = useState<Set<string>>(new Set());
  const [focusKey, setFocusKey] = useState<string | null>(null);
  const rowsRef = useRef(rows);
  rowsRef.current = rows;
  const justSavedRef = useRef(false);

  const baseline = useMemo(
    () => new Map(initialItems.map((item) => [item.id, itemToRow(item)])),
    [initialItems]
  );

  const changes = useMemo(() => {
    let edited = 0;
    let added = 0;
    const cells = new Map<string, Set<Field>>();
    const present = new Set<string>();
    for (const r of rows) {
      const b = r.id ? baseline.get(r.id) : undefined;
      if (r.id && b) {
        present.add(r.id);
        const diff = FIELDS.filter((f) => r[f].trim() !== b[f].trim());
        if (diff.length > 0) {
          edited += 1;
          cells.set(r.rowKey, new Set(diff));
        }
      } else if (hasContent(r)) {
        added += 1;
      }
    }
    const removed = [...baseline.keys()].filter((id) => !present.has(id)).length;
    return { edited, added, removed, total: edited + added + removed, cells };
  }, [rows, baseline]);

  const dirty = changes.total > 0;
  const dirtyRef = useRef(dirty);
  dirtyRef.current = dirty;

  // 저장 뒤 새로 받은 단어(새 줄에 id가 붙음)로 표를 맞춘다. 고치는 중이면 건드리지 않는다.
  const seenItemsRef = useRef(initialItems);
  useEffect(() => {
    if (seenItemsRef.current === initialItems) return;
    seenItemsRef.current = initialItems;
    if (justSavedRef.current || !dirtyRef.current) {
      justSavedRef.current = false;
      setRows(initialRows(initialItems, readOnly));
    }
  }, [initialItems, readOnly]);

  useEffect(() => {
    onDirtyChange?.(dirty && !readOnly);
  }, [dirty, readOnly, onDirtyChange]);

  useEffect(() => {
    if (!dirty || readOnly) return;
    const warn = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty, readOnly]);

  useEffect(() => {
    if (!initialImportOpen) return;
    const url = new URL(window.location.href);
    if (url.searchParams.has("import")) {
      url.searchParams.delete("import");
      window.history.replaceState(null, "", url.pathname + url.search);
    }
  }, [initialImportOpen]);

  useEffect(() => {
    if (!focusKey) return;
    document.getElementById(`vocab-word-${focusKey}`)?.focus();
    setFocusKey(null);
  }, [focusKey]);

  const updateRow = useCallback((rowKey: string, field: Field, value: string) => {
    setRows((prev) => prev.map((r) => (r.rowKey === rowKey ? { ...r, [field]: value } : r)));
  }, []);

  function addRow() {
    const row = emptyRow();
    setRows((prev) => [...prev, row]);
    setFocusKey(row.rowKey);
  }

  function removeRow(rowKey: string) {
    setRows((prev) => prev.filter((r) => r.rowKey !== rowKey));
    setInvalidKeys((prev) => {
      if (!prev.has(rowKey)) return prev;
      const next = new Set(prev);
      next.delete(rowKey);
      return next;
    });
  }

  function revert() {
    setRows(initialRows(initialItems, readOnly));
    setInvalidKeys(new Set());
    setStatus(null);
  }

  const applyParsedRows = useCallback((parsed: ParsedVocabRow[]) => {
    const { merged, duplicates } = mergeParsedRows(rowsRef.current, parsed);
    if (merged.length > 0) {
      setRows((prev) => [
        ...prev.filter(hasContent),
        ...merged.map((p) => ({
          rowKey: newRowKey(),
          word: p.word,
          meaning: p.meaning,
          example_sentence: p.example_sentence,
          example_meaning: p.example_meaning,
          synonyms: "",
          antonyms: "",
        })),
      ]);
    }
    return { added: merged.length, duplicates };
  }, []);

  const emptyExample = rows.filter((r) => isComplete(r) && !r.example_sentence.trim());
  const emptyRelated = rows.filter(
    (r) => isComplete(r) && !r.synonyms.trim() && !r.antonyms.trim()
  );
  const emptyCount = emptyExample.length + emptyRelated.length;

  async function fillEmpty() {
    const current = rowsRef.current;
    const exTargets = current.filter((r) => isComplete(r) && !r.example_sentence.trim());
    const relTargets = current.filter(
      (r) => isComplete(r) && !r.synonyms.trim() && !r.antonyms.trim()
    );
    if (exTargets.length === 0 && relTargets.length === 0) {
      setStatus({ text: "채울 빈칸이 없어요.", tone: "info" });
      return;
    }
    setFilling(true);
    setStatus({ text: "빈칸을 채우는 중이에요…", tone: "info" });
    let exFilled = 0;
    let relFilled = 0;
    const problems: string[] = [];

    if (exTargets.length > 0) {
      const result = await fetchGeneratedExamples(
        exTargets.map((t) => ({ word: t.word.trim(), meaning: t.meaning.trim() })),
        exampleLevel
      );
      if (!result.ok) {
        problems.push(friendly(result.message, "예문을 만들지 못했어요. 다시 해 주세요."));
      } else {
        const byWord = new Map(result.items.map((i) => [i.word.trim().toLowerCase(), i]));
        const updates = new Map<string, { sentence: string; meaning: string }>();
        for (const t of exTargets) {
          const gen = byWord.get(t.word.trim().toLowerCase());
          if (gen?.example_sentence?.trim()) {
            updates.set(t.rowKey, {
              sentence: gen.example_sentence,
              meaning: gen.example_meaning ?? "",
            });
          }
        }
        exFilled = updates.size;
        setRows((prev) =>
          prev.map((r) => {
            const u = updates.get(r.rowKey);
            if (!u || r.example_sentence.trim()) return r;
            return {
              ...r,
              example_sentence: u.sentence,
              example_meaning: r.example_meaning.trim() ? r.example_meaning : u.meaning,
            };
          })
        );
      }
    }

    if (relTargets.length > 0) {
      const result = await fetchGeneratedRelatedWords(
        relTargets.map((t) => ({ word: t.word.trim(), meaning: t.meaning.trim() })),
        "both"
      );
      if (!result.ok) {
        problems.push(friendly(result.message, "동의어·반의어를 찾지 못했어요. 다시 해 주세요."));
      } else {
        const byWord = new Map(result.items.map((i) => [i.word.trim().toLowerCase(), i]));
        const updates = new Map<string, { synonyms: string; antonyms: string }>();
        for (const t of relTargets) {
          const gen = byWord.get(t.word.trim().toLowerCase());
          const synonyms = (gen?.synonyms ?? "").trim();
          const antonyms = (gen?.antonyms ?? "").trim();
          if (synonyms || antonyms) updates.set(t.rowKey, { synonyms, antonyms });
        }
        relFilled = updates.size;
        setRows((prev) =>
          prev.map((r) => {
            const u = updates.get(r.rowKey);
            if (!u) return r;
            return {
              ...r,
              synonyms: r.synonyms.trim() ? r.synonyms : u.synonyms,
              antonyms: r.antonyms.trim() ? r.antonyms : u.antonyms,
            };
          })
        );
      }
    }

    setFilling(false);
    if (problems.length > 0) {
      setStatus({ text: problems.join(" "), tone: "bad" });
      return;
    }
    const parts = [
      exFilled ? `예문 ${exFilled}개` : "",
      relFilled ? `동의어·반의어 ${relFilled}개` : "",
    ].filter(Boolean);
    setStatus(
      parts.length > 0
        ? { text: `${parts.join(", ")}를 채웠어요. 확인하고 저장해 주세요.`, tone: "good" }
        : { text: "채울 만한 내용을 찾지 못했어요.", tone: "info" }
    );
  }

  async function handleSave() {
    const current = rowsRef.current;
    const incomplete = current.filter((r) => hasContent(r) && !isComplete(r));
    if (incomplete.length > 0) {
      setInvalidKeys(new Set(incomplete.map((r) => r.rowKey)));
      setStatus({
        text: `단어와 뜻이 둘 다 있어야 저장돼요. 빨간 표시가 있는 ${incomplete.length}줄을 채우거나 지워 주세요.`,
        tone: "bad",
      });
      return;
    }
    const payload = current.filter(isComplete).map((r, index) => ({
      id: r.id,
      word: r.word.trim(),
      meaning: r.meaning.trim(),
      example_sentence: r.example_sentence.trim() || undefined,
      example_meaning: r.example_meaning.trim() || undefined,
      synonyms: r.synonyms.trim() || undefined,
      antonyms: r.antonyms.trim() || undefined,
      order_index: index,
    }));
    if (payload.length === 0) {
      setStatus({ text: "저장할 단어가 없어요. 단어와 뜻을 넣어 주세요.", tone: "bad" });
      return;
    }
    setSaving(true);
    setInvalidKeys(new Set());
    const result = await onSave(setId, payload);
    setSaving(false);
    if (!result.ok) {
      setStatus({ text: result.message, tone: "bad" });
      return;
    }
    setStatus(null);
    justSavedRef.current = true;
    onMessage?.(`저장했어요 · ${payload.length}단어`);
    router.refresh();
  }

  const detail = [
    changes.edited ? `수정 ${changes.edited}` : "",
    changes.added ? `새 단어 ${changes.added}` : "",
    changes.removed ? `삭제 ${changes.removed}` : "",
  ]
    .filter(Boolean)
    .join(" · ");

  const busy = saving || filling;
  const lastKey = rows[rows.length - 1]?.rowKey;

  const cellBase =
    "block w-full bg-transparent px-2.5 text-[13px] text-slate-900 outline-none placeholder:text-slate-400 focus:bg-white focus:shadow-[inset_0_0_0_2px_#2563c9] read-only:cursor-default read-only:focus:shadow-none";
  const cellInput = `${cellBase} h-11`;
  // 긴 예문은 줄이 바뀌어도 잘리지 않게 내용만큼 늘린다(지원하지 않는 브라우저는 rows 기준)
  const cellArea = `${cellBase} min-h-11 resize-none py-[13px] leading-[18px] [field-sizing:content]`;

  function onEnterAdd(e: React.KeyboardEvent, rowKey: string) {
    if (e.key === "Enter" && !e.nativeEvent.isComposing && rowKey === lastKey) {
      e.preventDefault();
      addRow();
    }
  }

  return (
    <div className="space-y-3">
      {!readOnly ? (
        <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="secondary" disabled={busy} onClick={() => void fillEmpty()}>
              <Icon name="sparkle" size={16} strokeWidth={2} />
              {filling ? "채우는 중…" : "빈 예문·동의어 채우기"}
            </Button>
            <select
              className="ui-select h-9 w-auto py-1.5 pr-8"
              value={exampleLevel}
              onChange={(e) => setExampleLevel(e.target.value as ExampleLevel)}
              disabled={busy}
              aria-label="예문 수준"
            >
              <option value="middle">예문 수준: 중등</option>
              <option value="high">예문 수준: 고등</option>
            </select>
            <span className="text-xs text-slate-500">
              비어 있는 칸만 채워요 · {emptyCount}칸 비어 있음
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="ghost" onClick={() => setPasteOpen(true)} disabled={busy}>
              <Icon name="upload" size={16} strokeWidth={2} />표 붙여넣기·지문에서 뽑기
            </Button>
            <Button variant="secondary" onClick={addRow} disabled={busy}>
              <Icon name="plus" size={16} strokeWidth={2} />줄 추가
            </Button>
          </div>
        </div>
      ) : null}

      {status ? (
        <p
          role="status"
          className={`rounded-md px-3 py-2 text-[13px] ${
            status.tone === "bad"
              ? "bg-rose-50 text-rose-700"
              : status.tone === "good"
                ? "bg-green-50 text-green-700"
                : "bg-slate-100 text-slate-600"
          }`}
        >
          {status.text}
        </p>
      ) : null}

      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-card">
        <table className="w-full min-w-[980px] table-fixed border-collapse text-[13px]">
          <colgroup>
            <col className="w-10" />
            <col className="w-[150px]" />
            <col className="w-[150px]" />
            <col />
            <col />
            <col className="w-[230px]" />
          </colgroup>
          <thead>
            <tr className="bg-slate-50 text-left text-xs font-semibold text-slate-500">
              <th className="px-2.5 py-2.5 text-center font-semibold">#</th>
              <th className="border-l border-slate-100 px-2.5 py-2.5 font-semibold">단어</th>
              <th className="border-l border-slate-100 px-2.5 py-2.5 font-semibold">뜻</th>
              <th className="border-l border-slate-100 px-2.5 py-2.5 font-semibold">예문</th>
              <th className="border-l border-slate-100 px-2.5 py-2.5 font-semibold">예문 해석</th>
              <th className="border-l border-slate-100 px-2.5 py-2.5 font-semibold">
                동의어 ↔ 반의어
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-sm text-slate-500">
                  {readOnly ? "단어가 없어요." : "아직 단어가 없어요. ‘줄 추가’나 ‘표 붙여넣기’로 넣어 보세요."}
                </td>
              </tr>
            ) : (
              rows.map((row, index) => {
                const isNew = !row.id || !baseline.has(row.id);
                const changed = changes.cells.get(row.rowKey);
                const invalid = invalidKeys.has(row.rowKey);
                const accent = invalid
                  ? "shadow-[inset_3px_0_0_#be123c]"
                  : isNew && hasContent(row)
                    ? "shadow-[inset_3px_0_0_#15803d]"
                    : changed
                      ? "shadow-[inset_3px_0_0_#2563c9]"
                      : "";
                const tint = (f: Field) =>
                  (isNew && row[f].trim()) || changed?.has(f) ? "bg-brand-50" : "";
                const exLines = Math.min(4, Math.max(1, row.example_sentence.split("\n").length));
                const exmLines = Math.min(4, Math.max(1, row.example_meaning.split("\n").length));
                return (
                  <tr key={row.rowKey} className="group border-t border-slate-100 align-top">
                    <td className={`relative h-11 text-center ${accent}`}>
                      <span
                        className={`block pt-3.5 text-xs tabular-nums ${
                          invalid ? "font-semibold text-rose-700" : "text-slate-400"
                        } ${readOnly ? "" : "group-hover:invisible group-focus-within:invisible"}`}
                      >
                        {index + 1}
                      </span>
                      {!readOnly ? (
                        <button
                          type="button"
                          onClick={() => removeRow(row.rowKey)}
                          className="absolute inset-x-0 top-2.5 mx-auto hidden h-7 w-7 items-center justify-center rounded-md text-slate-400 hover:bg-rose-50 hover:text-rose-700 group-focus-within:flex group-hover:flex"
                          aria-label={`${index + 1}번 줄 지우기`}
                          title="줄 지우기"
                        >
                          <Icon name="trash" size={15} />
                        </button>
                      ) : null}
                    </td>
                    <td className={`border-l border-slate-100 ${tint("word")}`}>
                      <input
                        id={`vocab-word-${row.rowKey}`}
                        className={`${cellInput} font-semibold`}
                        value={row.word}
                        readOnly={readOnly}
                        onChange={(e) => updateRow(row.rowKey, "word", e.target.value)}
                        onKeyDown={(e) => onEnterAdd(e, row.rowKey)}
                        placeholder={readOnly ? "" : "provide"}
                        aria-label={`${index + 1}번 단어`}
                      />
                    </td>
                    <td className={`border-l border-slate-100 ${tint("meaning")}`}>
                      <input
                        className={cellInput}
                        value={row.meaning}
                        readOnly={readOnly}
                        onChange={(e) => updateRow(row.rowKey, "meaning", e.target.value)}
                        onKeyDown={(e) => onEnterAdd(e, row.rowKey)}
                        placeholder={readOnly ? "" : "제공하다"}
                        aria-label={`${index + 1}번 뜻`}
                      />
                    </td>
                    <td className={`border-l border-slate-100 ${tint("example_sentence")}`}>
                      <textarea
                        className={cellArea}
                        rows={exLines}
                        value={row.example_sentence}
                        readOnly={readOnly}
                        onChange={(e) => updateRow(row.rowKey, "example_sentence", e.target.value)}
                        placeholder="비어 있음"
                        aria-label={`${index + 1}번 예문`}
                      />
                    </td>
                    <td className={`border-l border-slate-100 ${tint("example_meaning")}`}>
                      <textarea
                        className={cellArea}
                        rows={exmLines}
                        value={row.example_meaning}
                        readOnly={readOnly}
                        onChange={(e) => updateRow(row.rowKey, "example_meaning", e.target.value)}
                        placeholder="—"
                        aria-label={`${index + 1}번 예문 해석`}
                      />
                    </td>
                    <td className="border-l border-slate-100">
                      <div className="flex items-center">
                        <input
                          className={`${cellInput} min-w-0 flex-1 ${tint("synonyms")}`}
                          value={row.synonyms}
                          readOnly={readOnly}
                          onChange={(e) => updateRow(row.rowKey, "synonyms", e.target.value)}
                          placeholder="동의어"
                          aria-label={`${index + 1}번 동의어`}
                        />
                        <span className="shrink-0 px-0.5 text-slate-300" aria-hidden>
                          ↔
                        </span>
                        <input
                          className={`${cellInput} min-w-0 flex-1 ${tint("antonyms")}`}
                          value={row.antonyms}
                          readOnly={readOnly}
                          onChange={(e) => updateRow(row.rowKey, "antonyms", e.target.value)}
                          placeholder="반의어"
                          aria-label={`${index + 1}번 반의어`}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
        {!readOnly ? (
          <button
            type="button"
            onClick={addRow}
            disabled={busy}
            className="flex w-full min-w-[980px] items-center gap-1.5 border-t border-slate-100 px-4 py-2.5 text-[13px] font-semibold text-brand-700 hover:bg-brand-50 disabled:opacity-50"
          >
            <Icon name="plus" size={15} strokeWidth={2} />줄 추가
          </button>
        ) : null}
      </div>

      {dirty && !readOnly ? (
        <div className="sticky bottom-5 z-30 flex flex-wrap items-center justify-between gap-3 rounded-[10px] border border-slate-200 bg-white py-2.5 pl-[18px] pr-3 shadow-[0_10px_28px_rgba(15,23,42,0.14)]">
          <div className="flex min-w-0 flex-wrap items-center gap-x-2.5 gap-y-0.5">
            <span className="h-2 w-2 shrink-0 rounded-full bg-brand-600" aria-hidden />
            <span className="text-sm font-semibold text-slate-900">
              저장하지 않은 변경 {changes.total}곳
            </span>
            <span className="text-[13px] text-slate-500">{detail}</span>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={revert} disabled={busy}>
              되돌리기
            </Button>
            <Button onClick={() => void handleSave()} disabled={busy} className="px-[22px]">
              {saving ? "저장 중…" : "저장"}
            </Button>
          </div>
        </div>
      ) : null}

      <BulkPasteModal
        open={pasteOpen}
        onClose={() => setPasteOpen(false)}
        onApplyRows={applyParsedRows}
      />
    </div>
  );
}
