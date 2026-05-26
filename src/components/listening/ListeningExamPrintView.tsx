"use client";

import Link from "next/link";
import type { ListeningQuestionData } from "@/components/listening/ListeningQuestionEditor";
import { displayQuestionTextForOrder } from "@/lib/listening/fix-continuation-question";

const CIRCLED = ["①", "②", "③", "④", "⑤"] as const;

interface ListeningExamPrintViewProps {
  title: string;
  questions: ListeningQuestionData[];
  backHref: string;
  showScript?: boolean;
}

export function ListeningExamPrintView({
  title,
  questions,
  backHref,
  showScript = false,
}: ListeningExamPrintViewProps) {
  function handlePrint() {
    window.print();
  }

  return (
    <div className="min-h-screen bg-slate-200 print:bg-white">
      <div className="no-print sticky top-0 z-10 border-b border-slate-200 bg-white px-4 py-3 shadow-sm">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-3">
          <Link href={backHref} className="text-sm text-indigo-600 hover:underline">
            ← 편집으로 돌아가기
          </Link>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white"
            >
              인쇄 / PDF 저장
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[210mm] py-8 print:py-0">
        <div id="listening-print-root" className="listening-exam-sheet bg-white px-[16mm] py-[14mm] shadow-sm print:shadow-none">
          <header className="border-b-2 border-slate-900 pb-3 text-center">
            <p className="text-[10pt] text-slate-600">
              영어듣기능력평가 연습 · 중학교 1학년
            </p>
            <h1 className="mt-1 text-[14pt] font-bold text-slate-900">{title}</h1>
            <p className="mt-2 text-[9pt] text-slate-500">
              ____반 ____번 이름 __________________
            </p>
          </header>

          <ol className="mt-6 space-y-6">
            {questions.map((q) => {
              const passageText = displayQuestionTextForOrder(
                q.order_index,
                q.question_text
              );
              return (
              <li key={q.id} className="break-inside-avoid text-[10.5pt] leading-relaxed text-slate-900">
                <p className="font-semibold">
                  {q.order_index}번{" "}
                  {q.instruction?.trim() || passageText || "듣기 문항"}
                </p>
                {passageText && q.instruction?.trim() && (
                  <p className="mt-1 whitespace-pre-wrap text-slate-800">
                    {passageText}
                  </p>
                )}
                <ul className="mt-2 space-y-1 pl-1">
                  {q.choices.map((choice, i) => (
                    <li key={i}>
                      {CIRCLED[i] ?? `${i + 1}.`} {choice}
                    </li>
                  ))}
                </ul>
                {showScript && q.segments.length > 0 && (
                  <div className="mt-2 rounded border border-slate-200 bg-slate-50 p-2 text-[9pt] text-slate-700">
                    <p className="font-medium text-slate-600">대본</p>
                    {q.segments.map((seg) => (
                      <p key={seg.id}>
                        <span className="font-medium">{seg.speaker_type}:</span>{" "}
                        {seg.text}
                      </p>
                    ))}
                    {q.script_translation && (
                      <p className="mt-1 border-t border-slate-200 pt-1 text-slate-600">
                        {q.script_translation}
                      </p>
                    )}
                  </div>
                )}
              </li>
            );
            })}
          </ol>

          {questions.length === 0 && (
            <p className="mt-8 text-center text-slate-600">출력할 문항이 없습니다.</p>
          )}
        </div>
      </div>
    </div>
  );
}
