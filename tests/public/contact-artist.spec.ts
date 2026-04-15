import { ART_IDS } from "@/tests/public/product-request.spec";
import { expect, test } from "@playwright/test";


test("Public can contact an artist", async ({ page }) => {
  const fromEmail = "john.doe@example.com";
  const name = "John Doe";

  await page.goto(`/${ART_IDS["made-to-order"]}`);
  await page.getByRole("button", { name: "Contact Artist" }).click();
  // Dialog will open
  await page.getByRole("textbox", { name: "Name" }).fill(name);
  await page.getByRole("textbox", { name: "Email" }).fill(fromEmail); 
  await page.getByRole("textbox", { name: "Message" }).fill("Hello!");
  await page.getByRole("button", { name: "Send Message" }).click();
  // Toast will appear 
  await expect(page.getByText("Email sent successfully.")).toBeVisible({ timeout: 15_000 });

});
