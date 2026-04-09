import { test, expect } from "@playwright/test";

test.describe("without auth", () => {
  test("home page loads", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/$/);
  });
});
