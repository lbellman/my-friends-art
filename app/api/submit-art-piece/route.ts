import { NextResponse } from "next/server";
import sharp from "sharp";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/supabase";
import useEmailJS from "@/app/hooks/useEmailJS";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

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

export async function POST(req: Request) {
  const { sendEmail } = useEmailJS();
  try {
    const formData = await req.formData();

    const file = formData.get("image");
    if (!(file instanceof Blob)) {
      return NextResponse.json(
        { error: "Missing image file." },
        { status: 400 },
      );
    }

    const title = String(formData.get("title") ?? "").trim();
    const description = String(formData.get("description") ?? "").trim();
    const medium = formData.get(
      "medium",
    ) as Database["public"]["Enums"]["art_mediums"];
    // const productType = (formData.get("product_type") ||
    //   null) as Database["public"]["Enums"]["product_types"] | null;

    if (!title || !medium) {
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

    // Convert File/Blob to Buffer for Sharp
    const arrayBuffer = await file.arrayBuffer();
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

    // Create display and thumbnail versions as webp
    const displayBuffer = await image
    .resize({ width: 1600 })
    .webp({ quality: 90 })
    .toBuffer();
    
    const thumbnailBuffer = await image
      .resize({ width: 800 })
      .webp({ quality: 80 })
      .toBuffer();

    const id = crypto.randomUUID();

    // Paths for original images in the private "originals" bucket
    const originalPath = `${artistId}/${id}`;

    // Paths for display and thumbnail images in the public "art-pieces" bucket
    const displayPath = `display/${artistId}/${id}.webp`;
    const thumbnailPath = `thumbnails/${artistId}/${id}.webp`;

    // Upload original (unconverted) image to private "originals" bucket
    const originalUpload = await supabase.storage
      .from("originals")
      .upload(originalPath, buffer, {
        contentType: file.type || "application/octet-stream",
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


    // If uploads are successful, create an art_piece in the DB with status = "pending-approval"
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
      
      // Remove the uploaded images from the buckets
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
  }
}

