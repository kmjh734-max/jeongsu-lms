-- 내신대비 9단계 「문단 배열하기」
-- exam_stage_blanks / exam_stage2_progress 재사용

alter table public.exam_passages
  add column if not exists stage9_published boolean not null default false,
  add column if not exists stage9_content_version integer not null default 1,
  add column if not exists stage9_fixed_prefix text not null default '',
  add column if not exists stage9_fixed_suffix text not null default '',
  add column if not exists stage9_answer_mode text not null default 'label_sequence',
  add column if not exists stage9_structure_hint text;

comment on column public.exam_passages.stage9_published is
  '9단계 문단 배열하기 공개 여부';
comment on column public.exam_passages.stage9_content_version is
  '9단계 문단 블록 구성 버전';
comment on column public.exam_passages.stage9_fixed_prefix is
  '9단계 고정 도입부 (원문 기반 텍스트)';
comment on column public.exam_passages.stage9_fixed_suffix is
  '9단계 고정 마무리';
comment on column public.exam_passages.stage9_answer_mode is
  'label_sequence | drag_blocks';

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'exam_passages_stage9_mode_chk'
  ) then
    alter table public.exam_passages
      add constraint exam_passages_stage9_mode_chk
      check (stage9_answer_mode in ('label_sequence', 'drag_blocks'));
  end if;
end $$;

alter table public.exam_stage_blanks
  add column if not exists sentence_ids jsonb not null default '[]'::jsonb,
  add column if not exists display_label text,
  add column if not exists teacher_role text,
  add column if not exists cohesion_clues jsonb not null default '[]'::jsonb;

comment on column public.exam_stage_blanks.sentence_ids is
  '9단계 문단 블록에 포함된 문장 id 배열 (원문 연속)';
comment on column public.exam_stage_blanks.display_label is
  '9단계 학생 표시 라벨 (A/B/C). blank_order는 정답 순서';
comment on column public.exam_stage_blanks.teacher_role is
  '9단계 문단 역할 (학생 비공개)';
comment on column public.exam_stage_blanks.cohesion_clues is
  '9단계 연결 단서 [{text,type,explanation}]';

alter table public.exam_stage_blanks
  drop constraint if exists exam_stage_blanks_stage_chk;
alter table public.exam_stage_blanks
  add constraint exam_stage_blanks_stage_chk
  check (stage_number in (2, 3, 5, 6, 7, 8, 9));

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
  check (stage_number in (2, 3, 4, 5, 6, 7, 8, 9));

comment on table public.exam_stage2_progress is
  '내신대비 단계(2~9) 학생 진도. stage_number로 구분';
