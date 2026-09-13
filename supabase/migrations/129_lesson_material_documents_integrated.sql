-- 최종통합자료(수업용 자료·분석서·변형문제·워크북을 표지·간지와 함께 묶은 파일)를
-- 자료함 파일로 저장한다. payload에 구성(고른 파일·순서)과 표지 설정을 둔다.

begin;

alter table public.lesson_material_documents
  drop constraint if exists lesson_material_documents_kind_check;

alter table public.lesson_material_documents
  add constraint lesson_material_documents_kind_check
  check (kind in ('lesson_pack', 'analysis_report', 'workbook', 'integrated'));

commit;
