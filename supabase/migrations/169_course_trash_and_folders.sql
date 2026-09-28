-- 동영상강좌 관리 개편 (2026-09-28)
--
-- 1) 휴지통·보관
--    삭제를 영영 지우기에서 옮기기로 바꾼다. 지금은 확인 창 한 번에 학생 진도 기록까지
--    사라지고 되돌릴 수 없었다. 수업자료(lesson_material_documents)에서 이미 쓰는
--    deleted_at 방식을 그대로 따른다.
--    보관(archived_at)은 끝난 강좌를 목록에서 접어 두는 자리다. 듣던 학생은 계속 본다.
--
-- 2) 카테고리를 폴더로
--    지금은 강좌마다 글자를 직접 적어, 이름을 바꾸려면 강좌를 하나하나 고쳐야 했고
--    「내신」과 「내신 」이 다른 카테고리가 됐다. 단어학습·듣기학습 폴더와 같은 표로 바꾼다.

alter table public.courses add column if not exists deleted_at timestamptz;
alter table public.courses add column if not exists archived_at timestamptz;
alter table public.courses add column if not exists order_index int not null default 0;

create index if not exists courses_academy_alive_idx
  on public.courses (academy_id, deleted_at, archived_at);

-- ---------------------------------------------------------------------------
-- 강좌 폴더 (카테고리)
-- ---------------------------------------------------------------------------
create table if not exists public.course_folders (
  id uuid primary key default gen_random_uuid(),
  academy_id uuid not null references public.academies(id) on delete cascade,
  name text not null,
  order_index int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists course_folders_academy_idx
  on public.course_folders (academy_id, order_index);

create unique index if not exists course_folders_academy_name_idx
  on public.course_folders (academy_id, name);

alter table public.courses
  add column if not exists folder_id uuid references public.course_folders(id) on delete set null;

create index if not exists courses_folder_idx on public.courses (folder_id);

-- 지금 적혀 있는 카테고리 글자를 폴더로 옮겨 담는다(선생님이 할 일은 없다)
insert into public.course_folders (academy_id, name, order_index)
select c.academy_id, btrim(c.category), 0
from public.courses c
where c.academy_id is not null
  and c.category is not null
  and btrim(c.category) <> ''
group by c.academy_id, btrim(c.category)
on conflict (academy_id, name) do nothing;

update public.courses c
set folder_id = f.id
from public.course_folders f
where c.folder_id is null
  and c.academy_id = f.academy_id
  and btrim(coalesce(c.category, '')) = f.name;

-- 폴더 차례: 학원마다 이름순으로 한 번 매겨 둔다(뒤에 화면에서 바꾼다)
with ordered as (
  select id, row_number() over (partition by academy_id order by name) as rn
  from public.course_folders
)
update public.course_folders f
set order_index = ordered.rn
from ordered
where f.id = ordered.id;

-- 강좌 차례: 만든 날 최신순을 그대로 첫 순서로 삼는다
with ordered as (
  select id, row_number() over (partition by academy_id order by created_at desc) as rn
  from public.courses
)
update public.courses c
set order_index = ordered.rn
from ordered
where c.id = ordered.id;

-- ---------------------------------------------------------------------------
-- RLS — 폴더는 같은 학원 직원만
-- ---------------------------------------------------------------------------
alter table public.course_folders enable row level security;

drop policy if exists "Staff manage course folders" on public.course_folders;
create policy "Staff manage course folders"
  on public.course_folders
  for all
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.role in ('admin', 'teacher')
        and p.academy_id = course_folders.academy_id
    )
  )
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.role in ('admin', 'teacher')
        and p.academy_id = course_folders.academy_id
    )
  );
