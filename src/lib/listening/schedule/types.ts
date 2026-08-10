export type ScheduleTargetType = "class" | "student";

export type DailyTaskStatus = "pending" | "in_progress" | "completed" | "missed";

export interface ScheduleAssignmentRow {
  id: string;
  title: string;
  description: string | null;
  assigned_by: string | null;
  target_type: ScheduleTargetType;
  target_class_id: string | null;
  target_student_id: string | null;
  start_date: string;
  end_date: string | null;
  days_of_week: number[];
  questions_per_day: number;
  require_dictation_pass: boolean;
  dictation_pass_score: number;
  lock_next_until_today_complete: boolean;
  is_active: boolean;
  created_at?: string | null;
}

export interface QuestionQueueItem {
  setId: string;
  questionId: string;
  orderIndex: number;
}

export interface DailyTaskSlice {
  setId: string;
  questionIds: string[];
}
