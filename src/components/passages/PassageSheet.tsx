"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";
import { splitEnglishSentences } from "@/lib/lesson-materials/split-sentences";

/*
 * 엑셀처럼 지문을 넣는 표 — 선생님 요청(2026-10-10).
 * 수업자료·변형문제 자료 입력에서 같이 쓴다.
 *
 * - 엑셀·구글 시트에서 여러 칸을 복사해 붙이면 행·열에 나눠 들어간다
 *   (탭이 없는 여러 줄 글은 한 칸에 그대로 — 지문 한 편의 문단일 수 있다)
 * - 행 병합: 고른 행들을 하나로 합친다(한 지문이 여러 행으로 쪼개져 들어왔을 때)
 * - 줄바꿈 제거: PDF에서 복사하면 줄마다 끊기는 것을 한 줄로 이어 붙인다
 * - 되돌리기·다시 하기 (Ctrl+Z / Ctrl+Y)
 * - 영어 지문 「원문 / 문장별」 보기
 */

export type SheetColumn<K extends string> = {
  key: K;
  label: string;
  /** 머리글 ? 에 띄울 설명 */
  help?: string;
  /** 영어 지문 칸 — 원문/문장별 보기와 줄바꿈 제거가 적용된다 */
  english?: boolean;
  /** 칸 너비 (예: "22%") — 비우면 남는 폭을 쓴다 */
  width?: string;
  placeholder?: string;
  maxLength?: number;
  /** 한 줄 칸(출처·제목) */
  singleLine?: boolean;
};

type Row<K extends string> = Record<K, string>;

const HISTORY_MAX = 80;

