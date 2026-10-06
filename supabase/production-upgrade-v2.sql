-- M4X BIO editor upgrade. Run once in Supabase SQL Editor.
alter table public.profiles add column if not exists status_text text default 'Đang online · Có thể nhắn mình';
alter table public.profiles add column if not exists music_title text;
alter table public.profiles add column if not exists music_artist text;
alter table public.profiles add column if not exists music_url text;
alter table public.profiles add column if not exists bank_name text;
alter table public.profiles add column if not exists bank_account text;
alter table public.profiles add column if not exists bank_holder text;
alter table public.profiles add column if not exists qr_url text;

insert into storage.buckets (id,name,public) values ('bio-media','bio-media',true) on conflict (id) do update set public=true;
drop policy if exists "bio media public read" on storage.objects;
create policy "bio media public read" on storage.objects for select using (bucket_id='bio-media');
drop policy if exists "bio media own insert" on storage.objects;
create policy "bio media own insert" on storage.objects for insert to authenticated with check (bucket_id='bio-media' and (storage.foldername(name))[1]=auth.uid()::text);
drop policy if exists "bio media own update" on storage.objects;
create policy "bio media own update" on storage.objects for update to authenticated using (bucket_id='bio-media' and (storage.foldername(name))[1]=auth.uid()::text);
drop policy if exists "bio media own delete" on storage.objects;
create policy "bio media own delete" on storage.objects for delete to authenticated using (bucket_id='bio-media' and (storage.foldername(name))[1]=auth.uid()::text);
