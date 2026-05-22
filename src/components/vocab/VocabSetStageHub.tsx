import Link from "next/link";
import { STAGE3_PASS_SCORE } from "@/lib/vocab/build-stage3-questions";
import type { VocabStageProgress } from "@/types/database";

interface VocabSetStageHubProps {
  setId: string;
  setTitle: string;
  itemCount: number;
  progress: VocabStageProgress;
}

function statusPill(
  label: string,
  variant: "locked" | "todo" | "done" | "pass" | "fail"
) {
  const styles: Record<string, string> = {
    locked: "bg-slate-100 text-slate-500",
    todo: "bg-amber-50 text-amber-800",
    done: "bg-emerald-50 text-emerald-800",
    pass: "bg-emerald-100 text-emerald-900",
    fail: "bg-rose-50 text-rose-800",
  };
  return (
    <span
      className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${styles[variant]}`}
    >
      {label}
    </span>
  );
}

interface StageRowProps {
  step: string;
  title: string;
  desc: string;
  status: string;
  variant: "locked" | "todo" | "done" | "pass" | "fail";
  href?: string;
  locked?: boolean;
  buttonLabel: string;
}

function StageRow({
  step,
  title,
  desc,
  status,
  variant,
  href,
  locked,
  buttonLabel,
}: StageRowProps) {
  return (
    <li
      className={`flex items-center gap-3 border-b border-slate-100 px-4 py-3.5 last:border-b-0 ${
        locked ? "bg-slate-50/50" : "hover:bg-slate-50/80"
      }`}
    >
      <span className="shrink-0 rounded-md bg-violet-100 px-2 py-0.5 text-xs font-bold text-violet-800">
        {step}단계
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-slate-900">{title}</p>
        <p className="mt-0.5 text-sm text-slate-500">{desc}</p>
      </div>
      {statusPill(status, variant)}
      <div className="shrink-0">
        {locked || !href ? (
          <span className="inline-flex h-9 items-center rounded-lg bg-slate-100 px-3 text-xs text-slate-400">
            {buttonLabel}
          </span>
        ) : (
          <Link
            href={href}
            className="inline-flex h-9 items-center rounded-lg border border-slate-200 px-3 text-sm font-medium text-brand-700 hover:bg-brand-50"
          >
            {buttonLabel}
          </Link>
        )}
      </div>
    </li>
  );
}

export function VocabSetStageHub({
  setId,
  setTitle,
  itemCount,
  progress,
}: VocabSetStageHubProps) {
  const stage1Done = progress.stage1_completed;
  const stage2Done = progress.stage2_completed;
  const stage3Passed = progress.stage3_passed;
  const hasAttempt = progress.stage3_attempt_count > 0;
  const stage3Fail = hasAttempt && !stage3Passed;

  const stage1Status = stage1Done ? "완료" : "미완료";
  const stage2Status = !stage1Done
    ? "잠김"
    : stage2Done
      ? "완료"
      : "미완료";
  const stage3Status = !stage2Done
    ? "잠김"
    : stage3Passed
      ? "합격"
      : hasAttempt
        ? "불합격"
        : "미응시";

  return (
    <div className="mx-auto w-full max-w-3xl space-y-4">
      <div>
        <Link
          href="/student/vocab"
          className="text-sm text-brand-600 hover:underline"
        >
          ← 단어장 목록
        </Link>
        <h1 className="mt-1 text-lg font-bold text-slate-900">{setTitle}</h1>
      </div>

      {itemCount < 1 ? (
        <p className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center text-slate-600">
          등록된 단어가 없습니다.
        </p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 bg-slate-50/80 px-4 py-3">
            <p className="text-sm font-medium text-slate-700">
              학습 단계 <span className="text-slate-400">·</span>{" "}
              <span className="text-slate-500">{itemCount} 카드</span>
            </p>
          </div>
          <ul>
            <StageRow
              step="1"
              title="뜻 익히기"
              desc="단어를 보고 뜻을 익힙니다"
              status={stage1Status}
              variant={stage1Done ? "done" : "todo"}
              href={`/student/vocab/${setId}/stage1`}
              buttonLabel={stage1Done ? "다시 보기" : "시작"}
            />
            <StageRow
              step="2"
              title="스펠링"
              desc="한글뜻만 보고 영어 입력 (예문 없음)"
              status={stage2Status}
              variant={
                !stage1Done ? "locked" : stage2Done ? "done" : "todo"
              }
              href={
                stage1Done ? `/student/vocab/${setId}/stage2` : undefined
              }
              locked={!stage1Done}
              buttonLabel={stage2Done ? "다시 연습" : "시작"}
            />
            <StageRow
              step="3"
              title="종합테스트"
              desc={`뜻·스펠링 혼합 · ${STAGE3_PASS_SCORE}점 이상 합격`}
              status={stage3Status}
              variant={
                !stage2Done
                  ? "locked"
                  : stage3Passed
                    ? "pass"
                    : stage3Fail
                      ? "fail"
                      : "todo"
              }
              href={
                stage2Done ? `/student/vocab/${setId}/stage3` : undefined
              }
              locked={!stage2Done}
              buttonLabel={
                stage3Passed
                  ? "다시 도전"
                  : hasAttempt
                    ? "다시 도전"
                    : "시작"
              }
            />
          </ul>
          {hasAttempt && (
            <p className="border-t border-slate-100 px-4 py-2 text-xs text-slate-500">
              최근 {progress.stage3_last_score}점 · 최고{" "}
              {progress.stage3_best_score}점 · 응시{" "}
              {progress.stage3_attempt_count}회
            </p>
          )}
        </div>
      )}
    </div>
  );
}
