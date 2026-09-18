import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/layout/NavIcon";
import { PricingSection } from "@/components/site/PricingSection";
import { PublicHeader } from "@/components/site/PublicHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import type { PublicFeaturePrice, PublicPackage } from "@/lib/site/load-public-pricing";

const FEATURES: Array<{ icon: Parameters<typeof Icon>[0]["name"]; title: string; body: string }> = [
  { icon: "file", title: "지문 분석서", body: "지문을 넣으면 문장 구조·어법 포인트·직독직해까지 정리된 분석지가 나옵니다." },
  { icon: "clipboard", title: "워크북·변형문제", body: "어법·어휘 선택, 빈칸, 서술형과 내신형 변형문제를 지문마다 만듭니다." },
  { icon: "headphones", title: "영어듣기평가", body: "학년별 시험 형식의 듣기 문항과 음성, 받아쓰기까지 한 번에 준비합니다." },
  { icon: "book", title: "단어학습", body: "학년별 단어장으로 학생은 날마다 외우고, 선생님은 진도를 한눈에 봅니다." },
  { icon: "chart", title: "학습 리포트", body: "학생별 학습 기록을 모아 학부모 안내문과 리포트를 빠르게 만듭니다." },
  { icon: "users", title: "반·학생 관리", body: "반을 만들고 과제를 배정하고, 학생이 무엇을 했는지 바로 확인합니다." },
];

/** 실제 화면 (public/landing — 실제 서비스 화면을 잘라 찍은 것) */
type ShowcaseItem = {
  tag: string;
  title: string;
  body: string;
  points: string[];
} & ({ src: string; w: number; h: number; phones?: never } | { phones: string[]; src?: never; w?: never; h?: never });

const SHOWCASE: ShowcaseItem[] = [
  {
    src: "/landing/analysis.jpg",
    w: 1011,
    h: 1431,
    tag: "수업자료",
    title: "지문 분석서",
    body: "지문을 넣으면 문장마다 구조 표시, 어법 포인트, 해석과 부연 설명이 붙은 분석서가 나옵니다.",
    points: ["문장성분·절 표시와 어법 빈출 포인트", "전체 해석 / 직독직해 선택", "학원 로고를 넣은 그대로 인쇄"],
  },
  {
    src: "/landing/workbook.jpg",
    w: 1011,
    h: 1140,
    tag: "수업자료",
    title: "워크북·변형문제",
    body: "같은 지문으로 T/F, 어법·어휘 선택, 빈칸, 서술형 문제를 만들어 워크북으로 묶습니다.",
    points: ["유형을 골라 한 번에 만들기", "문제지 뒤에 정답만 모은 답지", "내신 대비 변형문제"],
  },
  {
    src: "/landing/listening-exam.jpg",
    w: 1191,
    h: 1500,
    tag: "듣기",
    title: "영어듣기평가 시험지",
    body: "학년별 시험 형식 그대로의 듣기 문항과 음성. 흑백 프린터로 뽑아도 그림이 또렷합니다.",
    points: ["QR로 바로 듣는 음성", "학생은 앱에서 풀고 받아쓰기까지", "중1~중3 회차별 문항 제공"],
  },
  {
    phones: ["/landing/m-listening.jpg"],
    tag: "온라인 학습",
    title: "온라인 듣기학습",
    body: "학생은 휴대폰으로 문제를 듣고 바로 풉니다. 채점과 오답 확인, 받아쓰기까지 앱에서 끝나요.",
    points: ["문항마다 음성 듣고 바로 풀기", "기본 0.8배속, 필요하면 1.0배속", "선생님은 결과를 한눈에"],
  },
  {
    phones: ["/landing/m-vocab-hub.jpg", "/landing/m-vocab-stage1.jpg"],
    tag: "온라인 학습",
    title: "학년별 단어장 · 온라인 단어학습",
    body: "초등부터 고등까지 Day별 단어장. 뜻·예문 2개·해석·동의어·반의어가 모두 들어 있습니다.",
    points: ["초등 Level 1~4, 중학 기본·필수·고난도, 고교 기본·필수", "뜻 익히기 → 스펠링 → 예문 빈칸 → 종합테스트", "선생님은 진도를 한눈에"],
  },
  {
    src: "/landing/vocab-test.jpg",
    w: 1191,
    h: 1500,
    tag: "단어",
    title: "단어 시험지 바로 출력",
    body: "Day를 고르면 뜻 쓰기·단어 쓰기 시험지와 답지가 바로 나옵니다. 문항 수와 유형도 고를 수 있어요.",
    points: ["객관식·주관식·예문 빈칸", "문항 순서 섞기", "A4·B5 용지"],
  },
];

