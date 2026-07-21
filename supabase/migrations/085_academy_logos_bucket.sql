-- Public logos for academy branding (print / parent reports)
insert into storage.buckets (id, name, public)
values ('academy-logos', 'academy-logos', true)
on conflict (id) do nothing;

drop policy if exists "Public read academy logos" on storage.objects;
create policy "Public read academy logos"
  on storage.objects for select
  using (bucket_id = 'academy-logos');

-- Uploads use service-role API (super-admin). No client insert policies.
