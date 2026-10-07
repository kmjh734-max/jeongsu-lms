-- 마케팅 > 예비고1·예비중1 어휘 진단 (정수학원 전용, 2026-10-07)
--
-- 정수학원 단어장(vocab_folders·vocab_sets·vocab_items)에서 대표 단어를 골라 시험을 확정하고,
-- 외부 응시자에게 개인 링크를 보내 로그인 없이 치르게 한다. 결과는 따로 공유 링크로 본다.
--
-- 네 테이블 모두 RLS를 켜고 정책을 두지 않는다(021_shared_reports 방식). 브라우저는 직접 읽고 쓸 수 없고,
-- 서버가 권한·토큰을 확인한 뒤 service role로만 읽고 쓴다. 토큰 원문은 저장하지 않는다(token_hash).

create table if not exists public.vocab_diag_tests (
  id uuid primary key default gen_random_uuid(),
  academy_id uuid not null references public.academies(id) on delete cascade,
  target text not null check (target in ('pre_high1', 'pre_middle1')),
  title text not null,
  version int not null default 1,
  status text not null default 'draft' check (status in ('draft', 'confirmed')),
  is_active boolean not null default true,
  question_count int not null check (question_count between 5 and 100),
  recommended_minutes int not null default 10 check (recommended_minutes between 1 and 120),
  intro_text text not null default '',
  folder_id uuid references public.vocab_folders(id) on delete set null,
  -- [{itemId, setId, day, word, answer, choices:[4개], answerIndex}] — 확정하면 바뀌지 않는다
  questions jsonb not null default '[]'::jsonb,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  confirmed_at timestamptz,
  unique (academy_id, target, version)
);
create index if not exists vocab_diag_tests_academy_idx on public.vocab_diag_tests (academy_id, target, created_at desc);

-- 응시자: 재원생(student_id)이거나 외부 응시자(이름·학년·학교만). 같은 사람을 거듭 만들지 않게 이름·학년·학교로 찾는다.
create table if not exists public.vocab_diag_candidates (
  id uuid primary key default gen_random_uuid(),
  academy_id uuid not null references public.academies(id) on delete cascade,
  student_id uuid references public.profiles(id) on delete set null,
  name text not null,
  grade text not null default '',
  school text not null default '',
  created_at timestamptz not null default now()
);
create unique index if not exists vocab_diag_candidates_person_idx
  on public.vocab_diag_candidates (academy_id, name, grade, school);

-- 개인 응시 링크. 한 링크에 응시 한 번. 다시 보려면 새 초대를 낸다.
create table if not exists public.vocab_diag_invites (
  id uuid primary key default gen_random_uuid(),
  academy_id uuid not null references public.academies(id) on delete cascade,
  test_id uuid not null references public.vocab_diag_tests(id) on delete restrict,
  candidate_id uuid not null references public.vocab_diag_candidates(id) on delete restrict,
  token_nonce text not null,
  token_hash text not null unique,
  expires_at timestamptz not null,
  revoked_at timestamptz,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);
create index if not exists vocab_diag_invites_test_idx on public.vocab_diag_invites (academy_id, test_id, created_at desc);

-- 응시 기록. 초대 하나에 한 줄(unique). 시작할 때 문항을 그대로 옮겨 둔다(시험·단어장을 고쳐도 결과가 바뀌지 않게).
create table if not exists public.vocab_diag_attempts (
  id uuid primary key default gen_random_uuid(),
  academy_id uuid not null references public.academies(id) on delete cascade,
  invite_id uuid not null unique references public.vocab_diag_invites(id) on delete restrict,
  test_id uuid not null references public.vocab_diag_tests(id) on delete restrict,
  target text not null,
  -- 학생에게 보인 차례: [{itemId, setId, day, word, answer, choices:[보인 순서 4개], answerIndex}]
  questions jsonb not null,
  -- {문항번호(0부터): 보기번호(0~3) | "unknown"}
  answers jsonb not null default '{}'::jsonb,
  started_at timestamptz not null default now(),
  submitted_at timestamptz,
  correct_count int,
  total_count int,
  -- 결과 공유 링크(응시 링크와 다른 토큰)
  result_nonce text,
  result_token_hash text unique,
  result_expires_at timestamptz,
  result_revoked_at timestamptz,
  updated_at timestamptz not null default now()
);
create index if not exists vocab_diag_attempts_test_idx on public.vocab_diag_attempts (academy_id, test_id, submitted_at desc);

alter table public.vocab_diag_tests enable row level security;
alter table public.vocab_diag_candidates enable row level security;
alter table public.vocab_diag_invites enable row level security;
alter table public.vocab_diag_attempts enable row level security;

-- 정수학원만 켠다. 슈퍼관리자 화면 「기능」 탭에서 켜고 끈다.
update public.academies
   set settings = coalesce(settings, '{}'::jsonb)
                  || jsonb_build_object(
                       'features',
                       coalesce(settings -> 'features', '{}'::jsonb)
                       || jsonb_build_object('vocab_diagnostic', slug = 'jeongsu')
                     ),
       updated_at = now();
