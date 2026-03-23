import { NextResponse } from "next/server";
import sharp from "sharp";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/supabase";
import useEmailJS from "@/app/hooks/useEmailJS";
import { ProductType } from "@/@types";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const STAGING_BUCKET = "art-piece-staging";

const supabase = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
);

type ProductTypeEnum = Database["public"]["Enums"]["product_types"];

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
  if (!stagingPath.startsWith(`staging/${artistId}/`)) return false;
  const segments = stagingPath.split("/");
  if (segments.length !== 3) return false;
  return segments[2].length > 0;
}

function requiresPrintQualityFile(productType: ProductType | null): boolean {
  return productType === "print" || productType === "print-and-original";
}

export async function POST(req: Request) {
  const { sendEmail } = useEmailJS();
  const stagedPathsForCleanup: string[] = [];
  const uploadedOriginals: string[] = [];
  const uploadedPublic: string[] = [];

  try {
    const requestBody = await req.json().catch(() => null);
    const title = String(requestBody?.title ?? "").trim();
    const description = String(requestBody?.description ?? "").trim();
    const medium = requestBody?.medium as Database["public"]["Enums"]["art_mediums"];
    const productType = (requestBody?.product_type ??
      null) as ProductTypeEnum | null;
    const notAiGenerated = Boolean(requestBody?.not_ai_generated);
    const authorizedToSell = Boolean(requestBody?.authorized_to_sell);

    const displayStagingPaths = Array.isArray(requestBody?.displayStagingPaths)
      ? (requestBody.displayStagingPaths as unknown[]).map((p) => String(p).trim()).filter(Boolean)
      : [];

    const printQualityStagingPathRaw = requestBody?.printQualityStagingPath;
    const printQualityStagingPath =
      printQualityStagingPathRaw === null ||
      printQualityStagingPathRaw === undefined
        ? ""
        : String(printQualityStagingPathRaw).trim();

    const price =
      requestBody?.price !== undefined && requestBody?.price !== null
        ? Number(requestBody.price)
        : null;
    const priceIncludesShipping = Boolean(requestBody?.price_includes_shipping);

    const dimensions = requestBody?.dimensions as
      | {
          width_in?: number;
          height_in?: number;
          depth_in?: number;
        }
      | undefined;

    if (!title || !medium) {
      return NextResponse.json(
        { error: "Missing required fields." },
        { status: 400 },
      );
    }

    if (displayStagingPaths.length === 0) {
      return NextResponse.json(
        { error: "At least one display image is required." },
        { status: 400 },
      );
    }

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

    for (const p of displayStagingPaths) {
      if (!isValidStagingPath(p, artistId)) {
        return NextResponse.json(
          { error: "Invalid display staging path." },
          { status: 403 },
        );
      }
      stagedPathsForCleanup.push(p);
    }

    if (requiresPrintQualityFile(productType)) {
      if (!printQualityStagingPath) {
        return NextResponse.json(
          { error: "Print-quality image is required for this product type." },
          { status: 400 },
        );
      }
      if (!isValidStagingPath(printQualityStagingPath, artistId)) {
        return NextResponse.json(
          { error: "Invalid print-quality staging path." },
          { status: 403 },
        );
      }
      stagedPathsForCleanup.push(printQualityStagingPath);
    } else if (printQualityStagingPath) {
      return NextResponse.json(
        {
          error:
            "Print-quality image must not be sent for this product type.",
        },
        { status: 400 },
      );
    }

    const displayBuffers: Buffer[] = [];

    for (const path of displayStagingPaths) {
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
      const ab = await stagedDownload.data.arrayBuffer();
      displayBuffers.push(Buffer.from(ab));
    }

    const firstMeta = await sharp(displayBuffers[0]).metadata();
    const width = firstMeta.width ?? 0;
    const height = firstMeta.height ?? 0;
    if (!width || !height) {
      return NextResponse.json(
        { error: "Unable to read image dimensions." },
        { status: 400 },
      );
    }

    const dpi = 300;
    const aspectRatio = inferAspectRatio(width, height);
    const artPieceId = crypto.randomUUID();

    const finalDisplayPaths: string[] = [];
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
          upsert: false,
        });
      if (displayUpload.error) {
        console.error(displayUpload.error);
        await supabase.storage.from("art-pieces").remove(uploadedPublic);
        return NextResponse.json(
          { error: "Failed to upload display image." },
          { status: 500 },
        );
      }
      uploadedPublic.push(displayPath);
      finalDisplayPaths.push(displayPath);
    }

    const thumbnailPath = `thumbnails/${artistId}/${artPieceId}.webp`;
    const thumbnailBuffer = await sharp(displayBuffers[0])
      .resize({ width: 800 })
      .webp({ quality: 80 })
      .toBuffer();

    const thumbUpload = await supabase.storage
      .from("art-pieces")
      .upload(thumbnailPath, thumbnailBuffer, {
        contentType: "image/webp",
        upsert: false,
      });
    if (thumbUpload.error) {
      console.error(thumbUpload.error);
      await supabase.storage.from("art-pieces").remove(uploadedPublic);
      return NextResponse.json(
        { error: "Failed to upload thumbnail image." },
        { status: 500 },
      );
    }
    uploadedPublic.push(thumbnailPath);

    let originalPath: string | null = null;
    if (printQualityStagingPath) {
      const pqDownload = await supabase.storage
        .from(STAGING_BUCKET)
        .download(printQualityStagingPath);
      if (pqDownload.error || !pqDownload.data) {
        console.error(pqDownload.error);
        await supabase.storage.from("art-pieces").remove(uploadedPublic);
        return NextResponse.json(
          { error: "Unable to read staged print-quality image." },
          { status: 400 },
        );
      }
      const pqAb = await pqDownload.data.arrayBuffer();
      const pqBuffer = Buffer.from(pqAb);
      originalPath = `${artistId}/${artPieceId}`;

      const originalUpload = await supabase.storage
        .from("originals")
        .upload(originalPath, pqBuffer, {
          contentType: pqDownload.data.type || "application/octet-stream",
          upsert: false,
        });
      if (originalUpload.error) {
        console.error(originalUpload.error);
        await supabase.storage.from("art-pieces").remove(uploadedPublic);
        return NextResponse.json(
          { error: "Failed to upload original image." },
          { status: 500 },
        );
      }
      uploadedOriginals.push(originalPath);
    }

    let productDimensionsId: string | null = null;
    if (
      dimensions &&
      (dimensions.width_in != null ||
        dimensions.height_in != null ||
        dimensions.depth_in != null)
    ) {
      const pdInsert = await supabase
        .from("product_dimensions")
        .insert({
          width_in: dimensions.width_in ?? null,
          height_in: dimensions.height_in ?? null,
          depth_in: dimensions.depth_in ?? null,
        })
        .select("id")
        .single();
      if (pdInsert.error) {
        console.error(pdInsert.error);
        await supabase.storage.from("originals").remove(uploadedOriginals);
        await supabase.storage.from("art-pieces").remove(uploadedPublic);
        return NextResponse.json(
          { error: "Failed to save dimensions." },
          { status: 500 },
        );
      }
      productDimensionsId = pdInsert.data?.id ?? null;
    }

    const insert = await supabase
      .from("art_piece")
      .insert({
        id: artPieceId,
        artist_id: artistId,
        title,
        description,
        medium,
        product_type: productType,
        status: "pending-approval",
        px_width: width,
        px_height: height,
        dpi,
        aspect_ratio: aspectRatio as Database["public"]["Enums"]["aspect_ratios"],
        display_path: finalDisplayPaths[0] ?? null,
        thumbnail_path: thumbnailPath,
        original_path: originalPath,
        not_ai_generated: notAiGenerated,
        authorized_to_sell: authorizedToSell,
        price: Number.isFinite(price) ? price : null,
        price_includes_shipping: priceIncludesShipping,
        product_dimensions_id: productDimensionsId,
      })
      .select("id")
      .single();

    if (insert.error || !insert.data) {
      console.error(insert.error);
      await supabase.storage.from("originals").remove(uploadedOriginals);
      await supabase.storage.from("art-pieces").remove(uploadedPublic);
      if (productDimensionsId) {
        await supabase.from("product_dimensions").delete().eq("id", productDimensionsId);
      }
      return NextResponse.json(
        {
          error:
            "Failed to upload art piece. Contact bellmanlindsey@gmail.com if this issue persists.",
        },
        { status: 500 },
      );
    }

    const displayImageRows = finalDisplayPaths.map((path, idx) => ({
      art_piece_id: insert.data.id,
      idx,
      path,
    }));

    const displayImgInsert = await supabase
      .from("art_piece_display_image")
      .insert(displayImageRows);

    if (displayImgInsert.error) {
      console.error(displayImgInsert.error);
      await supabase.from("art_piece").delete().eq("id", insert.data.id);
      await supabase.storage.from("originals").remove(uploadedOriginals);
      await supabase.storage.from("art-pieces").remove(uploadedPublic);
      if (productDimensionsId) {
        await supabase.from("product_dimensions").delete().eq("id", productDimensionsId);
      }
      return NextResponse.json(
        {
          error:
            "Failed to save display images. Contact bellmanlindsey@gmail.com if this issue persists.",
        },
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
      `Product Type: ${productType ?? "null"}`,
      `Width: ${width}`,
      `Height: ${height}`,
      `Aspect Ratio: ${aspectRatio}`,
      `Display paths: ${finalDisplayPaths.join(", ")}`,
      `Thumbnail Path: ${thumbnailPath}`,
    ].join("\n");

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
    if (stagedPathsForCleanup.length > 0) {
      await supabase.storage
        .from(STAGING_BUCKET)
        .remove([...new Set(stagedPathsForCleanup)]);
    }
  }
}
