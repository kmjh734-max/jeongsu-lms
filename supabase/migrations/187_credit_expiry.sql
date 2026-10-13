-- 크레딧 유효기간: 결제시점으로부터 1년 (토스 충전업종 심사 조건, 2026-10-13)
--
-- 지갑은 잔액 하나뿐이라 「1년 지난 분량」을 먼저 들어온 크레딧부터 쓴 것으로(선입선출) 계산한다.
--   1년 전보다 먼저 들어온 크레딧 합 − 지금까지 나간 크레딧 합(사용·결제 취소·차감 조정·지난 소멸)
-- 이 값이 0보다 크면 그만큼(잔액 안에서) 소멸시킨다. 소멸은 차감 조정으로 남겨 내역 화면에
-- 「유효기간(1년) 지난 크레딧 소멸」로 보인다. 같은 날 두 번 불려도 한 번만 남는다.
-- 앱이 크레딧 화면을 열 때와 크레딧을 차감하기 전에 그 학원 것만 부른다.

create or replace function public.expire_academy_credits(
  p_academy_id uuid,
  p_now timestamptz default now()
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_cutoff timestamptz := p_now - interval '1 year';
  v_in_old bigint;
  v_out_all bigint;
  v_balance integer;
  v_amount integer;
  v_idem text := 'expire:' || to_char(p_now at time zone 'Asia/Seoul', 'YYYY-MM-DD');
begin
  select
    coalesce(sum(t.amount) filter (
      where t.created_at < v_cutoff
        and (t.type in ('grant', 'charge')
             or (t.type = 'adjust' and coalesce(t.metadata->>'direction', 'grant') <> 'debit'))
    ), 0),
    coalesce(sum(t.amount) filter (
      where t.type in ('debit', 'refund')
         or (t.type = 'adjust' and t.metadata->>'direction' = 'debit')
    ), 0)
  into v_in_old, v_out_all
  from public.credit_transactions t
  where t.academy_id = p_academy_id;

  if v_in_old - v_out_all <= 0 then
    return 0;
  end if;

  select balance into v_balance
  from public.academy_wallets
  where academy_id = p_academy_id
  for update;

  v_amount := least((v_in_old - v_out_all)::integer, coalesce(v_balance, 0));
  if v_amount <= 0 then
    return 0;
  end if;

  if exists (
    select 1 from public.credit_transactions
    where academy_id = p_academy_id and idempotency_key = v_idem
  ) then
    return 0;
  end if;

  v_balance := v_balance - v_amount;
  update public.academy_wallets
  set balance = v_balance, updated_at = now()
  where academy_id = p_academy_id;

  insert into public.credit_transactions (
    academy_id, type, amount, balance_after, feature_key,
    idempotency_key, actor_id, note, metadata
  )
  values (
    p_academy_id, 'adjust', v_amount, v_balance, null,
    v_idem, null, '유효기간(1년) 지난 크레딧 소멸',
    jsonb_build_object('direction', 'debit', 'reason', 'expire', 'cutoff', v_cutoff)
  );

  return v_amount;
end;
$$;

revoke all on function public.expire_academy_credits(uuid, timestamptz) from public;
grant execute on function public.expire_academy_credits(uuid, timestamptz) to service_role;
