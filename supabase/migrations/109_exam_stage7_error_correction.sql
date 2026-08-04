-- 내신대비 7단계 「어색한 곳 찾아 고쳐 쓰기」
-- 원본 english_text는 유지. 출제용은 stage7_display_text + blanks(stage=7)

alter table public.exam_passages
  add column if not exists stage7_published boolean not null default false,
  add column if not exists stage7_required_error_count integer not null default 3
    check (stage7_required_error_count >= 1 and stage7_required_error_count <= 20),
  add column if not exists stage7_content_version integer not null default 1;

comment on column public.exam_passages.stage7_published is
  '7단계 어색한 곳 찾기 공개 여부';
comment on column public.exam_passages.stage7_required_error_count is
  '학생이 찾아야 할 오류 개수';
comment on column public.exam_passages.stage7_content_version is
  '7단계 문제 버전 (후보·표시문 변경 시 증가)';

alter table public.exam_passage_sentences
  add column if not exists stage7_display_text text;

comment on column public.exam_passage_sentences.stage7_display_text is
  '7단계 학생 표시용 문장(의도적 오류 포함). null이면 english_text 사용 금지—공개 전 설정 필요';

alter table public.exam_stage_blanks
  add column if not exists is_error boolean not null default true;

comment on column public.exam_stage_blanks.is_error is
  '7단계: true=오류 후보, false=올바른(distractor) 밑줄 후보';

alter table public.exam_stage_blanks
  drop constraint if exists exam_stage_blanks_stage_chk;
alter table public.exam_stage_blanks
  add constraint exam_stage_blanks_stage_chk
  check (stage_number in (2, 3, 5, 6, 7));

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
  check (stage_number in (2, 3, 4, 5, 6, 7));

comment on table public.exam_stage2_progress is
  '내신대비 단계(2~7) 학생 진도. stage_number로 구분';
