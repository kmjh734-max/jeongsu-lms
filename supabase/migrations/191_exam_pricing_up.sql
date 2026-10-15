-- 내신 시험지 분석 · 적중 자료집 값 올림 (선생님 결정 2026-10-15 「AI 비용이 많이 드니」).
-- 시험지 분석 1,500 → 3,000 (원가 약 820원/회, 8쪽 기준). 적중 자료집 만들기 3,000 → 5,000 (원가 약 1,000~1,500원/회).
update public.feature_pricing set credit_cost = 3000, updated_at = now() where feature_key = 'school_exam_analysis';
update public.feature_pricing set credit_cost = 5000, label = '적중 자료집 만들기 (회당)', updated_at = now() where feature_key = 'exam_hit_book';
