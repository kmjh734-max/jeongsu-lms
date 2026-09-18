import Link from "next/link";
import type { PublicFeaturePrice, PublicPackage } from "@/lib/site/load-public-pricing";

const won = (n: number) => `${n.toLocaleString("ko-KR")}원`;
const num = (n: number) => n.toLocaleString("ko-KR");

/** 기능별 요금표를 묶음으로 보여 준다 (이름표 앞말로 묶음을 정한다) */
const GROUPS: Array<{ title: string; match: RegExp }> = [
  { title: "수업자료·시험지", match: /분석서|워크북|수업용|1장|삽화|변형문제|단어 추출/ },
  { title: "듣기평가", match: /듣기/ },
  { title: "단어학습", match: /단어/ },
  { title: "리포트·상담", match: /리포트|학생부|NELT|안내문/ },
];

export function PricingSection({
  packages,
  features,
  compact = false,
}: {
  packages: PublicPackage[];
  features: PublicFeaturePrice[];
  compact?: boolean;
}) {
  const grouped = GROUPS.map((g) => ({
    title: g.title,
    rows: features.filter((f) => g.match.test(f.label)),
  }))
    .map((g, i, all) => ({
      ...g,
      // 앞 묶음에 이미 들어간 항목은 빼서 한 번만 나오게 한다
      rows: g.rows.filter((r) => !all.slice(0, i).some((p) => p.rows.includes(r))),
    }))
    .filter((g) => g.rows.length > 0);

  return (
    <section id="pricing" className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <div className="max-w-2xl">
        <p className="text-sm font-semibold text-brand-600">요금</p>
        <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
          쓴 만큼만 내는 크레딧 충전
        </h2>
        <p className="mt-2 text-[15px] leading-7 text-slate-600">
          월 고정 요금 없이 크레딧을 충전해 두고, 자료를 만들 때마다 필요한 만큼 차감됩니다. 1크레딧은 1원(부가세
          별도)이며 유효기간이 없습니다.
        </p>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {packages.map((p, i) => {
          const featured = i === packages.length - 2;
          return (
            <div
              key={p.id}
              className={`relative flex flex-col rounded-xl border bg-white p-5 shadow-sm ${
                featured ? "border-brand-500 ring-2 ring-brand-100" : "border-slate-200"
              }`}
            >
              {featured ? (
                <span className="absolute -top-3 left-5 rounded-full bg-brand-600 px-2.5 py-0.5 text-xs font-bold text-white">
                  많이 고르는 상품
                </span>
              ) : null}
              <p className="text-sm font-bold text-slate-500">{p.name}</p>
              <p className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 tabular-nums">
                {won(p.paymentAmount)}
              </p>
              <p className="text-xs text-slate-400">부가세 포함</p>
              <ul className="mt-4 space-y-1.5 text-sm text-slate-700">
                <li className="flex justify-between">
                  <span>충전 크레딧</span>
                  <span className="font-semibold tabular-nums">{num(p.credit)}</span>
                </li>
                <li className="flex justify-between">
                  <span>보너스 크레딧</span>
                  <span className={`font-semibold tabular-nums ${p.bonus ? "text-brand-700" : "text-slate-400"}`}>
                    {p.bonus ? `+${num(p.bonus)}` : "—"}
                  </span>
                </li>
                <li className="flex justify-between border-t border-slate-100 pt-1.5">
                  <span className="font-semibold">받는 크레딧</span>
                  <span className="font-extrabold tabular-nums">{num(p.credit + p.bonus)}</span>
                </li>
              </ul>
              <Link
                href="/signup"
                className={`mt-5 inline-flex h-10 items-center justify-center rounded-md text-sm font-semibold ${
                  featured
                    ? "bg-brand-600 text-white hover:bg-brand-700"
                    : "border border-slate-300 text-slate-700 hover:bg-slate-50"
                }`}
              >
                시작하고 충전하기
              </Link>
            </div>
          );
        })}
      </div>

      {!compact && grouped.length > 0 ? (
        <div className="mt-12">
          <h3 className="text-lg font-bold text-slate-900">기능별 크레딧</h3>
          <p className="mt-1 text-sm text-slate-500">자료를 만들 때 아래 크레딧이 차감됩니다.</p>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {grouped.map((g) => (
              <div key={g.title} className="overflow-hidden rounded-lg border border-slate-200 bg-white">
                <p className="bg-slate-50 px-4 py-2 text-sm font-bold text-slate-700">{g.title}</p>
                <ul className="divide-y divide-slate-100">
                  {g.rows.map((r) => (
                    <li key={r.key} className="flex items-center justify-between gap-3 px-4 py-2 text-sm">
                      <span className="text-slate-700">{r.label}</span>
                      <span className="shrink-0 font-semibold tabular-nums text-slate-900">
                        {num(r.credit)}
                        <span className="ml-0.5 text-xs font-normal text-slate-400">
                          {r.billing === "monthly_seat" ? " /학생·월" : " 크레딧"}
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <p className="mt-6 text-xs text-slate-500">
        결제 후 7일 이내 사용하지 않은 크레딧은 전액, 그 뒤에도 남은 유료 크레딧은 환불받을 수 있습니다.{" "}
        <Link href="/refund-policy" className="underline">
          환불 기준
        </Link>
      </p>
    </section>
  );
}
