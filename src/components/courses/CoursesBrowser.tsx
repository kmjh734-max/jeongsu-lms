"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  createCourseFolderAction,
  deleteCourseFolderAction,
  moveCoursesToFolderAction,
  purgeCoursesAction,
  renameCourseFolderAction,
  reorderCoursesAction,
  restoreCoursesAction,
  setCoursesArchivedAction,
  setCoursesPublishedAction,
  trashCoursesAction,
} from "@/app/admin/courses/actions";
import { Icon } from "@/components/layout/NavIcon";
import { Button, ButtonLink } from "@/components/ui/Button";
import { ModalShell, useToast } from "@/components/vocab/VocabUi";
import { formatDuration } from "@/lib/video/format-duration";
import type { CourseCard } from "@/lib/courses/course-cards";
import type { CourseFolder, CourseScope } from "@/lib/courses/load-courses-page";
import { TRASH_DAYS } from "@/lib/courses/trash-days";

type SortMode = "manual" | "recent" | "title" | "students";

const UNFILED = "__unfiled";

/**
 * 동영상강좌 목록 — 왼쪽 폴더, 가운데 강좌, 고르면 아래 막대.
 * 단어학습 세트 목록과 같은 얼개다(선생님 요청 2026-09-28: 방식을 통일).
 */
