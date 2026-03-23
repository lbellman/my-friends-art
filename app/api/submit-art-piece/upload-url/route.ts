import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/supabase";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Private staging bucket so that the client doesn't have to send large images in a request body
// Image files are uploaded temporarily, and then deleted after the database record has been created and proper storage buckets have been fulfilled
const STAGING_BUCKET = "art-piece-staging";

const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.slice("Bearer ".length)
      : undefined;

    if (!token) {
      return NextResponse.json(
        { error: "You must be signed in to upload art." },
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
        { error: "You must be signed in to upload art." },
        { status: 401 },
      );
    }

    // Resolve artist from the authenticated user, this prevents the client from spoofing artist IDs.
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

    const id = crypto.randomUUID();
    const stagingPath = `staging/${artist.id}/${id}`;

    // Use a signed upload token, this grants narrow write access to exactly one object path
    const uploadUrlResult = await supabase.storage
      .from(STAGING_BUCKET)
      .createSignedUploadUrl(stagingPath);

    if (uploadUrlResult.error || !uploadUrlResult.data) {
      console.error(uploadUrlResult.error);
      return NextResponse.json(
        { error: "Unable to initialize image upload." },
        { status: 500 },
      );
    }
    return NextResponse.json(
      {
        bucket: STAGING_BUCKET,
        stagingPath,
        uploadToken: uploadUrlResult.data.token,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Unexpected error while initializing upload." },
      { status: 500 },
    );
  }
}
