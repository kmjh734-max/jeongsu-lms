-- 듣기 세트는 생성 즉시 공개. 공개/비공개 토글 제거에 맞춤.
update public.listening_sets
set is_published = true
where is_published = false;

alter table public.listening_sets
  alter column is_published set default true;

comment on column public.listening_sets.is_published is
  '항상 true (생성 시 공개). UI 토글 없음 — RLS 호환용으로 컬럼 유지';
