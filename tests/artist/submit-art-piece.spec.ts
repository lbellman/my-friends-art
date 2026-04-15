import path from "path";

import { test, expect } from "@playwright/test";

import {
  SUBMIT_DISPLAY_IMAGES_DROPZONE_TEST_ID,
  SUBMIT_PRINT_QUALITY_DROPZONE_TEST_ID,
  USE_PRINT_AS_DISPLAY_CHECKBOX_TEST_ID,
  uploadFilesViaDropzone,
} from "../helpers/upload-via-dropzone";
import { getServiceSupabase } from "../helpers/supabase-admin";
import { ARTIST_ID } from "./ids";

test.describe("Submit art piece", () => {
  test("Print valid", async ({ page }) => {
    const title = "New Art Piece (print)";
    await page.goto("/submit-art-piece");
    await expect(page.getByText("Basic Information")).toBeVisible();
    await page.getByTestId("title").fill(title);
    await page.getByTestId("description").fill("This is a new art piece");

    // Select "print" product type
    await page.getByTestId("product-type").click();
    await page.getByTestId("select-option-print").click();

    // Select "wall art" category
    await page.getByTestId("category").click();
    await page.getByTestId("select-option-wall-art").click();

    // Click next
    await page.getByTestId("next-button").click();

    // Expect to be on the upload image step
    await expect(page.getByText("Upload Image")).toBeVisible();

    const tinyWebp = path.join(process.cwd(), "tests/fixtures/tiny.webp");
    await uploadFilesViaDropzone(page, {
      dataTestId: SUBMIT_PRINT_QUALITY_DROPZONE_TEST_ID,
      files: tinyWebp,
    });
    // Default is “use print quality as display” — the extra display dropzone is not mounted until unchecked.
    await page.getByTestId(USE_PRINT_AS_DISPLAY_CHECKBOX_TEST_ID).uncheck();
    await uploadFilesViaDropzone(page, {
      dataTestId: SUBMIT_DISPLAY_IMAGES_DROPZONE_TEST_ID,
      files: tinyWebp,
    });

    // Keep the "Use Display Image as Print Quality" checkbox checked
    await page.getByTestId(USE_PRINT_AS_DISPLAY_CHECKBOX_TEST_ID).check();

    // Check the verification statements
    await page.getByTestId("not-ai-generated").check();
    await page.getByTestId("authorized-to-sell").check();

    // Click submit
    await page.getByTestId("submit-button").click();

    // Expect to be on the success page
    await expect(page.getByText("Thank you for your submission!")).toBeVisible({
      timeout: 15_000,
    });

    // Ensure the art piece is listed in the database as "pending-approval"
    const supabase = getServiceSupabase();
    const { data, error } = await supabase
      .from("art_piece")
      .select("*")
      .eq("title", title);
    if (error) {
      throw error;
    }
    expect(data?.[0]?.status).toBe("pending-approval");
    expect(data?.[0]?.product_type).toBe("print");
    expect(data?.[0]?.category).toBe("wall-art");
    expect(data?.[0]?.original_path).toBeDefined();
    expect(data?.[0]?.thumbnail_path).toBeDefined();
    expect(data?.[0]?.artist_id).toEqual(ARTIST_ID);
  });

  test("Print invalid - image too large", async ({ page }) => {
    const title = "New Art Piece (print invalid - oversize)";
    await page.goto("/submit-art-piece");
    await expect(page.getByText("Basic Information")).toBeVisible();
    await page.getByTestId("title").fill(title);
    await page.getByTestId("description").fill("This is a new art piece");

    await page.getByTestId("product-type").click();
    await page.getByTestId("select-option-print").click();

    await page.getByTestId("category").click();
    await page.getByTestId("select-option-wall-art").click();

    await page.getByTestId("next-button").click();
    await expect(page.getByText("Upload Image")).toBeVisible();

    const oversizedJpeg = path.join(
      process.cwd(),
      "tests/fixtures/oversized-image.jpeg",
    );
    await uploadFilesViaDropzone(page, {
      dataTestId: SUBMIT_PRINT_QUALITY_DROPZONE_TEST_ID,
      files: oversizedJpeg,
    });
    await expect(
      page.getByText("One or more files are larger than 10MB."),
    ).toBeVisible();

    // No valid print-quality file → submit must stay disabled (see getIsNextDisabled).
    await expect(page.getByTestId("submit-button")).toBeDisabled();

    const supabase = getServiceSupabase();
    const { data, error } = await supabase
      .from("art_piece")
      .select("id")
      .eq("title", title);
    if (error) {
      throw error;
    }
    expect(data?.length ?? 0).toBe(0);
  });

  test("Made to Order valid", async ({ page }) => {
    const title = "New Art Piece (made to order)";
    await page.goto("/submit-art-piece");
    await expect(page.getByText("Basic Information")).toBeVisible();
    await page.getByTestId("title").fill(title);
    await page.getByTestId("description").fill("This is a new art piece");

    // Select "print" product type
    await page.getByTestId("product-type").click();
    await page.getByTestId("select-option-made-to-order").click();

    // Select "wall art" category
    await page.getByTestId("category").click();
    await page.getByTestId("select-option-clothing-and-wearables").click();

    // Click next
    await page.getByTestId("next-button").click();

    // Expect to be on the original product details step
    await expect(page.getByText("Product Details")).toBeVisible();
    await page.getByTestId("width-in").fill("10");
    await page.getByTestId("height-in").fill("10");
    await page.getByTestId("depth-in").fill("10");
    await page.getByTestId("size").click();
    await page.getByTestId("select-option-made-to-measure").click();

    // Click next
    await page.getByTestId("next-button").click();

    // Expect to be on the upload image step
    await expect(page.getByText("Upload Image")).toBeVisible();

    // Submit 3 display images
    const tinyWebp = path.join(process.cwd(), "tests/fixtures/tiny.webp");
    await uploadFilesViaDropzone(page, {
      dataTestId: SUBMIT_DISPLAY_IMAGES_DROPZONE_TEST_ID,
      files: [tinyWebp, tinyWebp, tinyWebp],
    });

    // Check the verification statements
    await page.getByTestId("not-ai-generated").check();
    await page.getByTestId("authorized-to-sell").check();

    // Click submit
    await page.getByTestId("submit-button").click();

    // Expect to be on the success page
    await expect(page.getByText("Thank you for your submission!")).toBeVisible({
      timeout: 15_000,
    });

    // Ensure the art piece is listed in the database as "pending-approval"
    const supabase = getServiceSupabase();
    const { data, error } = await supabase
      .from("art_piece")
      .select("*, product_dimensions:product_dimensions_id(*)")
      .eq("title", title);
    if (error) {
      throw error;
    }

    const artPiece = data?.[0];
    expect(artPiece?.status).toBe("pending-approval");
    expect(artPiece?.product_type).toBe("made-to-order");
    expect(artPiece?.category).toBe("clothing-and-wearables");
    expect(artPiece?.original_path).toBeDefined();
    expect(artPiece?.thumbnail_path).toBeDefined();
    expect(artPiece?.artist_id).toEqual(ARTIST_ID);
    expect(artPiece?.product_dimensions?.width_in).toBe(10);
    expect(artPiece?.product_dimensions?.height_in).toBe(10);
    expect(artPiece?.product_dimensions?.depth_in).toBe(10);
    expect(artPiece?.size).toBe("made-to-measure");

    // Ensure the display images are listed in the database
    const { data: displayImages, error: displayImagesError } = await supabase
      .from("art_piece_display_image")
      .select("path")
      .eq("art_piece_id", artPiece?.id);
    if (displayImagesError) {
      throw displayImagesError;
    }
    expect(displayImages?.length).toBe(3);
    expect(displayImages?.[0]?.path).toBeDefined();
    expect(displayImages?.[1]?.path).toBeDefined();
    expect(displayImages?.[2]?.path).toBeDefined();
  });

  test("Original valid", async ({ page }) => {
    const title = "New Art Piece (original)";
    await page.goto("/submit-art-piece");
    await expect(page.getByText("Basic Information")).toBeVisible();
    await page.getByTestId("title").fill(title);
    await page.getByTestId("description").fill("This is a new art piece");

    // Select "print" product type
    await page.getByTestId("product-type").click();
    await page.getByTestId("select-option-original").click();

    // Select "wall art" category
    await page.getByTestId("category").click();
    await page.getByTestId("select-option-clothing-and-wearables").click();

    // Click next
    await page.getByTestId("next-button").click();

    // Expect to be on the original product details step
    await expect(page.getByText("Product Details")).toBeVisible();
    await page.getByTestId("width-in").fill("10");
    await page.getByTestId("height-in").fill("10");
    await page.getByTestId("depth-in").fill("10");
    await page.getByTestId("size").click();
    await page.getByTestId("select-option-sm").click();

    // Click next
    await page.getByTestId("next-button").click();

    // Expect to be on the upload image step
    await expect(page.getByText("Upload Image")).toBeVisible();

    // Submit 3 display images
    const tinyWebp = path.join(process.cwd(), "tests/fixtures/tiny.webp");
    await uploadFilesViaDropzone(page, {
      dataTestId: SUBMIT_DISPLAY_IMAGES_DROPZONE_TEST_ID,
      files: [tinyWebp, tinyWebp, tinyWebp],
    });

    // Check the verification statements
    await page.getByTestId("not-ai-generated").check();
    await page.getByTestId("authorized-to-sell").check();

    // Click submit
    await page.getByTestId("submit-button").click();

    // Expect to be on the success page
    await expect(page.getByText("Thank you for your submission!")).toBeVisible({
      timeout: 15_000,
    });

    // Ensure the art piece is listed in the database as "pending-approval"
    const supabase = getServiceSupabase();
    const { data, error } = await supabase
      .from("art_piece")
      .select("*, product_dimensions:product_dimensions_id(*)")
      .eq("title", title);
    if (error) {
      throw error;
    }

    const artPiece = data?.[0];
    expect(artPiece?.status).toBe("pending-approval");
    expect(artPiece?.product_type).toBe("original");
    expect(artPiece?.category).toBe("clothing-and-wearables");
    expect(artPiece?.original_path).toBeDefined();
    expect(artPiece?.thumbnail_path).toBeDefined();
    expect(artPiece?.artist_id).toEqual(ARTIST_ID);
    expect(artPiece?.product_dimensions?.width_in).toBe(10);
    expect(artPiece?.product_dimensions?.height_in).toBe(10);
    expect(artPiece?.product_dimensions?.depth_in).toBe(10);
    expect(artPiece?.size).toBe("sm");


    // Ensure the display images are listed in the database
    const { data: displayImages, error: displayImagesError } = await supabase
      .from("art_piece_display_image")
      .select("path")
      .eq("art_piece_id", artPiece?.id);
    if (displayImagesError) {
      throw displayImagesError;
    }
    expect(displayImages?.length).toBe(3);
    expect(displayImages?.[0]?.path).toBeDefined();
    expect(displayImages?.[1]?.path).toBeDefined();
    expect(displayImages?.[2]?.path).toBeDefined();
  });
});
