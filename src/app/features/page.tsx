import type { Metadata } from "next";
import Link from "next/link";
import { PublicHeader } from "@/components/site/PublicHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { FEATURE_PAGES } from "@/lib/site/feature-pages";

export const metadata: Metadata = {
  title: "기능 안내 · 영어 단어 시험지·듣기평가·지문 분석서·학습 리포트",
  description:
    "영어학원을 위한 EngCore 기능: 영어 단어 시험지 출력, 영어듣기평가, 지문 분석서, 워크북·변형문제, 온라인 단어학습, 학습 리포트.",
  alternates: { canonical: "/features" },
};

export default function FeaturesIndexPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <PublicHeader />
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <p className="text-sm font-semibold text-brand-600">기능</p>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          영어학원에 필요한 자료와 관리를 한곳에서
        </h1>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURE_PAGES.map((p) => (
            <Link
              key={p.slug}
              href={`/features/${p.slug}`}
              className="group rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:border-brand-300"
            >
              <h2 className="text-base font-bold text-slate-900 group-hover:text-brand-700">{p.name}</h2>
              <p className="mt-1.5 text-sm leading-6 text-slate-600">{p.lead}</p>
              <span className="mt-3 inline-block text-sm font-semibold text-brand-700">자세히 보기 →</span>
            </Link>
          ))}
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
