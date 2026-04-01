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

