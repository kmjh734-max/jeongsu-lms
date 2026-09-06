import {
  isGpt5FamilyModel,
  isModelUnavailableError,
  isUnsupportedParameterError,
  isUnsupportedTemperatureError,
  studentRecordModelSupportsTemperature,
} from "@/lib/student-records/model";
import {
  WORKBOOK_TF_SYSTEM_PROMPT,
  buildWorkbookTfUserPrompt,
} from "@/lib/lesson-materials/workbook-tf-prompt";
import {
  clampTfCount,
  defaultWorkbookTitle,
  joinWorkbookPassageLines,
  type WorkbookData,
  type WorkbookPassageSection,
  type WorkbookTfItem,
  type WorkbookTfOptions,
} from "@/lib/lesson-materials/workbook-types";

function parseJsonSafe<T>(text: string): T | null {
  try {
    return JSON.parse(text) as T;
  } catch {
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start >= 0 && end > start) {
      try {
        return JSON.parse(text.slice(start, end + 1)) as T;
      } catch {
        return null;
      }
    }
    return null;
  }
}

function normalizeAnswer(raw: unknown): "T" | "F" | null {
  const s = String(raw ?? "")
    .trim()
    .toUpperCase();
  if (s === "T" || s === "TRUE" || s === "참" || s === "O") return "T";
  if (s === "F" || s === "FALSE" || s === "거짓" || s === "X") return "F";
  return null;
}

function mapItems(
  rawItems: unknown,
  expected: number
): { ok: true; items: WorkbookTfItem[] } | { ok: false; message: string } {
  if (!Array.isArray(rawItems)) {
    return { ok: false, message: "T/F 응답 형식이 올바르지 않습니다." };
  }
  const items: WorkbookTfItem[] = [];
  for (let i = 0; i < rawItems.length; i++) {
    const row = rawItems[i] as Record<string, unknown>;
    const statement = String(row.statement ?? "").trim();
    const answer = normalizeAnswer(row.answer);
    const explanation = String(row.explanation ?? "").trim();
    const corrected = String(row.correctedStatement ?? "").trim();
    if (!statement || !answer) continue;
    if (answer === "F" && !corrected) {
      return {
        ok: false,
        message: `F 문항(${i + 1})에 바르게 고친 문장이 없습니다.`,
      };
    }
    items.push({
      index: items.length + 1,
      statement,
      answer,
      explanation:
        explanation ||
        (answer === "T"
          ? "지문의 내용과 일치한다."
          : "지문의 내용과 일치하지 않는다."),
      correctedStatement: answer === "F" ? corrected : undefined,
    });
  }
  if (items.length !== expected) {
    return {
      ok: false,
      message: `T/F 문항 수가 ${expected}개가 아닙니다(실제 ${items.length}개).`,
    };
  }
  if (expected >= 2) {
    const hasT = items.some((x) => x.answer === "T");
    const hasF = items.some((x) => x.answer === "F");
    if (!hasT || !hasF) {
      return {
        ok: false,
        message: "T와 F 문항이 모두 포함되어야 합니다.",
      };
    }
  }
  return { ok: true, items };
}

async function callTfOpenAI(input: {
  title?: string;
  passage: string;
  options: WorkbookTfOptions;
}): Promise<WorkbookTfItem[]> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) throw new Error("OPENAI_API_KEY가 설정되어 있지 않습니다.");

  const count = clampTfCount(input.options.count);
  const options = { ...input.options, count };
  const userContent = buildWorkbookTfUserPrompt({
    title: input.title,
    passage: input.passage,
    options,
  });

  const configured = process.env.OPENAI_MODEL_WORKBOOK?.trim();
  const candidates = configured
    ? configured === "gpt-5.5"
      ? ["gpt-5.5", "gpt-5"]
      : [configured]
    : ["gpt-5.5", "gpt-5"];

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 120_000);

  try {
    let bodyText = "";
    let lastErr = "";
    let ok = false;

    for (const model of candidates) {
      let includeTemperature = studentRecordModelSupportsTemperature(model);
      let includeReasoningEffort = isGpt5FamilyModel(model);
      let includeJsonMode = true;

      for (let attempt = 0; attempt < 4; attempt++) {
        const body: Record<string, unknown> = {
          model,
          messages: [
            { role: "system", content: WORKBOOK_TF_SYSTEM_PROMPT },
            { role: "user", content: userContent },
          ],
        };
        if (includeJsonMode) body.response_format = { type: "json_object" };
        if (includeTemperature) body.temperature = 0.35;
        else delete body.temperature;
        if (isGpt5FamilyModel(model)) {
          body.max_completion_tokens = 8_192;
          if (includeReasoningEffort) body.reasoning_effort = "medium";
          else delete body.reasoning_effort;
        } else {
          body.max_tokens = 4096;
        }

        const res = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          signal: controller.signal,
          body: JSON.stringify(body),
        });
        bodyText = await res.text();
        if (res.ok) {
          ok = true;
          break;
        }
        if (includeTemperature && isUnsupportedTemperatureError(bodyText)) {
          includeTemperature = false;
          continue;
        }
        if (
          includeReasoningEffort &&
          isUnsupportedParameterError(bodyText, "reasoning_effort")
        ) {
          includeReasoningEffort = false;
          continue;
        }
        if (
          includeJsonMode &&
          isUnsupportedParameterError(bodyText, "response_format")
        ) {
          includeJsonMode = false;
          continue;
        }
        if (isModelUnavailableError(res.status, bodyText)) {
          lastErr = bodyText.slice(0, 200);
          break;
        }
        lastErr = bodyText.slice(0, 200);
        break;
      }
      if (ok) break;
    }

    if (!ok) {
      throw new Error(
        `T/F 생성 실패${lastErr ? `: ${lastErr}` : ""}`.slice(0, 180)
      );
    }

    const envelope = parseJsonSafe<{
      choices?: { message?: { content?: string } }[];
    }>(bodyText);
    const content = envelope?.choices?.[0]?.message?.content ?? bodyText;
    const parsed = parseJsonSafe<{ items?: unknown }>(content);
    const mapped = mapItems(parsed?.items, count);
    if (!mapped.ok) throw new Error(mapped.message);
    return mapped.items;
  } finally {
    clearTimeout(timer);
  }
}

export async function generateWorkbookTf(input: {
  title?: string;
  passages: Array<{
    projectId: string;
    title: string;
    source?: string | null;
    englishLines: string[];
  }>;
  options: WorkbookTfOptions;
}): Promise<WorkbookData> {
  const options: WorkbookTfOptions = {
    ...input.options,
    count: clampTfCount(input.options.count),
  };

  const sections: WorkbookPassageSection[] = [];
  for (const p of input.passages) {
    const passage = joinWorkbookPassageLines(p.englishLines);
    if (!passage) {
      throw new Error(`「${p.title}」에 영어 지문이 없습니다.`);
    }
    const items = await callTfOpenAI({
      title: p.title,
      passage,
      options,
    });
    sections.push({
      projectId: p.projectId,
      title: p.title,
      source: p.source ?? null,
      passage,
      items,
    });
  }

  const now = new Date();
  return {
    metadata: {
      title: input.title?.trim() || defaultWorkbookTitle(now),
      createdAt: now.toISOString(),
    },
    selectedTypes: ["tf"],
    tfOptions: options,
    sections,
  };
}
