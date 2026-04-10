import path from "path";
import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";

import { assertLocalSupabaseUrlForTests } from "./tests/helpers/supabase-admin";

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
dotenv.config({ path: path.resolve(process.cwd(), ".env.test.local") });
dotenv.config({ path: path.resolve(process.cwd(), ".env.e2e.local") });
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config({
  path: path.resolve(process.cwd(), ".env.development.local"),
  override: true,
});

assertLocalSupabaseUrlForTests(process.env.NEXT_PUBLIC_SUPABASE_URL);

const artistAuthFile = path.join("playwright", ".auth", "artist.json");
const adminAuthFile = path.join("playwright", ".auth", "admin.json");

/**
 * See https://playwright.dev/docs/test-configuration.
 *
 * Auth setup:
 * - `tests/auth.artist.setup.ts` → `playwright/.auth/artist.json` (E2E_ARTIST_EMAIL / E2E_ARTIST_PASSWORD)
 * - `tests/auth.admin.setup.ts` → `playwright/.auth/admin.json` (E2E_ADMIN_EMAIL / E2E_ADMIN_PASSWORD)
 *
 * Tests live under `tests/artist/`, `tests/admin/`, and `tests/public/` (see `testMatch` per project).
 */
export default defineConfig({
  testDir: "./tests",
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: "html",
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('')`. */
    baseURL: "http://127.0.0.1:3000",

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: "on-first-retry",
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: "setup-artist",
      testMatch: /auth\.artist\.setup\.ts/,
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "setup-admin",
      testMatch: /auth\.admin\.setup\.ts/,
      use: { ...devices["Desktop Chrome"] },
    },

    {
      name: "chromium-artist",
      use: {
        ...devices["Desktop Chrome"],
        storageState: artistAuthFile,
      },
      dependencies: ["setup-artist"],
      testMatch: "artist/**/*.spec.ts",
    },
    {
      name: "firefox-artist",
      use: {
        ...devices["Desktop Firefox"],
        storageState: artistAuthFile,
      },
      dependencies: ["setup-artist"],
      testMatch: "artist/**/*.spec.ts",
    },
    {
      name: "webkit-artist",
      use: {
        ...devices["Desktop Safari"],
        storageState: artistAuthFile,
      },
      dependencies: ["setup-artist"],
      testMatch: "artist/**/*.spec.ts",
    },

    {
      name: "chromium-admin",
      use: {
        ...devices["Desktop Chrome"],
        storageState: adminAuthFile,
      },
      dependencies: ["setup-admin"],
      testMatch: "admin/**/*.spec.ts",
    },
    {
      name: "firefox-admin",
      use: {
        ...devices["Desktop Firefox"],
        storageState: adminAuthFile,
      },
      dependencies: ["setup-admin"],
      testMatch: "admin/**/*.spec.ts",
    },
    {
      name: "webkit-admin",
      use: {
        ...devices["Desktop Safari"],
        storageState: adminAuthFile,
      },
      dependencies: ["setup-admin"],
      testMatch: "admin/**/*.spec.ts",
    },

    {
      name: "chromium-public",
      use: { ...devices["Desktop Chrome"] },
      testMatch: "public/**/*.spec.ts",
    },
    {
      name: "firefox-public",
      use: { ...devices["Desktop Firefox"] },
      testMatch: "public/**/*.spec.ts",
    },
    {
      name: "webkit-public",
      use: { ...devices["Desktop Safari"] },
      testMatch: "public/**/*.spec.ts",
    },

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: "pnpm dev",
    url: "http://127.0.0.1:3000",
    reuseExistingServer: !process.env.CI,
    /* Avoid real Resend emails when Playwright starts this server (see send-transactional). */
    env: {
      ...process.env,
      DISABLE_TRANSACTIONAL_EMAIL: "1",
    },
  },
});
