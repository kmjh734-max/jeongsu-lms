-- 모델 호출 사용량 기록.
--
-- 크레딧 내역에는 "얼마를 받았나"만 있고 "얼마가 들었나"가 없었다. 그래서 기능 값이
-- 원가에 맞는지 되짚을 방법이 없었다(2026-09-29 실측은 호출을 가로채 직접 재야 했다).
-- 호출마다 모델·토큰·요청 id를 남겨 둔다. 요청 id가 있으면 나중에 OpenAI 쪽 사용량과
-- 한 줄씩 맞춰 볼 수 있다.
--
-- 슈퍼관리자만 본다. 학원 화면에는 내보내지 않는다.

create table if not exists public.ai_usage_logs (
  id uuid primary key default gen_random_uuid(),
  academy_id uuid references public.academies(id) on delete set null,
  actor_id uuid references public.profiles(id) on delete set null,
  -- feature_pricing.feature_key. 값을 받지 않는 호출(검수·보조)은 null.
  feature_key text,
  -- 어느 화면에서 썼는지 (워크북 / 1장 테스트지 …)
  used_for text,
  model text not null,
  input_tokens int not null default 0,
  cached_input_tokens int not null default 0,
  output_tokens int not null default 0,
  -- OpenAI 응답 헤더의 x-request-id. 저쪽 사용량과 맞춰 볼 때 쓴다.
  request_id text,
  project_id uuid,
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists ai_usage_logs_at_idx on public.ai_usage_logs (created_at desc);
create index if not exists ai_usage_logs_feature_idx on public.ai_usage_logs (feature_key, created_at desc);
create index if not exists ai_usage_logs_academy_idx on public.ai_usage_logs (academy_id, created_at desc);

alter table public.ai_usage_logs enable row level security;

-- 슈퍼관리자만 읽는다. 쓰기는 서버(service role)만 한다.
drop policy if exists "ai_usage_logs read for super admin" on public.ai_usage_logs;
create policy "ai_usage_logs read for super admin"
  on public.ai_usage_logs for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'super_admin'
    )
  );
