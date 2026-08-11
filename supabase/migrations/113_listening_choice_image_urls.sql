-- 듣기 그림 문항: 생성된 이미지 공개 URL
-- high1 4번(그림 불일치): 보통 1장 (라벨 ①–⑤ 합성 장면)
-- middle 1·2번: 선택지별 최대 5장

alter table public.listening_questions
  add column if not exists choice_image_urls jsonb not null default '[]'::jsonb;

comment on column public.listening_questions.choice_image_urls is
  'Generated public image URLs parallel to choice_image_prompts (1 for high1 type4 composite, 5 for middle choice images)';

insert into storage.buckets (id, name, public)
values ('listening-images', 'listening-images', true)
on conflict (id) do nothing;

drop policy if exists "Public read listening images" on storage.objects;
create policy "Public read listening images"
  on storage.objects for select
  using (bucket_id = 'listening-images');

drop policy if exists "Admins upload listening images" on storage.objects;
create policy "Admins upload listening images"
  on storage.objects for insert
  with check (bucket_id = 'listening-images' and public.is_admin());

drop policy if exists "Admins update listening images" on storage.objects;
create policy "Admins update listening images"
  on storage.objects for update
  using (bucket_id = 'listening-images' and public.is_admin());

drop policy if exists "Admins delete listening images" on storage.objects;
create policy "Admins delete listening images"
  on storage.objects for delete
  using (bucket_id = 'listening-images' and public.is_admin());
