-- enrollments: admin이 전 학원 수강을 보던 is_admin() 정책을 강좌 academy 기준으로 교체

drop policy if exists "Admins select enrollments" on public.enrollments;
drop policy if exists "Admins insert enrollments" on public.enrollments;
drop policy if exists "Admins update enrollments" on public.enrollments;
drop policy if exists "Admins delete enrollments" on public.enrollments;
drop policy if exists "Admins full access enrollments" on public.enrollments;

create policy "Admins select enrollments"
  on public.enrollments for select
  using (
    public.is_super_admin()
    or (
      public.is_academy_admin()
      and exists (
        select 1
        from public.courses c
        where c.id = enrollments.course_id
          and c.academy_id = public.current_user_academy_id()
      )
    )
  );

create policy "Admins insert enrollments"
  on public.enrollments for insert
  with check (
    public.is_super_admin()
    or (
      public.is_academy_admin()
      and exists (
        select 1
        from public.courses c
        where c.id = enrollments.course_id
          and c.academy_id = public.current_user_academy_id()
      )
    )
  );

create policy "Admins update enrollments"
  on public.enrollments for update
  using (
    public.is_super_admin()
    or (
      public.is_academy_admin()
      and exists (
        select 1
        from public.courses c
        where c.id = enrollments.course_id
          and c.academy_id = public.current_user_academy_id()
      )
    )
  )
  with check (
    public.is_super_admin()
    or (
      public.is_academy_admin()
      and exists (
        select 1
        from public.courses c
        where c.id = enrollments.course_id
          and c.academy_id = public.current_user_academy_id()
      )
    )
  );

create policy "Admins delete enrollments"
  on public.enrollments for delete
  using (
    public.is_super_admin()
    or (
      public.is_academy_admin()
      and exists (
        select 1
        from public.courses c
        where c.id = enrollments.course_id
          and c.academy_id = public.current_user_academy_id()
      )
    )
  );