export function CoursesBrowser({
  cards,
  folders,
  counts,
  scope,
  basePath,
  canPurge,
  showTeacher,
}: {
  cards: CourseCard[];
  folders: CourseFolder[];
  counts: { alive: number; archived: number; trash: number };
  scope: CourseScope;
  basePath: string;
  /** 완전히 지우기는 관리자만 */
  canPurge: boolean;
  showTeacher?: boolean;
}) {
  const router = useRouter();
  const [toast, showToast] = useToast();

  const [ordered, setOrdered] = useState(cards);
  const [folderFilter, setFolderFilter] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortMode>("manual");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);
  const [movePick, setMovePick] = useState<string[] | null>(null);
  const [newFolderOpen, setNewFolderOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [dragId, setDragId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);

  useEffect(() => {
    setOrdered(cards);
    setSelected((prev) => {
      const alive = new Set(cards.map((c) => c.course.id));
      const next = new Set([...prev].filter((id) => alive.has(id)));
      return next.size === prev.size ? prev : next;
    });
  }, [cards]);

  const folderName = useMemo(
    () => new Map(folders.map((f) => [f.id, f.name])),
    [folders]
  );

  const countsByFolder = useMemo(() => {
    const m = new Map<string, number>();
    for (const c of ordered) {
      const key = c.course.folder_id && folderName.has(c.course.folder_id) ? c.course.folder_id : UNFILED;
      m.set(key, (m.get(key) ?? 0) + 1);
    }
    return m;
  }, [ordered, folderName]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = ordered.filter((c) => {
      const key = c.course.folder_id && folderName.has(c.course.folder_id) ? c.course.folder_id : UNFILED;
      if (folderFilter && key !== folderFilter) return false;
      if (q && !c.course.title.toLowerCase().includes(q)) return false;
      return true;
    });
    if (sort === "recent") {
      list = [...list].sort((a, b) => b.course.created_at.localeCompare(a.course.created_at));
    } else if (sort === "title") {
      list = [...list].sort((a, b) => a.course.title.localeCompare(b.course.title, "ko"));
    } else if (sort === "students") {
      list = [...list].sort((a, b) => b.studentCount - a.studentCount);
    }
    return list;
  }, [ordered, folderFilter, query, sort, folderName]);

  const dragEnabled = scope === "alive" && sort === "manual" && !query.trim() && !busy;
  const allVisibleOn = visible.length > 0 && visible.every((c) => selected.has(c.course.id));
  const someVisibleOn = visible.some((c) => selected.has(c.course.id));
  const pickedStudents = visible
    .filter((c) => selected.has(c.course.id))
    .reduce((s, c) => s + c.studentCount, 0);

  function toggleOne(id: string, on: boolean) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (on) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  async function run(
    fn: () => Promise<{ ok: boolean; message: string }>,
    opts?: { clear?: boolean }
  ) {
    setBusy(true);
    try {
      const r = await fn();
      showToast(r.message, r.ok ? "good" : "bad");
      if (r.ok) {
        if (opts?.clear !== false) setSelected(new Set());
        router.refresh();
      }
    } catch {
      showToast("처리하지 못했어요. 잠시 뒤 다시 해 주세요.", "bad");
    } finally {
      setBusy(false);
    }
  }

  function handleTrash(ids: string[]) {
    const count = ids.length;
    const students = ordered
      .filter((c) => ids.includes(c.course.id))
      .reduce((s, c) => s + c.studentCount, 0);
    const who = students > 0 ? `\n지금 ${students}명이 듣고 있어요.` : "";
    if (
      !window.confirm(
        `강좌 ${count}개를 휴지통으로 옮길까요?${who}\n\n학생 화면에서 바로 사라지지만, ${TRASH_DAYS}일 안에 되돌릴 수 있어요. 진도 기록은 지워지지 않아요.`
      )
    ) {
      return;
    }
    void run(() => trashCoursesAction(ids));
  }

  function handlePurge(ids: string[]) {
    if (
      !window.confirm(
        `강좌 ${ids.length}개를 완전히 지울까요?\n\n영상·수강 배정·진도 기록이 함께 사라지고 되돌릴 수 없어요.`
      )
    ) {
      return;
    }
    void run(() => purgeCoursesAction(ids));
  }

  async function persistOrder(next: CourseCard[]) {
    setOrdered(next);
    await run(() => reorderCoursesAction(next.map((c) => c.course.id)), { clear: false });
  }

  function reorderList(fromId: string, toId: string) {
    const from = ordered.findIndex((c) => c.course.id === fromId);
    const to = ordered.findIndex((c) => c.course.id === toId);
    if (from < 0 || to < 0 || from === to) return;
    const next = [...ordered];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved!);
    void persistOrder(next);
  }

  const scopeTabs: Array<{ key: CourseScope; label: string; count: number; href: string }> = [
    { key: "alive", label: "강좌", count: counts.alive, href: basePath },
    { key: "archived", label: "보관함", count: counts.archived, href: `${basePath}?보기=보관함` },
    { key: "trash", label: "휴지통", count: counts.trash, href: `${basePath}?보기=휴지통` },
  ];

  const emptyText =
    scope === "trash"
      ? "휴지통이 비어 있어요."
      : scope === "archived"
        ? "보관한 강좌가 없어요."
        : query.trim()
          ? "찾는 강좌가 없어요."
          : "아직 강좌가 없어요. 오른쪽 위 ‘새 강좌’로 시작해 보세요.";

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
      {/* 폴더 */}
      <aside className="w-full shrink-0 rounded-lg border border-slate-200 bg-white px-2.5 py-3.5 shadow-card lg:w-[208px]">
        <div className="flex items-center justify-between px-1 pb-1.5">
          <span className="text-xs font-semibold text-slate-500">카테고리</span>
          {scope === "alive" ? (
            <button
              type="button"
              onClick={() => setNewFolderOpen(true)}
              aria-label="폴더 만들기"
              className="flex h-6 w-6 items-center justify-center rounded text-slate-500 hover:bg-slate-100 hover:text-slate-800"
            >
              <Icon name="plus" size={16} strokeWidth={2} />
            </button>
          ) : null}
        </div>

        <FolderRow
          name="전체"
          count={ordered.length}
          icon="folder"
          on={folderFilter === null}
          onClick={() => setFolderFilter(null)}
        />
        <FolderRow
          name="미분류"
          count={countsByFolder.get(UNFILED) ?? 0}
          icon="folder"
          on={folderFilter === UNFILED}
          onClick={() => setFolderFilter(UNFILED)}
        />
        {folders.map((f) =>
          renamingId === f.id ? (
            <div key={f.id} className="px-1 py-0.5">
              <input
                autoFocus
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                onBlur={() => {
                  const name = renameValue.trim();
                  setRenamingId(null);
                  if (name && name !== f.name) void run(() => renameCourseFolderAction(f.id, name));
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") e.currentTarget.blur();
                  if (e.key === "Escape") setRenamingId(null);
                }}
                aria-label="폴더 이름"
                className="ui-input h-8 py-1"
              />
            </div>
          ) : (
            <FolderRow
              key={f.id}
              name={f.name}
              count={countsByFolder.get(f.id) ?? 0}
              icon="folder"
              on={folderFilter === f.id}
              onClick={() => setFolderFilter(f.id)}
              menu={
                scope === "alive"
                  ? {
                      onRename: () => {
                        setRenamingId(f.id);
                        setRenameValue(f.name);
                      },
                      onDelete: () => {
                        if (
                          window.confirm(
                            `「${f.name}」 폴더를 지울까요?\n안에 있던 강좌는 미분류로 옮겨져요. 강좌는 지워지지 않아요.`
                          )
                        ) {
                          void run(() => deleteCourseFolderAction(f.id));
                        }
                      },
                    }
                  : undefined
              }
            />
          )
        )}
        {newFolderOpen ? (
          <div className="px-1 pt-1">
            <input
              autoFocus
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onBlur={() => {
                const name = newFolderName.trim();
                setNewFolderName("");
                setNewFolderOpen(false);
                if (name) void run(() => createCourseFolderAction(name));
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") e.currentTarget.blur();
                if (e.key === "Escape") {
                  setNewFolderName("");
                  setNewFolderOpen(false);
                }
              }}
              placeholder="새 폴더 이름"
              aria-label="새 폴더 이름"
              className="ui-input h-8 py-1"
            />
          </div>
        ) : null}

        <div className="mx-1 my-2.5 h-px bg-slate-100" />
        <span className="block px-1 pb-1.5 text-xs font-semibold text-slate-500">보기</span>
        {scopeTabs.map((t) => (
          <Link
            key={t.key}
            href={t.href}
            className={`flex h-[34px] items-center justify-between rounded-md px-2.5 text-[13px] ${
              scope === t.key ? "bg-brand-50 font-semibold text-brand-700" : "text-slate-800 hover:bg-slate-50"
            }`}
          >
            <span className="flex items-center gap-2">
              <Icon
                name={t.key === "trash" ? "trash" : t.key === "archived" ? "download" : "video"}
                size={15}
                className={scope === t.key ? "text-brand-700" : "text-slate-400"}
              />
              {t.label}
            </span>
            <span className={`text-xs tabular-nums ${scope === t.key ? "text-brand-700" : "text-slate-400"}`}>
              {t.count}
            </span>
          </Link>
        ))}
      </aside>

      {/* 목록 */}
      <section className="flex min-w-0 flex-1 flex-col gap-2.5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-baseline gap-2">
            <h2 className="truncate text-base font-bold text-slate-900">
              {folderFilter === null
                ? scope === "trash"
                  ? "휴지통"
                  : scope === "archived"
                    ? "보관함"
                    : "전체"
                : folderFilter === UNFILED
                  ? "미분류"
                  : (folderName.get(folderFilter) ?? "폴더")}
            </h2>
            <span className="shrink-0 text-[13px] text-slate-500">
              {visible.length}개{selected.size ? ` · ${selected.size}개 선택` : ""}
            </span>
          </div>
          <div className="flex gap-2">
            <div className="relative min-w-0 flex-1 sm:w-[200px] sm:flex-none">
              <Icon
                name="search"
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                className="ui-input h-9 pl-9"
                placeholder="강좌 이름 찾기"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label="강좌 이름 찾기"
              />
            </div>
            <select
              className="ui-select h-9 w-[124px] shrink-0 py-1.5"
              value={sort}
              onChange={(e) => setSort(e.target.value as SortMode)}
              aria-label="정렬"
            >
              <option value="manual">내 순서</option>
              <option value="recent">최근</option>
              <option value="title">이름</option>
              <option value="students">수강생 많은 순</option>
            </select>
          </div>
        </div>

        {scope === "trash" ? (
          <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[13px] text-amber-900">
            휴지통에 있는 강좌는 학생 화면에 보이지 않아요. {TRASH_DAYS}일이 지나면 저절로 비워집니다.
            진도 기록은 지워지지 않아, 되돌리면 그대로 이어져요.
          </p>
        ) : scope === "archived" ? (
          <p className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-[13px] text-slate-600">
            보관한 강좌는 목록에서 접혀 있지만, <b>듣던 학생은 계속 볼 수 있어요.</b> 새로 배정만 막습니다.
          </p>
        ) : null}

        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-card">
          {visible.length > 0 ? (
            <div className="flex items-center gap-3 border-b border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-semibold text-slate-500">
              <input
                type="checkbox"
                className="h-4 w-4 accent-brand-600"
                aria-label="보이는 강좌 모두 고르기"
                checked={allVisibleOn}
                ref={(el) => {
                  if (el) el.indeterminate = !allVisibleOn && someVisibleOn;
                }}
                onChange={(e) => {
                  const on = e.target.checked;
                  setSelected((prev) => {
                    const next = new Set(prev);
                    for (const c of visible) {
                      if (on) next.add(c.course.id);
                      else next.delete(c.course.id);
                    }
                    return next;
                  });
                }}
              />
              <span className="flex-1">강좌</span>
              <span className="hidden w-[150px] sm:block">영상 · 수강생</span>
              <span className="w-[70px] text-right">상태</span>
            </div>
          ) : null}

          {visible.length === 0 ? (
            <p className="px-6 py-14 text-center text-sm text-slate-500">{emptyText}</p>
          ) : (
            <ul className={busy ? "opacity-70" : undefined}>
              {visible.map((c, i) => {
                const { course } = c;
                const on = selected.has(course.id);
                const trashed = Boolean(course.deleted_at);
                return (
                  <li
                    key={course.id}
                    onDragOver={(e) => {
                      if (!dragId) return;
                      e.preventDefault();
                      setOverId(course.id);
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (dragId && dragId !== course.id) reorderList(dragId, course.id);
                      setDragId(null);
                      setOverId(null);
                    }}
                    className={`flex items-center gap-3 px-4 py-2.5 transition ${
                      i > 0 ? "border-t border-slate-100" : ""
                    } ${on ? "bg-brand-50" : "hover:bg-slate-50/70"} ${
                      dragId === course.id ? "opacity-50" : ""
                    } ${overId === course.id && dragId !== course.id ? "shadow-[inset_0_2px_0_#2563c9]" : ""}`}
                  >
                    <input
                      type="checkbox"
                      className="h-4 w-4 shrink-0 accent-brand-600"
                      aria-label={`${course.title} 고르기`}
                      checked={on}
                      onChange={(e) => toggleOne(course.id, e.target.checked)}
                    />
                    {dragEnabled ? (
                      <button
                        type="button"
                        draggable
                        onDragStart={() => setDragId(course.id)}
                        onDragEnd={() => {
                          setDragId(null);
                          setOverId(null);
                        }}
                        className="hidden cursor-grab text-slate-400 hover:text-slate-600 active:cursor-grabbing sm:block"
                        title="끌어서 차례 바꾸기"
                        aria-label={`${course.title} 차례 바꾸기`}
                      >
                        <Icon name="grip" size={16} strokeWidth={2.4} />
                      </button>
                    ) : null}

                    <span className="relative hidden h-9 w-16 shrink-0 overflow-hidden rounded bg-slate-100 sm:block">
                      {c.thumbnail ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={c.thumbnail} alt="" loading="lazy" className="h-full w-full object-cover" />
                      ) : (
                        <span className="flex h-full items-center justify-center text-slate-300">
                          <Icon name="video" size={16} />
                        </span>
                      )}
                    </span>

                    <div className="flex min-w-0 flex-1 flex-col">
                      {trashed ? (
                        <span className="truncate text-sm font-semibold text-slate-700">{course.title}</span>
                      ) : (
                        <Link
                          href={`${basePath}/${course.id}`}
                          className="truncate text-sm font-semibold text-slate-900 hover:text-brand-700"
                        >
                          {course.title}
                        </Link>
                      )}
                      <span className="truncate text-xs text-slate-400">
                        {course.folder_id ? (folderName.get(course.folder_id) ?? "미분류") : "미분류"}
                        {showTeacher ? ` · ${c.teacherName ?? "담당 미배정"}` : ""}
                        {trashed ? ` · ${daysLeft(course.deleted_at!)}일 남음` : ""}
                      </span>
                    </div>

                    <span className="hidden w-[150px] shrink-0 text-[13px] text-slate-600 sm:block">
                      영상 {c.lessonCount} · 수강 {c.studentCount}
                      {c.totalSeconds > 0 ? (
                        <span className="block text-[11px] text-slate-400">
                          총 {formatDuration(c.totalSeconds)}
                        </span>
                      ) : null}
                    </span>

                    <span className="w-[70px] shrink-0 text-right">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                          trashed
                            ? "bg-rose-50 text-rose-700"
                            : course.archived_at
                              ? "bg-slate-100 text-slate-500"
                              : course.is_published
                                ? "bg-green-50 text-green-700"
                                : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {trashed ? "휴지통" : course.archived_at ? "보관" : course.is_published ? "공개" : "비공개"}
                      </span>
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {scope === "alive" && visible.length > 1 && sort === "manual" && !query.trim() ? (
          <p className="px-1 text-xs text-slate-400">
            손잡이를 끌어 차례를 바꿀 수 있어요. 학생 화면에도 이 차례로 보여요.
          </p>
        ) : null}
        {scope === "alive" && visible.length > 0 && selected.size === 0 ? (
          <p className="px-1 text-xs text-slate-400">
            왼쪽 네모로 강좌를 고르면 아래 막대에서 폴더를 옮기거나 공개·보관·휴지통으로 보낼 수 있어요.
          </p>
        ) : null}
      </section>

      {/* 아래 막대 */}
      {selected.size > 0 ? (
        <div className="pointer-events-none fixed inset-x-0 bottom-6 z-40 flex justify-center px-4 lg:left-[244px]">
          <div className="pointer-events-auto flex max-w-full items-center gap-3.5 overflow-x-auto rounded-[10px] bg-side py-2.5 pl-[18px] pr-2.5 shadow-[0_12px_32px_rgba(15,23,42,0.25)]">
            <span className="shrink-0 whitespace-nowrap text-[13px] font-semibold text-white">
              {selected.size}개 선택
              {pickedStudents > 0 ? (
                <span className="ml-1.5 font-normal text-white/60">수강 {pickedStudents}명</span>
              ) : null}
            </span>
            <div className="flex gap-1">
              {scope === "trash" ? (
                <>
                  <BarButton icon="upload" label="되돌리기" primary onClick={() => void run(() => restoreCoursesAction([...selected]))} busy={busy} />
                  {canPurge ? (
                    <BarButton icon="trash" label="완전히 지우기" danger onClick={() => handlePurge([...selected])} busy={busy} />
                  ) : null}
                </>
              ) : scope === "archived" ? (
                <>
                  <BarButton icon="upload" label="보관 풀기" primary onClick={() => void run(() => setCoursesArchivedAction([...selected], false))} busy={busy} />
                  <BarButton icon="trash" label="휴지통" danger onClick={() => handleTrash([...selected])} busy={busy} />
                </>
              ) : (
                <>
                  <BarButton icon="move" label="폴더 옮기기" primary onClick={() => setMovePick([...selected])} busy={busy} />
                  <BarButton icon="users" label="공개" onClick={() => void run(() => setCoursesPublishedAction([...selected], true))} busy={busy} />
                  <BarButton icon="lock" label="비공개" onClick={() => void run(() => setCoursesPublishedAction([...selected], false))} busy={busy} />
                  <BarButton icon="download" label="보관" onClick={() => void run(() => setCoursesArchivedAction([...selected], true))} busy={busy} />
                  <BarButton icon="trash" label="휴지통" danger onClick={() => handleTrash([...selected])} busy={busy} />
                </>
              )}
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

      <FolderPickDialog
        open={movePick !== null}
        count={movePick?.length ?? 0}
        folders={folders}
        busy={busy}
        onClose={() => setMovePick(null)}
        onConfirm={(folderId) => {
          const ids = movePick ?? [];
          setMovePick(null);
          void run(() => moveCoursesToFolderAction(ids, folderId));
        }}
      />

      {toast}
    </div>
  );
}

function daysLeft(deletedAt: string): number {
  const gone = (Date.now() - new Date(deletedAt).getTime()) / (24 * 60 * 60 * 1000);
  return Math.max(0, Math.ceil(TRASH_DAYS - gone));
}

function BarButton({
  icon,
  label,
  onClick,
  busy,
  primary,
  danger,
}: {
  icon: string;
  label: string;
  onClick: () => void;
  busy: boolean;
  primary?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={busy}
      onClick={onClick}
      className={`flex h-9 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-md px-3 text-[13px] font-semibold text-white transition disabled:opacity-50 ${
        primary
          ? "bg-brand-600 hover:bg-brand-700"
          : danger
            ? "bg-rose-700/80 hover:bg-rose-700"
            : "bg-white/10 hover:bg-white/20"
      }`}
    >
      <Icon name={icon} size={16} strokeWidth={2} />
      {label}
    </button>
  );
}

function FolderRow({
  name,
  count,
  icon,
  on,
  onClick,
  menu,
}: {
  name: string;
  count: number;
  icon: string;
  on: boolean;
  onClick: () => void;
  menu?: { onRename: () => void; onDelete: () => void };
}) {
  return (
    <div
      className={`group flex h-[34px] items-center rounded-md ${
        on ? "bg-brand-50 text-brand-700" : "text-slate-800 hover:bg-slate-50"
      }`}
    >
      <button
        type="button"
        onClick={onClick}
        className={`flex min-w-0 flex-1 items-center gap-2 pl-2.5 text-left text-[13px] ${
          on ? "font-semibold" : "font-medium"
        }`}
      >
        <Icon name={icon} size={15} className={on ? "text-brand-700" : "text-slate-400"} />
        <span className="truncate">{name}</span>
      </button>
      <span className={`px-1.5 text-xs tabular-nums ${on ? "text-brand-700" : "text-slate-400"}`}>
        {count}
      </span>
      {menu ? (
        <span className="flex shrink-0 pr-1 lg:opacity-0 lg:group-hover:opacity-100">
          <button
            type="button"
            onClick={menu.onRename}
            aria-label={`${name} 이름 바꾸기`}
            title="이름 바꾸기"
            className="flex h-6 w-6 items-center justify-center rounded text-slate-400 hover:bg-slate-200/70 hover:text-slate-700"
          >
            <Icon name="edit" size={13} />
          </button>
          <button
            type="button"
            onClick={menu.onDelete}
            aria-label={`${name} 폴더 지우기`}
            title="폴더 지우기"
            className="flex h-6 w-6 items-center justify-center rounded text-slate-400 hover:bg-rose-50 hover:text-rose-700"
          >
            <Icon name="trash" size={13} />
          </button>
        </span>
      ) : null}
    </div>
  );
}

function FolderPickDialog({
  open,
  count,
  folders,
  busy,
  onClose,
  onConfirm,
}: {
  open: boolean;
  count: number;
  folders: CourseFolder[];
  busy: boolean;
  onClose: () => void;
  onConfirm: (folderId: string | null) => void;
}) {
  const [target, setTarget] = useState("");
  useEffect(() => {
    if (open) setTarget("");
  }, [open]);

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      busy={busy}
      title="폴더 옮기기"
      subtitle={`강좌 ${count}개`}
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose} disabled={busy}>
            닫기
          </Button>
          <Button onClick={() => onConfirm(target || null)} disabled={busy}>
            {busy ? "옮기는 중…" : "옮기기"}
          </Button>
        </div>
      }
    >
      <div className="px-5 py-5 sm:px-[22px]">
        <label className="ui-label" htmlFor="course-folder-pick">
          옮길 폴더
        </label>
        <select
          id="course-folder-pick"
          className="ui-select"
          value={target}
          onChange={(e) => setTarget(e.target.value)}
        >
          <option value="">미분류</option>
          {folders.map((f) => (
            <option key={f.id} value={f.id}>
              {f.name}
            </option>
          ))}
        </select>
        {folders.length === 0 ? (
          <p className="mt-2 text-[12.5px] text-slate-500">
            아직 폴더가 없어요. 왼쪽 ‘카테고리 +’로 만들어 주세요.
          </p>
        ) : null}
      </div>
    </ModalShell>
  );
}

/** 목록이 비었을 때 새 강좌로 보내는 자리 */
export function CoursesEmptyState({ newHref }: { newHref: string }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
      <p className="font-semibold text-slate-800">아직 강좌가 없어요</p>
      <p className="mt-1 text-sm text-slate-500">
        강좌를 만들고 Vimeo·YouTube 링크를 붙여 넣으면 학생이 휴대폰으로 보고, 본 만큼 기록돼요.
      </p>
      <ButtonLink href={newHref} variant="primary" size="sm" className="mt-4">
        + 새 강좌
      </ButtonLink>
    </div>
  );
}
