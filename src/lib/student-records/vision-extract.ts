import { extractChatMessageContent } from "@/lib/student-records/chat-content";
import { STUDENT_RECORD_VISION_CONCURRENCY } from "@/lib/student-records/limits";
import {
  isGpt5FamilyModel,
  isModelUnavailableError,
  isUnsupportedParameterError,
  isUnsupportedTemperatureError,
} from "@/lib/student-records/model";
import { summarizeOpenAiError } from "@/lib/student-records/openai-errors";
import {
  buildOcrChatBody,
  getOcrModelCandidates,
  VISION_OCR_MAX_OUTPUT_TOKENS,
} from "@/lib/student-records/ocr-chat";

type ContentPart =
  | { type: "text"; text: string }
  | { type: "image_url"; image_url: { url: string; detail: "high" } };

const PAGE_EXTRACTION_SYSTEM = `당신은 학교생활기록부 OCR·전사 전문가입니다.
첨부된 학생부 페이지 이미지에서 보이는 모든 글자·숫자·표를 빠짐없이 한국어로 전사합니다.

반드시 전사:
- 인적사항(이름, 학교, 학년)
- 성적표: 학기, 과목, 학점, 원점수, 성취도, 석차등급, 비고
- 교과 세특(과목별 세부능력특기사항)
- 창의적 체험활동, 봉사활동, 행동특성 및 종합의견

규칙:
- 표·작은 글씨도 빠짐없이 옮깁니다.
- 보이지 않는 내용은 추측하지 말고 [판독불가]로 표시합니다.
- 출력 시작: === 학생부 페이지 N 전사 ===
- 마크다운 없이 일반 텍스트만 출력합니다.`;

type RequestProfile = {
  includeTemperature: boolean;
};

let lastVisionApiError: string | null = null;

export function getLastVisionApiError(): string | null {
  return lastVisionApiError;
}

export function resetLastVisionApiError(): void {
  lastVisionApiError = null;
}

function defaultProfile(): RequestProfile {
  return { includeTemperature: true };
}

function relaxProfile(
  profile: RequestProfile,
  bodyText: string
): RequestProfile | null {
  if (profile.includeTemperature && isUnsupportedTemperatureError(bodyText)) {
    return { includeTemperature: false };
  }
  if (isUnsupportedParameterError(bodyText, "reasoning_effort")) {
    return { includeTemperature: false };
  }
  return null;
}

function isUsefulPageOcrText(text: string): boolean {
  if (text.includes("[이 구간 판독 실패]")) return false;
  const compact = text.replace(/\s+/g, "");
  if (compact.length < 60) return false;
  if (/석차|성취|과목|세특|학기|학년|봉사|창의|행동/.test(text)) return true;
  return compact.length >= 120;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function callVisionTextForModel(
  apiKey: string,
  model: string,
  system: string,
  content: ContentPart[],
  signal: AbortSignal
): Promise<string | null> {
  let profile = defaultProfile();

  for (let attempt = 0; attempt < 3; attempt++) {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      signal,
      body: JSON.stringify(
        buildOcrChatBody(model, system, content, {
          includeTemperature: profile.includeTemperature,
          includeReasoningEffort: isGpt5FamilyModel(model),
          maxOutputTokens: VISION_OCR_MAX_OUTPUT_TOKENS,
        })
      ),
    });

    const bodyText = await res.text();
    if (!res.ok) {
      lastVisionApiError = summarizeOpenAiError(res.status, bodyText);

      if (res.status === 429 && attempt < 2) {
        await sleep(1500 * (attempt + 1));
        continue;
      }

      if (isModelUnavailableError(res.status, bodyText)) {
        return null;
      }

      const relaxed = relaxProfile(profile, bodyText);
      if (relaxed) {
        profile = relaxed;
        continue;
      }
      return null;
    }

    const parsed = JSON.parse(bodyText) as {
      choices?: { message?: { content?: unknown }; finish_reason?: string }[];
    };
    const finishReason = parsed.choices?.[0]?.finish_reason;
    if (finishReason === "length") {
      continue;
    }

    const raw = extractChatMessageContent(
      parsed.choices?.[0]?.message?.content
    );
    if (isUsefulPageOcrText(raw)) return raw;
  }

  return null;
}

async function extractSinglePage(
  apiKey: string,
  imageUrl: string,
  pageNum: number,
  totalPages: number,
  studentName: string,
  signal: AbortSignal
): Promise<string> {
  const userText = [
    `학생: ${studentName}`,
    `학생부 페이지 ${pageNum} (총 ${totalPages}페이지 중)`,
    "이 페이지의 표·세특·성적을 빠짐없이 전사해 주세요.",
    `출력 시작: === 학생부 페이지 ${pageNum} 전사 ===`,
  ].join("\n");

  const content: ContentPart[] = [
    { type: "text", text: userText },
    { type: "image_url", image_url: { url: imageUrl, detail: "high" } },
  ];

  for (const model of getOcrModelCandidates()) {
    const extracted = await callVisionTextForModel(
      apiKey,
      model,
      PAGE_EXTRACTION_SYSTEM,
      content,
      signal
    );
    if (extracted) {
      if (extracted.includes("=== 학생부 페이지")) return extracted;
      return `=== 학생부 페이지 ${pageNum} 전사 ===\n${extracted}`;
    }
  }

  return `=== 학생부 페이지 ${pageNum} ===\n[이 구간 판독 실패]`;
}

async function mapWithConcurrency<T, R>(
  items: T[],
  worker: (item: T, index: number) => Promise<R>,
  limit: number
): Promise<R[]> {
  const results = new Array<R>(items.length);
  let nextIndex = 0;

  async function runWorker() {
    while (nextIndex < items.length) {
      const current = nextIndex;
      nextIndex += 1;
      results[current] = await worker(items[current]!, current);
    }
  }

  const workers = Array.from(
    { length: Math.min(limit, items.length) },
    () => runWorker()
  );
  await Promise.all(workers);
  return results;
}

export async function extractTextFromPageImages(
  apiKey: string,
  pageImages: string[],
  studentName: string,
  signal: AbortSignal
): Promise<string> {
  resetLastVisionApiError();

  if (pageImages.length === 0) return "";

  const parts = await mapWithConcurrency(
    pageImages,
    (imageUrl, index) =>
      extractSinglePage(
        apiKey,
        imageUrl,
        index + 1,
        pageImages.length,
        studentName,
        signal
      ),
    STUDENT_RECORD_VISION_CONCURRENCY
  );

  return parts.join("\n\n");
}

export function countSuccessfulOcrPages(text: string): {
  success: number;
  failed: number;
  total: number;
} {
  const success = (text.match(/=== 학생부 페이지 \d+ 전사 ===/g) ?? []).length;
  const failed = (text.match(/\[이 구간 판독 실패\]/g) ?? []).length;
  return { success, failed, total: success + failed };
}
