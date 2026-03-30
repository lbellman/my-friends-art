const TOKENS: {
  development: {
    supabaseUrl: string;
    supabaseAnonKey: string;
    supabaseServiceRoleKey: string;
  };
  production: {
    supabaseUrl: string;
    supabaseAnonKey: string;
    supabaseServiceRoleKey: string;
  };
} = {
  development: {
    supabaseUrl: process.env.LOCAL_SUPABASE_URL!,
    supabaseAnonKey: process.env.LOCAL_SUPABASE_ANON_KEY!,
    supabaseServiceRoleKey: process.env.LOCAL_SUPABASE_SERVICE_ROLE_KEY!,
  },
  production: {
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  },
};

const isBrowser = typeof window !== "undefined";

/**
 * IMPORTANT:
 * Many components import `@/lib/supabase/server` even from client components.
 * In the browser, only `NEXT_PUBLIC_*` env vars are available, so we must
 * switch to those for client-side bundles.
 */
export const tokens = isBrowser
  ? {
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
      supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      // Not used by your client-side Supabase client, but keeps the object shape consistent.
      supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
    }
  : TOKENS[process.env.NODE_ENV as keyof typeof TOKENS];
