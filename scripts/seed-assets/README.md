# Local seed images

Place source files so paths match **artist id** and **art piece id** from [`supabase/seed.sql`](../../supabase/seed.sql) (same IDs as [`scripts/seed-ids.ts`](../seed-ids.ts)):

```
scripts/seed-assets/
  <artist-uuid>/
    <art-piece-uuid>/
      display-0.jpg      # required; .png / .webp also work
      display-1.jpg      # optional second display
      original.jpg       # optional → originals bucket (print-quality)
```

- **Naming:** `display-0`, `display-1`, … (sorted by number).  
- **Optional `original.*`:** uploaded to bucket `originals` at object key `{artistId}/{artPieceId}` (same as production).  
- **Buckets:** `art-pieces` (public), `originals` (private), and `art-piece-staging` (private, for submit flow) are created in [`supabase/seed.sql`](../../supabase/seed.sql) so uploads succeed after `supabase db reset`.  
- If a piece folder is missing or has no `display-0.*`, that piece is skipped with a warning.

After `supabase db reset` (see [Seeding Local Database](../../README.md#seeding-local-database)), run:

```bash
pnpm seed:local-assets
```


