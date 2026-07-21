import { NextResponse } from "next/server";
import { requireSuperAdminApi } from "@/lib/auth/require-super-admin-api";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

const BUCKET = "academy-logos";
const MAX_BYTES = 2 * 1024 * 1024;
const ALLOWED = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
  "image/svg+xml",
]);

function extFromType(type: string, fallbackName: string): string {
  if (type === "image/png") return "png";
  if (type === "image/jpeg") return "jpg";
  if (type === "image/webp") return "webp";
  if (type === "image/gif") return "gif";
  if (type === "image/svg+xml") return "svg";
  const m = fallbackName.match(/\.([a-z0-9]+)$/i);
  return m ? m[1].toLowerCase() : "png";
}

export async function POST(
  request: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireSuperAdminApi();
    if ("error" in auth && auth.error) return auth.error;

    const { id: academyId } = await ctx.params;
    const form = await request.formData();
    const file = form.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { ok: false, message: "이미지 파일이 필요합니다." },
        { status: 400 }
      );
    }

    if (!ALLOWED.has(file.type)) {
      return NextResponse.json(
        {
          ok: false,
          message: "PNG, JPG, WEBP, GIF, SVG만 업로드할 수 있습니다.",
        },
        { status: 400 }
      );
    }

    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { ok: false, message: "로고는 2MB 이하로 올려 주세요." },
        { status: 400 }
      );
    }

    const admin = createAdminClient();
    const { data: academy, error: academyErr } = await admin
      .from("academies")
      .select("id")
      .eq("id", academyId)
      .maybeSingle();

    if (academyErr || !academy) {
      return NextResponse.json(
        { ok: false, message: "학원을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    const ext = extFromType(file.type, file.name);
    const path = `${academyId}/${Date.now()}-logo.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const { error: uploadErr } = await admin.storage
      .from(BUCKET)
      .upload(path, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadErr) {
      return NextResponse.json(
        {
          ok: false,
          message: `업로드 실패: ${uploadErr.message}. academy-logos 버킷(마이그레이션 085)을 확인하세요.`,
        },
        { status: 500 }
      );
    }

    const { data: pub } = admin.storage.from(BUCKET).getPublicUrl(path);
    const logoUrl = pub.publicUrl;

    const { data: updated, error: updateErr } = await admin
      .from("academies")
      .update({
        logo_url: logoUrl,
        updated_at: new Date().toISOString(),
      })
      .eq("id", academyId)
      .select("*")
      .single();

    if (updateErr) {
      return NextResponse.json(
        { ok: false, message: updateErr.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      logo_url: logoUrl,
      academy: updated,
    });
  } catch (e) {
    return NextResponse.json(
      {
        ok: false,
        message: e instanceof Error ? e.message : "로고 업로드 실패",
      },
      { status: 500 }
    );
  }
}
