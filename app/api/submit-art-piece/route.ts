import { NextResponse } from "next/server";
import sharp from "sharp";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/supabase";
import useEmailJS from "@/app/hooks/useEmailJS";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
// Temporary upload bucket where the browser places raw bytes before finalize.
const STAGING_BUCKET = "art-piece-staging";

const supabase = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
);

function inferAspectRatio(
  width: number,
  height: number,
): Database["public"]["Enums"]["aspect_ratios"] | null {
  const ratio = width / height;
  if (Math.abs(ratio - 1) < 0.01) return "1:1";
  if (Math.abs(ratio - 2 / 3) < 0.01) return "2:3";
  if (Math.abs(ratio - 3 / 4) < 0.01) return "3:4";
  
  return "3:4";
}

function isValidStagingPath(stagingPath: string, artistId: string): boolean {
  // Require exact prefix ownership: only paths under this artist namespace are valid.
  if (!stagingPath.startsWith(`staging/${artistId}/`)) return false;
  const segments = stagingPath.split("/");
  // Enforce fixed shape: staging/{artistId}/{objectId}
  if (segments.length !== 3) return false;
  return segments[2].length > 0;
}

export async function POST(req: Request) {
  const { sendEmail } = useEmailJS();
  // Keep track of path so that we can cleanup the temporary image after the database record has been created
  let stagedPathForCleanup: string | null = null;
  try {
    const requestBody = await req.json().catch(() => null);
    const title = String(requestBody?.title ?? "").trim();
    const description = String(requestBody?.description ?? "").trim();
    const medium = requestBody?.medium as Database["public"]["Enums"]["art_mediums"];
    const stagingPath = String(requestBody?.stagingPath ?? "").trim();

    if (!title || !medium || !stagingPath) {
      return NextResponse.json(
        { error: "Missing required fields." },
        { status: 400 },
      );
    }

    // Derive the artist from the authenticated user instead of trusting form input.
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.slice("Bearer ".length)
      : undefined;

    if (!token) {
      return NextResponse.json(
        { error: "You must be signed in to submit art." },
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
        { error: "You must be signed in to submit art." },
        { status: 401 },
      );
    }

    const { data: artist, error: artistError } = await supabase
      .from("artist")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (artistError || !artist) {
      // eslint-disable-next-line no-console
      console.error(artistError);
      return NextResponse.json(
        {
          error:
            "No artist profile found for this user. Please contact support if this is unexpected.",
        },
        { status: 403 },
      );
    }

    const artistId = artist.id;
    if (!isValidStagingPath(stagingPath, artistId)) {
      return NextResponse.json(
        { error: "Invalid staging path." },
        { status: 403 },
      );
    }
    stagedPathForCleanup = stagingPath;

    // Get the image from the staging bucket using the staging path
    const stagedDownload = await supabase.storage
      .from(STAGING_BUCKET)
      .download(stagingPath);
    if (stagedDownload.error || !stagedDownload.data) {
      console.error(stagedDownload.error);
      return NextResponse.json(
        { error: "Unable to read staged image." },
        { status: 400 },
      );
    }

    // Convert File/Blob to Buffer for Sharp
    const arrayBuffer = await stagedDownload.data.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const image = sharp(buffer);
    const metadata = await image.metadata();

    const width = metadata.width ?? 0;
    const height = metadata.height ?? 0;
    if (!width || !height) {
      return NextResponse.json(
        { error: "Unable to read image dimensions." },
        { status: 400 },
      );
    }

    const dpi = 300;

    const aspectRatio = inferAspectRatio(width, height);

    // Create display and thumbnail derivatives from the original image
    const displayBuffer = await image
    .resize({ width: 1600 })
    .webp({ quality: 90 })
    .toBuffer();
    
    const thumbnailBuffer = await image
      .resize({ width: 800 })
      .webp({ quality: 80 })
      .toBuffer();

    const id = crypto.randomUUID();

    // Persist the raw original image in the private "originals" bucket
    const originalPath = `${artistId}/${id}`;

    // Persist the display and thumbnail images in the public "art-pieces" bucket
    const displayPath = `display/${artistId}/${id}.webp`;
    const thumbnailPath = `thumbnails/${artistId}/${id}.webp`;

    // Upload the original image to the private "originals" bucket
    const originalUpload = await supabase.storage
      .from("originals")
      .upload(originalPath, buffer, {
        contentType: stagedDownload.data.type || "application/octet-stream",
        upsert: false,
      });
    if (originalUpload.error) {
      console.error(originalUpload.error);
      return NextResponse.json(
        { error: "Failed to upload original image." },
        { status: 500 },
      );
    }

    // Upload display image to public "art-pieces" bucket
    const displayUpload = await supabase.storage
      .from("art-pieces")
      .upload(displayPath, displayBuffer, {
        contentType: "image/webp",
        upsert: false,
      });
    if (displayUpload.error) {
      console.error(displayUpload.error);
      return NextResponse.json(
        { error: "Failed to upload display image." },
        { status: 500 },
      );
    }

    // Upload thumbnail image to public "art-pieces" bucket
    const thumbUpload = await supabase.storage
      .from("art-pieces")
      .upload(thumbnailPath, thumbnailBuffer, {
        contentType: "image/webp",
        upsert: false,
      });
    if (thumbUpload.error) {
      console.error(thumbUpload.error);
      return NextResponse.json(
        { error: "Failed to upload thumbnail image." },
        { status: 500 },
      );
    }


    // If all uploads succeed, create a database record for the art piece "pending-approval"
    const insert = await supabase
      .from("art_piece")
      .insert({
        artist_id: artistId,
        title,
        description,
        medium,
        product_type: "print",
        status: "pending-approval",
        px_width: width,
        px_height: height,
        dpi,
        aspect_ratio: aspectRatio as Database["public"]["Enums"]["aspect_ratios"],
        display_path: displayPath,
        thumbnail_path: thumbnailPath,
        original_path: originalPath,
      })
      .select("id")
      .single();

    if (insert.error || !insert.data) {
      console.error(insert.error);
      
      // Delete the images from the buckets if the database record creation fails 
      await supabase.storage.from("originals").remove([originalPath]);
      await supabase.storage.from("art-pieces").remove([displayPath, thumbnailPath]);

      return NextResponse.json(
        { error: "Failed to upload art piece. Contact bellmanlindsey@gmail.com if this issue persists." },
        { status: 500 },
      );
    }

    const messageBody = [
      "New Art Piece Submitted",
      "---",
      `Artist ID: ${artistId}`,
      `Art Piece ID: ${insert.data.id}`,
      "---",
      `Title: ${title}`,
      `Description: ${description}`,
      `Medium: ${medium}`,
      `Product Type: print`,
      `Width: ${width}`,
      `Height: ${height}`,
      `Aspect Ratio: ${aspectRatio}`,
      `Display Path: ${displayPath}`,
      `Thumbnail Path: ${thumbnailPath}`,
    ].join("\n");

    // Send me an email to notify me that a new art piece has been submitted for review
    sendEmail({
      name: "",
      fromEmail: "",
      toEmail: "bellmanlindsey@gmail.com",
      subject: `New Art Piece Submitted`,
      message: messageBody,
      onSuccess: () => {
        console.log("Email sent successfully");
      },
      onError: () => {
        console.error("Failed to send email");
      },
      accessToken: process.env.EMAILJS_PRIVATE_KEY,
      setIsSubmitting: () => {},
    });

    return NextResponse.json({ id: insert.data.id }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Unexpected error while submitting art piece." },
      { status: 500 },
    );
  } finally {
    if (stagedPathForCleanup) {
      // Cleanup the temporary image from the staging bucket regardless of success or failure
      await supabase.storage.from(STAGING_BUCKET).remove([stagedPathForCleanup]);
    }
  }
}

