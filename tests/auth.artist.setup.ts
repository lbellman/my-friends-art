import path from "path";
import { test as setup } from "@playwright/test";

const authFile = path.join("playwright", ".auth", "artist.json");

/**
 * Signs in through the artist login form and persists cookies + localStorage
 * (Supabase session) for reuse in artist test projects.
 *
 * Set E2E_ARTIST_EMAIL and E2E_ARTIST_PASSWORD (e.g. in .env.test.local or CI secrets).
 */
setup("authenticate as artist", async ({ page }) => {
  const email = process.env.E2E_ARTIST_EMAIL?.trim();
  const password = process.env.E2E_ARTIST_PASSWORD?.trim();

  if (!email || !password) {
    throw new Error(
      "Missing E2E_ARTIST_EMAIL or E2E_ARTIST_PASSWORD. Add them to your environment for the artist Playwright auth setup.",
    );
  }

  await page.goto("/artist-login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();

  await page.waitForURL(/\/dashboard/);

  await page.context().storageState({ path: authFile });
});
