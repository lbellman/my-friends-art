import path from "path";

import { test, expect } from "@playwright/test";

import {
  setupArtPieceWithDisplayImages,
  setupArtPieceWithThreeDisplayImages,
  removeDisplayArtPiece,
} from "../helpers/dashboard-display-images-e2e";
import { getServiceSupabase } from "../helpers/supabase-admin";
import { getAuthenticatedArtistId } from "../helpers/artist-test-user";


async function createTestArtPiece(
  artistId: string,
  overrides: Partial<{
    title: string;
    status: "approved" | "archived" | "sold" | "pending-approval" | "not-approved";
    description: string;
    product_type: "print" | "original";
  }> = {},
) {
  const id = crypto.randomUUID();
  const supabase = getServiceSupabase();
  const { error } = await supabase.from("art_piece").upsert(
    {
      id,
      title: `E2E ${id.slice(0, 8)}`,
      artist_id: artistId,
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
      ...overrides,
    },
    { onConflict: "id" },
  );
  expect(error).toBeNull();
  return id;
}

async function removeTestArtPiece(artPieceId: string) {
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

test.describe.serial("Dashboard art piece", () => {
  let artistId: string;

  test.beforeEach(async ({ page }) => {
    artistId = await getAuthenticatedArtistId(page);
  });

  test("Artist can edit approved dashboard art piece", async ({ page }) => {
    const artPieceId = await createTestArtPiece(artistId, {
      title: "Snow Line",
      status: "approved",
    });

    const supabase = getServiceSupabase();

    try {
      await page.goto(`/dashboard/${artPieceId}`);
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
        .eq("id", artPieceId)
        .maybeSingle();
      expect(error).toBeNull();
      expect(data).not.toBeNull();
      expect(data?.description).toBe("Minimal winter landscape (edited).");
    } finally {
      await removeTestArtPiece(artPieceId);
    }
  });

  test("Artist can archive approved dashboard art piece", async ({ page }) => {
    const artPieceId = await createTestArtPiece(artistId, {
      status: "approved",
    });
    const supabase = getServiceSupabase();

    try {
      await page.goto(`/dashboard/${artPieceId}`);
      await page.getByRole("button", { name: "Archive Art Piece" }).click();
      await expect(page.getByText("This piece is archived.")).toBeVisible();

      const { data, error } = await supabase
        .from("art_piece")
        .select("id, status")
        .eq("id", artPieceId)
        .maybeSingle();
      expect(error).toBeNull();
      expect(data).not.toBeNull();
      expect(data?.status).toBe("archived");
    } finally {
      await removeTestArtPiece(artPieceId);
    }
  });

  test("Artist can mark approved dashboard art piece as sold", async ({ page }) => {
    const artPieceId = await createTestArtPiece(artistId, {
      status: "approved",
      product_type: "original",
    });
    const supabase = getServiceSupabase();

    try {
      await page.goto(`/dashboard/${artPieceId}`);
      await expect(page.getByTestId("mark-as-sold")).toBeVisible();
      await page.getByTestId("mark-as-sold").click();
      await expect(page.getByText("Marked as sold.")).toBeVisible();

      await expect
        .poll(async () => {
          const { data, error } = await supabase
            .from("art_piece")
            .select("status")
            .eq("id", artPieceId)
            .maybeSingle();
          if (error) throw error;
          return data?.status;
        })
        .toBe("sold");
    } finally {
      await removeTestArtPiece(artPieceId);
    }
  });

  test("Artist cannot delete dashboard art piece with pending product requests", async ({
    page,
  }) => {
    const artPieceId = await createTestArtPiece(artistId);
    const supabase = getServiceSupabase();
    try {
      const { error: productRequestError } = await supabase
        .from("product_request")
        .insert({
          art_piece_id: artPieceId,
          artist_id: artistId,
          from_email: "test@test.com",
          name: "Test User",
          print_option: "canvas",
          status: "pending",
          type: "print",
        });
      expect(productRequestError).toBeNull();

      await page.goto(`/dashboard/${artPieceId}`);
      await expect(
        page.getByRole("button", { name: "Delete Art Piece" }),
      ).toBeVisible();
      await expect(page.getByTestId("delete-art-piece")).toBeDisabled();
    } finally {
      await removeTestArtPiece(artPieceId);
    }
  });

  test("Artist can delete dashboard art piece with no pending product requests", async ({
    page,
  }) => {
    const artPieceId = await createTestArtPiece(artistId);
    const supabase = getServiceSupabase();

    await page.goto(`/dashboard/${artPieceId}`);
    await expect(
      page.getByRole("button", { name: "Delete Art Piece" }),
    ).toBeVisible();

    await page.getByTestId("delete-art-piece").click();
    await page.getByRole("button", { name: "Yes, delete this art piece" }).click();

    await expect(
      page.getByRole("heading", { name: "Your Art Pieces" }),
    ).toBeVisible();

    const { data, error } = await supabase
      .from("art_piece")
      .select("id, status")
      .eq("id", artPieceId)
      .maybeSingle();
    expect(error).toBeNull();
    expect(data).toBeNull();
  });

  test("Artist can fulfill pending product request", async ({ page }) => {
    const artPieceId = await createTestArtPiece(artistId);
    const supabase = getServiceSupabase();

    try {
      const PRODUCT_REQUEST_ID = crypto.randomUUID();
      const { error: productRequestError } = await supabase
        .from("product_request")
        .insert({
          id: PRODUCT_REQUEST_ID,
          art_piece_id: artPieceId,
          artist_id: artistId,
          from_email: "test@test.com",
          name: "Test User",
          print_option: "canvas",
          status: "pending",
          type: "print",
        });
      expect(productRequestError).toBeNull();

      await page.goto(`/dashboard/${artPieceId}`);
      await expect(
        page.getByTestId("mark-as-fulfilled"),
      ).toBeVisible();

      await page.getByTestId("mark-as-fulfilled").click();
      await page.getByTestId("dialog-confirm-button").click();

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
    } finally {
      await removeTestArtPiece(artPieceId);
    }
  });
  
  test("Artist can cancel pending product request", async ({ page }) => {
    const artPieceId = await createTestArtPiece(artistId);
    const supabase = getServiceSupabase();

    try {
      const PRODUCT_REQUEST_ID = crypto.randomUUID();
      const { error: productRequestError } = await supabase
        .from("product_request")
        .insert({
          id: PRODUCT_REQUEST_ID,
          art_piece_id: artPieceId,
          artist_id: artistId,
          from_email: "test@test.com",
          name: "Test User",
          print_option: "canvas",
          status: "pending",
          type: "print",
        });
      expect(productRequestError).toBeNull();

      await page.goto(`/dashboard/${artPieceId}`);
      await expect(
        page.getByTestId("mark-as-cancelled"),
      ).toBeVisible();

      await page.getByTestId("mark-as-cancelled").click();
      await page.getByTestId("dialog-confirm-button").click();

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
    } finally {
      await removeTestArtPiece(artPieceId);
    }
  });

  test("Artist can remove a display image from an art piece", async ({
    page,
  }) => {
    const supabase = getServiceSupabase();

    // Create an art piece with 3 display images
    const artPieceId = await setupArtPieceWithThreeDisplayImages(artistId);

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
      const displayFolder = `display/${artistId}/${artPieceId}`;
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
      await removeDisplayArtPiece(artistId, artPieceId);
    }
  });

  test("Artist can add a display image to an art piece", async ({ page }) => {
    const supabase = getServiceSupabase();
    const artPieceId = await setupArtPieceWithDisplayImages(artistId, 2);
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

      const displayFolder = `display/${artistId}/${artPieceId}`;
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
      await removeDisplayArtPiece(artistId, artPieceId);
    }
  });
});

