"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { StudentRecordReportView } from "@/components/student-records/StudentRecordReportView";
import type {
  ReportClassOption,
  ReportStudentOption,
} from "@/lib/reports/types";
import {
  chunkStudentRecordFiles,
  formatBytes,
  prepareStudentRecordFiles,
  readStudentRecordApiResponse,
  STUDENT_RECORD_MAX_PDF_PAGES,
  STUDENT_RECORD_MAX_TOTAL_BYTES,
  validatePreparedExtractChunk,
  validatePreparedStudentRecordFiles,
  validateStudentRecordFiles,
} from "@/lib/student-records/client-upload";
import { isPdfUpload } from "@/lib/student-records/file-types";
import { hasSubstantiveStudentRecordText } from "@/lib/student-records/ocr-quality";
import type { StudentRecordAnalysisResult } from "@/lib/student-records/types";

type ExtractApiResult = {
  ok: boolean;
  message?: string;
  text?: string;
  studentId?: string | null;
  studentName?: string;
};

interface StudentRecordWorkspaceProps {
  initialClasses?: ReportClassOption[];
  initialStudents?: ReportStudentOption[];
}

export function StudentRecordWorkspace({
  initialClasses = [],
  initialStudents = [],
}: StudentRecordWorkspaceProps) {
  const [classes, setClasses] = useState<ReportClassOption[]>(initialClasses);
  const [students, setStudents] = useState<ReportStudentOption[]>(initialStudents);
  const [classId, setClassId] = useState("");
  const [nameQuery, setNameQuery] = useState("");
  const [loginQuery, setLoginQuery] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [manualStudentName, setManualStudentName] = useState("");
  const [text, setText] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [result, setResult] = useState<StudentRecordAnalysisResult | null>(null);
  const [listLoading, setListLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [progressLabel, setProgressLabel] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadStudents = useCallback(async () => {
    setListLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (classId) params.set("classId", classId);
      if (nameQuery.trim()) params.set("name", nameQuery.trim());
      if (loginQuery.trim()) params.set("loginId", loginQuery.trim());

      const res = await fetch(`/api/reports/students?${params.toString()}`);
      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.message ?? "학생 목록을 불러오지 못했습니다.");
      }
      setClasses(data.classes ?? []);
      setStudents(data.students ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "오류가 발생했습니다.");
    } finally {
      setListLoading(false);
    }
  }, [classId, nameQuery, loginQuery]);

  const hasInitialLists =
    initialClasses.length > 0 || initialStudents.length > 0;

  useEffect(() => {
    if (hasInitialLists && !classId && !nameQuery.trim() && !loginQuery.trim()) {
      return;
    }
    void loadStudents();
  }, [loadStudents, hasInitialLists, classId, nameQuery, loginQuery]);

  async function runAnalysis() {
    if (!text.trim() && files.length === 0) {
      setError("학생부 텍스트를 붙여넣거나 PDF/이미지를 업로드해 주세요.");
      return;
    }

    const fileError = validateStudentRecordFiles(files);
    if (fileError) {
      setError(fileError);
      return;
    }

    setAnalyzing(true);
    setError(null);
    setResult(null);
    try {
      const pastedText = text.trim();
      const pdfFiles = files.filter(isPdfUpload);
      const directImageFiles = files.filter((file) => !isPdfUpload(file));
      let resolvedStudentId: string | null = null;
      let resolvedStudentName = "";
      let combinedExtractedText = "";

      const buildFormData = () => {
        const formData = new FormData();
        if (selectedStudentId) formData.set("studentId", selectedStudentId);
        if (!selectedStudentId && manualStudentName.trim()) {
          formData.set("studentName", manualStudentName.trim());
        }
        return formData;
      };

      const postExtract = async (formData: FormData) => {
        const extractRes = await fetch("/api/student-records/extract", {
          method: "POST",
          body: formData,
        });
        const { data, error } =
          await readStudentRecordApiResponse<ExtractApiResult>(extractRes);
        if (error) throw new Error(error);
        return data;
      };

      if (pdfFiles.length > 0 && directImageFiles.length === 0) {
        setProgressLabel("1/2 PDF 직접 OCR 중… (OpenAI)");
        const formData = buildFormData();
        if (pastedText) formData.set("text", pastedText);
        for (const pdf of pdfFiles) {
          formData.append("files", pdf);
        }

        const pdfExtracted = await postExtract(formData);
        if (
          pdfExtracted?.ok &&
          pdfExtracted.text &&
          pdfExtracted.studentName &&
          hasSubstantiveStudentRecordText(pdfExtracted.text)
        ) {
          resolvedStudentId = pdfExtracted.studentId ?? null;
          resolvedStudentName = pdfExtracted.studentName;
          combinedExtractedText = pdfExtracted.text;
        }
      }

      if (!combinedExtractedText) {
        setProgressLabel("PDF·이미지 준비 중…");
        const preparedFiles = await prepareStudentRecordFiles(
          files,
          setProgressLabel
        );
        const preparedError = validatePreparedStudentRecordFiles(preparedFiles);
        if (preparedError) {
          throw new Error(preparedError);
        }

        const imageChunks =
          preparedFiles.length > 0 ? chunkStudentRecordFiles(preparedFiles) : [];
        const ocrTexts: string[] = [];

        if (imageChunks.length === 0) {
          const formData = buildFormData();
          formData.set("text", pastedText);
          setProgressLabel("1/2 학생부 자료 읽는 중…");
          const extracted = await postExtract(formData);
          if (!extracted?.ok || !extracted.text || !extracted.studentName) {
            throw new Error(extracted?.message ?? "자료 읽기에 실패했습니다.");
          }
          resolvedStudentId = extracted.studentId ?? null;
          resolvedStudentName = extracted.studentName;
          ocrTexts.push(extracted.text);
        } else {
          for (let i = 0; i < imageChunks.length; i++) {
            const chunk = imageChunks[i]!;
            const chunkError = validatePreparedExtractChunk(chunk);
            if (chunkError) throw new Error(chunkError);

            setProgressLabel(
              `1/2 이미지 OCR 중… ${i + 1}/${imageChunks.length}묶음 (${chunk.length}페이지)`
            );

            const formData = buildFormData();
            if (i === 0 && pastedText) {
              formData.set("text", pastedText);
            }
            for (const file of chunk) {
              formData.append("files", file);
            }

            const extracted = await postExtract(formData);
            if (!extracted?.ok || !extracted.text || !extracted.studentName) {
              throw new Error(
                extracted?.message ??
                  `${i + 1}번째 OCR 묶음 처리에 실패했습니다.`
              );
            }

            resolvedStudentId = extracted.studentId ?? resolvedStudentId;
            resolvedStudentName = extracted.studentName;
            ocrTexts.push(extracted.text);
          }
        }

        combinedExtractedText = ocrTexts.join("\n\n");
        if (!hasSubstantiveStudentRecordText(combinedExtractedText)) {
          throw new Error(
            "학생부 OCR 결과가 충분하지 않습니다. 스캔 선명도를 확인하거나 텍스트를 직접 붙여넣어 주세요."
          );
        }
      }

      setProgressLabel("2/2 입학사정관 보고서 생성 중…");

      const generateRes = await fetch("/api/student-records/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentName: resolvedStudentName,
          text: combinedExtractedText,
        }),
      });
      const { data: generated, error: generateError } =
        await readStudentRecordApiResponse<{
          ok: boolean;
          message?: string;
          html?: string;
          studentName?: string;
          generatedAt?: string;
        }>(generateRes);

      if (generateError) {
        throw new Error(generateError);
      }
      if (!generated?.ok || !generated.html || !generated.generatedAt) {
        throw new Error(generated?.message ?? "보고서 생성에 실패했습니다.");
      }

      setResult({
        studentId: resolvedStudentId,
        studentName: resolvedStudentName,
        html: generated.html,
        generatedAt: generated.generatedAt,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "오류가 발생했습니다.");
    } finally {
      setAnalyzing(false);
      setProgressLabel(null);
    }
  }

  if (result) {
    return (
      <StudentRecordReportView
        result={result}
        onReset={() => {
          setResult(null);
          setError(null);
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="no-print">
        <PageHeader
          title="학생부 분석"
          description="학교생활기록부 텍스트·PDF·이미지를 업로드하면 입학사정관 관점 HTML 보고서를 생성합니다. PDF 저장·카카오톡 발송을 지원합니다."
        />
      </div>

      <section className="no-print space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900">1. 학생 선택 (선택)</h2>
        <p className="text-xs text-slate-500">
          학생을 선택하지 않아도 자료만으로 분석할 수 있습니다. 미선택 시 아래
          이름을 입력하거나, 학생부에서 이름을 추출합니다.
        </p>
        <div className="grid gap-3 sm:grid-cols-3">
          <label className="block text-sm">
            <span className="mb-1 block text-slate-600">반</span>
            <select
              className="ui-select"
              value={classId}
              onChange={(e) => setClassId(e.target.value)}
            >
              <option value="">전체</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-slate-600">이름 검색</span>
            <input
              className="ui-input"
              value={nameQuery}
              onChange={(e) => setNameQuery(e.target.value)}
              placeholder="학생 이름"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-slate-600">로그인 ID</span>
            <input
              className="ui-input"
              value={loginQuery}
              onChange={(e) => setLoginQuery(e.target.value)}
              placeholder="아이디"
            />
          </label>
        </div>

        <label className="block text-sm">
          <span className="mb-1 block text-slate-600">학생</span>
          <select
            className="ui-select"
            value={selectedStudentId}
            onChange={(e) => setSelectedStudentId(e.target.value)}
            disabled={listLoading}
          >
            <option value="">선택 안 함</option>
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
                {s.loginId ? ` (${s.loginId})` : ""}
                {s.classNames.length > 0 ? ` · ${s.classNames.join(", ")}` : ""}
              </option>
            ))}
          </select>
        </label>

        {!selectedStudentId && (
          <label className="block text-sm">
            <span className="mb-1 block text-slate-600">학생 이름 (선택)</span>
            <input
              className="ui-input"
              value={manualStudentName}
              onChange={(e) => setManualStudentName(e.target.value)}
              placeholder="미입력 시 학생부에서 추출"
            />
          </label>
        )}
      </section>

      <section className="no-print space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900">
          2. 학생부 자료 입력
        </h2>
        <p className="text-xs text-slate-500">
          성적표·세특·창체·행특 텍스트를 붙여넣거나, PDF·이미지(JPG/PNG)를
          업로드하세요. 스캔 PDF는 OpenAI PDF OCR을 먼저 시도하고, 실패 시
          브라우저 이미지 변환 OCR로 최대 {STUDENT_RECORD_MAX_PDF_PAGES}페이지까지
          분석합니다. 전체 용량은 약{" "}
          {formatBytes(STUDENT_RECORD_MAX_TOTAL_BYTES)} 이하를 권장합니다.
        </p>
        <textarea
          className="ui-input min-h-[220px] font-mono text-xs leading-relaxed"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="학생부 원문을 붙여넣으세요..."
        />
        <input
          type="file"
          className="block w-full text-sm text-slate-600"
          accept="application/pdf,image/jpeg,image/png,image/webp"
          multiple
          onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
        />
        {files.length > 0 && (
          <ul className="text-xs text-slate-600">
            {files.map((f) => (
              <li key={`${f.name}-${f.size}`}>· {f.name}</li>
            ))}
          </ul>
        )}
      </section>

      {error && (
        <p className="no-print rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-800" role="alert">
          {error}
        </p>
      )}

      <div className="no-print">
        <Button
          type="button"
          disabled={analyzing}
          onClick={() => void runAnalysis()}
        >
          {analyzing
            ? (progressLabel ?? "분석 생성 중…")
            : "학생부 분석 보고서 생성"}
        </Button>
      </div>
    </div>
  );
}
