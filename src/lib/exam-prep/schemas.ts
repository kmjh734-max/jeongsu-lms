import { z } from "zod";

export const createPassageSchema = z.object({
  title: z.string().trim().min(1).max(200),
  original_text: z.string().trim().min(1),
  grade: z.string().trim().optional().nullable(),
  school_name: z.string().trim().optional().nullable(),
  textbook_name: z.string().trim().optional().nullable(),
  publisher: z.string().trim().optional().nullable(),
  unit_name: z.string().trim().optional().nullable(),
  exam_range: z.string().trim().optional().nullable(),
  passage_number: z.string().trim().optional().nullable(),
  passage_type: z.string().trim().optional().nullable(),
  difficulty: z.string().trim().optional().nullable(),
  full_translation: z.string().trim().optional().nullable(),
  teacher_note: z.string().trim().optional().nullable(),
  exam_points: z.string().trim().optional().nullable(),
  status: z.enum(["draft", "ready", "archived"]).optional(),
});

export const updateSentenceSchema = z.object({
  id: z.string().uuid(),
  english_text: z.string().trim().min(1).optional(),
  korean_text: z.string().trim().optional().nullable(),
  vocabulary: z.unknown().optional(),
  grammar_points: z.unknown().optional(),
  exam_points: z.unknown().optional(),
  is_important_writing: z.boolean().optional(),
  sentence_order: z.number().int().positive().optional(),
});

export const createWorkbookSchema = z.object({
  passage_id: z.string().uuid(),
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().optional().nullable(),
  preset_type: z.enum(["basic", "memorize", "exam_eve", "custom"]).optional(),
});

export const createAssignmentSchema = z.object({
  workbook_id: z.string().uuid(),
  title: z.string().trim().min(1).max(200),
  class_ids: z.array(z.string().uuid()).optional().default([]),
  student_ids: z.array(z.string().uuid()).optional().default([]),
  start_at: z.string().optional().nullable(),
  due_at: z.string().optional().nullable(),
  teacher_message: z.string().optional().nullable(),
  settings: z.record(z.unknown()).optional(),
  allow_duplicate: z.boolean().optional().default(false),
});

export const saveDraftSchema = z.object({
  assignment_student_id: z.string().uuid(),
  step_id: z.string().uuid(),
  attempt_id: z.string().uuid().optional(),
  draft_answers: z.record(z.unknown()),
});

export const submitAttemptSchema = z.object({
  assignment_student_id: z.string().uuid(),
  step_id: z.string().uuid(),
  attempt_id: z.string().uuid(),
  answers: z.record(z.unknown()),
});
