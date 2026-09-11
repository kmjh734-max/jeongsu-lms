-- 수업용 자료 · 지문 분석서 · 워크북을 "만든 파일" 단위로 저장한다.
--
-- 지금까지 자료함의 수업용자료·분석서 탭은 지문(프로젝트)마다 한 줄이었고, 워크북은
-- 서버에 저장되지 않고 브라우저(localStorage)에만 남았다. 선생님이 지문 여러 개를
-- 골라 만든 결과를 "수업용자료_0911" 같은 이름의 파일 하나로 두고 다시 열거나 이름을
-- 바꿀 수 있게 한다.
--
-- kind: lesson_pack | analysis_report | workbook
-- project_ids: 만들 때 고른 지문(순서 유지)
-- payload: 워크북은 생성 결과(WorkbookData) 전체. 수업용 자료·분석서는 지문별로 이미
--          lesson_pack_json / analysis_report_json에 저장되므로 비워 둔다.
-- source_query: 워크북을 만든 조건(유형·옵션)의 쿼리 문자열. 결과가 없을 때 다시 만들 때 쓴다.

begin;

create table if not exists public.lesson_material_documents (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('lesson_pack', 'analysis_report', 'workbook')),
  name text not null,
  project_ids uuid[] not null default '{}',
  payload jsonb,
  source_query text,
  teacher_id uuid references public.profiles(id) on delete set null,
  created_by uuid references public.profiles(id) on delete set null,
  academy_id uuid not null references public.academies(id) on delete cascade,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists lesson_material_documents_academy_kind_idx
  on public.lesson_material_documents(academy_id, kind, created_at desc);
create index if not exists lesson_material_documents_created_by_idx
  on public.lesson_material_documents(created_by);

alter table public.lesson_material_documents enable row level security;

drop policy if exists "Admins select lesson_material_documents" on public.lesson_material_documents;
create policy "Admins select lesson_material_documents"
  on public.lesson_material_documents for select
  using (public.admin_can_access_academy(academy_id));

drop policy if exists "Admins insert lesson_material_documents" on public.lesson_material_documents;
create policy "Admins insert lesson_material_documents"
  on public.lesson_material_documents for insert
  with check (public.admin_can_access_academy(academy_id));

drop policy if exists "Admins update lesson_material_documents" on public.lesson_material_documents;
create policy "Admins update lesson_material_documents"
  on public.lesson_material_documents for update
  using (public.admin_can_access_academy(academy_id))
  with check (public.admin_can_access_academy(academy_id));

drop policy if exists "Admins delete lesson_material_documents" on public.lesson_material_documents;
create policy "Admins delete lesson_material_documents"
  on public.lesson_material_documents for delete
  using (public.admin_can_access_academy(academy_id));

drop policy if exists "Teachers select own lesson_material_documents" on public.lesson_material_documents;
create policy "Teachers select own lesson_material_documents"
  on public.lesson_material_documents for select
  using (public.is_teacher() and (teacher_id = auth.uid() or created_by = auth.uid()));

drop policy if exists "Teachers insert lesson_material_documents" on public.lesson_material_documents;
create policy "Teachers insert lesson_material_documents"
  on public.lesson_material_documents for insert
  with check (
    public.is_teacher()
    and created_by = auth.uid()
    and (teacher_id is null or teacher_id = auth.uid())
    and academy_id is not null
  );

drop policy if exists "Teachers update own lesson_material_documents" on public.lesson_material_documents;
create policy "Teachers update own lesson_material_documents"
  on public.lesson_material_documents for update
  using (public.is_teacher() and (teacher_id = auth.uid() or created_by = auth.uid()))
  with check (public.is_teacher() and (teacher_id = auth.uid() or created_by = auth.uid()));

drop policy if exists "Teachers delete own lesson_material_documents" on public.lesson_material_documents;
create policy "Teachers delete own lesson_material_documents"
  on public.lesson_material_documents for delete
  using (public.is_teacher() and (teacher_id = auth.uid() or created_by = auth.uid()));

commit;
