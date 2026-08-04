-- 내신대비 4단계 「해석 연습하기」
-- 문장 원문/해석은 exam_passage_sentences 재사용. 빈칸 테이블은 사용하지 않음.

alter table public.exam_passages
  add column if not exists stage4_published boolean not null default false;

comment on column public.exam_passages.stage4_published is
  '4단계 해석 연습 공개 여부';

-- ---------------------------------------------------------------------------
-- 문장별 4단계 채점 설정 (모범해석 본문은 기본적으로 sentences.korean_text 참조)
-- ---------------------------------------------------------------------------
create table if not exists public.exam_stage_translation_settings (
  id uuid primary key default gen_random_uuid(),
  academy_id uuid not null references public.academies(id) on delete cascade,
  passage_id uuid not null references public.exam_passages(id) on delete cascade,
  sentence_id uuid not null references public.exam_passage_sentences(id) on delete cascade,
  stage_number integer not null default 4 check (stage_number = 4),
  override_model_translation text,
  key_meaning_points jsonb not null default '[]'::jsonb,
  accepted_expressions text[] not null default '{}',
  common_errors text[] not null default '{}',
  teacher_explanation text,
  max_score integer not null default 100 check (max_score > 0),
  minimum_pass_score integer not null default 70 check (minimum_pass_score >= 0),
  grading_mode text not null default 'ai_assisted'
    check (grading_mode in ('ai_assisted', 'manual_only', 'exact_optional')),
  manual_review_required boolean not null default false,
  is_required boolean not null default true,
  created_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (passage_id, sentence_id, stage_number)
);

create index if not exists exam_stage_translation_settings_passage_idx
  on public.exam_stage_translation_settings(passage_id);
create index if not exists exam_stage_translation_settings_academy_idx
  on public.exam_stage_translation_settings(academy_id);

alter table public.exam_stage_translation_settings enable row level security;

drop policy if exists "exam_stage_translation_settings staff" on public.exam_stage_translation_settings;
create policy "exam_stage_translation_settings staff"
  on public.exam_stage_translation_settings for all
  using (public.exam_prep_staff_same_academy(academy_id))
  with check (public.exam_prep_staff_same_academy(academy_id));

-- 학생은 설정(모범·의미요소) 직접 select 불가

-- ---------------------------------------------------------------------------
-- 4단계 시도 이력
-- ---------------------------------------------------------------------------
create table if not exists public.exam_stage4_attempts (
  id uuid primary key default gen_random_uuid(),
  academy_id uuid not null references public.academies(id) on delete cascade,
  assignment_student_id uuid not null
    references public.exam_assignment_students(id) on delete cascade,
  passage_id uuid not null references public.exam_passages(id) on delete cascade,
  sentence_id uuid not null references public.exam_passage_sentences(id) on delete cascade,
  attempt_number integer not null default 1,
  answer_text text not null,
  ai_score numeric(5, 2),
  teacher_score numeric(5, 2),
  final_score numeric(5, 2),
  ai_result_json jsonb,
  teacher_feedback text,
  status text not null default 'submitted'
    check (status in (
      'draft', 'submitted', 'grading', 'graded', 'pending_review',
      'teacher_reviewed', 'passed', 'needs_retry', 'error'
    )),
  model_translation_revealed boolean not null default false,
  grading_source text
    check (grading_source is null or grading_source in ('ai', 'teacher', 'ai_then_teacher')),
  submitted_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid,
  created_at timestamptz not null default now(),
  unique (assignment_student_id, sentence_id, attempt_number)
);

create index if not exists exam_stage4_attempts_as_idx
  on public.exam_stage4_attempts(assignment_student_id, sentence_id);
create index if not exists exam_stage4_attempts_status_idx
  on public.exam_stage4_attempts(academy_id, status);

alter table public.exam_stage4_attempts enable row level security;

drop policy if exists "exam_stage4_attempts staff" on public.exam_stage4_attempts;
create policy "exam_stage4_attempts staff"
  on public.exam_stage4_attempts for all
  using (public.exam_prep_staff_same_academy(academy_id))
  with check (public.exam_prep_staff_same_academy(academy_id));

drop policy if exists "exam_stage4_attempts student select" on public.exam_stage4_attempts;
create policy "exam_stage4_attempts student select"
  on public.exam_stage4_attempts for select
  using (
    exists (
      select 1 from public.exam_assignment_students eas
      where eas.id = exam_stage4_attempts.assignment_student_id
        and eas.student_id = auth.uid()
    )
  );

drop policy if exists "exam_stage4_attempts student insert" on public.exam_stage4_attempts;
create policy "exam_stage4_attempts student insert"
  on public.exam_stage4_attempts for insert
  with check (
    exists (
      select 1 from public.exam_assignment_students eas
      where eas.id = exam_stage4_attempts.assignment_student_id
        and eas.student_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- exam_stage2_progress: stage 4 허용
-- ---------------------------------------------------------------------------
do $$
declare
  cname text;
begin
  for cname in
    select conname from pg_constraint
    where conrelid = 'public.exam_stage2_progress'::regclass
      and contype = 'c'
      and pg_get_constraintdef(oid) ilike '%stage_number%'
  loop
    execute format('alter table public.exam_stage2_progress drop constraint %I', cname);
  end loop;
end $$;

alter table public.exam_stage2_progress
  add constraint exam_stage2_progress_stage_number_check
  check (stage_number in (2, 3, 4));

comment on table public.exam_stage2_progress is
  '내신대비 빈칸·해석 단계(2·3·4) 학생 진도. stage_number로 구분';
