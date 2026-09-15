import { createHash } from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";

/*
 * 학생부 글자 읽기(OCR) 결과 임시 저장.
 * 화면은 학생부를 1~2쪽 묶음으로 나눠 /api/student-records/extract에 보낸다. 중간에 실패하거나
 * 다시 시도하면 예전에는 모든 쪽을 처음부터 다시 읽어(쪽마다 비전 호출) 값이 거듭 나갔다.
 * 같은 파일 묶음(바이트가 같은 쪽 이미지·PDF)을 같은 학생 이름으로 다시 보내면 저장해 둔 글자를 쓴다.
 * 학생부는 개인 정보라 며칠만 두고 지운다. 표(student_record_ocr_cache, 마이그레이션 136)가
 * 아직 없으면 저장·조회를 조용히 건너뛴다.
 */

/** 읽는 지시문·모델을 바꾸면 올려서 예전 결과를 쓰지 않게 한다 */
const OCR_CACHE_VERSION = "v1";
const OCR_CACHE_TTL_MS = 3 * 24 * 60 * 60 * 1000;

export function studentRecordOcrCacheKey(input: {
  academyId: string | null;
  studentName: string;
  text: string;
  imageDataUrls: string[];
  pdfDocuments: Array<{ dataUrl: string }>;
}): string | null {
  // 글자만 붙여넣었으면 읽을 것이 없다
  if (input.imageDataUrls.length === 0 && input.pdfDocuments.length === 0) return null;
  const hash = createHash("sha256");
  const part = (label: string, value: string) => {
    hash.update(`${label}:${value.length}:`);
    hash.update(value);
  };
  part("v", OCR_CACHE_VERSION);
  part("academy", input.academyId ?? "-");
  part("student", input.studentName);
  part("text", input.text);
  for (const url of input.imageDataUrls) part("image", url);
  for (const doc of input.pdfDocuments) part("pdf", doc.dataUrl);
  return hash.digest("hex");
}

/**
 * 모든 쪽을 읽었을 때만 저장한다. 일부 쪽이 판독 실패였으면 다시 시도할 때 그 쪽을 다시 읽어야 한다.
 * (이미지 쪽 실패는 "[이 구간 판독 실패]"가 남고, PDF 실패는 머리글째 지워지므로 머리글이 남았는지 본다.)
 */
export function isCompleteStudentRecordOcr(
  text: string,
  pdfDocuments: Array<{ name: string }>
): boolean {
  if (!text.trim()) return false;
  if (text.includes("[이 구간 판독 실패]") || text.includes("[OCR 실패]")) return false;
  return pdfDocuments.every((doc) => text.includes(`=== PDF OCR: ${doc.name} ===`));
}

export async function readStudentRecordOcrCache(key: string): Promise<string | null> {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("student_record_ocr_cache")
      .select("text, created_at")
      .eq("cache_key", key)
      .maybeSingle();
    if (error || !data) return null;
    const age = Date.now() - Date.parse(data.created_at as string);
    if (!Number.isFinite(age) || age > OCR_CACHE_TTL_MS) return null;
    const text = String(data.text ?? "");
    return text.trim() ? text : null;
  } catch {
    return null;
  }
}

export async function writeStudentRecordOcrCache(params: {
  key: string;
  academyId: string | null;
  text: string;
}): Promise<void> {
  try {
    const admin = createAdminClient();
    await admin.from("student_record_ocr_cache").upsert(
      {
        cache_key: params.key,
        academy_id: params.academyId,
        text: params.text,
        created_at: new Date().toISOString(),
      },
      { onConflict: "cache_key" }
    );
    // 오래된 것은 지운다(개인 정보라 오래 두지 않는다)
    await admin
      .from("student_record_ocr_cache")
      .delete()
      .lt("created_at", new Date(Date.now() - OCR_CACHE_TTL_MS).toISOString());
  } catch {
    // 저장은 덤이다. 실패해도 읽은 결과는 그대로 돌려준다.
  }
}
