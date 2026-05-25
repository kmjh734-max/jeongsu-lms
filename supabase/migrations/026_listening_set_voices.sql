-- 듣기 세트별 ElevenLabs voice_id (선택, null이면 자동 선택)
alter table public.listening_sets
  add column if not exists voice_ann_id text,
  add column if not exists voice_m_id text,
  add column if not exists voice_w_id text;
