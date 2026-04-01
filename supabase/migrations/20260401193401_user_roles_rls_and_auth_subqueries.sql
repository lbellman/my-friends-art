-- Part A: DB-backed admin roles (Lint 0015 — no user_metadata in RLS)
-- Part B: Wrap auth.uid() / auth.jwt() as (select auth.<function>()) for RLS performance

-- ---------------------------------------------------------------------------
-- user_roles
-- ---------------------------------------------------------------------------

create table public.user_roles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  role text not null check (role = 'admin'),
  created_at timestamptz not null default now()
);

alter table public.user_roles enable row level security;

create policy "Users can read their own user_roles row"
  on public.user_roles
  for select
  to authenticated
  using (user_id = (select auth.uid()));

-- ---------------------------------------------------------------------------
-- Optional backfill: copy admins from auth metadata (one-time)
-- ---------------------------------------------------------------------------

insert into public.user_roles (user_id, role)
select id, 'admin'::text
from auth.users
where (raw_user_meta_data->>'role') = 'admin'
on conflict (user_id) do nothing;

-- ---------------------------------------------------------------------------
-- Public schema: admin policies (EXISTS user_roles, no jwt metadata)
-- ---------------------------------------------------------------------------

drop policy if exists "Admin can delete art pieces" on public.art_piece;
create policy "Admin can delete art pieces"
  on public.art_piece
  for delete
  to authenticated
  using (
    exists (
      select 1
      from public.user_roles ur
      where ur.user_id = (select auth.uid())
        and ur.role = 'admin'
    )
  );

drop policy if exists "Admin sees all art" on public.art_piece;
create policy "Admin sees all art"
  on public.art_piece
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.user_roles ur
      where ur.user_id = (select auth.uid())
        and ur.role = 'admin'
    )
  );

drop policy if exists "Admin can update art pieces" on public.art_piece;
create policy "Admin can update art pieces"
  on public.art_piece
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.user_roles ur
      where ur.user_id = (select auth.uid())
        and ur.role = 'admin'
    )
  )
  with check (
    exists (
      select 1
      from public.user_roles ur
      where ur.user_id = (select auth.uid())
        and ur.role = 'admin'
    )
  );

drop policy if exists "Admin can delete display images" on public.art_piece_display_image;
create policy "Admin can delete display images"
  on public.art_piece_display_image
  for delete
  to authenticated
  using (
    exists (
      select 1
      from public.user_roles ur
      where ur.user_id = (select auth.uid())
        and ur.role = 'admin'
    )
  );

drop policy if exists "Admin can update all display images" on public.art_piece_display_image;
create policy "Admin can update all display images"
  on public.art_piece_display_image
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.user_roles ur
      where ur.user_id = (select auth.uid())
        and ur.role = 'admin'
    )
  )
  with check (
    exists (
      select 1
      from public.user_roles ur
      where ur.user_id = (select auth.uid())
        and ur.role = 'admin'
    )
  );

drop policy if exists "Admin can see all product requests" on public.product_request;
create policy "Admin can see all product requests"
  on public.product_request
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.user_roles ur
      where ur.user_id = (select auth.uid())
        and ur.role = 'admin'
    )
  );

drop policy if exists "Admin can update all product requests" on public.product_request;
create policy "Admin can update all product requests"
  on public.product_request
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.user_roles ur
      where ur.user_id = (select auth.uid())
        and ur.role = 'admin'
    )
  )
  with check (
    exists (
      select 1
      from public.user_roles ur
      where ur.user_id = (select auth.uid())
        and ur.role = 'admin'
    )
  );

drop policy if exists "Admin can update product dimensions" on public.product_dimensions;
create policy "Admin can update product dimensions"
  on public.product_dimensions
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.user_roles ur
      where ur.user_id = (select auth.uid())
        and ur.role = 'admin'
    )
  )
  with check (
    exists (
      select 1
      from public.user_roles ur
      where ur.user_id = (select auth.uid())
        and ur.role = 'admin'
    )
  );

