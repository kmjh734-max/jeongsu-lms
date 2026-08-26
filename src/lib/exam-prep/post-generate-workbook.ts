/**
 * /api/exam-prep/generate-workbook 응답 파싱.
 * Vercel/Cloudflare가 "An error occurred..." 평문을 주면 JSON.parse가 깨지므로
 * 본문을 먼저 text로 읽고 안전하게 처리한다.
 */
export type GenerateWorkbookApiResult =
  | {
      ok: true;
      workbookId: string;
      notes?: string[];
      message?: string;
    }
  | {
      ok: false;
      message: string;
      notes?: string[];
    };

export async function postGenerateWorkbook(input: {
  passageId: string;
  title: string;
  publishStages?: boolean;
}): Promise<GenerateWorkbookApiResult> {
  let res: Response;
  try {
    res = await fetch("/api/exam-prep/generate-workbook", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        passageId: input.passageId,
        title: input.title,
        publishStages: input.publishStages !== false,
      }),
    });
  } catch (e) {
    return {
      ok: false,
      message:
        e instanceof Error
          ? `네트워크 오류: ${e.message}`
          : "네트워크 오류가 발생했습니다.",
    };
  }

  const raw = await res.text();
  let data: GenerateWorkbookApiResult | null = null;
  if (raw.trim()) {
    try {
      data = JSON.parse(raw) as GenerateWorkbookApiResult;
    } catch {
      const snippet = raw.replace(/\s+/g, " ").trim().slice(0, 160);
      const looksPlatform =
        /an error occurred/i.test(snippet) ||
        /FUNCTION_INVOCATION/i.test(snippet) ||
        /<!DOCTYPE/i.test(snippet) ||
        /<html/i.test(snippet);
      return {
        ok: false,
        message: looksPlatform
          ? `서버가 응답하지 못했습니다 (HTTP ${res.status}). 로그인 상태를 확인하거나 잠시 후 다시 시도해 주세요.`
          : `서버 응답을 해석할 수 없습니다 (HTTP ${res.status})${
              snippet ? `: ${snippet}` : ""
            }`,
      };
    }
  }

  if (!data || typeof data !== "object") {
    return {
      ok: false,
      message: `서버 응답이 비어 있습니다 (HTTP ${res.status}).`,
    };
  }

  if (!res.ok && data.ok !== true) {
    return {
      ok: false,
      message:
        "message" in data && data.message
          ? String(data.message)
          : `생성 실패 (HTTP ${res.status})`,
      notes: "notes" in data ? data.notes : undefined,
    };
  }

  if (data.ok === true && data.workbookId) {
    return data;
  }

  return {
    ok: false,
    message:
      "message" in data && data.message
        ? String(data.message)
        : `생성 실패 (HTTP ${res.status})`,
    notes: "notes" in data ? data.notes : undefined,
  };
}
