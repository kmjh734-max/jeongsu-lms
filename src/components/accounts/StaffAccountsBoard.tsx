"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { matchesSearch } from "@/lib/ui/filter-by-search";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/layout/NavIcon";
import {
  AccountCreateModal,
  AccountEditModal,
  Avatar,
  FlashBar,
  PasswordModal,
  SearchBox,
  Segmented,
  StatusPill,
  relativeDayLabel,
  useAccountActions,
  withParticle,
  type AccountBase,
} from "@/components/accounts/account-kit";

export interface StaffRow extends AccountBase {
  lastSignInAt: string | null;
  /** 강사: 담당 반 */
  classes?: { id: string; name: string }[];
  /** 강사: 담당 강좌 수 */
  courseCount?: number;
}

type Dialog =
  | { kind: "create" }
  | { kind: "edit"; user: StaffRow }
  | { kind: "password"; user: StaffRow }
  | null;

function KeyIcon() {
  return (
    <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden className="shrink-0">
      <circle cx="8" cy="15" r="4" />
      <path d="m10.8 12.2 8.7-8.7" />
      <path d="m17 6 2.5 2.5" />
      <path d="m15 8 2 2" />
    </svg>
  );
}

function RowMenu({
  user,
  isTeacher,
  classesHref,
  onEdit,
  onPassword,
  onToggle,
  onDelete,
}: {
  user: StaffRow;
  isTeacher: boolean;
  classesHref?: string;
  onEdit: () => void;
  onPassword: () => void;
  onToggle: () => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const item =
    "flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-[13px] text-slate-900 hover:bg-slate-50";
  const run = (fn: () => void) => () => {
    setOpen(false);
    fn();
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`${user.name} 메뉴`}
        className="flex h-8 w-8 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-600"
      >
        <Icon name="more" size={18} />
      </button>
      {open ? (
        <div
          role="menu"
          className="absolute right-0 top-full z-20 mt-1 w-[190px] rounded-lg border border-slate-200 bg-white p-1.5 shadow-[0_12px_28px_rgba(15,23,42,0.16)]"
        >
          <button type="button" role="menuitem" className={item} onClick={run(onEdit)}>
            <Icon name="edit" size={15} className="text-slate-500" />
            정보 수정
          </button>
          <button type="button" role="menuitem" className={item} onClick={run(onPassword)}>
            <span className="text-slate-500">
              <KeyIcon />
            </span>
            비밀번호 바꾸기
          </button>
          {isTeacher && classesHref ? (
            <Link href={classesHref} role="menuitem" className={item} onClick={() => setOpen(false)}>
              <Icon name="users" size={15} className="text-slate-500" />
              담당 반 바꾸기
            </Link>
          ) : null}
          <button type="button" role="menuitem" className={item} onClick={run(onToggle)}>
            <Icon name={user.is_active ? "pause" : "rotate"} size={15} className="text-slate-500" />
            {user.is_active ? "잠시 쉬게 하기" : "다시 활성"}
          </button>
          <button
            type="button"
            role="menuitem"
            className={`${item} text-rose-700 hover:bg-rose-50`}
            onClick={run(onDelete)}
          >
            <Icon name="trash" size={15} />
            삭제
          </button>
        </div>
      ) : null}
    </div>
  );
}

