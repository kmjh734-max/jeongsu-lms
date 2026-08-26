/**
 * /api/exam-prep/generate-workbook — shell → ai56 → ai7 순차 호출.
 * 한 요청에 몰면 Vercel/CDN 504가 나므로 단계를 나눈다.
 * AI 보강이 실패해도 shell 워크북은 유지한다.
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
          message: `서버 시간 초과 (HTTP ${res.status}). 잠시 후 다시 시도해 주세요.`,
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

  return data;
}

export async function postGenerateWorkbook(input: {
  passageId: string;
  title: string;
  publishStages?: boolean;
  onPhase?: (info: {
    phase: "shell" | "ai56";
    index: number;
    total: number;
  }) => void;
}): Promise<GenerateWorkbookApiResult> {
  const notes: string[] = [];
  // shell → ai56(지문분석+어법·어휘). 7단계는 shell 규칙으로 두고 AI 생략(속도).
  const phases: Array<"shell" | "ai56"> = ["shell", "ai56"];

  const shell = await postPhase({
    passageId: input.passageId,
    title: input.title,
    publishStages: input.publishStages,
    phase: "shell",
  });
  input.onPhase?.({ phase: "shell", index: 1, total: phases.length });

  if (!shell.ok || !shell.workbookId) {
    return {
      ok: false,
      message: !shell.ok ? shell.message : "워크북 ID를 받지 못했습니다.",
      notes: shell.notes,
    };
  }
  if (shell.notes?.length) notes.push(...shell.notes);

  const workbookId = shell.workbookId;

  input.onPhase?.({ phase: "ai56", index: 2, total: phases.length });
  const ai56 = await postPhase({
    passageId: input.passageId,
    publishStages: input.publishStages,
    phase: "ai56",
  });
  if (ai56.ok) {
    if (ai56.notes?.length) notes.push(...ai56.notes);
  } else {
    notes.push(
      `ai56 보강 생략: ${ai56.message || "시간 초과/오류"} (규칙 문항 유지)`
    );
  }

  return {
    ok: true,
    workbookId,
    notes,
    message: "1~10단계 워크북을 생성했습니다.",
  };
}
