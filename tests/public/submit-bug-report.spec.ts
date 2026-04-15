import { test, expect } from "@playwright/test";

test("Submit a bug report", async ({ page }) => {
  await page.goto("/found-a-bug");

  // Fill out the form
  await page.getByTestId("title").fill("Test Title");
  await page.getByTestId("description").fill("Test Description");
  await page.getByTestId("email").fill("test@example.com");
  await page.getByTestId("submit-button").click();
  await expect(page.getByText("Thanks for your help!")).toBeVisible({ timeout: 15_000 });
});