-- ---------------------------------------------------------------------------
-- Public schema: artist / address — (select auth.uid()) only
-- ---------------------------------------------------------------------------

drop policy if exists "Artist can see their own art pieces (all statuses)" on public.art_piece;
create policy "Artist can see their own art pieces (all statuses)"
  on public.art_piece
  for select
  to authenticated
  using (
    artist_id in (
      select artist.id
      from public.artist
      where artist.user_id = (select auth.uid())
    )
  );

drop policy if exists "Artists can delete their own art pieces" on public.art_piece;
create policy "Artists can delete their own art pieces"
  on public.art_piece
  for delete
  to authenticated
  using (
    exists (
      select 1
      from public.artist a
      where a.id = art_piece.artist_id
        and a.user_id = (select auth.uid())
    )
  );

drop policy if exists "Artists can update their own art pieces" on public.art_piece;
create policy "Artists can update their own art pieces"
  on public.art_piece
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.artist a
      where a.id = art_piece.artist_id
        and a.user_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1
      from public.artist a
      where a.id = art_piece.artist_id
        and a.user_id = (select auth.uid())
    )
  );

drop policy if exists "Artists can delete their own display images" on public.art_piece_display_image;
create policy "Artists can delete their own display images"
  on public.art_piece_display_image
  for delete
  to authenticated
  using (
    exists (
      select 1
      from public.art_piece ap
      join public.artist a on a.id = ap.artist_id
      where ap.id = art_piece_display_image.art_piece_id
        and a.user_id = (select auth.uid())
    )
  );

drop policy if exists "Artists can update their own display images" on public.art_piece_display_image;
create policy "Artists can update their own display images"
  on public.art_piece_display_image
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.art_piece ap
      join public.artist a on a.id = ap.artist_id
      where ap.id = art_piece_display_image.art_piece_id
        and a.user_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1
      from public.art_piece ap
      join public.artist a on a.id = ap.artist_id
      where ap.id = art_piece_display_image.art_piece_id
        and a.user_id = (select auth.uid())
    )
  );

drop policy if exists "Artists can see their own product requests" on public.product_request;
create policy "Artists can see their own product requests"
  on public.product_request
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.artist a
      where a.id = product_request.artist_id
        and a.user_id = (select auth.uid())
    )
  );

drop policy if exists "Artists can update their own product requests" on public.product_request;
create policy "Artists can update their own product requests"
  on public.product_request
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.artist a
      where a.id = product_request.artist_id
        and a.user_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1
      from public.artist a
      where a.id = product_request.artist_id
        and a.user_id = (select auth.uid())
    )
  );

drop policy if exists "Artists can update their own product dimensions" on public.product_dimensions;
create policy "Artists can update their own product dimensions"
  on public.product_dimensions
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.art_piece ap
      join public.artist a on a.id = ap.artist_id
      where ap.id = product_dimensions.art_piece_id
        and a.user_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1
      from public.art_piece ap
      join public.artist a on a.id = ap.artist_id
      where ap.id = product_dimensions.art_piece_id
        and a.user_id = (select auth.uid())
    )
  );

drop policy if exists "Artists can update their own profile" on public.artist;
create policy "Artists can update their own profile"
  on public.artist
  for update
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

drop policy if exists "Users can delete own addresses" on public.address;
create policy "Users can delete own addresses"
  on public.address
  for delete
  using ((select auth.uid()) = user_id);

drop policy if exists "Users can insert own addresses" on public.address;
create policy "Users can insert own addresses"
  on public.address
  for insert
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can read own addresses" on public.address;
create policy "Users can read own addresses"
  on public.address
  for select
  using ((select auth.uid()) = user_id);

drop policy if exists "Users can update own addresses" on public.address;
create policy "Users can update own addresses"
  on public.address
  for update
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- ---------------------------------------------------------------------------
-- Storage: admin policies (user_roles)
-- ---------------------------------------------------------------------------

