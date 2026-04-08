import { restoreArtListPosition } from "@/lib/art-list-restore";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

/** Restores dashboard tab + art-pieces page + scroll after returning from `/dashboard/[id]`. */
export default function useRestoreDashboard({
  isLoading,
}: {
  isLoading: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  useEffect(() => {
    restoreArtListPosition(
      "dashboard",
      router,
      pathname,
      isLoading,
      searchParams,
    );
  }, [router, pathname, isLoading, searchParams]);
}
