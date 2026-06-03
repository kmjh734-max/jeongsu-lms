-- Dictation: settings on sets + per-student attempt records

alter table public.listening_sets
  add column if not exists dictation_enabled boolean not null default true,
  add column if not exists dictation_pass_score int not null default 80
    check (dictation_pass_score between 0 and 100),
  add column if not exists dictation_blank_level text not null default 'auto'
    check (dictation_blank_level in ('auto', 'few', 'normal', 'many')),
  add column if not exists dictation_randomize_on_retry boolean not null default true,
  add column if not exists dictation_lock_next_until_pass boolean not null default true;

create table if not exists public.listening_dictation_attempts (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  set_id uuid not null references public.listening_sets(id) on delete cascade,
  question_id uuid not null references public.listening_questions(id) on delete cascade,
  attempt_no int not null default 1 check (attempt_no >= 1),
  blank_items jsonb not null default '[]'::jsonb,
  student_answers jsonb not null default '{}'::jsonb,
  score int check (score is null or (score >= 0 and score <= 100)),
  passed boolean not null default false,
  created_at timestamptz not null default now(),
  submitted_at timestamptz,
  unique (student_id, question_id, attempt_no)
);

create index if not exists listening_dictation_attempts_student_set_idx
  on public.listening_dictation_attempts (student_id, set_id);

create index if not exists listening_dictation_attempts_question_idx
  on public.listening_dictation_attempts (question_id);

alter table public.listening_dictation_attempts enable row level security;

drop policy if exists "Admins manage listening_dictation_attempts"
  on public.listening_dictation_attempts;
create policy "Admins manage listening_dictation_attempts"
  on public.listening_dictation_attempts for all
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Teachers select dictation attempts for own sets"
  on public.listening_dictation_attempts;
create policy "Teachers select dictation attempts for own sets"
  on public.listening_dictation_attempts for select
  using (
    public.is_teacher()
    and public.teacher_can_manage_listening_set(set_id)
  );

drop policy if exists "Students select own dictation attempts"
  on public.listening_dictation_attempts;
create policy "Students select own dictation attempts"
  on public.listening_dictation_attempts for select
  using (
    public.is_student()
    and student_id = auth.uid()
    and public.student_can_read_listening_set(set_id)
  );

drop policy if exists "Students insert own dictation attempts"
  on public.listening_dictation_attempts;
create policy "Students insert own dictation attempts"
  on public.listening_dictation_attempts for insert
  with check (
    public.is_student()
    and student_id = auth.uid()
    and public.student_can_read_listening_set(set_id)
  );

drop policy if exists "Students update own dictation attempts"
  on public.listening_dictation_attempts;
create policy "Students update own dictation attempts"
  on public.listening_dictation_attempts for update
  using (
    public.is_student()
    and student_id = auth.uid()
    and public.student_can_read_listening_set(set_id)
  )
  with check (
    public.is_student()
    and student_id = auth.uid()
    and public.student_can_read_listening_set(set_id)
  );
