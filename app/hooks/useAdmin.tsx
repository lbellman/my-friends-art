"use client";

import supabase from "@/lib/supabase/server";
import type { User } from "@supabase/supabase-js";
import { useQuery } from "@tanstack/react-query";

/**
 * Whether the current user has admin access per `public.user_roles` (same source as RLS).
 * Pass `user` from `useAuth()` (or any `User | null`).
 */
export default function useAdmin(user: User | null): {
  isAdmin: boolean;
  loading: boolean;
} {
  const { data, isLoading } = useQuery({
    queryKey: ["user_roles", user?.id],
    queryFn: async () => {
      const { data: row, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user!.id)
        .maybeSingle();
      if (error) throw error;
      return row;
    },
    enabled: !!user,
  });

  const isAdmin = data?.role === "admin";
  const loading = !!user && isLoading;

  return { isAdmin, loading };
}
