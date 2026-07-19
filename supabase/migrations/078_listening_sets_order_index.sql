-- 듣기 세트 수동 정렬을 위한 order_index 컬럼
-- 목록은 order_index ASC 로 정렬한다 (작을수록 위/먼저).

alter table public.listening_sets
  add column if not exists order_index integer not null default 0;

-- 기존 세트에 고유한 순서값 부여 (현재 표시 순서 유지: 최신이 위 = order_index 작음)
with ordered as (
  select id, row_number() over (order by created_at desc, id) - 1 as rn
  from public.listening_sets
)
update public.listening_sets s
set order_index = ordered.rn
from ordered
where ordered.id = s.id;

create index if not exists listening_sets_order_idx
  on public.listening_sets (order_index);
