-- 지문 세트: 한 제목 아래 여러 지문

create table if not exists public.exam_passage_sets (
  id uuid primary key default gen_random_uuid(),
  academy_id uuid not null references public.academies(id) on delete cascade,
  title text not null,
  grade text,
  school_name text,
  description text,
  status text not null default 'draft'
    check (status in ('draft', 'ready', 'archived')),
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists exam_passage_sets_academy_idx
  on public.exam_passage_sets(academy_id);
create index if not exists exam_passage_sets_updated_idx
  on public.exam_passage_sets(academy_id, updated_at desc);

alter table public.exam_passages
  add column if not exists set_id uuid
    references public.exam_passage_sets(id) on delete cascade;

create index if not exists exam_passages_set_idx
  on public.exam_passages(set_id);

alter table public.exam_passage_sets enable row level security;

drop policy if exists "exam_passage_sets staff" on public.exam_passage_sets;
create policy "exam_passage_sets staff" on public.exam_passage_sets for all
  using (public.exam_prep_staff_same_academy(academy_id))
  with check (public.exam_prep_staff_same_academy(academy_id));

-- 학생: 배정된 지문의 세트 조회
drop policy if exists "exam_passage_sets student" on public.exam_passage_sets;
create policy "exam_passage_sets student" on public.exam_passage_sets
  for select using (
    exists (
      select 1
      from public.exam_passages p
      join public.exam_workbooks w on w.passage_id = p.id
      join public.exam_assignments a on a.workbook_id = w.id
      join public.exam_assignment_students s on s.assignment_id = a.id
      where p.set_id = exam_passage_sets.id
        and w.status = 'approved'
        and s.student_id = auth.uid()
    )
  );
