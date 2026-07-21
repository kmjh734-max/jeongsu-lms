-- Feature pricing tuned by relative AI usage / cost
-- (cheap classify → heavy vision+report)

update public.feature_pricing set
  credit_cost = 0,
  is_active = false,
  label = '단어 뜻 AI 채점',
  updated_at = now()
where feature_key = 'vocab_grade_meaning';

update public.feature_pricing set
  credit_cost = 5,
  label = '단어 예문 AI 생성',
  updated_at = now()
where feature_key = 'vocab_generate_examples';

update public.feature_pricing set
  credit_cost = 8,
  label = '지문→단어 추출',
  updated_at = now()
where feature_key = 'vocab_extract_passage';

update public.feature_pricing set
  credit_cost = 10,
  label = '학습 리포트 AI 초안',
  updated_at = now()
where feature_key = 'report_ai_draft';

update public.feature_pricing set
  credit_cost = 15,
  label = '듣기 음성(TTS) 생성',
  updated_at = now()
where feature_key = 'listening_generate_audio';

update public.feature_pricing set
  credit_cost = 20,
  label = '듣기 문항 AI 생성',
  updated_at = now()
where feature_key = 'listening_generate_questions';

update public.feature_pricing set
  credit_cost = 30,
  label = 'AI 변형문제 생성',
  updated_at = now()
where feature_key = 'qg_generate_job';

update public.feature_pricing set
  credit_cost = 40,
  label = '학생부 AI 분석',
  updated_at = now()
where feature_key = 'student_record_analyze';

-- 월간 좌석: 학생 1명·월 이용권 (AI 단회보다 높게)
update public.feature_pricing set
  credit_cost = 50,
  label = '단어학습 학생 월간 이용',
  updated_at = now()
where feature_key = 'vocab_student_monthly';

update public.feature_pricing set
  credit_cost = 50,
  label = '듣기학습 학생 월간 이용',
  updated_at = now()
where feature_key = 'listening_student_monthly';
