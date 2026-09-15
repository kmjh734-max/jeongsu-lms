"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import * as adminActions from "@/app/admin/vocab/actions";
import * as adminReorder from "@/app/admin/vocab/reorder-actions";
import * as teacherActions from "@/app/teacher/vocab/actions";
import * as teacherReorder from "@/app/teacher/vocab/reorder-actions";
import { Icon } from "@/components/layout/NavIcon";
import { Button } from "@/components/ui/Button";
import { VocabAssignModal } from "@/components/vocab/VocabAssignModal";
import { VocabFolderColumn } from "@/components/vocab/VocabFolderColumn";
import {
  Checkbox,
  ModalShell,
  ProgressBar,
  RowMenu,
  useToast,
} from "@/components/vocab/VocabUi";
import {
  formatShortDate,
  vocabBasePath,
  type VocabModuleFolder,
  type VocabRole,
  type VocabSetListRow,
  type VocabSetsFilter,
} from "@/lib/vocab/module-types";

type SortMode = "manual" | "recent";

const GRID =
  "grid grid-cols-[16px_16px_minmax(0,1fr)_64px_120px_150px_70px_28px] items-center gap-3.5";

function reorderList(items: VocabSetListRow[], fromId: string, toId: string) {
  const from = items.findIndex((s) => s.id === fromId);
  const to = items.findIndex((s) => s.id === toId);
  if (from < 0 || to < 0 || from === to) return items;
  const next = [...items];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved!);
  return next;
}

