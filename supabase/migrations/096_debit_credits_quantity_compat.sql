-- Add p_quantity overload of debit_academy_credits (093 may not have been applied).
-- Does NOT change feature_pricing.

create or replace function public.debit_academy_credits(
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
    coalesce(p_note, null),
    coalesce(p_metadata, '{}'::jsonb) || jsonb_build_object(
      'quantity', v_qty,
      'unit_cost', v_unit
    )
  )
  returning * into v_row;

  return v_row;
end;
$$;

revoke all on function public.debit_academy_credits(uuid, text, uuid, text, jsonb, text, integer) from public;
grant execute on function public.debit_academy_credits(uuid, text, uuid, text, jsonb, text, integer) to service_role;
