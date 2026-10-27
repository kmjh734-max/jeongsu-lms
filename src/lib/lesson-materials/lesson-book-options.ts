import { DEFAULT_VOCAB_EXAM, normalizeVocabExam, type TestBookOptions, type TestBookTheme, type VocabExamOptions } from "@/lib/lesson-materials/test-book";

/**
 * 수업용 자료 설정. 파일(lesson_material_documents.payload.options)에 저장한다 — 예전에는 브라우저에만
 * 기억해서 다른 컴퓨터·최종통합자료에서는 기본값(해석 있음)으로 나왔다(선생님 2026-10-26).
 */
export type LessonBookOptions = {
  allVocab: boolean;
  translation: TestBookOptions["translation"];
  blankNote: boolean;
  theme: TestBookTheme;
  /** 맨 뒤 단어 시험지(정답 포함) — 단어장·시험지·구성을 한 화면에서(선생님 2026-10-27) */
  vocabTest: boolean;
  /** 단어 시험지 유형별 문항 수 */
  vocabExam: VocabExamOptions;
};

export const DEFAULT_LESSON_BOOK_OPTIONS: LessonBookOptions = {
  allVocab: true,
  translation: "show",
  blankNote: false,
  theme: "b",
  vocabTest: false,
  vocabExam: DEFAULT_VOCAB_EXAM,
};

/** 저장된 값 가운데 쓸 수 있는 것만(없으면 null — 나머지는 브라우저 기억·기본값을 쓴다) */
export function normalizeLessonBookOptions(raw: unknown): Partial<LessonBookOptions> | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Partial<Record<keyof LessonBookOptions, unknown>>;
  const out: Partial<LessonBookOptions> = {};
  if (typeof r.allVocab === "boolean") out.allVocab = r.allVocab;
  if (r.translation === "show" || r.translation === "hide" || r.translation === "back") out.translation = r.translation;
  if (typeof r.blankNote === "boolean") out.blankNote = r.blankNote;
  if ((["a", "b", "c", "d", "e", "f"] as const).includes(r.theme as TestBookTheme)) out.theme = r.theme as TestBookTheme;
  if (typeof r.vocabTest === "boolean") out.vocabTest = r.vocabTest;
  if (r.vocabExam && typeof r.vocabExam === "object") out.vocabExam = normalizeVocabExam(r.vocabExam);
  return Object.keys(out).length ? out : null;
}
