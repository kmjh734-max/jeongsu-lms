import { useSyncExternalStore } from "react";
import {
  chunkStudentRecordFiles,
  fetchStudentRecordApi,
  prepareStudentRecordFiles,
  readStudentRecordApiResponse,
  validatePreparedExtractChunk,
  validatePreparedStudentRecordFiles,
} from "@/lib/student-records/client-upload";
import { STUDENT_RECORD_EXTRACT_CHUNK_PARALLEL } from "@/lib/student-records/limits";
import { isReliableStudentRecordExtract } from "@/lib/student-records/ocr-quality";
import type { StudentRecordAnalysisResult } from "@/lib/student-records/types";

/**
 * 학생부 분석 진행기 — 화면(컴포넌트) 밖에서 도는 한 탭당 하나의 작업.
 * 선생님이 다른 메뉴로 옮겨 가도(같은 탭 안의 이동) 작업은 계속되고,
 * 학생부 분석 화면으로 돌아오면 진행 상황이나 완성된 보고서를 다시 보여 준다.
 * 탭을 닫거나 새로고침하면 멈추므로 그때는 떠나기 전에 한 번 묻는다.
 */

const PROGRESS_PREP_END = 12;
const PROGRESS_OCR_END = 72;
const PROGRESS_GENERATE_END = 98;

/** 0 파일 읽기 · 1 내용 정리 · 2 보고서 쓰기 */
export type RecordJobStage = 0 | 1 | 2;
export type RecordJobStatus = "idle" | "running" | "done" | "error";

export type RecordJobInput = {
  files: File[];
  studentId: string | null;
  manualStudentName: string;
  analysisInstructions: string;
  /** 진행 화면에 보여 줄 학생 이름(모르면 빈 문자열) */
  displayName: string;
  /** 알림을 눌렀을 때 돌아갈 학생부 분석 화면 주소 */
  returnPath: string;
};

export type RecordJobState = {
  /** 작업마다 올라가는 번호 — 오래된 작업의 뒷정리가 새 작업을 건드리지 않게 */
  id: number;
  status: RecordJobStatus;
  stage: RecordJobStage;
  label: string;
  percent: number;
  input: RecordJobInput | null;
  error: string | null;
  result: StudentRecordAnalysisResult | null;
  /** 끝난 작업의 알림을 이미 눌러 봤는지 */
  seen: boolean;
};

type ExtractApiResult = {
  ok: boolean;
  message?: string;
  text?: string;
  studentId?: string | null;
  studentName?: string;
};

type GenerateApiResult = {
  ok: boolean;
  message?: string;
  html?: string;
  studentName?: string;
  generatedAt?: string;
  recordId?: string | null;
};

const IDLE_STATE: RecordJobState = {
  id: 0,
  status: "idle",
  stage: 0,
  label: "",
  percent: 0,
  input: null,
  error: null,
  result: null,
  seen: false,
};

let state: RecordJobState = IDLE_STATE;
let nextId = 1;
let abortController: AbortController | null = null;
const listeners = new Set<() => void>();

function setState(patch: Partial<RecordJobState>) {
  state = { ...state, ...patch };
  for (const listener of listeners) listener();
}

