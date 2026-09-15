-- 1) 다 만든 뒤 받는 차감(후불)은 잔액이 모자라도 차감한다(잔액이 마이너스가 될 수 있다).
--    만들기 전 잔액 확인(lessonCreditShortfall)은 그대로라, 잔액이 0 이하이면 새 작업은 시작하지 않는다.
--    같은 잔액으로 동시에 시작한 작업들(지문별 어법·어휘 선택, 변형문제 작업 여러 개)이
--    모두 확인을 통과한 뒤 차감에 실패해 값을 받지 못하던 것을 막는다.
-- 2) 학생부 글자 읽기(OCR) 결과를 파일 묶음마다 잠시 저장해, 다시 시도할 때 같은 쪽을 또 읽지 않는다.
-- 앱 코드는 이 마이그레이션 전에도 돌아간다(없으면 예전 차감으로 되돌아가고, 저장을 건너뛴다).

-- ---------------------------------------------------------------------------
-- 잔액·거래 잔액의 0 이상 제약을 없앤다(이름이 환경마다 다를 수 있어 정의로 찾는다)
-- ---------------------------------------------------------------------------
do $$
declare
  r record;
begin
  for r in
    select c.conname, t.relname
    from pg_constraint c
    join pg_class t on t.oid = c.conrelid
    join pg_namespace n on n.oid = t.relnamespace
    where n.nspname = 'public'
      and c.contype = 'c'
      and (
        (t.relname = 'academy_wallets'
          and pg_get_constraintdef(c.oid) ~ '\(balance >= 0\)')
        or (t.relname = 'credit_transactions'
          and pg_get_constraintdef(c.oid) ~ '\(balance_after >= 0\)')
      )
  loop
    execute format('alter table public.%I drop constraint %I', r.relname, r.conname);
  end loop;
end;
$$;

-- ---------------------------------------------------------------------------
-- RPC: 후불 차감 — debit_academy_credits(096)와 같고 잔액 부족으로 막지 않는다
-- ---------------------------------------------------------------------------
create or replace function public.debit_academy_credits_postpaid(
  p_academy_id uuid,
  p_feature_key text,
  p_actor_id uuid,
  p_idempotency_key text,
  p_metadata jsonb default '{}'::jsonb,
  p_note text default null,
  p_quantity integer default 1
)
returns public.credit_transactions
language plpgsql
security definer
set search_path = public
as $$
declare
  v_unit integer;
  v_active boolean;
  v_qty integer;
  v_cost integer;
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

  select credit_cost, is_active into v_unit, v_active
  from public.feature_pricing
  where feature_key = p_feature_key;

  if v_unit is null then
    raise exception 'unknown_feature';
  end if;

  if v_active is not true then
    raise exception 'feature_inactive';
  end if;

  if v_unit = 0 then
    raise exception 'zero_cost';
  end if;

  v_qty := greatest(1, coalesce(p_quantity, 1));
  v_cost := v_unit * v_qty;

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

  -- 잔액 부족 검사 없음: 이미 만든 결과의 값이다
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
    coalesce(p_metadata, '{}'::jsonb) || jsonb_build_object(
      'quantity', v_qty,
      'unit_cost', v_unit,
      'postpaid', true
    )
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

revoke all on function public.debit_academy_credits_postpaid(uuid, text, uuid, text, jsonb, text, integer) from public;
revoke all on function public.debit_academy_credits_postpaid(uuid, text, uuid, text, jsonb, text, integer) from anon, authenticated;
grant execute on function public.debit_academy_credits_postpaid(uuid, text, uuid, text, jsonb, text, integer) to service_role;

-- ---------------------------------------------------------------------------
-- 학생부 OCR 결과 임시 저장 (API에서 service role로만 접근, 며칠 지나면 코드가 지운다)
-- ---------------------------------------------------------------------------
create table if not exists public.student_record_ocr_cache (
  cache_key text primary key,
  academy_id uuid references public.academies(id) on delete cascade,
  text text not null,
  created_at timestamptz not null default now()
);

create index if not exists student_record_ocr_cache_created_at_idx
  on public.student_record_ocr_cache (created_at);

alter table public.student_record_ocr_cache enable row level security;
-- 정책 없음: 선생님 계정으로는 읽고 쓸 수 없고 서버(service role)만 쓴다.

notify pgrst, 'reload schema';
