-- Run once in Supabase SQL Editor for an existing M4X BIO database.
create policy "own profile insert" on public.profiles for insert with check (auth.uid() = id);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, username, display_name)
  values (
    new.id,
    lower(regexp_replace(coalesce(new.raw_user_meta_data->>'username','user_' || substr(new.id::text,1,8)),'[^a-z0-9_-]','','g')),
    coalesce(new.raw_user_meta_data->>'display_name',new.raw_user_meta_data->>'username','M4X User')
  ) on conflict (id) do nothing;
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();
