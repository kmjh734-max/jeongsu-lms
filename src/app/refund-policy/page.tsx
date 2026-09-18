import type { Metadata } from "next";
import Link from "next/link";
import { BUSINESS_INFO, REFUND_POLICY_EFFECTIVE_DATE } from "@/lib/site/business-info";

export const metadata: Metadata = {
  title: "환불 기준 | EngCore",
  description: "EngCore 크레딧의 청약철회와 환불 기준",
};

/** 충전 상품 — 크레딧 충전 화면의 상품과 같다 */
const PACKAGES = [
  { name: "스타터", pay: 11000, paid: 10000, bonus: 0 },
  { name: "스탠다드", pay: 33000, paid: 30000, bonus: 2000 },
  { name: "프로", pay: 55000, paid: 50000, bonus: 5000 },
  { name: "맥스", pay: 110000, paid: 100000, bonus: 15000 },
];

const won = (n: number) => `${n.toLocaleString("ko-KR")}원`;
const num = (n: number) => n.toLocaleString("ko-KR");

function Article({ no, title, children }: { no: number; title: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-slate-200 pt-6">
      <h2 className="text-[17px] font-bold text-slate-900">
        제{no}조 <span className="ml-1">({title})</span>
      </h2>
      <div className="mt-3 space-y-2 text-[15px] leading-7 text-slate-700">{children}</div>
    </section>
  );
}

