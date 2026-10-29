-- 중학교 수업자료(선생님 2026-10-29): 족보닷컴 중학 교과서 자료를 과 단위로 담는다.
-- 정수학원만 쓴다 — 고등 교과서 본문(textbook_passages)은 다른 학원에도 열려 있어 섞지 않고 따로 둔다.
-- 원본: 구글 드라이브 「중1·중2 족보닷컴 다운로드」의 본문·내용정리 플러스·WORD TEST·Grammar Build Up(한글).

begin;

create table if not exists public.ms_units (
  id uuid primary key default gen_random_uuid(),
  academy_id uuid not null references public.academies(id) on delete cascade,
  grade text not null,              -- 중1
  publisher text not null,          -- 동아(윤정미)
  lesson_no smallint not null,      -- 1
  title text not null,              -- Happy Together
  words jsonb not null default '[]'::jsonb,    -- [{section:'대화문'|'본문', word, meaning, examples?:[{en,ko}]}]
  grammar jsonb not null default '[]'::jsonb,  -- [{no, title, points:[], examples:[{en,ko,fromText}]}]
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (academy_id, grade, publisher, lesson_no)
);

-- 과 안의 글: 대화문(말차례)과 본문(문장). 해석은 교재에 실린 그대로.
create table if not exists public.ms_texts (
  id uuid primary key default gen_random_uuid(),
  unit_id uuid not null references public.ms_units(id) on delete cascade,
  kind text not null check (kind in ('대화문', '본문')),
  part text not null,               -- 대화문1 · 본문1
  order_index int not null default 0,
  title text,                       -- 본문: 내용정리 플러스의 본문❶ 소제목 / 대화문: A. Watch and Check
  lines jsonb not null default '[]'::jsonb,  -- 본문 [{en, ko, speaker}] · 대화문 [{speaker, en, ko}]
  english_text text not null,
  korean_text text,
  created_at timestamptz not null default now(),
  unique (unit_id, kind, part)
);

create index if not exists ms_texts_unit_idx on public.ms_texts (unit_id, kind, order_index);

alter table public.ms_units enable row level security;
alter table public.ms_texts enable row level security;

-- 기능 스위치: 정수학원만 켠다
update public.academies
   set settings = coalesce(settings, '{}'::jsonb)
                  || jsonb_build_object(
                       'features',
                       coalesce(settings -> 'features', '{}'::jsonb)
                       || jsonb_build_object('middle_school_lessons', slug = 'jeongsu')
                     ),
       updated_at = now();

commit;
