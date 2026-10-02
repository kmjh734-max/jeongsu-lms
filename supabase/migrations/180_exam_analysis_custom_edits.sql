-- 시험 분석 보고서: 출제 특징, 점수가 갈린 문항, 지문 출처(부교재/직접입력) 손수 수정 지원
--
-- 1. 출제 특징·대비 전략·점수가 갈린 문항 직접 수정
-- 2. 미분류 지문을 교과서/모의고사/부교재/직접입력으로 지정 가능
alter table public.school_exam_analyses
  add column if not exists decisive_item_ids jsonb not null default '[]'::jsonb;

comment on column public.school_exam_analyses.decisive_item_ids is
  '선생님이 직접 지정한 점수가 갈린 문항(변별력 킬러 문항) ID 목록. 비어 있으면 난이도 상 문항 중 배점 큰 순으로 자동 선별한다.';

alter table public.school_exam_items
  add column if not exists is_decisive boolean not null default false,
  add column if not exists source_label text;

comment on column public.school_exam_items.is_decisive is
  '이 문항이 점수가 갈린 문항(변별력 문항)인지 여부';
comment on column public.school_exam_items.source_label is
  '선생님이 직접 입력한 출처 명칭 (예: 올림포스 12강 3번, EBS 수능특강 등)';