export default function RefundPolicyPage() {
  const b = BUSINESS_INFO;
  const contacts = [
    b.email ? { label: "이메일", value: b.email, href: `mailto:${b.email}` } : null,
    b.phone ? { label: "전화", value: b.phone, href: `tel:${b.phone.replace(/[^0-9+]/g, "")}` } : null,
  ].filter(Boolean) as Array<{ label: string; value: string; href: string }>;
  const businessRows = [
    ["상호", b.name],
    ["대표자", b.representative],
    ["사업자등록번호", b.registrationNumber],
    ["통신판매업 신고번호", b.mailOrderNumber],
    ["주소", b.address],
    ["이메일", b.email],
    ["전화", b.phone],
  ].filter(([, v]) => v);

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
        <p className="text-sm font-semibold text-brand-600">EngCore</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">환불 기준</h1>
        <p className="mt-2 text-sm text-slate-500">시행일 {REFUND_POLICY_EFFECTIVE_DATE}</p>

        <div className="mt-6 rounded-lg border border-brand-100 bg-white p-5 text-[15px] leading-7 text-slate-700 shadow-sm">
          <p className="font-semibold text-slate-900">한눈에 보기</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>결제 후 <b>7일 이내, 사용하지 않았다면 전액</b> 환불해 드립니다.</li>
            <li>일부 사용했거나 7일이 지났어도 <b>남은 유료 크레딧은 환불</b>받을 수 있습니다.</li>
            <li>이미 사용한 크레딧과 보너스 크레딧은 환불되지 않습니다.</li>
            <li>서비스 오류로 차감된 크레딧은 되돌려 드립니다.</li>
          </ul>
        </div>

        <div className="mt-8 space-y-8 rounded-lg bg-white px-5 py-6 shadow-sm sm:px-8">
          <Article no={1} title="목적">
            <p>
              이 기준은 {b.name}(이하 &quot;회사&quot;)가 제공하는 EngCore 서비스에서 이용자(학원)가 결제한 크레딧의
              청약철회와 환불에 관한 사항을 정합니다.
            </p>
          </Article>

          <Article no={2} title="크레딧">
            <ol className="list-decimal space-y-2 pl-5">
              <li>
                크레딧은 서비스 안의 자료 만들기 기능(분석지·워크북·변형문제·듣기 문항·음성 등)을 이용할 때 쓰는
                선불 이용권입니다. 1크레딧은 1원(부가가치세 별도)의 가치를 가집니다.
              </li>
              <li>
                크레딧은 <b>유료 크레딧</b>(이용자가 결제한 금액으로 받은 크레딧)과 <b>보너스 크레딧</b>(상품 구매 시
                회사가 무상으로 더 드리는 크레딧)으로 나뉩니다.
              </li>
              <li>충전 상품은 다음과 같습니다.</li>
            </ol>
            <div className="mt-2 overflow-x-auto">
              <table className="w-full min-w-[420px] border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-100 text-slate-700">
                    <th className="border border-slate-200 px-3 py-2 text-left font-semibold">상품</th>
                    <th className="border border-slate-200 px-3 py-2 text-right font-semibold">결제 금액(부가세 포함)</th>
                    <th className="border border-slate-200 px-3 py-2 text-right font-semibold">유료 크레딧</th>
                    <th className="border border-slate-200 px-3 py-2 text-right font-semibold">보너스 크레딧</th>
                  </tr>
                </thead>
                <tbody>
                  {PACKAGES.map((p) => (
                    <tr key={p.name}>
                      <td className="border border-slate-200 px-3 py-2">{p.name}</td>
                      <td className="border border-slate-200 px-3 py-2 text-right tabular-nums">{won(p.pay)}</td>
                      <td className="border border-slate-200 px-3 py-2 text-right tabular-nums">{num(p.paid)}</td>
                      <td className="border border-slate-200 px-3 py-2 text-right tabular-nums">{num(p.bonus)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p>
              4. 크레딧에는 별도의 유효기간이 없습니다. 다만 결제일로부터 5년이 지나면 환불을 청구할 수 없습니다.
            </p>
          </Article>

          <Article no={3} title="청약철회 — 결제 후 7일 이내">
            <ol className="list-decimal space-y-2 pl-5">
              <li>
                결제일로부터 <b>7일 이내</b>에 충전한 크레딧을 <b>전혀 사용하지 않은 경우</b> 결제 금액 <b>전액</b>을
                환불합니다.
              </li>
              <li>이 경우 함께 지급된 보너스 크레딧은 회수합니다.</li>
            </ol>
          </Article>

          <Article no={4} title="사용 후 환불 — 남은 크레딧 환불">
            <ol className="list-decimal space-y-2 pl-5">
              <li>
                결제일로부터 7일이 지났거나 크레딧을 일부 사용한 경우에도, <b>남은 유료 크레딧</b>은 환불을 요청할 수
                있습니다.
              </li>
              <li>사용한 크레딧은 유료 크레딧에서 먼저 차감한 것으로 봅니다.</li>
              <li>
                환불 금액은 다음과 같이 계산합니다.
                <div className="mt-2 rounded-md bg-slate-50 px-4 py-3 font-semibold text-slate-900">
                  환불 금액 = 남은 유료 크레딧 × 1.1원 (부가가치세 포함)
                </div>
              </li>
              <li>보너스 크레딧은 환불 대상이 아니며, 환불과 함께 소멸합니다.</li>
              <li>
                예시: 스탠다드(33,000원)를 결제하고 10,000크레딧을 사용했다면 남은 유료 크레딧은 20,000이므로
                20,000 × 1.1 = <b>22,000원</b>을 환불합니다. 보너스 2,000크레딧은 소멸합니다.
              </li>
            </ol>
          </Article>

          <Article no={5} title="환불이 제한되는 경우">
            <p>다음 크레딧은 환불하지 않습니다.</p>
            <ol className="list-decimal space-y-2 pl-5">
              <li>
                이미 사용한 크레딧. 자료 만들기는 요청 즉시 디지털 콘텐츠가 제공되므로, 「전자상거래 등에서의
                소비자보호에 관한 법률」 제17조 제2항 제5호에 따라 청약철회가 제한됩니다. 회사는 이 사실을 결제
                화면에 미리 알립니다.
              </li>
              <li>보너스 크레딧, 이벤트·프로모션으로 무상 지급한 크레딧</li>
              <li>이용약관 위반으로 이용이 제한된 계정의 크레딧 중 부정한 방법으로 얻은 크레딧</li>
            </ol>
          </Article>

          <Article no={6} title="회사 책임으로 인한 보상">
            <ol className="list-decimal space-y-2 pl-5">
              <li>
                서비스 장애나 오류로 자료가 만들어지지 않았는데 크레딧이 차감된 경우, 회사는 차감된 크레딧을
                <b> 자동으로 되돌립니다</b>.
              </li>
              <li>자동으로 되돌려지지 않은 경우, 이용자가 요청하면 확인 후 되돌리거나 해당 금액을 환불합니다.</li>
              <li>
                회사 책임으로 서비스를 계속 이용할 수 없게 된 경우, 남은 유료 크레딧은 전액 환불합니다.
              </li>
            </ol>
          </Article>

          <Article no={7} title="환불 절차">
            <ol className="list-decimal space-y-2 pl-5">
              <li>
                환불은 학원 관리자(원장) 계정의 명의로 요청합니다.
                {contacts.length > 0 ? (
                  <span className="mt-1 block">
                    {contacts.map((c, i) => (
                      <span key={c.label}>
                        {i > 0 ? " · " : ""}
                        {c.label}{" "}
                        <a className="font-semibold text-brand-700 underline" href={c.href}>
                          {c.value}
                        </a>
                      </span>
                    ))}
                    {b.hours ? <span className="text-slate-500"> ({b.hours})</span> : null}
                  </span>
                ) : null}
              </li>
              <li>
                회사는 환불 요청을 받은 날부터 <b>3영업일 이내</b>에 환불 금액을 확정하여 환불합니다.
              </li>
              <li>
                환불은 결제한 수단으로 결제를 취소하는 방식을 원칙으로 합니다. 신용카드 결제는 카드사 사정에 따라 실제
                취소 반영까지 3~7영업일이 걸릴 수 있습니다.
              </li>
              <li>
                결제 취소가 불가능한 경우(부분 취소가 안 되는 결제 등)에는 이용자 명의의 계좌로 환불합니다.
              </li>
              <li>
                회사가 정당한 이유 없이 환불을 늦춘 경우, 늦어진 기간에 대하여 관계 법령이 정한 지연이자를 함께
                지급합니다.
              </li>
            </ol>
          </Article>

          <Article no={8} title="계약 해지">
            <p>이용자가 서비스 이용 계약을 해지하는 경우 남은 유료 크레딧은 제4조에 따라 환불합니다.</p>
          </Article>

          <section className="border-t border-slate-200 pt-6 text-[15px] text-slate-700">
            <h2 className="text-[17px] font-bold text-slate-900">부칙</h2>
            <p className="mt-2">이 기준은 {REFUND_POLICY_EFFECTIVE_DATE}부터 적용합니다.</p>
          </section>
        </div>

        {businessRows.length > 0 ? (
          <dl className="mt-8 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-xs text-slate-500">
            {businessRows.map(([k, v]) => (
              <div key={k} className="contents">
                <dt>{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
        ) : null}

        <p className="mt-6 text-sm">
          <Link href="/login" className="text-slate-500 underline">
            EngCore로 돌아가기
          </Link>
        </p>
      </main>
    </div>
  );
}
