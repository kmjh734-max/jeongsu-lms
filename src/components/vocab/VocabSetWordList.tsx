"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/layout/NavIcon";
import {
  isSpeechSupported,
  speakEnglish,
  stopSpeaking,
} from "@/lib/vocab/speak-client";

export interface VocabSetWord {
  id: string;
  word: string;
  meaning: string;
}

const PREVIEW_COUNT = 12;

function WordRow({
  item,
  no,
  first,
  firstOfSecondColumn,
  speechOk,
}: {
  item: VocabSetWord;
  no: number;
  first: boolean;
  firstOfSecondColumn: boolean;
  speechOk: boolean;
}) {
  return (
    <li
      className={`flex min-h-[40px] items-center gap-3 py-0.5 sm:gap-3.5 sm:py-1 ${
        first
          ? firstOfSecondColumn
            ? "border-t border-slate-100 md:border-t-0"
            : ""
          : "border-t border-slate-100"
      }`}
    >
      <span className="w-5 shrink-0 text-xs tabular-nums text-slate-400">
        {no}
      </span>
      <span className="w-28 shrink-0 break-words text-sm font-semibold text-slate-900 sm:w-[150px]">
        {item.word}
      </span>
      <span className="min-w-0 flex-1 break-keep text-[13px] text-slate-500">
        {item.meaning}
      </span>
      {speechOk && (
        <button
          type="button"
          aria-label={`${item.word} 발음 듣기`}
          className="-mr-2 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-slate-400 sm:h-8 sm:w-8 transition hover:bg-brand-50 hover:text-brand-700"
          onClick={() => speakEnglish(item.word)}
        >
          <Icon name="speaker" size={16} />
        </button>
      )}
    </li>
  );
}

/** 단어장 화면의 "이 단어장의 단어" 목록 */
export function VocabSetWordList({ items }: { items: VocabSetWord[] }) {
  const [expanded, setExpanded] = useState(false);
  const [speechOk, setSpeechOk] = useState(false);

  useEffect(() => {
    setSpeechOk(isSpeechSupported());
    return () => stopSpeaking();
  }, []);

  if (items.length === 0) return null;

  const shown = expanded ? items : items.slice(0, PREVIEW_COUNT);
  const half = Math.ceil(shown.length / 2);
  const columns = [shown.slice(0, half), shown.slice(half)];

  return (
    <section className="rounded-lg border border-slate-200 bg-white px-4 py-4 shadow-card sm:px-[22px] sm:py-[18px]">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-[15px] font-bold text-slate-900">이 단어장의 단어</h2>
        {items.length > PREVIEW_COUNT && (
          <button
            type="button"
            className="-mr-2 inline-flex h-10 items-center rounded-md px-2 text-[13px] font-semibold text-brand-700 transition hover:bg-brand-50 sm:h-8"
            onClick={() => setExpanded((v) => !v)}
            aria-expanded={expanded}
          >
            {expanded ? "접기" : `${items.length}개 모두 보기`}
          </button>
        )}
      </div>
      <div className="mt-2 grid md:grid-cols-2 md:gap-x-10">
        {columns.map((col, c) =>
          col.length > 0 ? (
            <ul key={c}>
              {col.map((item, i) => (
                <WordRow
                  key={item.id}
                  item={item}
                  no={c * half + i + 1}
                  first={i === 0}
                  firstOfSecondColumn={c === 1}
                  speechOk={speechOk}
                />
              ))}
            </ul>
          ) : null
        )}
      </div>
    </section>
  );
}
