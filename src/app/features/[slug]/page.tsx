import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PublicHeader } from "@/components/site/PublicHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { CANONICAL_SITE_URL as SITE_URL, SITE_NAME } from "@/lib/branding";
import { FEATURE_PAGES, findFeaturePage } from "@/lib/site/feature-pages";

export const dynamicParams = false;

export function generateStaticParams() {
  return FEATURE_PAGES.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const page = findFeaturePage((await params).slug);
  if (!page) return {};
  const url = `/features/${page.slug}`;
  return {
    title: page.metaTitle,
    description: page.metaDescription,
    keywords: page.keywords,
    alternates: { canonical: url },
    openGraph: {
      title: `${page.metaTitle} · ${SITE_NAME}`,
      description: page.metaDescription,
      url,
      images: page.image ? [{ url: page.image.src, width: page.image.w, height: page.image.h, alt: page.image.alt }] : undefined,
    },
  };
}

export default async function FeaturePageView({ params }: { params: Promise<{ slug: string }> }) {
  const page = findFeaturePage((await params).slug);
  if (!page) notFound();
  const others = FEATURE_PAGES.filter((p) => p.slug !== page.slug);

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: SITE_NAME, item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "기능", item: `${SITE_URL}/features` },
        { "@type": "ListItem", position: 3, name: page.name, item: `${SITE_URL}/features/${page.slug}` },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: page.faqs.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <PublicHeader />

      <section className="bg-white">
        <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 py-12 sm:px-6 md:grid-cols-2 md:gap-12 md:py-16">
          <div>
            <nav className="text-xs text-slate-500">
              <Link href="/" className="hover:text-slate-800">
                {SITE_NAME}
              </Link>
              {" · "}
              <Link href="/features" className="hover:text-slate-800">
                기능
              </Link>
            </nav>
            <h1 className="mt-3 text-3xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-4xl">{page.h1}</h1>
            <p className="mt-4 text-base leading-7 text-slate-600">{page.lead}</p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link
                href="/signup"
                className="inline-flex h-11 items-center rounded-md bg-brand-600 px-5 text-[15px] font-semibold text-white hover:bg-brand-700"
              >
                무료로 시작하기
              </Link>
              <span className="text-sm font-semibold text-brand-700">가입하면 2,000크레딧 무료</span>
            </div>
          </div>
          <div>
            {page.image ? (
              <div className="relative max-h-[520px] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
                <Image
                  src={page.image.src}
                  alt={page.image.alt}
                  width={page.image.w}
                  height={page.image.h}
                  sizes="(min-width: 768px) 540px, 100vw"
                  className="h-auto w-full"
                  priority
                />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-white to-transparent" />
              </div>
            ) : page.phones ? (
              <div className="flex justify-center gap-4 rounded-xl bg-slate-50 px-4 py-6 sm:gap-6">
                {page.phones.map((p) => (
                  <div
                    key={p.src}
                    className="w-[46%] max-w-[230px] overflow-hidden rounded-[26px] border-[6px] border-slate-900 bg-white shadow-xl"
                  >
                    <Image src={p.src} alt={p.alt} width={585} height={1266} sizes="230px" className="h-auto w-full" priority />
                  </div>
                ))}
              </div>
            ) : (
              <ul className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-6">
                {page.steps.map((s, i) => (
                  <li key={s} className="flex gap-3 text-[15px] text-slate-800">
                    <span className="font-extrabold text-brand-600">0{i + 1}</span>
                    {s}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">이런 점이 편합니다</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {page.points.map((pt) => (
            <div key={pt.title} className="rounded-xl border border-slate-200 bg-white p-5">
              <h3 className="text-base font-bold text-slate-900">{pt.title}</h3>
              <p className="mt-1.5 text-sm leading-6 text-slate-600">{pt.body}</p>
            </div>
          ))}
        </div>

        {page.image && page.phones ? (
          <div className="mt-8 flex justify-center gap-4">
            {page.phones.map((p) => (
              <div key={p.src} className="w-[46%] max-w-[230px] overflow-hidden rounded-[26px] border-[6px] border-slate-900 bg-white shadow-xl">
                <Image src={p.src} alt={p.alt} width={585} height={1266} sizes="230px" className="h-auto w-full" />
              </div>
            ))}
          </div>
        ) : null}

        <h2 className="mt-12 text-2xl font-extrabold tracking-tight text-slate-900">사용 방법</h2>
        <ol className="mt-6 grid gap-4 sm:grid-cols-3">
          {page.steps.map((s, i) => (
            <li key={s} className="rounded-xl border border-slate-200 bg-white p-5">
              <span className="text-sm font-extrabold text-brand-600">0{i + 1}</span>
              <p className="mt-2 text-sm leading-6 text-slate-800">{s}</p>
            </li>
          ))}
        </ol>

        <h2 className="mt-12 text-2xl font-extrabold tracking-tight text-slate-900">자주 묻는 질문</h2>
        <div className="mt-6 divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white">
          {page.faqs.map((f) => (
            <div key={f.q} className="p-5">
              <h3 className="text-[15px] font-bold text-slate-900">Q. {f.q}</h3>
              <p className="mt-1.5 text-sm leading-6 text-slate-600">{f.a}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 rounded-2xl bg-side px-6 py-8 text-center">
          <p className="text-xl font-extrabold text-white">지금 가입하면 2,000크레딧 무료</p>
          <p className="mt-2 text-sm text-side-text">학원·공부방·교습소, 개인 선생님 모두 가입할 수 있습니다.</p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <Link href="/signup" className="inline-flex h-11 items-center rounded-md bg-brand-600 px-5 text-[15px] font-semibold text-white hover:bg-brand-700">
              가입하고 시작하기
            </Link>
            <Link href="/pricing" className="inline-flex h-11 items-center rounded-md border border-white/30 px-5 text-[15px] font-semibold text-white hover:bg-white/10">
              요금 보기
            </Link>
          </div>
        </div>

        <h2 className="mt-12 text-lg font-bold text-slate-900">다른 기능</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {others.map((o) => (
            <Link
              key={o.slug}
              href={`/features/${o.slug}`}
              className="rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-sm font-semibold text-slate-700 hover:border-brand-300 hover:text-brand-700"
            >
              {o.name}
            </Link>
          ))}
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