const STEPS = [
  { title: "가입하기", body: "학원·공부방·교습소 이름만 넣고 가입하면 바로 쓸 수 있습니다. 개인 선생님도 됩니다." },
  { title: "크레딧 충전", body: "필요한 만큼 충전하고, 자료를 만들 때만 차감됩니다." },
  { title: "자료 만들고 수업", body: "지문을 넣어 자료를 만들고, 인쇄하거나 학생에게 배정합니다." },
];

export function LandingPage({
  packages,
  features,
}: {
  packages: PublicPackage[];
  features: PublicFeaturePrice[];
}) {
  return (
    <div className="min-h-screen bg-slate-50">
      <PublicHeader />

      <section className="relative overflow-hidden bg-side">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-40 -top-32 h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle,rgba(37,99,201,0.45),transparent_65%)]"
        />
        <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <p className="text-sm font-semibold text-side-muted">영어학원 운영 플랫폼</p>
          <h1 className="mt-3 text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl">
            영어학원의 모든 것을
            <br />
            하나로.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-side-text sm:text-lg">
            수업자료·시험지 제작부터 듣기평가, 단어학습, 학습 리포트까지. 선생님은 수업에 집중하고, 나머지는 EngCore가
            준비합니다.
          </p>
          <p className="mt-4 inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-sm font-semibold text-white">
            지금 가입하면 2,000크레딧 무료
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/signup"
              className="inline-flex h-11 items-center rounded-md bg-brand-600 px-5 text-[15px] font-semibold text-white hover:bg-brand-700"
            >
              가입하고 시작하기
            </Link>
            <Link
              href="/pricing"
              className="inline-flex h-11 items-center rounded-md border border-white/30 px-5 text-[15px] font-semibold text-white hover:bg-white/10"
            >
              요금 보기
            </Link>
          </div>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <p className="text-sm font-semibold text-brand-600">기능</p>
        <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
          수업 준비에 드는 시간을 줄입니다
        </h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
                <Icon name={f.icon} size={20} />
              </span>
              <p className="mt-4 text-base font-bold text-slate-900">{f.title}</p>
              <p className="mt-1.5 text-sm leading-6 text-slate-600">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white py-14">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <p className="text-sm font-semibold text-brand-600">실제 화면</p>
          <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            이런 자료가 바로 만들어집니다
          </h2>
          <div className="mt-10 space-y-14 sm:space-y-20">
            {SHOWCASE.map((item, i) => (
              <div key={item.title} className="grid items-center gap-6 md:grid-cols-2 md:gap-12">
                <div className={i % 2 === 1 ? "md:order-2" : undefined}>
                  {item.phones ? (
                    <div className="flex justify-center gap-4 rounded-xl bg-slate-50 px-4 py-6 sm:gap-6">
                      {item.phones.map((src) => (
                        <div
                          key={src}
                          className="w-[46%] max-w-[230px] overflow-hidden rounded-[26px] border-[6px] border-slate-900 bg-white shadow-xl"
                        >
                          <Image
                            src={src}
                            alt={`${item.title} 휴대폰 화면`}
                            width={585}
                            height={1266}
                            sizes="230px"
                            className="h-auto w-full"
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="relative max-h-[460px] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
                      <Image
                        src={item.src}
                        alt={`${item.title} 화면`}
                        width={item.w}
                        height={item.h}
                        sizes="(min-width: 768px) 540px, 100vw"
                        className="h-auto w-full"
                      />
                      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-white to-transparent" />
                    </div>
                  )}
                </div>
                <div>
                  <span className="inline-block rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-bold text-brand-700">
                    {item.tag}
                  </span>
                  <h3 className="mt-3 text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">{item.title}</h3>
                  <p className="mt-2 text-[15px] leading-7 text-slate-600">{item.body}</p>
                  <ul className="mt-4 space-y-1.5">
                    {item.points.map((p) => (
                      <li key={p} className="flex items-start gap-2 text-sm text-slate-700">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-600" />
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="border-t border-slate-100 bg-white">
        <PricingSection packages={packages} features={features} compact />
        <div className="mx-auto max-w-6xl px-4 pb-12 sm:px-6">
          <Link href="/pricing" className="text-sm font-semibold text-brand-700 underline">
            기능별 크레딧 전체 보기
          </Link>
        </div>
      </div>

      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <p className="text-sm font-semibold text-brand-600">이용 방법</p>
        <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">세 단계면 충분합니다</h2>
        <ol className="mt-8 grid gap-4 sm:grid-cols-3">
          {STEPS.map((s, i) => (
            <li key={s.title} className="rounded-xl border border-slate-200 bg-white p-5">
              <span className="text-sm font-extrabold text-brand-600">0{i + 1}</span>
              <p className="mt-2 text-base font-bold text-slate-900">{s.title}</p>
              <p className="mt-1 text-sm leading-6 text-slate-600">{s.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <SiteFooter />
    </div>
  );
}
