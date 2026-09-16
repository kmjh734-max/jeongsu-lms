-- 1장 직보자료(지문 하나를 A4 한 쪽에 정리)와 1장 테스트(지문 하나로 A4 한 쪽 시험지)를
-- 자료함 파일로 저장한다. 수업용 자료·분석서처럼 파일에는 고른 지문만 두고, 만든 재료는
-- 지문(lesson_material_projects.lesson_pack_json.onePageContent)에 저장해 두 파일이 함께 쓴다.
--
-- 가격: 1장 자료 재료(주제·요약문·도식화·동반의어·바꿔 쓰기·T/F·주요문장)는 지문당 한 번
-- 만든다(gpt-4o, 원가 약 40원 → 80크레딧). 어법 선택·어휘 선택은 워크북 것을 그대로 쓴다.

begin;

alter table public.lesson_material_documents
  drop constraint if exists lesson_material_documents_kind_check;

alter table public.lesson_material_documents
  add constraint lesson_material_documents_kind_check
  check (kind in (
    'lesson_pack',
    'analysis_report',
    'workbook',
    'integrated',
    'one_page_summary',
    'one_page_test'
  ));

insert into public.feature_pricing (feature_key, label, credit_cost, billing_type, is_active) values
  ('lesson_one_page', '1장 자료 (지문당)', 80, 'per_use', true)
on conflict (feature_key) do update set
  label = excluded.label,
  credit_cost = excluded.credit_cost,
  billing_type = excluded.billing_type,
  is_active = excluded.is_active;

commit;
