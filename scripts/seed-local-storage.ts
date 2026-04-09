/**
 * Uploads local seed images into Supabase Storage using the same paths as
 * app/api/submit-art-piece/route.ts, then updates art_piece (paths + px_width/px_height)
 * and art_piece_display_image. DPI and aspect_ratio are no longer stored on art_piece
 * (see migration art_piece_cleanup_and_additions).
 *
 * Prereqs: supabase start, supabase db reset (seed.sql applied).
 * Env: NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY (Secret `sb_secret_…` or service JWT from `supabase status`).
 *     Not Storage (S3) keys. Loads .env, .env.local, .env.development.local.
 *
 * Also uploads each seed artist profile to bucket `profile-pictures` at
 * `profiles/<artistId>/profile.webp` and updates `artist.profile_img_url`.
 * Source: optional `scripts/seed-assets/<artistId>/profile.*`, else first
 * `display-0.*` from that artist’s first art piece folder (see README).
 *
 * Run: pnpm seed:local-assets
 */
import { config as loadEnv } from "dotenv";
import { createClient } from "@supabase/supabase-js";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

import type { Database } from "../supabase";
import { SEED_ARTIST_IDS, SEED_ART_PIECE_IDS } from "./seed-ids";

const cwd = process.cwd();
loadEnv({ path: path.join(cwd, ".env") });
loadEnv({ path: path.join(cwd, ".env.local"), override: true });
loadEnv({ path: path.join(cwd, ".env.development.local"), override: true });

function isLikelyJwt(key: string): boolean {
  const parts = key.trim().split(".");
  return parts.length === 3 && parts.every((p) => p.length > 0);
}

function isServiceRoleKey(key: string): boolean {
  const k = key.trim();
  return k.startsWith("sb_secret_") || isLikelyJwt(k);
}

function resolveServiceRoleKey(): string {
  return (
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ??
    process.env.SERVICE_ROLE_KEY?.trim() ??
    ""
  );
}

const DISPLAY_RE = /^display-(\d+)\.(jpe?g|png|webp)$/i;
const ORIGINAL_RE = /^original\.(jpe?g|png|webp|tiff?)$/i;
const PROFILE_RE = /^profile\.(jpe?g|png|webp)$/i;

/** Tried first (deterministic) before readdir + regex, so profile wins over display fallback. */
const PROFILE_FILENAMES = [
  "profile.jpg",
  "profile.jpeg",
  "profile.png",
  "profile.webp",
] as const;

function profileObjectPath(artistId: string): string {
  return `profiles/${artistId}/profile.webp`;
}

async function readProfileSourceBuffer(
  assetsRoot: string,
  artistId: string,
): Promise<Buffer | null> {
  const artistDir = path.join(assetsRoot, artistId);

  for (const name of PROFILE_FILENAMES) {
    try {
      return await fs.readFile(path.join(artistDir, name));
    } catch {
      /* try next filename or fall through to readdir */
    }
  }

  let artistEntries: string[];
  try {
    artistEntries = await fs.readdir(artistDir);
  } catch {
    return null;
  }

  const profileName = artistEntries.find((n) => PROFILE_RE.test(n));
  if (profileName) {
    return fs.readFile(path.join(artistDir, profileName));
  }

  const firstPiece = SEED_ART_PIECE_IDS.find((p) => p.artistId === artistId);
  if (!firstPiece) return null;

  const pieceDir = path.join(assetsRoot, artistId, firstPiece.id);
  let pieceEntries: string[];
  try {
    pieceEntries = await fs.readdir(pieceDir);
  } catch {
    return null;
  }

  const displayFiles = pieceEntries
    .filter((name) => DISPLAY_RE.test(name))
    .sort((a, b) => {
      const ia = parseInt(a.match(DISPLAY_RE)?.[1] ?? "0", 10);
      const ib = parseInt(b.match(DISPLAY_RE)?.[1] ?? "0", 10);
      return ia - ib;
    });

  if (displayFiles.length === 0) return null;
  return fs.readFile(path.join(pieceDir, displayFiles[0]));
}

