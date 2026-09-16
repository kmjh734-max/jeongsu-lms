import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { resolveDocumentProjectIds } from "@/lib/lesson-materials/document-page";
import { loadOnePageProjects } from "@/lib/lesson-materials/load-material-payloads";
import { normalizeOnePageTestPayload } from "@/lib/lesson-materials/one-page";
import { getAcademyBrandingForCurrentUser } from "@/lib/tenant/academy-branding";
import { OnePageWorkbench } from "@/components/lesson-materials/one-page/OnePageWorkbench";

/**
 * 1장 요약직보자료·1장 테스트 화면(서버). ?doc=면 저장된 파일의 지문을, 아니면 ?ids=를 쓴다.
 * 테스트 파일은 조립해 저장한 시험지(payload)도 함께 넘긴다. 조회는 사용자 세션이라 RLS가 가린다.
 */
export async function OnePagePage({
  role,
  mode,
  params,
}: {
  role: "admin" | "teacher";
  mode: "summary" | "test";
  params: { ids?: string; doc?: string };
}) {
  const kind = mode === "summary" ? "one_page_summary" : "one_page_test";
  const ids = await resolveDocumentProjectIds(params, kind);
  if (ids.length === 0) {
    return (
      <div className="px-4 py-10">
        <p className="text-sm text-slate-600">선택된 자료가 없습니다.</p>
        <Link href={`/${role}/lesson-materials`} className="mt-3 inline-block text-sm text-violet-700">
          ← 자료함
        </Link>
      </div>
    );
  }

  const supabase = await createClient();
  const docId = params.doc?.trim() || null;
  const [projects, doc, branding] = await Promise.all([
    loadOnePageProjects(supabase, ids),
    mode === "test" && docId
      ? supabase
          .from("lesson_material_documents")
          .select("payload,kind")
          .eq("id", docId)
          .is("deleted_at", null)
          .maybeSingle()
          .then((r) => r.data)
      : Promise.resolve(null),
    getAcademyBrandingForCurrentUser(),
  ]);

  return (
    <OnePageWorkbench
      role={role}
      mode={mode}
      projects={projects}
      logoSrc={branding.logoUrl || null}
      docId={docId}
      savedTest={doc?.kind === kind ? normalizeOnePageTestPayload(doc.payload) : null}
    />
  );
}
