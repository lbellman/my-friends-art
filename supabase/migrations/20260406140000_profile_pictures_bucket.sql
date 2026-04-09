-- Public bucket for artist profile photos (object keys: profiles/<artist_id>/…)
insert into storage.buckets (id, name, public)
values ('profile-pictures', 'profile-pictures', true)
on conflict (id) do nothing;

-- Public read (same pattern as art-pieces)
drop policy if exists "Public read on profile pictures" on storage.objects;
create policy "Public read on profile pictures"
  on storage.objects
  as permissive
  for select
  to public
  using (bucket_id = 'profile-pictures'::text);

-- Admin (user_roles)
drop policy if exists "Admin can delete all profile-pictures objects 0" on storage.objects;
create policy "Admin can delete all profile-pictures objects 0"
  on storage.objects
  as permissive
  for delete
  to authenticated
  using (
    bucket_id = 'profile-pictures'::text
    and exists (
      select 1
      from public.user_roles ur
      where ur.user_id = (select auth.uid())
        and ur.role = 'admin'
    )
  );

drop policy if exists "Admin can delete all profile-pictures objects 1" on storage.objects;
create policy "Admin can delete all profile-pictures objects 1"
  on storage.objects
  as permissive
  for select
  to authenticated
  using (
    bucket_id = 'profile-pictures'::text
    and exists (
      select 1
      from public.user_roles ur
      where ur.user_id = (select auth.uid())
        and ur.role = 'admin'
    )
  );

-- Artists: own folder only
drop policy if exists "Artists can manage their own profile-pictures objects 0" on storage.objects;
create policy "Artists can manage their own profile-pictures objects 0"
  on storage.objects
  as permissive
  for delete
  to authenticated
  using (
    bucket_id = 'profile-pictures'::text
    and exists (
      select 1
      from public.artist a
      where a.user_id = (select auth.uid())
        and objects.name like (('profiles/'::text || a.id::text) || '/%'::text)
    )
  );

drop policy if exists "Artists can manage their own profile-pictures objects 1" on storage.objects;
create policy "Artists can manage their own profile-pictures objects 1"
  on storage.objects
  as permissive
  for select
  to authenticated
  using (
    bucket_id = 'profile-pictures'::text
    and exists (
      select 1
      from public.artist a
      where a.user_id = (select auth.uid())
        and objects.name like (('profiles/'::text || a.id::text) || '/%'::text)
    )
  );

  -- Allow artists (and admins) to upload / replace profile images in storage.
-- INSERT + UPDATE cover new uploads and upsert overwrites.

-- ---------------------------------------------------------------------------
-- Admin
-- ---------------------------------------------------------------------------

drop policy if exists "Admin can insert all profile-pictures objects" on storage.objects;
create policy "Admin can insert all profile-pictures objects"
  on storage.objects
  as permissive
  for insert
  to authenticated
  with check (
    bucket_id = 'profile-pictures'::text
    and exists (
      select 1
      from public.user_roles ur
      where ur.user_id = (select auth.uid())
        and ur.role = 'admin'
    )
  );

drop policy if exists "Admin can update all profile-pictures objects" on storage.objects;
create policy "Admin can update all profile-pictures objects"
  on storage.objects
  as permissive
  for update
  to authenticated
  using (
    bucket_id = 'profile-pictures'::text
    and exists (
      select 1
      from public.user_roles ur
      where ur.user_id = (select auth.uid())
        and ur.role = 'admin'
    )
  )
  with check (
    bucket_id = 'profile-pictures'::text
    and exists (
      select 1
      from public.user_roles ur
      where ur.user_id = (select auth.uid())
        and ur.role = 'admin'
    )
  );

-- ---------------------------------------------------------------------------
-- Artists: own folder only (profiles/<artist_id>/…)
-- ---------------------------------------------------------------------------

drop policy if exists "Artists can insert their own profile-pictures objects" on storage.objects;
create policy "Artists can insert their own profile-pictures objects"
  on storage.objects
  as permissive
  for insert
  to authenticated
  with check (
    bucket_id = 'profile-pictures'::text
    and exists (
      select 1
      from public.artist a
      where a.user_id = (select auth.uid())
        and objects.name like (('profiles/'::text || a.id::text) || '/%'::text)
    )
  );

drop policy if exists "Artists can update their own profile-pictures objects" on storage.objects;
create policy "Artists can update their own profile-pictures objects"
  on storage.objects
  as permissive
  for update
  to authenticated
  using (
    bucket_id = 'profile-pictures'::text
    and exists (
      select 1
      from public.artist a
      where a.user_id = (select auth.uid())
        and objects.name like (('profiles/'::text || a.id::text) || '/%'::text)
    )
  )
  with check (
    bucket_id = 'profile-pictures'::text
    and exists (
      select 1
      from public.artist a
      where a.user_id = (select auth.uid())
        and objects.name like (('profiles/'::text || a.id::text) || '/%'::text)
    )
  );