export function StaffAccountsBoard({
  title,
  description,
  roleLabel,
  apiBasePath,
  users,
  allowUsernameEdit,
  classesHref,
  note,
}: {
  title: string;
  description: string;
  roleLabel: "강사" | "관리자";
  apiBasePath: string;
  users: StaffRow[];
  allowUsernameEdit: boolean;
  /** 강사: 반 관리 주소 (담당 반 바꾸기) */
  classesHref?: string;
  /** 목록 아래 안내 */
  note: string;
}) {
  const isTeacher = roleLabel === "강사";
  const actions = useAccountActions(apiBasePath, roleLabel);
  const [tab, setTab] = useState<"active" | "inactive">("active");
  const [query, setQuery] = useState("");
  const [dialog, setDialog] = useState<Dialog>(null);

  const activeCount = users.filter((u) => u.is_active).length;
  const inactiveCount = users.length - activeCount;

  const shown = useMemo(
    () =>
      users.filter(
        (u) =>
          (tab === "active" ? u.is_active : !u.is_active) &&
          matchesSearch(query, u.name, u.username, u.email)
      ),
    [users, tab, query]
  );

  function open(next: Dialog) {
    actions.setFlash(null);
    setDialog(next);
  }

  function deleteUser(user: StaffRow) {
    const notes: string[] = [];
    if (isTeacher && (user.courseCount ?? 0) > 0) {
      notes.push(`담당 강좌 ${user.courseCount}개는 강사 미배정 상태가 됩니다.`);
    }
    if (roleLabel === "관리자") notes.push("마지막 남은 관리자 계정은 삭제할 수 없습니다.");
    void actions.remove(user, notes.length ? `\n${notes.join("\n")}` : "");
  }

  const grid = isTeacher
    ? "md:grid md:grid-cols-[minmax(0,1fr)_minmax(0,200px)_70px_90px_72px_32px] md:gap-3.5"
    : "md:grid md:grid-cols-[minmax(0,1fr)_110px_72px_32px] md:gap-3.5";

  const emptyText =
    users.length === 0
      ? `등록된 ${withParticle(roleLabel, "이가")} 없어요.`
      : query.trim()
        ? `찾는 ${withParticle(roleLabel, "이가")} 없어요.`
        : tab === "active"
          ? `활성 ${withParticle(roleLabel, "이가")} 없어요.`
          : `쉬는 중인 ${withParticle(roleLabel, "이가")} 없어요.`;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-[22px]">
            {title}
          </h1>
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        </div>
        <Button onClick={() => open({ kind: "create" })} className="self-start sm:self-auto">
          <Icon name="plus" size={16} strokeWidth={2} />
          {roleLabel} 등록
        </Button>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <Segmented
          label={`${roleLabel} 상태`}
          value={tab}
          onChange={setTab}
          options={[
            { value: "active", label: `활성 ${activeCount}` },
            { value: "inactive", label: `쉬는 중 ${inactiveCount}` },
          ]}
        />
        <SearchBox value={query} onChange={setQuery} className="w-full sm:w-60" />
      </div>

      {!dialog ? <FlashBar flash={actions.flash} onClose={() => actions.setFlash(null)} /> : null}

      <div className="rounded-lg border border-slate-200 bg-white shadow-card">
        <div
          className={`hidden rounded-t-lg border-b border-slate-200 bg-slate-50 px-[18px] py-2.5 text-xs font-semibold text-slate-500 ${grid}`}
        >
          <span>{roleLabel}</span>
          {isTeacher ? <span>담당 반</span> : null}
          {isTeacher ? <span>강좌</span> : null}
          <span>마지막 접속</span>
          <span>상태</span>
          <span />
        </div>
        {shown.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm text-slate-500">{emptyText}</p>
        ) : (
          <ul>
            {shown.map((u) => {
              const last = relativeDayLabel(u.lastSignInAt);
              return (
                <li
                  key={u.id}
                  className={`flex items-start gap-3 border-t border-slate-100 px-4 py-3 first:border-t-0 md:min-h-[54px] md:items-center md:px-[18px] md:py-2 ${grid}`}
                >
                  <div className="flex min-w-0 flex-1 items-center gap-2.5">
                    <Avatar name={u.name} active={u.is_active} />
                    <div className="flex min-w-0 flex-col">
                      <span className="truncate text-sm font-semibold text-slate-900">
                        {u.name}
                      </span>
                      <span className="truncate text-xs text-slate-400">
                        {u.username ?? u.email}
                        <span className="md:hidden">
                          {isTeacher ? ` · 강좌 ${u.courseCount ?? 0}개` : ""}
                          {last ? ` · ${last} 접속` : ""}
                        </span>
                      </span>
                      {isTeacher ? (
                        <div className="mt-1.5 flex flex-wrap gap-1 md:hidden">
                          <ClassChips classes={u.classes ?? []} />
                        </div>
                      ) : null}
                    </div>
                  </div>
                  {isTeacher ? (
                    <div className="hidden flex-wrap gap-1 md:flex">
                      <ClassChips classes={u.classes ?? []} />
                    </div>
                  ) : null}
                  {isTeacher ? (
                    <span className="hidden text-[13px] tabular-nums text-slate-700 md:block">
                      {u.courseCount ?? 0}개
                    </span>
                  ) : null}
                  <span className="hidden text-[13px] text-slate-500 md:block">{last ?? "—"}</span>
                  <div className="shrink-0 pt-0.5 md:pt-0">
                    <StatusPill active={u.is_active} />
                  </div>
                  <div className="-my-1 shrink-0">
                    <RowMenu
                      user={u}
                      isTeacher={isTeacher}
                      classesHref={classesHref}
                      onEdit={() => open({ kind: "edit", user: u })}
                      onPassword={() => open({ kind: "password", user: u })}
                      onToggle={() => void actions.toggleActive(u)}
                      onDelete={() => deleteUser(u)}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="flex items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 px-[18px] py-3.5">
        <Icon name="alert" size={18} className="mt-px text-slate-500" />
        <p className="text-[13px] text-slate-700">{note}</p>
      </div>

      {dialog?.kind === "create" ? (
        <AccountCreateModal
          roleLabel={roleLabel}
          busy={actions.busy}
          flash={actions.flash}
          onSubmit={actions.create}
          onClose={() => setDialog(null)}
        />
      ) : null}
      {dialog?.kind === "edit" ? (
        <AccountEditModal
          user={dialog.user}
          roleLabel={roleLabel}
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

function ClassChips({ classes }: { classes: { id: string; name: string }[] }) {
  if (classes.length === 0) {
    return <span className="text-xs text-slate-400">담당 반 없음</span>;
  }
  return (
    <>
      {classes.map((c) => (
        <span
          key={c.id}
          className="inline-flex h-[22px] items-center rounded bg-brand-50 px-[7px] text-xs font-semibold text-brand-700"
        >
          {c.name}
        </span>
      ))}
    </>
  );
}
