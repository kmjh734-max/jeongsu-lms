-- 기능 가격표를 마이그레이션에도 남긴다. 2026-09-14에 운영 DB에서만 바꾼 가격이라, DB를 새로 만들거나
-- 되살리면 가격 행이 없어 해당 기능이 무료로 풀린다(가격 없는 기능은 차감을 건너뛴다).
-- 1크레딧 = 1원(부가세 제외), 원가의 약 2배. 이미 있는 행은 이 값으로 맞춘다.
insert into public.feature_pricing (feature_key, label, credit_cost, billing_type, is_active) values
  ('qg_generate_job', '변형문제 생성 (문항당)', 80, 'per_use', true),
  ('lesson_analysis_report', '지문 분석서 (지문당)', 600, 'per_use', true),
  ('lesson_pack', '수업용 자료 (지문당)', 15, 'per_use', true),
  ('lesson_illustration', '지문 삽화 (장당)', 120, 'per_use', true),
  ('lesson_workbook_grammar_choice', '워크북 어법 선택·수정 (지문당)', 400, 'per_use', true),
  ('lesson_workbook_vocab_choice', '워크북 어휘 선택·수정 (지문당)', 150, 'per_use', true),
  ('lesson_workbook_tf', '워크북 T/F (지문당, 10문항 넘으면 2배)', 30, 'per_use', true),
  ('listening_generate_questions', '듣기 문항 생성 (문항당, 받아쓰기 빈칸 포함)', 150, 'per_use', true),
  ('listening_generate_audio', '듣기 음성 생성 (문항당)', 100, 'per_use', true),
  ('listening_student_monthly', '듣기학습 학생 월간 이용', 1800, 'monthly_seat', true),
  ('vocab_student_monthly', '단어학습 학생 월간 이용', 1800, 'monthly_seat', true),
  ('vocab_generate_examples', '단어 예문 생성 (1회)', 20, 'per_use', true),
  ('vocab_extract_passage', '지문→단어 추출 (지문당)', 10, 'per_use', true),
  ('vocab_grade_meaning', '단어 뜻 AI 채점', 0, 'per_use', false),
  ('student_record_analyze', '학생부 분석 (1건)', 3000, 'per_use', true),
  ('report_ai_draft', '학습 리포트 초안 (1회)', 10, 'per_use', true),
  ('nelt_report_narratives', 'NELT 성장 리포트 서술 (1회)', 300, 'per_use', true),
  ('nelt_parent_message', 'NELT 학부모 안내문 (1회)', 100, 'per_use', true)
on conflict (feature_key) do update set
  label = excluded.label,
  credit_cost = excluded.credit_cost,
  billing_type = excluded.billing_type,
  is_active = excluded.is_active;
