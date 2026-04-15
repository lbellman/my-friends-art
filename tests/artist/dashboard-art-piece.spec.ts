import path from "path";

import { test, expect } from "@playwright/test";

import {
  setupArtPieceWithDisplayImages,
  setupArtPieceWithThreeDisplayImages,
  removeDisplayArtPiece,
} from "../helpers/dashboard-display-images-e2e";
import { getServiceSupabase } from "../helpers/supabase-admin";
import { ART_PIECE_TO_DELETE_ID, ARTIST_ID, PRINT_ART_PIECE_ID, ORIGINAL_ART_PIECE_ID } from "./ids";


/**
 * `ART_PIECE_TO_DELETE_ID` is removed by the delete test. Playwright runs
 * `chromium-artist` and `firefox-artist` in parallel against one DB, so another
 * project can delete this row before this file’s next test — restore from seed
 * before every test (also fixes retries after the delete test).
 */
async function resetTestArtPiece() {
  const supabase = getServiceSupabase();
  const { error } = await supabase.from("art_piece").upsert(
    {
      id: ART_PIECE_TO_DELETE_ID,
      title: "Bamboo Shadow",
      artist_id: ARTIST_ID,
      status: "approved",
      px_width: 2400,
      px_height: 2400,
      description: "Ink wash on paper.",
      not_ai_generated: true,
      authorized_to_sell: true,
      product_type: "print",
      category: "wall-art",
      size: "one-size",
      display_path: null,
      thumbnail_path: null,
      original_path: null,
      product_dimensions_id: null,
    },
    { onConflict: "id" },
  );
  expect(error).toBeNull();
}

