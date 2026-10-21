"use client";

import { useEffect, useRef, useState } from "react";
import { postJson } from "@/lib/lesson-materials/post-json";
import { DOCUMENT_NAME_EVENT } from "@/components/lesson-materials/open-new-document";

/**
 * 자료 화면 왼쪽 위의 파일 이름(선생님 2026-10-21: 수업용 자료든 분석지든 만들면 그 파일 제목을 왼쪽 위에).
 * 주소의 ?doc=로 이름을 읽고, 새로 만들면 만든 뒤에 받는다. 누르면 그 자리에서 이름을 바꾼다.
 * 파일이 없는 화면(주소에 doc이 없고 만들지도 않음)에서는 기본 글자(fallback)를 보인다.
 */
export function DocumentTitle({ role, fallback }: { role: "admin" | "teacher"; fallback: string }) {
  const [doc, setDoc] = useState<{ id: string; name: string } | null>(null);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onName = (e: Event) => {
      const d = (e as CustomEvent).detail as { id?: string; name?: string } | undefined;
      if (d?.id && d.name) setDoc({ id: d.id, name: d.name });
    };
    window.addEventListener(DOCUMENT_NAME_EVENT, onName);
    const id = new URLSearchParams(window.location.search).get("doc")?.trim();
    if (id) {
      void postJson<{ ok: true; name: string } | { ok: false; message: string }>("/api/lesson-materials/documents/open", {
        op: "getName",
        role,
        id,
      })
        .then((res) => {
          if (res.ok) setDoc((cur) => cur ?? { id, name: res.name });
        })
        .catch(() => {});
    }
    return () => window.removeEventListener(DOCUMENT_NAME_EVENT, onName);
  }, [role]);

  useEffect(() => {
    if (editing) inputRef.current?.select();
  }, [editing]);

  async function commit() {
    setEditing(false);
    const name = draft.trim();
    if (!doc || !name || name === doc.name) return;
    const prev = doc.name;
    setDoc({ ...doc, name });
    const res = await postJson<{ ok: true; name: string } | { ok: false; message: string }>("/api/lesson-materials/documents/open", {
      op: "rename",
      role,
      id: doc.id,
      name,
    }).catch(() => null);
    if (!res || !res.ok) setDoc({ ...doc, name: prev });
  }

  if (!doc) return <span className="min-w-0 truncate text-sm font-bold text-slate-900">{fallback}</span>;
  if (editing) {
    return (
      <input
        ref={inputRef}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => void commit()}
        onKeyDown={(e) => {
          if (e.key === "Enter") void commit();
          if (e.key === "Escape") setEditing(false);
        }}
        className="min-w-0 flex-1 rounded-md border border-violet-300 px-2 py-0.5 text-sm font-bold text-slate-900 outline-none"
      />
    );
  }
  return (
    <button
      type="button"
      title={`${doc.name} — 눌러서 이름 바꾸기`}
      onClick={() => {
        setDraft(doc.name);
        setEditing(true);
      }}
      className="min-w-0 flex-1 truncate rounded-md px-1 py-0.5 text-left text-sm font-bold text-slate-900 hover:bg-slate-100"
    >
      {doc.name}
    </button>
  );
}
