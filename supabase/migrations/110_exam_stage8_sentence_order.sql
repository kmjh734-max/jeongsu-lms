-- 내신대비 8단계 「순서 배열하기」
-- exam_stage_blanks / exam_stage2_progress 재사용

alter table public.exam_passages
  add column if not exists stage8_published boolean not null default false,
  add column if not exists stage8_content_version integer not null default 1;

comment on column public.exam_passages.stage8_published is
  '8단계 순서 배열하기 공개 여부';
comment on column public.exam_passages.stage8_content_version is
  '8단계 카드 구성 버전';

alter table public.exam_stage_blanks
  add column if not exists reorder_chunks jsonb not null default '[]'::jsonb;

comment on column public.exam_stage_blanks.reorder_chunks is
  '8단계 배열 카드 [{id,chunkOrder,chunkText}]';

alter table public.exam_stage_blanks
  drop constraint if exists exam_stage_blanks_stage_chk;
alter table public.exam_stage_blanks
  add constraint exam_stage_blanks_stage_chk
  check (stage_number in (2, 3, 5, 6, 7, 8));

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
  check (stage_number in (2, 3, 4, 5, 6, 7, 8));

comment on table public.exam_stage2_progress is
  '내신대비 단계(2~8) 학생 진도. stage_number로 구분';
