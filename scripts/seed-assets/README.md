# Local seed images

Place source files so paths match **artist id** and **art piece id** from [`supabase/seed.sql`](../../supabase/seed.sql) (same IDs as [`scripts/seed-ids.ts`](../seed-ids.ts)):

```
scripts/seed-assets/
  <artist-uuid>/
    profile.jpg        # optional; .png / .webp — profile picture (preferred)
    <art-piece-uuid>/
      display-0.jpg      # required; .png / .webp also work
      display-1.jpg      # optional second display
      original.jpg       # optional → originals bucket (print-quality)
```

- **Profile photos:** Optional `profile.*` at the artist folder root is uploaded to bucket `profile-pictures` at `profiles/<artistId>/profile.webp`, and `artist.profile_img_url` is updated. If `profile.*` is missing, the script falls back to the first art piece’s `display-0.*` for that artist (same folder layout as above).  
- **Naming:** `display-0`, `display-1`, … (sorted by number).  
- **Optional `original.*`:** uploaded to bucket `originals` at object key `{artistId}/{artPieceId}` (same as production).  
- **Buckets:** `art-pieces` (public), `profile-pictures` (public), `originals` (private), and `art-piece-staging` (private, for submit flow) are created in [`supabase/seed.sql`](../../supabase/seed.sql) so uploads succeed after `supabase db reset`.  
- If a piece folder is missing or has no `display-0.*`, that piece is skipped with a warning.

After `supabase db reset` (see [Seeding Local Database](../../README.md#seeding-local-database)), run:

```bash
pnpm seed:local-assets
```


