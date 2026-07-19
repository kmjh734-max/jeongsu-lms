"use client";

interface PickerSet {
  id: string;
  title: string;
  folder_id: string | null;
}

interface FolderOption {
  id: string;
  name: string;
}

interface ListeningSetFolderPickerProps {
  sets: PickerSet[];
  folders?: FolderOption[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  emptyLabel?: string;
}

interface Group {
  key: string;
  name: string;
  sets: PickerSet[];
}

export function ListeningSetFolderPicker({
  sets,
  folders = [],
  selectedIds,
  onChange,
  emptyLabel = "선택할 수 있는 세트가 없습니다.",
}: ListeningSetFolderPickerProps) {
  const selected = new Set(selectedIds);
  const folderNames = new Map(folders.map((f) => [f.id, f.name]));

  const byFolder = new Map<string, PickerSet[]>();
  const uncategorized: PickerSet[] = [];
  for (const s of sets) {
    if (s.folder_id && folderNames.has(s.folder_id)) {
      const arr = byFolder.get(s.folder_id) ?? [];
      arr.push(s);
      byFolder.set(s.folder_id, arr);
    } else {
      uncategorized.push(s);
    }
  }

  const groups: Group[] = [];
  for (const f of folders) {
    const arr = byFolder.get(f.id);
    if (arr && arr.length > 0) {
      groups.push({ key: f.id, name: f.name, sets: arr });
    }
  }
  if (uncategorized.length > 0) {
    groups.push({ key: "__none", name: "미분류", sets: uncategorized });
  }

  function toggleSet(id: string) {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onChange([...next]);
  }

  function toggleGroup(groupSets: PickerSet[], allSelected: boolean) {
    const next = new Set(selected);
    for (const s of groupSets) {
      if (allSelected) next.delete(s.id);
      else next.add(s.id);
    }
    onChange([...next]);
  }

  if (sets.length === 0) {
    return <p className="text-sm text-slate-500">{emptyLabel}</p>;
  }

  const showFolderHeaders = groups.length > 1 || groups[0]?.key !== "__none";

  return (
    <div className="space-y-3">
      {groups.map((g) => {
        const selCount = g.sets.filter((s) => selected.has(s.id)).length;
        const allSelected = selCount === g.sets.length;
        const someSelected = selCount > 0 && !allSelected;
        return (
          <div key={g.key}>
            {showFolderHeaders && (
              <label className="flex cursor-pointer items-center gap-2 rounded bg-slate-50 px-2 py-1.5">
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = someSelected;
                  }}
                  onChange={() => toggleGroup(g.sets, allSelected)}
                />
                <span className="text-sm font-semibold text-slate-800">
                  {g.name}
                </span>
                <span className="ml-auto text-xs text-slate-400">
                  {selCount}/{g.sets.length}
                </span>
              </label>
            )}
            <ul className={showFolderHeaders ? "ml-5 mt-1 space-y-0.5" : "space-y-0.5"}>
              {g.sets.map((s) => (
                <li key={s.id}>
                  <label className="flex cursor-pointer items-center gap-2 rounded px-1 py-1 hover:bg-slate-50">
                    <input
                      type="checkbox"
                      checked={selected.has(s.id)}
                      onChange={() => toggleSet(s.id)}
                    />
                    <span className="text-sm text-slate-800">{s.title}</span>
                  </label>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
