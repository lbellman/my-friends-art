import { test, expect } from "@playwright/test";

import { getServiceSupabase } from "../helpers/supabase-admin";
import { getAnyArtistId } from "../helpers/artist-test-user";

async function createPublicTestArtPiece(productType: "print" | "made-to-order" | "original") {
  const id = crypto.randomUUID();
  const artistId = await getAnyArtistId();
  const supabase = getServiceSupabase();

  const { error } = await supabase.from("art_piece").insert({
    id,
    title: `Public test ${productType} ${id.slice(0, 8)}`,
    artist_id: artistId,
    status: "approved",
    px_width: 2400,
    px_height: 2400,
    description: "Public request integration test art piece.",
    not_ai_generated: true,
    authorized_to_sell: true,
    product_type: productType,
    category: "wall-art",
    size: "one-size",
    display_path: null,
    thumbnail_path: null,
    original_path: null,
    product_dimensions_id: null,
  });
  expect(error).toBeNull();

  return id;
}

async function removePublicTestArtPiece(artPieceId: string) {
  const supabase = getServiceSupabase();
  const { error: productRequestError } = await supabase
    .from("product_request")
    .delete()
    .eq("art_piece_id", artPieceId);
  expect(productRequestError).toBeNull();

  const { error: artPieceError } = await supabase
    .from("art_piece")
    .delete()
    .eq("id", artPieceId);
  expect(artPieceError).toBeNull();
}

test("Public can create print requests", async ({ page }) => {
  const artPieceId = await createPublicTestArtPiece("print");
  const fromEmail = "john.doe@example.com";
  const name = "John Doe";

  try {
    await page.goto(`/${artPieceId}`);
    await page.getByRole("button", { name: "Request a Print" }).click();
    await page.getByRole("textbox", { name: "Name" }).fill(name);
    await page.getByRole("textbox", { name: "Email" }).fill(fromEmail);
    await page
      .getByRole("textbox", { name: "Message" })
      .fill("I would like to request a print of this art piece.");
    await page.getByRole("button", { name: "Send Request" }).click();
    await expect(page.getByText("Print request created!")).toBeVisible();

    const supabase = getServiceSupabase();
    const { data, error } = await supabase
      .from("product_request")
      .select("id, name, from_email, type, status, art_piece_id")
      .eq("art_piece_id", artPieceId)
      .eq("from_email", fromEmail)
      .eq("name", name)
      .eq("type", "print")
      .order("created_at", { ascending: false })
      .limit(5);

    expect(error).toBeNull();
    expect(data?.length ?? 0).toBeGreaterThan(0);
    expect(data?.[0]?.status).toBe("pending");
  } finally {
    await removePublicTestArtPiece(artPieceId);
  }
});


test("Public can create made-to-order requests", async ({ page }) => {
  const artPieceId = await createPublicTestArtPiece("made-to-order");
  const fromEmail = "john.doe@example.com";
  const name = "John Doe";

  try {
    await page.goto(`/${artPieceId}`);
    await page.getByRole("button", { name: "Request a Custom Order" }).click();
    await page.getByRole("textbox", { name: "Name" }).fill(name);
    await page.getByRole("textbox", { name: "Email" }).fill(fromEmail);
    await page.getByRole("textbox", { name: "Message" }).fill("I would like to request a custom order for this art piece.");
    await page.getByRole("button", { name: "Submit Request" }).click();
    await expect(page.getByText("Purchase request created!")).toBeVisible();

    const supabase = getServiceSupabase();
    const { data, error } = await supabase
      .from("product_request")
      .select("id, name, from_email, type, status, art_piece_id")
      .eq("art_piece_id", artPieceId)
      .eq("from_email", fromEmail)
      .eq("name", name)
      .eq("type", "custom-order")
      .order("created_at", { ascending: false })
      .limit(5);

    expect(error).toBeNull();
    expect(data?.length ?? 0).toBeGreaterThan(0);
    expect(data?.[0]?.status).toBe("pending");
  } finally {
    await removePublicTestArtPiece(artPieceId);
  }
});


test("Public can create original requests", async ({ page }) => {
  const artPieceId = await createPublicTestArtPiece("original");
  const fromEmail = "john.doe@example.com";
  const name = "John Doe";

  try {
    await page.goto(`/${artPieceId}`);
    await page.getByRole("button", { name: "Request to Purchase" }).click();
    await page.getByRole("textbox", { name: "Name" }).fill(name);
    await page.getByRole("textbox", { name: "Email" }).fill(fromEmail);
    await page.getByRole("textbox", { name: "Message" }).fill("I would like to request a custom order for this art piece.");
    await page.getByRole("button", { name: "Submit Request" }).click();
    await expect(page.getByText("Purchase request created!")).toBeVisible();

    const supabase = getServiceSupabase();
    const { data, error } = await supabase
      .from("product_request")
      .select("id, name, from_email, type, status, art_piece_id")
      .eq("art_piece_id", artPieceId)
      .eq("from_email", fromEmail)
      .eq("name", name)
      .eq("type", "original")
      .order("created_at", { ascending: false })
      .limit(5);

    expect(error).toBeNull();
    expect(data?.length ?? 0).toBeGreaterThan(0);
    expect(data?.[0]?.status).toBe("pending");
  } finally {
    await removePublicTestArtPiece(artPieceId);
  }
});