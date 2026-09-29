import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { PageHeader } from "@/components/ui/PageHeader";
import { SignOutButton } from "@/components/layout/SignOutButton";
import { loadAiUsagePage, type UsageRow } from "@/lib/ai-usage/load-usage-page";
import { WON_PER_USD } from "@/lib/ai-usage/model-price";
import { loadOpenAiBilling } from "@/lib/ai-usage/openai-billing";

const won = (n: number) => `${Math.round(n).toLocaleString("ko-KR")}원`;
const num = (n: number) => n.toLocaleString("ko-KR");

/** 받은 값이 원가의 몇 배인지 */
function ratio(r: UsageRow): string {
  if (r.costWon <= 0) return "—";
  if (r.chargedCredits <= 0) return "값 안 받음";
  return `${(r.chargedCredits / r.costWon).toFixed(1)}배`;
}

function Table({ title, note, rows, showCharged }: {
  title: string;
  note: string;
  rows: UsageRow[];
  showCharged: boolean;
}) {
  return (
    <section className="mt-8">
      <h2 className="text-base font-bold text-slate-900">{title}</h2>
      <p className="mt-0.5 text-sm text-slate-500">{note}</p>
      <div className="mt-3 overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full min-w-[720px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-xs text-slate-500">
              <th className="px-3 py-2 text-left font-semibold">이름</th>
              <th className="px-3 py-2 text-right font-semibold">호출</th>
              <th className="px-3 py-2 text-right font-semibold">입력(캐시)</th>
              <th className="px-3 py-2 text-right font-semibold">출력</th>
              <th className="px-3 py-2 text-right font-semibold">원가</th>
              {showCharged ? <th className="px-3 py-2 text-right font-semibold">받은 값</th> : null}
              {showCharged ? <th className="px-3 py-2 text-right font-semibold">배수</th> : null}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={showCharged ? 7 : 5} className="px-3 py-6 text-center text-slate-400">
                  기록이 없습니다.
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.key} className="border-b border-slate-100 last:border-0">
                  <td className="px-3 py-2 font-medium text-slate-900">
                    {r.label}
                    {r.unknownCalls > 0 ? (
                      <span className="ml-2 rounded bg-amber-50 px-1.5 py-0.5 text-[11px] font-semibold text-amber-700">
                        단가 모름 {r.unknownCalls}
                      </span>
                    ) : null}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums text-slate-600">{num(r.calls)}</td>
                  <td className="px-3 py-2 text-right tabular-nums text-slate-600">
                    {num(r.inputTokens)}
                    <span className="text-slate-400"> ({num(r.cachedTokens)})</span>
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums text-slate-600">{num(r.outputTokens)}</td>
                  <td className="px-3 py-2 text-right tabular-nums font-semibold text-slate-900">{won(r.costWon)}</td>
                  {showCharged ? (
                    <td className="px-3 py-2 text-right tabular-nums text-slate-600">{num(r.chargedCredits)}</td>
                  ) : null}
                  {showCharged ? (
                    <td className="px-3 py-2 text-right tabular-nums font-semibold text-brand-700">{ratio(r)}</td>
                  ) : null}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default async function SuperAdminAiUsagePage({
  searchParams,
}: {
  searchParams: Promise<{ days?: string }>;
}) {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== "super_admin") redirect("/login");

  const sp = await searchParams;
  const days = Math.min(180, Math.max(1, Math.floor(Number(sp?.days ?? 30)) || 30));
  const [data, billing] = await Promise.all([loadAiUsagePage(days), loadOpenAiBilling(days)]);
  // 우리가 남긴 기록의 원가 합계 — OpenAI 쪽과 견줘 놓친 호출이 있는지 본다
  const loggedWon = data.totals.costWon;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <PageHeader
        title="모델 사용량"
        description="호출마다 남긴 모델·토큰으로 원가를 셈하고, 같은 기간에 받은 크레딧과 견줍니다."
        action={
          <div className="flex flex-wrap gap-2">
            <Link
              href="/super-admin"
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
            >
              ← 학원 목록
            </Link>
            <SignOutButton />
          </div>
        }
      />

      <div className="mt-4 flex flex-wrap gap-2">
        {[7, 30, 90].map((d) => (
          <Link
            key={d}
            href={`/super-admin/ai-usage?days=${d}`}
            className={`rounded-lg border px-3 py-1.5 text-sm ${
              d === days
                ? "border-brand-600 bg-brand-50 font-semibold text-brand-700"
                : "border-slate-300 text-slate-700 hover:bg-slate-50"
            }`}
          >
            최근 {d}일
          </Link>
        ))}
      </div>

      {data.empty ? (
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
          <b className="block text-base">아직 기록이 없습니다.</b>
          기록은 이 기능을 올린 뒤의 호출부터 쌓입니다. 자료를 한 번 만들어 보시면 여기에 나타납니다.
        </div>
      ) : (
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-semibold text-slate-500">원가 합계</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{won(data.totals.costWon)}</p>
            <p className="mt-1 text-xs text-slate-500">호출 {num(data.totals.calls)}건</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-semibold text-slate-500">받은 크레딧</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{num(data.totals.chargedCredits)}</p>
            <p className="mt-1 text-xs text-slate-500">1크레딧 = 1원</p>
          </div>
          <div className="rounded-xl border border-brand-200 bg-brand-50 p-4">
            <p className="text-xs font-semibold text-brand-700">배수</p>
            <p className="mt-1 text-2xl font-bold text-brand-800">
              {data.totals.costWon > 0
                ? `${(data.totals.chargedCredits / data.totals.costWon).toFixed(1)}배`
                : "—"}
            </p>
            <p className="mt-1 text-xs text-brand-700">받은 값 ÷ 원가</p>
          </div>
        </div>
      )}

      {data.unknownModels.length > 0 ? (
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <b>단가를 모르는 모델이 있습니다</b> — {data.unknownModels.join(", ")}.
          이 호출은 원가에서 빠져 있어 실제 원가는 더 큽니다.
          <code className="mx-1 rounded bg-white px-1.5 py-0.5 text-xs">lib/ai-usage/model-price.ts</code>
          에 단가를 적어 주세요.
        </div>
      ) : null}

      <section className="mt-9">
        <h2 className="text-base font-bold text-slate-900">OpenAI 청구와 맞춰 보기</h2>
        <p className="mt-0.5 text-sm text-slate-500">
          저쪽이 실제로 매긴 값, 그 사용량을 우리 단가표로 셈한 값, 우리가 남긴 기록.
          셋이 비슷해야 단가표도 맞고 기록도 빠짐없는 것이다.
        </p>
        {!billing.ok ? (
          <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            {billing.message}
          </div>
        ) : (
          <>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="text-xs font-semibold text-slate-500">OpenAI가 매긴 값</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">{won(billing.totalBilledWon)}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="text-xs font-semibold text-slate-500">우리 단가표로 셈하면</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">{won(billing.totalByOurPriceWon)}</p>
                <p className="mt-1 text-xs text-slate-500">
                  {billing.totalBilledWon > 0
                    ? `${Math.round((billing.totalByOurPriceWon / billing.totalBilledWon) * 100)}% — 100%에 가까울수록 단가표가 맞다`
                    : "—"}
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="text-xs font-semibold text-slate-500">우리가 남긴 기록</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">{won(loggedWon)}</p>
                <p className="mt-1 text-xs text-slate-500">
                  {billing.totalByOurPriceWon > 0
                    ? `${Math.round((loggedWon / billing.totalByOurPriceWon) * 100)}% — 낮으면 기록에서 빠진 호출이 있다`
                    : "—"}
                </p>
              </div>
            </div>
            <div className="mt-3 overflow-x-auto rounded-xl border border-slate-200 bg-white">
              <table className="w-full min-w-[520px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-xs text-slate-500">
                    <th className="px-3 py-2 text-left font-semibold">날짜</th>
                    <th className="px-3 py-2 text-right font-semibold">OpenAI 청구</th>
                    <th className="px-3 py-2 text-right font-semibold">우리 단가표</th>
                    <th className="px-3 py-2 text-right font-semibold">맞음</th>
                  </tr>
                </thead>
                <tbody>
                  {billing.days.map((d) => {
                    const pct = d.billedWon > 0 ? Math.round((d.byOurPriceWon / d.billedWon) * 100) : 0;
                    const off = d.billedWon > 0 && (pct < 90 || pct > 110);
                    return (
                      <tr key={d.date} className="border-b border-slate-100 last:border-0">
                        <td className="px-3 py-2 tabular-nums text-slate-700">
                          {d.date}
                          {d.unknownModels.length > 0 ? (
                            <span className="ml-2 rounded bg-amber-50 px-1.5 py-0.5 text-[11px] font-semibold text-amber-700">
                              단가 모름: {d.unknownModels.join(", ")}
                            </span>
                          ) : null}
                        </td>
                        <td className="px-3 py-2 text-right tabular-nums text-slate-900">{won(d.billedWon)}</td>
                        <td className="px-3 py-2 text-right tabular-nums text-slate-600">{won(d.byOurPriceWon)}</td>
                        <td
                          className={`px-3 py-2 text-right tabular-nums font-semibold ${
                            off ? "text-amber-700" : "text-slate-500"
                          }`}
                        >
                          {d.billedWon > 0 ? `${pct}%` : "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>

      <Table
        title="기능별"
        note="받은 크레딧은 같은 기간의 차감 내역에서 가져옵니다. 저장된 것을 다시 쓴 경우는 값을 받지 않으므로 배수가 커집니다."
        rows={data.byFeature}
        showCharged
      />
      <Table title="모델별" note="어느 모델이 돈을 쓰는지 봅니다." rows={data.byModel} showCharged={false} />
      <Table title="학원별" note="학원마다 얼마를 쓰고 얼마를 냈는지 봅니다." rows={data.byAcademy} showCharged />

      <p className="mt-8 border-t border-slate-200 pt-4 text-xs leading-relaxed text-slate-500">
        원가는 <code>model-price.ts</code>에 적어 둔 1M 토큰당 단가와 1달러 = {num(WON_PER_USD)}원으로 셈합니다.
        캐시된 입력은 싼 단가로 칩니다. 호출마다 OpenAI 요청 id를 함께 남기므로, 나중에 OpenAI 쪽
        사용량과 한 줄씩 맞춰 볼 수 있습니다.
      </p>
    </div>
  );
}
