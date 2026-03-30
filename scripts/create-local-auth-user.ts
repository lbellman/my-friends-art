/**
 * Creates a local test user via `auth.signUp` (anon key — same as the browser app).
 *
 * Env: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY (.env.development.local / .env.local)
 * Optional: LOCAL_AUTH_EMAIL, LOCAL_AUTH_PASSWORD (defaults: seed-artist@local.test / local-seed-artist-dev-1!)
 *
 * Run: pnpm local:create-auth-user
 */
import { config as loadEnv } from "dotenv";
import { createClient } from "@supabase/supabase-js";
import path from "node:path";

import type { Database } from "../supabase";

const cwd = process.cwd();
loadEnv({ path: path.join(cwd, ".env") });
loadEnv({ path: path.join(cwd, ".env.local"), override: true });
loadEnv({ path: path.join(cwd, ".env.development.local"), override: true });

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? "";
  const email =
    process.env.LOCAL_AUTH_EMAIL?.trim() ?? "seed-artist@local.test";
  const password =
    process.env.LOCAL_AUTH_PASSWORD?.trim() ?? "local-seed-artist-dev-1!";

  if (!url || !anonKey) {
    console.error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY (same as pnpm dev).",
    );
    process.exit(1);
  }

  const supabase = createClient<Database>(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) {
    if (/already|registered|exists|duplicate|User already/i.test(error.message)) {
      console.log(`User already exists: ${email}`);
      process.exit(0);
    }
    console.error("signUp error:", error.message);
    process.exit(1);
  }

  if (!data.user) {
    console.error("signUp returned no user.");
    process.exit(1);
  }

  console.log(`Created user ${email} (id: ${data.user.id})`);
  console.log(
    "Next: run supabase/seed_link_test_artist.sql in the SQL Editor.",
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
