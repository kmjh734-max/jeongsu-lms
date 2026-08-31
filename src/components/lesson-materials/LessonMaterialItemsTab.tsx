"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState } from "react";
import * as adminActions from "@/app/admin/lesson-materials/actions";
import * as teacherActions from "@/app/teacher/lesson-materials/actions";
import { Button } from "@/components/ui/Button";
import {
  sentenceCountFromItem,
  type LessonMaterialItemRow,
} from "@/lib/lesson-materials/load-items";
import type { LessonMaterialProjectDetail } from "@/lib/lesson-materials/load-project";

type SortKey = "newest" | "oldest" | "title";

function formatDateTime(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleString("ko-KR", {
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export function LessonMaterialItemsTab({
  role,
  project,
  items: initialItems,
}: {
  role: "admin" | "teacher";
  project: LessonMaterialProjectDetail;
  items: LessonMaterialItemRow[];
}) {
  const router = useRouter();
  const base =
    role === "admin" ? "/admin/lesson-materials" : "/teacher/lesson-materials";
  const actions = role === "admin" ? adminActions : teacherActions;

  const [items] = useState(initialItems);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [sort, setSort] = useState<SortKey>("newest");
  const [lastClicked, setLastClicked] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const shiftDownRef = useRef(false);

  const sorted = useMemo(() => {
    const list = [...items];
    if (sort === "newest") {
      list.sort(
        (a, b) =>
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      );
    } else if (sort === "oldest") {
      list.sort(
        (a, b) =>
          new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime()
      );
    } else {
      list.sort((a, b) => a.title.localeCompare(b.title, "ko"));
    }
    return list;
  }, [items, sort]);

  const allSelected = sorted.length > 0 && selected.size === sorted.length;

  function toggleOne(id: string, shiftKey: boolean) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (shiftKey && lastClicked) {
        const ids = sorted.map((i) => i.id);
        const a = ids.indexOf(lastClicked);
        const b = ids.indexOf(id);
        if (a >= 0 && b >= 0) {
          const [start, end] = a < b ? [a, b] : [b, a];
          for (let i = start; i <= end; i++) next.add(ids[i]!);
          return next;
        }
      }
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    setLastClicked(id);
  }

  function toggleAll() {
    if (allSelected) setSelected(new Set());
    else setSelected(new Set(sorted.map((i) => i.id)));
  }

  async function handleDeleteSelected() {
    if (selected.size === 0) return;
    if (!window.confirm(`선택한 ${selected.size}개 지문을 삭제할까요?`)) return;
    setBusy(true);
    const res = await actions.deleteLessonMaterialItems([...selected]);
    setBusy(false);
    if (!res.ok) {
      window.alert(res.message);
      return;
    }
    setSelected(new Set());
    router.refresh();
  }

  const selectedOne =
    selected.size === 1 ? sorted.find((i) => selected.has(i.id)) : null;

  return (
    <div className="space-y-4 pb-24">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm text-slate-600">
            <span className="mr-1" aria-hidden>
              ✏️
            </span>
            {items.length}개의 자료가 있습니다.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            className="h-9 rounded-md border border-slate-300 bg-white px-2 text-sm"
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
          >
            <option value="newest">최신순</option>
            <option value="oldest">오래된순</option>
            <option value="title">제목순</option>
          </select>
          {selected.size > 0 ? (
            <Button
              type="button"
              variant="danger"
              size="sm"
              disabled={busy}
              onClick={() => void handleDeleteSelected()}
            >
              삭제 ({selected.size})
            </Button>
          ) : null}
          <Link href={`${base}/project/${project.id}/new`}>
            <Button type="button" size="sm">
              + 새 자료 추가
            </Button>
          </Link>
        </div>
      </div>

      <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
        <label className="inline-flex items-center gap-2">
          <input
            type="checkbox"
            checked={allSelected}
            onChange={toggleAll}
          />
          전체 선택
        </label>
        <span className="text-slate-500">Shift + 클릭으로 범위 선택</span>
      </div>

      <p className="text-xs text-slate-500">
        자료를 선택하면 아래 메뉴에서 수업용 자료 제작 등을 진행할 수 있습니다.
      </p>

      {sorted.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
          <p className="text-sm text-slate-600">등록된 지문이 없습니다.</p>
          <Link
            href={`${base}/project/${project.id}/new`}
            className="mt-3 inline-block text-sm font-medium text-brand-600 hover:underline"
          >
            + 새 자료 추가
          </Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {sorted.map((item) => {
            const isSelected = selected.has(item.id);
            const sentenceCount = sentenceCountFromItem(item);
            return (
              <li
                key={item.id}
                className={`rounded-xl border bg-white transition ${
                  isSelected
                    ? "border-brand-400 ring-1 ring-brand-200"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="flex items-start gap-3 p-4">
                  <span className="mt-1 cursor-grab text-slate-300" title="순서 변경 (준비 중)">
                    ⠿
                  </span>
                  <input
                    type="checkbox"
                    className="mt-1"
                    checked={isSelected}
                    onMouseDown={(e) => {
                      shiftDownRef.current = e.shiftKey;
                    }}
                    onChange={() => toggleOne(item.id, shiftDownRef.current)}
                  />
                  <Link
                    href={`${base}/project/${project.id}/item/${item.id}`}
                    className="min-w-0 flex-1"
                  >
                    {item.label ? (
                      <p className="text-xs font-medium text-brand-600">
                        {item.label}
                      </p>
                    ) : null}
                    <p className="font-semibold text-slate-900">{item.title}</p>
                    <p className="mt-1 line-clamp-2 text-sm text-slate-600">
                      {item.summary ||
                        item.source_passage?.slice(0, 120) ||
                        "지문 미리보기 없음"}
                    </p>
                  </Link>
                  <div className="shrink-0 text-right text-xs text-slate-500">
                    <p>{formatDateTime(item.updated_at)}</p>
                    <p className="mt-1">문장 {sentenceCount}개</p>
                    <p className="mt-1 text-slate-400">{project.title}</p>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {selected.size > 0 ? (
        <div className="fixed inset-x-0 bottom-4 z-40 mx-auto flex max-w-5xl flex-col gap-3 px-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="rounded-2xl bg-brand-700 px-4 py-3 text-sm font-medium text-white shadow-lg sm:flex sm:items-center sm:gap-4">
            <span>{selected.size}개 자료 선택됨</span>
            <div className="mt-2 flex flex-wrap gap-2 sm:mt-0">
              {selectedOne ? (
                <Link
                  href={`${base}/project/${project.id}/item/${selectedOne.id}?tab=passage`}
                  className="rounded-lg bg-white/15 px-3 py-1.5 text-xs font-medium text-white hover:bg-white/25"
                >
                  ✏️ 수정
                </Link>
              ) : null}
              {selectedOne ? (
                <Link
                  href={`${base}/project/${project.id}/item/${selectedOne.id}?tab=line`}
                  className="rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-brand-700 hover:bg-brand-50"
                >
                  ✨ 수업용 자료 제작
                </Link>
              ) : null}
              <span className="rounded-lg bg-white/10 px-3 py-1.5 text-xs text-white/70">
                지문 분석서 · 문제 · 워크북 (준비 중)
              </span>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
