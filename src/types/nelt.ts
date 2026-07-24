/** NELT 성장 리포트 타입 (LMS profiles와 무관 — 이름 중심) */

export type NeltSourceType = "pdf" | "url" | "manual";

export type NeltExtractionStatus =
  | "uploading"
  | "text_analyzing"
  | "extracting"
  | "needs_review"
  | "completed"
  | "failed";

export type NeltImportStatus =
  | "pending"
  | "uploading"
  | "text_analyzing"
  | "extracting"
  | "needs_review"
  | "completed"
  | "failed"
  | "cancelled";

export type NeltDomain =
  | "vocabulary"
  | "grammar"
  | "listening"
  | "reading";

export type NeltGrowthStatus =
  | "major_growth"
  | "growth"
  | "advanced_challenge"
  | "maintained"
  | "focus_needed";

export interface NeltReport {
  id: string;
  academy_id: string;
  student_id: string | null;
  student_name_raw: string;
  test_name: string | null;
  test_date: string | null;
  student_grade_raw: string | null;
  attempt_number: number | null;
  overall_level: string | null;
  overall_level_order: number | null;
  overall_band: string | null;
  overall_percentile: number | null;
  total_duration_seconds: number | null;
  source_type: NeltSourceType;
  source_url: string | null;
  source_file_path: string | null;
  source_file_hash: string | null;
  extraction_status: NeltExtractionStatus;
  extraction_confidence: number | null;
  raw_extracted_data: Record<string, unknown>;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface NeltGrowthHighlight {
  key: string;
  title: string;
  beforeLabel: string;
  afterLabel: string;
  deltaLabel?: string;
  status: NeltGrowthStatus;
  parentVisible: boolean;
}

export interface NeltGrowthReport {
  id: string;
  academy_id: string;
  student_id: string | null;
  student_name_raw: string;
  start_report_id: string | null;
  end_report_id: string | null;
  generated_summary: string | null;
  growth_highlights: NeltGrowthHighlight[];
  focus_areas: unknown[];
  learning_plan: Record<string, unknown>;
  teacher_comment: string | null;
  is_finalized: boolean;
  finalized_by: string | null;
  finalized_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface NeltStudentGroup {
  studentName: string;
  reportCount: number;
  latestTestDate: string | null;
  latestOverallLevel: string | null;
}