function mimeForOriginalFilename(name: string): string {
  const m = name.match(ORIGINAL_RE);
  const ext = (m?.[1] ?? "").toLowerCase();
  switch (ext) {
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "png":
      return "image/png";
    case "webp":
      return "image/webp";
    case "tif":
    case "tiff":
      return "image/tiff";
    default:
      return "application/octet-stream";
  }
}

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const serviceKey = resolveServiceRoleKey();

  if (!url || !serviceKey) {
    console.error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY (or SERVICE_ROLE_KEY).",
    );
    process.exit(1);
  }

  if (!isServiceRoleKey(serviceKey)) {
    console.error(
      "SUPABASE_SERVICE_ROLE_KEY must be the Secret key (sb_secret_…) or a service-role JWT — not the anon/publishable key or S3 keys.",
    );
    process.exit(1);
  }

  const supabase = createClient<Database>(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // Resolve next to this script so `pnpm`/tsx runs work even when cwd is not the repo root.
  const scriptDir = path.dirname(fileURLToPath(import.meta.url));
  const assetsRoot = path.join(scriptDir, "seed-assets");
  let ok = 0;
  let skipped = 0;

  for (const { id: artPieceId, artistId } of SEED_ART_PIECE_IDS) {
    const pieceDir = path.join(assetsRoot, artistId, artPieceId);
    let entries: string[];
    try {
      entries = await fs.readdir(pieceDir);
    } catch {
      console.warn(
        `[skip] No folder for ${artistId}/${artPieceId} — add images under scripts/seed-assets/<artistId>/<artPieceId>/`,
      );
      skipped++;
      continue;
    }

    const displayFiles = entries
      .filter((name) => DISPLAY_RE.test(name))
      .sort((a, b) => {
        const ia = parseInt(a.match(DISPLAY_RE)?.[1] ?? "0", 10);
        const ib = parseInt(b.match(DISPLAY_RE)?.[1] ?? "0", 10);
        return ia - ib;
      });

    if (displayFiles.length === 0) {
      console.warn(
        `[skip] No display-0.jpg … display-N.jpg in ${pieceDir}`,
      );
      skipped++;
      continue;
    }

    const displayBuffers: Buffer[] = [];
    for (const name of displayFiles) {
      const buf = await fs.readFile(path.join(pieceDir, name));
      displayBuffers.push(buf);
    }

    const firstMeta = await sharp(displayBuffers[0]).metadata();
    const width = firstMeta.width ?? 0;
    const height = firstMeta.height ?? 0;
    if (!width || !height) {
      console.warn(`[skip] Could not read dimensions for ${artPieceId}`);
      skipped++;
      continue;
    }

    const finalDisplayPaths: string[] = [];
    const uploadedPublic: string[] = [];
    let displayUploadFailed = false;

    for (let idx = 0; idx < displayBuffers.length; idx++) {
      const displayPath = `display/${artistId}/${artPieceId}/${idx}.webp`;
      const displayBuffer = await sharp(displayBuffers[idx])
        .resize({ width: 1600 })
        .webp({ quality: 90 })
        .toBuffer();

      const up = await supabase.storage
        .from("art-pieces")
        .upload(displayPath, displayBuffer, {
          contentType: "image/webp",
          upsert: true,
        });
      if (up.error) {
        console.error(`[error] upload ${displayPath}:`, up.error.message);
        await supabase.storage.from("art-pieces").remove(uploadedPublic);
        skipped++;
        displayUploadFailed = true;
        break;
      }
      uploadedPublic.push(displayPath);
      finalDisplayPaths.push(displayPath);
    }

    if (displayUploadFailed) continue;

    const thumbnailPath = `thumbnails/${artistId}/${artPieceId}.webp`;
    const thumbnailBuffer = await sharp(displayBuffers[0])
      .resize({ width: 800 })
      .webp({ quality: 80 })
      .toBuffer();

    const thumbUp = await supabase.storage
      .from("art-pieces")
      .upload(thumbnailPath, thumbnailBuffer, {
        contentType: "image/webp",
        upsert: true,
      });
    if (thumbUp.error) {
      console.error(`[error] thumbnail ${thumbnailPath}:`, thumbUp.error.message);
      await supabase.storage.from("art-pieces").remove(uploadedPublic);
      skipped++;
      continue;
    }
    uploadedPublic.push(thumbnailPath);

    let originalPath: string | null = null;
    const originalEntry = entries.find((n) => ORIGINAL_RE.test(n));
    if (originalEntry) {
      const raw = await fs.readFile(path.join(pieceDir, originalEntry));
      originalPath = `${artistId}/${artPieceId}`;
      const origUp = await supabase.storage
        .from("originals")
        .upload(originalPath, raw, {
          contentType: mimeForOriginalFilename(originalEntry),
          upsert: true,
        });
      if (origUp.error) {
        console.warn(`[warn] originals upload:`, origUp.error.message);
        originalPath = null;
      }
    }

    const { error: updErr } = await supabase
      .from("art_piece")
      .update({
        display_path: finalDisplayPaths[0] ?? null,
        thumbnail_path: thumbnailPath,
        original_path: originalPath,
        px_width: width,
        px_height: height,
      })
      .eq("id", artPieceId);

    if (updErr) {
      console.error(`[error] art_piece update ${artPieceId}:`, updErr.message);
      skipped++;
      continue;
    }

    await supabase
      .from("art_piece_display_image")
      .delete()
      .eq("art_piece_id", artPieceId);

    const rows = finalDisplayPaths.map((p, idx) => ({
      art_piece_id: artPieceId,
      idx,
      path: p,
    }));

    const { error: imgErr } = await supabase
      .from("art_piece_display_image")
      .insert(rows);

    if (imgErr) {
      console.error(`[error] art_piece_display_image ${artPieceId}:`, imgErr.message);
      skipped++;
      continue;
    }

    console.log(`[ok] ${artPieceId}`);
    ok++;
  }

  let profileOk = 0;
  let profileSkipped = 0;

  for (const artistId of SEED_ARTIST_IDS) {
    const sourceBuf = await readProfileSourceBuffer(assetsRoot, artistId);
    if (!sourceBuf) {
      console.warn(
        `[skip] No profile source for ${artistId} — add profile.jpg (or .png/.webp) under scripts/seed-assets/<artistId>/ or ensure the first art piece has display-0.*`,
      );
      profileSkipped++;
      continue;
    }

    const objectPath = profileObjectPath(artistId);
    const profileBuffer = await sharp(sourceBuf)
      .resize(512, 512, { fit: "cover", position: "attention" })
      .webp({ quality: 85 })
      .toBuffer();

    const up = await supabase.storage
      .from("profile-pictures")
      .upload(objectPath, profileBuffer, {
        contentType: "image/webp",
        upsert: true,
      });

    if (up.error) {
      console.error(`[error] profile upload ${objectPath}:`, up.error.message);
      profileSkipped++;
      continue;
    }

    const { error: artistErr } = await supabase
      .from("artist")
      .update({ profile_img_url: objectPath })
      .eq("id", artistId);

    if (artistErr) {
      console.error(`[error] artist update ${artistId}:`, artistErr.message);
      profileSkipped++;
      continue;
    }

    console.log(`[ok] profile ${artistId}`);
    profileOk++;
  }

  console.log(
    `\nDone. Art pieces uploaded: ${ok}, skipped: ${skipped}. Profiles uploaded: ${profileOk}, skipped: ${profileSkipped}`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
