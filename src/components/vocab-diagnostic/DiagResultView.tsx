import type { DiagSummary } from "@/lib/vocab-diagnostic/scoring";
import { JEONGSU_CONTACT } from "@/lib/vocab-diagnostic/types";

type Props = {
  academyName: string;
  candidateName: string;
  targetLabel: string;
  title: string;
  version: number;
  submittedAt: string;
  summary: DiagSummary;
  /** 관리자 상세에서는 모든 문항(맞은 것 포함)을 보여 준다 */
  showAll?: boolean;
};

function dateText(iso: string): string {
  return new Intl.DateTimeFormat("ko-KR", { timeZone: "Asia/Seoul", year: "numeric", month: "long", day: "numeric" }).format(new Date(iso));
}

const STATUS_LABEL = { correct: "정답", wrong: "오답", unknown: "모르겠어요", blank: "미응답" } as const;

/**
 * 어휘 진단 결과. 정수학원 단어장에서 이번에 낸 단어의 점검 결과일 뿐이라, 어휘량·등급·백분위·합격 같은 판정은 넣지 않는다.
 */
export function DiagResultView(p: Props) {
  const s = p.summary;
  const review = s.rows.filter((r) => r.status !== "correct");
  const rows = p.showAll ? s.rows : review;
  return (
    <div className="space-y-5">
      <header>
        <p className="text-xs font-semibold text-brand-700">{p.academyName}</p>
        <h1 className="mt-0.5 text-lg font-bold leading-snug text-slate-900">{p.title} 결과</h1>
        <p className="mt-1 text-sm text-slate-600">
          {p.candidateName} · {p.targetLabel} · {p.version}판 · {dateText(p.submittedAt)} 제출
        </p>
      </header>

      <section className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-center">
        <p className="text-sm text-slate-600">
          {s.total}문항 중 <strong className="text-2xl font-bold text-slate-900">{s.correct}</strong>개 정답
        </p>
        <p className="mt-1 text-sm text-slate-600">
          정답률 <strong className="text-lg font-bold text-brand-700">{s.rateText}%</strong>
        </p>
        <dl className="mt-4 grid grid-cols-4 gap-1 text-xs">
          {(["correct", "wrong", "unknown", "blank"] as const).map((k) => (
            <div key={k} className="rounded-lg bg-white px-1 py-2">
              <dt className="text-slate-500">{STATUS_LABEL[k]}</dt>
              <dd className="mt-0.5 text-base font-bold text-slate-900">{s[k === "blank" ? "blank" : k]}</dd>
            </div>
          ))}
        </dl>
      </section>

      <p className="text-xs leading-relaxed text-slate-500">
        정수학원 단어장에 기반한 이번 출제 어휘의 점검 결과입니다. 전체 어휘량이나 등급을 나타내지 않습니다.
      </p>

      {rows.length > 0 ? (
        <section>
          <h2 className="mb-2 text-sm font-bold text-slate-900">{p.showAll ? "문항별 결과" : "다시 볼 단어"}</h2>
          <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200">
            {rows.map((r) => (
              <li key={r.no} className="flex items-start gap-3 px-3 py-2.5 text-sm">
                <span className="w-6 shrink-0 pt-0.5 text-right text-xs text-slate-400">{r.no}</span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-slate-900" lang="en">{r.word}</p>
                  <p className="break-keep text-slate-700">{r.answer}</p>
                  {r.status === "wrong" && r.picked && <p className="text-xs text-slate-400">고른 답: {r.picked}</p>}
                </div>
                <div className="shrink-0 text-right">
                  <span
                    className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                      r.status === "correct" ? "bg-emerald-50 text-emerald-700" : r.status === "wrong" ? "bg-red-50 text-red-700" : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {STATUS_LABEL[r.status]}
                  </span>
                  <p className="mt-1 text-[11px] text-slate-400">Day {r.day}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : (
        <p className="text-sm text-slate-700">이번에 낸 단어는 모두 맞혔습니다.</p>
      )}

      <section className="space-y-1 rounded-xl border border-slate-200 p-4 text-sm text-slate-700">
        <p>이번에 틀린 단어부터 뜻을 확인하고 다시 점검해 보세요.</p>
        <p className="text-slate-500">
          정수학원 상담 안내: <span className="whitespace-nowrap">{JEONGSU_CONTACT}</span>
        </p>
      </section>
    </div>
  );
}
