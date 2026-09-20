import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * 학원 가입 코드 — 학생이 이 코드(또는 코드가 박힌 링크)로만 그 학원에 가입할 수 있다.
 * 코드가 밖으로 새도 학원이 승인해야 들어오므로, 새로 만들기 한 번이면 예전 코드는 막힌다.
 */
// 헷갈리는 글자(0·O, 1·I)는 뺀다
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function randomCode(len = 6): string {
  let out = "";
  for (let i = 0; i < len; i++) out += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  return out;
}

export function normalizeJoinCode(input: string): string {
  return String(input ?? "").toUpperCase().replace(/[^A-Z0-9]/g, "");
}

/** 학원의 가입 코드를 읽는다. 없으면 만들어 준다. */
export async function ensureJoinCode(admin: SupabaseClient, academyId: string): Promise<string> {
  const { data } = await admin.from("academies").select("join_code").eq("id", academyId).maybeSingle();
  const current = normalizeJoinCode(String(data?.join_code ?? ""));
  if (current) return current;
  return regenerateJoinCode(admin, academyId);
}

/** 코드를 새로 만든다(예전 코드는 그 즉시 막힌다) */
export async function regenerateJoinCode(admin: SupabaseClient, academyId: string): Promise<string> {
  for (let i = 0; i < 20; i++) {
    const code = randomCode();
    const { error } = await admin
      .from("academies")
      .update({ join_code: code, join_code_updated_at: new Date().toISOString() })
      .eq("id", academyId);
    if (!error) return code;
    // unique 충돌이면 다른 코드로 다시
    if (!String(error.message).includes("duplicate")) throw new Error(error.message);
  }
  throw new Error("가입 코드를 만들지 못했습니다.");
}

/** 코드로 학원 찾기 */
export async function academyByJoinCode(
  admin: SupabaseClient,
  code: string
): Promise<{ id: string; name: string } | null> {
  const norm = normalizeJoinCode(code);
  if (norm.length < 4) return null;
  const { data } = await admin
    .from("academies")
    .select("id, name")
    .eq("join_code", norm)
    .maybeSingle();
  return data ? { id: data.id as string, name: String(data.name ?? "") } : null;
}

/** 휴대전화 번호를 아이디로 쓴다: 숫자만 남긴 01012345678 */
export function phoneAsUsername(phone: string): string | null {
  const digits = String(phone ?? "").replace(/\D/g, "");
  if (!/^01[016789]\d{7,8}$/.test(digits)) return null;
  return digits;
}
