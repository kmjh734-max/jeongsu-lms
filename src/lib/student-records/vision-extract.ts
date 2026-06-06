import {
  isUnsupportedParameterError,
  isUnsupportedTemperatureError,
} from "@/lib/student-records/model";
import {
  buildOcrChatBody,
  VISION_OCR_MODELS,
} from "@/lib/student-records/ocr-chat";
import { STUDENT_RECORD_VISION_BATCH_SIZE } from "@/lib/student-records/limits";

type ContentPart =
  | { type: "text"; text: string }
  | { type: "image_url"; image_url: { url: string; detail: "high" } };

const PAGE_EXTRACTION_SYSTEM = `당신은 학교생활기록부 OCR·전사 전문가입니다.
첨부된 학생부 페이지 이미지에서 보이는 내용을 빠짐없이 한국어로 전사합니다.
성적(학기,과목,학점,성취도,석차등급), 세특, 창의적체험활동, 봉사, 행동특성 및 종합의견을 구분해 정리합니다.
보이지 않는 내용은 추측하지 말고 [판독불가]로 표시합니다.
마크다운이 아닌 일반 텍스트로만 출력합니다.`;

type RequestProfile = {
  includeTemperature: boolean;
};

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

function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    out.push(items.slice(i, i + size));
  }
  return out;
}

function isUsefulOcrText(text: string): boolean {
  return text.replace(/\s+/g, "").length >= 80;
}

async function callVisionText(
  apiKey: string,
  system: string,
  content: ContentPart[],
  signal: AbortSignal
): Promise<string | null> {
  for (const model of VISION_OCR_MODELS) {
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
            includeReasoningEffort: false,
          })
        ),
      });

      const bodyText = await res.text();
      if (!res.ok) {
        const relaxed = relaxProfile(profile, bodyText);
        if (relaxed) {
          profile = relaxed;
          continue;
        }
        break;
      }

      const parsed = JSON.parse(bodyText) as {
        choices?: { message?: { content?: string } }[];
      };
      const raw = parsed.choices?.[0]?.message?.content?.trim() ?? "";
      if (isUsefulOcrText(raw)) return raw;
    }
  }

  return null;
}

async function extractPageRange(
  apiKey: string,
  images: string[],
  startPage: number,
  totalPages: number,
  studentName: string,
  signal: AbortSignal
): Promise<string> {
  const endPage = startPage + images.length - 1;
  const rangeLabel =
    images.length === 1
      ? `학생부 페이지 ${startPage}`
      : `학생부 페이지 ${startPage}~${endPage}`;

  const userText = [
    `학생: ${studentName}`,
    `${rangeLabel} (총 ${totalPages}페이지 중)`,
    "아래 이미지들의 내용을 전사·정리해 주세요.",
  ].join("\n");

  const batchContent: ContentPart[] = [{ type: "text", text: userText }];
  for (const url of images) {
    batchContent.push({ type: "image_url", image_url: { url, detail: "high" } });
  }

  const batchText = await callVisionText(
    apiKey,
    PAGE_EXTRACTION_SYSTEM,
    batchContent,
    signal
  );
  if (batchText) {
    return `=== ${rangeLabel} 전사 ===\n${batchText}`;
  }

  if (images.length === 1) {
    return `=== ${rangeLabel} ===\n[이 구간 판독 실패]`;
  }

  const pageParts: string[] = [];
  for (let i = 0; i < images.length; i++) {
    const pageNum = startPage + i;
    const singleContent: ContentPart[] = [
      {
        type: "text",
        text: [
          `학생: ${studentName}`,
          `학생부 페이지 ${pageNum} (총 ${totalPages}페이지 중)`,
          "이 페이지 내용을 전사·정리해 주세요.",
        ].join("\n"),
      },
      { type: "image_url", image_url: { url: images[i]!, detail: "high" } },
    ];

    const singleText = await callVisionText(
      apiKey,
      PAGE_EXTRACTION_SYSTEM,
      singleContent,
      signal
    );

    pageParts.push(
      singleText
        ? `=== 학생부 페이지 ${pageNum} 전사 ===\n${singleText}`
        : `=== 학생부 페이지 ${pageNum} ===\n[이 구간 판독 실패]`
    );
  }

  return pageParts.join("\n\n");
}

export async function extractTextFromPageImages(
  apiKey: string,
  pageImages: string[],
  studentName: string,
  signal: AbortSignal
): Promise<string> {
  const batches = chunk(pageImages, STUDENT_RECORD_VISION_BATCH_SIZE);
  const parts: string[] = [];

  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i]!;
    const startPage = i * STUDENT_RECORD_VISION_BATCH_SIZE + 1;

    const extracted = await extractPageRange(
      apiKey,
      batch,
      startPage,
      pageImages.length,
      studentName,
      signal
    );
    parts.push(extracted);
  }

  return parts.join("\n\n");
}
