-- Feature pricing: ~65–75% gross margin at ₩30 / credit
-- (heavy AI COGS × ~3; light mini models keep small fixed costs)

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

-- ElevenLabs TTS (~₩135–340) → 25cr × ₩30 = ₩750 (~70%+ margin)
update public.feature_pricing set
  credit_cost = 25,
  label = '듣기 음성(TTS) 생성',
  updated_at = now()
where feature_key = 'listening_generate_audio';

-- gpt-5.x listening questions → 25cr = ₩750
update public.feature_pricing set
  credit_cost = 25,
  label = '듣기 문항 AI 생성',
  updated_at = now()
where feature_key = 'listening_generate_questions';

-- gpt-5.x QG job (~₩200–540) → 40cr = ₩1,200
update public.feature_pricing set
  credit_cost = 40,
  label = 'AI 변형문제 생성',
  updated_at = now()
where feature_key = 'qg_generate_job';

-- gpt-4o vision + report (~₩540–1,080) → 80cr = ₩2,400 (~65%+ margin)
update public.feature_pricing set
  credit_cost = 80,
  label = '학생부 AI 분석',
  updated_at = now()
where feature_key = 'student_record_analyze';

-- Monthly seats: no AI COGS; product price ~₩1,800 / student / month
update public.feature_pricing set
  credit_cost = 60,
  label = '단어학습 학생 월간 이용',
  updated_at = now()
where feature_key = 'vocab_student_monthly';

update public.feature_pricing set
  credit_cost = 60,
  label = '듣기학습 학생 월간 이용',
  updated_at = now()
where feature_key = 'listening_student_monthly';
