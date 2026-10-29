import { postJson } from "@/lib/lesson-materials/post-json";
import type { getWorkbookDocument } from "@/lib/lesson-materials/document-actions";

type WorkbookDocResult = Awaited<ReturnType<typeof getWorkbookDocument>>;

/**
 * 저장된 워크북 파일 내용을 브라우저에서 부른다. 같은 파일을 잠깐 사이에 또 부르면 앞 요청을 나눠 쓴다.
 * 최종통합자료는 화면을 그리기 시작할 때 미리 불러 둔다(2026-10-29 속도: 안에 든 워크북이 화면을 다 맞춘 뒤
 * 3~4초쯤에야 483KB를 부르기 시작했다). 읽기만 하는 요청이라 짧게(15초) 기억한다.
 */
const recent = new Map<string, { at: number; job: Promise<WorkbookDocResult> }>();
const KEEP_MS = 15_000;

export function fetchWorkbookDoc(role: "admin" | "teacher", id: string): Promise<WorkbookDocResult> {
  const key = `${role}|${id}`;
  const now = Date.now();
  const hit = recent.get(key);
  if (hit && now - hit.at < KEEP_MS) return hit.job;
  const job = postJson<WorkbookDocResult>("/api/lesson-materials/documents/open", { op: "getWorkbook", role, id });
  recent.set(key, { at: now, job });
  job.catch(() => recent.delete(key));
  for (const [k, v] of recent) if (now - v.at >= KEEP_MS) recent.delete(k);
  return job;
}
