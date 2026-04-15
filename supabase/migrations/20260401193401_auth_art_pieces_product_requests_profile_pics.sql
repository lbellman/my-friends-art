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

-------------------------------- ART PIECE CLEANUP AND ADDITIONS --------------------------------

-- Create art_piece_categories enum and add to art_piece table
create type public.art_piece_categories as enum ('wall-art', 'sculpture-and-ceramics', 'textiles-and-fiber', 'clothing-and-wearables', 'jewelry', 'home-and-decor', 'furniture', 'paper-goods', 'other');
alter table public.art_piece add column category public.art_piece_categories;

-- Default all existing art pieces to 'wall-art' category
update public.art_piece set category = 'wall-art';

-- Create art_piece_sizes enum and add to art_piece table
create type public.art_piece_sizes as enum ('made-to-measure', 'one-size', 'xs', 'sm', 'md', 'lg', 'xl', 'childs-xs', 'childs-sm', 'childs-md', 'childs-lg', 'childs-xl', 'womans-xs', 'womans-sm', 'womans-md', 'womans-lg', 'womans-xl', 'mens-xs', 'mens-sm', 'mens-md', 'mens-lg', 'mens-xl', 'other');
alter table public.art_piece add column size public.art_piece_sizes;

-- Edit the rpc_search_art_pieces function to no longer return aspect_ratio and dpi columns
drop function if exists public.rpc_search_art_pieces(text);
create or replace function "public"."rpc_search_art_pieces"("query" "text") returns table("title" "text", "thumbnail_path" "text", "display_path" "text", "category" "public"."art_piece_categories", "size" "public"."art_piece_sizes", "art_piece_id" "uuid", "px_height" integer, "px_width" integer, "artist_name" "text", "artist_id" "uuid")
    language "sql" stable
    as $$
  select ap.title, ap.thumbnail_path, ap.display_path, ap.category, ap.size, ap.id, ap.px_height, ap.px_width, a.name, a.id
  from art_piece ap
  join artist a on ap.artist_id = a.id
  where to_tsvector('english', coalesce(ap.title, '') || ' ' || coalesce(a.name, ''))
    @@ plainto_tsquery('english', query);
$$;


-- Remove aspect_ratio and DPI columns from art_piece table (no longer used -- these values are inferred from the px_width and px_height) 
alter table public.art_piece drop column aspect_ratio;
alter table public.art_piece drop column dpi;
alter table public.art_piece drop column medium;


-- Remove the art_mediums enum
drop type public.art_mediums;


-- Delete the print_dimensions table 
drop table public.print_dimensions;

-- Delete get_dimension_options function (dimension options are calculated on the NextJS server)
drop function public.get_dimension_options;

-- Delete the aspect_ratio enum (no longer used)
drop type public.aspect_ratios;

-- Add 'made-to-order' to product_type enum
alter type public.product_types add value 'made-to-order';

-- Remove all instances of 'print-and-original' from art_piece. 
-- We will implement print/original art pieces in a future code push, the value will stay in the enum, but just not be used.
-- Find all rows in art_piece table where product_type is 'print-and-original' and set them to 'print'
update public.art_piece set product_type = 'original' where product_type = 'print-and-original';

-- Add "sold" status to art_piece_statuses enum
alter type public.art_piece_statuses add value 'sold';




------------------ INSERT PRODUCT DIMENSIONS --------------------------------

-- Allow artists to create product_dimensions rows when editing their art from the dashboard
-- (previously only UPDATE existed; INSERT was only done via service-role API).
create policy "Artists can insert product dimensions for their art pieces"
  on public.product_dimensions
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.art_piece ap
      join public.artist a on a.id = ap.artist_id
      where ap.id = product_dimensions.art_piece_id
        and a.user_id = (select auth.uid())
    )
  );

  -- Add archived state to art_piece_statuses enum
  alter type public.art_piece_statuses add value 'archived';


  -- Add custom-order type to product_request_types enum
  alter type public.product_request_types add value 'custom-order';


-- Add RLS policy public can update product_dimensions 
-- This is so that if the email fails, the public can update the status of the request to "email-failed"
create policy "Public can update product request status"
  on public.product_request
  for update
  to public
  using (
    true
  );


--------------------- PRODUCT REQUEST DELETE POLICIES ------------------------------------
  -- Allow artists and admins to delete product requests (used when cancelling a request).

drop policy if exists "Admin can delete all product requests" on public.product_request;
create policy "Admin can delete all product requests"
  on public.product_request
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

drop policy if exists "Artists can delete their own product requests" on public.product_request;
create policy "Artists can delete their own product requests"
  on public.product_request
  for delete
  to authenticated
  using (
    exists (
      select 1
      from public.artist a
      where a.id = product_request.artist_id
        and a.user_id = (select auth.uid())
    )
  );

---------------------------------- PROFILE PICTURES BUCKET ------------------------------------

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

