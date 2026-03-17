// lib/supabase/admin.ts
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/supabase";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// IMPORTANT: this file should NEVER be imported in "use client" components. Only server components. 
export const adminSupabase = createClient<Database>(url, serviceRoleKey);