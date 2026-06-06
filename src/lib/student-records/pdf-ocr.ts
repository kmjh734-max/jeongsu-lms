import {
  buildStudentRecordChatBody,
  isGpt5FamilyModel,
  isModelUnavailableError,
  isUnsupportedParameterError,
  isUnsupportedTemperatureError,
} from "@/lib/student-records/model";
import type { StudentRecordPdfDocument } from "@/lib/student-records/types";

const PDF_OCR_MODELS = ["gpt-4o", "gpt-5.5", "gpt-5"];

const PDF_OCR_SYSTEM = `당신은 학교생활기록부 OCR·전사 전문가입니다.
첨부 PDF의 모든 페이지를 빠짐없이 읽고 한국어로 전사합니다.

반드시 포함:
- 학생명, 학교명, 학년
- 성적표(학기, 과목, 학점, 성취도, 석차등급)
- 교과 세특, 창의적 체험활동, 봉사활동, 행동특성 및 종합의견

규칙:
- 보이는 내용만 적고 추측하지 않습니다.
- 판독 불가 항목은 [판독불가]로 표시합니다.
- 페이지 구분: === 페이지 N === 형식 사용
- 마크다운 없이 일반 텍스트만 출력합니다.`;

type ContentPart =
  | { type: "text"; text: string }
  | {
      type: "file";
      file: { filename: string; file_data: string };
    };

type RequestProfile = {
  includeTemperature: boolean;
  includeReasoningEffort: boolean;
};

function defaultProfile(model: string): RequestProfile {
  return {
    includeTemperature: !isGpt5FamilyModel(model),
    includeReasoningEffort: isGpt5FamilyModel(model),
  };
}

function relaxProfile(
  profile: RequestProfile,
  bodyText: string
): RequestProfile | null {
  const next = { ...profile };
  let changed = false;

  if (next.includeTemperature && isUnsupportedTemperatureError(bodyText)) {
    next.includeTemperature = false;
    changed = true;
  }
  if (
    next.includeReasoningEffort &&
    isUnsupportedParameterError(bodyText, "reasoning_effort")
  ) {
    next.includeReasoningEffort = false;
    changed = true;
  }

  return changed ? next : null;
}

async function ocrSinglePdf(
  apiKey: string,
  pdf: StudentRecordPdfDocument,
  studentName: string,
  signal: AbortSignal
): Promise<string | null> {
  const content: ContentPart[] = [
    {
      type: "text",
      text: [
        `학생: ${studentName}`,
        `파일: ${pdf.name}`,
        "PDF 전체 페이지를 OCR 전사해 주세요.",
      ].join("\n"),
    },
    {
      type: "file",
      file: {
        filename: pdf.name.endsWith(".pdf") ? pdf.name : `${pdf.name}.pdf`,
        file_data: pdf.dataUrl,
      },
    },
  ];

  for (let i = 0; i < PDF_OCR_MODELS.length; i++) {
    const model = PDF_OCR_MODELS[i]!;
    let profile = defaultProfile(model);

    for (let attempt = 0; attempt < 3; attempt++) {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        signal,
        body: JSON.stringify(
          buildStudentRecordChatBody(model, PDF_OCR_SYSTEM, content, profile)
        ),
      });

      const bodyText = await res.text();
      if (!res.ok) {
        if (
          i < PDF_OCR_MODELS.length - 1 &&
          isModelUnavailableError(res.status, bodyText)
        ) {
          break;
        }
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
      if (raw) return raw;
    }
  }

  return null;
}

export async function extractTextFromPdfDocuments(
  apiKey: string,
  documents: StudentRecordPdfDocument[],
  studentName: string,
  signal: AbortSignal
): Promise<string> {
  const parts: string[] = [];

  for (const pdf of documents) {
    const text = await ocrSinglePdf(apiKey, pdf, studentName, signal);
    if (text) {
      parts.push(`=== PDF OCR: ${pdf.name} ===\n${text}`);
    } else {
      parts.push(`=== PDF OCR: ${pdf.name} ===\n[OCR 실패]`);
    }
  }

  return parts.join("\n\n");
}
