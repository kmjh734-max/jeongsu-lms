-- 듣기학습: 세트, 문항, 화자별 segment, 배정

-- ---------------------------------------------------------------------------
-- listening_sets
-- ---------------------------------------------------------------------------
create table public.listening_sets (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  teacher_id uuid references public.profiles(id) on delete set null,
  created_by uuid references public.profiles(id) on delete set null,
  is_published boolean not null default false,
  created_at timestamptz not null default now()
);

create index listening_sets_teacher_id_idx on public.listening_sets(teacher_id);

-- ---------------------------------------------------------------------------
-- listening_questions
-- ---------------------------------------------------------------------------
create table public.listening_questions (
  id uuid primary key default gen_random_uuid(),
  set_id uuid not null references public.listening_sets(id) on delete cascade,
  order_index int not null default 0,
  question_type text not null default '내용일치',
  script_text text not null default '',
  script_translation text not null default '',
  question_text text not null,
  choices jsonb not null default '[]'::jsonb,
  correct_answer int not null default 1 check (correct_answer between 1 and 4),
  explanation text not null default '',
  audio_url text,
  created_at timestamptz not null default now()
);

create index listening_questions_set_id_idx on public.listening_questions(set_id);

-- ---------------------------------------------------------------------------
-- listening_question_segments (ANN / M / W)
-- ---------------------------------------------------------------------------
create table public.listening_question_segments (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.listening_questions(id) on delete cascade,
  order_index int not null default 0,
  speaker_type text not null check (speaker_type in ('ANN', 'M', 'W')),
  text text not null,
  voice_name text,
  audio_url text,
  duration_ms int,
  created_at timestamptz not null default now()
);

create index listening_question_segments_question_id_idx
  on public.listening_question_segments(question_id);

-- ---------------------------------------------------------------------------
-- listening_assignments
-- ---------------------------------------------------------------------------
create table public.listening_assignments (
  id uuid primary key default gen_random_uuid(),
  set_id uuid not null references public.listening_sets(id) on delete cascade,
  student_id uuid references public.profiles(id) on delete cascade,
  class_id uuid references public.classes(id) on delete cascade,
  assigned_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  constraint listening_assignments_target_check check (
    student_id is not null or class_id is not null
  )
);

create unique index listening_assignments_set_student_uidx
  on public.listening_assignments(set_id, student_id)
  where student_id is not null;

create unique index listening_assignments_set_class_uidx
  on public.listening_assignments(set_id, class_id)
  where class_id is not null;

-- ---------------------------------------------------------------------------
-- Storage: listening-audio
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('listening-audio', 'listening-audio', true)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.listening_sets enable row level security;
alter table public.listening_questions enable row level security;
alter table public.listening_question_segments enable row level security;
alter table public.listening_assignments enable row level security;

-- listening_sets
create policy "Admins manage all listening sets"
  on public.listening_sets for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "Teachers manage own listening sets"
  on public.listening_sets for all
  using (teacher_id = auth.uid())
  with check (teacher_id = auth.uid());

create policy "Students read published assigned listening sets"
  on public.listening_sets for select
  using (
    is_published = true
    and exists (
      select 1 from public.listening_assignments la
      where la.set_id = listening_sets.id
        and (
          la.student_id = auth.uid()
          or exists (
            select 1 from public.class_students cs
            where cs.class_id = la.class_id and cs.student_id = auth.uid()
          )
        )
    )
  );

-- listening_questions (via set access)
create policy "Admins manage listening questions"
  on public.listening_questions for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "Teachers manage listening questions for own sets"
  on public.listening_questions for all
  using (
    exists (
      select 1 from public.listening_sets s
      where s.id = set_id and s.teacher_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.listening_sets s
      where s.id = set_id and s.teacher_id = auth.uid()
    )
  );

create policy "Students read listening questions for assigned sets"
  on public.listening_questions for select
  using (
    exists (
      select 1 from public.listening_sets s
      join public.listening_assignments la on la.set_id = s.id
      where s.id = set_id and s.is_published = true
        and (
          la.student_id = auth.uid()
          or exists (
            select 1 from public.class_students cs
            where cs.class_id = la.class_id and cs.student_id = auth.uid()
          )
        )
    )
  );

-- listening_question_segments
create policy "Admins manage listening segments"
  on public.listening_question_segments for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "Teachers manage listening segments for own sets"
  on public.listening_question_segments for all
  using (
    exists (
      select 1 from public.listening_questions q
      join public.listening_sets s on s.id = q.set_id
      where q.id = question_id and s.teacher_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.listening_questions q
      join public.listening_sets s on s.id = q.set_id
      where q.id = question_id and s.teacher_id = auth.uid()
    )
  );

create policy "Students read listening segments for assigned sets"
  on public.listening_question_segments for select
  using (
    exists (
      select 1 from public.listening_questions q
      join public.listening_sets s on s.id = q.set_id
      join public.listening_assignments la on la.set_id = s.id
      where q.id = question_id and s.is_published = true
        and (
          la.student_id = auth.uid()
          or exists (
            select 1 from public.class_students cs
            where cs.class_id = la.class_id and cs.student_id = auth.uid()
          )
        )
    )
  );

-- listening_assignments
create policy "Admins manage listening assignments"
  on public.listening_assignments for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "Teachers manage listening assignments for own sets"
  on public.listening_assignments for all
  using (
    exists (
      select 1 from public.listening_sets s
      where s.id = set_id and s.teacher_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.listening_sets s
      where s.id = set_id and s.teacher_id = auth.uid()
    )
  );

create policy "Students read own listening assignments"
  on public.listening_assignments for select
  using (
    student_id = auth.uid()
    or exists (
      select 1 from public.class_students cs
      where cs.class_id = listening_assignments.class_id
        and cs.student_id = auth.uid()
    )
  );

-- Storage policies
create policy "Authenticated read listening audio"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'listening-audio');

create policy "Admins upload listening audio"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'listening-audio'
    and public.is_admin()
  );

create policy "Teachers upload listening audio"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'listening-audio'
    and exists (
      select 1 from public.profiles p where p.id = auth.uid() and p.role = 'teacher'
    )
  );

create policy "Admins update listening audio"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'listening-audio' and public.is_admin());

create policy "Teachers update listening audio"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'listening-audio'
    and exists (
      select 1 from public.profiles p where p.id = auth.uid() and p.role = 'teacher'
    )
  );

create policy "Admins delete listening audio"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'listening-audio' and public.is_admin());

create policy "Teachers delete listening audio"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'listening-audio'
    and exists (
      select 1 from public.profiles p where p.id = auth.uid() and p.role = 'teacher'
    )
  );
