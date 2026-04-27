import { expect, test } from "@playwright/test";
import { getAnyArtistId } from "../helpers/artist-test-user";
import { getServiceSupabase } from "../helpers/supabase-admin";

async function createContactTestArtPiece() {
  const id = crypto.randomUUID();
  const artistId = await getAnyArtistId();
  const supabase = getServiceSupabase();

  const { error } = await supabase.from("art_piece").insert({
    id,
    title: `Contact test ${id.slice(0, 8)}`,
    artist_id: artistId,
    status: "approved",
    px_width: 2400,
    px_height: 2400,
    description: "Public contact integration test art piece.",
    not_ai_generated: true,
    authorized_to_sell: true,
    product_type: "made-to-order",
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

async function removeContactTestArtPiece(artPieceId: string) {
  const supabase = getServiceSupabase();
  const { error } = await supabase.from("art_piece").delete().eq("id", artPieceId);
  expect(error).toBeNull();
}


test("Public can contact an artist", async ({ page }) => {
  const artPieceId = await createContactTestArtPiece();
  const fromEmail = "john.doe@example.com";
  const name = "John Doe";

  try {
    await page.goto(`/${artPieceId}`);
    await page.getByRole("button", { name: "Contact Artist" }).click();
    await page.getByRole("textbox", { name: "Name" }).fill(name);
    await page.getByRole("textbox", { name: "Email" }).fill(fromEmail);
    await page.getByRole("textbox", { name: "Message" }).fill("Hello!");
    await page.getByRole("button", { name: "Send Message" }).click();
    await expect(page.getByText("Email sent successfully.")).toBeVisible({ timeout: 15_000 });
  } finally {
    await removeContactTestArtPiece(artPieceId);
  }
});
