"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClass } from "@/app/admin/classes/actions";
import type {
  StudentListRow,
  StudentStatusFilter,
} from "@/lib/admin/list-students-page";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/layout/NavIcon";
import {
  AccountCreateModal,
  AccountEditModal,
  Avatar,
  FlashBar,
  PasswordModal,
  SearchBox,
  StatusPill,
  useAccountActions,
} from "@/components/accounts/account-kit";
import { StudentDrawer } from "@/components/accounts/StudentDrawer";

type Dialog =
  | { kind: "create" }
  | { kind: "edit"; user: StudentListRow }
  | { kind: "password"; user: StudentListRow }
  | null;

export function StudentsBoard({
  variant,
  title,
  description,
  rows,
  classOptions,
  courseOptions,
  filters,
  pagination,
  apiBasePath,
  allowUsernameEdit,
  allowDelete,
  reportsHref,
  autoOpenCreate = false,
}: {
  variant: "admin" | "teacher";
  title: string;
  description: string;
  rows: StudentListRow[];
  classOptions: { id: string; name: string }[];
  courseOptions: { id: string; title: string }[];
  filters: { q: string; classId: string; status: StudentStatusFilter };
  pagination: { page: number; total: number; pageSize: number };
  apiBasePath: string;
  allowUsernameEdit: boolean;
  allowDelete: boolean;
  reportsHref: string;
  autoOpenCreate?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();
  const actions = useAccountActions(apiBasePath, "학생");
  const [query, setQuery] = useState(filters.q);
  const [dialog, setDialog] = useState<Dialog>(autoOpenCreate ? { kind: "create" } : null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const lastPushed = useRef(filters.q);

  const selected = rows.find((r) => r.id === selectedId) ?? null;

  const navigate = useCallback(
    (next: Partial<{ q: string; classId: string; status: StudentStatusFilter; page: number }>) => {
      const merged = { q: filters.q, classId: filters.classId, status: filters.status, page: 1, ...next };
      const sp = new URLSearchParams();
      if (merged.q.trim()) sp.set("q", merged.q.trim());
      if (merged.classId) sp.set("class", merged.classId);
      if (merged.status !== "all") sp.set("status", merged.status);
      if (merged.page > 1) sp.set("page", String(merged.page));
      const qs = sp.toString();
      startTransition(() => {
        router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
      });
    },
    [filters.q, filters.classId, filters.status, pathname, router]
  );

  // 주소가 바뀌면(조건 지우기 등) 검색 칸도 맞춘다
  useEffect(() => {
    lastPushed.current = filters.q;
    setQuery(filters.q);
  }, [filters.q]);

  // 검색어는 잠깐 멈추면 반영
  useEffect(() => {
    if (query === lastPushed.current) return;
    const t = setTimeout(() => {
      lastPushed.current = query;
      navigate({ q: query });
    }, 300);
    return () => clearTimeout(t);
  }, [query, navigate]);

  function open(next: Dialog) {
    actions.setFlash(null);
    setDialog(next);
  }

  async function deleteStudent(user: StudentListRow) {
    const ok = await actions.remove(user, "\n학생 계정과 수강·학습 기록이 함께 삭제됩니다.");
    if (ok) setSelectedId(null);
  }

  const totalPages = Math.max(1, Math.ceil(pagination.total / pagination.pageSize));
  const filtered = Boolean(filters.q || filters.classId || filters.status !== "all");
  const grid = "md:grid md:grid-cols-[minmax(0,1.3fr)_minmax(0,120px)_70px_80px_20px] md:gap-3.5";

  return (
    <div className={`flex flex-col gap-4 ${selected ? "xl:pr-[420px]" : ""}`}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-[22px]">
            {title}
          </h1>
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        </div>
        <Button onClick={() => open({ kind: "create" })} className="self-start sm:self-auto">
          <Icon name="plus" size={16} strokeWidth={2} />
          학생 등록
        </Button>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <SearchBox value={query} onChange={setQuery} className="w-full sm:w-[260px]" />
        <div className="flex gap-2">
          <select
            aria-label="반"
            value={filters.classId}
            onChange={(e) => navigate({ classId: e.target.value })}
            className="ui-select h-9 min-w-0 flex-1 sm:w-[150px] sm:flex-none"
          >
            <option value="">반: 전체</option>
            {classOptions.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <select
            aria-label="상태"
            value={filters.status}
            onChange={(e) => navigate({ status: e.target.value as StudentStatusFilter })}
            className="ui-select h-9 min-w-0 flex-1 sm:w-[120px] sm:flex-none"
          >
            <option value="all">상태: 전체</option>
            <option value="active">활성</option>
            <option value="inactive">쉬는 중</option>
          </select>
        </div>
        {pending ? <span className="text-xs text-slate-400">불러오는 중…</span> : null}
      </div>

      {!dialog ? <FlashBar flash={actions.flash} onClose={() => actions.setFlash(null)} /> : null}

      <div
        className={`overflow-hidden rounded-lg border border-slate-200 bg-white shadow-card transition-opacity ${
          pending ? "opacity-60" : ""
        }`}
      >
        <div
          className={`hidden rounded-t-lg border-b border-slate-200 bg-slate-50 px-[18px] py-2.5 text-xs font-semibold text-slate-500 ${grid}`}
        >
          <span>학생</span>
          <span>반</span>
          <span>강좌</span>
          <span>상태</span>
          <span />
        </div>
        {rows.length === 0 ? (
          <div className="px-4 py-10 text-center text-sm text-slate-500">
            {filtered ? (
              <>
                찾는 학생이 없어요.{" "}
                <Link href={pathname} className="font-semibold text-brand-700 hover:underline">
                  조건 지우기
                </Link>
              </>
            ) : (
              "아직 등록된 학생이 없어요."
            )}
          </div>
        ) : (
          <ul>
            {rows.map((r) => {
              const on = r.id === selectedId;
              const classLabel = r.classNames.length ? r.classNames.join(", ") : null;
              return (
                <li key={r.id} className="border-t border-slate-100 first:border-t-0">
                  <button
                    type="button"
                    onClick={() => setSelectedId(on ? null : r.id)}
                    aria-expanded={on}
                    className={`flex w-full items-center gap-3 px-4 py-2.5 text-left transition md:min-h-[54px] md:px-[18px] ${grid} md:items-center ${
                      on ? "bg-brand-50" : "hover:bg-slate-50"
                    }`}
                  >
                    <span className="flex min-w-0 flex-1 items-center gap-2.5">
                      <Avatar name={r.name} active={r.is_active} />
                      <span className="flex min-w-0 flex-col">
                        <span className="truncate text-sm font-semibold text-slate-900">
                          {r.name}
                        </span>
                        <span className="truncate text-xs text-slate-400">
                          {r.username ?? r.email}
                          <span className="md:hidden">
                            {` · ${classLabel ?? "반 없음"} · 강좌 ${r.courseCount}개`}
                          </span>
                        </span>
                      </span>
                    </span>
                    <span
                      className={`hidden truncate text-[13px] md:block ${
                        classLabel ? "text-slate-700" : "text-slate-400"
                      }`}
                    >
                      {classLabel ?? "반 없음"}
                    </span>
                    <span className="hidden text-[13px] tabular-nums text-slate-700 md:block">
                      {r.courseCount}개
                    </span>
                    <span className="shrink-0">
                      <StatusPill active={r.is_active} />
                    </span>
                    <Icon name="chevron" size={16} className="shrink-0 text-slate-400" />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {pagination.total > 0 ? (
        <div className="flex flex-wrap items-center justify-between gap-2 text-[13px] text-slate-500">
          <span className="tabular-nums">
            {pagination.total.toLocaleString("ko-KR")}명
            {totalPages > 1 ? ` · ${pagination.page}/${totalPages}쪽` : ""}
          </span>
          {totalPages > 1 ? (
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                disabled={pagination.page <= 1 || pending}
                onClick={() => navigate({ page: pagination.page - 1 })}
              >
                <Icon name="left" size={14} />
                이전
              </Button>
              <Button
                variant="secondary"
                size="sm"
                disabled={pagination.page >= totalPages || pending}
                onClick={() => navigate({ page: pagination.page + 1 })}
              >
                다음
                <Icon name="chevron" size={14} />
              </Button>
            </div>
          ) : null}
        </div>
      ) : null}

      {selected ? (
        <StudentDrawer
          key={selected.id}
          student={selected}
          variant={variant}
          courseOptions={courseOptions}
          reportsHref={reportsHref}
          allowDelete={allowDelete}
          busy={actions.busy}
          notice={dialog ? null : actions.flash}
          onClose={() => setSelectedId(null)}
          onEdit={() => open({ kind: "edit", user: selected })}
          onPassword={() => open({ kind: "password", user: selected })}
          onToggleActive={() => void actions.toggleActive(selected)}
          onDelete={() => void deleteStudent(selected)}
        />
      ) : null}

      {dialog?.kind === "create" ? (
        <AccountCreateModal
          roleLabel="학생"
          busy={actions.busy}
          flash={actions.flash}
          onSubmit={actions.create}
          onClose={() => setDialog(null)}
          withStudentDetails
          classOptions={variant === "admin" ? classOptions : undefined}
          onCreateClass={
            variant === "admin"
              ? async (name) => {
                  const r = await createClass({ name });
                  return r.ok ? (r.classId ?? null) : null;
                }
              : undefined
          }
        />
      ) : null}
      {dialog?.kind === "edit" ? (
        <AccountEditModal
          user={dialog.user}
          roleLabel="학생"
          allowUsernameEdit={allowUsernameEdit}
          busy={actions.busy}
          flash={actions.flash}
          onSubmit={(body) => actions.update(dialog.user.id, body)}
          onClose={() => setDialog(null)}
        />
      ) : null}
      {dialog?.kind === "password" ? (
        <PasswordModal
          user={dialog.user}
          busy={actions.busy}
          flash={actions.flash}
          onSubmit={(pw) => actions.resetPassword(dialog.user.id, pw)}
          onClose={() => setDialog(null)}
        />
      ) : null}
    </div>
  );
}
