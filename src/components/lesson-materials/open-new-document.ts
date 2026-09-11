import { createLessonMaterialDocument } from "@/lib/lesson-materials/document-actions";
import { documentPagePath, type LessonMaterialDocumentKind } from "@/lib/lesson-materials/documents";

/**
 * 새 탭을 먼저 열고(클릭 순간이라 팝업 차단을 받지 않는다) 파일을 만든 뒤 그 탭을 파일로 보낸다.
 * 서버 응답을 기다린 다음 window.open을 부르면 브라우저가 팝업으로 막는다.
 */
export async function openNewDocument(
  role: "admin" | "teacher",
  kind: LessonMaterialDocumentKind,
  projectIds: string[],
  extra?: { name?: string; query?: string }
): Promise<string | null> {
  const win = window.open("", "_blank");
  if (!win) return "팝업이 차단되었습니다. 브라우저에서 이 사이트의 팝업을 허용한 뒤 다시 시도해 주세요.";
  try {
    win.document.title = "자료를 준비하고 있습니다";
    win.document.body.innerHTML =
      '<p style="font-family:sans-serif;padding:32px;color:#475569">자료를 준비하고 있습니다…</p>';
  } catch {
    /* 빈 창에 쓰지 못해도 이동은 된다 */
  }
  const res = await createLessonMaterialDocument(role, {
    kind,
    projectIds,
    name: extra?.name ?? null,
    sourceQuery: extra?.query ?? null,
  });
  if (!res.ok) {
    win.close();
    return res.message;
  }
  win.opener = null;
  const params = new URLSearchParams(extra?.query ?? "");
  params.set("doc", res.id);
  if (!params.has("ids")) params.set("ids", projectIds.join(","));
  win.location.href = `${documentPagePath(role, kind)}?${params.toString()}`;
  return null;
}
