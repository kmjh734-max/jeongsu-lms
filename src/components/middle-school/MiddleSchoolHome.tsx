"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { MsUnitSummary } from "@/lib/middle-school/queries";

/** 학년 · 교과서를 고르고 과 카드를 누른다 */
export function MiddleSchoolHome({ units, base }: { units: MsUnitSummary[]; base: string }) {
  const books = useMemo(() => {
    const keys: string[] = [];
    for (const u of units) {
      const k = `${u.grade} ${u.publisher}`;
      if (!keys.includes(k)) keys.push(k);
    }
    return keys;
  }, [units]);
  const [book, setBook] = useState(books[0] ?? "");
  const shown = units.filter((u) => `${u.grade} ${u.publisher}` === book);

  if (!units.length) {
    return <p className="rounded-lg border border-slate-200 bg-white p-6 text-sm text-slate-500">아직 넣어 둔 교과서가 없습니다.</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {books.map((b) => (
          <button
            key={b}
            type="button"
            onClick={() => setBook(b)}
            className={`rounded-full border px-4 py-1.5 text-sm font-semibold ${
              b === book ? "border-violet-600 bg-violet-600 text-white" : "border-slate-300 bg-white text-slate-700 hover:border-violet-400"
            }`}
          >
            {b}
          </button>
        ))}
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {shown.map((u) => (
          <Link
            key={u.id}
            href={`${base}/${u.id}`}
            className="group rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-violet-400 hover:shadow"
          >
            <div className="text-xs font-bold tracking-wide text-violet-600">LESSON {u.lessonNo}</div>
            <div className="mt-1 text-base font-bold text-slate-900 group-hover:text-violet-700">{u.title}</div>
            <div className="mt-2 text-xs text-slate-500">문법 · {u.grammarTitles.join(" / ") || "—"}</div>
            <div className="mt-0.5 text-xs text-slate-400">단어 {u.wordCount}개</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
