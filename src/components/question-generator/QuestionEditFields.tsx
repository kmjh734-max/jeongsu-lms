"use client";

import { Button } from "@/components/ui/Button";

/**
 * 만들어 둔 문제를 손으로 고치는 칸.
 *
 * 선생님 요청(2026-09-30): 만들었는데 오류가 나거나 단어를 바꾸고 싶을 때
 * 전체를 다시 만들지 않아도 되게 해 달라.
 *
 * 고치는 기능은 있었지만 선택지를 JSON 원문으로 내주고 있었다
 * ([{"text":"…","number":1}]). 그걸 손으로 고치라는 것은 못 쓰는 것이나 같다.
 * 이제 선택지는 ①~⑤ 칸으로 나누고, 정답은 눌러서 고른다.
 */

export type QuestionDraft = {
  instruction?: string | null;
  question_text?: string | null;
  passage_modified?: string | null;
  choices?: unknown;
  correct_answer?: unknown;
  explanation?: string | null;
};

const MARKS = ["①", "②", "③", "④", "⑤", "⑥", "⑦"];

/** 저장된 선택지를 글 목록으로 편다 */
export function choiceTexts(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((c) =>
    typeof c === "string" ? c : String((c as { text?: string })?.text ?? "")
  );
}

/** 글 목록을 저장하던 모양으로 되돌린다 */
function toChoices(texts: string[]): Array<{ text: string; number: number }> {
  return texts.map((text, i) => ({ text, number: i + 1 }));
}

/** 객관식인가 — 선택지가 있으면 객관식으로 본다 */
function isMcq(draft: QuestionDraft): boolean {
  return choiceTexts(draft.choices).length > 0;
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block text-xs">
      <span className="font-semibold text-slate-600">{label}</span>
      {hint ? <span className="ml-1.5 font-normal text-slate-400">{hint}</span> : null}
      {children}
    </label>
  );
}

export function QuestionEditFields({
  draft,
  onChange,
  onSave,
  onCancel,
  busy,
}: {
  draft: QuestionDraft;
  onChange: (next: QuestionDraft) => void;
  onSave: () => void;
  onCancel: () => void;
  busy: boolean;
}) {
  const texts = choiceTexts(draft.choices);
  const mcq = isMcq(draft);
  const answerNo = Number(String(draft.correct_answer ?? "").replace(/[^\d]/g, ""));

  const set = (patch: Partial<QuestionDraft>) => onChange({ ...draft, ...patch });

  function setChoice(i: number, text: string) {
    const next = [...texts];
    next[i] = text;
    set({ choices: toChoices(next) });
  }

  function addChoice() {
    set({ choices: toChoices([...texts, ""]) });
  }

  function removeChoice(i: number) {
    const next = texts.filter((_, k) => k !== i);
    set({ choices: toChoices(next) });
    // 지운 것이 정답이었거나 뒤 번호였으면 정답 번호를 당겨 준다
    if (answerNo === i + 1) set({ choices: toChoices(next), correct_answer: "" });
    else if (answerNo > i + 1) set({ choices: toChoices(next), correct_answer: answerNo - 1 });
  }

  return (
    <div className="space-y-2.5">
      <Field label="발문">
        <textarea
          className="ui-input mt-1 min-h-[54px]"
          value={draft.instruction ?? ""}
          onChange={(e) => set({ instruction: e.target.value })}
        />
      </Field>

      <Field label="조건·보기·요약문" hint="시험지에서 발문 아래에 붙는 줄">
        <textarea
          className="ui-input mt-1 min-h-[70px] font-mono text-xs"
          value={draft.question_text ?? ""}
          onChange={(e) => set({ question_text: e.target.value })}
        />
      </Field>

      <Field label="지문" hint="밑줄·기호가 든 변형 지문">
        <textarea
          className="ui-input mt-1 min-h-[100px] font-serif"
          value={draft.passage_modified ?? ""}
          onChange={(e) => set({ passage_modified: e.target.value })}
        />
      </Field>

      {mcq ? (
        <div className="text-xs">
          <p className="font-semibold text-slate-600">
            선택지
            <span className="ml-1.5 font-normal text-slate-400">
              왼쪽 기호를 누르면 그것이 정답이 됩니다
            </span>
          </p>
          <div className="mt-1 space-y-1">
            {texts.map((text, i) => {
              const on = answerNo === i + 1;
              return (
                <div key={i} className="flex items-start gap-1.5">
                  <button
                    type="button"
                    onClick={() => set({ correct_answer: i + 1 })}
                    title={`${MARKS[i]}를 정답으로`}
                    className={`mt-0.5 h-7 w-7 shrink-0 rounded-md border text-sm font-bold transition ${
                      on
                        ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                        : "border-slate-200 bg-white text-slate-400 hover:bg-slate-50"
                    }`}
                  >
                    {MARKS[i] ?? i + 1}
                  </button>
                  <textarea
                    className="ui-input min-h-[34px] flex-1 text-sm"
                    value={text}
                    onChange={(e) => setChoice(i, e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => removeChoice(i)}
                    title="이 선택지 빼기"
                    className="mt-1 px-1 text-slate-300 hover:text-rose-600"
                  >
                    ✕
                  </button>
                </div>
              );
            })}
          </div>
          <button
            type="button"
            onClick={addChoice}
            className="mt-1.5 rounded border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-semibold text-slate-500 hover:bg-slate-50"
          >
            + 선택지 넣기
          </button>
          {texts.length !== 5 ? (
            <p className="mt-1 text-[11px] font-semibold text-amber-700">
              선택지가 {texts.length}개예요. 보통 5개입니다.
            </p>
          ) : null}
          {!(answerNo >= 1 && answerNo <= texts.length) ? (
            <p className="mt-1 text-[11px] font-semibold text-rose-700">
              정답을 고르지 않았어요.
            </p>
          ) : null}
        </div>
      ) : (
        <Field label="정답" hint="ⓐ: … / ⓑ: … 처럼 기호를 붙여도 됩니다">
          <textarea
            className="ui-input mt-1 min-h-[44px]"
            value={String(draft.correct_answer ?? "")}
            onChange={(e) => set({ correct_answer: e.target.value })}
          />
        </Field>
      )}

      <Field label="해설">
        <textarea
          className="ui-input mt-1 min-h-[70px]"
          value={draft.explanation ?? ""}
          onChange={(e) => set({ explanation: e.target.value })}
        />
      </Field>

      <div className="flex gap-2">
        <Button type="button" disabled={busy} onClick={onSave}>
          {busy ? "저장 중…" : "저장"}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          취소
        </Button>
      </div>
    </div>
  );
}
