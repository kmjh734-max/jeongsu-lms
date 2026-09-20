"use client";

import { useState } from "react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { deleteTextbookAction, saveTextbookAction } from "@/app/admin/textbooks/actions";
import { tocFromFile } from "@/lib/textbooks/read-file";
import type { Textbook } from "@/lib/textbooks";

const SAMPLE = `1과 The World of Words  p.8~21
  Reading 1  8-13
  Reading 2  14-17
  Grammar Focus 18
2과 Living Together  22~35`;

/** 교재 목차 올리기·고치기 */
export function TextbookBoard({ books }: { books: Textbook[] }) {
  const [editing, setEditing] = useState<Textbook | null>(null);
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [toc, setToc] = useState("");
  const [busy, setBusy] = useState(false);
  const [reading, setReading] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  function startNew() {
    setEditing(null);
    setTitle("");
    setSubject("");
    setToc("");
    setMsg(null);
  }

  function startEdit(book: Textbook) {
    setEditing(book);
    setTitle(book.title);
    setSubject(book.subject ?? "");
    setToc(book.units.map((u) => `${"  ".repeat(u.depth)}${u.title}${u.pages ? `  ${u.pages}` : ""}`).join("\n"));
    setMsg(null);
  }

  async function save() {
    setBusy(true);
    const r = await saveTextbookAction({ textbookId: editing?.id ?? null, title, subject, toc });
    setMsg({ ok: r.ok, text: r.message });
    setBusy(false);
  }

  async function remove(book: Textbook) {
    if (!confirm(`${book.title} 교재를 지울까요?`)) return;
    setBusy(true);
    const r = await deleteTextbookAction(book.id);
    setMsg({ ok: r.ok, text: r.message });
    setBusy(false);
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">올려 둔 교재 {books.length}권</h2>
          <button type="button" onClick={startNew} className="text-sm font-semibold text-brand-700 hover:underline">
            + 새 교재
          </button>
        </div>
        <ul className="mt-3 space-y-1.5">
          {books.map((b) => (
            <li key={b.id} className="flex items-center justify-between gap-2 rounded-xl border border-slate-200 px-3 py-2">
              <button type="button" onClick={() => startEdit(b)} className="min-w-0 text-left">
                <b className="block truncate text-sm text-slate-900">{b.title}</b>
                <span className="text-xs text-slate-500">
                  {b.subject ? `${b.subject} · ` : ""}목차 {b.units.length}줄
                </span>
              </button>
              <button type="button" onClick={() => void remove(b)} className="shrink-0 text-xs text-slate-400 hover:text-red-600">
                지우기
              </button>
            </li>
          ))}
          {books.length === 0 ? <li className="rounded-xl bg-slate-50 px-3 py-4 text-sm text-slate-500">아직 올린 교재가 없어요.</li> : null}
        </ul>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-bold text-slate-900">{editing ? `${editing.title} 고치기` : "새 교재 목차 올리기"}</h2>
        <p className="mt-1 text-xs text-slate-500">
          목차를 그대로 붙여 넣으세요. 앞의 공백 두 칸(또는 탭)이 한 층이 되고, 줄 끝 숫자는 쪽으로 읽어요.
        </p>

        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <div>
            <label htmlFor="tb-title" className="ui-label">교재 이름</label>
            <input id="tb-title" value={title} onChange={(e) => setTitle(e.target.value)} className="ui-input" placeholder="내공영문법 2" />
          </div>
          <div>
            <label htmlFor="tb-subject" className="ui-label">영역 <span className="font-normal text-slate-400">비워도 돼요</span></label>
            <input id="tb-subject" value={subject} onChange={(e) => setSubject(e.target.value)} className="ui-input" placeholder="문법" />
          </div>
        </div>

        <div className="mt-3">
          <label className="flex cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-center hover:border-brand-400">
            <input
              id="tb-file"
              type="file"
              accept=".xlsx,.xls,.csv,.txt,.pdf,image/*"
              className="sr-only"
              disabled={!!reading}
              onChange={async (e) => {
                const file = e.target.files?.[0];
                e.target.value = "";
                if (!file) return;
                setMsg(null);
                setReading(file.name);
                try {
                  const text = await tocFromFile(file);
                  if (text.trim()) {
                    setToc(text.trim());
                    if (!title.trim()) setTitle(file.name.replace(/\.[^.]+$/, ""));
                    setMsg({
                      ok: true,
                      text: `${file.name}에서 목차 ${text.trim().split("\n").length}줄을 읽었어요. 확인하고 고쳐 주세요.`,
                    });
                  } else {
                    setMsg({ ok: false, text: "목차를 찾지 못했어요. 글자로 붙여 넣어 주세요." });
                  }
                } catch (err) {
                  setMsg({ ok: false, text: err instanceof Error ? err.message : "파일을 읽지 못했어요." });
                } finally {
                  setReading(null);
                }
              }}
            />
            <span className="text-sm font-semibold text-slate-800">
              {reading ? `${reading} 읽는 중…` : "엑셀 · PDF · 사진으로 올리기"}
            </span>
            <span className="text-xs text-slate-500">읽은 목차는 아래 칸에 들어가요. 고친 뒤 저장하세요.</span>
          </label>
        </div>

        <div className="mt-3">
          <label htmlFor="tb-toc" className="ui-label">목차</label>
          <textarea
            id="tb-toc"
            value={toc}
            onChange={(e) => setToc(e.target.value)}
            rows={14}
            className="ui-input font-mono text-[13px] leading-relaxed"
            placeholder={SAMPLE}
            spellCheck={false}
          />
        </div>

        {msg ? <div className="mt-3"><Alert variant={msg.ok ? "success" : "error"}>{msg.text}</Alert></div> : null}

        <div className="mt-4 flex justify-end gap-2">
          {editing ? <Button variant="secondary" onClick={startNew}>새로 만들기</Button> : null}
          <Button onClick={save} disabled={busy}>{busy ? "저장 중…" : "저장"}</Button>
        </div>
      </section>
    </div>
  );
}
