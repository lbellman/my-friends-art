import path from "path";
import { test as setup } from "@playwright/test";

const authFile = path.join("playwright", ".auth", "admin.json");

/**
 * Signs in as an admin user via the same Supabase login page used for artists.
 * Admin access is determined by your app after login (useAdmin / role checks).
 *
 * Set E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD (e.g. in .env.test.local or CI secrets).
 */
setup("authenticate as admin", async ({ page }) => {
  const email = process.env.E2E_ADMIN_EMAIL?.trim();
  const password = process.env.E2E_ADMIN_PASSWORD?.trim();

  if (!email || !password) {
    throw new Error(
      "Missing E2E_ADMIN_EMAIL or E2E_ADMIN_PASSWORD. Add them to your environment for the admin Playwright auth setup.",
    );
  }

  await page.goto("/artist-login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();

  await page.waitForURL(/\/dashboard/);

  await page.context().storageState({ path: authFile });
});
