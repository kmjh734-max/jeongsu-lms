-- Toss Payments credit top-up: packages, orders, charge type, approve/refund RPCs, RLS
-- Does not drop or reset existing wallet/ledger data.

-- ---------------------------------------------------------------------------
-- 1) Ledger: allow type = charge
-- ---------------------------------------------------------------------------
alter table public.credit_transactions
  drop constraint if exists credit_transactions_type_check;

alter table public.credit_transactions
  add constraint credit_transactions_type_check
  check (type in ('grant', 'debit', 'adjust', 'refund', 'charge'));

-- ---------------------------------------------------------------------------
-- 2) credit_packages
-- ---------------------------------------------------------------------------
create table if not exists public.credit_packages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  payment_amount bigint not null check (payment_amount > 0),
  credit_amount bigint not null check (credit_amount > 0),
  bonus_credit bigint not null default 0 check (bonus_credit >= 0),
  is_active boolean not null default true,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists credit_packages_active_order_idx
  on public.credit_packages (is_active, display_order);

-- ---------------------------------------------------------------------------
-- 3) credit_payment_orders
-- ---------------------------------------------------------------------------
create table if not exists public.credit_payment_orders (
  id uuid primary key default gen_random_uuid(),
  academy_id uuid not null references public.academies(id) on delete restrict,
  package_id uuid not null references public.credit_packages(id) on delete restrict,
  order_id text not null unique,
  payment_amount bigint not null check (payment_amount > 0),
  paid_credit bigint not null check (paid_credit > 0),
  bonus_credit bigint not null default 0 check (bonus_credit >= 0),
  total_credit bigint not null check (total_credit > 0),
  status text not null check (status in (
    'ready', 'processing', 'approved', 'failed', 'cancel_pending', 'canceled'
  )),
  payment_key text unique,
  payment_method text,
  receipt_url text,
  requested_by uuid not null references public.profiles(id) on delete restrict,
  requested_at timestamptz not null default now(),
  approved_at timestamptz,
  canceled_at timestamptz,
  failure_code text,
  failure_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint credit_payment_orders_total_check
    check (total_credit = paid_credit + bonus_credit)
);

create index if not exists credit_payment_orders_academy_created_idx
  on public.credit_payment_orders (academy_id, created_at desc);

create index if not exists credit_payment_orders_status_idx
  on public.credit_payment_orders (status);

-- ---------------------------------------------------------------------------
-- 4) Seed packages (larger packs → more bonus)
-- ---------------------------------------------------------------------------
insert into public.credit_packages
  (name, payment_amount, credit_amount, bonus_credit, is_active, display_order)
select * from (values
  ('스타터', 11000::bigint, 10000::bigint, 0::bigint, true, 10),
  ('스탠다드', 33000::bigint, 30000::bigint, 2000::bigint, true, 20),
  ('프로', 55000::bigint, 50000::bigint, 5000::bigint, true, 30),
  ('맥스', 110000::bigint, 100000::bigint, 15000::bigint, true, 40)
) as v(name, payment_amount, credit_amount, bonus_credit, is_active, display_order)
where not exists (select 1 from public.credit_packages limit 1);

-- ---------------------------------------------------------------------------
-- 5) Approve payment + charge credits (idempotent)
-- ---------------------------------------------------------------------------
create or replace function public.approve_credit_payment_order(
  p_order_uuid uuid,
  p_payment_key text,
  p_payment_method text default null,
  p_receipt_url text default null
)
returns public.credit_payment_orders
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order public.credit_payment_orders;
  v_balance integer;
  v_idem text;
  v_has_charge boolean := false;
begin
  if p_payment_key is null or length(trim(p_payment_key)) = 0 then
    raise exception 'payment_key_required';
  end if;

  select * into v_order
  from public.credit_payment_orders
  where id = p_order_uuid
  for update;

  if not found then
    raise exception 'order_not_found';
  end if;

  -- Already approved: return as-is (idempotent)
  if v_order.status = 'approved' then
    if v_order.payment_key is not null
       and v_order.payment_key <> trim(p_payment_key) then
      raise exception 'payment_key_mismatch';
    end if;
    return v_order;
  end if;

  if v_order.status not in ('ready', 'processing') then
    raise exception 'invalid_order_status:%', v_order.status;
  end if;

  -- payment_key unique: another order must not own it
  if exists (
    select 1 from public.credit_payment_orders
    where payment_key = trim(p_payment_key)
      and id <> v_order.id
  ) then
    raise exception 'payment_key_taken';
  end if;

  v_idem := 'toss_charge:' || v_order.order_id;

  select exists (
    select 1
    from public.credit_transactions
    where academy_id = v_order.academy_id
      and idempotency_key = v_idem
  ) into v_has_charge;

  insert into public.academy_wallets (academy_id, balance)
  values (v_order.academy_id, 0)
  on conflict (academy_id) do nothing;

  select balance into v_balance
  from public.academy_wallets
  where academy_id = v_order.academy_id
  for update;

  if v_balance is null then
    raise exception 'wallet_not_found';
  end if;

  if not v_has_charge then
    v_balance := v_balance + v_order.total_credit::integer;

    update public.academy_wallets
    set balance = v_balance, updated_at = now()
    where academy_id = v_order.academy_id;

    insert into public.credit_transactions (
      academy_id, type, amount, balance_after, feature_key,
      idempotency_key, actor_id, note, metadata
    )
    values (
      v_order.academy_id,
      'charge',
      v_order.total_credit::integer,
      v_balance,
      null,
      v_idem,
      v_order.requested_by,
      '토스페이먼츠 충전',
      jsonb_build_object(
        'payment_order_id', v_order.id,
        'order_id', v_order.order_id,
        'payment_key', trim(p_payment_key),
        'paid_credit', v_order.paid_credit,
        'bonus_credit', v_order.bonus_credit,
        'payment_amount', v_order.payment_amount,
        'package_id', v_order.package_id
      )
    );
  end if;

  update public.credit_payment_orders
  set
    status = 'approved',
    payment_key = trim(p_payment_key),
    payment_method = nullif(trim(coalesce(p_payment_method, '')), ''),
    receipt_url = nullif(trim(coalesce(p_receipt_url, '')), ''),
    approved_at = coalesce(approved_at, now()),
    failure_code = null,
    failure_message = null,
    updated_at = now()
  where id = v_order.id
  returning * into v_order;

  return v_order;
