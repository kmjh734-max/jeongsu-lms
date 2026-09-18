import { PublicHeader } from "@/components/site/PublicHeader";
import { SiteFooter } from "@/components/site/SiteFooter";

/** 약관·방침 공개 페이지 틀 */
export function LegalPage({
  title,
  effective,
  children,
}: {
  title: string;
  effective: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50">
      <PublicHeader />
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{title}</h1>
        <p className="mt-2 text-sm text-slate-500">시행일 {effective}</p>
        <div className="legal-body mt-8 space-y-7 rounded-lg bg-white px-5 py-7 text-[15px] leading-7 text-slate-700 shadow-sm sm:px-8">
          {children}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

export function Clause({ no, title, children }: { no?: number; title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-[17px] font-bold text-slate-900">
        {no ? `제${no}조 (${title})` : title}
      </h2>
      <div className="mt-2 space-y-2">{children}</div>
    </section>
  );
}
