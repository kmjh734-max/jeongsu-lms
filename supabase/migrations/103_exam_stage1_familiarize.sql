-- 내신대비 1단계 「지문 익히기」 확장
-- 기존 exam_prep 테이블 재사용, intensive_* 중복 생성 없음

-- ---------------------------------------------------------------------------
-- exam_passages: 메타데이터 보강
-- ---------------------------------------------------------------------------
alter table public.exam_passages
  add column if not exists school_level text,
  add column if not exists source text,
  add column if not exists exam_name text,
  add column if not exists exam_year integer,
  add column if not exists exam_month integer;

comment on column public.exam_passages.school_level is '학교급: 중학교|고등학교 등';
comment on column public.exam_passages.source is '출처 (교육청·출판사 등)';
comment on column public.exam_passages.exam_name is '시험명';
comment on column public.exam_passages.exam_year is '시험 연도';
comment on column public.exam_passages.exam_month is '시험 월 (1-12)';

-- ---------------------------------------------------------------------------
-- exam_passage_sentences: 문단·메모·어휘강조(vocabulary jsonb 확장 사용)
-- ---------------------------------------------------------------------------
alter table public.exam_passage_sentences
  add column if not exists paragraph_number integer not null default 1,
  add column if not exists is_paragraph_start boolean not null default false,
  add column if not exists teacher_note text,
  add column if not exists student_note text;

comment on column public.exam_passage_sentences.vocabulary is
  'VocabMark[]: {id, englishText, koreanText, englishOccurrence?, koreanOccurrence?, styleKey, meaning?, memo?}';

-- ---------------------------------------------------------------------------
-- exam_stage1_progress: 문장별 확인·1단계 완료 (문제풀이 아님)
-- ---------------------------------------------------------------------------
create table if not exists public.exam_stage1_progress (
  id uuid primary key default gen_random_uuid(),
  academy_id uuid not null references public.academies(id) on delete cascade,
  assignment_student_id uuid not null
    references public.exam_assignment_students(id) on delete cascade,
  passage_id uuid not null references public.exam_passages(id) on delete cascade,
  stage_number integer not null default 1 check (stage_number = 1),
  completed_sentence_ids uuid[] not null default '{}',
  last_viewed_sentence_id uuid
    references public.exam_passage_sentences(id) on delete set null,
  progress_percent numeric(5, 2) not null default 0,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (assignment_student_id, stage_number)
);

create index if not exists exam_stage1_progress_as_idx
  on public.exam_stage1_progress(assignment_student_id);
create index if not exists exam_stage1_progress_academy_idx
  on public.exam_stage1_progress(academy_id);
create index if not exists exam_stage1_progress_passage_idx
  on public.exam_stage1_progress(passage_id);

alter table public.exam_stage1_progress enable row level security;

drop policy if exists "exam_stage1_progress staff" on public.exam_stage1_progress;
create policy "exam_stage1_progress staff"
  on public.exam_stage1_progress for all
  using (public.exam_prep_staff_same_academy(academy_id))
  with check (public.exam_prep_staff_same_academy(academy_id));

drop policy if exists "exam_stage1_progress student select" on public.exam_stage1_progress;
create policy "exam_stage1_progress student select"
  on public.exam_stage1_progress for select
  using (
    exists (
      select 1 from public.exam_assignment_students eas
      where eas.id = exam_stage1_progress.assignment_student_id
        and eas.student_id = auth.uid()
    )
  );

drop policy if exists "exam_stage1_progress student insert" on public.exam_stage1_progress;
create policy "exam_stage1_progress student insert"
  on public.exam_stage1_progress for insert
  with check (
    exists (
      select 1 from public.exam_assignment_students eas
      where eas.id = exam_stage1_progress.assignment_student_id
        and eas.student_id = auth.uid()
    )
  );

drop policy if exists "exam_stage1_progress student update" on public.exam_stage1_progress;
create policy "exam_stage1_progress student update"
  on public.exam_stage1_progress for update
  using (
    exists (
      select 1 from public.exam_assignment_students eas
      where eas.id = exam_stage1_progress.assignment_student_id
        and eas.student_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.exam_assignment_students eas
      where eas.id = exam_stage1_progress.assignment_student_id
        and eas.student_id = auth.uid()
    )
  );
