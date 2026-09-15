import { Icon } from "@/components/layout/NavIcon";
import { SITE_NAME } from "@/lib/branding";

const FEATURES = [
  {
    icon: "folder",
    title: "수업자료·변형문제",
    sub: "지문 하나로 분석서·워크북·시험지까지",
  },
  {
    icon: "headphones",
    title: "단어·듣기 학습",
    sub: "학생은 날마다, 선생님은 한눈에",
  },
  {
    icon: "file",
    title: "리포트·학원 운영",
    sub: "학부모 안내부터 반 관리까지",
  },
];

const PREVIEW_TODO = [
  { icon: "headphones", label: "듣기학습 10문항", done: true },
  { icon: "book", label: "단어 2단계 스펠링", done: true },
  { icon: "video", label: "중2 문법 7강", done: false },
];

/** 오늘 할 일 미리보기 (장식용) */
function TodayPreview() {
  return (
    <div
      aria-hidden
      className="w-[300px] -rotate-2 rounded-[10px] bg-white px-[18px] py-4 shadow-[0_24px_50px_rgba(0,0,0,0.35)]"
    >
      <div className="flex justify-between text-xs text-slate-500">
        <span>오늘 할 일</span>
        <span className="font-bold tabular-nums text-slate-900">2 / 3</span>
      </div>
      <ul className="mt-2.5 space-y-2.5">
        {PREVIEW_TODO.map((t) => (
          <li key={t.label} className="flex items-center gap-2.5">
            <span
              className={`flex h-7 w-7 items-center justify-center rounded-md ${
                t.done ? "bg-green-50 text-green-700" : "bg-brand-50 text-brand-700"
              }`}
            >
              <Icon
                name={t.done ? "check" : t.icon}
                size={15}
                strokeWidth={t.done ? 2.6 : 1.75}
              />
            </span>
            <span
              className={`text-[13px] font-semibold ${
                t.done ? "text-slate-500 line-through" : "text-slate-900"
              }`}
            >
              {t.label}
            </span>
          </li>
        ))}
      </ul>
      <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full w-2/3 rounded-full bg-brand-600" />
      </div>
    </div>
  );
}

/** 컴퓨터: 왼쪽 어두운 소개 영역 */
export function LoginHero() {
  return (
    <aside className="relative hidden w-[620px] shrink-0 flex-col justify-between overflow-hidden bg-side px-16 py-14 lg:flex">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-40 -top-[120px] h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle,rgba(37,99,201,0.45),transparent_65%)]"
      />
      <div className="relative flex items-center gap-2.5">
        <span className="text-2xl font-extrabold tracking-tight text-white">
          {SITE_NAME}
        </span>
        <span className="pt-1 text-xs text-side-muted">영어교육의 중심</span>
      </div>

      <div className="relative flex flex-col gap-7">
        <p className="text-4xl font-extrabold leading-[1.3] tracking-tight text-white">
          영어학원의 모든 것을
          <br />
          하나로.
        </p>
        <ul className="flex flex-col gap-[18px]">
          {FEATURES.map((f) => (
            <li key={f.title} className="flex items-center gap-3.5">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-side-active text-white">
                <Icon name={f.icon} size={20} />
              </span>
              <span className="flex flex-col gap-0.5">
                <span className="text-[15px] font-bold text-white">{f.title}</span>
                <span className="text-[13px] text-side-text">{f.sub}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="relative flex items-end justify-between">
        <span className="text-xs text-side-group">© {SITE_NAME}</span>
        <TodayPreview />
      </div>
    </aside>
  );
}

/** 휴대폰: 위쪽 어두운 띠 */
export function LoginHeroCompact() {
  return (
    <div className="relative overflow-hidden bg-side px-6 pb-[34px] pt-8 lg:hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-[90px] -top-[90px] h-[260px] w-[260px] rounded-full bg-[radial-gradient(circle,rgba(37,99,201,0.5),transparent_65%)]"
      />
      <div className="relative flex flex-col gap-2">
        <span className="text-xl font-extrabold text-white">{SITE_NAME}</span>
        <span className="text-sm text-side-text">영어학원의 모든 것을 하나로</span>
      </div>
    </div>
  );
}
