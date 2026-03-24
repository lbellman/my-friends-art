import { restoreArtListPosition } from "@/lib/art-list-restore";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function useRestoreArtList({
  isLoading,
  namespace,
}: {
  isLoading: boolean;
  namespace: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  useEffect(() => {
    restoreArtListPosition(namespace, router, pathname, isLoading, searchParams);
  }, [router, pathname, isLoading, namespace, searchParams]);
}
