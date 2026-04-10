import type { Page } from "@playwright/test";

type StoredAuth = {
  user?: { id?: string };
  currentSession?: { user?: { id?: string } };
};

/**
 * Reads the Supabase JS auth session from localStorage (same origin as the app).
 * Use after the page has established a session (e.g. after artist setup / login).
 */
export async function getAuthUserIdFromPage(page: Page): Promise<string> {
  const id = await page.evaluate(() => {
    const keys = Object.keys(localStorage).filter(
      (k) => k.startsWith("sb-") && k.endsWith("-auth-token"),
    );
    for (const key of keys) {
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      try {
        const v = JSON.parse(raw) as StoredAuth;
        const uid = v.user?.id ?? v.currentSession?.user?.id;
        if (uid) return uid;
      } catch {
        /* ignore malformed */
      }
    }
    return null;
  });

  if (!id) {
    throw new Error(
      "Could not read Supabase auth user id from localStorage (expected a key like sb-*-auth-token).",
    );
  }
  return id;
}
