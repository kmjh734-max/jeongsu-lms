-- 변형문제 설계도(동형모의고사): 시험지 번호마다 지문·유형·난이도·배점을 정해 한 문항씩 만든다.
-- slot_index = 설계도 순서(인쇄 순서), item_no = 시험지 번호("1", "서술 1"), points = 배점, target_level = 상/중/하
alter table public.generated_english_questions
  add column if not exists slot_index int,
  add column if not exists item_no text,
  add column if not exists points numeric,
  add column if not exists target_level text;
create index if not exists generated_english_questions_job_slot_idx
  on public.generated_english_questions (generation_job_id, slot_index);
