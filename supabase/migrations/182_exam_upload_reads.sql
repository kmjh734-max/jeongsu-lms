-- 올린 자료(스캔 PDF·사진)를 읽은 글을 파일 내용 해시로 담아 둔다.
--
-- 적중 대조를 누를 때마다 같은 파일을 처음부터 다시 읽어 값을 두 번 치렀다(2026-10-02,
-- 구현고 시험지를 두 번 돌리셨다). 같은 파일은 두 번째부터 읽지 않고 여기서 꺼낸다.
-- 글자가 든 PDF는 화면에서 공짜로 뽑으므로 담지 않는다. 원본 그림은 저장하지 않는다.
-- 읽기·쓰기는 서버(서비스 키)에서만 하고, 학원 범위는 코드에서 확인한다.

create table if not exists public.exam_upload_reads (
  academy_id uuid not null references public.academies(id) on delete cascade,
  file_hash text not null,
  name text not null default '',
  pages int not null default 0,
  text text not null default '',
  created_at timestamptz not null default now(),
  primary key (academy_id, file_hash)
);

alter table public.exam_upload_reads enable row level security;
