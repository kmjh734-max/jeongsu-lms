import { useEffect } from "react";
import type { createLessonMaterialDocument } from "@/lib/lesson-materials/document-actions";
import { postJson } from "@/lib/lesson-materials/post-json";
import { documentPagePath, type LessonMaterialDocumentKind } from "@/lib/lesson-materials/documents";

/**
 * 제작 버튼: 새 탭에서 바로 해당 페이지(수업용 자료·분석서·워크북)를 연다.
 * 파일은 그 페이지가 열린 뒤 만든다(useCreateDocumentFromUrl).
 *
 * 예전에는 빈 탭을 먼저 열어 "자료를 준비하고 있습니다"를 띄워 두고, 서버에서 파일을
 * 만든 다음 그 탭을 페이지로 보냈다(서버를 기다린 뒤 window.open을 부르면 팝업으로
 * 막히기 때문). 선생님이 그 흰 화면이 거슬린다고 해서, 탭은 클릭 순간 페이지로 바로 연다.
 */
export function openNewDocument(
  role: "admin" | "teacher",
  kind: LessonMaterialDocumentKind,
  projectIds: string[],
  extra?: { name?: string; query?: string }
): string | null {
  const params = new URLSearchParams(extra?.query ?? "");
  if (!params.has("ids")) params.set("ids", projectIds.join(","));
  params.set("newDoc", "1");
  if (extra?.name) params.set("docName", extra.name);
  const win = window.open(
    `${documentPagePath(role, kind)}?${params.toString()}`,
    "_blank",
    "noopener,noreferrer"
  );
  // noopener로 열면 일부 브라우저는 창 핸들 대신 null을 준다. 막혔는지는 알 수 없으므로
  // 여기서는 실패로 보지 않는다.
  void win;
  return null;
}

/** 이 페이지 방문에서 이미 파일을 만들었는지(개발 모드의 effect 두 번 실행 대비). */
const creating = new Set<string>();

/**
 * 제작 버튼으로 열린 페이지(?newDoc=1)에서 파일을 한 번 만들고 주소를 ?doc=id로 바꾼다.
 * 이후 새로 고침이나 자료함에서 열 때는 이 파일로 연다. 워크북은 생성 흐름 안에서
 * 따로 만든다(WorkbookWorkbench).
 */
export function useCreateDocumentFromUrl(
  role: "admin" | "teacher",
  kind: LessonMaterialDocumentKind,
  projectIds: string[]
) {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("newDoc") !== "1" || params.get("doc")) return;
    const key = window.location.href;
    if (creating.has(key)) return;
    creating.add(key);
    // 서버 액션이 아니라 fetch로 부른다(api/lesson-materials/documents/open 참고).
    void postJson<Awaited<ReturnType<typeof createLessonMaterialDocument>>>("/api/lesson-materials/documents/open", {
      op: "create",
      role,
      kind,
      projectIds,
      name: params.get("docName"),
    }).then((res) => {
      if (!res.ok) return;
      params.delete("newDoc");
      params.delete("docName");
      params.set("doc", res.id);
      window.history.replaceState(null, "", `${window.location.pathname}?${params.toString()}`);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
