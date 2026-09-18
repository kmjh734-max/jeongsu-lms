-- 강사가 자기 반 학생의 계정(이름·아이디)을 읽을 수 있게 한다.
-- 원장님이 등록한 학생을 강사 반에 넣으면, 지금까지는 강사 화면(단어·듣기 현황 등)에서 이름이 비어 보였다
-- (강사는 '내가 등록한 학생'과 '내 강좌 수강생'만 읽을 수 있었다).

create or replace function public.teacher_has_student_in_class(p_student_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.class_students cs
    join public.classes c on c.id = cs.class_id
    where cs.student_id = p_student_id
      and c.teacher_id = auth.uid()
  );
$$;

drop policy if exists "Teachers read students in own classes" on public.profiles;
create policy "Teachers read students in own classes"
  on public.profiles for select
  using (
    public.is_teacher()
    and role = 'student'
    and public.teacher_has_student_in_class(id)
  );
