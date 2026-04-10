import { test, expect } from "@playwright/test";

import { getAuthUserIdFromPage } from "../helpers/auth-session";
import { getServiceSupabase } from "../helpers/supabase-admin";

test("Artist can view their profile", async ({ page }) => {
  await page.goto("/dashboard");
  await page.getByRole("button", { name: "Artist Profile" }).click();
  await expect(page.getByRole("heading", { name: "Your Artist Profile" })).toBeVisible();
});

test("Artist can edit their profile", async ({ page }) => {
  await page.goto("/dashboard");
  await page.getByRole("button", { name: "Artist Profile" }).click();

  // Edit artist name
  await page.getByLabel("Artist name").fill("John Doe");
  await page.getByRole("button", { name: "Save artist profile" }).click();
  await expect(page.getByText("Profile updated.")).toBeVisible();
  await expect(page.getByText("John Doe")).toBeVisible();

  // Verify that the artist name is updated in the database
  const userId = await getAuthUserIdFromPage(page);
  const supabase = getServiceSupabase();
  const { data, error } = await supabase
    .from("artist")
    .select("id, name, user_id")
    .eq("user_id", userId)
    .maybeSingle();

  expect(error).toBeNull();
  expect(data).not.toBeNull();
  expect(data?.user_id).toBe(userId);
  expect(data?.name).toBe("John Doe");
});