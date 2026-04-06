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