drop policy if exists "Admin can delete all art-pieces objects 1fksyjz_0" on storage.objects;
create policy "Admin can delete all art-pieces objects 1fksyjz_0"
  on storage.objects
  as permissive
  for delete
  to authenticated
  using (
    bucket_id = 'art-pieces'::text
    and exists (
      select 1
      from public.user_roles ur
      where ur.user_id = (select auth.uid())
        and ur.role = 'admin'
    )
  );

drop policy if exists "Admin can delete all art-pieces objects 1fksyjz_1" on storage.objects;
create policy "Admin can delete all art-pieces objects 1fksyjz_1"
  on storage.objects
  as permissive
  for select
  to authenticated
  using (
    bucket_id = 'art-pieces'::text
    and exists (
      select 1
      from public.user_roles ur
      where ur.user_id = (select auth.uid())
        and ur.role = 'admin'
    )
  );

drop policy if exists "Admin can delete all originals objects 1vqg1c2_0" on storage.objects;
create policy "Admin can delete all originals objects 1vqg1c2_0"
  on storage.objects
  as permissive
  for delete
  to authenticated
  using (
    bucket_id = 'originals'::text
    and exists (
      select 1
      from public.user_roles ur
      where ur.user_id = (select auth.uid())
        and ur.role = 'admin'
    )
  );

drop policy if exists "Admin can delete all originals objects 1vqg1c2_1" on storage.objects;
create policy "Admin can delete all originals objects 1vqg1c2_1"
  on storage.objects
  as permissive
  for select
  to authenticated
  using (
    bucket_id = 'originals'::text
    and exists (
      select 1
      from public.user_roles ur
      where ur.user_id = (select auth.uid())
        and ur.role = 'admin'
    )
  );

-- ---------------------------------------------------------------------------
-- Storage: artist policies — (select auth.uid())
-- ---------------------------------------------------------------------------

drop policy if exists "Artists can delete their own art-pieces objects 1fksyjz_0" on storage.objects;
create policy "Artists can delete their own art-pieces objects 1fksyjz_0"
  on storage.objects
  as permissive
  for delete
  to authenticated
  using (
    bucket_id = 'art-pieces'::text
    and exists (
      select 1
      from public.artist a
      where a.user_id = (select auth.uid())
        and (
          objects.name like ((('display/'::text || a.id::text) || '/%'::text))
          or objects.name like ((('thumbnails/'::text || a.id::text) || '/%'::text))
        )
    )
  );

drop policy if exists "Artists can delete their own art-pieces objects 1fksyjz_1" on storage.objects;
create policy "Artists can delete their own art-pieces objects 1fksyjz_1"
  on storage.objects
  as permissive
  for select
  to authenticated
  using (
    bucket_id = 'art-pieces'::text
    and exists (
      select 1
      from public.artist a
      where a.user_id = (select auth.uid())
        and (
          objects.name like ((('display/'::text || a.id::text) || '/%'::text))
          or objects.name like ((('thumbnails/'::text || a.id::text) || '/%'::text))
        )
    )
  );

drop policy if exists "Artists can delete their own originals objects 1vqg1c2_0" on storage.objects;
create policy "Artists can delete their own originals objects 1vqg1c2_0"
  on storage.objects
  as permissive
  for delete
  to authenticated
  using (
    bucket_id = 'originals'::text
    and exists (
      select 1
      from public.artist a
      where a.user_id = (select auth.uid())
        and objects.name like ((a.id::text || '/%'::text))
    )
  );

drop policy if exists "Artists can delete their own originals objects 1vqg1c2_1" on storage.objects;
create policy "Artists can delete their own originals objects 1vqg1c2_1"
  on storage.objects
  as permissive
  for select
  to authenticated
  using (
    bucket_id = 'originals'::text
    and exists (
      select 1
      from public.artist a
      where a.user_id = (select auth.uid())
        and objects.name like ((a.id::text || '/%'::text))
    )
  );

-- ---------------------------------------------------------------------------
-- Grants for user_roles (mirror other public tables in this project)
-- ---------------------------------------------------------------------------

grant all on table public.user_roles to anon;
grant all on table public.user_roles to authenticated;
grant all on table public.user_roles to service_role;
