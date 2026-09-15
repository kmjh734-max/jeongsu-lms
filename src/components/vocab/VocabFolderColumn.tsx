"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import * as adminActions from "@/app/admin/vocab/actions";
import * as teacherActions from "@/app/teacher/vocab/actions";
import { Icon } from "@/components/layout/NavIcon";
import { RowMenu, type MenuItem } from "@/components/vocab/VocabUi";
import {
  vocabBasePath,
  type VocabModuleFolder,
  type VocabRole,
  type VocabSetsFilter,
} from "@/lib/vocab/module-types";

function isActive(filter: VocabSetsFilter, key: string): boolean {
  if (filter.kind === "folder") return key === `folder:${filter.folderId}`;
  return key === filter.kind;
}

function FolderRow({
  href,
  label,
  count,
  active,
  icon,
  menuItems,
}: {
  href: string;
  label: string;
  count: number;
  active: boolean;
  icon: string;
  menuItems?: MenuItem[];
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <div
      className={`group relative flex h-[34px] items-center rounded-md ${
        active ? "bg-brand-50" : "hover:bg-slate-50"
      }`}
    >
      <Link
        href={href}
        prefetch={false}
        aria-current={active ? "page" : undefined}
        className={`flex h-full min-w-0 flex-1 items-center justify-between gap-2 px-2.5 text-[13px] ${
          active ? "font-semibold text-brand-700" : "font-medium text-slate-800"
        }`}
      >
        <span className="flex min-w-0 items-center gap-2">
          <Icon
            name={icon}
            size={15}
            className={active ? "text-brand-700" : "text-slate-400"}
          />
          <span className="truncate">{label}</span>
        </span>
        <span
          className={`text-xs tabular-nums ${
            menuItems ? (menuOpen ? "invisible" : "group-hover:invisible") : ""
          } ${active ? "text-brand-700" : "text-slate-400"}`}
        >
          {count}
        </span>
      </Link>
      {menuItems ? (
        <div
          className={`absolute right-1 top-1/2 -translate-y-1/2 ${
            menuOpen ? "block" : "hidden group-hover:block"
          }`}
        >
          <RowMenu
            label={`${label} 폴더 메뉴`}
            className="h-6 w-6"
            items={menuItems}
            onOpenChange={setMenuOpen}
          />
        </div>
      ) : null}
    </div>
  );
}

