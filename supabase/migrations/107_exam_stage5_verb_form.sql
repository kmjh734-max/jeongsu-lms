-- 내신대비 5단계 「동사형 연습하기」
-- exam_stage_blanks / exam_stage2_progress 재사용 (중복 테이블 없음)

alter table public.exam_passages
  add column if not exists stage5_published boolean not null default false;

comment on column public.exam_passages.stage5_published is
  '5단계 동사형 연습 공개 여부';

-- ---------------------------------------------------------------------------
-- exam_stage_blanks: stage 5 + cue_words / grammar_category
-- ---------------------------------------------------------------------------
alter table public.exam_stage_blanks
  add column if not exists cue_words text[] not null default '{}',
  add column if not exists grammar_category text[] not null default '{}';

comment on column public.exam_stage_blanks.cue_words is
  '5단계 괄호 제시어 배열. 예: {have,be,dump}';
comment on column public.exam_stage_blanks.grammar_category is
  '5단계 문법 유형 코드 배열';

alter table public.exam_stage_blanks
  drop constraint if exists exam_stage_blanks_stage_chk;
alter table public.exam_stage_blanks
  add constraint exam_stage_blanks_stage_chk
  check (stage_number in (2, 3, 5));

-- ---------------------------------------------------------------------------
-- exam_stage2_progress: stage 5 허용
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
  check (stage_number in (2, 3, 4, 5));

comment on table public.exam_stage2_progress is
  '내신대비 빈칸·해석·동사형 단계(2·3·4·5) 학생 진도. stage_number로 구분';
