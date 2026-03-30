import { Database } from "@/supabase";
import { createClient } from "@supabase/supabase-js";
import { tokens } from "@/config";

const url = tokens.supabaseUrl;
const key = tokens.supabaseAnonKey;

if (!url || !key) {
  throw new Error(
    "Missing Supabase env vars. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your environment (e.g. Vercel → Project Settings → Environment Variables, and include them for Build)."
  );
}

const supabase = createClient<Database>(url, key);

export default supabase;