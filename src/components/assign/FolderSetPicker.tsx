"use client";

import { useMemo, useState } from "react";

/**
 * 폴더로 묶어 고르는 목록. 단어장·듣기 세트가 같이 쓴다.
 *
 * 선생님 요청(2026-09-28): "폴더별 세트별 따로 하게 해 줘. 너무 불편해.
 * 여러 개를 고를 수 있게 전체선택 기능도 있다든가."
 *
 * 폴더 줄을 누르면 폴더 통째로, 펼쳐서 하나씩도 고른다. 찾기와 전체 고르기가 있고,
 * 폴더는 접어 둘 수 있다(폴더 10개 × 세트 30개여도 한눈에 보이게).
 */

export type PickerItem = {
  id: string;
  title: string;
  folderId: string | null;
  /** 오른쪽에 작게 붙는 말 (예: "40단어") */
  sub?: string;
};

export type PickerFolder = { id: string; name: string };

export function FolderSetPicker({
  items,
  folders,
  selectedIds,
  onChange,
  placeholder = "이름으로 찾기",
  emptyText = "고를 수 있는 것이 없어요.",
}: {
  items: PickerItem[];
  folders: PickerFolder[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  placeholder?: string;
  emptyText?: string;
}) {
  const [query, setQuery] = useState("");
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const selected = useMemo(() => new Set(selectedIds), [selectedIds]);

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    const folderName = new Map(folders.map((f) => [f.id, f.name]));
    const hit = (it: PickerItem) => {
      if (!q) return true;
      const folder = it.folderId ? (folderName.get(it.folderId) ?? "") : "미분류";
      return `${it.title} ${folder}`.toLowerCase().includes(q);
    };
    const byFolder = new Map<string, PickerItem[]>();
    for (const it of items.filter(hit)) {
      const key = it.folderId && folderName.has(it.folderId) ? it.folderId : "__none";
      byFolder.set(key, [...(byFolder.get(key) ?? []), it]);
    }
    const out: { key: string; name: string; items: PickerItem[] }[] = [];
    for (const f of folders) {
      const arr = byFolder.get(f.id);
      if (arr?.length) out.push({ key: f.id, name: f.name, items: arr });
    }
    const none = byFolder.get("__none");
    if (none?.length) out.push({ key: "__none", name: "폴더 없음", items: none });
    return out;
  }, [items, folders, query]);

  const visibleIds = useMemo(() => groups.flatMap((g) => g.items.map((i) => i.id)), [groups]);
  const visibleOn = visibleIds.filter((id) => selected.has(id)).length;

  function setMany(ids: string[], on: boolean) {
    const next = new Set(selected);
    for (const id of ids) {
      if (on) next.add(id);
      else next.delete(id);
    }
    onChange([...next]);
  }

  return (
    <div className="flex min-h-0 flex-col gap-2.5">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="ui-input h-10 px-3 text-sm"
      />

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setMany(visibleIds, true)}
          disabled={visibleIds.length === 0}
          className="h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40"
        >
          보이는 것 모두 고르기
        </button>
        <button
          type="button"
          onClick={() => setMany(visibleIds, false)}
          disabled={visibleOn === 0}
          className="h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40"
        >
          모두 풀기
        </button>
        <span className="ml-auto text-xs font-bold text-brand-700">{selected.size}개 고름</span>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto rounded-xl border border-slate-200">
        {groups.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm text-slate-500">
            {query.trim() ? "찾는 것이 없어요." : emptyText}
          </p>
        ) : (
          groups.map((g) => {
            const ids = g.items.map((i) => i.id);
            const on = ids.filter((id) => selected.has(id)).length;
            const all = on === ids.length;
            const shut = collapsed.has(g.key);
            return (
              <div key={g.key} className="border-b border-slate-100 last:border-b-0">
                <div className={`flex items-center gap-2.5 px-3 py-2.5 ${all ? "bg-brand-50" : "bg-slate-50"}`}>
                  <input
                    type="checkbox"
                    className="h-4 w-4 accent-brand-600"
                    checked={all}
                    ref={(el) => {
                      if (el) el.indeterminate = on > 0 && !all;
                    }}
                    onChange={() => setMany(ids, !all)}
                    aria-label={`${g.name} 폴더 모두 고르기`}
                  />
                  <span className="text-sm font-bold text-slate-900">{g.name}</span>
                  <span className="ml-auto text-xs font-semibold tabular-nums text-slate-500">
                    {on} / {ids.length}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setCollapsed((prev) => {
                        const next = new Set(prev);
                        if (next.has(g.key)) next.delete(g.key);
                        else next.add(g.key);
                        return next;
                      })
                    }
                    className="rounded px-1.5 py-0.5 text-xs font-medium text-slate-500 hover:bg-white hover:text-slate-800"
                  >
                    {shut ? "펼치기" : "접기"}
                  </button>
                </div>
                {shut ? null : (
                  <ul className="py-1">
                    {g.items.map((it) => (
                      <li key={it.id}>
                        <label className="flex cursor-pointer items-center gap-2.5 py-1.5 pl-9 pr-3 hover:bg-slate-50">
                          <input
                            type="checkbox"
                            className="h-4 w-4 accent-brand-600"
                            checked={selected.has(it.id)}
                            onChange={() => setMany([it.id], !selected.has(it.id))}
                          />
                          <span className="min-w-0 flex-1 truncate text-[13px] text-slate-800">{it.title}</span>
                          {it.sub ? <span className="text-[11px] text-slate-400">{it.sub}</span> : null}
                        </label>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
