import Link from "next/link";
import { BUSINESS_INFO } from "@/lib/site/business-info";

/**
 * 공개 화면 하단 — 상호·사업자 정보·약관 링크.
 * 전자상거래법 제10조(사업자 신원 표시)와 결제대행 심사("홈페이지 하단에 상호명")에 맞춘다.
 * 비어 있는 사업자 정보 칸은 표시하지 않는다.
 */
export function SiteFooter({ tone = "light" }: { tone?: "light" | "dark" }) {
  const b = BUSINESS_INFO;
  const items = [
    ["상호", b.name],
    ["대표자", b.representative],
    ["사업자등록번호", b.registrationNumber],
    ["통신판매업 신고번호", b.mailOrderNumber],
    ["주소", b.address],
    ["전화", b.phone],
    ["이메일", b.email],
  ].filter(([, v]) => v);
  const dark = tone === "dark";

  return (
    <footer className={dark ? "bg-side text-side-muted" : "border-t border-slate-200 bg-white text-slate-500"}>
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <nav className="flex flex-wrap gap-x-5 gap-y-2 text-[13px]">
          <Link href="/terms" className={dark ? "hover:text-white" : "hover:text-slate-800"}>
            이용약관
          </Link>
          <Link href="/privacy" className={dark ? "font-bold text-white" : "font-bold text-slate-800"}>
            개인정보처리방침
          </Link>
          <Link href="/refund-policy" className={dark ? "hover:text-white" : "hover:text-slate-800"}>
            환불 기준
          </Link>
          <Link href="/pricing" className={dark ? "hover:text-white" : "hover:text-slate-800"}>
            요금 안내
          </Link>
        </nav>
        <dl className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs">
          {items.map(([k, v]) => (
            <div key={k} className="flex gap-1.5">
              <dt>{k}</dt>
              <dd className={dark ? "text-side-text" : "text-slate-700"}>{v}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-3 text-xs">© {new Date().getFullYear()} {b.name}. All rights reserved.</p>
      </div>
    </footer>
  );
}
