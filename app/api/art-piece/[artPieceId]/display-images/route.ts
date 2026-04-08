import { MAX_DISPLAY_IMAGES } from "@/@types";
import { tokens } from "@/config";
import type { Database } from "@/supabase";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import sharp from "sharp";

const SUPABASE_URL = tokens.supabaseUrl;
const SUPABASE_SERVICE_ROLE_KEY = tokens.supabaseServiceRoleKey;
const SUPABASE_ANON_KEY = tokens.supabaseAnonKey;

const STAGING_BUCKET = "art-piece-staging";

const supabase = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
);

function isValidStagingPath(stagingPath: string, artistId: string): boolean {
  if (!stagingPath.startsWith(`staging/${artistId}/`)) return false;
  const segments = stagingPath.split("/");
  if (segments.length !== 3) return false;
  return segments[2].length > 0;
}

export async function PATCH(
  req: Request,
  segmentData: { params: Promise<{ artPieceId: string }> },
) {
  const stagedPathsForCleanup: string[] = [];

  try {
    const { artPieceId } = await segmentData.params;

    const requestBody = await req.json().catch(() => null);
    const displayStagingPaths = Array.isArray(requestBody?.displayStagingPaths)
      ? (requestBody.displayStagingPaths as unknown[])
          .map((p) => String(p).trim())
          .filter(Boolean)
      : [];

    if (displayStagingPaths.length === 0) {
      return NextResponse.json(
        { error: "At least one display image is required." },
        { status: 400 },
      );
    }

    if (displayStagingPaths.length > MAX_DISPLAY_IMAGES) {
      return NextResponse.json(
        { error: `At most ${MAX_DISPLAY_IMAGES} display images are allowed.` },
        { status: 400 },
      );
    }

    const authHeader = req.headers.get("authorization");
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.slice("Bearer ".length)
      : undefined;

    if (!token) {
      return NextResponse.json(
        { error: "You must be signed in to update display images." },
        { status: 401 },
      );
    }

    const supabaseForAuth = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    });

    const {
      data: { user },
    } = await supabaseForAuth.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "You must be signed in to update display images." },
        { status: 401 },
      );
    }

    const { data: artist, error: artistError } = await supabase
      .from("artist")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (artistError || !artist) {
      return NextResponse.json(
        {
          error:
            "No artist profile found for this user. Please contact support if this is unexpected.",
        },
        { status: 403 },
      );
    }

    const artistId = artist.id;

    const { data: artPiece, error: pieceError } = await supabase
      .from("art_piece")
      .select("id, artist_id")
      .eq("id", artPieceId)
      .single();

    if (pieceError || !artPiece) {
      return NextResponse.json({ error: "Art piece not found." }, { status: 404 });
    }

    if (artPiece.artist_id !== artistId) {
      return NextResponse.json(
        { error: "You do not have access to this art piece." },
        { status: 403 },
      );
    }

    for (const p of displayStagingPaths) {
      if (!isValidStagingPath(p, artistId)) {
        return NextResponse.json(
          { error: "Invalid display staging path." },
          { status: 403 },
        );
      }
      stagedPathsForCleanup.push(p);
    }

    // Get the existing display images for the art piece
    const { data: existingRows, error: existingErr } = await supabase
      .from("art_piece_display_image")
      .select("idx")
      .eq("art_piece_id", artPieceId);

    if (existingErr) {
      console.error(existingErr);
      return NextResponse.json(
        { error: "Failed to read existing display images." },
        { status: 500 },
      );
    }

    // Get the count of the existing display images
    const previousMaxIdx =
      (existingRows ?? []).length > 0
        ? Math.max(...(existingRows ?? []).map((r) => r.idx))
        : -1;

    const displayBuffers: Buffer[] = [];

    for (const path of displayStagingPaths) {
      // Download the file from the staging bucket
      const stagedDownload = await supabase.storage
        .from(STAGING_BUCKET)
        .download(path);
      if (stagedDownload.error || !stagedDownload.data) {
        console.error(stagedDownload.error);
        return NextResponse.json(
          { error: "Unable to read staged display image." },
          { status: 400 },
        );
      }
      // Convert the file to a buffer
      const ab = await stagedDownload.data.arrayBuffer();
      displayBuffers.push(Buffer.from(ab));
    }

    // Get the metadata for the first image
    const firstMeta = await sharp(displayBuffers[0]).metadata();
    const width = firstMeta.width ?? 0;
    const height = firstMeta.height ?? 0;
    if (!width || !height) {
      return NextResponse.json(
        { error: "Unable to read image dimensions." },
        { status: 400 },
      );
    }

    const newCount = displayBuffers.length;
    const finalDisplayPaths: string[] = [];


    // For each new file, upload it to the art-pieces bucket
    for (let idx = 0; idx < displayBuffers.length; idx++) {
      const displayPath = `display/${artistId}/${artPieceId}/${idx}.webp`;
      const displayBuffer = await sharp(displayBuffers[idx])
        .resize({ width: 1600 })
        .webp({ quality: 90 })
        .toBuffer();

      const displayUpload = await supabase.storage
        .from("art-pieces")
        .upload(displayPath, displayBuffer, {
          contentType: "image/webp",

          // Upsert true, means that if the file already exists, it will be overwritten
          upsert: true,
        });
      if (displayUpload.error) {
        console.error(displayUpload.error);
        return NextResponse.json(
          { error: "Failed to upload display image." },
          { status: 500 },
        );
      }
      finalDisplayPaths.push(displayPath);
    }

    
    // Remove any orphaned files that are no longer referenced by the art piece
    for (let idx = newCount; idx <= previousMaxIdx; idx++) {
      const orphanPath = `display/${artistId}/${artPieceId}/${idx}.webp`;
      const { error: removeErr } = await supabase.storage
        .from("art-pieces")
        .remove([orphanPath]);
      if (removeErr) {
        console.warn("Remove extra display image:", removeErr.message);
      }
    }

    // Create the thumbnail image based on the first display image
    const thumbnailPath = `thumbnails/${artistId}/${artPieceId}.webp`;
    const thumbnailBuffer = await sharp(displayBuffers[0])
      .resize({ width: 800 })
      .webp({ quality: 80 })
      .toBuffer();

    const thumbUpload = await supabase.storage
      .from("art-pieces")
      .upload(thumbnailPath, thumbnailBuffer, {
        contentType: "image/webp",
        upsert: true,
      });
    if (thumbUpload.error) {
      console.error(thumbUpload.error);
      return NextResponse.json(
        { error: "Failed to upload thumbnail image." },
        { status: 500 },
      );
    }

    // Delete the existing display image records (will be replaced by the new ones)
    const { error: delRowsErr } = await supabase
      .from("art_piece_display_image")
      .delete()
      .eq("art_piece_id", artPieceId);

    if (delRowsErr) {
      console.error(delRowsErr);
      return NextResponse.json(
        { error: "Failed to update display image records." },
        { status: 500 },
      );
    }

    const displayImageRows = finalDisplayPaths.map((path, idx) => ({
      art_piece_id: artPieceId,
      idx,
      path,
    }));
    
    // Insert the new display image records 
    const displayImgInsert = await supabase
      .from("art_piece_display_image")
      .insert(displayImageRows);

    if (displayImgInsert.error) {
      console.error(displayImgInsert.error);
      return NextResponse.json(
        { error: "Failed to save display image records." },
        { status: 500 },
      );
    }

    // Update the art piece with the new display image paths and dimensions
    const { error: updatePieceErr } = await supabase
      .from("art_piece")
      .update({
        display_path: finalDisplayPaths[0] ?? null,
        thumbnail_path: thumbnailPath,
        px_width: width,
        px_height: height,
      })
      .eq("id", artPieceId);

    if (updatePieceErr) {
      console.error(updatePieceErr);
      return NextResponse.json(
        { error: "Failed to update art piece." },
        { status: 500 },
      );
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Unexpected error while updating display images." },
      { status: 500 },
    );
  } finally {
    // Cleanup the staging paths
    if (stagedPathsForCleanup.length > 0) {
      await supabase.storage
        .from(STAGING_BUCKET)
        .remove([...new Set(stagedPathsForCleanup)]);
    }
  }
}
