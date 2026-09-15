"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import * as adminAssign from "@/app/admin/vocab/assign-actions";
import * as teacherAssign from "@/app/teacher/vocab/assign-actions";
import { Icon } from "@/components/layout/NavIcon";
import { Button } from "@/components/ui/Button";
import { Checkbox, ModalShell, Pill, Segmented } from "@/components/vocab/VocabUi";
import type { VocabAssignPanelData } from "@/lib/vocab/assign-panel-types";
import { formatShortDate, type VocabRole } from "@/lib/vocab/module-types";
import { matchesSearch } from "@/lib/ui/filter-by-search";

interface CurrentGroup {
  key: string;
  kind: "class" | "student";
  name: string;
  sub: string;
  assignmentIds: string[];
}

function coverage(setIdsCovered: Set<string>, total: number): "all" | "some" | "none" {
  if (setIdsCovered.size === 0) return "none";
  return setIdsCovered.size >= total ? "all" : "some";
}

export function VocabAssignModal({
  open,
  onClose,
  role,
  setIds,
  fallbackTitle,
  onChanged,
}: {
  open: boolean;
  onClose: () => void;
  role: VocabRole;
  setIds: string[];
  /** 불러오기 전 부제에 쓸 첫 단어장 이름 */
  fallbackTitle?: string;
  onChanged?: () => void;
}) {
  const router = useRouter();
  const actions = role === "admin" ? adminAssign : teacherAssign;
  const classesHref = role === "admin" ? "/admin/classes" : "/teacher/classes";

  const [data, setData] = useState<VocabAssignPanelData | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [tab, setTab] = useState<"class" | "student">("class");
  const [pickedClasses, setPickedClasses] = useState<Set<string>>(new Set());
  const [pickedStudents, setPickedStudents] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ text: string; bad: boolean } | null>(null);

  const idsKey = setIds.join(",");

  const load = useCallback(async () => {
    if (!idsKey) return;
    setLoadError(null);
    try {
      const res = await fetch(`/api/vocab/assign-panel?setIds=${encodeURIComponent(idsKey)}`);
      if (!res.ok) throw new Error("load failed");
      setData((await res.json()) as VocabAssignPanelData);
    } catch {
      setLoadError("배정 정보를 불러오지 못했어요. 다시 열어 주세요.");
    }
  }, [idsKey]);

  useEffect(() => {
    if (!open) return;
    setData(null);
    setPickedClasses(new Set());
    setPickedStudents(new Set());
    setSearch("");
    setMessage(null);
    void load();
  }, [open, load]);

  const setCount = data?.sets.length ?? setIds.length;
  const firstTitle = data?.sets[0]?.title ?? fallbackTitle ?? "단어장";
  const subtitle = setCount > 1 ? `${firstTitle} 외 ${setCount - 1}개` : firstTitle;

  const classById = useMemo(
    () => new Map((data?.classes ?? []).map((c) => [c.id, c])),
    [data]
  );
  const studentById = useMemo(
    () => new Map((data?.students ?? []).map((s) => [s.id, s])),
    [data]
  );

  const { groups, classCoverage, studentCoverage } = useMemo(() => {
    const classMap = new Map<string, { ids: string[]; sets: Set<string>; latest: string; name: string }>();
    const studentMap = new Map<string, { ids: string[]; sets: Set<string>; latest: string; name: string }>();
    const studentSets = new Map<string, Set<string>>();
    for (const a of data?.assignments ?? []) {
      if (a.student_id) {
        const s = studentSets.get(a.student_id) ?? new Set<string>();
        s.add(a.set_id);
        studentSets.set(a.student_id, s);
      }
      const isClass = !!a.class_id;
      const key = isClass ? a.class_id! : a.student_id;
      if (!key) continue;
      const map = isClass ? classMap : studentMap;
      const entry = map.get(key) ?? {
        ids: [],
        sets: new Set<string>(),
        latest: a.created_at,
        name: isClass ? (a.class_name ?? "반") : a.student_name,
      };
      entry.ids.push(a.id);
      entry.sets.add(a.set_id);
      if (a.created_at > entry.latest) entry.latest = a.created_at;
      map.set(key, entry);
    }

    const total = data?.sets.length ?? 1;
    const setsNote = (sets: Set<string>) =>
      total > 1 && sets.size < total ? ` · ${sets.size}/${total}개` : "";

    const list: CurrentGroup[] = [
      ...[...classMap.entries()].map(([id, g]) => ({
        key: `c:${id}`,
        kind: "class" as const,
        name: classById.get(id)?.name ?? g.name,
        sub: `${classById.get(id)?.studentIds.length ?? g.ids.length}명 · ${formatShortDate(g.latest)}${setsNote(g.sets)}`,
        assignmentIds: g.ids,
      })),
      ...[...studentMap.entries()].map(([id, g]) => {
        const st = studentById.get(id);
        const cls = st && st.classLabel !== "반 없음" ? `${st.classLabel} · ` : "";
        return {
          key: `s:${id}`,
          kind: "student" as const,
          name: st?.name ?? g.name,
          sub: `${cls}${formatShortDate(g.latest)}${setsNote(g.sets)}`,
          assignmentIds: g.ids,
        };
      }),
    ];

    return {
      groups: list,
      classCoverage: new Map(
        [...classMap.entries()].map(([id, g]) => [id, coverage(g.sets, total)])
      ),
      studentCoverage: new Map(
        [...studentSets.entries()].map(([id, s]) => [id, coverage(s, total)])
      ),
    };
  }, [data, classById, studentById]);

  const filteredStudents = useMemo(
    () =>
      (data?.students ?? []).filter((s) =>
        matchesSearch(search, s.name, s.username, s.classLabel)
      ),
    [data, search]
  );

  const pickedClassList = [...pickedClasses]
    .map((id) => classById.get(id))
    .filter((c): c is NonNullable<typeof c> => !!c);
  const classStudentCount = new Set(pickedClassList.flatMap((c) => c.studentIds)).size;

  function toggle(set: Set<string>, id: string, on: boolean) {
    const next = new Set(set);
    if (on) next.add(id);
    else next.delete(id);
    return next;
  }

  async function handleAssign() {
    if (pickedClassList.length === 0 && pickedStudents.size === 0) return;
    setBusy(true);
    setMessage(null);
    try {
      for (const c of pickedClassList) {
        const r = await actions.bulkAssignVocabSetsToClass(setIds, c.id);
        if (!r.ok) {
          setMessage({ text: `${c.name}: ${r.message}`, bad: true });
          setBusy(false);
          return;
        }
      }
      if (pickedStudents.size > 0) {
        const r = await actions.bulkAssignVocabSetsToStudents(setIds, [...pickedStudents]);
        if (!r.ok) {
          setMessage({ text: r.message, bad: true });
          setBusy(false);
          return;
        }
      }
      setPickedClasses(new Set());
      setPickedStudents(new Set());
      setMessage({ text: "배정했어요. 학생 화면에 바로 보여요.", bad: false });
      await load();
      router.refresh();
      onChanged?.();
    } catch {
      setMessage({ text: "배정하지 못했어요. 다시 해 주세요.", bad: true });
    } finally {
      setBusy(false);
    }
  }

  async function handleRemove(group: CurrentGroup) {
    if (!window.confirm(`‘${group.name}’ 배정을 해제할까요? 학습 기록은 지워지지 않아요.`)) {
      return;
    }
    setBusy(true);
    setMessage(null);
    try {
      const r = await actions.removeVocabAssignments(group.assignmentIds);
      if (!r.ok) {
        setMessage({ text: r.message, bad: true });
      } else {
        setMessage({ text: `‘${group.name}’ 배정을 해제했어요.`, bad: false });
        await load();
        router.refresh();
        onChanged?.();
      }
    } catch {
      setMessage({ text: "배정을 해제하지 못했어요. 다시 해 주세요.", bad: true });
    } finally {
      setBusy(false);
    }
  }

  const summary = (() => {
    const who: string[] = [];
    if (pickedClassList.length > 0) {
      const names =
        pickedClassList.length > 2
          ? `${pickedClassList[0]!.name} 외 ${pickedClassList.length - 1}개 반`
          : pickedClassList.map((c) => c.name).join("·");
      who.push(`${names} ${classStudentCount}명`);
    }
    if (pickedStudents.size > 0) who.push(`학생 ${pickedStudents.size}명`);
    if (who.length === 0) return null;
    return (
      <>
        <b className="font-semibold text-slate-900">{who.join(", ")}</b>에게 단어장{" "}
        {setCount}개를 배정해요
      </>
    );
  })();

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      busy={busy}
      widthClass="max-w-[880px]"
      title="배정하기"
      subtitle={subtitle}
      footer={
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="min-w-0 text-sm text-slate-700" role="status">
            {message ? (
              <span className={message.bad ? "text-rose-700" : "text-green-700"}>
                {message.text}
              </span>
            ) : (
              (summary ?? (
                <span className="text-slate-400">배정할 반이나 학생을 골라 주세요.</span>
              ))
            )}
          </p>
          <div className="flex shrink-0 justify-end gap-2">
            <Button variant="secondary" onClick={onClose} disabled={busy}>
              닫기
            </Button>
            <Button
              onClick={() => void handleAssign()}
              disabled={busy || !data || (pickedClassList.length === 0 && pickedStudents.size === 0)}
              className="px-[22px]"
            >
              {busy ? "배정 중…" : "배정하기"}
            </Button>
          </div>
        </div>
      }
    >
      {loadError ? (
        <p className="px-6 py-12 text-center text-sm text-rose-700" role="alert">
          {loadError}
        </p>
      ) : !data ? (
        <div className="animate-pulse space-y-3 px-6 py-6">
          <div className="h-9 w-32 rounded-md bg-slate-100" />
          <div className="grid grid-cols-2 gap-2.5">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-[52px] rounded-lg bg-slate-100" />
            ))}
          </div>
        </div>
      ) : (
        <div className="grid md:grid-cols-[minmax(0,1fr)_300px]">
          <div className="flex min-w-0 flex-col gap-3.5 px-5 py-[18px] sm:px-[22px]">
            <Segmented
              value={tab}
              onChange={setTab}
              options={[
                {
                  value: "class",
                  label: pickedClasses.size ? `반 ${pickedClasses.size}` : "반",
                },
                {
                  value: "student",
                  label: pickedStudents.size ? `학생 ${pickedStudents.size}` : "학생",
                },
              ]}
            />

            {tab === "class" ? (
              <>
                <p className="text-[13px] text-slate-500">
                  반을 고르면 그 반 학생 모두에게 배정돼요. 나중에 반에 들어오는 학생도
                  이 단어장을 볼 수 있어요.
                </p>
                {data.classes.length === 0 ? (
                  <p className="rounded-lg border border-dashed border-slate-300 px-4 py-8 text-center text-sm text-slate-500">
                    아직 반이 없어요.{" "}
                    <Link href={classesHref} className="font-semibold text-brand-700 hover:underline">
                      반 관리
                    </Link>
                    에서 먼저 만들어 주세요.
                  </p>
                ) : (
                  <div className="grid gap-2.5 sm:grid-cols-2">
                    {data.classes.map((c) => {
                      const on = pickedClasses.has(c.id);
                      const cov = classCoverage.get(c.id) ?? "none";
                      return (
                        <label
                          key={c.id}
                          className={`flex h-[52px] cursor-pointer items-center gap-3 rounded-lg border px-3.5 transition ${
                            on
                              ? "border-brand-600 bg-brand-50"
                              : "border-slate-200 bg-white hover:border-slate-300"
                          }`}
                        >
                          <Checkbox
                            checked={on}
                            label={`${c.name} 고르기`}
                            onChange={(v) => setPickedClasses((p) => toggle(p, c.id, v))}
                          />
                          <span className="flex min-w-0 flex-1 flex-col">
                            <span className="truncate text-sm font-semibold text-slate-900">
                              {c.name}
                            </span>
                            <span className="text-xs text-slate-500">
                              학생 {c.studentIds.length}명
                            </span>
                          </span>
                          {cov === "all" ? (
                            <Pill tone="good">배정됨</Pill>
                          ) : cov === "some" ? (
                            <Pill tone="neutral">일부 배정</Pill>
                          ) : null}
                        </label>
                      );
                    })}
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="relative">
                  <Icon
                    name="search"
                    size={16}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    className="ui-input pl-9"
                    placeholder="이름·아이디·반 이름"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>
                    학생 {filteredStudents.length}명
                    {pickedStudents.size ? ` · ${pickedStudents.size}명 고름` : ""}
                  </span>
                  {filteredStudents.length > 0 ? (
                    <button
                      type="button"
                      className="font-semibold text-brand-700 hover:underline"
                      onClick={() => {
                        const allOn = filteredStudents.every((s) => pickedStudents.has(s.id));
                        setPickedStudents((p) => {
                          const next = new Set(p);
                          for (const s of filteredStudents) {
                            if (allOn) next.delete(s.id);
                            else next.add(s.id);
                          }
                          return next;
                        });
                      }}
                    >
                      {filteredStudents.every((s) => pickedStudents.has(s.id))
                        ? "모두 풀기"
                        : "보이는 학생 모두 고르기"}
                    </button>
                  ) : null}
                </div>
                {filteredStudents.length === 0 ? (
                  <p className="rounded-lg border border-dashed border-slate-300 px-4 py-8 text-center text-sm text-slate-500">
                    {data.students.length === 0 ? "배정할 수 있는 학생이 없어요." : "찾는 학생이 없어요."}
                  </p>
                ) : (
                  <ul className="max-h-[320px] divide-y divide-slate-100 overflow-y-auto rounded-lg border border-slate-200">
                    {filteredStudents.map((s) => {
                      const on = pickedStudents.has(s.id);
                      const cov = studentCoverage.get(s.id) ?? "none";
                      return (
                        <li key={s.id}>
                          <label
                            className={`flex cursor-pointer items-center gap-3 px-3.5 py-2.5 ${
                              on ? "bg-brand-50" : "hover:bg-slate-50"
                            }`}
                          >
                            <Checkbox
                              checked={on}
                              label={`${s.name} 고르기`}
                              onChange={(v) => setPickedStudents((p) => toggle(p, s.id, v))}
                            />
                            <span className="flex min-w-0 flex-1 flex-col">
                              <span className="truncate text-sm font-semibold text-slate-900">
                                {s.name}
                              </span>
                              <span className="truncate text-xs text-slate-500">
                                {s.username ? `${s.username} · ` : ""}
                                {s.classLabel}
                              </span>
                            </span>
                            {cov === "all" ? (
                              <Pill tone="good">배정됨</Pill>
                            ) : cov === "some" ? (
                              <Pill tone="neutral">일부 배정</Pill>
                            ) : null}
                          </label>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </>
            )}
          </div>

          <aside className="flex flex-col gap-2.5 border-t border-slate-200 bg-slate-50 px-[18px] py-[18px] md:border-l md:border-t-0">
            <p className="text-[13px] font-bold text-slate-900">
              지금 배정된 곳 · {groups.length}
            </p>
            {groups.length === 0 ? (
              <p className="text-[13px] text-slate-500">아직 배정한 곳이 없어요.</p>
            ) : (
              <ul className="flex max-h-[360px] flex-col gap-2 overflow-y-auto">
                {groups.map((g) => (
                  <li
                    key={g.key}
                    className="flex items-center gap-2.5 rounded-md border border-slate-200 bg-white px-2.5 py-2"
                  >
                    <Icon
                      name={g.kind === "class" ? "users" : "usercheck"}
                      size={16}
                      className="text-slate-500"
                    />
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate text-[13px] font-semibold text-slate-900">
                        {g.name}
                      </span>
                      <span className="truncate text-[11px] text-slate-400">{g.sub}</span>
                    </span>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => void handleRemove(g)}
                      className="shrink-0 rounded px-1.5 py-1 text-xs font-semibold text-slate-500 hover:bg-rose-50 hover:text-rose-700 disabled:opacity-40"
                    >
                      해제
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </aside>
        </div>
      )}
    </ModalShell>
  );
}
