-- 변형문제 jobs/questions에 academy_id + admin RLS 학원 경계
-- (기존 is_admin() 단독 정책이 학원 간 목록 노출을 허용하던 문제 수정)

alter table public.question_generation_jobs
  add column if not exists academy_id uuid references public.academies(id) on delete set null;

alter table public.generated_english_questions
  add column if not exists academy_id uuid references public.academies(id) on delete set null;

create index if not exists question_generation_jobs_academy_id_idx
  on public.question_generation_jobs(academy_id);

create index if not exists generated_english_questions_academy_id_idx
  on public.generated_english_questions(academy_id);

-- 백필: 작성자 프로필 → 지문 academy_id 순
update public.question_generation_jobs j
set academy_id = p.academy_id
from public.profiles p
where j.academy_id is null
  and j.created_by = p.id
  and p.academy_id is not null;

update public.question_generation_jobs j
set academy_id = esp.academy_id
from public.english_source_passages esp
where j.academy_id is null
  and j.passage_id = esp.id
  and esp.academy_id is not null;

update public.generated_english_questions q
set academy_id = p.academy_id
from public.profiles p
where q.academy_id is null
  and q.created_by = p.id
  and p.academy_id is not null;

update public.generated_english_questions q
set academy_id = j.academy_id
from public.question_generation_jobs j
where q.academy_id is null
  and q.generation_job_id = j.id
  and j.academy_id is not null;

update public.generated_english_questions q
set academy_id = esp.academy_id
from public.english_source_passages esp
where q.academy_id is null
  and q.passage_id = esp.id
  and esp.academy_id is not null;

-- 남는 행: jeongsu 폴백
do $$
declare
  jeongsu_id uuid;
begin
  select id into jeongsu_id from public.academies where slug = 'jeongsu' limit 1;
  if jeongsu_id is not null then
    update public.question_generation_jobs
    set academy_id = jeongsu_id
    where academy_id is null;

    update public.generated_english_questions
    set academy_id = jeongsu_id
    where academy_id is null;
  end if;
end $$;

alter table public.question_generation_jobs
  alter column academy_id set not null;

alter table public.generated_english_questions
  alter column academy_id set not null;

-- RLS: jobs
drop policy if exists "Admins manage generation jobs" on public.question_generation_jobs;
create policy "Admins manage generation jobs"
  on public.question_generation_jobs for all
  using (public.admin_can_access_academy(academy_id))
  with check (public.admin_can_access_academy(academy_id));

-- RLS: questions
drop policy if exists "Admins manage generated questions" on public.generated_english_questions;
create policy "Admins manage generated questions"
  on public.generated_english_questions for all
  using (public.admin_can_access_academy(academy_id))
  with check (public.admin_can_access_academy(academy_id));

-- presets: teacher도 자기 학원(+본인 생성)만
drop policy if exists "Staff read presets" on public.question_generation_presets;
create policy "Staff read presets"
  on public.question_generation_presets for select
  using (
    public.admin_can_access_academy(academy_id)
    or (
      public.is_teacher()
      and (
        academy_id = public.current_user_academy_id()
        or created_by = auth.uid()
      )
    )
  );
