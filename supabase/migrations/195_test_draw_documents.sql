-- 뽑은 테스트지(테스트 교재 「테스트지 뽑기」)를 파일로 남긴다(선생님 2026-10-20: 만들고 나면 어디에 저장돼야).
-- 뽑은 그대로(문항·보기 순서·단어 시험지·정답)를 payload에 담아, 다시 열면 같은 시험지를 인쇄한다(값 없음).

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
    'test_book',
    'test_draw'
  ));

commit;
