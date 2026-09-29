-- API를 쓰는데 값을 안 받던 세 가지에 값을 매긴다 (2026-09-29).
--
-- 선생님 지적: "API를 쓰는 곳은 모두 크레딧을 쓰도록 설정해야 해."
-- 워크북 만들기 창에 「한줄해석·영작 등은 값이 들지 않는다」고 적혀 있었는데,
-- 실제로는 모델을 부른다. 값이 안 드는 줄 알고 정해 둔 것으로 보인다.
--
-- 지문 13문장 기준 실측 원가: 제시어 배열 영작 2.4원 · 한 줄 해석 0.7원 ·
-- 문장 해석 다시 만들기 0.7원. 수업용 자료(원가 1원 · 15크레딧)와 같은 결로 잡는다.

insert into public.feature_pricing (feature_key, label, credit_cost, billing_type, is_active)
values
  ('lesson_workbook_word_order', '워크북 제시어 배열 영작 (지문당)', 20, 'per_use', true),
  ('lesson_workbook_line_translation', '워크북 한 줄 해석·전체 영작 (지문당)', 10, 'per_use', true),
  ('lesson_line_translate', '문장 해석 다시 만들기 (지문당)', 10, 'per_use', true)
on conflict (feature_key) do update
  set credit_cost = excluded.credit_cost,
      label = excluded.label,
      is_active = true,
      updated_at = now();
