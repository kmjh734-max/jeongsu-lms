-- 테스트 교재(수업자료 NEW, 정수학원 먼저): 단어 정리·동반의어 테스트·수업용 자료·테스트 견본·
-- 백지노트·정답지를 한 권으로 묶은 파일. 학원에서는 같은 재료로 테스트지를 무작위로 뽑는다.
-- 재료는 지문(lesson_pack_json.testBookMaterial·onePageContent)에 두고, 파일에는 교재 설정만 둔다.
--
-- 가격: 지문당 한 번. 1장 자료 재료(gpt-4o, 원가 약 70원) + 단어 정리(gpt-4o-mini, 1원 아래)
-- + 어순 덩어리(2원 아래) → 원가 약 75원, 1장 테스트와 같은 300크레딧(4배).
-- 테스트지 뽑기는 저장한 재료로 조립만 하므로 값이 없다.

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
    'one_page_test',
    'test_book'
  ));

insert into public.feature_pricing (feature_key, label, credit_cost, billing_type, is_active) values
  ('lesson_test_book', '테스트 교재 (지문당)', 300, 'per_use', true)
on conflict (feature_key) do update set
  label = excluded.label,
  credit_cost = excluded.credit_cost,
  billing_type = excluded.billing_type,
  is_active = excluded.is_active;

commit;
