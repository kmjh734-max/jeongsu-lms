-- 변형문제 보기 단어장: 중등/고등 수준 구분

alter table public.vocab_sets
  add column if not exists school_band text;

alter table public.vocab_sets
  drop constraint if exists vocab_sets_school_band_check;

alter table public.vocab_sets
  add constraint vocab_sets_school_band_check
  check (school_band is null or school_band in ('중등', '고등'));

comment on column public.vocab_sets.school_band is
  '레거시. 보기 단어는 중3·≈1000L+ 단일 기준으로 정리';

create index if not exists vocab_sets_school_band_idx
  on public.vocab_sets(school_band)
  where school_band is not null;
