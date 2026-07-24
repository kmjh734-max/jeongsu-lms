-- NELT 성장 리포트 (정수학원 전용 기능 — 앱에서 메뉴 게이트)
-- 학생 LMS 계정과 무관: student_id는 선택, student_name_raw가 필수 (학생부 분석과 동일)

-- ---------------------------------------------------------------------------
-- 수준 정규화 맵 (하드코딩 금지)
-- ---------------------------------------------------------------------------
create table if not exists public.nelt_level_map (
  id uuid primary key default gen_random_uuid(),
  level_label text not null unique,
  level_order numeric(6, 2) not null,
  band text,
  notes text,
  created_at timestamptz not null default now()
);

insert into public.nelt_level_map (level_label, level_order, band) values
  ('Kinder', 0, 'Kinder'),
  ('초등학교 1학년', 1, '초등'),
  ('초등학교 1-2학년', 1.5, '초등'),
  ('초등학교 1~2학년', 1.5, '초등'),
  ('초등학교 3학년', 3, '초등'),
  ('초등학교 3-4학년', 3.5, '초등'),
  ('초등학교 3~4학년', 3.5, '초등'),
  ('초등학교 5학년', 5, '초등'),
  ('초등학교 5-6학년', 5.5, '초등'),
  ('초등학교 5~6학년', 5.5, '초등'),
  ('초등학교 6학년', 6, '초등'),
  ('중학교 1학년', 8, '중등'),
  ('중학교 2학년', 9, '중등'),
  ('중학교 3학년', 10, '중등'),
  ('고등학교 1학년', 11, '고등'),
  ('고등학교 2학년', 12, '고등'),
  ('고등학교 3학년', 13, '고등')
on conflict (level_label) do nothing;

