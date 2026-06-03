-- 스케줄 과제로 배정된 세트/문항도 학생이 읽을 수 있게 (기존 listening_assignments RLS 보완)

create policy "Students read schedule daily task listening sets"
  on public.listening_sets for select
  using (
    is_published = true
    and exists (
      select 1 from public.listening_daily_tasks dt
      where dt.set_id = listening_sets.id
        and dt.student_id = auth.uid()
    )
  );

create policy "Students read schedule daily task listening questions"
  on public.listening_questions for select
  using (
    exists (
      select 1 from public.listening_daily_tasks dt
      where dt.set_id = listening_questions.set_id
        and dt.student_id = auth.uid()
        and listening_questions.id = any (dt.question_ids)
    )
  );
