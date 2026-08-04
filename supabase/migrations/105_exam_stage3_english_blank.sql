-- 내신대비 3단계 「영문 빈칸 완성하기」
-- 2단계 빈칸·진도 테이블을 확장 재사용 (중복 테이블 생성 없음)

-- ---------------------------------------------------------------------------
-- exam_passages: 3단계 공개
-- ---------------------------------------------------------------------------
alter table public.exam_passages
  add column if not exists stage3_published boolean not null default false;

comment on column public.exam_passages.stage3_published is
  '3단계 영문 빈칸 공개 여부';

-- ---------------------------------------------------------------------------
-- exam_korean_blanks → exam_stage_blanks (단계·언어 확장)
-- ---------------------------------------------------------------------------
do $$
begin
  if exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'exam_korean_blanks'
  ) and not exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'exam_stage_blanks'
  ) then
    alter table public.exam_korean_blanks rename to exam_stage_blanks;
  end if;
end $$;

-- 기존 제약/정책 이름 정리 (존재 시)
alter table public.exam_stage_blanks
  drop constraint if exists exam_korean_blanks_range_chk;
alter table public.exam_stage_blanks
  drop constraint if exists exam_korean_blanks_answer_chk;

alter table public.exam_stage_blanks
  add column if not exists stage_number integer not null default 2,
  add column if not exists target_language text not null default 'ko',
  add column if not exists english_start integer,
  add column if not exists english_end integer,
  add column if not exists selected_text text,
  add column if not exists case_sensitive boolean not null default false,
  add column if not exists ignore_extra_spaces boolean not null default true,
  add column if not exists linked_korean_text text,
  add column if not exists linked_korean_start integer,
  add column if not exists linked_korean_end integer,
  add column if not exists created_by uuid;

-- korean 범위는 2단계용 — 3단계에서는 null 허용
alter table public.exam_stage_blanks
  alter column korean_start drop not null;
alter table public.exam_stage_blanks
  alter column korean_end drop not null;

update public.exam_stage_blanks
set
  stage_number = 2,
  target_language = 'ko',
  selected_text = coalesce(selected_text, answer_text),
  ignore_extra_spaces = coalesce(ignore_extra_spaces, flexible_spacing)
where stage_number = 2 or stage_number is null;

alter table public.exam_stage_blanks
  drop constraint if exists exam_stage_blanks_stage_chk;
alter table public.exam_stage_blanks
  add constraint exam_stage_blanks_stage_chk
  check (stage_number in (2, 3));

alter table public.exam_stage_blanks
  drop constraint if exists exam_stage_blanks_lang_chk;
alter table public.exam_stage_blanks
  add constraint exam_stage_blanks_lang_chk
  check (target_language in ('ko', 'en'));

alter table public.exam_stage_blanks
  drop constraint if exists exam_stage_blanks_answer_chk;
alter table public.exam_stage_blanks
  add constraint exam_stage_blanks_answer_chk
  check (length(trim(answer_text)) > 0);

alter table public.exam_stage_blanks
  drop constraint if exists exam_stage_blanks_range_chk;
alter table public.exam_stage_blanks
  add constraint exam_stage_blanks_range_chk check (
    (
      target_language = 'ko'
      and korean_start is not null
      and korean_end is not null
      and korean_start >= 0
      and korean_end > korean_start
    )
    or (
      target_language = 'en'
      and english_start is not null
      and english_end is not null
      and english_start >= 0
      and english_end > english_start
    )
  );

create index if not exists exam_stage_blanks_passage_stage_idx
  on public.exam_stage_blanks(passage_id, stage_number, blank_order);
create index if not exists exam_stage_blanks_sentence_stage_idx
  on public.exam_stage_blanks(sentence_id, stage_number, blank_order);

drop policy if exists "exam_korean_blanks staff" on public.exam_stage_blanks;
drop policy if exists "exam_stage_blanks staff" on public.exam_stage_blanks;
create policy "exam_stage_blanks staff"
  on public.exam_stage_blanks for all
  using (public.exam_prep_staff_same_academy(academy_id))
  with check (public.exam_prep_staff_same_academy(academy_id));

-- ---------------------------------------------------------------------------
-- exam_stage2_progress: stage 2·3 공용 (체크만 완화)
-- ---------------------------------------------------------------------------
alter table public.exam_stage2_progress
  drop constraint if exists exam_stage2_progress_stage_number_check;

alter table public.exam_stage2_progress
  drop constraint if exists exam_stage2_progress_stage_number_check1;

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
  check (stage_number in (2, 3));

comment on table public.exam_stage2_progress is
  '내신대비 빈칸 단계(2·3) 학생 진도. stage_number로 구분';
