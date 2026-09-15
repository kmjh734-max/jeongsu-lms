import Link from "next/link";
import type { ReactNode } from "react";
import { ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/layout/NavIcon";
import {
  VocabSetWordList,
  type VocabSetWord,
} from "@/components/vocab/VocabSetWordList";
import { STAGE4_PASS_SCORE } from "@/lib/vocab/build-stage3-questions";
import {
  stage3Completed,
  stage4AttemptCount,
  stage4BestScore,
  stage4LastScore,
  stage4Passed,
} from "@/lib/vocab/stage-progress-fields";
import type { VocabStageProgress } from "@/types/database";

interface VocabSetStageHubProps {
  setId: string;
  setTitle: string;
  itemCount: number;
  progress: VocabStageProgress;
  /** 단어 목록 (1단계와 같은 순서) */
  items?: VocabSetWord[];
  /** 변형문제 QR 학습: 예문(3단계) 생략 */
  examCompact?: boolean;
}

type CardState = "done" | "current" | "locked";
type PillTone = "good" | "bad" | "brand" | "neutral";

const PILL_TONE: Record<PillTone, string> = {
  good: "bg-green-50 text-green-700",
  bad: "bg-rose-50 text-rose-700",
  brand: "bg-brand-50 text-brand-700",
  neutral: "bg-slate-100 text-slate-500",
};

function Pill({
  tone,
  icon,
  children,
}: {
  tone: PillTone;
  icon?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={`inline-flex h-[22px] shrink-0 items-center gap-1 whitespace-nowrap rounded px-2 text-xs font-semibold ${PILL_TONE[tone]}`}
    >
      {icon && <Icon name={icon} size={12} strokeWidth={2.4} />}
      {children}
    </span>
  );
}

/**
 * 단계 카드. 휴대폰에서는 한 줄(번호 · 이름 · 버튼)로 줄여 네 단계가 한 화면에 들어오게 하고,
 * 넓은 화면에서는 설명까지 보이는 카드로 보여 준다.
 */
function StageCard({
  n,
  title,
  desc,
  state,
  pill,
  wideAction = false,
  children,
}: {
  n: number;
  title: string;
  desc: string;
  state: CardState;
  pill: ReactNode;
  /** 휴대폰에서 버튼 줄을 아래 전체 폭으로 (버튼이 둘일 때) */
  wideAction?: boolean;
  children: ReactNode;
}) {
  const locked = state === "locked";
  const current = state === "current";
  const done = state === "done";

  return (
    <div
      className={`grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-3 gap-y-2.5 rounded-lg border bg-white px-4 py-3.5 shadow-card sm:flex sm:flex-col sm:items-stretch sm:gap-3.5 sm:p-5 ${
        current ? "border-brand-600 ring-4 ring-brand-50" : "border-slate-200"
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <span
          className={`flex h-9 w-9 items-center justify-center rounded-full ${
            done
              ? "bg-green-700 text-white"
              : current
                ? "bg-brand-600 text-white"
                : "bg-slate-100 text-slate-400"
          }`}
        >
          {done ? (
            <Icon name="check" size={18} strokeWidth={2.6} />
          ) : (
            <span className="text-[15px] font-bold tabular-nums">{n}</span>
          )}
        </span>
        <span className="hidden sm:contents">{pill}</span>
      </div>
      <div className="flex min-w-0 flex-col gap-0.5 sm:gap-1">
        <div className="flex items-center gap-2">
          <span
            className={`text-xs font-semibold sm:text-[13px] ${
              locked ? "text-slate-400" : "text-slate-500"
            }`}
          >
            {n}단계
          </span>
          <span className="contents sm:hidden">{pill}</span>
        </div>
        <h2
          className={`truncate text-base font-bold tracking-tight sm:text-lg ${
            locked ? "text-slate-400" : "text-slate-900"
          }`}
        >
          {title}
        </h2>
        <p
          className={`hidden text-[13px] leading-relaxed sm:block ${
            locked ? "text-slate-400" : "text-slate-500"
          }`}
        >
          {desc}
        </p>
      </div>
      <div className="hidden flex-1 sm:block" />
      <div
        className={`flex flex-col gap-2 sm:col-auto ${
          wideAction ? "col-span-3" : ""
        }`}
      >
        {children}
      </div>
    </div>
  );
}

const BTN = "h-10 w-auto px-4 text-sm sm:w-full";

function LockedButton({ label }: { label: string }) {
  // 휴대폰 한 줄 카드에서는 '잠김' 표시로 충분하다
  return (
    <span
      aria-disabled
      className="hidden min-h-[40px] w-full items-center justify-center rounded-md border border-slate-200 bg-slate-100 px-3 py-1.5 text-center text-sm font-semibold text-slate-400 sm:inline-flex"
    >
      {label}
    </span>
  );
}

function statePill(state: CardState) {
  if (state === "done") return <Pill tone="good" icon="check">완료</Pill>;
  if (state === "current") return <Pill tone="brand">지금 할 차례</Pill>;
  return (
    <Pill tone="neutral" icon="lock">
      잠김
    </Pill>
  );
}

export function VocabSetStageHub({
  setId,
  setTitle,
  itemCount,
  progress,
  items = [],
  examCompact = false,
}: VocabSetStageHubProps) {
  const stage1Done = progress.stage1_completed;
  const stage2Done = progress.stage2_completed;
  const stage3Done = examCompact
    ? stage2Done
    : stage3Completed(progress);
  const stage4Pass = stage4Passed(progress);
  const attemptCount = stage4AttemptCount(progress);
  const lastScore = stage4LastScore(progress);
  const bestScore = stage4BestScore(progress);
  const hasAttempt = attemptCount > 0;
  const stage4Fail = hasAttempt && !stage4Pass;

  const s1: CardState = stage1Done ? "done" : "current";
  const s2: CardState = !stage1Done ? "locked" : stage2Done ? "done" : "current";
  const s3: CardState = !stage2Done ? "locked" : stage3Done ? "done" : "current";
  const s4: CardState = !stage3Done ? "locked" : stage4Pass ? "done" : "current";

  const testNo = examCompact ? 3 : 4;
  const totalStages = examCompact ? 3 : 4;
  const doneStages = [
    stage1Done,
    stage2Done,
    ...(examCompact ? [] : [stage3Done]),
    stage4Pass,
  ].filter(Boolean).length;

  const stats: [string, string][] = [
    ["진행", `${doneStages} / ${totalStages}단계`],
    ["최고 점수", bestScore > 0 ? `${bestScore}점` : "–"],
    ["응시", `${attemptCount}회`],
  ];

  const base = `/student/vocab/${setId}`;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2.5">
        <Link
          href="/student/vocab"
          className="-ml-1 inline-flex min-h-[44px] items-center gap-1 self-start px-1 text-[13px] font-medium text-slate-500 transition hover:text-slate-900 sm:min-h-0"
        >
          <Icon name="left" size={16} />
          단어장 목록
        </Link>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between sm:gap-5">
          <div className="flex min-w-0 flex-col gap-1">
            <h1 className="break-keep text-xl font-bold tracking-tight text-slate-900 sm:text-[22px]">
              {setTitle}
            </h1>
            <span className="text-sm tabular-nums text-slate-500">
              {itemCount}단어
            </span>
          </div>
          {itemCount > 0 && (
            <div className="flex shrink-0 gap-6">
              {stats.map(([label, value]) => (
                <div
                  key={label}
                  className="flex flex-col gap-0.5 sm:items-end"
                >
                  <span className="text-xs text-slate-500">{label}</span>
                  <span className="text-lg font-bold tabular-nums text-slate-900">
                    {value}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {examCompact && (
        <p className="rounded-md border border-brand-100 bg-brand-50 px-3.5 py-2.5 text-[13px] text-brand-700">
          변형문제 연계 단어장이에요. 예문 빈칸 단계 없이 뜻 익히기 → 스펠링 →
          종합테스트 3단계로 학습해요.
        </p>
      )}

      {itemCount < 1 ? (
        <div className="rounded-lg border border-dashed border-slate-300 bg-white px-6 py-12 text-center text-sm text-slate-500">
          등록된 단어가 아직 없어요.
        </div>
      ) : (
        <>
          <div
            className={`grid gap-4 sm:grid-cols-2 ${
              examCompact ? "lg:grid-cols-3" : "xl:grid-cols-4"
            }`}
          >
            <StageCard
              n={1}
              title="뜻 익히기"
              desc="카드를 넘기며 단어를 보고 뜻을 익혀요. 발음도 들을 수 있어요."
              state={s1}
              pill={statePill(s1)}
            >
              <ButtonLink
                href={`${base}/stage1`}
                variant={s1 === "current" ? "primary" : "secondary"}
                className={BTN}
              >
                {stage1Done ? "다시 보기" : "시작하기"}
              </ButtonLink>
            </StageCard>

            <StageCard
              n={2}
              title="스펠링"
              desc="한글 뜻만 보고 영어 스펠링을 입력해요. 틀린 단어는 다시 나와요."
              state={s2}
              pill={statePill(s2)}
            >
              {s2 === "locked" ? (
                <LockedButton label="1단계를 먼저 끝내세요" />
              ) : (
                <ButtonLink
                  href={`${base}/stage2`}
                  variant={s2 === "current" ? "primary" : "secondary"}
                  className={BTN}
                >
                  {stage2Done ? "다시 하기" : "시작하기"}
                </ButtonLink>
              )}
            </StageCard>

            {!examCompact && (
              <StageCard
                n={3}
                title="예문 빈칸"
                desc="예문의 빈칸에 들어갈 단어를 입력해요."
                state={s3}
                pill={statePill(s3)}
              >
                {s3 === "locked" ? (
                  <LockedButton label="2단계를 먼저 끝내세요" />
                ) : (
                  <ButtonLink
                    href={`${base}/stage3`}
                    variant={s3 === "current" ? "primary" : "secondary"}
                    className={BTN}
                  >
                    {stage3Done ? "다시 하기" : "시작하기"}
                  </ButtonLink>
                )}
              </StageCard>
            )}

            <StageCard
              n={testNo}
              title="종합테스트"
              desc={`뜻 쓰기 50% + 스펠링 50%. ${STAGE4_PASS_SCORE}점 이상이면 합격이에요.`}
              state={s4}
              wideAction={hasAttempt && s4 !== "locked"}
              pill={
                s4 === "locked" ? (
                  statePill(s4)
                ) : stage4Pass ? (
                  <Pill tone="good" icon="trophy">
                    합격
                  </Pill>
                ) : stage4Fail ? (
                  <Pill tone="bad">불합격</Pill>
                ) : (
                  statePill(s4)
                )
              }
            >
              {hasAttempt && s4 !== "locked" && (
                <p className="text-xs tabular-nums text-slate-500">
                  최근 {lastScore}점 · 최고 {bestScore}점 · 응시 {attemptCount}회
                </p>
              )}
              {s4 === "locked" ? (
                <LockedButton label={`${testNo - 1}단계를 먼저 끝내세요`} />
              ) : hasAttempt ? (
                <div className="grid grid-cols-2 gap-2 xl:grid-cols-1">
                  <ButtonLink
                    href={`${base}/stage4`}
                    variant={stage4Pass ? "secondary" : "primary"}
                    className={BTN}
                  >
                    다시 도전하기
                  </ButtonLink>
                  <ButtonLink
                    href={`${base}/stage4/result`}
                    variant="secondary"
                    className={BTN}
                  >
                    결과 보기
                  </ButtonLink>
                </div>
              ) : (
                <ButtonLink href={`${base}/stage4`} className={BTN}>
                  시작하기
                </ButtonLink>
              )}
            </StageCard>
          </div>

          <VocabSetWordList items={items} />
        </>
      )}
    </div>
  );
}
