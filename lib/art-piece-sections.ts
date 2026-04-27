import { ArtPiece } from "@/@types";

export type HomeQueryArtPiece = ArtPiece & {
  artist_id?: string | null;
};

export function mapRowsToArtPieces(rows: unknown[]): HomeQueryArtPiece[] {
  return (rows ?? []).map((piece) => ({
    ...(piece as Record<string, unknown>),
    artist: (piece as { artist?: unknown }).artist,
  })) as HomeQueryArtPiece[];
}

/**
 * Builds a "featured" set by cycling artists and taking each artist's most recent pieces first.
 */
export function pickFeaturedByArtist(
  items: HomeQueryArtPiece[],
  maxItems: number,
): HomeQueryArtPiece[] {
  const byArtist = new Map<string, HomeQueryArtPiece[]>();
  for (const piece of items) {
    const artistId = piece.artist_id ?? "unknown";
    const list = byArtist.get(artistId) ?? [];
    list.push(piece);
    byArtist.set(artistId, list);
  }

  const selected: HomeQueryArtPiece[] = [];
  const artists = Array.from(byArtist.keys());
  let perArtistCap = 1;

  while (selected.length < maxItems) {
    let pickedThisPass = 0;
    for (const artistId of artists) {
      const pieces = byArtist.get(artistId) ?? [];
      if (pieces.length < perArtistCap) continue;

      const candidate = pieces[perArtistCap - 1];
      if (!candidate) continue;
      if (selected.some((item) => item.id === candidate.id)) continue;

      selected.push(candidate);
      pickedThisPass += 1;
      if (selected.length === maxItems) break;
    }

    if (pickedThisPass === 0) break;
    perArtistCap += 1;
  }

  return selected;
}