export function subscribeRecordJob(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getRecordJobState(): RecordJobState {
  return state;
}

function getServerSnapshot(): RecordJobState {
  return IDLE_STATE;
}

/** 지금 도는(또는 끝난) 학생부 분석 작업 상태를 읽는다 */
export function useRecordJob(): RecordJobState {
  return useSyncExternalStore(subscribeRecordJob, getRecordJobState, getServerSnapshot);
}

/** 끝난 작업 알림을 봤다고 표시 */
export function markRecordJobSeen() {
  if (state.status === "done" || state.status === "error") {
    if (!state.seen) setState({ seen: true });
  }
}

/** 화면이 결과(또는 실패)를 받아 갔으면 비운다. 다른 작업 번호면 건드리지 않는다. */
export function clearRecordJob(id: number) {
  if (state.id !== id || state.status === "running") return;
  state = { ...IDLE_STATE, id: state.id };
  for (const listener of listeners) listener();
}

/** 도는 작업을 멈춘다. 이미 보고서를 쓰는 중이면 서버 쪽 작업은 끝까지 갈 수 있다. */
export function cancelRecordJob() {
  if (state.status !== "running") return;
  abortController?.abort();
}

function handleBeforeUnload(event: BeforeUnloadEvent) {
  if (state.status !== "running") return;
  event.preventDefault();
  // 일부 브라우저는 returnValue가 있어야 확인 창을 띄운다
  event.returnValue = "";
}

function setProgress(id: number, stage: RecordJobStage, label: string, percent: number) {
  if (state.id !== id) return;
  setState({
    stage,
    label,
    percent: Math.min(100, Math.max(0, Math.round(percent))),
  });
}

class CancelledError extends Error {}

/**
 * 새 분석을 시작한다. 이미 도는 작업이 있으면 시작하지 않고 false를 돌려준다.
 * 흐름(내용 읽기 → 보고서 만들기)과 서버 호출은 예전 화면 안의 흐름과 같다.
 */
export function startRecordJob(input: RecordJobInput): boolean {
  if (state.status === "running") return false;

  const id = nextId++;
  const controller = new AbortController();
  abortController = controller;
  state = {
    ...IDLE_STATE,
    id,
    status: "running",
    label: "파일 여는 중",
    input,
  };
  for (const listener of listeners) listener();

  if (typeof window !== "undefined") {
    window.addEventListener("beforeunload", handleBeforeUnload);
  }

  void runPipeline(id, input, controller.signal)
    .then((result) => {
      if (state.id !== id) return;
      setState({
        status: "done",
        stage: 2,
        label: "다 만들었어요",
        percent: 100,
        result,
        error: null,
        seen: false,
      });
    })
    .catch((e) => {
      if (state.id !== id) return;
      if (controller.signal.aborted || e instanceof CancelledError) {
        state = { ...IDLE_STATE, id };
        for (const listener of listeners) listener();
        return;
      }
      setState({
        status: "error",
        error: e instanceof Error ? e.message : "문제가 생겼어요. 다시 해 주세요.",
        seen: false,
      });
    })
    .finally(() => {
      if (abortController === controller) abortController = null;
      if (typeof window !== "undefined" && state.status !== "running") {
        window.removeEventListener("beforeunload", handleBeforeUnload);
      }
    });

  return true;
}

async function runPipeline(
  id: number,
  input: RecordJobInput,
  signal: AbortSignal
): Promise<StudentRecordAnalysisResult> {
  const throwIfCancelled = () => {
    if (signal.aborted) throw new CancelledError("cancelled");
  };

  let resolvedStudentId: string | null = null;
  let resolvedStudentName = "";

  const buildFormData = () => {
    const formData = new FormData();
    if (input.studentId) formData.set("studentId", input.studentId);
    if (!input.studentId && input.manualStudentName.trim()) {
      formData.set("studentName", input.manualStudentName.trim());
    }
    return formData;
  };

  const postExtract = async (formData: FormData) => {
    const extractRes = await fetchStudentRecordApi("/api/student-records/extract", {
      method: "POST",
      body: formData,
      signal,
    });
    const { data, error } = await readStudentRecordApiResponse<ExtractApiResult>(extractRes);
    if (error) throw new Error(error);
    return data;
  };

  setProgress(id, 0, "파일 여는 중", 4);
  const preparedFiles = await prepareStudentRecordFiles(input.files, (label) => {
    throwIfCancelled();
    if (label.startsWith("PDF 변환")) {
      const match = label.match(/(\d+)\/(\d+)/);
      if (match) {
        const current = Number(match[1]);
        const total = Number(match[2]);
        const pct = 4 + (current / Math.max(total, 1)) * (PROGRESS_PREP_END - 4);
        setProgress(id, 0, `파일 여는 중 · ${current}/${total}쪽`, pct);
        return;
      }
    }
    setProgress(id, 0, "파일 여는 중", 6);
  });
  throwIfCancelled();

  const preparedError = validatePreparedStudentRecordFiles(preparedFiles);
  if (preparedError) throw new Error(preparedError);

  const imageChunks = preparedFiles.length > 0 ? chunkStudentRecordFiles(preparedFiles) : [];
  if (imageChunks.length === 0) {
    throw new Error("올린 파일에서 읽을 쪽을 찾지 못했어요. 파일을 확인해 주세요.");
  }

  const ocrTexts: string[] = [];
  const ocrSpan = PROGRESS_OCR_END - PROGRESS_PREP_END;

  const extractChunk = async (chunkIndex: number) => {
    const chunk = imageChunks[chunkIndex]!;
    const chunkError = validatePreparedExtractChunk(chunk);
    if (chunkError) throw new Error(chunkError);

    const formData = buildFormData();
    for (const file of chunk) {
      formData.append("files", file);
    }

    const extracted = await postExtract(formData);
    if (!extracted?.ok || !extracted.text || !extracted.studentName) {
      throw new Error(extracted?.message ?? `${chunkIndex + 1}번째 묶음을 읽지 못했어요.`);
    }
    return extracted;
  };

  const totalPages = preparedFiles.length;
  let pagesDone = 0;

  for (let i = 0; i < imageChunks.length; i += STUDENT_RECORD_EXTRACT_CHUNK_PARALLEL) {
    throwIfCancelled();
    const batchIndices = Array.from(
      { length: Math.min(STUDENT_RECORD_EXTRACT_CHUNK_PARALLEL, imageChunks.length - i) },
      (_, j) => i + j
    );
    const batchPages = batchIndices.reduce((sum, idx) => sum + imageChunks[idx]!.length, 0);

    setProgress(
      id,
      1,
      `학생부 내용 읽는 중 · ${Math.min(pagesDone + batchPages, totalPages)}/${totalPages}쪽`,
      PROGRESS_PREP_END + (pagesDone / totalPages) * ocrSpan
    );

    const batchResults = await Promise.all(
      batchIndices.map((chunkIndex) => extractChunk(chunkIndex))
    );

    for (const extracted of batchResults) {
      resolvedStudentId = extracted.studentId ?? resolvedStudentId;
      resolvedStudentName = extracted.studentName!;
      ocrTexts.push(extracted.text!);
    }

    pagesDone = Math.min(pagesDone + batchPages, totalPages);
    setProgress(
      id,
      1,
      `학생부 내용 읽는 중 · ${pagesDone}/${totalPages}쪽`,
      PROGRESS_PREP_END + (pagesDone / totalPages) * ocrSpan
    );
  }

  const combinedExtractedText = ocrTexts.join("\n\n");
  if (!isReliableStudentRecordExtract(combinedExtractedText)) {
    throw new Error("학생부 글자를 충분히 읽지 못했어요. 더 선명한 파일로 다시 올려 주세요.");
  }
  throwIfCancelled();

  setProgress(id, 2, "보고서 쓰는 중", PROGRESS_OCR_END + 3);

  // 생성 단계는 1~3분 걸리므로 멈춰 보이지 않게 진행률을 천천히 올린다
  const generateTicker = setInterval(() => {
    if (state.id === id && state.status === "running" && state.percent < PROGRESS_GENERATE_END) {
      setState({ percent: state.percent + 1 });
    }
  }, 5000);

  let generateRes: Response;
  try {
    generateRes = await fetchStudentRecordApi(
      "/api/student-records/generate",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: resolvedStudentId,
          studentName: resolvedStudentName,
          text: combinedExtractedText,
          analysisInstructions: input.analysisInstructions.trim(),
        }),
        signal,
      },
      // 보고서 생성은 1회 2~3분 걸릴 수 있어 재시도는 1회만
      1
    );
  } finally {
    clearInterval(generateTicker);
  }

  const { data: generated, error: generateError } =
    await readStudentRecordApiResponse<GenerateApiResult>(generateRes);
  if (generateError) throw new Error(generateError);
  if (!generated?.ok || !generated.html || !generated.generatedAt) {
    throw new Error(generated?.message ?? "보고서를 만들지 못했어요.");
  }

  return {
    studentId: resolvedStudentId,
    // 학생 미선택 시 서버가 학생부 본문에서 찾아낸 실제 이름 사용
    studentName: generated.studentName ?? resolvedStudentName,
    html: generated.html,
    generatedAt: generated.generatedAt,
    recordId: generated.recordId ?? null,
  };
}
