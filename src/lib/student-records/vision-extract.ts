import { extractChatMessageContent } from "@/lib/student-records/chat-content";
import {
  isUnsupportedParameterError,
  isUnsupportedTemperatureError,
} from "@/lib/student-records/model";
import { summarizeOpenAiError } from "@/lib/student-records/openai-errors";
import {
  buildOcrChatBody,
  VISION_OCR_MODELS,
} from "@/lib/student-records/ocr-chat";
import { STUDENT_RECORD_VISION_CONCURRENCY } from "@/lib/student-records/limits";

type ImageDetail = "high" | "auto";

type ContentPart =
  | { type: "text"; text: string }
  | { type: "image_url"; image_url: { url: string; detail: ImageDetail } };

const PAGE_EXTRACTION_SYSTEM = `당신은 학교생활기록부 OCR·전사 전문가입니다.
첨부된 학생부 페이지 이미지에서 보이는 내용을 빠짐없이 한국어로 전사합니다.
성적(학기,과목,학점,성취도,석차등급), 세특, 창의적체험활동, 봉사, 행동특성 및 종합의견을 구분해 정리합니다.
보이지 않는 내용은 추측하지 말고 [판독불가]로 표시합니다.
마크다운이 아닌 일반 텍스트로만 출력합니다.`;

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

function isUsefulOcrText(text: string): boolean {
  return text.replace(/\s+/g, "").length >= 30;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function callVisionText(
  apiKey: string,
  system: string,
  content: ContentPart[],
  signal: AbortSignal,
  detail: ImageDetail
): Promise<string | null> {
  const contentWithDetail = content.map((part) => {
    if (part.type !== "image_url") return part;
    return {
      type: "image_url" as const,
      image_url: { url: part.image_url.url, detail },
    };
  });

  for (const model of VISION_OCR_MODELS) {
    let profile = defaultProfile();

    for (let attempt = 0; attempt < 4; attempt++) {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        signal,
        body: JSON.stringify(
          buildOcrChatBody(model, system, contentWithDetail, {
            includeTemperature: profile.includeTemperature,
            includeReasoningEffort: false,
          })
        ),
      });

      const bodyText = await res.text();
      if (!res.ok) {
        lastVisionApiError = summarizeOpenAiError(res.status, bodyText);

        if (res.status === 429 && attempt < 3) {
          await sleep(1500 * (attempt + 1));
          continue;
        }

        const relaxed = relaxProfile(profile, bodyText);
        if (relaxed) {
          profile = relaxed;
          continue;
        }
        break;
      }

      const parsed = JSON.parse(bodyText) as {
        choices?: { message?: { content?: unknown } }[];
      };
      const raw = extractChatMessageContent(
        parsed.choices?.[0]?.message?.content
      );
      if (isUsefulOcrText(raw)) return raw;
    }
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
    "이 페이지 내용을 빠짐없이 전사·정리해 주세요.",
  ].join("\n");

  for (const detail of ["high", "auto"] as const) {
    const content: ContentPart[] = [
      { type: "text", text: userText },
      { type: "image_url", image_url: { url: imageUrl, detail } },
    ];

    const extracted = await callVisionText(
      apiKey,
      PAGE_EXTRACTION_SYSTEM,
      content,
      signal,
      detail
    );
    if (extracted) {
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

  let parts = await mapWithConcurrency(
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

  const failedCount = parts.filter((p) => p.includes("[이 구간 판독 실패]")).length;
  if (failedCount > 0 && failedCount === parts.length) {
    parts = [];
    for (let i = 0; i < pageImages.length; i++) {
      parts.push(
        await extractSinglePage(
          apiKey,
          pageImages[i]!,
          i + 1,
          pageImages.length,
          studentName,
          signal
        )
      );
    }
  }

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
