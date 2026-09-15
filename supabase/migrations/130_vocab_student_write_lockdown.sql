-- 학생이 단어학습 진행·점수 테이블에 직접 쓰지 못하게 막는다.
--
-- 예전에는 학생에게 vocab_stage_progress / vocab_final_test_* 에 FOR ALL 권한이 있어,
-- 브라우저에서 Supabase 키로 바로 "합격" 행을 만들 수 있었다.
-- 이제 학생 쓰기는 모두 서버(검증 후 service role)로만 한다.
-- 학생은 자기 행 SELECT만, 교사·관리자 정책은 그대로 둔다.
--
-- 여러 번 실행해도 안전하다 (drop policy if exists → create policy).

-- ---------------------------------------------------------------------------
-- vocab_stage_progress : FOR ALL → SELECT(own)
-- ---------------------------------------------------------------------------
drop policy if exists "Students manage own vocab_stage_progress" on public.vocab_stage_progress;
drop policy if exists "Students select own vocab_stage_progress" on public.vocab_stage_progress;
create policy "Students select own vocab_stage_progress"
  on public.vocab_stage_progress for select
  using (
    public.is_student()
    and student_id = auth.uid()
  );

-- ---------------------------------------------------------------------------
-- vocab_final_test_attempts : FOR ALL → SELECT(own)
-- ---------------------------------------------------------------------------
drop policy if exists "Students manage own vocab_final_test_attempts" on public.vocab_final_test_attempts;
drop policy if exists "Students select own vocab_final_test_attempts" on public.vocab_final_test_attempts;
create policy "Students select own vocab_final_test_attempts"
  on public.vocab_final_test_attempts for select
  using (
    public.is_student()
    and student_id = auth.uid()
  );

-- ---------------------------------------------------------------------------
-- vocab_final_test_answers : FOR ALL → SELECT(own attempt)
-- ---------------------------------------------------------------------------
drop policy if exists "Students manage own vocab_final_test_answers" on public.vocab_final_test_answers;
drop policy if exists "Students select own vocab_final_test_answers" on public.vocab_final_test_answers;
create policy "Students select own vocab_final_test_answers"
  on public.vocab_final_test_answers for select
  using (
    public.is_student()
    and exists (
      select 1
      from public.vocab_final_test_attempts vfta
      where vfta.id = vocab_final_test_answers.attempt_id
        and vfta.student_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- vocab_spelling_attempts / vocab_example_attempts : INSERT 제거 (SELECT own 유지)
-- ---------------------------------------------------------------------------
drop policy if exists "Students insert own vocab_spelling_attempts" on public.vocab_spelling_attempts;
drop policy if exists "Students select own vocab_spelling_attempts" on public.vocab_spelling_attempts;
create policy "Students select own vocab_spelling_attempts"
  on public.vocab_spelling_attempts for select
  using (
    public.is_student()
    and student_id = auth.uid()
  );

drop policy if exists "Students insert own vocab_example_attempts" on public.vocab_example_attempts;
drop policy if exists "Students select own vocab_example_attempts" on public.vocab_example_attempts;
create policy "Students select own vocab_example_attempts"
  on public.vocab_example_attempts for select
  using (
    public.is_student()
    and student_id = auth.uid()
  );

-- ---------------------------------------------------------------------------
-- vocab_progress (단어별 알아요/몰라요) : INSERT·UPDATE 제거 (SELECT own 유지)
-- ---------------------------------------------------------------------------
drop policy if exists "Students insert own vocab_progress" on public.vocab_progress;
drop policy if exists "Students update own vocab_progress" on public.vocab_progress;
drop policy if exists "Students select own vocab_progress" on public.vocab_progress;
create policy "Students select own vocab_progress"
  on public.vocab_progress for select
  using (
    public.is_student()
    and student_id = auth.uid()
  );

-- ---------------------------------------------------------------------------
-- 구 테스트(vocab_test_attempts / vocab_test_answers) : INSERT 제거 (SELECT own 유지)
-- ---------------------------------------------------------------------------
drop policy if exists "Students insert own vocab_test_attempts" on public.vocab_test_attempts;
drop policy if exists "Students select own vocab_test_attempts" on public.vocab_test_attempts;
create policy "Students select own vocab_test_attempts"
  on public.vocab_test_attempts for select
  using (
    public.is_student()
    and student_id = auth.uid()
  );

drop policy if exists "Students insert own vocab_test_answers" on public.vocab_test_answers;
drop policy if exists "Students select own vocab_test_answers" on public.vocab_test_answers;
create policy "Students select own vocab_test_answers"
  on public.vocab_test_answers for select
  using (
    public.is_student()
    and exists (
      select 1
      from public.vocab_test_attempts vta
      where vta.id = vocab_test_answers.attempt_id
        and vta.student_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- 구 통합 세션(vocab_set_sessions) : FOR ALL → SELECT(own)
-- ---------------------------------------------------------------------------
drop policy if exists "Students manage own vocab_set_sessions" on public.vocab_set_sessions;
drop policy if exists "Students select own vocab_set_sessions" on public.vocab_set_sessions;
create policy "Students select own vocab_set_sessions"
  on public.vocab_set_sessions for select
  using (
    public.is_student()
    and student_id = auth.uid()
  );
