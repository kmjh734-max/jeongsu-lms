"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { BulkPasteModal } from "@/components/vocab/BulkPasteModal";
import {
  mergeParsedRows,
  parseBulkPaste,
} from "@/lib/vocab/parse-bulk-paste";
import {
  fetchGeneratedExamples,
  type ExampleLevel,
} from "@/lib/vocab/generate-examples-client";
import {
  fetchGeneratedRelatedWords,
  type RelatedWordsKind,
} from "@/lib/vocab/generate-related-words-client";
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

function newRowKey() {
  return `row-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function itemsToRows(items: VocabItem[]): VocabEditorRow[] {
  return items.map((item) => ({
    rowKey: item.id,
    id: item.id,
    word: item.word,
    meaning: item.meaning,
    example_sentence: item.example_sentence ?? "",
    example_meaning: item.example_meaning ?? "",
    synonyms: item.synonyms ?? "",
    antonyms: item.antonyms ?? "",
  }));
}

function emptyRow(): VocabEditorRow {
  return {
    rowKey: newRowKey(),
    word: "",
    meaning: "",
    example_sentence: "",
    example_meaning: "",
    synonyms: "",
    antonyms: "",
  };
}

function rowNumber(index: number) {
  return String(index + 1).padStart(3, "0");
}

interface VocabTableEditorProps {
  setId: string;
  initialItems: VocabItem[];
  initialImportOpen?: boolean;
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
}

export function VocabTableEditor({
  setId,
  initialItems,
  initialImportOpen = false,
  onSave,
}: VocabTableEditorProps) {
  const router = useRouter();
  const [rows, setRows] = useState<VocabEditorRow[]>(() =>
    initialItems.length > 0 ? itemsToRows(initialItems) : [emptyRow(), emptyRow(), emptyRow()]
  );
  const [pasteOpen, setPasteOpen] = useState(initialImportOpen);
  /** 기본 OFF — 뜻 입력만으로 예문/동의어가 마음대로 채워지지 않게 함 */
  const [autoAi, setAutoAi] = useState(false);
  const [exampleLevel, setExampleLevel] = useState<ExampleLevel>("middle");
  const [saving, setSaving] = useState(false);
  const [aiLoadingKey, setAiLoadingKey] = useState<string | null>(null);
  const [bulkAiLoading, setBulkAiLoading] = useState(false);
  const [bulkRelatedLoading, setBulkRelatedLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const tableScrollRef = useRef<HTMLDivElement>(null);
  const topScrollRef = useRef<HTMLDivElement>(null);
  const [tableScrollWidth, setTableScrollWidth] = useState(0);
  const rowsRef = useRef(rows);
  rowsRef.current = rows;

  useLayoutEffect(() => {
    const el = tableScrollRef.current;
    if (!el) return;

    const update = () => setTableScrollWidth(el.scrollWidth);
    update();

    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [rows]);

  const syncScrollFromTop = useCallback(() => {
    const main = tableScrollRef.current;
    const top = topScrollRef.current;
    if (main && top) main.scrollLeft = top.scrollLeft;
  }, []);

  const syncScrollFromTable = useCallback(() => {
    const main = tableScrollRef.current;
    const top = topScrollRef.current;
    if (main && top) top.scrollLeft = main.scrollLeft;
  }, []);

  useEffect(() => {
    if (initialImportOpen) setPasteOpen(true);
  }, [initialImportOpen]);

  const updateRow = useCallback(
    (rowKey: string, field: keyof VocabEditorRow, value: string) => {
      setRows((prev) =>
        prev.map((r) => (r.rowKey === rowKey ? { ...r, [field]: value } : r))
      );
    },
    []
  );

  const removeRow = useCallback((rowKey: string) => {
    setRows((prev) => {
      const next = prev.filter((r) => r.rowKey !== rowKey);
      return next.length > 0 ? next : [emptyRow()];
    });
  }, []);

  const insertRowAfter = useCallback((afterKey: string) => {
    setRows((prev) => {
      const idx = prev.findIndex((r) => r.rowKey === afterKey);
      const row = emptyRow();
      if (idx === -1) return [...prev, row];
      const next = [...prev];
      next.splice(idx + 1, 0, row);
      return next;
    });
  }, []);

  const applyParsedRows = useCallback(
    (parsed: ReturnType<typeof parseBulkPaste>) => {
      const { merged, duplicates } = mergeParsedRows(rows, parsed);
      if (merged.length === 0) {
        return { added: 0, duplicates };
      }
      setRows((prev) => {
        const cleaned = prev.filter((r) => r.word.trim() || r.meaning.trim());
        const base = cleaned.length > 0 ? cleaned : [];
        const added = merged.map((p) => ({
          rowKey: newRowKey(),
          word: p.word,
          meaning: p.meaning,
          example_sentence: p.example_sentence,
          example_meaning: p.example_meaning,
          synonyms: "",
          antonyms: "",
        }));
        return [...base, ...added];
      });
      return { added: merged.length, duplicates };
    },
    [rows]
  );

  const applyGeneratedExamples = useCallback(
    (
      updates: {
        rowKey: string;
        example_sentence: string;
        example_meaning: string;
      }[]
    ) => {
      setRows((prev) =>
        prev.map((r) => {
          const u = updates.find((x) => x.rowKey === r.rowKey);
          if (!u) return r;
          return {
            ...r,
            example_sentence: u.example_sentence,
            example_meaning: u.example_meaning,
          };
        })
      );
    },
    []
  );

  const applyGeneratedRelated = useCallback(
    (
      updates: {
        rowKey: string;
        synonyms?: string;
        antonyms?: string;
      }[],
      kind: RelatedWordsKind
    ) => {
      setRows((prev) =>
        prev.map((r) => {
          const u = updates.find((x) => x.rowKey === r.rowKey);
          if (!u) return r;
          // 빈 문자열로 기존 값을 덮어쓰지 않음 (필요 없으면 AI가 비워 둘 수 있음)
          return {
            ...r,
            synonyms:
              kind === "antonyms"
                ? r.synonyms
                : u.synonyms?.trim()
                  ? u.synonyms
                  : r.synonyms,
            antonyms:
              kind === "synonyms"
                ? r.antonyms
                : u.antonyms?.trim()
                  ? u.antonyms
                  : r.antonyms,
          };
        })
      );
    },
    []
  );

  const generateForRow = useCallback(
    async (rowKey: string, force = false) => {
      const row = rowsRef.current.find((r) => r.rowKey === rowKey);
      if (!row?.word.trim() || !row.meaning.trim()) {
        setStatus("예문을 만들려면 단어와 뜻을 먼저 입력해 주세요.");
        return;
      }
      if (!force && row.example_sentence.trim()) return;

      setStatus("AI 예문 생성 중…");
      setAiLoadingKey(`${rowKey}-example`);
      try {
        const result = await fetchGeneratedExamples(
          [{ word: row.word.trim(), meaning: row.meaning.trim() }],
          exampleLevel
        );

        if (!result.ok) {
          setStatus(result.message);
          return;
        }

        const gen = result.items[0];
        if (gen?.example_sentence?.trim()) {
          applyGeneratedExamples([
            {
              rowKey,
              example_sentence: gen.example_sentence,
              example_meaning: gen.example_meaning ?? "",
            },
          ]);
          setStatus("예문이 생성되었습니다. 확인 후 저장해 주세요.");
        } else {
          setStatus("AI가 예문을 비워 반환했습니다. 다시 시도해 주세요.");
        }
      } catch (e) {
        setStatus(
          e instanceof Error ? e.message : "AI 예문 생성에 실패했습니다."
        );
      } finally {
        setAiLoadingKey(null);
      }
    },
    [exampleLevel, applyGeneratedExamples]
  );

  const generateAllSynonymsAntonyms = useCallback(async () => {
    const targets = rows.filter(
      (r) =>
        r.word.trim() &&
        r.meaning.trim() &&
        (!r.synonyms.trim() || !r.antonyms.trim())
    );
    if (targets.length === 0) {
      setStatus("동의어·반의어가 모두 채워진 단어만 있습니다.");
      return;
    }

    setBulkRelatedLoading(true);
    setStatus(null);
    const result = await fetchGeneratedRelatedWords(
      targets.map((t) => ({
        word: t.word.trim(),
        meaning: t.meaning.trim(),
      })),
      "both"
    );
    setBulkRelatedLoading(false);

    if (!result.ok) {
      setStatus(result.message);
      return;
    }

    const byWord = new Map(
      result.items.map((i) => [i.word.trim().toLowerCase(), i])
    );
    const updates = targets
      .map((t) => {
        const gen = byWord.get(t.word.trim().toLowerCase());
        if (!gen) return null;
        if (!gen.synonyms?.trim() && !gen.antonyms?.trim()) return null;
        return {
          rowKey: t.rowKey,
          synonyms: gen.synonyms,
          antonyms: gen.antonyms,
        };
      })
      .filter(Boolean) as {
      rowKey: string;
      synonyms: string;
      antonyms: string;
    }[];

    applyGeneratedRelated(updates, "both");
    setStatus(`${updates.length}개 단어에 동의어·반의어가 생성되었습니다.`);
  }, [rows, applyGeneratedRelated]);

  const generateAllEmptyExamples = useCallback(async () => {
    const targets = rows.filter(
      (r) =>
        r.word.trim() &&
        r.meaning.trim() &&
        !r.example_sentence.trim() &&
        !r.example_meaning.trim()
    );
    if (targets.length === 0) {
      setStatus("예문이 비어 있는 단어가 없습니다.");
      return;
    }

    setBulkAiLoading(true);
    setStatus(null);
    const result = await fetchGeneratedExamples(
      targets.map((t) => ({
        word: t.word.trim(),
        meaning: t.meaning.trim(),
      })),
      exampleLevel
    );
    setBulkAiLoading(false);

    if (!result.ok) {
      setStatus(result.message);
      return;
    }

    const byWord = new Map(
      result.items.map((i) => [i.word.trim().toLowerCase(), i])
    );
    const updates = targets
      .map((t) => {
        const gen = byWord.get(t.word.trim().toLowerCase());
        if (!gen?.example_sentence) return null;
        return {
          rowKey: t.rowKey,
          example_sentence: gen.example_sentence,
          example_meaning: gen.example_meaning ?? "",
        };
      })
      .filter(Boolean) as {
      rowKey: string;
      example_sentence: string;
      example_meaning: string;
    }[];

    applyGeneratedExamples(updates);
    setStatus(`${updates.length}개 단어에 예문이 생성되었습니다.`);
  }, [rows, exampleLevel, applyGeneratedExamples]);

  const aiBusy = bulkAiLoading || bulkRelatedLoading;

  const handleMeaningBlur = useCallback(
    (rowKey: string) => {
      if (!autoAi) return;
      const row = rows.find((r) => r.rowKey === rowKey);
      if (
        row?.word.trim() &&
        row.meaning.trim() &&
        !row.example_sentence.trim()
      ) {
        void generateForRow(rowKey);
      }
    },
    [autoAi, rows, generateForRow]
  );

  const filledCount = useMemo(
    () => rows.filter((r) => r.word.trim() && r.meaning.trim()).length,
    [rows]
  );

  async function handleSave() {
    setSaving(true);
    setStatus(null);

    const payload = rows
      .map((r, index) => ({
        id: r.id,
        word: r.word.trim(),
        meaning: r.meaning.trim(),
        example_sentence: r.example_sentence.trim() || undefined,
        example_meaning: r.example_meaning.trim() || undefined,
        synonyms: r.synonyms.trim() || undefined,
        antonyms: r.antonyms.trim() || undefined,
        order_index: index,
      }))
      .filter((r) => r.word && r.meaning);

    if (payload.length === 0) {
      setStatus("저장할 단어가 없습니다. 단어와 뜻을 입력해 주세요.");
      setSaving(false);
      return;
    }

    const result = await onSave(setId, payload);
    setStatus(result.message);
    setSaving(false);

    if (result.ok) router.refresh();
  }

  const inputClass =
    "w-full rounded border border-slate-200 px-2 py-1.5 text-sm text-slate-900 focus:border-violet-400 focus:outline-none focus:ring-1 focus:ring-violet-200";

  const statusClass =
    !status
      ? ""
      : status.includes("중…") || status.includes("중...")
        ? "bg-slate-50 text-slate-700"
        : status.includes("실패") ||
            status.includes("부족") ||
            status.includes("오류") ||
            status.includes("없습") ||
            status.includes("권한") ||
            status.includes("먼저") ||
            status.includes("비워")
          ? "bg-red-50 text-red-700"
          : "bg-emerald-50 text-emerald-800";

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      {status ? (
        <p className={`border-b px-3 py-2 text-sm ${statusClass}`} role="status">
          {status}
        </p>
      ) : null}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-slate-200 bg-slate-50 px-3 py-2">
        <label className="text-xs font-medium text-slate-600">예문 수준</label>
        <select
          className="rounded border border-slate-300 bg-white px-2 py-1 text-xs text-slate-800"
          value={exampleLevel}
          onChange={(e) => setExampleLevel(e.target.value as ExampleLevel)}
          disabled={aiBusy || saving}
        >
          <option value="middle">중등</option>
          <option value="high">고등</option>
        </select>
        <label className="flex items-center gap-1.5 text-xs text-slate-700">
          <input
            type="checkbox"
            checked={autoAi}
            onChange={(e) => setAutoAi(e.target.checked)}
            className="rounded border-slate-300 text-emerald-600"
          />
          예문 자동입력 (AI·기본 끔)
        </label>
        <span className="text-[11px] text-slate-400">
          체크 시에만 뜻 입력 후 예문 자동 생성 · AI 일괄은 아래 버튼
        </span>
      </div>

      <div
        ref={topScrollRef}
        onScroll={syncScrollFromTop}
        className="overflow-x-auto overflow-y-hidden border-b border-slate-100"
        aria-hidden
      >
        <div style={{ width: tableScrollWidth, height: 10 }} />
      </div>

      <div
        ref={tableScrollRef}
        onScroll={syncScrollFromTable}
        className="max-h-[min(68vh,640px)] overflow-auto"
      >
        <table className="w-full min-w-[920px] border-collapse text-sm">
          <thead className="sticky top-0 z-10">
            <tr className="bg-slate-600 text-white">
              <th className="w-[72px] px-1.5 py-1.5 text-center text-xs font-semibold" />
              <th className="min-w-[100px] px-2 py-1.5 text-left text-xs font-semibold">
                단어
              </th>
              <th className="min-w-[110px] px-2 py-1.5 text-left text-xs font-semibold">
                뜻
              </th>
              <th className="min-w-[170px] px-2 py-1.5 text-left text-xs font-semibold">
                예문
              </th>
              <th className="min-w-[150px] px-2 py-1.5 text-left text-xs font-semibold">
                예문 해석
              </th>
              <th className="min-w-[150px] px-2 py-1.5 text-left text-xs font-semibold">
                동의어 · 반의어
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr
                key={row.rowKey}
                className="border-b border-slate-100 hover:bg-slate-50/60"
              >
                <td className="align-top px-1.5 py-1">
                  <div className="flex flex-col items-center gap-0.5">
                    <span className="text-[10px] font-mono text-slate-500">
                      {rowNumber(index)}
                    </span>
                    <button
                      type="button"
                      title="행 삭제"
                      onClick={() => removeRow(row.rowKey)}
                      className="flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-base font-bold leading-none text-white hover:bg-red-600"
                    >
                      −
                    </button>
                    <button
                      type="button"
                      title="행 추가"
                      onClick={() => insertRowAfter(row.rowKey)}
                      className="flex h-6 w-6 items-center justify-center rounded-full bg-violet-500 text-base font-bold leading-none text-white hover:bg-violet-600"
                    >
                      +
                    </button>
                  </div>
                </td>
                <td className="px-1.5 py-1 align-top">
                  <input
                    className={inputClass}
                    value={row.word}
                    onChange={(e) =>
                      updateRow(row.rowKey, "word", e.target.value)
                    }
                    placeholder="provide"
                  />
                </td>
                <td className="px-1.5 py-1 align-top">
                  <input
                    className={inputClass}
                    value={row.meaning}
                    onChange={(e) =>
                      updateRow(row.rowKey, "meaning", e.target.value)
                    }
                    onBlur={() => handleMeaningBlur(row.rowKey)}
                    placeholder="제공하다"
                  />
                </td>
                <td className="px-1.5 py-1 align-top">
                  <textarea
                    className={`${inputClass} min-h-[4.5rem] resize-y`}
                    rows={3}
                    value={row.example_sentence}
                    onChange={(e) =>
                      updateRow(row.rowKey, "example_sentence", e.target.value)
                    }
                    placeholder={"1. The school provides lunch.\n2. The law provides that…"}
                  />
                </td>
                <td className="px-1.5 py-1 align-top">
                  <textarea
                    className={`${inputClass} min-h-[4.5rem] resize-y`}
                    rows={3}
                    value={row.example_meaning}
                    onChange={(e) =>
                      updateRow(row.rowKey, "example_meaning", e.target.value)
                    }
                    placeholder={"1. 학교는 점심을 제공한다.\n2. 그 법은 …을 규정한다."}
                  />
                </td>
                <td className="px-1.5 py-1 align-top">
                  <input
                    className={`${inputClass} mb-1`}
                    value={row.synonyms}
                    onChange={(e) =>
                      updateRow(row.rowKey, "synonyms", e.target.value)
                    }
                    placeholder="동의어"
                  />
                  <input
                    className={inputClass}
                    value={row.antonyms}
                    onChange={(e) =>
                      updateRow(row.rowKey, "antonyms", e.target.value)
                    }
                    placeholder="반의어"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="space-y-2 border-t border-slate-200 bg-slate-50 px-3 py-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={bulkAiLoading || saving}
            onClick={() => void generateAllEmptyExamples()}
            className="rounded-lg bg-violet-600 px-3 py-2 text-xs font-bold text-white hover:bg-violet-700 disabled:opacity-50"
          >
            {bulkAiLoading ? "예문 생성 중…" : "AI 예문 일괄"}
          </button>
          <button
            type="button"
            disabled={bulkRelatedLoading || saving}
            onClick={() => void generateAllSynonymsAntonyms()}
            className="rounded-lg bg-teal-600 px-3 py-2 text-xs font-bold text-white hover:bg-teal-700 disabled:opacity-50"
          >
            {bulkRelatedLoading ? "생성 중…" : "AI 동의어·반의어 일괄"}
          </button>
          <span className="text-[11px] text-slate-500">
            예문이 비어 있는 단어만 생성합니다
          </span>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setRows((prev) => [...prev, emptyRow()])}
              className="rounded-lg border border-emerald-600 bg-white px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-50"
            >
              행 추가
            </button>
            <button
              type="button"
              onClick={() => setPasteOpen(true)}
              className="rounded-lg bg-[#7cb518] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#6aa014]"
            >
              자료 가져오기
            </button>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500">
              입력된 단어 {filledCount}개
            </span>
            <button
              type="button"
              disabled={saving}
              onClick={handleSave}
              className="rounded-lg bg-brand-600 px-5 py-1.5 text-xs font-bold text-white hover:bg-brand-700 disabled:opacity-50"
            >
              {saving ? "저장 중..." : "저장"}
            </button>
          </div>
        </div>
      </div>

      <BulkPasteModal
        open={pasteOpen}
        onClose={() => setPasteOpen(false)}
        onApplyRows={applyParsedRows}
      />
    </div>
  );
}