export function VocabSetsBrowser({
  role,
  filter,
  heading,
  rows,
  folders,
  mySetCount,
  unfiledCount,
  lockedUnfiledCount,
  canReorder,
}: {
  role: VocabRole;
  filter: VocabSetsFilter;
  heading: string;
  rows: VocabSetListRow[];
  folders: VocabModuleFolder[];
  mySetCount: number;
  unfiledCount: number;
  lockedUnfiledCount: number;
  canReorder: boolean;
}) {
  const router = useRouter();
  const base = vocabBasePath(role);
  const actions = role === "admin" ? adminActions : teacherActions;
  const reorderAction =
    role === "admin"
      ? adminReorder.reorderVocabSetsInFolder
      : teacherReorder.reorderVocabSetsInFolder;
  const [toast, showToast] = useToast();

  const [ordered, setOrdered] = useState(rows);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortMode>("manual");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [assignIds, setAssignIds] = useState<string[] | null>(null);
  const [pick, setPick] = useState<{ kind: "move" | "copy"; ids: string[] } | null>(null);
  const [busy, setBusy] = useState(false);
  const [dragId, setDragId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);

  useEffect(() => {
    setOrdered(rows);
    setSelected((prev) => {
      const ids = new Set(rows.map((r) => r.id));
      const next = new Set([...prev].filter((id) => ids.has(id)));
      return next.size === prev.size ? prev : next;
    });
  }, [rows]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q ? ordered.filter((s) => s.title.toLowerCase().includes(q)) : ordered;
    if (sort === "recent") {
      return [...list].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    }
    return list;
  }, [ordered, query, sort]);

  const dragEnabled = canReorder && sort === "manual" && !query.trim() && !busy;
  const byId = useMemo(() => new Map(ordered.map((s) => [s.id, s])), [ordered]);
  const selectedRows = [...selected].map((id) => byId.get(id)).filter(Boolean) as VocabSetListRow[];
  const allVisibleOn = visible.length > 0 && visible.every((s) => selected.has(s.id));
  const someVisibleOn = visible.some((s) => selected.has(s.id));
  const currentFolderId = filter.kind === "folder" ? filter.folderId : null;
  const myFolders = folders.filter((f) => !f.isCurriculum);
  const lockedBlocksWrite = (s: VocabSetListRow) => s.isLocked && role === "teacher";

  function toggleOne(id: string, on: boolean) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (on) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  async function persistOrder(next: VocabSetListRow[]) {
    setBusy(true);
    let result: { ok: boolean; message: string };
    try {
      result = await reorderAction(
        currentFolderId,
        next.map((s) => s.id)
      );
    } catch {
      result = { ok: false, message: "순서를 저장하지 못했어요." };
    } finally {
      setBusy(false);
    }
    if (!result.ok) {
      showToast(result.message, "bad");
      setOrdered(rows);
      return;
    }
    router.refresh();
  }

  async function handleDelete(ids: string[]) {
    const targets = ids.map((id) => byId.get(id)).filter(Boolean) as VocabSetListRow[];
    const deletable = targets.filter((s) => !s.isLocked);
    const skipped = targets.length - deletable.length;
    if (deletable.length === 0) {
      showToast("학원 교재는 지울 수 없어요.", "bad");
      return;
    }
    const label =
      deletable.length === 1
        ? `‘${deletable[0]!.title}’ 단어장을`
        : `단어장 ${deletable.length}개를`;
    if (
      !window.confirm(
        `${label} 지울까요?\n학생 학습 기록도 함께 지워져요.${
          skipped ? `\n(학원 교재 ${skipped}개는 빼고 지워요)` : ""
        }`
      )
    ) {
      return;
    }
    setBusy(true);
    try {
      const result =
        deletable.length === 1
          ? await actions.deleteVocabSet(deletable[0]!.id, currentFolderId)
          : await actions.bulkDeleteVocabSets(
              deletable.map((s) => s.id),
              currentFolderId ?? undefined
            );
      if (!result.ok) {
        showToast(result.message, "bad");
        return;
      }
      setSelected(new Set());
      showToast(deletable.length === 1 ? "단어장을 지웠어요." : `${deletable.length}개를 지웠어요.`);
      router.refresh();
    } catch {
      showToast("지우지 못했어요. 잠시 뒤 다시 해 주세요.", "bad");
    } finally {
      setBusy(false);
    }
  }

  async function handlePick(kind: "move" | "copy", ids: string[], target: string) {
    const folderId = target || null;
    const folderName = folderId
      ? (folders.find((f) => f.id === folderId)?.name ?? "폴더")
      : "미분류";
    setBusy(true);
    let copied = 0;
    try {
      if (kind === "move") {
        const result =
          ids.length === 1
            ? await actions.moveVocabSet(ids[0]!, folderId)
            : await actions.bulkMoveVocabSets(ids, folderId);
        if (!result.ok) {
          showToast(result.message, "bad");
          return;
        }
        showToast(`${ids.length}개를 옮겼어요 · ${folderName}`);
      } else {
        for (const id of ids) {
          const result = await actions.copyVocabSet(id, folderId);
          if (!result.ok) {
            showToast(result.message, "bad");
            if (copied > 0) router.refresh();
            return;
          }
          copied += 1;
        }
        showToast(`${copied}개를 복사했어요 · ${folderName}`);
      }
      setPick(null);
      setSelected(new Set());
      router.refresh();
    } catch {
      showToast(
        kind === "move"
          ? "옮기지 못했어요. 잠시 뒤 다시 해 주세요."
          : "복사하지 못했어요. 잠시 뒤 다시 해 주세요.",
        "bad"
      );
      if (copied > 0) router.refresh();
    } finally {
      setBusy(false);
    }
  }

  function openPrint(ids: string[], mode?: "exam") {
    // 고른 순서가 아니라 화면 목록 순서대로 인쇄한다
    const listOrder = new Map<string, number>();
    visible.forEach((s, i) => listOrder.set(s.id, i));
    ordered.forEach((s, i) => {
      if (!listOrder.has(s.id)) listOrder.set(s.id, visible.length + i);
    });
    const sortedIds = [...ids].sort(
      (a, b) =>
        (listOrder.get(a) ?? Number.MAX_SAFE_INTEGER) -
        (listOrder.get(b) ?? Number.MAX_SAFE_INTEGER)
    );
    const params = new URLSearchParams({
      sets: sortedIds.join(","),
      back:
        filter.kind === "folder"
          ? `${base}/folder/${filter.folderId}`
          : filter.kind === "unfiled"
            ? `${base}/unfiled`
            : `${base}/sets`,
    });
    if (mode) params.set("mode", mode);
    window.open(`${base}/print?${params.toString()}`, "_blank", "noopener,noreferrer");
  }

  function rowMenu(s: VocabSetListRow) {
    return [
      {
        label: "단어 편집",
        icon: "edit",
        onSelect: () => router.push(`${base}/set/${s.id}`),
      },
      { label: "배정", icon: "users", onSelect: () => setAssignIds([s.id]) },
      {
        label: "폴더 이동",
        icon: "move",
        disabled: lockedBlocksWrite(s),
        onSelect: () => setPick({ kind: "move", ids: [s.id] }),
      },
      { label: "복사", icon: "copy", onSelect: () => setPick({ kind: "copy", ids: [s.id] }) },
      ...(s.isLocked
        ? []
        : [
            {
              label: "삭제",
              icon: "trash",
              danger: true,
              onSelect: () => void handleDelete([s.id]),
            },
          ]),
    ];
  }

  const emptyText =
    filter.kind === "folder"
      ? "이 폴더에 단어장이 없어요. 위의 ‘새 단어장’으로 만들어 보세요."
      : filter.kind === "unfiled"
        ? "폴더 밖에 있는 단어장이 없어요."
        : filter.kind === "locked"
          ? "학원 교재가 없어요."
          : "아직 단어장이 없어요. 위의 ‘새 단어장’으로 첫 단어장을 만들어 보세요.";

  return (
    <div className="flex flex-col gap-4 lg:flex-row">
      <VocabFolderColumn
        role={role}
        folders={folders}
        filter={filter}
        mySetCount={mySetCount}
        unfiledCount={unfiledCount}
        lockedUnfiledCount={lockedUnfiledCount}
        onMessage={showToast}
      />

      <section className="flex min-w-0 flex-1 flex-col gap-2.5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-baseline gap-2">
            <h2 className="truncate text-base font-bold text-slate-900">{heading}</h2>
            <span className="shrink-0 text-[13px] text-slate-500">
              {ordered.length}개{selected.size ? ` · ${selected.size}개 선택` : ""}
            </span>
          </div>
          <div className="flex gap-2">
            <div className="relative min-w-0 flex-1 sm:w-[220px] sm:flex-none">
              <Icon
                name="search"
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                className="ui-input h-9 pl-9"
                placeholder="단어장 이름 찾기"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label="단어장 이름 찾기"
              />
            </div>
            <select
              className="ui-select h-9 w-[120px] shrink-0 py-1.5"
              value={sort}
              onChange={(e) => setSort(e.target.value as SortMode)}
              aria-label="정렬"
            >
              <option value="manual">내 순서</option>
              <option value="recent">최근</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-card">
          <div className="min-w-[760px]">
            <div
              className={`${GRID} rounded-t-lg border-b border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-semibold text-slate-500`}
            >
              <Checkbox
                checked={allVisibleOn}
                indeterminate={someVisibleOn}
                disabled={visible.length === 0}
                label="보이는 단어장 모두 고르기"
                onChange={(on) =>
                  setSelected((prev) => {
                    const next = new Set(prev);
                    for (const s of visible) {
                      if (on) next.add(s.id);
                      else next.delete(s.id);
                    }
                    return next;
                  })
                }
              />
              <span />
              <span>단어장</span>
              <span>단어</span>
              <span>배정</span>
              <span>평균 진행</span>
              <span>합격</span>
              <span />
            </div>

            {visible.length === 0 ? (
              <p className="px-6 py-14 text-center text-sm text-slate-500">
                {query.trim() ? "찾는 단어장이 없어요." : emptyText}
              </p>
            ) : (
              <ul className={busy ? "opacity-70" : undefined}>
                {visible.map((s, i) => {
                  const on = selected.has(s.id);
                  const { stats } = s;
                  const sub = [formatShortDate(s.createdAt), s.teacherName]
                    .filter(Boolean)
                    .join(" · ");
                  return (
                    <li
                      key={s.id}
                      onDragOver={(e) => {
                        if (!dragId) return;
                        e.preventDefault();
                        e.dataTransfer.dropEffect = "move";
                        setOverId(s.id);
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        if (!dragId || dragId === s.id) return;
                        const next = reorderList(ordered, dragId, s.id);
                        setOrdered(next);
                        setDragId(null);
                        setOverId(null);
                        void persistOrder(next);
                      }}
                      className={`${GRID} h-[58px] px-4 transition ${
                        i > 0 ? "border-t border-slate-100" : ""
                      } ${on ? "bg-brand-50" : "hover:bg-slate-50/70"} ${
                        dragId === s.id ? "opacity-50" : ""
                      } ${overId === s.id && dragId !== s.id ? "shadow-[inset_0_2px_0_#2563c9]" : ""}`}
                    >
                      <Checkbox
                        checked={on}
                        label={`${s.title} 고르기`}
                        onChange={(v) => toggleOne(s.id, v)}
                      />
                      {dragEnabled ? (
                        <button
                          type="button"
                          draggable
                          onDragStart={(e) => {
                            e.dataTransfer.setData("text/plain", s.id);
                            e.dataTransfer.effectAllowed = "move";
                            setDragId(s.id);
                          }}
                          onDragEnd={() => {
                            setDragId(null);
                            setOverId(null);
                          }}
                          className="cursor-grab text-slate-400 hover:text-slate-600 active:cursor-grabbing"
                          title="끌어서 순서 바꾸기"
                          aria-label={`${s.title} 순서 바꾸기`}
                        >
                          <Icon name="grip" size={16} strokeWidth={2.4} />
                        </button>
                      ) : (
                        <span />
                      )}
                      <div className="flex min-w-0 flex-col gap-0.5">
                        <Link
                          href={`${base}/set/${s.id}`}
                          className="flex min-w-0 items-center gap-1.5 text-sm font-semibold text-slate-900 hover:text-brand-700"
                        >
                          {s.isLocked ? (
                            <Icon name="lock" size={13} className="text-slate-400" />
                          ) : null}
                          <span className="truncate">{s.title}</span>
                        </Link>
                        {sub ? <span className="truncate text-xs text-slate-400">{sub}</span> : null}
                      </div>
                      <span className="text-[13px] tabular-nums text-slate-700">
                        {s.itemCount}단어
                      </span>
                      <span
                        className={`truncate text-[13px] ${
                          stats.assignLabel ? "text-slate-700" : "text-slate-400"
                        }`}
                        title={stats.assignLabel ?? undefined}
                      >
                        {stats.assignLabel ?? "배정 안 됨"}
                      </span>
                      <div className="flex items-center gap-2">
                        {stats.avgProgress !== null ? (
                          <>
                            <div className="flex-1">
                              <ProgressBar pct={stats.avgProgress} />
                            </div>
                            <span className="w-[34px] text-right text-xs font-semibold tabular-nums text-slate-900">
                              {stats.avgProgress}%
                            </span>
                          </>
                        ) : (
                          <span className="text-xs text-slate-400">—</span>
                        )}
                      </div>
                      <span
                        className={`text-[13px] font-semibold tabular-nums ${
                          stats.assignedCount ? "text-green-700" : "text-slate-400"
                        }`}
                      >
                        {stats.assignedCount ? `${stats.passedCount}/${stats.assignedCount}` : "—"}
                      </span>
                      <RowMenu label={`${s.title} 메뉴`} items={rowMenu(s)} />
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
        {canReorder && sort === "manual" && !query.trim() && visible.length > 1 ? (
          <p className="px-1 text-xs text-slate-400">
            왼쪽 점 모양을 끌어서 순서를 바꿀 수 있어요. 학생 화면에도 이 순서로 보여요.
          </p>
        ) : null}
      </section>

      {selected.size > 0 ? (
        <div className="pointer-events-none fixed inset-x-0 bottom-6 z-40 flex justify-center px-4 lg:left-[244px]">
          <div className="pointer-events-auto flex max-w-full items-center gap-3.5 overflow-x-auto rounded-[10px] bg-side py-2.5 pl-[18px] pr-2.5 shadow-[0_12px_32px_rgba(15,23,42,0.25)]">
            <span className="shrink-0 whitespace-nowrap text-[13px] font-semibold text-white">
              {selected.size}개 선택
            </span>
            <div className="flex gap-1">
              {[
                { label: "배정", icon: "users", run: () => setAssignIds([...selected]) },
                { label: "시험지 인쇄", icon: "print", run: () => openPrint([...selected], "exam") },
                {
                  label: "폴더 이동",
                  icon: "move",
                  run: () => {
                    const ids = selectedRows.filter((s) => !lockedBlocksWrite(s)).map((s) => s.id);
                    if (ids.length === 0) {
                      showToast("학원 교재는 옮길 수 없어요. 복사해서 쓰세요.", "bad");
                      return;
                    }
                    setPick({ kind: "move", ids });
                  },
                },
                {
                  label: "복사",
                  icon: "copy",
                  run: () => setPick({ kind: "copy", ids: [...selected] }),
                },
                { label: "삭제", icon: "trash", run: () => void handleDelete([...selected]) },
              ].map((a) => (
                <button
                  key={a.label}
                  type="button"
                  disabled={busy}
                  onClick={a.run}
                  className="flex h-9 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-md bg-white/10 px-3 text-[13px] font-semibold text-white transition hover:bg-white/20 disabled:opacity-50"
                >
                  <Icon name={a.icon} size={16} strokeWidth={2} />
                  {a.label}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setSelected(new Set())}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-white/70 hover:bg-white/10 hover:text-white"
                aria-label="선택 풀기"
                title="선택 풀기"
              >
                <Icon name="x" size={16} strokeWidth={2} />
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <VocabAssignModal
        open={assignIds !== null}
        onClose={() => setAssignIds(null)}
        role={role}
        setIds={assignIds ?? []}
        fallbackTitle={assignIds?.[0] ? byId.get(assignIds[0])?.title : undefined}
      />

      <FolderPickDialog
        pick={pick}
        onClose={() => setPick(null)}
        busy={busy}
        folders={myFolders}
        sourceFolderId={
          pick
            ? (() => {
                const f = new Set(pick.ids.map((id) => byId.get(id)?.folderId ?? null));
                return f.size === 1 ? [...f][0]! : undefined;
              })()
            : undefined
        }
        titleOf={(id) => byId.get(id)?.title ?? "단어장"}
        onConfirm={(target) => pick && void handlePick(pick.kind, pick.ids, target)}
      />

      {toast}
    </div>
  );
}

function FolderPickDialog({
  pick,
  onClose,
  busy,
  folders,
  sourceFolderId,
  titleOf,
  onConfirm,
}: {
  pick: { kind: "move" | "copy"; ids: string[] } | null;
  onClose: () => void;
  busy: boolean;
  folders: { id: string; name: string }[];
  /** 고른 단어장들이 모두 같은 폴더에 있으면 그 폴더(null = 미분류), 섞여 있으면 undefined */
  sourceFolderId: string | null | undefined;
  titleOf: (id: string) => string;
  onConfirm: (target: string) => void;
}) {
  const [target, setTarget] = useState("");
  const isMove = pick?.kind === "move";
  const all = [{ id: "", name: "미분류" }, ...folders];
  const options =
    isMove && sourceFolderId !== undefined
      ? all.filter((f) => (f.id || null) !== sourceFolderId)
      : all;

  useEffect(() => {
    if (!pick) return;
    const source = sourceFolderId ?? "";
    setTarget(
      !isMove && options.some((o) => o.id === source) ? source : (options[0]?.id ?? "")
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 창을 열 때 한 번만 기본값을 정한다
  }, [pick]);

  const count = pick?.ids.length ?? 0;
  const subject = count === 1 && pick ? `‘${titleOf(pick.ids[0]!)}’` : `단어장 ${count}개`;

  return (
    <ModalShell
      open={pick !== null}
      onClose={onClose}
      busy={busy}
      title={isMove ? "폴더 이동" : "복사"}
      subtitle={subject}
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose} disabled={busy}>
            닫기
          </Button>
          <Button onClick={() => onConfirm(target)} disabled={busy || options.length === 0}>
            {busy ? "처리 중…" : isMove ? "옮기기" : "복사하기"}
          </Button>
        </div>
      }
    >
      <div className="px-5 py-5 sm:px-[22px]">
        {options.length === 0 ? (
          <p className="text-sm text-slate-500">옮길 폴더가 없어요. 왼쪽 ‘내 세트 +’로 폴더를 만들어 주세요.</p>
        ) : (
          <>
            <label className="ui-label" htmlFor="vocab-pick-folder">
              {isMove ? "옮길 폴더" : "복사본을 둘 폴더"}
            </label>
            <select
              id="vocab-pick-folder"
              className="ui-select"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
            >
              {options.map((f) => (
                <option key={f.id || "unfiled"} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
          </>
        )}
      </div>
    </ModalShell>
  );
}
