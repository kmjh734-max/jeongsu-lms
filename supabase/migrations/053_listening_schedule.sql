-- 듣기 스케줄 과제 (기존 listening_assignments = 세트 단위 배정, 별도 기능)

create table public.listening_schedule_assignments (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  assigned_by uuid references public.profiles(id) on delete set null,
  target_type text not null check (target_type in ('class', 'student')),
  target_class_id uuid references public.classes(id) on delete cascade,
  target_student_id uuid references public.profiles(id) on delete cascade,
  start_date date not null,
  end_date date,
  days_of_week int[] not null default '{1,2,3,4,5}',
  questions_per_day int not null default 5 check (questions_per_day > 0),
  require_dictation_pass boolean not null default true,
  dictation_pass_score int not null default 80,
  lock_next_until_today_complete boolean not null default true,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint listening_schedule_assignments_target_check check (
    (target_type = 'class' and target_class_id is not null and target_student_id is null)
    or (target_type = 'student' and target_student_id is not null and target_class_id is null)
  )
);

create index listening_schedule_assignments_active_idx
  on public.listening_schedule_assignments(is_active, start_date);

create table public.listening_schedule_assignment_sets (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references public.listening_schedule_assignments(id) on delete cascade,
  set_id uuid not null references public.listening_sets(id) on delete cascade,
  order_index int not null default 0,
  unique (assignment_id, set_id)
);

create index listening_schedule_assignment_sets_assignment_idx
  on public.listening_schedule_assignment_sets(assignment_id, order_index);

create table public.listening_daily_tasks (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references public.listening_schedule_assignments(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  task_date date not null,
  set_id uuid not null references public.listening_sets(id) on delete cascade,
  question_ids uuid[] not null default '{}',
  status text not null default 'pending' check (
    status in ('pending', 'in_progress', 'completed', 'missed')
  ),
  completed_count int not null default 0,
  total_count int not null default 0,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (student_id, assignment_id, task_date)
);

create index listening_daily_tasks_student_date_idx
  on public.listening_daily_tasks(student_id, task_date);

create table public.listening_daily_task_progress (
  id uuid primary key default gen_random_uuid(),
  daily_task_id uuid not null references public.listening_daily_tasks(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  question_id uuid not null references public.listening_questions(id) on delete cascade,
  objective_completed boolean not null default false,
  dictation_completed boolean not null default false,
  dictation_score int,
  completed boolean not null default false,
  completed_at timestamptz,
  unique (daily_task_id, question_id)
);

create index listening_daily_task_progress_student_idx
  on public.listening_daily_task_progress(student_id, daily_task_id);

alter table public.listening_schedule_assignments enable row level security;
alter table public.listening_schedule_assignment_sets enable row level security;
alter table public.listening_daily_tasks enable row level security;
alter table public.listening_daily_task_progress enable row level security;

-- API는 service role(admin client)로 쓰고, 학생 select만 RLS 허용
create policy "Students read own daily tasks"
  on public.listening_daily_tasks for select
  using (student_id = auth.uid());

create policy "Students read own daily task progress"
  on public.listening_daily_task_progress for select
  using (student_id = auth.uid());
