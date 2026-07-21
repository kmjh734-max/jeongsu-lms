-- Child-table academy scope: replace bare is_admin() admin policies with
-- parent academy checks so academy admins cannot cross tenants.

-- ---------------------------------------------------------------------------
-- class_students / class_courses via classes.academy_id
-- ---------------------------------------------------------------------------
drop policy if exists "Admins select class_students" on public.class_students;
drop policy if exists "Admins insert class_students" on public.class_students;
drop policy if exists "Admins update class_students" on public.class_students;
drop policy if exists "Admins delete class_students" on public.class_students;
drop policy if exists "Admins full access class_students" on public.class_students;

create policy "Admins select class_students"
  on public.class_students for select
  using (
    public.is_super_admin()
    or exists (
      select 1 from public.classes c
      where c.id = class_students.class_id
        and public.admin_can_access_academy(c.academy_id)
    )
  );

create policy "Admins insert class_students"
  on public.class_students for insert
  with check (
    public.is_super_admin()
    or exists (
      select 1 from public.classes c
      where c.id = class_students.class_id
        and public.admin_can_access_academy(c.academy_id)
    )
  );

create policy "Admins update class_students"
  on public.class_students for update
  using (
    public.is_super_admin()
    or exists (
      select 1 from public.classes c
      where c.id = class_students.class_id
        and public.admin_can_access_academy(c.academy_id)
    )
  )
  with check (
    public.is_super_admin()
    or exists (
      select 1 from public.classes c
      where c.id = class_students.class_id
        and public.admin_can_access_academy(c.academy_id)
    )
  );

create policy "Admins delete class_students"
  on public.class_students for delete
  using (
    public.is_super_admin()
    or exists (
      select 1 from public.classes c
      where c.id = class_students.class_id
        and public.admin_can_access_academy(c.academy_id)
    )
  );

drop policy if exists "Admins select class_courses" on public.class_courses;
drop policy if exists "Admins insert class_courses" on public.class_courses;
drop policy if exists "Admins update class_courses" on public.class_courses;
drop policy if exists "Admins delete class_courses" on public.class_courses;

create policy "Admins select class_courses"
  on public.class_courses for select
  using (
    public.is_super_admin()
    or exists (
      select 1 from public.classes c
      where c.id = class_courses.class_id
        and public.admin_can_access_academy(c.academy_id)
    )
  );

create policy "Admins insert class_courses"
  on public.class_courses for insert
  with check (
    public.is_super_admin()
    or exists (
      select 1 from public.classes c
      where c.id = class_courses.class_id
        and public.admin_can_access_academy(c.academy_id)
    )
  );

create policy "Admins update class_courses"
  on public.class_courses for update
  using (
    public.is_super_admin()
    or exists (
      select 1 from public.classes c
      where c.id = class_courses.class_id
        and public.admin_can_access_academy(c.academy_id)
    )
  )
  with check (
    public.is_super_admin()
    or exists (
      select 1 from public.classes c
      where c.id = class_courses.class_id
        and public.admin_can_access_academy(c.academy_id)
    )
  );

create policy "Admins delete class_courses"
  on public.class_courses for delete
  using (
    public.is_super_admin()
    or exists (
      select 1 from public.classes c
      where c.id = class_courses.class_id
        and public.admin_can_access_academy(c.academy_id)
    )
  );

-- ---------------------------------------------------------------------------
-- vocab_items / vocab_assignments via vocab_sets.academy_id
-- ---------------------------------------------------------------------------
drop policy if exists "Admins select vocab_items" on public.vocab_items;
drop policy if exists "Admins insert vocab_items" on public.vocab_items;
drop policy if exists "Admins update vocab_items" on public.vocab_items;
drop policy if exists "Admins delete vocab_items" on public.vocab_items;
drop policy if exists "Admins manage vocab_items" on public.vocab_items;

create policy "Admins manage vocab_items"
  on public.vocab_items for all
  using (
    public.is_super_admin()
    or exists (
      select 1 from public.vocab_sets vs
      where vs.id = vocab_items.set_id
        and public.admin_can_access_academy(vs.academy_id)
    )
  )
  with check (
    public.is_super_admin()
    or exists (
      select 1 from public.vocab_sets vs
      where vs.id = vocab_items.set_id
        and public.admin_can_access_academy(vs.academy_id)
    )
  );

