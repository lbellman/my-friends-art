import { test, expect } from "@playwright/test";

test.describe("admin session", () => {
  test("admin art submissions page loads", async ({ page }) => {
    await page.goto("/admin/art-piece-submissions");
    await expect(page).toHaveURL(/\/admin\/art-piece-submissions/);
    await expect(
      page.getByRole("heading", { name: /art piece submissions/i }),
    ).toBeVisible({ timeout: 15_000 });
  });
});
