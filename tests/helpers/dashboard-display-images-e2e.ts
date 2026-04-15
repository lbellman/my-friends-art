import fs from "fs";
import path from "path";

import { getServiceSupabase } from "./supabase-admin";

/** Keep in sync with `MAX_DISPLAY_IMAGES` in @types.tsx */
const MAX_DISPLAY_IMAGES_E2E = 5;

const FIXTURE_WEBP = path.join(process.cwd(), "tests/fixtures/tiny.webp");

/**
 * Creates an approved print art piece owned by `artistId` with `displayImageCount`
 * real objects in `art-pieces` and matching `art_piece_display_image` rows.
 */
export async function setupArtPieceWithDisplayImages(
  artistId: string,
  displayImageCount: number,
): Promise<string> {
  if (
    displayImageCount < 1 ||
    displayImageCount > MAX_DISPLAY_IMAGES_E2E
  ) {
    throw new Error(
      `displayImageCount must be 1–${MAX_DISPLAY_IMAGES_E2E}, got ${displayImageCount}`,
    );
  }

  const supabase = getServiceSupabase();
  const artPieceId = crypto.randomUUID();
  const buffer = fs.readFileSync(FIXTURE_WEBP);

  const displayPaths = Array.from({ length: displayImageCount }, (_, idx) =>
    `display/${artistId}/${artPieceId}/${idx}.webp`,
  );

  for (const p of displayPaths) {
    const { error } = await supabase.storage.from("art-pieces").upload(p, buffer, {
      contentType: "image/webp",
      upsert: true,
    });
    if (error) {
      throw new Error(`upload ${p}: ${error.message}`);
    }
  }

  const thumbnailPath = `thumbnails/${artistId}/${artPieceId}.webp`;
  {
    const { error } = await supabase.storage
      .from("art-pieces")
      .upload(thumbnailPath, buffer, {
        contentType: "image/webp",
        upsert: true,
      });
    if (error) {
      throw new Error(`upload thumbnail: ${error.message}`);
    }
  }

  const { error: insertPieceErr } = await supabase.from("art_piece").insert({
    id: artPieceId,
    title: "E2E display images",
    artist_id: artistId,
    status: "approved",
    product_type: "print",
    category: "wall-art",
    size: "one-size",
    px_width: 8,
    px_height: 8,
    description: "Playwright display image E2E.",
    not_ai_generated: true,
    authorized_to_sell: true,
    display_path: displayPaths[0],
    thumbnail_path: thumbnailPath,
    original_path: null,
    product_dimensions_id: null,
  });
  if (insertPieceErr) {
    throw insertPieceErr;
  }

  const { error: insertImgErr } = await supabase
    .from("art_piece_display_image")
    .insert(
      displayPaths.map((p, idx) => ({
        art_piece_id: artPieceId,
        idx,
        path: p,
      })),
    );
  if (insertImgErr) {
    throw insertImgErr;
  }

  return artPieceId;
}

export async function setupArtPieceWithThreeDisplayImages(
  artistId: string,
): Promise<string> {
  return setupArtPieceWithDisplayImages(artistId, 3);
}

/**
 * Deletes the `art_piece` row (cascades `art_piece_display_image`; DB trigger removes
 * `display_path` + `thumbnail_path` from Storage), then removes any remaining objects
 * under the piece’s display folder (extra gallery keys are not covered by the trigger).
 */
export async function removeDisplayArtPiece(
  artistId: string,
  artPieceId: string,
): Promise<void> {
  const supabase = getServiceSupabase();
  await supabase.from("art_piece").delete().eq("id", artPieceId);

  const folder = `display/${artistId}/${artPieceId}`;
  const { data: listed } = await supabase.storage.from("art-pieces").list(folder);
  const objectPaths = (listed ?? []).map((f) => `${folder}/${f.name}`);
  if (objectPaths.length > 0) {
    await supabase.storage.from("art-pieces").remove(objectPaths);
  }

  await supabase.storage
    .from("art-pieces")
    .remove([`thumbnails/${artistId}/${artPieceId}.webp`]);
}
