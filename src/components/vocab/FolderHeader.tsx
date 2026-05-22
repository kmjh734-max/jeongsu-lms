"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import * as adminActions from "@/app/admin/vocab/actions";
import * as teacherActions from "@/app/teacher/vocab/actions";

interface FolderHeaderProps {
  role: "admin" | "teacher";
  folderId: string;
  folderName: string;
  basePath: string;
  academyName: string;
  ownerName: string;
  ownerUsername: string | null;
  setCount: number;
  onAssignClick: () => void;
  createSetButton: React.ReactNode;
}

export function FolderHeader({
  role,
  folderId,
  folderName,
  basePath,
  academyName,
  ownerName,
  ownerUsername,
  setCount,
  onAssignClick,
  createSetButton,
}: FolderHeaderProps) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(folderName);
  const [saving, setSaving] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [folderUrl, setFolderUrl] = useState("");
  const settingsRef = useRef<HTMLDivElement>(null);

  const ownerLabel = ownerUsername
    ? `${academyName}, ${ownerUsername} 님의 폴더입니다`
    : `${academyName}, ${ownerName} 님의 폴더입니다`;

  useEffect(() => {
    setName(folderName);
  }, [folderName]);

  useEffect(() => {
    setFolderUrl(
      `${window.location.origin}${basePath}/folder/${folderId}`
    );
  }, [basePath, folderId]);

  useEffect(() => {
    if (!settingsOpen) return;
    function handleClick(e: MouseEvent) {
      if (
        settingsRef.current &&
        !settingsRef.current.contains(e.target as Node)
      ) {
        setSettingsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [settingsOpen]);

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(null), 2500);
  }

  async function saveName() {
    const trimmed = name.trim();
    if (!trimmed || trimmed === folderName) {
      setEditing(false);
      setName(folderName);
      return;
    }
    setSaving(true);
    const actions = role === "admin" ? adminActions : teacherActions;
    const result = await actions.updateVocabFolder(folderId, trimmed);
    setSaving(false);
    if (!result.ok) {
      window.alert(result.message);
      setName(folderName);
      return;
    }
    setEditing(false);
    router.refresh();
  }

  async function copyFolderLink() {
    const url =
      folderUrl ||
      `${window.location.origin}${basePath}/folder/${folderId}`;
    try {
      await navigator.clipboard.writeText(url);
      showToast("폴더 링크가 복사되었습니다.");
    } catch {
      window.prompt("아래 링크를 복사하세요.", url);
    }
    setSettingsOpen(false);
  }

  return (
    <header className="relative overflow-hidden rounded-2xl border border-emerald-200/80 bg-gradient-to-br from-[#8fd14f] via-[#7cb518] to-[#6aa014] shadow-md">
      {toast && (
        <div
          className="absolute left-1/2 top-3 z-20 -translate-x-1/2 rounded-lg bg-slate-900/90 px-4 py-2 text-sm font-medium text-white shadow-lg"
          role="status"
        >
          {toast}
        </div>
      )}

      <div
        className="relative px-5 py-6 sm:px-8 sm:py-8"
        style={{
          backgroundImage:
            "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, transparent 50%)",
        }}
      >
        <div
          className="pointer-events-none absolute -right-6 -top-4 h-32 w-32 opacity-20"
          aria-hidden
        >
          <svg viewBox="0 0 64 64" className="h-full w-full text-white">
            <path
              fill="currentColor"
              d="M8 12h40v40H8V12zm4 4v32h32V16H12zm6 6h20v4H18v-4zm0 8h20v4H18v-4zm0 8h14v4H18v-4z"
            />
          </svg>
        </div>

        <div className="relative mb-4 flex items-center justify-end gap-1 sm:absolute sm:right-6 sm:top-6 sm:mb-0">
          <button
            type="button"
            onClick={copyFolderLink}
            title="폴더 링크 공유"
            className="rounded-lg bg-white/15 p-2 text-white transition hover:bg-white/25"
            aria-label="폴더 링크 공유"
          >
            <ShareIcon />
          </button>
          <div className="relative" ref={settingsRef}>
            <button
              type="button"
              onClick={() => setSettingsOpen((o) => !o)}
              title="폴더 설정"
              className="rounded-lg bg-white/15 p-2 text-white transition hover:bg-white/25"
              aria-label="폴더 설정"
              aria-expanded={settingsOpen}
            >
              <SettingsIcon />
            </button>
            {settingsOpen && (
              <ul className="absolute right-0 z-30 mt-1 min-w-[11rem] rounded-lg border border-slate-200 bg-white py-1 text-sm text-slate-800 shadow-lg">
                <li>
                  <button
                    type="button"
                    className="w-full px-4 py-2.5 text-left hover:bg-slate-50"
                    onClick={() => {
                      setSettingsOpen(false);
                      setEditing(true);
                    }}
                  >
                    폴더명 수정
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    className="w-full px-4 py-2.5 text-left hover:bg-slate-50"
                    onClick={() => {
                      setSettingsOpen(false);
                      onAssignClick();
                    }}
                  >
                    학생·반 배정
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    className="w-full px-4 py-2.5 text-left hover:bg-slate-50"
                    onClick={copyFolderLink}
                  >
                    링크 복사
                  </button>
                </li>
              </ul>
            )}
          </div>
        </div>

        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between sm:pr-24">
          <div className="flex min-w-0 gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm sm:h-20 sm:w-20">
              <span className="text-4xl sm:text-5xl" aria-hidden>
                📁
              </span>
            </div>
            <div className="min-w-0 text-white">
              {editing ? (
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    className="min-w-[12rem] rounded-lg border-0 px-3 py-2 text-lg font-bold text-slate-900 shadow-sm"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") saveName();
                      if (e.key === "Escape") {
                        setEditing(false);
                        setName(folderName);
                      }
                    }}
                    autoFocus
                  />
                  <button
                    type="button"
                    disabled={saving}
                    onClick={saveName}
                    className="rounded-lg bg-white/90 px-3 py-1.5 text-sm font-bold text-emerald-800 hover:bg-white"
                  >
                    {saving ? "저장 중…" : "저장"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(false);
                      setName(folderName);
                    }}
                    className="text-sm text-white/90 underline"
                  >
                    취소
                  </button>
                </div>
              ) : (
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl font-bold leading-tight sm:text-2xl">
                    {folderName}
                  </h1>
                  <button
                    type="button"
                    onClick={() => setEditing(true)}
                    title="폴더명 수정"
                    className="rounded-lg bg-white/20 p-1.5 text-white hover:bg-white/30"
                    aria-label="폴더명 수정"
                  >
                    <PencilIcon />
                  </button>
                </div>
              )}
              <p className="mt-1 text-sm text-white/90">{ownerLabel}</p>
              <p className="mt-2 text-sm font-medium text-white/80">
                단어세트 {setCount}개 · 드래그로 순서 변경
              </p>
            </div>
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onAssignClick}
              className="inline-flex h-10 items-center rounded-lg border-2 border-white/80 bg-white/10 px-4 text-sm font-bold text-white backdrop-blur-sm transition hover:bg-white/20"
            >
              학생·반 배정
            </button>
            {createSetButton}
          </div>
        </div>
      </div>
    </header>
  );
}

function ShareIcon() {
  return (
    <svg
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
      />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
      />
    </svg>
  );
}

function PencilIcon() {
  return (
    <svg
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
      />
    </svg>
  );
}
