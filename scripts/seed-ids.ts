/**
 * Must stay in sync with `supabase/seed.sql` (`art_piece.id` + `artist_id`).
 * Used by `scripts/seed-local-storage.ts` for folder paths under `scripts/seed-assets/<artistId>/<artPieceId>/`.
 */
export const SEED_LINK_TEST_ARTIST_ID =
  "10000000-0000-4000-8000-000000000001" as const;

export const SEED_ARTIST_IDS = [
  "10000000-0000-4000-8000-000000000001",
  "20000000-0000-4000-8000-000000000002",
  "30000000-0000-4000-8000-000000000003",
] as const;

/** Order matches `seed.sql` INSERT order (artist 1: five pieces; artists 2–3: four each). */
export const SEED_ART_PIECE_IDS: {
  id: string;
  artistId: (typeof SEED_ARTIST_IDS)[number];
}[] = [
  // Artist 1
  { id: "10100000-0000-4000-8000-000000000001", artistId: SEED_ARTIST_IDS[0] },
  { id: "10100000-0000-4000-8000-000000000002", artistId: SEED_ARTIST_IDS[0] },
  { id: "10100000-0000-4000-8000-000000000003", artistId: SEED_ARTIST_IDS[0] },
  { id: "10100000-0000-4000-8000-000000000004", artistId: SEED_ARTIST_IDS[0] },
  { id: "10100000-0000-4000-8000-000000000005", artistId: SEED_ARTIST_IDS[0] },
  // Artist 2
  { id: "10200000-0000-4000-8000-000000000001", artistId: SEED_ARTIST_IDS[1] },
  { id: "10200000-0000-4000-8000-000000000002", artistId: SEED_ARTIST_IDS[1] },
  { id: "10200000-0000-4000-8000-000000000003", artistId: SEED_ARTIST_IDS[1] },
  { id: "10200000-0000-4000-8000-000000000004", artistId: SEED_ARTIST_IDS[1] },
  // Artist 3
  { id: "10300000-0000-4000-8000-000000000001", artistId: SEED_ARTIST_IDS[2] },
  { id: "10300000-0000-4000-8000-000000000002", artistId: SEED_ARTIST_IDS[2] },
  { id: "10300000-0000-4000-8000-000000000003", artistId: SEED_ARTIST_IDS[2] },
  { id: "10300000-0000-4000-8000-000000000004", artistId: SEED_ARTIST_IDS[2] },
];
