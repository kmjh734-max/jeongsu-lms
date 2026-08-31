-- Passage items inside a lesson material project (collection)

create table if not exists public.lesson_material_items (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.lesson_material_projects(id) on delete cascade,
  label text,
  title text not null,
  summary text,
  source_passage text,
  content jsonb not null default '{}'::jsonb,
  order_index int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists lesson_material_items_project_id_idx
  on public.lesson_material_items(project_id);
create index if not exists lesson_material_items_updated_at_idx
  on public.lesson_material_items(updated_at desc);

-- Backfill: existing single-passage projects → one item each
insert into public.lesson_material_items (
  project_id, label, title, summary, source_passage, content, order_index
)
select
  p.id,
  p.lesson_label,
  p.title,
  null,
  p.source_passage,
  p.content,
  0
from public.lesson_material_projects p
where coalesce(length(trim(p.source_passage)), 0) > 0
  and not exists (
    select 1 from public.lesson_material_items i where i.project_id = p.id
  );

create or replace function public.teacher_can_manage_lesson_material_item(item_uuid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.lesson_material_items i
    inner join public.lesson_material_projects p on p.id = i.project_id
    where i.id = item_uuid
      and (p.teacher_id = auth.uid() or p.created_by = auth.uid())
  );
$$;

alter table public.lesson_material_items enable row level security;

create policy "Admins select lesson_material_items"
  on public.lesson_material_items for select
  using (
    exists (
      select 1 from public.lesson_material_projects p
      where p.id = project_id
        and public.admin_can_access_academy(p.academy_id)
    )
  );
create policy "Admins insert lesson_material_items"
  on public.lesson_material_items for insert
  with check (
    exists (
      select 1 from public.lesson_material_projects p
      where p.id = project_id
        and public.admin_can_access_academy(p.academy_id)
    )
  );
create policy "Admins update lesson_material_items"
  on public.lesson_material_items for update
  using (
    exists (
      select 1 from public.lesson_material_projects p
      where p.id = project_id
        and public.admin_can_access_academy(p.academy_id)
    )
  )
  with check (
    exists (
      select 1 from public.lesson_material_projects p
      where p.id = project_id
        and public.admin_can_access_academy(p.academy_id)
    )
  );
create policy "Admins delete lesson_material_items"
  on public.lesson_material_items for delete
  using (
    exists (
      select 1 from public.lesson_material_projects p
      where p.id = project_id
        and public.admin_can_access_academy(p.academy_id)
    )
  );

create policy "Teachers select own lesson_material_items"
  on public.lesson_material_items for select
  using (public.is_teacher() and public.teacher_can_manage_lesson_material_item(id));
create policy "Teachers insert lesson_material_items"
  on public.lesson_material_items for insert
  with check (
    public.is_teacher()
    and public.teacher_can_manage_lesson_material_project(project_id)
  );
create policy "Teachers update own lesson_material_items"
  on public.lesson_material_items for update
  using (public.is_teacher() and public.teacher_can_manage_lesson_material_item(id))
  with check (public.is_teacher() and public.teacher_can_manage_lesson_material_item(id));
create policy "Teachers delete own lesson_material_items"
  on public.lesson_material_items for delete
  using (public.is_teacher() and public.teacher_can_manage_lesson_material_item(id));
