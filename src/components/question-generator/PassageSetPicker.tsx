"use client";

import { useMemo } from "react";
import { QUESTION_TYPE_GROUPS } from "@/lib/question-generator/question-types";
import {
  MAX_SET_VARIANTS,
  PASSAGE_SET_SIZES,
  isSetAllowedKey,
  isSetMarkKey,
  passageSetProblem,
  setVariantProblem,
  type PassageSetSize,
} from "@/lib/question-generator/passage-set";

const codeOf = (key: string) => key.split(":").pop() ?? "";
const LETTERS = "ABCD";

/** 세트 크기를 처음 고를 때 채워 둘 구성(수능 41~42 꼴 제목 + 어휘, 3문항은 내용일치를 더한다) */
const DEFAULT_CODES: Record<PassageSetSize, string[][]> = {
  2: [
    ["제목추론", "어휘추론"],
    ["요지추론", "어법추론"],
    ["주제추론", "어휘추론"],
    ["내용일치", "어법추론"],
  ],
  3: [
    ["제목추론", "어휘추론", "내용일치"],
    ["요지추론", "어법추론", "내용불일치"],
    ["주제추론", "어휘추론", "일치개수"],
    ["빈칸추론", "내용일치", "내용불일치"],
  ],
};

/** 세트에 넣을 수 있는 유형 — 무엇이든(2026-10-11 완화). 지문을 바꾸지 않는 유형을 앞에 둔다 */
export function passageSetOptions() {
  const all = QUESTION_TYPE_GROUPS.flatMap((g) => g.options);
  return [...all.filter((o) => isSetAllowedKey(o.key)), ...all.filter((o) => !isSetAllowedKey(o.key))];
}

/** 구성 n번째(0부터)의 기본값 — 구성을 더할 때마다 다른 조합을 채워 둔다 */
export function defaultPassageSetKeys(size: PassageSetSize, n = 0): string[] {
  const opts = passageSetOptions();
  const codes = DEFAULT_CODES[size][n % DEFAULT_CODES[size].length]!;
  return codes.map((code) => opts.find((o) => codeOf(o.key) === code)?.key ?? opts[0]!.key);
}

/**
 * 1지문 다문항(세트) 고르기 — 만들기 창 왼쪽, 유형별 개수 칸 자리에 들어간다.
 * 지문당 2·3문항을 고르고 문항마다 유형을 고른다. 표시형(빈칸·어법·어휘·함축)은 하나만.
 * 구성을 여럿 두면 지문 차례대로 A·B·A·B… 번갈아 붙인다.
 */
export function PassageSetPicker({
  size,
  variants,
  passageCount,
  onChange,
}: {
  size: PassageSetSize;
  variants: string[][];
  /** 넣은 지문 수 — 구성마다 몇 지문에 붙는지 보여 준다 */
  passageCount: number;
  onChange: (size: PassageSetSize, variants: string[][]) => void;
}) {
  const options = useMemo(passageSetOptions, []);
  const problem = passageSetProblem({ size, keys: variants[0] ?? [], variants });
  const share = (i: number) =>
    passageCount > 0 ? Math.floor(passageCount / variants.length) + (i < passageCount % variants.length ? 1 : 0) : 0;
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
              onClick={() => onChange(n, variants.map((_, i) => defaultPassageSetKeys(n, i)))}
            >
              {n}문항
            </button>
          ))}
        </div>
      </div>
      <p className="text-[11px] leading-relaxed text-slate-500">
        지문 하나에 문항을 여러 개 붙이고, 시험지에는 지문을 한 번만 찍습니다.
      </p>

      {variants.map((keys, vi) => (
        <div key={vi} className="space-y-1.5 rounded-xl border border-slate-200 bg-slate-50/60 p-2">
          {variants.length > 1 ? (
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700">
                구성 {LETTERS[vi]}
                {passageCount > 0 ? (
                  <span className="ml-1.5 font-normal text-slate-500">지문 {share(vi)}개</span>
                ) : null}
              </span>
              <button
                type="button"
                className="text-[11px] text-slate-500 underline-offset-2 hover:underline"
                onClick={() => onChange(size, variants.filter((_, i) => i !== vi))}
              >
                빼기
              </button>
            </div>
          ) : null}
          {keys.map((key, i) => (
            <label key={i} className="grid grid-cols-[52px_minmax(0,1fr)] items-center gap-2">
              <span className="text-xs text-slate-500">문항 {i + 1}</span>
              <select
                id={`passage-set-${vi}-slot-${i}`}
                className="ui-select w-full text-xs"
                value={key}
                onChange={(e) => {
                  const next = variants.map((v) => [...v]);
                  next[vi]![i] = e.target.value;
                  onChange(size, next);
                }}
              >
                {options.map((o) => (
                  <option key={o.key} value={o.key}>
                    {/* 유형 목록에서는 묶음 이름이 따로 보이지만 여기서는 「(영) 하」만으로는 무슨 유형인지 모른다 */}
                    {o.label.includes(codeOf(o.key)) ? o.label : `${codeOf(o.key)} · ${o.label}`}
                    {isSetMarkKey(o.key) ? " · 지문에 표시" : !isSetAllowedKey(o.key) ? " · 세트 불가" : ""}
                  </option>
                ))}
              </select>
            </label>
          ))}
          {setVariantProblem(size, keys) ? (
            <p className="rounded-lg bg-amber-50 px-2.5 py-2 text-[11px] leading-relaxed text-amber-800" role="alert">
              {setVariantProblem(size, keys)}
            </p>
          ) : null}
        </div>
      ))}

      {variants.length < MAX_SET_VARIANTS ? (
        <button
          type="button"
          className="w-full rounded-lg border border-dashed border-slate-300 px-2 py-1.5 text-xs font-semibold text-slate-600 hover:border-brand-300 hover:text-brand-700"
          onClick={() => onChange(size, [...variants, defaultPassageSetKeys(size, variants.length)])}
        >
          + 구성 추가 (지문을 번갈아 나눠 붙임)
        </button>
      ) : null}

      {problem && !variants.some((keys) => setVariantProblem(size, keys)) ? (
        <p className="rounded-lg bg-amber-50 px-2.5 py-2 text-[11px] leading-relaxed text-amber-800">{problem}</p>
      ) : null}

      <p className="text-[11px] leading-relaxed text-slate-500">
        구성을 여럿 넣으면 지문 차례대로 A·B·A·B… 번갈아 붙입니다(지문 10개에 구성 둘이면 5개씩).
        시험지에는 지문을 한 번만 찍습니다. 빈칸·어법·어휘·제시어배열처럼 지문에 표시하는 유형은 서로 다른 문장에 표시해 한 지문에 함께 담습니다.
        같은 표시(①~⑤, ⓐ~ 등)를 쓰는 유형 둘과, 무관한문장·문장삽입·순서·어법 문장 수정은 한 지문에 담을 수 없어 고르면 알려 드립니다.
      </p>
    </section>
  );
}
