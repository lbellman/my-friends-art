import { test, expect } from "@playwright/test";

test("Search for an art piece", async ({ page }) => {
  await page.goto("/");
  await page.getByTestId("search-bar").fill("Yuki");
  await page.getByTestId("search-button-main").click();
  await expect(page.getByText(`Showing results for "Yuki"`)).toBeVisible();
});