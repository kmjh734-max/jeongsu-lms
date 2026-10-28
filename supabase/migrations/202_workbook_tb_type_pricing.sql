-- 워크북 유형마다 지문당 값(선생님 2026-10-28): 요약문만 골랐는데 「지칭·함축·요약 등」 묶음 값 200이 나갔다.
-- 고른 유형(요약문·도식화·지칭·함축·바꿔 말하기·단어 시험·함께 고른 끊어 읽기)만 유형당 지문당 30.
-- 연결어·글의 순서·문장 삽입은 규칙으로만 만들어 받지 않는다. 재료도 고른 유형에 필요한 것만 만든다
-- (어법·낱말을 뺀 가벼운 1장 재료 실측 9.8원, 전체 44원). 수업자료 쪽 묶음 값(lesson_workbook_extras 200)은 그대로.

begin;

insert into public.feature_pricing (feature_key, label, credit_cost, billing_type, is_active) values
  ('lesson_workbook_tb_type', '워크북 요약문·도식화·지칭·함축·바꿔 말하기·단어 시험 (유형당 지문당)', 30, 'per_use', true)
on conflict (feature_key) do update set
  label = excluded.label,
  credit_cost = excluded.credit_cost,
  billing_type = excluded.billing_type,
  is_active = excluded.is_active;

update public.feature_pricing
set label = '수업자료 부가 재료 묶음 (요약·지칭·함축·단어 등, 지문당)',
    updated_at = now()
where feature_key = 'lesson_workbook_extras';

commit;
