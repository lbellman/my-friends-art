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
