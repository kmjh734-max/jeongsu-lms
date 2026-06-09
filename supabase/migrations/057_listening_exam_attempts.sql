-- Objective listening exam attempts (QR OMR / online practice)

create table if not exists public.listening_exam_attempts (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  set_id uuid not null references public.listening_sets(id) on delete cascade,
  source text not null default 'qr_omr'
    check (source in ('qr_omr', 'online', 'schedule')),
  daily_task_id uuid references public.listening_daily_tasks(id) on delete set null,
  score int not null default 0 check (score between 0 and 100),
  correct_count int not null default 0 check (correct_count >= 0),
  total_count int not null default 0 check (total_count >= 0),
  submitted_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists listening_exam_attempts_student_set_idx
  on public.listening_exam_attempts (student_id, set_id);

create index if not exists listening_exam_attempts_set_submitted_idx
  on public.listening_exam_attempts (set_id, submitted_at desc);

create index if not exists listening_exam_attempts_student_submitted_idx
  on public.listening_exam_attempts (student_id, submitted_at desc);

create table if not exists public.listening_exam_answers (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid not null references public.listening_exam_attempts(id) on delete cascade,
  question_id uuid not null references public.listening_questions(id) on delete cascade,
  order_index int not null check (order_index >= 1),
  student_answer int check (student_answer is null or student_answer between 1 and 5),
  correct_answer int not null check (correct_answer between 1 and 5),
  is_correct boolean not null default false,
  created_at timestamptz not null default now(),
  unique (attempt_id, question_id)
);

create index if not exists listening_exam_answers_attempt_id_idx
  on public.listening_exam_answers (attempt_id);

create or replace function public.student_can_submit_listening_exam(set_uuid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.listening_sets s
    where s.id = set_uuid
      and s.is_published = true
  );
$$;

alter table public.listening_exam_attempts enable row level security;
alter table public.listening_exam_answers enable row level security;

drop policy if exists "Admins manage listening_exam_attempts"
  on public.listening_exam_attempts;
create policy "Admins manage listening_exam_attempts"
  on public.listening_exam_attempts for all
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Teachers select listening_exam_attempts for own sets"
  on public.listening_exam_attempts;
create policy "Teachers select listening_exam_attempts for own sets"
  on public.listening_exam_attempts for select
  using (
    public.is_teacher()
    and public.teacher_can_manage_listening_set(set_id)
  );

drop policy if exists "Students select own listening_exam_attempts"
  on public.listening_exam_attempts;
create policy "Students select own listening_exam_attempts"
  on public.listening_exam_attempts for select
  using (
    public.is_student()
    and student_id = auth.uid()
    and public.student_can_submit_listening_exam(set_id)
  );

drop policy if exists "Students insert own listening_exam_attempts"
  on public.listening_exam_attempts;
create policy "Students insert own listening_exam_attempts"
  on public.listening_exam_attempts for insert
  with check (
    public.is_student()
    and student_id = auth.uid()
    and public.student_can_submit_listening_exam(set_id)
  );

drop policy if exists "Admins manage listening_exam_answers"
  on public.listening_exam_answers;
create policy "Admins manage listening_exam_answers"
  on public.listening_exam_answers for all
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Teachers select listening_exam_answers for own sets"
  on public.listening_exam_answers;
create policy "Teachers select listening_exam_answers for own sets"
  on public.listening_exam_answers for select
  using (
    public.is_teacher()
    and exists (
      select 1
      from public.listening_exam_attempts a
      where a.id = attempt_id
        and public.teacher_can_manage_listening_set(a.set_id)
    )
  );

drop policy if exists "Students manage own listening_exam_answers"
  on public.listening_exam_answers;
create policy "Students manage own listening_exam_answers"
  on public.listening_exam_answers for all
  using (
    public.is_student()
    and exists (
      select 1
      from public.listening_exam_attempts a
      where a.id = attempt_id
        and a.student_id = auth.uid()
        and public.student_can_submit_listening_exam(a.set_id)
    )
  )
  with check (
    public.is_student()
    and exists (
      select 1
      from public.listening_exam_attempts a
      where a.id = attempt_id
        and a.student_id = auth.uid()
        and public.student_can_submit_listening_exam(a.set_id)
    )
  );