export function VocabFolderColumn({
  role,
  folders,
  filter,
  mySetCount,
  unfiledCount,
  lockedUnfiledCount,
  onMessage,
}: {
  role: VocabRole;
  folders: VocabModuleFolder[];
  filter: VocabSetsFilter;
  mySetCount: number;
  unfiledCount: number;
  lockedUnfiledCount: number;
  onMessage: (text: string, tone?: "good" | "bad") => void;
}) {
  const router = useRouter();
  const base = vocabBasePath(role);
  const actions = role === "admin" ? adminActions : teacherActions;
  const curriculum = folders.filter((f) => f.isCurriculum);
  const mine = folders.filter((f) => !f.isCurriculum);

  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleCreate() {
    const name = newName.trim();
    if (!name) {
      setCreating(false);
      return;
    }
    setBusy(true);
    try {
      const result = await actions.createVocabFolder(name);
      if (!result.ok) {
        onMessage(result.message, "bad");
        return;
      }
      setNewName("");
      setCreating(false);
      onMessage(`‘${name}’ 폴더를 만들었어요.`);
      router.refresh();
    } catch {
      onMessage("폴더를 만들지 못했어요. 잠시 뒤 다시 해 주세요.", "bad");
    } finally {
      setBusy(false);
    }
  }

  async function handleRename(folder: VocabModuleFolder) {
    const name = renameValue.trim();
    if (!name || name === folder.name) {
      setRenamingId(null);
      return;
    }
    setBusy(true);
    try {
      const result = await actions.updateVocabFolder(folder.id, name);
      if (!result.ok) {
        onMessage(result.message, "bad");
        return;
      }
      setRenamingId(null);
      onMessage("폴더 이름을 바꿨어요.");
      router.refresh();
    } catch {
      onMessage("이름을 바꾸지 못했어요. 잠시 뒤 다시 해 주세요.", "bad");
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(folder: VocabModuleFolder) {
    if (
      !window.confirm(
        `‘${folder.name}’ 폴더를 지울까요?\n안에 있는 단어장은 지워지지 않고 미분류로 옮겨져요.`
      )
    ) {
      return;
    }
    setBusy(true);
    try {
      const result = await actions.deleteVocabFolder(folder.id);
      if (!result.ok) {
        onMessage(result.message, "bad");
        return;
      }
      onMessage("폴더를 지웠어요.");
      if (filter.kind === "folder" && filter.folderId === folder.id) {
        router.push(`${base}/sets`);
      }
      router.refresh();
    } catch {
      onMessage("폴더를 지우지 못했어요. 잠시 뒤 다시 해 주세요.", "bad");
    } finally {
      setBusy(false);
    }
  }

  const showCurriculum = curriculum.length > 0 || lockedUnfiledCount > 0;

  return (
    <nav
      aria-label="폴더"
      className="w-full shrink-0 self-start rounded-lg border border-slate-200 bg-white px-2.5 py-3.5 shadow-card lg:w-[216px]"
    >
      {showCurriculum ? (
        <>
          <p className="px-1 pb-1.5 text-xs font-semibold text-slate-500">학원 교재</p>
          {curriculum.map((f) => (
            <FolderRow
              key={f.id}
              href={`${base}/folder/${f.id}`}
              label={f.name}
              count={f.setCount}
              icon="lock"
              active={isActive(filter, `folder:${f.id}`)}
            />
          ))}
          {lockedUnfiledCount > 0 ? (
            <FolderRow
              href={`${base}/sets?view=locked`}
              label="학원 교재"
              count={lockedUnfiledCount}
              icon="lock"
              active={isActive(filter, "locked")}
            />
          ) : null}
          <div className="mx-1 my-2.5 h-px bg-slate-100" />
        </>
      ) : null}

      <div className="flex items-center justify-between px-1 pb-1.5">
        <span className="text-xs font-semibold text-slate-500">내 세트</span>
        <button
          type="button"
          onClick={() => setCreating(true)}
          className="flex h-6 w-6 items-center justify-center rounded text-slate-500 hover:bg-slate-100 hover:text-slate-800"
          aria-label="새 폴더"
          title="새 폴더"
        >
          <Icon name="plus" size={16} strokeWidth={2} />
        </button>
      </div>

      {creating ? (
        <div className="mb-1 px-0.5">
          <input
            className="ui-input h-8 py-1 text-[13px]"
            placeholder="폴더 이름"
            value={newName}
            autoFocus
            disabled={busy}
            onChange={(e) => setNewName(e.target.value)}
            onBlur={() => {
              if (!newName.trim()) setCreating(false);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") void handleCreate();
              if (e.key === "Escape") {
                setCreating(false);
                setNewName("");
              }
            }}
          />
          <p className="mt-1 px-1 text-[11px] text-slate-400">Enter로 만들기 · Esc로 취소</p>
        </div>
      ) : null}

      <FolderRow
        href={`${base}/sets`}
        label="전체"
        count={mySetCount}
        icon="folder"
        active={isActive(filter, "all")}
      />
      <FolderRow
        href={`${base}/unfiled`}
        label="미분류"
        count={unfiledCount}
        icon="folder"
        active={isActive(filter, "unfiled")}
      />
      {mine.map((f) =>
        renamingId === f.id ? (
          <div key={f.id} className="px-0.5 py-0.5">
            <input
              className="ui-input h-8 py-1 text-[13px]"
              value={renameValue}
              autoFocus
              disabled={busy}
              onChange={(e) => setRenameValue(e.target.value)}
              onBlur={() => void handleRename(f)}
              onKeyDown={(e) => {
                if (e.key === "Enter") void handleRename(f);
                if (e.key === "Escape") setRenamingId(null);
              }}
            />
          </div>
        ) : (
          <FolderRow
            key={f.id}
            href={`${base}/folder/${f.id}`}
            label={f.name}
            count={f.setCount}
            icon="folder"
            active={isActive(filter, `folder:${f.id}`)}
            menuItems={[
              {
                label: "이름 바꾸기",
                icon: "edit",
                onSelect: () => {
                  setRenameValue(f.name);
                  setRenamingId(f.id);
                },
              },
              {
                label: "폴더 지우기",
                icon: "trash",
                danger: true,
                onSelect: () => void handleDelete(f),
              },
            ]}
          />
        )
      )}
    </nav>
  );
}
