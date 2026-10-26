-- 테스트지 뽑기를 유형별·문항별로(선생님 2026-10-26): 문항당 1크레딧, 지문 통째 유형(연결어·삽입·요약문·
-- 도식화·글의 순서·문장 순서 배열·제목·요지)은 세트당 3크레딧, 단어 시험지는 지문당 3크레딧.
-- 기능은 1크레딧 단위로 두고 수량을 코드(testDrawUnits)가 센다. 조립만 하므로 원가는 없다.

begin;

update public.feature_pricing
set label = '테스트지 뽑기 (문항당 1 · 세트 3 · 단어 시험 지문당 3)',
    credit_cost = 1,
    updated_at = now()
where feature_key = 'lesson_test_draw';

commit;