drop policy if exists "Admins select vocab_assignments" on public.vocab_assignments;
drop policy if exists "Admins insert vocab_assignments" on public.vocab_assignments;
drop policy if exists "Admins update vocab_assignments" on public.vocab_assignments;
drop policy if exists "Admins delete vocab_assignments" on public.vocab_assignments;
drop policy if exists "Admins manage vocab_assignments" on public.vocab_assignments;

create policy "Admins manage vocab_assignments"
  on public.vocab_assignments for all
  using (
    public.is_super_admin()
    or exists (
      select 1 from public.vocab_sets vs
      where vs.id = vocab_assignments.set_id
        and public.admin_can_access_academy(vs.academy_id)
    )
  )
  with check (
    public.is_super_admin()
    or exists (
      select 1 from public.vocab_sets vs
      where vs.id = vocab_assignments.set_id
        and public.admin_can_access_academy(vs.academy_id)
    )
  );

-- ---------------------------------------------------------------------------
-- listening_questions / segments / assignments
-- ---------------------------------------------------------------------------
drop policy if exists "Admins select listening_questions" on public.listening_questions;
drop policy if exists "Admins insert listening_questions" on public.listening_questions;
drop policy if exists "Admins update listening_questions" on public.listening_questions;
drop policy if exists "Admins delete listening_questions" on public.listening_questions;
drop policy if exists "Admins manage listening_questions" on public.listening_questions;
drop policy if exists "Admins manage all listening questions" on public.listening_questions;

create policy "Admins manage listening_questions"
  on public.listening_questions for all
  using (
    public.is_super_admin()
    or exists (
      select 1 from public.listening_sets ls
      where ls.id = listening_questions.set_id
        and public.admin_can_access_academy(ls.academy_id)
    )
  )
  with check (
    public.is_super_admin()
    or exists (
      select 1 from public.listening_sets ls
      where ls.id = listening_questions.set_id
        and public.admin_can_access_academy(ls.academy_id)
    )
  );

drop policy if exists "Admins select listening_question_segments"
  on public.listening_question_segments;
drop policy if exists "Admins insert listening_question_segments"
  on public.listening_question_segments;
drop policy if exists "Admins update listening_question_segments"
  on public.listening_question_segments;
drop policy if exists "Admins delete listening_question_segments"
  on public.listening_question_segments;
drop policy if exists "Admins manage listening_question_segments"
  on public.listening_question_segments;
drop policy if exists "Admins manage all listening question segments"
  on public.listening_question_segments;

create policy "Admins manage listening_question_segments"
  on public.listening_question_segments for all
  using (
    public.is_super_admin()
    or exists (
      select 1
      from public.listening_questions lq
      join public.listening_sets ls on ls.id = lq.set_id
      where lq.id = listening_question_segments.question_id
        and public.admin_can_access_academy(ls.academy_id)
    )
  )
  with check (
    public.is_super_admin()
    or exists (
      select 1
      from public.listening_questions lq
      join public.listening_sets ls on ls.id = lq.set_id
      where lq.id = listening_question_segments.question_id
        and public.admin_can_access_academy(ls.academy_id)
    )
  );

drop policy if exists "Admins select listening_assignments" on public.listening_assignments;
drop policy if exists "Admins insert listening_assignments" on public.listening_assignments;
drop policy if exists "Admins update listening_assignments" on public.listening_assignments;
drop policy if exists "Admins delete listening_assignments" on public.listening_assignments;
drop policy if exists "Admins manage listening_assignments" on public.listening_assignments;
drop policy if exists "Admins manage all listening assignments"
  on public.listening_assignments;

create policy "Admins manage listening_assignments"
  on public.listening_assignments for all
  using (
    public.is_super_admin()
    or exists (
      select 1 from public.listening_sets ls
      where ls.id = listening_assignments.set_id
        and public.admin_can_access_academy(ls.academy_id)
    )
  )
  with check (
    public.is_super_admin()
    or exists (
      select 1 from public.listening_sets ls
      where ls.id = listening_assignments.set_id
        and public.admin_can_access_academy(ls.academy_id)
    )
  );

-- ---------------------------------------------------------------------------
-- Teachers read peer teachers: same academy only
-- ---------------------------------------------------------------------------
drop policy if exists "Teachers read peer teachers" on public.profiles;
create policy "Teachers read peer teachers"
  on public.profiles for select
  using (
    role = 'teacher'
    and public.current_user_role() = 'teacher'
    and academy_id is not null
    and academy_id = public.current_user_academy_id()
  );