-- ---------------------------------------------------------------------------
-- 회차 결과 (이름 중심, student_id 선택)
-- ---------------------------------------------------------------------------
create table if not exists public.nelt_reports (
  id uuid primary key default gen_random_uuid(),
  academy_id uuid not null references public.academies(id) on delete cascade,
  student_id uuid references public.profiles(id) on delete set null,
  student_name_raw text not null,
  test_name text,
  test_date date,
  student_grade_raw text,
  attempt_number integer,
  overall_level text,
  overall_level_order numeric(6, 2),
  overall_band text,
  overall_percentile numeric(5, 2),
  total_duration_seconds integer,
  source_type text not null default 'manual'
    check (source_type in ('pdf', 'url', 'manual')),
  source_url text,
  source_file_path text,
  source_file_hash text,
  extraction_status text not null default 'completed'
    check (extraction_status in (
      'uploading', 'text_analyzing', 'extracting', 'needs_review',
      'completed', 'failed'
    )),
  extraction_confidence numeric(4, 3),
  raw_extracted_data jsonb not null default '{}'::jsonb,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists nelt_reports_academy_id_idx
  on public.nelt_reports(academy_id);
create index if not exists nelt_reports_student_name_idx
  on public.nelt_reports(academy_id, student_name_raw);
create index if not exists nelt_reports_test_date_idx
  on public.nelt_reports(academy_id, test_date desc nulls last);
create index if not exists nelt_reports_hash_idx
  on public.nelt_reports(academy_id, source_file_hash)
  where source_file_hash is not null;

create table if not exists public.nelt_domain_results (
  id uuid primary key default gen_random_uuid(),
  nelt_report_id uuid not null references public.nelt_reports(id) on delete cascade,
  domain text not null
    check (domain in ('vocabulary', 'grammar', 'listening', 'reading')),
  difficulty_code text,
  raw_score numeric(6, 2),
  evaluated_level text,
  evaluated_level_order numeric(6, 2),
  percentile numeric(5, 2),
  duration_seconds integer,
  achievement_grade text,
  evaluation_summary text,
  created_at timestamptz not null default now(),
  unique (nelt_report_id, domain)
);

create index if not exists nelt_domain_results_report_idx
  on public.nelt_domain_results(nelt_report_id);

create table if not exists public.nelt_vocabulary_metrics (
  id uuid primary key default gen_random_uuid(),
  nelt_report_id uuid not null unique references public.nelt_reports(id) on delete cascade,
  vocabulary_size integer,
  elementary_required_total integer,
  elementary_required_percentage numeric(5, 2),
  elementary_required_estimated_count integer,
  csat_vocabulary_percentage numeric(5, 2),
  created_at timestamptz not null default now()
);

create table if not exists public.nelt_grammar_metrics (
  id uuid primary key default gen_random_uuid(),
  nelt_report_id uuid not null unique references public.nelt_reports(id) on delete cascade,
  elementary_grammar_percentage numeric(5, 2),
  correct_item_count integer,
  total_item_count integer,
  created_at timestamptz not null default now()
);

create table if not exists public.nelt_subskill_results (
  id uuid primary key default gen_random_uuid(),
  nelt_domain_result_id uuid not null
    references public.nelt_domain_results(id) on delete cascade,
  subskill_name text not null,
  description text,
  student_accuracy numeric(5, 2),
  level_average_accuracy numeric(5, 2),
  created_at timestamptz not null default now()
);

create index if not exists nelt_subskill_domain_idx
  on public.nelt_subskill_results(nelt_domain_result_id);

create table if not exists public.nelt_grammar_items (
  id uuid primary key default gen_random_uuid(),
  nelt_report_id uuid not null references public.nelt_reports(id) on delete cascade,
  category text,
  detail text not null,
  is_correct boolean,
  created_at timestamptz not null default now()
);

create index if not exists nelt_grammar_items_report_idx
  on public.nelt_grammar_items(nelt_report_id);

-- ---------------------------------------------------------------------------
-- 가져오기 작업 (검토 전)
-- ---------------------------------------------------------------------------
create table if not exists public.nelt_import_jobs (
  id uuid primary key default gen_random_uuid(),
  academy_id uuid not null references public.academies(id) on delete cascade,
  student_id uuid references public.profiles(id) on delete set null,
  student_name_raw text,
  import_type text not null
    check (import_type in ('pdf', 'url', 'manual', 'batch')),
  source_url text,
  file_path text,
  file_hash text,
  status text not null default 'pending'
    check (status in (
      'pending', 'uploading', 'text_analyzing', 'extracting',
      'needs_review', 'completed', 'failed', 'cancelled'
    )),
  error_message text,
  extracted_data jsonb not null default '{}'::jsonb,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create index if not exists nelt_import_jobs_academy_idx
  on public.nelt_import_jobs(academy_id, created_at desc);

-- ---------------------------------------------------------------------------
-- 성장 리포트 (이름 중심 묶음)
-- ---------------------------------------------------------------------------
create table if not exists public.nelt_growth_reports (
  id uuid primary key default gen_random_uuid(),
  academy_id uuid not null references public.academies(id) on delete cascade,
  student_id uuid references public.profiles(id) on delete set null,
  student_name_raw text not null,
  start_report_id uuid references public.nelt_reports(id) on delete set null,
  end_report_id uuid references public.nelt_reports(id) on delete set null,
  generated_summary text,
  growth_highlights jsonb not null default '[]'::jsonb,
  focus_areas jsonb not null default '[]'::jsonb,
  learning_plan jsonb not null default '{}'::jsonb,
  teacher_comment text,
  is_finalized boolean not null default false,
  finalized_by uuid references public.profiles(id) on delete set null,
  finalized_at timestamptz,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists nelt_growth_reports_academy_name_idx
  on public.nelt_growth_reports(academy_id, student_name_raw);

-- ---------------------------------------------------------------------------
-- 학부모 공유 (토큰)
-- ---------------------------------------------------------------------------
create table if not exists public.nelt_shared_reports (
  id uuid primary key default gen_random_uuid(),
  academy_id uuid not null references public.academies(id) on delete cascade,
  growth_report_id uuid not null
    references public.nelt_growth_reports(id) on delete cascade,
  token text not null unique,
  expires_at timestamptz,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists nelt_shared_reports_token_idx
  on public.nelt_shared_reports(token);

-- ---------------------------------------------------------------------------
-- Storage: nelt-sources (비공개)
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('nelt-sources', 'nelt-sources', false)
on conflict (id) do nothing;

drop policy if exists "NELT sources staff read" on storage.objects;
create policy "NELT sources staff read"
  on storage.objects for select
  using (
    bucket_id = 'nelt-sources'
    and (public.is_admin() or public.is_teacher() or public.is_super_admin())
  );

drop policy if exists "NELT sources staff insert" on storage.objects;
create policy "NELT sources staff insert"
  on storage.objects for insert
  with check (
    bucket_id = 'nelt-sources'
    and (public.is_admin() or public.is_teacher() or public.is_super_admin())
  );

drop policy if exists "NELT sources staff update" on storage.objects;
create policy "NELT sources staff update"
  on storage.objects for update
  using (
    bucket_id = 'nelt-sources'
    and (public.is_admin() or public.is_teacher() or public.is_super_admin())
  );

drop policy if exists "NELT sources staff delete" on storage.objects;
create policy "NELT sources staff delete"
  on storage.objects for delete
  using (
    bucket_id = 'nelt-sources'
    and (public.is_admin() or public.is_teacher() or public.is_super_admin())
  );

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.nelt_level_map enable row level security;
alter table public.nelt_reports enable row level security;
alter table public.nelt_domain_results enable row level security;
alter table public.nelt_vocabulary_metrics enable row level security;
alter table public.nelt_grammar_metrics enable row level security;
alter table public.nelt_subskill_results enable row level security;
alter table public.nelt_grammar_items enable row level security;
alter table public.nelt_import_jobs enable row level security;
alter table public.nelt_growth_reports enable row level security;
alter table public.nelt_shared_reports enable row level security;

drop policy if exists "NELT level map read" on public.nelt_level_map;
create policy "NELT level map read"
  on public.nelt_level_map for select
  using (auth.uid() is not null);

create or replace function public.nelt_staff_same_academy(target_academy_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.is_super_admin()
    or (
      target_academy_id is not null
      and target_academy_id = public.current_user_academy_id()
      and (public.is_admin() or public.is_teacher())
    );
$$;

drop policy if exists "NELT reports staff" on public.nelt_reports;
create policy "NELT reports staff"
  on public.nelt_reports for all
  using (public.nelt_staff_same_academy(academy_id))
  with check (public.nelt_staff_same_academy(academy_id));

drop policy if exists "NELT domain staff" on public.nelt_domain_results;
create policy "NELT domain staff"
  on public.nelt_domain_results for all
  using (
    exists (
      select 1 from public.nelt_reports r
      where r.id = nelt_report_id
        and public.nelt_staff_same_academy(r.academy_id)
    )
  )
  with check (
    exists (
      select 1 from public.nelt_reports r
      where r.id = nelt_report_id
        and public.nelt_staff_same_academy(r.academy_id)
    )
  );

drop policy if exists "NELT vocab metrics staff" on public.nelt_vocabulary_metrics;
create policy "NELT vocab metrics staff"
  on public.nelt_vocabulary_metrics for all
  using (
    exists (
      select 1 from public.nelt_reports r
      where r.id = nelt_report_id
        and public.nelt_staff_same_academy(r.academy_id)
    )
  )
  with check (
    exists (
      select 1 from public.nelt_reports r
      where r.id = nelt_report_id
        and public.nelt_staff_same_academy(r.academy_id)
    )
  );

drop policy if exists "NELT grammar metrics staff" on public.nelt_grammar_metrics;
create policy "NELT grammar metrics staff"
  on public.nelt_grammar_metrics for all
  using (
    exists (
      select 1 from public.nelt_reports r
      where r.id = nelt_report_id
        and public.nelt_staff_same_academy(r.academy_id)
    )
  )
  with check (
    exists (
      select 1 from public.nelt_reports r
      where r.id = nelt_report_id
        and public.nelt_staff_same_academy(r.academy_id)
    )
  );

drop policy if exists "NELT subskill staff" on public.nelt_subskill_results;
create policy "NELT subskill staff"
  on public.nelt_subskill_results for all
  using (
    exists (
      select 1
      from public.nelt_domain_results d
      join public.nelt_reports r on r.id = d.nelt_report_id
      where d.id = nelt_domain_result_id
        and public.nelt_staff_same_academy(r.academy_id)
    )
  )
  with check (
    exists (
      select 1
      from public.nelt_domain_results d
      join public.nelt_reports r on r.id = d.nelt_report_id
      where d.id = nelt_domain_result_id
        and public.nelt_staff_same_academy(r.academy_id)
    )
  );

drop policy if exists "NELT grammar items staff" on public.nelt_grammar_items;
create policy "NELT grammar items staff"
  on public.nelt_grammar_items for all
  using (
    exists (
      select 1 from public.nelt_reports r
      where r.id = nelt_report_id
        and public.nelt_staff_same_academy(r.academy_id)
    )
  )
  with check (
    exists (
      select 1 from public.nelt_reports r
      where r.id = nelt_report_id
        and public.nelt_staff_same_academy(r.academy_id)
    )
  );

drop policy if exists "NELT import jobs staff" on public.nelt_import_jobs;
create policy "NELT import jobs staff"
  on public.nelt_import_jobs for all
  using (public.nelt_staff_same_academy(academy_id))
  with check (public.nelt_staff_same_academy(academy_id));

drop policy if exists "NELT growth reports staff" on public.nelt_growth_reports;
create policy "NELT growth reports staff"
  on public.nelt_growth_reports for all
  using (public.nelt_staff_same_academy(academy_id))
  with check (public.nelt_staff_same_academy(academy_id));

drop policy if exists "NELT shared reports staff" on public.nelt_shared_reports;
create policy "NELT shared reports staff"
  on public.nelt_shared_reports for all
  using (public.nelt_staff_same_academy(academy_id))
  with check (public.nelt_staff_same_academy(academy_id));
