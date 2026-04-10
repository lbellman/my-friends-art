import path from "path";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

import type { Database } from "../../supabase";

const LOCAL_SUPABASE_HOSTS = new Set([
  "127.0.0.1",
  "localhost",
  "::1",
]);

/**
 * Playwright tests use the service role and mutate seed data; they must only talk to
 * local Supabase (CLI default: http://127.0.0.1:54321), never hosted projects.
 */
export function assertLocalSupabaseUrlForTests(
  apiUrl: string | undefined,
): asserts apiUrl is string {
  const trimmed = apiUrl?.trim();
  if (!trimmed) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL is missing. Playwright tests require a local Supabase API URL.",
    );
  }

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    throw new Error(
      `Invalid NEXT_PUBLIC_SUPABASE_URL for tests: ${JSON.stringify(trimmed)}`,
    );
  }

  const host = parsed.hostname.toLowerCase();
  if (!LOCAL_SUPABASE_HOSTS.has(host)) {
    throw new Error(
      `Refusing to run tests against NEXT_PUBLIC_SUPABASE_URL host ${JSON.stringify(host)}. ` +
        "Use local Supabase only (hostname 127.0.0.1, localhost, or ::1 — e.g. http://127.0.0.1:54321 from `supabase status`).",
    );
  }
}

/**
 * Loads env the same way as local scripts / Next (Playwright config also loads
 * `.env.test.local`). Service role is required to read `product_request` etc. from tests.
 */
function loadEnvForTests() {
  const cwd = process.cwd();
  dotenv.config({ path: path.join(cwd, ".env.test.local") });
  dotenv.config({ path: path.join(cwd, ".env.e2e.local") });
  dotenv.config({ path: path.join(cwd, ".env.local") });
  dotenv.config({ path: path.join(cwd, ".env.development.local"), override: true });
}

let cached: SupabaseClient<Database> | null = null;

/**
 * Supabase client with the service role key (bypasses RLS). Use only in Playwright tests
 * against local Supabase — never ship the service key to the browser.
 *
 * Env: `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` (from `supabase status` locally).
 * The URL must be local (127.0.0.1 / localhost); production is rejected.
 */
export function getServiceSupabase(): SupabaseClient<Database> {
  if (cached) return cached;

  loadEnvForTests();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  assertLocalSupabaseUrlForTests(url);

  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ??
    process.env.SERVICE_ROLE_KEY?.trim() ??
    "";

  if (!key) {
    throw new Error(
      "Missing SUPABASE_SERVICE_ROLE_KEY (or SERVICE_ROLE_KEY). For local Supabase, run `supabase status` and copy the service_role key into .env.development.local or .env.test.local.",
    );
  }

  cached = createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached;
}