exception
  when unique_violation then
    -- concurrent charge txn or payment_key race → re-read approved order
    select * into v_order
    from public.credit_payment_orders
    where id = p_order_uuid;
    if v_order.status = 'approved' then
      return v_order;
    end if;
    raise;
end;
$$;

-- ---------------------------------------------------------------------------
-- 6) Refund (unused credits only) after Toss cancel succeeded
-- ---------------------------------------------------------------------------
create or replace function public.refund_credit_payment_order(
  p_order_uuid uuid,
  p_actor_id uuid,
  p_force boolean default false
)
returns public.credit_payment_orders
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order public.credit_payment_orders;
  v_balance integer;
  v_debit_after integer;
  v_idem text;
  v_existing public.credit_transactions;
begin
  select * into v_order
  from public.credit_payment_orders
  where id = p_order_uuid
  for update;

  if not found then
    raise exception 'order_not_found';
  end if;

  if v_order.status = 'canceled' then
    return v_order;
  end if;

  if v_order.status not in ('approved', 'cancel_pending') then
    raise exception 'invalid_order_status:%', v_order.status;
  end if;

  -- Used credits after this charge? (any debit after approved_at)
  select count(*)::integer into v_debit_after
  from public.credit_transactions
  where academy_id = v_order.academy_id
    and type = 'debit'
    and created_at >= coalesce(v_order.approved_at, v_order.created_at);

  if coalesce(v_debit_after, 0) > 0 and not p_force then
    raise exception 'credits_already_used';
  end if;

  select balance into v_balance
  from public.academy_wallets
  where academy_id = v_order.academy_id
  for update;

  if v_balance is null then
    raise exception 'wallet_not_found';
  end if;

  if v_balance < v_order.total_credit::integer and not p_force then
    raise exception 'insufficient_balance_for_refund';
  end if;

  v_idem := 'toss_refund:' || v_order.order_id;

  select * into v_existing
  from public.credit_transactions
  where academy_id = v_order.academy_id
    and idempotency_key = v_idem;

  if v_existing.id is null then
    if v_balance < v_order.total_credit::integer then
      raise exception 'insufficient_balance_for_refund';
    end if;
    v_balance := v_balance - v_order.total_credit::integer;

    update public.academy_wallets
    set balance = v_balance, updated_at = now()
    where academy_id = v_order.academy_id;

    insert into public.credit_transactions (
      academy_id, type, amount, balance_after, feature_key,
      idempotency_key, actor_id, note, metadata
    )
    values (
      v_order.academy_id,
      'refund',
      v_order.total_credit::integer,
      v_balance,
      null,
      v_idem,
      p_actor_id,
      '토스페이먼츠 결제 취소 환불',
      jsonb_build_object(
        'payment_order_id', v_order.id,
        'order_id', v_order.order_id,
        'payment_key', v_order.payment_key
      )
    );
  end if;

  update public.credit_payment_orders
  set
    status = 'canceled',
    canceled_at = coalesce(canceled_at, now()),
    updated_at = now()
  where id = v_order.id
  returning * into v_order;

  return v_order;
end;
$$;

revoke all on function public.approve_credit_payment_order(uuid, text, text, text) from public;
revoke all on function public.refund_credit_payment_order(uuid, uuid, boolean) from public;
grant execute on function public.approve_credit_payment_order(uuid, text, text, text) to service_role;
grant execute on function public.refund_credit_payment_order(uuid, uuid, boolean) to service_role;

-- ---------------------------------------------------------------------------
-- 7) RLS
-- ---------------------------------------------------------------------------
alter table public.credit_packages enable row level security;
alter table public.credit_payment_orders enable row level security;

drop policy if exists "Super admins manage credit_packages" on public.credit_packages;
create policy "Super admins manage credit_packages"
  on public.credit_packages for all
  using (public.is_super_admin())
  with check (public.is_super_admin());

drop policy if exists "Staff read active credit_packages" on public.credit_packages;
create policy "Staff read active credit_packages"
  on public.credit_packages for select
  using (
    public.is_super_admin()
    or (
      is_active = true
      and public.current_user_role() in ('admin', 'teacher')
    )
  );

drop policy if exists "Super admins manage credit_payment_orders" on public.credit_payment_orders;
create policy "Super admins manage credit_payment_orders"
  on public.credit_payment_orders for all
  using (public.is_super_admin())
  with check (public.is_super_admin());

drop policy if exists "Admin read own credit_payment_orders" on public.credit_payment_orders;
create policy "Admin read own credit_payment_orders"
  on public.credit_payment_orders for select
  using (
    public.is_super_admin()
    or (
      public.current_user_role() = 'admin'
      and public.current_user_academy_id() is not null
      and academy_id = public.current_user_academy_id()
    )
  );

-- No insert/update/delete for academy admins via RLS — app uses service_role after checks.
