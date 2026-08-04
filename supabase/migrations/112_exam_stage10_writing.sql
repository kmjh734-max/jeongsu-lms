-- 내신대비 10단계 「영작 연습하기」
-- exam_stage_blanks / exam_stage2_progress 재사용

alter table public.exam_passages
  add column if not exists stage10_published boolean not null default false,
  add column if not exists stage10_content_version integer not null default 1;

comment on column public.exam_passages.stage10_published is
  '10단계 영작 연습하기 공개 여부';
comment on column public.exam_passages.stage10_content_version is
  '10단계 영작 문항 구성 버전';

alter table public.exam_stage_blanks
  add column if not exists writing_segments jsonb not null default '[]'::jsonb,
  add column if not exists writing_cues jsonb not null default '[]'::jsonb,
  add column if not exists writing_input_mode text not null default 'guided_segments',
  add column if not exists writing_blank_display_mode text not null default 'token_slots';

comment on column public.exam_stage_blanks.writing_segments is
  '10단계 세그먼트 [{id,segmentOrder,segmentType,fixedText,originalAnswerText,answerTokens,...}]';
comment on column public.exam_stage_blanks.writing_cues is
  '10단계 제시어 [{id,cueOrder,cueText,linkedSegmentId,linkedAnswerText}]';
comment on column public.exam_stage_blanks.writing_input_mode is
  'guided_segments | full_sentence';
comment on column public.exam_stage_blanks.writing_blank_display_mode is
  'token_slots | phrase_input';

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'exam_stage_blanks_wmode_chk'
  ) then
    alter table public.exam_stage_blanks
      add constraint exam_stage_blanks_wmode_chk
      check (writing_input_mode in ('guided_segments', 'full_sentence'));
  end if;
  if not exists (
    select 1 from pg_constraint where conname = 'exam_stage_blanks_wdisp_chk'
  ) then
    alter table public.exam_stage_blanks
      add constraint exam_stage_blanks_wdisp_chk
      check (writing_blank_display_mode in ('token_slots', 'phrase_input'));
  end if;
end $$;

alter table public.exam_stage_blanks
  drop constraint if exists exam_stage_blanks_stage_chk;
alter table public.exam_stage_blanks
  add constraint exam_stage_blanks_stage_chk
  check (stage_number in (2, 3, 5, 6, 7, 8, 9, 10));

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
  check (stage_number in (2, 3, 4, 5, 6, 7, 8, 9, 10));

comment on table public.exam_stage2_progress is
  '내신대비 단계(2~10) 학생 진도. stage_number로 구분';
