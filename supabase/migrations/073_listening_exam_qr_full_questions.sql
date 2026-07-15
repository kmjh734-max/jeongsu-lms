-- QR /listen exam hub: students must see ALL questions on a published set,
-- not only the subset in listening_daily_tasks.question_ids (schedule homework).
-- Aligns with student_can_submit_listening_exam (any published set).

drop policy if exists "Students select listening_sets for published exams"
  on public.listening_sets;
create policy "Students select listening_sets for published exams"
  on public.listening_sets for select
  using (
    public.is_student()
    and public.student_can_submit_listening_exam(id)
  );

drop policy if exists "Students select listening_questions for published exams"
  on public.listening_questions;
create policy "Students select listening_questions for published exams"
  on public.listening_questions for select
  using (
    public.is_student()
    and public.student_can_submit_listening_exam(set_id)
  );
