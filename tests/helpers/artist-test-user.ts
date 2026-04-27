import type { Page } from "@playwright/test";

import { getServiceSupabase } from "./supabase-admin";

type StorageStateSnapshot = {
  origins: Array<{
    localStorage: Array<{ name: string; value: string }>;
  }>;
};

function parseAuthenticatedUserId(storageState: StorageStateSnapshot) {
  for (const origin of storageState.origins) {
    for (const item of origin.localStorage) {
      if (!item.name.endsWith("-auth-token")) continue;
      try {
        const tokenPayload = JSON.parse(item.value) as {
          user?: { id?: string };
        };
        const userId = tokenPayload.user?.id?.trim();
        if (userId) return userId;
      } catch {
        // Ignore non-JSON localStorage values and keep searching.
      }
    }
  }
  return null;
}

export async function getAuthenticatedArtistId(page: Page): Promise<string> {
  const storageState = await page.context().storageState();
  const userId = parseAuthenticatedUserId(storageState);
  if (!userId) {
    throw new Error(
      "Could not determine authenticated user from Playwright storage state.",
    );
  }

  const supabase = getServiceSupabase();
  const { data, error } = await supabase
    .from("artist")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  if (!data?.id) {
    throw new Error(`No artist row found for authenticated user ${userId}.`);
  }
  return data.id;
}

export async function getAnyArtistId(): Promise<string> {
  const supabase = getServiceSupabase();
  const { data, error } = await supabase
    .from("artist")
    .select("id")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  if (!data?.id) {
    throw new Error("No artist rows found for test fixture setup.");
  }
  return data.id;
}
