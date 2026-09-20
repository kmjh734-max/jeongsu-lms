"use client";

import { useMemo, useState } from "react";
import { Icon } from "@/components/layout/NavIcon";
import type { Textbook, TextbookUnit } from "@/lib/textbooks";

/** 교재 목차에서 단원 고르기 — 진도 칸에 넣을 글자를 돌려준다 */
export function UnitPickerModal({
  books,
  defaultBookId,
  onPick,
  onClose,
}: {
  books: Textbook[];
  defaultBookId?: string | null;
  onPick: (text: string, bookId: string) => void;
  onClose: () => void;
}) {
  const [bookId, setBookId] = useState(defaultBookId || books[0]?.id || "");
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const book = books.find((b) => b.id === bookId) ?? null;

  const childrenOf = useMemo(() => {
    const map = new Map<string, TextbookUnit[]>();
    for (const u of book?.units ?? []) {
      const key = u.parentId ?? "root";
      map.set(key, [...(map.get(key) ?? []), u]);
    }
    return map;
  }, [book]);

  const pathOf = (unit: TextbookUnit): string => {
    const names: string[] = [unit.title];
    let cur = unit;
    for (let i = 0; i < 4 && cur.parentId; i++) {
      const parent = book?.units.find((u) => u.id === cur.parentId);
      if (!parent) break;
      names.unshift(parent.title);
      cur = parent;
    }
    return names.join(" ");
  };

  function renderUnits(parentKey: string, depth: number) {
    const list = childrenOf.get(parentKey) ?? [];
    return list.map((u) => {
      const kids = childrenOf.get(u.id) ?? [];
      const isOpen = open[u.id] ?? depth === 0;
      return (
        <li key={u.id}>
          <div className="flex items-center gap-1" style={{ paddingLeft: depth * 14 }}>
            {kids.length > 0 ? (
              <button
                type="button"
                onClick={() => setOpen((p) => ({ ...p, [u.id]: !isOpen }))}
                className="flex h-6 w-6 items-center justify-center text-slate-400 hover:text-slate-700"
                aria-label={isOpen ? "접기" : "펼치기"}
              >
                <Icon name="chevron" size={14} className={isOpen ? "rotate-90" : ""} />
              </button>
            ) : (
              <span className="w-6" />
            )}
            <button
              type="button"
              onClick={() => onPick(u.pages ? `${pathOf(u)} (${u.pages})` : pathOf(u), bookId)}
              className="flex-1 rounded-md px-2 py-1 text-left text-sm text-slate-800 hover:bg-brand-50"
            >
              {u.title}
              {u.pages ? <span className="ml-1.5 text-xs text-slate-400">{u.pages}</span> : null}
            </button>
          </div>
          {kids.length > 0 && isOpen ? <ul>{renderUnits(u.id, depth + 1)}</ul> : null}
        </li>
      );
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="flex max-h-[85vh] w-full max-w-lg flex-col rounded-2xl bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <div className="min-w-0 flex-1">
            <h2 className="text-base font-bold text-slate-900">목차에서 고르기</h2>
            <select value={bookId} onChange={(e) => setBookId(e.target.value)} className="ui-input mt-2 h-9 text-sm">
              {books.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.title}
                </option>
              ))}
            </select>
          </div>
          <button type="button" onClick={onClose} aria-label="닫기" className="text-slate-400 hover:text-slate-700">
            <Icon name="x" size={18} />
          </button>
        </div>
        <ul className="min-h-[200px] flex-1 overflow-y-auto px-3 py-2">
          {books.length === 0 ? (
            <li className="px-3 py-6 text-center text-sm text-slate-500">
              올려 둔 교재가 없어요. 관리 화면의 &lsquo;교재 목차&rsquo;에서 먼저 올려 주세요.
            </li>
          ) : (
            renderUnits("root", 0)
          )}
        </ul>
      </div>
    </div>
  );
}
