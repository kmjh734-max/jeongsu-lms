"use client";

import { useMemo } from "react";
import { QUESTION_TYPE_GROUPS } from "@/lib/question-generator/question-types";
import {
  PASSAGE_SET_SIZES,
  isSetAllowedKey,
  isSetMarkKey,
  passageSetProblem,
  type PassageSetSize,
} from "@/lib/question-generator/passage-set";

const codeOf = (key: string) => key.split(":").pop() ?? "";

/** 세트 크기를 처음 고를 때 채워 둘 구성(수능 41~42 꼴 제목 + 어휘, 3문항은 내용일치를 더한다) */
const DEFAULT_CODES: Record<PassageSetSize, string[]> = {
  2: ["제목추론", "어휘추론"],
  3: ["제목추론", "어휘추론", "내용일치"],
};

export function passageSetOptions() {
  return QUESTION_TYPE_GROUPS.flatMap((g) => g.options).filter((o) => isSetAllowedKey(o.key));
}

export function defaultPassageSetKeys(size: PassageSetSize): string[] {
  const opts = passageSetOptions();
  return DEFAULT_CODES[size].map((code) => opts.find((o) => codeOf(o.key) === code)?.key ?? opts[0]!.key);
}

/**
 * 1지문 다문항(세트) 고르기 — 만들기 창 왼쪽, 유형별 개수 칸 자리에 들어간다.
 * 지문당 2·3문항을 고르고 문항마다 유형을 고른다. 표시형(빈칸·어법·어휘·함축)은 하나만.
 */
export function PassageSetPicker({
  size,
  keys,
  onChange,
}: {
  size: PassageSetSize;
  keys: string[];
  onChange: (size: PassageSetSize, keys: string[]) => void;
}) {
  const options = useMemo(passageSetOptions, []);
  const problem = passageSetProblem({ size, keys });
  return (
    <section className="space-y-3 rounded-2xl border border-brand-300 bg-white p-3 shadow-card ring-1 ring-brand-100">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-slate-900">지문당 문항 수</h2>
        <div className="inline-flex overflow-hidden rounded-lg border border-slate-200" role="group" aria-label="지문당 문항 수">
          {PASSAGE_SET_SIZES.map((n) => (
            <button
              key={n}
              type="button"
              aria-pressed={size === n}
              className={`px-3 py-1.5 text-xs font-semibold ${
                size === n ? "bg-brand-700 text-white" : "bg-white text-slate-700"
              }`}
              onClick={() => onChange(n, defaultPassageSetKeys(n))}
            >
              {n}문항
            </button>
          ))}
        </div>
      </div>
      <p className="text-[11px] leading-relaxed text-slate-500">
        지문 하나에 문항을 여러 개 붙이고, 시험지에는 지문을 한 번만 찍습니다.
      </p>

      <div className="space-y-1.5">
        {keys.map((key, i) => (
          <label key={i} className="grid grid-cols-[52px_minmax(0,1fr)] items-center gap-2">
            <span className="text-xs text-slate-500">문항 {i + 1}</span>
            <select
              id={`passage-set-slot-${i}`}
              className="ui-select w-full text-xs"
              value={key}
              onChange={(e) => {
                const next = [...keys];
                next[i] = e.target.value;
                onChange(size, next);
              }}
            >
              {options.map((o) => (
                <option key={o.key} value={o.key}>
                  {/* 유형 목록에서는 묶음 이름이 따로 보이지만 여기서는 「(영) 하」만으로는 무슨 유형인지 모른다 */}
                  {o.label.includes(codeOf(o.key)) ? o.label : `${codeOf(o.key)} · ${o.label}`}
                  {isSetMarkKey(o.key) ? " · 지문에 표시" : ""}
                </option>
              ))}
            </select>
          </label>
        ))}
      </div>

      {problem ? (
        <p className="rounded-lg bg-amber-50 px-2.5 py-2 text-[11px] leading-relaxed text-amber-800">{problem}</p>
      ) : null}

      <p className="text-[11px] leading-relaxed text-slate-500">
        빈칸·어법·어휘·함축처럼 지문에 표시하는 유형은 세트에 하나만 넣을 수 있고, 그 문항의 지문을 세트가 함께 씁니다.
        빈칸·함축은 주제·제목·요지·요약문과 함께 넣을 수 없습니다(빈칸 정답이 곧 글의 요지라 답이 겹칩니다).
        문장삽입·순서·무관한문장·제시어배열은 지문을 바꿔서 세트에 넣을 수 없습니다.
      </p>
    </section>
  );
}
