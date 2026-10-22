-- 지문분석서 「오류 신고」(선생님 2026-10-22 시안 승인). 분석지 문장에서 틀린 곳을 선생님이 알려 주면 여기에 쌓인다.
-- 세션 시작 점검(scripts/tmp-rv/_session-new-analysis.mts)이 안 본 신고를 띄우고, 확인한 것은 그 분석지를 고치고
-- 코드 검사·채점 문장에 넣는다. 서버 액션이 서비스 키로만 넣고 읽는다(RLS 켜고 정책 없음).

begin;

create table if not exists public.analysis_error_reports (
  id uuid primary key default gen_random_uuid(),
  academy_id uuid not null references public.academies(id) on delete cascade,
  project_id uuid not null references public.lesson_material_projects(id) on delete cascade,
  item_id text,
  sentence_index int not null,
  sentence_text text not null,
  categories text[] not null default '{}',
  memo text not null default '',
  reporter_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  resolved_at timestamptz,
  resolution text
);

create index if not exists analysis_error_reports_open_idx
  on public.analysis_error_reports (created_at) where resolved_at is null;

alter table public.analysis_error_reports enable row level security;

commit;
