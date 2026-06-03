-- Performance: common filter columns + vocab item counts RPC

-- lesson_progress: student course page (filter by student's lessons in course)
create index if not exists lesson_progress_student_lesson_idx
  on public.lesson_progress(student_id, lesson_id);

-- lessons: published lessons per course
create index if not exists lessons_course_published_order_idx
  on public.lessons(course_id, is_published, order_index)
  where is_published = true;

-- enrollments: course roster
create index if not exists enrollments_course_student_idx
  on public.enrollments(course_id, student_id);

-- vocab_items: count by set
create index if not exists vocab_items_set_id_idx
  on public.vocab_items(set_id);

-- vocab_progress: student + item lookups
create index if not exists vocab_progress_student_item_idx
  on public.vocab_progress(student_id, item_id);

-- sections per course
create index if not exists sections_course_order_idx
  on public.sections(course_id, order_index);

-- student list search (admin)
create index if not exists profiles_student_name_idx
  on public.profiles(name)
  where role = 'student';

-- RPC: item counts for given set ids (RLS applies via security invoker)
create or replace function public.count_vocab_items_by_set_ids(set_ids uuid[])
returns table(set_id uuid, item_count bigint)
language sql
stable
security invoker
set search_path = public
as $$
  select vi.set_id, count(*)::bigint as item_count
  from public.vocab_items vi
  where vi.set_id = any(set_ids)
  group by vi.set_id;
$$;

grant execute on function public.count_vocab_items_by_set_ids(uuid[]) to authenticated;
