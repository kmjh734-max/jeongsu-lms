import { postJson } from "@/lib/lesson-materials/post-json";
import type { TestBookProjectInput } from "@/lib/lesson-materials/test-book";

type LoadDrawResult = { ok: true; projects: TestBookProjectInput[] } | { ok: false; message: string };

/**
 * 지문 재료(loadDraw)를 브라우저에서 부른다. 같은 지문 목록을 잠깐 사이에 또 부르면 앞 요청을 나눠 쓴다
 * (2026-10-29 속도: 최종통합자료 안 워크북이 백지노트·요약문 지문으로 똑같은 요청을 동시에 두 번 보냈다, 193KB씩).
 * 읽기만 하는 요청이라 짧게(15초) 기억한다 — 재료를 새로 만든 뒤에는 화면을 다시 불러온다.
 */
const recent = new Map<string, { at: number; job: Promise<LoadDrawResult> }>();
const KEEP_MS = 15_000;

export function loadDrawProjects(role: "admin" | "teacher", projectIds: string[]): Promise<LoadDrawResult> {
  const ids = [...new Set(projectIds)];
  const key = `${role}|${[...ids].sort().join(",")}`;
  const now = Date.now();
  const hit = recent.get(key);
  if (hit && now - hit.at < KEEP_MS) return hit.job;
  const job = postJson<LoadDrawResult>("/api/lesson-materials/test-book", { role, op: "loadDraw", projectIds: ids });
  recent.set(key, { at: now, job });
  job.catch(() => recent.delete(key));
  for (const [k, v] of recent) if (now - v.at >= KEEP_MS) recent.delete(k);
  return job;
}
