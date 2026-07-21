"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  clearQgJob,
  QG_JOB_STORAGE_KEY,
  readTrackedQgJob,
  type QgJobProgressState,
  trackQgJob,
} from "@/lib/question-generator/client-job-progress";

const TERMINAL = new Set(["completed", "partially_completed", "failed"]);
/** 실제 생성 워커가 돌고 있는 상태 */
const ACTIVE = new Set(["analyzing", "generating", "validating"]);
const POLL_MS = 750;
/** 생성 직후 pending 허용 시간 (그 이후 pending+0문항이면 배너 제거) */
const PENDING_GRACE_MS = 15_000;

type Options = {
  onTerminal?: (job: QgJobProgressState) => void;
  autoOpenPdf?: boolean;
  basePath?: string;
};

export function useQgJobProgress(options: Options = {}) {
  const [jobProgress, setJobProgress] = useState<QgJobProgressState | null>(
    null
  );
  const pdfOpenedForJob = useRef<string | null>(null);
  const pendingGraceUntil = useRef(0);
  const onTerminalRef = useRef(options.onTerminal);
  onTerminalRef.current = options.onTerminal;

  const restoreFromStorage = useCallback(() => {
    const saved = readTrackedQgJob();
    if (!saved) {
      setJobProgress((prev) => (prev && !prev.done ? null : prev));
      return;
    }
    setJobProgress((prev) => {
      if (prev?.jobId === saved.jobId && !prev.done) return prev;
      return {
        jobId: saved.jobId,
        status: "generating",
        message: "진행 상황 확인 중…",
        completed: 0,
        total: saved.total,
        failed: 0,
        title: saved.title,
      };
    });
  }, []);

  useEffect(() => {
    restoreFromStorage();
    const onTrack = () => restoreFromStorage();
    window.addEventListener("qg-job-tracked", onTrack);
    window.addEventListener("qg-job-cleared", onTrack);
    return () => {
      window.removeEventListener("qg-job-tracked", onTrack);
      window.removeEventListener("qg-job-cleared", onTrack);
    };
  }, [restoreFromStorage]);

  useEffect(() => {
    if (!jobProgress?.jobId || jobProgress.done) return;

    let cancelled = false;

    const poll = async () => {
      try {
        const res = await fetch(
          `/api/question-generator/jobs/${jobProgress.jobId}`
        );
        const data = await res.json();
        if (cancelled) return;

        if (!data.ok || !data.job) {
          clearQgJob();
          setJobProgress(null);
          return;
        }

        const job = data.job as {
          status: string;
          progress_message: string | null;
          total_completed: number;
          total_requested: number;
          total_failed: number;
          error_message: string | null;
          request_config?: { title?: string };
          english_source_passages?: { title?: string };
        };

        // 복사만 되고 생성을 안 한 pending — 배너·버튼 잠금 해제
        if (
          job.status === "pending" &&
          (job.total_completed ?? 0) === 0 &&
          Date.now() > pendingGraceUntil.current
        ) {
          clearQgJob();
          setJobProgress(null);
          return;
        }

        const terminal = TERMINAL.has(job.status);
        const title =
          job.request_config?.title ||
          job.english_source_passages?.title ||
          jobProgress.title;

        const next: QgJobProgressState = {
          jobId: jobProgress.jobId,
          status: job.status,
          message:
            job.progress_message || (terminal ? "생성 완료" : "생성 중…"),
          completed: job.total_completed ?? 0,
          total: job.total_requested || jobProgress.total,
          failed: job.total_failed ?? 0,
          done: terminal,
          title,
        };

        setJobProgress(next);

        if (terminal) {
          try {
            sessionStorage.removeItem(QG_JOB_STORAGE_KEY);
          } catch {
            /* ignore */
          }

          if (pdfOpenedForJob.current !== jobProgress.jobId) {
            pdfOpenedForJob.current = jobProgress.jobId;
            onTerminalRef.current?.(next);

            if (
              options.autoOpenPdf &&
              options.basePath &&
              (job.total_completed ?? 0) > 0 &&
              job.status !== "failed"
            ) {
              window.location.assign(
                `${options.basePath}/generations/${jobProgress.jobId}/print?mode=exam`
              );
            }
          }
        }
      } catch {
        /* ignore */
      }
    };

    void poll();
    const t = window.setInterval(() => void poll(), POLL_MS);
    return () => {
      cancelled = true;
      window.clearInterval(t);
    };
  }, [
    jobProgress?.jobId,
    jobProgress?.done,
    jobProgress?.total,
    jobProgress?.title,
    options.autoOpenPdf,
    options.basePath,
  ]);

  const startTracking = useCallback(
    (jobId: string, total: number, title?: string) => {
      pendingGraceUntil.current = Date.now() + PENDING_GRACE_MS;
      trackQgJob(jobId, total, title);
      setJobProgress({
        jobId,
        status: "generating",
        message: "생성 준비 중…",
        completed: 0,
        total: Math.max(1, total),
        failed: 0,
        title,
      });
    },
    []
  );

  const dismiss = useCallback(() => {
    clearQgJob();
    setJobProgress(null);
  }, []);

  const generating = Boolean(
    jobProgress &&
      !jobProgress.done &&
      (ACTIVE.has(jobProgress.status) ||
        jobProgress.status === "generating" ||
        (jobProgress.status === "pending" &&
          Date.now() <= pendingGraceUntil.current))
  );

  const pct =
    jobProgress && jobProgress.total > 0
      ? Math.min(
          100,
          Math.round(
            ((jobProgress.completed + jobProgress.failed) / jobProgress.total) *
              100
          )
        )
      : jobProgress && !jobProgress.done
        ? 5
        : 0;

  return {
    jobProgress,
    generating,
    pct,
    startTracking,
    dismiss,
    setJobProgress,
  };
}
