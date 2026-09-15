/** 단어학습(관리자·강사) 화면들이 함께 쓰는 자료 모양 — 서버·브라우저 양쪽에서 가져다 쓴다. */

export type VocabRole = "admin" | "teacher";

export type VocabBasePath = "/admin/vocab" | "/teacher/vocab";

export function vocabBasePath(role: VocabRole): VocabBasePath {
  return role === "admin" ? "/admin/vocab" : "/teacher/vocab";
}

export interface VocabModuleFolder {
  id: string;
  name: string;
  setCount: number;
  /** 학원 교재(잠긴 세트가 들어 있는 폴더) */
  isCurriculum: boolean;
}

export interface VocabModuleSet {
  id: string;
  title: string;
  folderId: string | null;
  isLocked: boolean;
  orderIndex: number;
  createdAt: string;
  teacherName: string | null;
}

export interface VocabTeacherOption {
  id: string;
  name: string;
}

export interface VocabModuleData {
  folders: VocabModuleFolder[];
  sets: VocabModuleSet[];
  /** 내 세트 전체 수 (학원 교재 폴더·폴더 없는 학원 교재 제외) */
  mySetCount: number;
  /** 폴더 없는 내 세트 */
  unfiledCount: number;
  /** 폴더 없이 잠긴 학원 교재 세트 */
  lockedUnfiledCount: number;
  teachers: VocabTeacherOption[];
}

/** 세트 목록 한 줄에 붙는 배정·진행 요약 */
export interface VocabSetStats {
  /** 예: "2반 · 학생 3" — 배정이 없으면 null */
  assignLabel: string | null;
  assignedCount: number;
  /** 배정된 학생 평균 진행률(0~100). 배정이 없으면 null */
  avgProgress: number | null;
  /** 4단계(최종 시험) 합격한 학생 수 */
  passedCount: number;
}

export interface VocabSetListRow extends VocabModuleSet {
  itemCount: number;
  stats: VocabSetStats;
}

export type VocabSetsFilter =
  | { kind: "all" }
  | { kind: "unfiled" }
  | { kind: "locked" }
  | { kind: "folder"; folderId: string };

export function formatShortDate(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const parts = new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    month: "numeric",
    day: "numeric",
  }).formatToParts(d);
  const month = parts.find((p) => p.type === "month")?.value ?? "";
  const day = parts.find((p) => p.type === "day")?.value ?? "";
  return `${month}월 ${day}일`;
}
