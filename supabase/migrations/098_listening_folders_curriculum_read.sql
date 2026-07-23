-- Teachers may read listening folders that hold locked curriculum sets in their academy
create or replace function public.teacher_can_read_listening_folder(folder_uuid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.listening_set_folders f
    join public.profiles p on p.id = auth.uid()
    where f.id = folder_uuid
      and (
        f.teacher_id = auth.uid()
        or f.created_by = auth.uid()
        or (
          f.academy_id is not null
          and p.academy_id is not null
          and f.academy_id = p.academy_id
          and exists (
            select 1
            from public.listening_sets s
            where s.folder_id = f.id
              and s.is_locked = true
              and s.academy_id = f.academy_id
          )
        )
      )
  );
$$;

drop policy if exists "Teachers select own listening_set_folders"
  on public.listening_set_folders;
create policy "Teachers select own listening_set_folders"
  on public.listening_set_folders for select
  using (
    public.is_teacher()
    and public.teacher_can_read_listening_folder(id)
  );
