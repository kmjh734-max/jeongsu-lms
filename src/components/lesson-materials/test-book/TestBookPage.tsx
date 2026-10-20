import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { isAcademyFeatureOn } from "@/lib/academies/features";
import { resolveDocumentProjectIds } from "@/lib/lesson-materials/document-page";
import { loadTestBookProjects } from "@/lib/lesson-materials/load-material-payloads";
import { normalizeTestBookOptions } from "@/lib/lesson-materials/test-book";
import { TestBookWorkbench } from "@/components/lesson-materials/test-book/TestBookWorkbench";
import { getAcademyBrandingForCurrentUser } from "@/lib/tenant/academy-branding";

/**
 * 테스트 교재 화면(서버). 학원 기능 「테스트 교재」를 켠 학원만 열린다(정수학원).
 * ?doc=면 저장된 파일의 지문·설정을, 아니면 ?ids=를 쓴다. ?mode=draw면 테스트지 뽑기로 연다.
 */
export async function TestBookPage({
  role,
  params,
}: {
  role: "admin" | "teacher";
  params: { ids?: string; doc?: string; mode?: string };
}) {
  const profile = await getCurrentProfile();
  if (!(await isAcademyFeatureOn(createAdminClient(), profile?.academy_id, "test_book"))) notFound();

  const ids = await resolveDocumentProjectIds(params, "test_book");
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
  const [projects, doc] = await Promise.all([
    loadTestBookProjects(supabase, ids),
    docId
      ? supabase
          .from("lesson_material_documents")
          .select("payload,kind,name")
          .eq("id", docId)
          .is("deleted_at", null)
          .maybeSingle()
          .then((r) => r.data)
      : Promise.resolve(null),
  ]);
  const ours = doc?.kind === "test_book";
  const branding = await getAcademyBrandingForCurrentUser();
  return (
    <TestBookWorkbench
      role={role}
      projects={projects}
      docId={docId}
      docName={ours ? ((doc!.name as string | null) ?? null) : null}
      savedOptions={normalizeTestBookOptions(ours ? (doc!.payload as { options?: unknown } | null)?.options : null)}
      initialMode={params.mode === "draw" ? "draw" : "book"}
      logoSrc={branding.logoUrl}
      academyName={branding.name || ""}
    />
  );
}
