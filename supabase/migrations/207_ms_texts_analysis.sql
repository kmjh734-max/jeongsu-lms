-- 중학교 수업자료 분석서(선생님 2026-10-29 개요 승인): 본문마다 문장 분석을 미리 담아 둔다.
-- 고등 분석서와 같은 형식(analysis_report_json — AnalysisReportData)이라 고등 「분석 자료」 부품으로 그린다.
-- 모델 호출 없이 직접 써서 넣는다(scripts/middle-school/analysis/build.mts). 없으면 null.
alter table public.ms_texts
  add column if not exists analysis jsonb;
