-- 내신대비 2단계 「우리말 빈칸 완성하기」
-- 1단계 문장 재사용. 정답은 exam_korean_blanks에만 두고 학생 SELECT 금지.

-- ---------------------------------------------------------------------------
-- exam_passages: 2단계 공개 여부
-- ---------------------------------------------------------------------------
alter table public.exam_passages
  add column if not exists stage2_published boolean not null default false;

comment on column public.exam_passages.stage2_published is
  '2단계 우리말 빈칸 공개 여부 (학생 학습 가능)';

-- ---------------------------------------------------------------------------
-- exam_korean_blanks: 강사 지정 빈칸 (문자 범위 기반)
-- ---------------------------------------------------------------------------
create table if not exists public.exam_korean_blanks (
  id uuid primary key default gen_random_uuid(),
  academy_id uuid not null references public.academies(id) on delete cascade,
  passage_id uuid not null references public.exam_passages(id) on delete cascade,
  sentence_id uuid not null references public.exam_passage_sentences(id) on delete cascade,
  blank_order integer not null default 1,
  answer_text text not null,
  accepted_answers text[] not null default '{}',
  korean_start integer not null,
  korean_end integer not null,
  answer_snapshot text not null,
  linked_vocabulary_mark_id text,
  linked_english_text text,
  linked_english_start integer,
  linked_english_end integer,
  linked_english_occurrence integer,
  hint text,
  explanation text,
  is_required boolean not null default true,
  ignore_punctuation boolean not null default false,
  flexible_spacing boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint exam_korean_blanks_range_chk check (korean_start >= 0 and korean_end > korean_start),
  constraint exam_korean_blanks_answer_chk check (length(trim(answer_text)) > 0)
);

create index if not exists exam_korean_blanks_passage_idx
  on public.exam_korean_blanks(passage_id, blank_order);
create index if not exists exam_korean_blanks_sentence_idx
  on public.exam_korean_blanks(sentence_id, blank_order);
create index if not exists exam_korean_blanks_academy_idx
  on public.exam_korean_blanks(academy_id);

alter table public.exam_korean_blanks enable row level security;

drop policy if exists "exam_korean_blanks staff" on public.exam_korean_blanks;
create policy "exam_korean_blanks staff"
  on public.exam_korean_blanks for all
  using (public.exam_prep_staff_same_academy(academy_id))
  with check (public.exam_prep_staff_same_academy(academy_id));

-- 학생은 이 테이블을 직접 select 할 수 없음 (정답 노출 방지). 서버(service/staff) 또는
-- 서버 액션에서만 채점용으로 조회한다.

-- ---------------------------------------------------------------------------
-- exam_stage2_progress: 학생 2단계 답안·채점 상태
-- ---------------------------------------------------------------------------
create table if not exists public.exam_stage2_progress (
  id uuid primary key default gen_random_uuid(),
  academy_id uuid not null references public.academies(id) on delete cascade,
  assignment_student_id uuid not null
    references public.exam_assignment_students(id) on delete cascade,
  passage_id uuid not null references public.exam_passages(id) on delete cascade,
  stage_number integer not null default 2 check (stage_number = 2),
  answers jsonb not null default '{}'::jsonb,
  correct_blank_ids uuid[] not null default '{}',
  incorrect_blank_ids uuid[] not null default '{}',
  completed_blank_ids uuid[] not null default '{}',
  attempt_count integer not null default 0,
  hint_used_blank_ids uuid[] not null default '{}',
  revealed_answer_blank_ids uuid[] not null default '{}',
  score numeric(5, 2) not null default 0,
  progress_percent numeric(5, 2) not null default 0,
  revision integer not null default 0,
  started_at timestamptz not null default now(),
  last_attempt_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (assignment_student_id, stage_number)
);

create index if not exists exam_stage2_progress_as_idx
  on public.exam_stage2_progress(assignment_student_id);
create index if not exists exam_stage2_progress_academy_idx
  on public.exam_stage2_progress(academy_id);

alter table public.exam_stage2_progress enable row level security;

drop policy if exists "exam_stage2_progress staff" on public.exam_stage2_progress;
create policy "exam_stage2_progress staff"
  on public.exam_stage2_progress for all
  using (public.exam_prep_staff_same_academy(academy_id))
  with check (public.exam_prep_staff_same_academy(academy_id));

drop policy if exists "exam_stage2_progress student select" on public.exam_stage2_progress;
create policy "exam_stage2_progress student select"
  on public.exam_stage2_progress for select
  using (
    exists (
      select 1 from public.exam_assignment_students eas
      where eas.id = exam_stage2_progress.assignment_student_id
        and eas.student_id = auth.uid()
    )
  );

drop policy if exists "exam_stage2_progress student insert" on public.exam_stage2_progress;
create policy "exam_stage2_progress student insert"
  on public.exam_stage2_progress for insert
  with check (
    exists (
      select 1 from public.exam_assignment_students eas
      where eas.id = exam_stage2_progress.assignment_student_id
        and eas.student_id = auth.uid()
    )
  );

drop policy if exists "exam_stage2_progress student update" on public.exam_stage2_progress;
create policy "exam_stage2_progress student update"
  on public.exam_stage2_progress for update
  using (
    exists (
      select 1 from public.exam_assignment_students eas
      where eas.id = exam_stage2_progress.assignment_student_id
        and eas.student_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.exam_assignment_students eas
      where eas.id = exam_stage2_progress.assignment_student_id
        and eas.student_id = auth.uid()
    )
  );
