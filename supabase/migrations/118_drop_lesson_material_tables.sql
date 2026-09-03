-- Reset lesson materials feature (code removed, DB drop)

begin;

drop table if exists public.lesson_material_items cascade;
drop table if exists public.lesson_material_projects cascade;
drop table if exists public.lesson_material_folders cascade;

drop function if exists public.teacher_owns_lesson_material_folder(uuid);
drop function if exists public.teacher_can_manage_lesson_material_folder(uuid);
drop function if exists public.teacher_owns_lesson_material_project(uuid);
drop function if exists public.teacher_can_manage_lesson_material_project(uuid);

commit;

