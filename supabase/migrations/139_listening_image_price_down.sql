-- 듣기 그림 값 내림. 그림 고르기 5장을 한 장에 합쳐 그리고(choice-grid-figure), 화질도 인쇄에
-- 필요한 선으로 낮춰 장당 원가가 약 235원 → 59원이 됐다. 값도 원가의 2배 선으로 맞춘다.
--  · 그림 1장: 500 → 120 (그림 고르기 한 문항이 2,500 → 120)
--  · 그림 상황 장면(그림 + 정답 대화 검수): 700 → 200
update public.feature_pricing set credit_cost = 120, label = '듣기 그림 생성 (장당)' where feature_key = 'listening_generate_image';
update public.feature_pricing set credit_cost = 200, label = '듣기 그림 상황 그림 (문항당)' where feature_key = 'listening_generate_scene';