test.describe.serial("Dashboard art piece", () => {
  test.beforeEach(async () => {
    await resetTestArtPiece();
  });

  test("Artist can edit approved dashboard art piece", async ({ page }) => {
    // Ensure that the state of the art piece is "approved"
    const supabase = getServiceSupabase();
    const { error: updatedError } = await supabase
      .from("art_piece")
      .update({ status: "approved" })
      .eq("id", PRINT_ART_PIECE_ID);
    expect(updatedError).toBeNull();

    await page.goto("/dashboard?tab=art-pieces");
    await expect(
      page.getByRole("heading", { name: "Your Art Pieces" }),
    ).toBeVisible();
    await page.getByRole("link", { name: "Snow Line" }).click();
    await expect(page.getByRole("heading", { name: "Details" })).toBeVisible();
    await page.getByTestId("Edit").click();
    await page
      .getByLabel("Description")
      .fill("Minimal winter landscape (edited).");
    await page.getByRole("button", { name: "Save" }).click();
    await expect(page.getByText("Changes saved successfully")).toBeVisible();
    
    const { data, error } = await supabase
      .from("art_piece")
      .select("id, description")
      .eq("id", PRINT_ART_PIECE_ID)
      .maybeSingle();
    expect(error).toBeNull();
    expect(data).not.toBeNull();
    expect(data?.description).toBe("Minimal winter landscape (edited).");
  });

  test("Artist can archive approved dashboard art piece", async ({ page }) => {
    const supabase = getServiceSupabase();

    // Ensure that the state of the art piece is "approved"
    const { error: updatedError } = await supabase
      .from("art_piece")
      .update({ status: "approved" })
      .eq("id", PRINT_ART_PIECE_ID);
    expect(updatedError).toBeNull();

    await page.goto("/dashboard?tab=art-pieces");
    await expect(
      page.getByRole("heading", { name: "Your Art Pieces" }),
    ).toBeVisible();
    await page.getByRole("link", { name: "Snow Line" }).click();
    await page.getByRole("button", { name: "Archive Art Piece" }).click();
    await expect(page.getByText("This piece is archived.")).toBeVisible();

    const { data, error } = await supabase
      .from("art_piece")
      .select("id, status")
      .eq("id", PRINT_ART_PIECE_ID)
      .maybeSingle();
    expect(error).toBeNull();
    expect(data).not.toBeNull();
    expect(data?.status).toBe("archived");
  });

  test("Artist can mark approved dashboard art piece as sold", async ({ page }) => {
    const supabase = getServiceSupabase();

    // "Mark as Sold" only appears for originals (see ArtPieceActionsCard).
    const { error: updatedError } = await supabase
      .from("art_piece")
      .update({ status: "approved", product_type: "original" })
      .eq("id", ORIGINAL_ART_PIECE_ID);
    expect(updatedError).toBeNull();

    await page.goto(`/dashboard/${ORIGINAL_ART_PIECE_ID}`);
    await expect(page.getByTestId("mark-as-sold")).toBeVisible();
    await page.getByTestId("mark-as-sold").click();
    await expect(page.getByText("Marked as sold.")).toBeVisible();

    await expect
      .poll(async () => {
        const { data, error } = await supabase
          .from("art_piece")
          .select("status")
          .eq("id", ORIGINAL_ART_PIECE_ID)
          .maybeSingle();
        if (error) throw error;
        return data?.status;
      })
      .toBe("sold");
  });

  test("Artist cannot delete dashboard art piece with pending product requests", async ({
    page,
  }) => {
    // Insert a pending product request for the art piece
    const supabase = getServiceSupabase();
    const { error: productRequestError } = await supabase
      .from("product_request")
      .insert({
        art_piece_id: ART_PIECE_TO_DELETE_ID,
        artist_id: ARTIST_ID,
        from_email: "test@test.com",
        name: "Test User",
        print_option: "canvas",
        status: "pending",
        type: "print",
      });
    expect(productRequestError).toBeNull();

    // Go to the dashboard art piece page
    await page.goto(`/dashboard/${ART_PIECE_TO_DELETE_ID}`);
    await expect(
      page.getByRole("button", { name: "Delete Art Piece" }),
    ).toBeVisible();

    // Expect the delete button to be disabled
    await expect(page.getByTestId("delete-art-piece")).toBeDisabled();
  });

  test("Artist can delete dashboard art piece with no pending product requests", async ({
    page,
  }) => {
    const supabase = getServiceSupabase();

    // Delete all pending product requests for the art piece
    const { error: productRequestsError } = await supabase
      .from("product_request")
      .delete()
      .eq("art_piece_id", ART_PIECE_TO_DELETE_ID)
      .eq("status", "pending");
    expect(productRequestsError).toBeNull();

    // Go to the dashboard art piece page
    await page.goto(`/dashboard/${ART_PIECE_TO_DELETE_ID}`);
    await expect(
      page.getByRole("button", { name: "Delete Art Piece" }),
    ).toBeVisible();

    // Click the delete art piece button
    await page.getByTestId("delete-art-piece").click();
    await page.getByRole("button", { name: "Yes, delete this art piece" }).click();


    // Expect the page to redirect to the dashboard art pieces page
    await expect(
      page.getByRole("heading", { name: "Your Art Pieces" }),
    ).toBeVisible();

    // Ensure that the art piece is deleted
    const { data, error } = await supabase
      .from("art_piece")
      .select("id, status")
      .eq("id", ART_PIECE_TO_DELETE_ID)
      .maybeSingle();
    expect(error).toBeNull();
    expect(data).toBeNull();
  });

  test("Artist can fulfill pending product request", async ({ page }) => {
    const supabase = getServiceSupabase();

    // Insert a pending product request for the art piece
    const PRODUCT_REQUEST_ID = crypto.randomUUID();
    const { error: productRequestError } = await supabase
      .from("product_request")
      .insert({
        id: PRODUCT_REQUEST_ID,
        art_piece_id: PRINT_ART_PIECE_ID,
        artist_id: ARTIST_ID,
        from_email: "test@test.com",
        name: "Test User",
        print_option: "canvas",
        status: "pending",
        type: "print",
      });
    expect(productRequestError).toBeNull();

    // Go to the dashboard art piece page
    await page.goto(`/dashboard/${PRINT_ART_PIECE_ID}`);
    await expect(
      page.getByTestId("mark-as-fulfilled"),
    ).toBeVisible();

    // Click the cancel product request button
    await page.getByTestId("mark-as-fulfilled").click();
    await page.getByTestId("dialog-confirm-button").click();

    // Ensure that the product request got deleted
    await expect
      .poll(async () => {
        const { data, error } = await supabase
          .from("product_request")
          .select("status")
          .eq("id", PRODUCT_REQUEST_ID)
          .maybeSingle();
        if (error) throw error;
        return data?.status;
      }).
      toBe("fulfilled");
  });
  
  test("Artist can cancel pending product request", async ({ page }) => {
    const supabase = getServiceSupabase();

    // Insert a pending product request for the art piece
    const PRODUCT_REQUEST_ID = crypto.randomUUID();
    const { error: productRequestError } = await supabase
      .from("product_request")
      .insert({
        id: PRODUCT_REQUEST_ID,
        art_piece_id: PRINT_ART_PIECE_ID,
        artist_id: ARTIST_ID,
        from_email: "test@test.com",
        name: "Test User",
        print_option: "canvas",
        status: "pending",
        type: "print",
      });
    expect(productRequestError).toBeNull();

    // Go to the dashboard art piece page
    await page.goto(`/dashboard/${PRINT_ART_PIECE_ID}`);
    await expect(
      page.getByTestId("mark-as-cancelled"),
    ).toBeVisible();

    // Click the cancel product request button
    await page.getByTestId("mark-as-cancelled").click();
    await page.getByTestId("dialog-confirm-button").click();

    // Ensure that the product request got deleted
    await expect
      .poll(async () => {
        const { data, error } = await supabase
          .from("product_request")
          .select("status")
          .eq("id", PRODUCT_REQUEST_ID)
          .maybeSingle();
        if (error) throw error;
        return data;
      }).
      toBeNull();
  });

  test("Artist can remove a display image from an art piece", async ({
    page,
  }) => {
    const supabase = getServiceSupabase();

    // Create an art piece with 3 display images
    const artPieceId = await setupArtPieceWithThreeDisplayImages(ARTIST_ID);

    try {
      await page.goto(`/dashboard/${artPieceId}`);
      await page.getByTestId("edit-display-images").click();
      await expect(page.getByTestId("remove-display-image-0")).toBeVisible();

      // Remove the last display image
      await page.getByTestId("remove-display-image-2").click();
      await page
        .getByRole("dialog")
        .getByRole("button", { name: "Save" })
        .click();
      await expect(page.getByText("Display images updated.")).toBeVisible();

      // Ensure that there are 2 display images left
      await expect
        .poll(async () => {
          const { count, error } = await supabase
            .from("art_piece_display_image")
            .select("*", { count: "exact", head: true })
            .eq("art_piece_id", artPieceId);
          if (error) throw error;
          return count;
        })
        .toBe(2);

      // Ensure that the display images have the correct names
      const displayFolder = `display/${ARTIST_ID}/${artPieceId}`;
      await expect
        .poll(async () => {
          const { data, error } = await supabase.storage
            .from("art-pieces")
            .list(displayFolder);
          if (error) throw error;
          return (data ?? [])
            .map((f) => f.name)
            .filter(Boolean)
            .sort();
        })
        .toEqual(["0.webp", "1.webp"]);
    } finally {
      await removeDisplayArtPiece(ARTIST_ID, artPieceId);
    }
  });

  test("Artist can add a display image to an art piece", async ({ page }) => {
    const supabase = getServiceSupabase();
    const artPieceId = await setupArtPieceWithDisplayImages(ARTIST_ID, 2);
    const fixturePath = path.join(process.cwd(), "tests/fixtures/tiny.webp");

    try {
      await page.goto(`/dashboard/${artPieceId}`);
      await page.getByTestId("edit-display-images").click();
      await expect(page.getByTestId("remove-display-image-1")).toBeVisible();

      await page
        .getByRole("dialog")
        .locator('input[type="file"]')
        .setInputFiles(fixturePath);

      await expect(page.getByTestId("remove-display-image-2")).toBeVisible();

      await page
        .getByRole("dialog")
        .getByRole("button", { name: "Save" })
        .click();
      await expect(page.getByText("Display images updated.")).toBeVisible();

      await expect
        .poll(async () => {
          const { count, error } = await supabase
            .from("art_piece_display_image")
            .select("*", { count: "exact", head: true })
            .eq("art_piece_id", artPieceId);
          if (error) throw error;
          return count;
        })
        .toBe(3);

      const displayFolder = `display/${ARTIST_ID}/${artPieceId}`;
      await expect
        .poll(async () => {
          const { data, error } = await supabase.storage
            .from("art-pieces")
            .list(displayFolder);
          if (error) throw error;
          return (data ?? [])
            .map((f) => f.name)
            .filter(Boolean)
            .sort();
        })
        .toEqual(["0.webp", "1.webp", "2.webp"]);
    } finally {
      await removeDisplayArtPiece(ARTIST_ID, artPieceId);
    }
  });
});

