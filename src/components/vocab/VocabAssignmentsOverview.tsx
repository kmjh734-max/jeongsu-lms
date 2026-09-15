"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import * as adminAssign from "@/app/admin/vocab/assign-actions";
import * as teacherAssign from "@/app/teacher/vocab/assign-actions";
import { Icon } from "@/components/layout/NavIcon";
import { Button } from "@/components/ui/Button";
import { VocabAssignModal } from "@/components/vocab/VocabAssignModal";
import { Checkbox, ModalShell, Segmented, useToast } from "@/components/vocab/VocabUi";
import type { AssignmentOverviewGroup } from "@/lib/vocab/load-assignment-overview";
import {
  formatShortDate,
  vocabBasePath,
  type VocabModuleFolder,
  type VocabModuleSet,
  type VocabRole,
} from "@/lib/vocab/module-types";
import { matchesSearch } from "@/lib/ui/filter-by-search";

type KindFilter = "all" | "class" | "student";

export function VocabAssignmentsOverview({
  role,
  groups,
  sets,
  folders,
}: {
  role: VocabRole;
  groups: AssignmentOverviewGroup[];
  sets: VocabModuleSet[];
  folders: VocabModuleFolder[];
}) {
  const router = useRouter();
  const base = vocabBasePath(role);
  const actions = role === "admin" ? adminAssign : teacherAssign;
  const [toast, showToast] = useToast();
  const [kind, setKind] = useState<KindFilter>("all");
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [assignIds, setAssignIds] = useState<string[] | null>(null);

  const classCount = groups.filter((g) => g.kind === "class").length;
  const studentCount = groups.length - classCount;

  const visible = useMemo(
    () =>
      groups.filter(
        (g) =>
          (kind === "all" || g.kind === kind) &&
          matchesSearch(query, g.name, g.sub, ...g.sets.map((s) => s.title))
      ),
    [groups, kind, query]
  );

  async function remove(ids: string[], confirmText: string, done: string) {
    if (!window.confirm(`${confirmText}\n학습 기록은 지워지지 않아요.`)) return;
    setBusy(true);
    const result = await actions.removeVocabAssignments(ids);
    setBusy(false);
    if (!result.ok) {
      showToast(result.message, "bad");
      return;
    }
    showToast(done);
    router.refresh();
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <Segmented
            value={kind}
            onChange={setKind}
            options={[
              { value: "all", label: `전체 ${groups.length}` },
              { value: "class", label: `반 ${classCount}` },
              { value: "student", label: `학생 ${studentCount}` },
            ]}
          />
          <div className="relative w-full sm:w-[220px]">
            <Icon
              name="search"
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              className="ui-input h-9 pl-9"
              placeholder="반·학생·단어장 찾기"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="반·학생·단어장 찾기"
            />
          </div>
        </div>
        <Button onClick={() => setPickerOpen(true)} disabled={sets.length === 0}>
          <Icon name="plus" size={16} strokeWidth={2} />
          새로 배정
        </Button>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white shadow-card">
        {visible.length === 0 ? (
          <p className="px-6 py-14 text-center text-sm text-slate-500">
            {groups.length === 0
              ? "아직 배정한 단어장이 없어요. ‘새로 배정’으로 시작해 보세요."
              : "찾는 배정이 없어요."}
          </p>
        ) : (
          <ul className={busy ? "opacity-70" : undefined}>
            {visible.map((g, i) => {
              const allIds = g.sets.flatMap((s) => s.assignmentIds);
              return (
                <li
                  key={g.key}
                  className={`flex flex-col gap-3 px-4 py-3.5 sm:flex-row sm:items-start sm:gap-4 ${
                    i > 0 ? "border-t border-slate-100" : ""
                  }`}
                >
                  <div className="flex min-w-0 items-center gap-3 sm:w-[220px] sm:shrink-0">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                      <Icon name={g.kind === "class" ? "users" : "usercheck"} size={17} />
                    </span>
                    <span className="flex min-w-0 flex-col">
                      <span className="truncate text-sm font-semibold text-slate-900">
                        {g.name}
                      </span>
                      <span className="truncate text-xs text-slate-400">
                        {g.sub} · {formatShortDate(g.latest)}
                      </span>
                    </span>
                  </div>
                  <ul className="flex min-w-0 flex-1 flex-wrap gap-1.5">
                    {g.sets.map((s) => (
                      <li
                        key={s.setId}
                        className="flex max-w-full items-center gap-1 rounded-md border border-slate-200 bg-slate-50 py-1 pl-2.5 pr-1 text-[13px] text-slate-700"
                      >
                        <Link
                          href={`${base}/set/${s.setId}`}
                          className="truncate hover:text-brand-700"
                        >
                          {s.title}
                        </Link>
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() =>
                            void remove(
                              s.assignmentIds,
                              `‘${g.name}’에서 ‘${s.title}’ 배정을 해제할까요?`,
                              "배정을 해제했어요."
                            )
                          }
                          className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-slate-400 hover:bg-rose-50 hover:text-rose-700"
                          aria-label={`${s.title} 배정 해제`}
                          title="해제"
                        >
                          <Icon name="x" size={13} strokeWidth={2.2} />
                        </button>
                      </li>
                    ))}
                  </ul>
                  <div className="flex shrink-0 items-center gap-1 self-end sm:self-start">
                    <span className="text-xs text-slate-400">{g.sets.length}개</span>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() =>
                        void remove(
                          allIds,
                          `‘${g.name}’의 배정 ${g.sets.length}개를 모두 해제할까요?`,
                          `‘${g.name}’ 배정을 모두 해제했어요.`
                        )
                      }
                      className="rounded px-2 py-1 text-xs font-semibold text-slate-500 hover:bg-rose-50 hover:text-rose-700 disabled:opacity-40"
                    >
                      모두 해제
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <SetPickerDialog
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        sets={sets}
        folders={folders}
        onNext={(ids) => {
          setPickerOpen(false);
          setAssignIds(ids);
        }}
      />
      <VocabAssignModal
        open={assignIds !== null}
        onClose={() => setAssignIds(null)}
        role={role}
        setIds={assignIds ?? []}
      />
      {toast}
    </div>
  );
}

function SetPickerDialog({
  open,
  onClose,
  sets,
  folders,
  onNext,
}: {
  open: boolean;
  onClose: () => void;
  sets: VocabModuleSet[];
  folders: VocabModuleFolder[];
  onNext: (ids: string[]) => void;
}) {
  const [query, setQuery] = useState("");
  const [picked, setPicked] = useState<Set<string>>(new Set());

  const sections = useMemo(() => {
    const q = query.trim().toLowerCase();
    const match = (s: VocabModuleSet) => !q || s.title.toLowerCase().includes(q);
    const list = folders
      .map((f) => ({
        key: f.id,
        name: f.name,
        locked: f.isCurriculum,
        items: sets.filter((s) => s.folderId === f.id && match(s)),
      }))
      .filter((sec) => sec.items.length > 0);
    const loose = sets.filter((s) => !s.folderId && match(s));
    if (loose.length > 0) {
      list.push({ key: "__none", name: "폴더 없음", locked: false, items: loose });
    }
    return list;
  }, [sets, folders, query]);

  function toggle(id: string, on: boolean) {
    setPicked((prev) => {
      const next = new Set(prev);
      if (on) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      widthClass="max-w-xl"
      title="어떤 단어장을 배정할까요?"
      subtitle="고른 다음 반이나 학생을 정해요."
      footer={
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm text-slate-600">
            {picked.size ? `${picked.size}개 고름` : "단어장을 골라 주세요."}
          </span>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={onClose}>
              닫기
            </Button>
            <Button
              disabled={picked.size === 0}
              onClick={() => {
                onNext([...picked]);
                setPicked(new Set());
                setQuery("");
              }}
            >
              다음
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-3 px-5 py-4 sm:px-[22px]">
        <div className="relative">
          <Icon
            name="search"
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            className="ui-input pl-9"
            placeholder="단어장 이름 찾기"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
        </div>
        {sections.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-500">찾는 단어장이 없어요.</p>
        ) : (
          <div className="max-h-[50vh] space-y-3 overflow-y-auto">
            {sections.map((sec) => (
              <section key={sec.key}>
                <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                  <Icon name={sec.locked ? "lock" : "folder"} size={13} />
                  {sec.name}
                </p>
                <ul className="divide-y divide-slate-100 rounded-lg border border-slate-200">
                  {sec.items.map((s) => (
                    <li key={s.id}>
                      <label className="flex cursor-pointer items-center gap-3 px-3 py-2.5 text-sm hover:bg-slate-50">
                        <Checkbox
                          checked={picked.has(s.id)}
                          label={`${s.title} 고르기`}
                          onChange={(v) => toggle(s.id, v)}
                        />
                        <span className="truncate text-slate-800">{s.title}</span>
                      </label>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}
      </div>
    </ModalShell>
  );
}
