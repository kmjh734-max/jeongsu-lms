-- 내신대비 6단계 「어법·어휘 고르기」
-- exam_stage_blanks / exam_stage2_progress 재사용

alter table public.exam_passages
  add column if not exists stage6_published boolean not null default false;

comment on column public.exam_passages.stage6_published is
  '6단계 어법·어휘 고르기 공개 여부';

alter table public.exam_stage_blanks
  add column if not exists choice_options jsonb not null default '[]'::jsonb,
  add column if not exists question_category text,
  add column if not exists grammar_subcategory text[] not null default '{}',
  add column if not exists vocabulary_subcategory text[] not null default '{}',
  add column if not exists shuffle_options boolean not null default true;

comment on column public.exam_stage_blanks.choice_options is
  '6단계 선택지 [{id,text,isCorrect,explanation?}]';
comment on column public.exam_stage_blanks.question_category is
  'grammar | vocabulary';

alter table public.exam_stage_blanks
  drop constraint if exists exam_stage_blanks_stage_chk;
alter table public.exam_stage_blanks
  add constraint exam_stage_blanks_stage_chk
  check (stage_number in (2, 3, 5, 6));

alter table public.exam_stage_blanks
  drop constraint if exists exam_stage_blanks_qcat_chk;
alter table public.exam_stage_blanks
  add constraint exam_stage_blanks_qcat_chk
  check (
    question_category is null
    or question_category in ('grammar', 'vocabulary')
  );

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
  check (stage_number in (2, 3, 4, 5, 6));

comment on table public.exam_stage2_progress is
  '내신대비 단계(2~6) 학생 진도. stage_number로 구분';
