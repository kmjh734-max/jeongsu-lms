-- 내신대비학습 (Exam Prep) — academy_id 멀티테넌트 + RLS

-- ---------------------------------------------------------------------------
-- Staff helper
-- ---------------------------------------------------------------------------
create or replace function public.exam_prep_staff_same_academy(target_academy_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.is_super_admin()
    or (
      target_academy_id is not null
      and target_academy_id = public.current_user_academy_id()
      and (public.is_admin() or public.is_teacher())
    );
$$;

-- ---------------------------------------------------------------------------
-- Passages
-- ---------------------------------------------------------------------------
create table if not exists public.exam_passages (
  id uuid primary key default gen_random_uuid(),
  academy_id uuid not null references public.academies(id) on delete cascade,
  title text not null,
  school_name text,
  grade text,
  textbook_name text,
  publisher text,
  unit_name text,
  exam_range text,
  passage_number text,
  passage_type text,
  difficulty text,
  original_text text not null,
  full_translation text,
  teacher_note text,
  exam_points text,
  status text not null default 'draft'
    check (status in ('draft', 'ready', 'archived')),
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists exam_passages_academy_idx
  on public.exam_passages(academy_id);
create index if not exists exam_passages_status_idx
  on public.exam_passages(academy_id, status);
create index if not exists exam_passages_created_idx
  on public.exam_passages(academy_id, created_at desc);

create table if not exists public.exam_passage_sentences (
  id uuid primary key default gen_random_uuid(),
  academy_id uuid not null references public.academies(id) on delete cascade,
  passage_id uuid not null references public.exam_passages(id) on delete cascade,
  sentence_order integer not null,
  english_text text not null,
  korean_text text,
  vocabulary jsonb not null default '[]'::jsonb,
  grammar_points jsonb not null default '[]'::jsonb,
  exam_points jsonb not null default '[]'::jsonb,
  is_important_writing boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (passage_id, sentence_order)
);

create index if not exists exam_passage_sentences_passage_idx
  on public.exam_passage_sentences(passage_id, sentence_order);
create index if not exists exam_passage_sentences_academy_idx
  on public.exam_passage_sentences(academy_id);

-- ---------------------------------------------------------------------------
-- Workbooks
-- ---------------------------------------------------------------------------
create table if not exists public.exam_workbooks (
  id uuid primary key default gen_random_uuid(),
  academy_id uuid not null references public.academies(id) on delete cascade,
  passage_id uuid not null references public.exam_passages(id) on delete cascade,
  title text not null,
  description text,
  preset_type text,
  status text not null default 'draft'
    check (status in ('draft', 'reviewing', 'approved', 'archived')),
  created_by uuid references public.profiles(id) on delete set null,
  approved_by uuid references public.profiles(id) on delete set null,
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists exam_workbooks_academy_idx
  on public.exam_workbooks(academy_id);
create index if not exists exam_workbooks_passage_idx
  on public.exam_workbooks(passage_id);
create index if not exists exam_workbooks_status_idx
  on public.exam_workbooks(academy_id, status);

create table if not exists public.exam_workbook_steps (
  id uuid primary key default gen_random_uuid(),
  academy_id uuid not null references public.academies(id) on delete cascade,
  workbook_id uuid not null references public.exam_workbooks(id) on delete cascade,
  step_type text not null,
  step_order integer not null,
  title text,
  difficulty text,
  passing_score numeric(6, 2) not null default 70,
  is_required boolean not null default true,
  sequential_unlock boolean not null default true,
  max_attempts integer not null default 3,
  show_answer_policy text not null default 'after_submit'
    check (show_answer_policy in ('never', 'after_submit', 'after_pass', 'immediate')),
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workbook_id, step_order)
);

create index if not exists exam_workbook_steps_workbook_idx
  on public.exam_workbook_steps(workbook_id, step_order);

create table if not exists public.exam_workbook_questions (
  id uuid primary key default gen_random_uuid(),
  academy_id uuid not null references public.academies(id) on delete cascade,
  workbook_id uuid not null references public.exam_workbooks(id) on delete cascade,
  step_id uuid not null references public.exam_workbook_steps(id) on delete cascade,
  sentence_id uuid references public.exam_passage_sentences(id) on delete set null,
  question_type text not null,
  question_order integer not null,
  question_text text,
  question_data jsonb not null default '{}'::jsonb,
  correct_answer jsonb,
  acceptable_answers jsonb,
  explanation text,
  difficulty text,
  points numeric(6, 2) not null default 1,
  is_active boolean not null default true,
  ai_generated boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists exam_workbook_questions_step_idx
  on public.exam_workbook_questions(step_id, question_order);
create index if not exists exam_workbook_questions_workbook_idx
  on public.exam_workbook_questions(workbook_id);

-- ---------------------------------------------------------------------------
-- Assignments
-- ---------------------------------------------------------------------------
create table if not exists public.exam_assignments (
  id uuid primary key default gen_random_uuid(),
  academy_id uuid not null references public.academies(id) on delete cascade,
  workbook_id uuid not null references public.exam_workbooks(id) on delete cascade,
  title text not null,
  class_id uuid references public.classes(id) on delete set null,
  start_at timestamptz,
  due_at timestamptz,
  settings jsonb not null default '{}'::jsonb,
  teacher_message text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists exam_assignments_academy_idx
  on public.exam_assignments(academy_id);
create index if not exists exam_assignments_workbook_idx
  on public.exam_assignments(workbook_id);
create index if not exists exam_assignments_due_idx
  on public.exam_assignments(academy_id, due_at);

create table if not exists public.exam_assignment_students (
  id uuid primary key default gen_random_uuid(),
  academy_id uuid not null references public.academies(id) on delete cascade,
  assignment_id uuid not null references public.exam_assignments(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'not_started'
    check (status in (
      'not_started', 'in_progress', 'needs_retry', 'completed', 'overdue'
    )),
  progress_rate numeric(6, 2) not null default 0,
  total_score numeric(8, 2),
  current_step_id uuid references public.exam_workbook_steps(id) on delete set null,
  started_at timestamptz,
  completed_at timestamptz,
  last_studied_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (assignment_id, student_id)
);

create index if not exists exam_assignment_students_student_idx
  on public.exam_assignment_students(student_id, status);
create index if not exists exam_assignment_students_assignment_idx
  on public.exam_assignment_students(assignment_id);
create index if not exists exam_assignment_students_last_idx
  on public.exam_assignment_students(academy_id, last_studied_at desc nulls last);

-- ---------------------------------------------------------------------------
-- Attempts / answers / wrong
-- ---------------------------------------------------------------------------
create table if not exists public.exam_attempts (
  id uuid primary key default gen_random_uuid(),
  academy_id uuid not null references public.academies(id) on delete cascade,
  assignment_student_id uuid not null
    references public.exam_assignment_students(id) on delete cascade,
  step_id uuid not null references public.exam_workbook_steps(id) on delete cascade,
  attempt_number integer not null default 1,
  score numeric(8, 2),
  correct_count integer,
  total_count integer,
  status text not null default 'in_progress'
    check (status in ('in_progress', 'submitted', 'abandoned')),
  draft_answers jsonb not null default '{}'::jsonb,
  started_at timestamptz not null default now(),
  submitted_at timestamptz,
  created_at timestamptz not null default now(),
  unique (assignment_student_id, step_id, attempt_number)
);

create index if not exists exam_attempts_as_idx
  on public.exam_attempts(assignment_student_id, step_id);

create table if not exists public.exam_answers (
  id uuid primary key default gen_random_uuid(),
  academy_id uuid not null references public.academies(id) on delete cascade,
  attempt_id uuid not null references public.exam_attempts(id) on delete cascade,
  question_id uuid not null references public.exam_workbook_questions(id) on delete cascade,
  student_answer jsonb,
  normalized_answer jsonb,
  is_correct boolean,
  score numeric(8, 2),
  grading_status text not null default 'pending'
    check (grading_status in (
      'pending', 'auto_correct', 'auto_incorrect',
      'needs_review', 'teacher_correct', 'teacher_incorrect'
    )),
  ai_feedback text,
  teacher_feedback text,
  graded_by uuid references public.profiles(id) on delete set null,
  answered_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (attempt_id, question_id)
);

create index if not exists exam_answers_attempt_idx
  on public.exam_answers(attempt_id);

create table if not exists public.exam_wrong_answers (
  id uuid primary key default gen_random_uuid(),
  academy_id uuid not null references public.academies(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  assignment_student_id uuid not null
    references public.exam_assignment_students(id) on delete cascade,
  question_id uuid not null references public.exam_workbook_questions(id) on delete cascade,
  sentence_id uuid references public.exam_passage_sentences(id) on delete set null,
  error_category text,
  wrong_count integer not null default 1,
  is_mastered boolean not null default false,
  last_wrong_at timestamptz not null default now(),
  mastered_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (student_id, question_id, assignment_student_id)
);

create index if not exists exam_wrong_answers_student_idx
  on public.exam_wrong_answers(student_id, is_mastered);
create index if not exists exam_wrong_answers_academy_idx
  on public.exam_wrong_answers(academy_id, last_wrong_at desc);

-- ---------------------------------------------------------------------------
-- Feature pricing
-- ---------------------------------------------------------------------------
insert into public.feature_pricing (feature_key, label, credit_cost, billing_type, is_active)
values
  ('exam_prep_workbook_ai', '내신대비 AI 워크북 생성', 8, 'per_use', true),
  ('exam_prep_grade_writing', '내신대비 서술형 AI 채점', 1, 'per_use', true)
on conflict (feature_key) do update set
  label = excluded.label,
  credit_cost = excluded.credit_cost,
  is_active = excluded.is_active;

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.exam_passages enable row level security;
alter table public.exam_passage_sentences enable row level security;
alter table public.exam_workbooks enable row level security;
alter table public.exam_workbook_steps enable row level security;
alter table public.exam_workbook_questions enable row level security;
alter table public.exam_assignments enable row level security;
alter table public.exam_assignment_students enable row level security;
alter table public.exam_attempts enable row level security;
alter table public.exam_answers enable row level security;
alter table public.exam_wrong_answers enable row level security;

-- Staff full access (same academy)
drop policy if exists "exam_passages staff" on public.exam_passages;
create policy "exam_passages staff" on public.exam_passages for all
  using (public.exam_prep_staff_same_academy(academy_id))
  with check (public.exam_prep_staff_same_academy(academy_id));

drop policy if exists "exam_passage_sentences staff" on public.exam_passage_sentences;
create policy "exam_passage_sentences staff" on public.exam_passage_sentences for all
  using (public.exam_prep_staff_same_academy(academy_id))
  with check (public.exam_prep_staff_same_academy(academy_id));

drop policy if exists "exam_workbooks staff" on public.exam_workbooks;
create policy "exam_workbooks staff" on public.exam_workbooks for all
  using (public.exam_prep_staff_same_academy(academy_id))
  with check (public.exam_prep_staff_same_academy(academy_id));

drop policy if exists "exam_workbook_steps staff" on public.exam_workbook_steps;
create policy "exam_workbook_steps staff" on public.exam_workbook_steps for all
  using (public.exam_prep_staff_same_academy(academy_id))
  with check (public.exam_prep_staff_same_academy(academy_id));

drop policy if exists "exam_workbook_questions staff" on public.exam_workbook_questions;
create policy "exam_workbook_questions staff" on public.exam_workbook_questions for all
  using (public.exam_prep_staff_same_academy(academy_id))
  with check (public.exam_prep_staff_same_academy(academy_id));

drop policy if exists "exam_assignments staff" on public.exam_assignments;
create policy "exam_assignments staff" on public.exam_assignments for all
  using (public.exam_prep_staff_same_academy(academy_id))
  with check (public.exam_prep_staff_same_academy(academy_id));

drop policy if exists "exam_assignment_students staff" on public.exam_assignment_students;
create policy "exam_assignment_students staff" on public.exam_assignment_students for all
  using (public.exam_prep_staff_same_academy(academy_id))
  with check (public.exam_prep_staff_same_academy(academy_id));

drop policy if exists "exam_attempts staff" on public.exam_attempts;
create policy "exam_attempts staff" on public.exam_attempts for all
  using (public.exam_prep_staff_same_academy(academy_id))
  with check (public.exam_prep_staff_same_academy(academy_id));

drop policy if exists "exam_answers staff" on public.exam_answers;
create policy "exam_answers staff" on public.exam_answers for all
  using (public.exam_prep_staff_same_academy(academy_id))
  with check (public.exam_prep_staff_same_academy(academy_id));

drop policy if exists "exam_wrong_answers staff" on public.exam_wrong_answers;
create policy "exam_wrong_answers staff" on public.exam_wrong_answers for all
  using (public.exam_prep_staff_same_academy(academy_id))
  with check (public.exam_prep_staff_same_academy(academy_id));

-- Student: own assignment rows only
drop policy if exists "exam_assignment_students student" on public.exam_assignment_students;
create policy "exam_assignment_students student" on public.exam_assignment_students
  for select using (student_id = auth.uid());

drop policy if exists "exam_assignment_students student update" on public.exam_assignment_students;
create policy "exam_assignment_students student update" on public.exam_assignment_students
  for update using (student_id = auth.uid())
  with check (student_id = auth.uid());

drop policy if exists "exam_assignments student" on public.exam_assignments;
create policy "exam_assignments student" on public.exam_assignments
  for select using (
    exists (
      select 1 from public.exam_assignment_students s
      where s.assignment_id = id and s.student_id = auth.uid()
    )
  );

-- Student may read approved workbook + steps/questions (without relying on client for answers —
-- still select-able; API strips correct_answer for students)
drop policy if exists "exam_workbooks student" on public.exam_workbooks;
create policy "exam_workbooks student" on public.exam_workbooks
  for select using (
    status = 'approved'
    and exists (
      select 1
      from public.exam_assignments a
      join public.exam_assignment_students s on s.assignment_id = a.id
      where a.workbook_id = exam_workbooks.id
        and s.student_id = auth.uid()
    )
  );

drop policy if exists "exam_workbook_steps student" on public.exam_workbook_steps;
create policy "exam_workbook_steps student" on public.exam_workbook_steps
  for select using (
    exists (
      select 1 from public.exam_workbooks w
      where w.id = workbook_id and w.status = 'approved'
        and exists (
          select 1
          from public.exam_assignments a
          join public.exam_assignment_students s on s.assignment_id = a.id
          where a.workbook_id = w.id and s.student_id = auth.uid()
        )
    )
  );

drop policy if exists "exam_workbook_questions student" on public.exam_workbook_questions;
create policy "exam_workbook_questions student" on public.exam_workbook_questions
  for select using (
    is_active = true
    and exists (
      select 1 from public.exam_workbooks w
      where w.id = workbook_id and w.status = 'approved'
        and exists (
          select 1
          from public.exam_assignments a
          join public.exam_assignment_students s on s.assignment_id = a.id
          where a.workbook_id = w.id and s.student_id = auth.uid()
        )
    )
  );

drop policy if exists "exam_passages student" on public.exam_passages;
create policy "exam_passages student" on public.exam_passages
  for select using (
    status = 'ready'
    and exists (
      select 1
      from public.exam_workbooks w
      join public.exam_assignments a on a.workbook_id = w.id
      join public.exam_assignment_students s on s.assignment_id = a.id
      where w.passage_id = exam_passages.id
        and w.status = 'approved'
        and s.student_id = auth.uid()
    )
  );

drop policy if exists "exam_passage_sentences student" on public.exam_passage_sentences;
create policy "exam_passage_sentences student" on public.exam_passage_sentences
  for select using (
    exists (
      select 1 from public.exam_passages p
      where p.id = passage_id and p.status = 'ready'
        and exists (
          select 1
          from public.exam_workbooks w
          join public.exam_assignments a on a.workbook_id = w.id
          join public.exam_assignment_students s on s.assignment_id = a.id
          where w.passage_id = p.id
            and w.status = 'approved'
            and s.student_id = auth.uid()
        )
    )
  );

drop policy if exists "exam_attempts student" on public.exam_attempts;
create policy "exam_attempts student" on public.exam_attempts
  for all using (
    exists (
      select 1 from public.exam_assignment_students s
      where s.id = assignment_student_id and s.student_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.exam_assignment_students s
      where s.id = assignment_student_id and s.student_id = auth.uid()
    )
  );

drop policy if exists "exam_answers student" on public.exam_answers;
create policy "exam_answers student" on public.exam_answers
  for all using (
    exists (
      select 1
      from public.exam_attempts at
      join public.exam_assignment_students s on s.id = at.assignment_student_id
      where at.id = attempt_id and s.student_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.exam_attempts at
      join public.exam_assignment_students s on s.id = at.assignment_student_id
      where at.id = attempt_id and s.student_id = auth.uid()
    )
  );

drop policy if exists "exam_wrong_answers student" on public.exam_wrong_answers;
create policy "exam_wrong_answers student" on public.exam_wrong_answers
  for select using (student_id = auth.uid());
