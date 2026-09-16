-- 1장 자료 값 조정. 어법·지칭·동반의어·해석을 한 번 더 검수하고 지칭어를 전부 뽑게 되면서
-- 원가가 지문당 약 40원 → 57원이 됐다. 값은 원가의 2배 선(1크레딧 = 1원)으로 맞춘다.
update public.feature_pricing set credit_cost = 120 where feature_key = 'lesson_one_page';
