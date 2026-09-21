-- 학원 DB 듣기 세트는 잠금을 풀기 전에는 지울 수 없다.
--
-- is_locked 세트는 교사가 이미 못 고치고 못 지운다(092). 그런데 학원 관리자는
-- 그대로 지울 수 있어서, 쌓아 둔 듣기 자료가 한 번에 날아갈 수 있었다.
-- 단어장(097)이 이미 같은 방식으로 막고 있으므로 듣기도 똑같이 맞춘다.
-- 고치는 것(update)은 그대로 열어 둔다 — 정말 지워야 하면 잠금을 먼저 푼다.

alter policy "Admins delete listening_sets" on public.listening_sets
  using (
    (
      (select public.is_super_admin())
      or ((select public.is_academy_admin()) and (academy_id = (select public.current_user_academy_id())))
    )
    and coalesce(is_locked, false) = false
  );

comment on column public.listening_sets.is_locked is
  'true면 학원 DB 자료 — 교사는 보고 배정만 하고, 지우려면 관리자가 먼저 잠금을 풀어야 한다.';
