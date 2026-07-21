-- Academy credits: wallets, ledger, feature pricing, RPCs, wallet trigger
-- Safe to re-run partially (IF NOT EXISTS / DROP IF EXISTS patterns)

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------
create table if not exists public.academy_wallets (
  academy_id uuid primary key references public.academies(id) on delete cascade,
  balance integer not null default 0 check (balance >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.credit_transactions (
  id uuid primary key default gen_random_uuid(),
  academy_id uuid not null references public.academies(id) on delete cascade,
  type text not null check (type in ('grant', 'debit', 'adjust', 'refund')),
  amount integer not null check (amount > 0),
  balance_after integer not null check (balance_after >= 0),
  feature_key text,
  idempotency_key text not null,
  actor_id uuid references public.profiles(id) on delete set null,
  note text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (academy_id, idempotency_key)
);

create index if not exists credit_transactions_academy_created_idx
  on public.credit_transactions (academy_id, created_at desc);

create index if not exists credit_transactions_feature_idx
  on public.credit_transactions (academy_id, feature_key, created_at desc);

create table if not exists public.feature_pricing (
  feature_key text primary key,
  label text not null,
  credit_cost integer not null default 0 check (credit_cost >= 0),
  billing_type text not null default 'per_use'
    check (billing_type in ('per_use', 'monthly_seat')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Seed wallets for existing academies
-- ---------------------------------------------------------------------------
insert into public.academy_wallets (academy_id, balance)
select a.id, 0
from public.academies a
on conflict (academy_id) do nothing;

-- ---------------------------------------------------------------------------
-- Auto-create wallet when academy is created
-- ---------------------------------------------------------------------------
create or replace function public.create_academy_wallet()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.academy_wallets (academy_id, balance)
  values (new.id, 0)
  on conflict (academy_id) do nothing;
  return new;
end;
$$;

drop trigger if exists academies_create_wallet on public.academies;
create trigger academies_create_wallet
  after insert on public.academies
  for each row
  execute function public.create_academy_wallet();

-- ---------------------------------------------------------------------------
-- Feature pricing seeds
-- ---------------------------------------------------------------------------
insert into public.feature_pricing (feature_key, label, credit_cost, billing_type, is_active)
values
  ('qg_generate_job', 'AI 변형문제 생성', 30, 'per_use', true),
  ('listening_generate_questions', '듣기 문항 AI 생성', 20, 'per_use', true),
  ('listening_generate_audio', '듣기 음성(TTS) 생성', 15, 'per_use', true),
  ('vocab_generate_examples', '단어 예문 AI 생성', 5, 'per_use', true),
  ('vocab_extract_passage', '지문→단어 추출', 8, 'per_use', true),
  ('vocab_grade_meaning', '단어 뜻 AI 채점', 1, 'per_use', true),
  ('student_record_analyze', '학생부 AI 분석', 40, 'per_use', true),
  ('report_ai_draft', '학습 리포트 AI 초안', 10, 'per_use', true),
  ('vocab_student_monthly', '단어학습 학생 월간 이용', 50, 'monthly_seat', true),
  ('listening_student_monthly', '듣기학습 학생 월간 이용', 50, 'monthly_seat', true)
on conflict (feature_key) do update set
  label = excluded.label,
  credit_cost = excluded.credit_cost,
  billing_type = excluded.billing_type,
  updated_at = now();

-- ---------------------------------------------------------------------------
-- RPC: grant (super_admin)
-- ---------------------------------------------------------------------------
create or replace function public.grant_academy_credits(
  p_academy_id uuid,
  p_amount integer,
  p_actor_id uuid,
  p_note text,
  p_idempotency_key text
)
returns public.credit_transactions
language plpgsql
security definer
set search_path = public
as $$
declare
  v_balance integer;
  v_existing public.credit_transactions;
  v_row public.credit_transactions;
begin
  if p_amount is null or p_amount <= 0 then
    raise exception 'invalid_amount';
  end if;
  if p_idempotency_key is null or length(trim(p_idempotency_key)) = 0 then
    raise exception 'idempotency_required';
  end if;
  -- 권한은 Next.js(service role)에서 세션 검증 후 호출

  select * into v_existing
  from public.credit_transactions
  where academy_id = p_academy_id
    and idempotency_key = p_idempotency_key;
  if found then
    return v_existing;
  end if;

  insert into public.academy_wallets (academy_id, balance)
  values (p_academy_id, 0)
  on conflict (academy_id) do nothing;

  select balance into v_balance
  from public.academy_wallets
  where academy_id = p_academy_id
  for update;

  if v_balance is null then
    raise exception 'wallet_not_found';
  end if;

  v_balance := v_balance + p_amount;

  update public.academy_wallets
  set balance = v_balance, updated_at = now()
  where academy_id = p_academy_id;

  insert into public.credit_transactions (
    academy_id, type, amount, balance_after, feature_key,
    idempotency_key, actor_id, note, metadata
  )
  values (
    p_academy_id, 'grant', p_amount, v_balance, null,
    p_idempotency_key, p_actor_id, nullif(trim(coalesce(p_note, '')), ''),
    '{}'::jsonb
  )
  returning * into v_row;

  return v_row;
exception
  when unique_violation then
    select * into v_existing
    from public.credit_transactions
    where academy_id = p_academy_id
      and idempotency_key = p_idempotency_key;
    return v_existing;
end;
$$;

-- ---------------------------------------------------------------------------
-- RPC: adjust (super_admin) — positive amount + direction grant|debit
-- ---------------------------------------------------------------------------
create or replace function public.adjust_academy_credits(
  p_academy_id uuid,
  p_amount integer,
  p_direction text,
  p_actor_id uuid,
  p_note text,
  p_idempotency_key text
)
returns public.credit_transactions
language plpgsql
security definer
set search_path = public
as $$
declare
  v_balance integer;
  v_existing public.credit_transactions;
  v_row public.credit_transactions;
  v_type text;
begin
  if p_amount is null or p_amount <= 0 then
    raise exception 'invalid_amount';
  end if;
  if p_direction not in ('grant', 'debit') then
    raise exception 'invalid_direction';
  end if;
  if p_idempotency_key is null or length(trim(p_idempotency_key)) = 0 then
    raise exception 'idempotency_required';
  end if;
  -- 권한은 Next.js(service role)에서 세션 검증 후 호출

  select * into v_existing
  from public.credit_transactions
  where academy_id = p_academy_id
    and idempotency_key = p_idempotency_key;
  if found then
    return v_existing;
  end if;

  insert into public.academy_wallets (academy_id, balance)
  values (p_academy_id, 0)
  on conflict (academy_id) do nothing;

  select balance into v_balance
  from public.academy_wallets
  where academy_id = p_academy_id
  for update;

  if v_balance is null then
    raise exception 'wallet_not_found';
  end if;

  if p_direction = 'grant' then
    v_balance := v_balance + p_amount;
    v_type := 'adjust';
  else
    if v_balance < p_amount then
      raise exception 'insufficient_credits';
    end if;
    v_balance := v_balance - p_amount;
    v_type := 'adjust';
  end if;

  update public.academy_wallets
  set balance = v_balance, updated_at = now()
  where academy_id = p_academy_id;

  insert into public.credit_transactions (
    academy_id, type, amount, balance_after, feature_key,
    idempotency_key, actor_id, note, metadata
  )
  values (
    p_academy_id, v_type, p_amount, v_balance, null,
    p_idempotency_key, p_actor_id,
    coalesce(nullif(trim(coalesce(p_note, '')), ''), p_direction),
    jsonb_build_object('direction', p_direction)
  )
  returning * into v_row;

  return v_row;
exception
  when unique_violation then
    select * into v_existing
    from public.credit_transactions
    where academy_id = p_academy_id
      and idempotency_key = p_idempotency_key;
    return v_existing;
end;
$$;

-- ---------------------------------------------------------------------------
-- RPC: debit by feature (service role / authenticated staff via server)
-- Called with service role from Next.js after session checks.
-- ---------------------------------------------------------------------------
create or replace function public.debit_academy_credits(
  p_academy_id uuid,
  p_feature_key text,
  p_actor_id uuid,
  p_idempotency_key text,
  p_metadata jsonb default '{}'::jsonb,
  p_note text default null
)
returns public.credit_transactions
language plpgsql
security definer
set search_path = public
as $$
declare
  v_cost integer;
  v_active boolean;
  v_balance integer;
  v_existing public.credit_transactions;
  v_row public.credit_transactions;
begin
  if p_idempotency_key is null or length(trim(p_idempotency_key)) = 0 then
    raise exception 'idempotency_required';
  end if;

  select * into v_existing
  from public.credit_transactions
  where academy_id = p_academy_id
    and idempotency_key = p_idempotency_key;
  if found then
    return v_existing;
  end if;

  select credit_cost, is_active into v_cost, v_active
  from public.feature_pricing
  where feature_key = p_feature_key;

  if v_cost is null then
    raise exception 'unknown_feature';
  end if;

  if v_active is not true then
    raise exception 'feature_inactive';
  end if;

  -- 무료 기능: 원장에 0원 거래는 남기지 않고 no-op 성공을 위해
  -- 잔액 변경 없이 가상 행을 만들지 않음 → 호출측에서 cost=0 스킵 권장.
  if v_cost = 0 then
    raise exception 'zero_cost';
  end if;

  insert into public.academy_wallets (academy_id, balance)
  values (p_academy_id, 0)
  on conflict (academy_id) do nothing;

  select balance into v_balance
  from public.academy_wallets
  where academy_id = p_academy_id
  for update;

  if v_balance is null then
    raise exception 'wallet_not_found';
  end if;

  if v_balance < v_cost then
    raise exception 'insufficient_credits';
  end if;

  v_balance := v_balance - v_cost;

  update public.academy_wallets
  set balance = v_balance, updated_at = now()
  where academy_id = p_academy_id;

  insert into public.credit_transactions (
    academy_id, type, amount, balance_after, feature_key,
    idempotency_key, actor_id, note, metadata
  )
  values (
    p_academy_id, 'debit', v_cost, v_balance, p_feature_key,
    p_idempotency_key, p_actor_id,
    nullif(trim(coalesce(p_note, '')), ''),
    coalesce(p_metadata, '{}'::jsonb)
  )
  returning * into v_row;

  return v_row;
exception
  when unique_violation then
    select * into v_existing
    from public.credit_transactions
    where academy_id = p_academy_id
      and idempotency_key = p_idempotency_key;
    return v_existing;
end;
$$;

-- Grant execute to authenticated (RLS still applies on tables;
-- SECURITY DEFINER bypasses RLS inside function — callers must be gated in app.
-- Restrict: only service role should call debit from server. Revoke from public.)
revoke all on function public.grant_academy_credits(uuid, integer, uuid, text, text) from public;
revoke all on function public.adjust_academy_credits(uuid, integer, text, uuid, text, text) from public;
revoke all on function public.debit_academy_credits(uuid, text, uuid, text, jsonb, text) from public;

grant execute on function public.grant_academy_credits(uuid, integer, uuid, text, text) to service_role;
grant execute on function public.adjust_academy_credits(uuid, integer, text, uuid, text, text) to service_role;
grant execute on function public.debit_academy_credits(uuid, text, uuid, text, jsonb, text) to service_role;

-- Also allow authenticated super_admin path via service role only from Next.js.
-- (No grant to authenticated — app uses service role after session check.)

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.academy_wallets enable row level security;
alter table public.credit_transactions enable row level security;
alter table public.feature_pricing enable row level security;

drop policy if exists "Super admins manage wallets" on public.academy_wallets;
create policy "Super admins manage wallets"
  on public.academy_wallets for all
  using (public.is_super_admin())
  with check (public.is_super_admin());

drop policy if exists "Staff read own wallet" on public.academy_wallets;
create policy "Staff read own wallet"
  on public.academy_wallets for select
  using (
    public.is_super_admin()
    or (
      public.current_user_academy_id() is not null
      and academy_id = public.current_user_academy_id()
      and public.current_user_role() in ('admin', 'teacher')
    )
  );

drop policy if exists "Super admins manage credit_transactions" on public.credit_transactions;
create policy "Super admins manage credit_transactions"
  on public.credit_transactions for all
  using (public.is_super_admin())
  with check (public.is_super_admin());

drop policy if exists "Staff read own credit_transactions" on public.credit_transactions;
create policy "Staff read own credit_transactions"
  on public.credit_transactions for select
  using (
    public.is_super_admin()
    or (
      public.current_user_academy_id() is not null
      and academy_id = public.current_user_academy_id()
      and public.current_user_role() in ('admin', 'teacher')
    )
  );

drop policy if exists "Super admins manage feature_pricing" on public.feature_pricing;
create policy "Super admins manage feature_pricing"
  on public.feature_pricing for all
  using (public.is_super_admin())
  with check (public.is_super_admin());

drop policy if exists "Staff read feature_pricing" on public.feature_pricing;
create policy "Staff read feature_pricing"
  on public.feature_pricing for select
  using (
    public.is_super_admin()
    or public.current_user_role() in ('admin', 'teacher')
  );
