-- 학교 시험지와 내가 만든 자료를 대조한 적중표 (선생님 지시 2026-10-01).
--
-- 화면을 열 때마다 지문 수천 개를 대조하면 느리고 헛일이다. 「대조하기」를 눌러 한 번
-- 돌리고 그 결과를 여기 담아 둔다. 자료를 더 만든 뒤 다시 누르면 새로 담긴다.
alter table public.school_exam_analyses
  add column if not exists hit_report jsonb,
  add column if not exists hit_report_at timestamptz;

-- 값: 1,500. 선생님이 올리신 PDF 자료를 읽어야 할 수 있어(OCR) 시험지 분석과 같게 잡는다.
insert into public.feature_pricing (feature_key, label, credit_cost, billing_type, is_active)
values ('exam_hit_report', '시험지 적중 대조 (회당)', 1500, 'per_use', true)
on conflict (feature_key) do update
  set label = excluded.label,
      credit_cost = excluded.credit_cost,
      is_active = true,
      updated_at = now();
