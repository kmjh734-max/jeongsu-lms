/**
 * /api/exam-prep/generate-workbook
 * shell(규칙) → ai56(어법 AI) 항상 실행. 체크박스 없음.
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
      workbookId?: string;
    };

type PhaseResult =
  | {
      ok: true;
      workbookId?: string;
      notes?: string[];
      message?: string;
      phase?: string;
    }
  | {
      ok: false;
      message: string;
      notes?: string[];
      phase?: string;
    };

async function postPhase(input: {
  passageId: string;
  title?: string;
  publishStages?: boolean;
  phase: "shell" | "ai56" | "ai7";
}): Promise<PhaseResult> {
  let res: Response;
  try {
    res = await fetch("/api/exam-prep/generate-workbook", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        passageId: input.passageId,
        title: input.title,
        publishStages: input.publishStages !== false,
        phase: input.phase,
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
  let data: PhaseResult | null = null;
  if (raw.trim()) {
    try {
      data = JSON.parse(raw) as PhaseResult;
    } catch {
      const snippet = raw.replace(/\s+/g, " ").trim().slice(0, 160);
      if (res.status === 504 || res.status === 502 || res.status === 524) {
        return {
          ok: false,
          message: `서버 시간 초과 (HTTP ${res.status}). 규칙 문항은 저장됐을 수 있습니다.`,
        };
      }
      const looksPlatform =
        /an error occurred/i.test(snippet) ||
        /FUNCTION_INVOCATION/i.test(snippet) ||
        /<!DOCTYPE/i.test(snippet) ||
        /<html/i.test(snippet);
      return {
        ok: false,
        message: looksPlatform
          ? `서버가 응답하지 못했습니다 (HTTP ${res.status}).`
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

  return data;
}

export async function postGenerateWorkbook(input: {
  passageId: string;
  title: string;
  publishStages?: boolean;
  /** @deprecated 항상 어법 AI 보강. 무시됨 */
  enhanceGrammarAi?: boolean;
  onPhase?: (info: {
    phase: "shell" | "ai56";
    status: "start" | "done";
  }) => void;
}): Promise<GenerateWorkbookApiResult> {
  const notes: string[] = [];

  input.onPhase?.({ phase: "shell", status: "start" });
  const shell = await postPhase({
    passageId: input.passageId,
    title: input.title,
    publishStages: input.publishStages,
    phase: "shell",
  });
  input.onPhase?.({ phase: "shell", status: "done" });

  if (!shell.ok || !shell.workbookId) {
    return {
      ok: false,
      message: !shell.ok ? shell.message : "워크북 ID를 받지 못했습니다.",
      notes: shell.notes,
    };
  }
  if (shell.notes?.length) notes.push(...shell.notes);

  const workbookId = shell.workbookId;

  input.onPhase?.({ phase: "ai56", status: "start" });
  const ai56 = await postPhase({
    passageId: input.passageId,
    publishStages: input.publishStages,
    phase: "ai56",
  });
  input.onPhase?.({ phase: "ai56", status: "done" });

  if (ai56.ok) {
    if (ai56.notes?.length) notes.push(...ai56.notes);
  } else {
    notes.push(
      `어법 보강 생략: ${ai56.message || "시간 초과/오류"} (규칙 문항 유지)`
    );
  }

  return {
    ok: true,
    workbookId,
    notes,
    message: "1~10단계 워크북을 생성했습니다.",
  };
}
