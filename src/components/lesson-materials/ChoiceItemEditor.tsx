"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  addChoiceItem,
  overlapsChoice,
  removeChoiceItem,
  suggestGrammarWrong,
  suggestVocabOpposite,
  updateChoiceIncorrect,
  wordSpanAt,
  type ChoiceSection,
} from "@/lib/lesson-materials/choice-edit";

type Picked =
  | { type: "choice"; choiceId: string }
  | { type: "word"; start: number; end: number }
  | null;

function circled(n: number) {
  return n >= 1 && n <= 20 ? String.fromCharCode(0x2460 + n - 1) : `(${n})`;
}

/**
 * 어법 선택·어휘 선택 지문 하나의 문항을 고치는 창.
 * 문항([A / B])을 누르면 틀린 말을 바꾸거나 지우고, 지문의 낱말을 누르면 그 자리에 문항을 더한다.
 */
export function ChoiceItemEditor<S extends ChoiceSection>({
  kind,
  section,
  wordLevel = "normal",
  onApply,
  onClose,
}: {
  kind: "grammar" | "vocab";
  /** 어휘 추천 수준(이 워크북의 일반 / 난이도 UP) */
  wordLevel?: "normal" | "hard";
  section: S;
  onApply: (next: S) => void;
  onClose: () => void;
}) {
  const [picked, setPicked] = useState<Picked>(null);
  const [draft, setDraft] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  /** 틀린 말 추천을 찾는 중 */
  const [finding, setFinding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const passage = section.sourcePassage;
  const items = section.items;
  const pickedItem = picked?.type === "choice" ? items.find((it) => it.choiceId === picked.choiceId) : undefined;
  const pickedText = picked?.type === "word" ? passage.slice(picked.start, picked.end) : "";

  /*
   * 낱말을 고르면 틀린 말을 자동으로 추천해 칸에 채운다(선생님은 「더하기」만 누르면 된다).
   * 선생님 요청(2026-10-20): 사용자가 입력하는 게 아니라 자동으로 추천하도록.
   * 규칙·저장된 짝으로 못 찾으면 서버가 지문 문맥을 보고 만든다.
   */
  /** 늦게 온 옛 응답을 버리려고 요청마다 번호를 단다 */
  const requestNo = useRef(0);

  /**
   * 자리(start~end)에 넣을 틀린 말을 서버에 묻는다. fresh면 지금까지 보인 말(avoid)을 빼고
   * 지문 문맥을 보고 새로 고른다(「새로 추천받기」).
   * 선생님 요청(2026-10-20): 수업 준비하다가도 새로 제안받는 버튼이 있으면 좋겠다.
   */
  const fetchSuggestions = useCallback(
    (start: number, end: number, opts: { fresh: boolean; avoid: string[]; local: string[] }) => {
      const no = ++requestNo.current;
      setFinding(true);
      const text = passage.slice(start, end);
      // 고른 자리가 든 문장(앞뒤 마침표까지)
      const before = passage.slice(0, start);
      const sStart = Math.max(before.lastIndexOf(". "), before.lastIndexOf("? "), before.lastIndexOf("! ")) + 1;
      const rest = passage.slice(end).search(/[.!?](\s|$)/);
      const sentence = passage.slice(sStart, rest < 0 ? passage.length : end + rest + 1).trim();
      void fetch("/api/lesson-materials/vocab-choice/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: section.projectId,
          word: text,
          kind,
          sentence,
          passage,
          wordLevel,
          fresh: opts.fresh,
          avoid: opts.avoid,
        }),
      })
        .then((r) => r.json())
        .then((d: { ok?: boolean; suggestions?: string[] }) => {
          if (no !== requestNo.current) return;
          if (!d.ok || !d.suggestions?.length) {
            if (opts.fresh) setError("새 추천을 찾지 못했습니다. 다시 눌러 보거나 직접 적어 주세요.");
            return;
          }
          // 새로 받은 추천을 앞에, 그 전 추천은 뒤에 둔다.
          const merged = [...new Set([...d.suggestions, ...opts.local])].slice(0, 6);
          setSuggestions(merged);
          setDraft((cur) => (!opts.fresh && cur && !opts.local.includes(cur) ? cur : merged[0]!));
        })
        .catch(() => {})
        .finally(() => {
          if (no === requestNo.current) setFinding(false);
        });
    },
    [passage, section.projectId, kind, wordLevel]
  );

  useEffect(() => {
    if (picked?.type !== "word") {
      requestNo.current++;
      setFinding(false);
      return;
    }
    const text = passage.slice(picked.start, picked.end);
    const local = kind === "grammar" ? suggestGrammarWrong(text) : suggestVocabOpposite(text);
    setSuggestions(local);
    setDraft(local[0] ?? "");
    fetchSuggestions(picked.start, picked.end, { fresh: false, avoid: [], local });
  }, [picked, passage, kind, fetchSuggestions]);

  /** 「새로 추천받기」: 고른 자리(새 낱말이든 이미 있는 문항이든)에 다른 틀린 말을 받는다. */
  const freshSuggest = () => {
    setError(null);
    const span =
      picked?.type === "word"
        ? { start: picked.start, end: picked.end }
        : pickedItem
          ? { start: pickedItem.startCharIndex, end: pickedItem.endCharIndex }
          : null;
    if (!span) return;
    const avoid = [...new Set([...suggestions, draft, pickedItem?.incorrectText ?? ""].filter(Boolean))];
    fetchSuggestions(span.start, span.end, { fresh: true, avoid, local: suggestions });
  };

  /** 지문을 [글 조각 / 문항] 차례로, 글 조각은 원문 위치와 함께 */
  const pieces = useMemo(() => {
    const byNumber = new Map(items.map((it) => [it.number, it] as const));
    const out: Array<
      | { kind: "text"; start: number; text: string }
      | { kind: "choice"; choiceId: string; number: number; left: string; right: string }
    > = [];
    let cursor = 0;
    for (const seg of section.segments) {
      if (seg.type === "text") {
        out.push({ kind: "text", start: cursor, text: seg.text });
        cursor += seg.text.length;
      } else {
        const it = byNumber.get(seg.number);
        out.push({
          kind: "choice",
          choiceId: it?.choiceId ?? `n${seg.number}`,
          number: seg.number,
          left: seg.leftText,
          right: seg.rightText,
        });
        if (it) cursor = it.endCharIndex;
      }
    }
    return out;
  }, [section.segments, items]);

  const apply = (fn: () => S) => {
    try {
      onApply(fn());
      setPicked(null);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "고치지 못했습니다.");
    }
  };

  const pickWord = (index: number, extend: boolean) => {
    const span = wordSpanAt(passage, index);
    if (!span) return;
    setError(null);
    if (extend && picked?.type === "word") {
      const start = Math.min(picked.start, span.start);
      const end = Math.max(picked.end, span.end);
      // 문항을 건너뛰거나 문장을 넘어 넓히지 않는다.
      if (overlapsChoice(section, start, end) || /[.!?]/.test(passage.slice(start, end))) return;
      setPicked({ type: "word", start, end });
      return;
    }
    if (overlapsChoice(section, span.start, span.end)) return;
    setPicked({ type: "word", ...span });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 print:hidden">
      <div className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3">
          <div className="min-w-0">
            <p className="text-sm font-bold text-slate-900">
              {kind === "grammar" ? "어법 선택" : "어휘 선택"} 문항 고치기
            </p>
            <p className="truncate text-[11px] text-slate-500">{section.title}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-bold text-white"
          >
            다 고쳤어요
          </button>
        </div>
        <p className="border-b border-slate-100 bg-slate-50 px-5 py-2 text-[11px] leading-relaxed text-slate-600">
          문항을 누르면 틀린 말을 바꾸거나 지울 수 있습니다. 지문의 낱말을 누르면 틀린 말을 자동으로 추천해 그 자리에 문항을 더합니다.
          두세 낱말을 묶으려면 Shift를 누른 채 끝 낱말을 누르세요.
        </p>
        <div className="min-h-0 flex-1 overflow-auto px-5 py-4">
          <p className="text-[14px] leading-[2.1] text-slate-900">
            {pieces.map((p, i) =>
              p.kind === "choice" ? (
                <button
                  key={`c-${p.choiceId}`}
                  type="button"
                  onClick={() => {
                    setError(null);
                    setPicked({ type: "choice", choiceId: p.choiceId });
                    const it = items.find((x) => x.choiceId === p.choiceId);
                    setDraft(it?.incorrectText ?? "");
                    setSuggestions([]);
                  }}
                  className={`mx-0.5 rounded-md border px-1 font-semibold ${
                    picked?.type === "choice" && picked.choiceId === p.choiceId
                      ? "border-violet-500 bg-violet-100"
                      : "border-violet-200 bg-violet-50 hover:bg-violet-100"
                  }`}
                >
                  <span className="mr-0.5 text-violet-700">{circled(p.number)}</span>[{p.left} / {p.right}]
                </button>
              ) : (
                <span key={`t-${i}`}>
                  {(p.text.match(/[A-Za-z0-9'’-]+|[^A-Za-z0-9'’-]+/g) ?? []).reduce<{
                    at: number;
                    nodes: React.ReactNode[];
                  }>(
                    (acc, tok, k) => {
                      const start = p.start + acc.at;
                      const isWord = /[A-Za-z]/.test(tok);
                      const on =
                        picked?.type === "word" && start < picked.end && picked.start < start + tok.length;
                      acc.nodes.push(
                        isWord ? (
                          <span
                            key={k}
                            role="button"
                            tabIndex={0}
                            onClick={(e) => pickWord(start, e.shiftKey)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") pickWord(start, e.shiftKey);
                            }}
                            className={`cursor-pointer rounded ${on ? "bg-amber-200" : "hover:bg-amber-100"}`}
                          >
                            {tok}
                          </span>
                        ) : (
                          <span key={k}>{tok}</span>
                        )
                      );
                      acc.at += tok.length;
                      return acc;
                    },
                    { at: 0, nodes: [] }
                  ).nodes}
                </span>
              )
            )}
          </p>
        </div>
        <div className="border-t border-slate-200 bg-slate-50 px-5 py-3">
          {picked == null ? (
            <p className="text-xs text-slate-500">
              문항 {items.length}개. 고칠 문항이나 문항을 더할 낱말을 누르세요.
            </p>
          ) : (
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="font-bold text-slate-500">맞는 말</span>
                <span className="rounded bg-white px-2 py-0.5 font-semibold text-slate-900 ring-1 ring-slate-200">
                  {pickedItem ? pickedItem.correctText : pickedText}
                </span>
                <span className="ml-2 font-bold text-slate-500">틀린 말</span>
                <input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  className="w-44 rounded-lg border border-slate-200 px-2 py-1 text-xs outline-none focus:border-violet-300 focus:ring-2 focus:ring-violet-100"
                  placeholder={finding ? "추천을 찾고 있습니다…" : "추천이 없으면 직접 적어 주세요"}
                />
              </div>
              <div className="flex flex-wrap items-center gap-1 text-[11px]">
                {suggestions.length > 0 ? <span className="text-slate-500">추천</span> : null}
                {suggestions.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setDraft(s)}
                    className={`rounded-md border px-2 py-0.5 font-semibold ${
                      draft === s ? "border-violet-500 bg-violet-100 text-violet-800" : "border-slate-200 bg-white text-slate-600"
                    }`}
                  >
                    {s}
                  </button>
                ))}
                <button
                  type="button"
                  disabled={finding}
                  onClick={freshSuggest}
                  className="rounded-md border border-dashed border-violet-300 bg-white px-2 py-0.5 font-semibold text-violet-700 hover:bg-violet-50 disabled:opacity-50"
                >
                  {finding ? "추천을 찾고 있습니다…" : "↻ 새로 추천받기"}
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {pickedItem ? (
                  <>
                    <button
                      type="button"
                      onClick={() => apply(() => updateChoiceIncorrect(section, pickedItem.choiceId, draft))}
                      className="rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-bold text-white"
                    >
                      틀린 말 바꾸기
                    </button>
                    <button
                      type="button"
                      onClick={() => apply(() => removeChoiceItem(section, pickedItem.choiceId))}
                      className="rounded-lg border border-rose-200 bg-white px-3 py-1.5 text-xs font-bold text-rose-600"
                    >
                      문항 지우기
                    </button>
                  </>
                ) : picked.type === "word" ? (
                  <button
                    type="button"
                    disabled={!draft.trim()}
                    onClick={() =>
                      apply(() =>
                        addChoiceItem(section, { start: picked.start, end: picked.end, incorrectText: draft, kind })
                      )
                    }
                    className="rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-bold text-white disabled:opacity-40"
                  >
                    이 자리에 문항 더하기
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={() => setPicked(null)}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600"
                >
                  취소
                </button>
              </div>
            </div>
          )}
          {error ? <p className="mt-2 text-xs font-semibold text-rose-600">{error}</p> : null}
        </div>
      </div>
    </div>
  );
}
