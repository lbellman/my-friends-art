import { Database } from "@/supabase";
import { createClient } from "@supabase/supabase-js";
import { tokens } from "@/config";

const url = tokens.supabaseUrl;
const key = tokens.supabaseAnonKey;

if (!url || !key) {
  const isBrowser = typeof window !== "undefined";
  const expected = isBrowser
    ? "NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY"
    : process.env.NODE_ENV === "production"
      ? "NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY"
      : "LOCAL_SUPABASE_URL and LOCAL_SUPABASE_ANON_KEY";
  throw new Error(
    `Missing Supabase env vars (${expected}). Make sure your Next.js dev server is restarted after changing env vars.`
  );
}

const supabase = createClient<Database>(url, key);

export default supabase;