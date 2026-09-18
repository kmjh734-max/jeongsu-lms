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

      <div className="bg-white">
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
