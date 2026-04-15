import { test, expect } from "@playwright/test";

import { getServiceSupabase } from "../helpers/supabase-admin";

export const ART_IDS = {
  print: "10300000-0000-4000-8000-000000000001",
  "made-to-order": "10100000-0000-4000-8000-000000000001",
  original: "10200000-0000-4000-8000-000000000001",
};

test("Public can create print requests", async ({ page }) => {
  const fromEmail = "john.doe@example.com";
  const name = "John Doe";

  await page.goto(`/${ART_IDS.print}`);
  await page.getByRole("button", { name: "Request a Print" }).click();
  // Dialog will open
  await page.getByRole("textbox", { name: "Name" }).fill(name);
  await page.getByRole("textbox", { name: "Email" }).fill(fromEmail);
  await page
    .getByRole("textbox", { name: "Message" })
    .fill("I would like to request a print of this art piece.");
  await page.getByRole("button", { name: "Send Request" }).click();
  // Toast will appear 
  await expect(page.getByText("Print request created!")).toBeVisible();


  // Check the database for the request
  const supabase = getServiceSupabase();
  const { data, error } = await supabase
    .from("product_request")
    .select("id, name, from_email, type, status, art_piece_id")
    .eq("art_piece_id", ART_IDS.print)
    .eq("from_email", fromEmail)
    .eq("name", name)
    .eq("type", "print")
    .order("created_at", { ascending: false })
    .limit(5);

  expect(error).toBeNull();
  expect(data?.length ?? 0).toBeGreaterThan(0);
  expect(data?.[0]?.status).toBe("pending");
});


test("Public can create made-to-order requests", async ({ page }) => {
  const fromEmail = "john.doe@example.com";
  const name = "John Doe";

  await page.goto(`/${ART_IDS["made-to-order"]}`);
  await page.getByRole("button", { name: "Request a Custom Order" }).click();
  // Dialog will open
  await page.getByRole("textbox", { name: "Name" }).fill(name);
  await page.getByRole("textbox", { name: "Email" }).fill(fromEmail); 
  await page.getByRole("textbox", { name: "Message" }).fill("I would like to request a custom order for this art piece.");
  await page.getByRole("button", { name: "Submit Request" }).click();
  // Toast will appear 
  await expect(page.getByText("Purchase request created!")).toBeVisible();

  // Check the database for the request
  const supabase = getServiceSupabase();
  const { data, error } = await supabase
    .from("product_request")
    .select("id, name, from_email, type, status, art_piece_id")
    .eq("art_piece_id", ART_IDS["made-to-order"])
    .eq("from_email", fromEmail)
    .eq("name", name)
    .eq("type", "custom-order")
    .order("created_at", { ascending: false })
    .limit(5);

  expect(error).toBeNull();
  expect(data?.length ?? 0).toBeGreaterThan(0);
  expect(data?.[0]?.status).toBe("pending");
});


test("Public can create original requests", async ({ page }) => {
  const fromEmail = "john.doe@example.com";
  const name = "John Doe";

  await page.goto(`/${ART_IDS.original}`);
  await page.getByRole("button", { name: "Request to Purchase" }).click();
  // Dialog will open
  await page.getByRole("textbox", { name: "Name" }).fill(name);
  await page.getByRole("textbox", { name: "Email" }).fill(fromEmail); 
  await page.getByRole("textbox", { name: "Message" }).fill("I would like to request a custom order for this art piece.");
  await page.getByRole("button", { name: "Submit Request" }).click();
  // Toast will appear 
  await expect(page.getByText("Purchase request created!")).toBeVisible();

  // Check the database for the request
  const supabase = getServiceSupabase();
  const { data, error } = await supabase
    .from("product_request")
    .select("id, name, from_email, type, status, art_piece_id")
    .eq("art_piece_id", ART_IDS.original)
    .eq("from_email", fromEmail)
    .eq("name", name)
    .eq("type", "original")
    .order("created_at", { ascending: false })
    .limit(5);

  expect(error).toBeNull();
  expect(data?.length ?? 0).toBeGreaterThan(0);
  expect(data?.[0]?.status).toBe("pending");
});