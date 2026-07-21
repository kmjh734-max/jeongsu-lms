export const QG_JOB_STORAGE_KEY = "qg-active-job";

export type QgJobProgressState = {
  jobId: string;
  status: string;
  message: string;
  completed: number;
  total: number;
  failed: number;
  done?: boolean;
  title?: string;
};

export function trackQgJob(
  jobId: string,
  total: number,
  title?: string
): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(
      QG_JOB_STORAGE_KEY,
      JSON.stringify({ jobId, total, title })
    );
    window.dispatchEvent(new CustomEvent("qg-job-tracked"));
  } catch {
    /* ignore */
  }
}

export function clearQgJob(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(QG_JOB_STORAGE_KEY);
    window.dispatchEvent(new CustomEvent("qg-job-cleared"));
  } catch {
    /* ignore */
  }
}

export function readTrackedQgJob(): {
  jobId: string;
  total: number;
  title?: string;
} | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(QG_JOB_STORAGE_KEY);
    if (!raw) return null;
    const saved = JSON.parse(raw) as {
      jobId?: string;
      total?: number;
      title?: string;
    };
    if (!saved?.jobId) return null;
    return {
      jobId: saved.jobId,
      total: saved.total || 1,
      title: saved.title,
    };
  } catch {
    return null;
  }
}
