import { test, expect } from "@playwright/test";

test.describe("artist session", () => {
  test("artist dashboard loads when session is restored", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(
      page.getByRole("heading", { name: /Welcome back/i }),
    ).toBeVisible({ timeout: 15_000 });
  });
  test("admin art submissions page shows a 404", async ({ page }) => {
    await page.goto("/admin/art-piece-submissions");
    await expect(page).toHaveURL(/\/admin\/art-piece-submissions/);
    await expect(
      page.getByRole("heading", { name: /404/i }),
    ).toBeVisible({ timeout: 15_000 });
  });
});


