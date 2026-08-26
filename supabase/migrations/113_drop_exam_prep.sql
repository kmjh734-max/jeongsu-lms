-- Drop exam-prep (내신대비학습) schema entirely.
-- Does NOT touch listening_exam_* or question-generator exam_vocab.

-- ---------------------------------------------------------------------------
-- Feature pricing
-- ---------------------------------------------------------------------------
delete from public.feature_pricing
where feature_key in (
  'exam_prep_workbook_ai',
  'exam_prep_grade_writing'
);

-- ---------------------------------------------------------------------------
-- Drop tables (child → parent)
-- ---------------------------------------------------------------------------
drop table if exists public.exam_answers cascade;
drop table if exists public.exam_wrong_answers cascade;
drop table if exists public.exam_attempts cascade;
drop table if exists public.exam_stage4_attempts cascade;
drop table if exists public.exam_stage1_progress cascade;
drop table if exists public.exam_stage2_progress cascade;
drop table if exists public.exam_stage_translation_settings cascade;
drop table if exists public.exam_stage_blanks cascade;
drop table if exists public.exam_korean_blanks cascade;
drop table if exists public.exam_workbook_questions cascade;
drop table if exists public.exam_workbook_steps cascade;
drop table if exists public.exam_assignment_students cascade;
drop table if exists public.exam_assignments cascade;
drop table if exists public.exam_workbooks cascade;
drop table if exists public.exam_passage_sentences cascade;
drop table if exists public.exam_passages cascade;
drop table if exists public.exam_passage_sets cascade;

-- ---------------------------------------------------------------------------
-- Helper function
-- ---------------------------------------------------------------------------
drop function if exists public.exam_prep_staff_same_academy(uuid);
