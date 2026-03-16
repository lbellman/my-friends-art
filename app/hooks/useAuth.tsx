"use client";

import { useEffect, useState } from "react";
import supabase from "@/lib/supabase/server";
import type { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

type UseAuthResult = {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
};

/**
 * useAuth
 *
 * Returns the current Supabase auth user (or null) and a loading flag.
 * The hook subscribes to auth state changes so the user value stays in sync
 * when someone logs in or out.
 */
export default function useAuth(): UseAuthResult {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!isMounted) return;

      setUser(user ?? null);
      setLoading(false);
    };

    loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) return;
      setUser(session?.user ?? null);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push("/");
  };

  return { user, loading, signOut };
}