/** 엑셀이 복사해 주는 탭 구분 글(따옴표 안 줄바꿈 포함)을 칸으로 나눈다 */
function parseTsv(text: string): string[][] {
  const out: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  const s = text.replace(/\r\n?/g, "\n");
  for (let i = 0; i < s.length; i++) {
    const ch = s[i]!;
    if (quoted) {
      if (ch === '"' && s[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (ch === '"') quoted = false;
      else cell += ch;
      continue;
    }
    if (ch === '"' && cell === "") quoted = true;
    else if (ch === "\t") {
      row.push(cell);
      cell = "";
    } else if (ch === "\n") {
      row.push(cell);
      out.push(row);
      row = [];
      cell = "";
    } else cell += ch;
  }
  if (cell !== "" || row.length) {
    row.push(cell);
    out.push(row);
  }
  return out;
}

/** PDF 복사 줄바꿈을 이어 붙인다: 줄 끝 하이픈(-)으로 끊긴 낱말은 붙이고 나머지는 띄어 쓴다 */
function unwrapLines(text: string): string {
  return text
    .replace(/\r\n?/g, "\n")
    .replace(/([A-Za-z])-\n\s*([a-z])/g, "$1$2")
    .replace(/\s*\n\s*/g, " ")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

export function PassageSheet<K extends string, R extends Row<K>>({
  rows,
  onChange,
  columns,
  makeRow,
  maxRows = 50,
  title = "영어 지문",
  subtitle,
  footer,
}: {
  rows: R[];
  onChange: (rows: R[]) => void;
  columns: SheetColumn<K>[];
  /** 빈 행 하나 */
  makeRow: () => R;
  maxRows?: number;
  title?: string;
  /** 제목 옆 작은 글씨(입력 개수 등) */
  subtitle?: ReactNode;
  /** 표 아래 단추 줄 — 행 추가 함수를 받아 화면마다 원래 단추를 그린다. 없으면 「+ 행 추가」만 */
  footer?: (addRow: () => void) => ReactNode;
}) {
  const [past, setPast] = useState<R[][]>([]);
  const [future, setFuture] = useState<R[][]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [anchor, setAnchor] = useState<number | null>(null);
  const [sentenceView, setSentenceView] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  /** 칸에 들어간 뒤 첫 글자를 칠 때만 되돌리기 기록을 남긴다(한 글자마다 남기지 않게) */
  const typingCell = useRef<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(null), 2500);
    return () => clearTimeout(t);
  }, [notice]);

  // 행 수가 줄면 범위를 벗어난 선택을 지운다
  useEffect(() => {
    setSelected((prev) => {
      const next = new Set([...prev].filter((i) => i < rows.length));
      return next.size === prev.size ? prev : next;
    });
  }, [rows.length]);

  function commit(next: R[]) {
    setPast((p) => [...p.slice(-HISTORY_MAX + 1), rows]);
    setFuture([]);
    onChange(next);
  }

  function undo() {
    const prev = past[past.length - 1];
    if (!prev) return;
    setPast((p) => p.slice(0, -1));
    setFuture((f) => [rows, ...f]);
    typingCell.current = null;
    onChange(prev);
  }

  function redo() {
    const next = future[0];
    if (!next) return;
    setFuture((f) => f.slice(1));
    setPast((p) => [...p, rows]);
    typingCell.current = null;
    onChange(next);
  }

  function editCell(r: number, key: K, value: string) {
    const cellId = `${r}:${key}`;
    const next = rows.map((row, i) => (i === r ? ({ ...row, [key]: value } as R) : row));
    if (typingCell.current !== cellId) {
      typingCell.current = cellId;
      commit(next);
    } else {
      onChange(next);
    }
  }

  function addRow() {
    if (rows.length >= maxRows) {
      setNotice(`최대 ${maxRows}행까지 넣을 수 있어요.`);
      return;
    }
    commit([...rows, makeRow()]);
  }

  function removeRow(r: number) {
    const next = rows.filter((_, i) => i !== r);
    commit(next.length ? next : [makeRow()]);
    setSelected(new Set());
  }

  function clickRowHeader(r: number, shift: boolean) {
    setSelected((prev) => {
      if (shift && anchor !== null) {
        const [a, b] = anchor < r ? [anchor, r] : [r, anchor];
        return new Set(Array.from({ length: b - a + 1 }, (_, i) => a + i));
      }
      const next = new Set(prev);
      if (next.has(r)) next.delete(r);
      else next.add(r);
      return next;
    });
    setAnchor(r);
  }

  function mergeRows() {
    const picked = [...selected].sort((a, b) => a - b);
    if (picked.length < 2) {
      setNotice("합칠 행을 왼쪽 번호 칸에서 2개 이상 골라 주세요. (Shift+클릭으로 여러 행)");
      return;
    }
    const merged = { ...rows[picked[0]!]! } as R;
    for (const c of columns) {
      const parts = picked.map((i) => (rows[i]?.[c.key] ?? "").trim()).filter(Boolean);
      // 출처·제목 같은 한 줄 칸은 첫 값만, 지문·해석은 이어 붙인다
      const value = c.singleLine ? parts[0] ?? "" : parts.join(" ");
      (merged as Record<K, string>)[c.key] = c.maxLength ? value.slice(0, c.maxLength) : value;
    }
    const next: R[] = [];
    rows.forEach((row, i) => {
      if (i === picked[0]) next.push(merged);
      else if (!picked.includes(i)) next.push(row);
    });
    commit(next);
    setSelected(new Set([picked[0]!]));
    setNotice(`${picked.length}개 행을 하나로 합쳤어요.`);
  }

  function removeLineBreaks() {
    const targets = selected.size ? selected : new Set(rows.map((_, i) => i));
    let changed = 0;
    const next = rows.map((row, i) => {
      if (!targets.has(i)) return row;
      const copy = { ...row } as R;
      for (const c of columns) {
        if (c.singleLine) continue;
        const before = row[c.key] ?? "";
        const after = unwrapLines(before);
        if (after !== before) {
          (copy as Record<K, string>)[c.key] = after;
          changed++;
        }
      }
      return copy;
    });
    if (!changed) {
      setNotice("없앨 줄바꿈이 없어요.");
      return;
    }
    commit(next);
    setNotice(selected.size ? `고른 ${selected.size}개 행의 줄바꿈을 없앴어요.` : "모든 행의 줄바꿈을 없앴어요.");
  }

  /** 엑셀에서 여러 칸을 복사해 붙이면 지금 칸부터 오른쪽·아래로 나눠 넣는다 */
  function handlePaste(e: React.ClipboardEvent, r: number, colIdx: number) {
    const text = e.clipboardData.getData("text/plain");
    const html = e.clipboardData.getData("text/html");
    const fromSheet = text.includes("\t") || /<table[\s>]/i.test(html);
    if (!fromSheet) return;
    const grid = parseTsv(text.replace(/\n$/, ""));
    if (!grid.length) return;
    e.preventDefault();
    const next = [...rows];
    let added = 0;
    grid.forEach((cells, dr) => {
      const target = r + dr;
      if (target >= maxRows) return;
      if (target >= next.length) {
        next.push(makeRow());
        added++;
      }
      const row = { ...next[target]! } as R;
      cells.forEach((value, dc) => {
        const col = columns[colIdx + dc];
        if (!col) return;
        const v = value.trim();
        (row as Record<K, string>)[col.key] = col.maxLength ? v.slice(0, col.maxLength) : v;
      });
      next[target] = row;
    });
    commit(next);
    setNotice(`${grid.length}행을 붙여 넣었어요${added ? ` (새 행 ${added}개)` : ""}.`);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    const mod = e.ctrlKey || e.metaKey;
    if (!mod) return;
    const k = e.key.toLowerCase();
    if (k === "z" && !e.shiftKey) {
      e.preventDefault();
      undo();
    } else if (k === "y" || (k === "z" && e.shiftKey)) {
      e.preventDefault();
      redo();
    }
  }

  const englishCol = columns.find((c) => c.english);

  return (
    <div ref={rootRef} className="space-y-2" onKeyDown={onKeyDown}>
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">
            {title}
            {subtitle ? <span className="ml-2 text-xs font-normal text-slate-500">{subtitle}</span> : null}
          </h2>
          <p className="mt-0.5 text-xs text-slate-500">
            엑셀·구글 시트에서 여러 칸을 복사해 붙이면 행과 열에 나눠 들어가요.
            {englishCol ? ` 「${englishCol.label}」 칸에 붙이면 오른쪽 칸까지 같이 채워져요.` : ""}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-1">
          <IconButton label="되돌리기 (Ctrl+Z)" disabled={!past.length} onClick={undo}>
            <path d="M9 14 4 9l5-5" />
            <path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11" />
          </IconButton>
          <IconButton label="다시 하기 (Ctrl+Y)" disabled={!future.length} onClick={redo}>
            <path d="m15 14 5-5-5-5" />
            <path d="M20 9H9.5a5.5 5.5 0 0 0 0 11H13" />
          </IconButton>
          <span className="mx-1 h-5 w-px bg-slate-200" aria-hidden />
          <ToolButton
            label="행 합치기"
            help="왼쪽 번호를 눌러 행을 2개 이상 고른 뒤 누르면 하나로 합쳐요. 한 지문이 여러 행으로 나뉘어 들어왔을 때 쓰세요."
            onClick={mergeRows}
          />
          <ToolButton
            label="줄바꿈 없애기"
            help="PDF에서 복사해 줄마다 끊긴 글을 한 줄로 이어 붙여요. 행을 고르면 그 행만, 안 고르면 모든 행에 적용해요."
            onClick={removeLineBreaks}
          />
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full min-w-[760px] table-fixed border-collapse text-sm">
          <colgroup>
            <col className="w-12" />
            {columns.map((c) => (
              <col key={c.key} style={c.width ? { width: c.width } : undefined} />
            ))}
          </colgroup>
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-bold text-slate-600">
              <th className="px-1 py-2.5 text-center text-[11px] font-semibold text-brand-700">
                {selected.size ? `${selected.size}행` : "#"}
              </th>
              {columns.map((c) => (
                <th key={c.key} className="px-2.5 py-2" title={c.help}>
                  <span className="inline-flex flex-wrap items-center gap-2">
                    {c.label}
                    {c.english ? (
                      <span className="inline-flex gap-0.5 rounded-md bg-slate-200/70 p-0.5 text-[11px] font-semibold">
                        {(
                          [
                            [false, "원문"],
                            [true, "문장별"],
                          ] as const
                        ).map(([v, l]) => (
                          <button
                            key={l}
                            type="button"
                            onClick={() => setSentenceView(v)}
                            className={`rounded px-2 py-0.5 ${
                              sentenceView === v ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                            }`}
                          >
                            {l}
                          </button>
                        ))}
                      </span>
                    ) : null}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, r) => {
              const isSel = selected.has(r);
              return (
                <tr
                  key={r}
                  className={`group border-b border-slate-100 align-top last:border-b-0 ${isSel ? "bg-brand-50/50" : "hover:bg-slate-50/60"}`}
                >
                  <td
                    className={`relative cursor-pointer select-none px-1 py-2.5 text-center text-xs font-bold ${
                      isSel ? "bg-brand-100/70 text-brand-700" : "bg-slate-50/80 text-slate-400 hover:text-slate-600"
                    }`}
                    onClick={(e) => clickRowHeader(r, e.shiftKey)}
                    title="눌러서 행 고르기 (Shift+클릭으로 여러 행)"
                  >
                    {r + 1}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeRow(r);
                      }}
                      aria-label={`${r + 1}행 삭제`}
                      title="행 삭제"
                      className="absolute bottom-1.5 left-1/2 hidden -translate-x-1/2 rounded px-1 text-[11px] font-normal text-slate-400 hover:bg-red-50 hover:text-red-600 group-hover:block"
                    >
                      ✕
                    </button>
                  </td>
                  {columns.map((c, ci) => {
                    const value = row[c.key] ?? "";
                    const showSentences = c.english && sentenceView && value.trim();
                    return (
                      <td key={c.key} className="p-1">
                        {showSentences ? (
                          <ol
                            className="min-h-[2.5rem] cursor-text space-y-1 rounded-md px-2 py-1.5 font-serif text-[13px] leading-relaxed text-slate-800 hover:bg-white"
                            onClick={() => setSentenceView(false)}
                            title="눌러서 고치기"
                          >
                            {splitEnglishSentences(value.replace(/\s+/g, " ")).map((s, si) => (
                              <li key={si} className="flex gap-2">
                                <span className="mt-0.5 h-4 min-w-4 shrink-0 rounded bg-brand-50 px-1 text-center font-sans text-[10px] font-bold leading-4 text-brand-700">
                                  {si + 1}
                                </span>
                                <span>{s}</span>
                              </li>
                            ))}
                          </ol>
                        ) : (
                          <textarea
                            rows={c.singleLine ? 1 : 2}
                            value={value}
                            maxLength={c.maxLength}
                            spellCheck={false}
                            placeholder={r === 0 ? c.placeholder : undefined}
                            aria-label={`${r + 1}행 ${c.label}`}
                            onFocus={() => {
                              typingCell.current = null;
                            }}
                            onChange={(e) =>
                              editCell(r, c.key, c.singleLine ? e.target.value.replace(/\n/g, " ") : e.target.value)
                            }
                            onPaste={(e) => handlePaste(e, r, ci)}
                            className={`block min-h-[2.5rem] w-full resize-none rounded-md border border-transparent bg-transparent px-2 py-1.5 text-slate-800 outline-none [field-sizing:content] placeholder:text-slate-400 focus:border-brand-300 focus:bg-white focus:ring-1 focus:ring-brand-200 ${
                              c.english ? "font-serif text-[13px] leading-relaxed" : "text-[13px]"
                            }`}
                          />
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center gap-2 pt-1">
        {footer ? (
          footer(addRow)
        ) : (
          <button
            type="button"
            onClick={addRow}
            disabled={rows.length >= maxRows}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 text-sm font-semibold text-slate-800 hover:bg-slate-50 disabled:opacity-40"
          >
            + 행 추가
          </button>
        )}
      </div>
      {notice ? <p className="text-xs font-semibold text-brand-700">{notice}</p> : null}
    </div>
  );
}

function IconButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 disabled:opacity-30"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        {children}
      </svg>
    </button>
  );
}

function ToolButton({ label, help, onClick }: { label: string; help: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={help}
      className="inline-flex h-8 items-center rounded-lg border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-700 hover:border-slate-400 hover:bg-slate-50"
    >
      {label}
    </button>
  );
}
