import { getPublicUrl } from "@/@types";
import ArtPieceStatusChip from "@/components/atoms/art-piece-status-chip/ArtPieceStatusChip";
import Link from "next/link";
import Image from "next/image";

import { useQuery } from "@tanstack/react-query";
import supabase from "@/lib/supabase/server";
import { artListReturnStorageKey } from "@/lib/art-list-restore";
import { DashboardArtPieceRow } from "@/components/views/ArtistDashboardView/ArtistDashboardView";

interface DashboardArtCardProps {
  artPiece: DashboardArtPieceRow;
  /** Persists tab + page + scroll for returning from `/dashboard/[id]` (see `useRestoreDashboard`). */
  listRestore?: {
    namespace: string;
    page: number;
    tab: "art-pieces";
  };
}

export default function DashboardArtCard({
  artPiece,
  listRestore,
}: DashboardArtCardProps) {
  const thumbPath = artPiece.thumbnail_path ?? artPiece.display_path;
  const publicUrl = getPublicUrl("art-pieces", thumbPath ?? "");
  const href = `/dashboard/${artPiece.id}`;

  const { data: productRequests } = useQuery({
    queryKey: ["product-requests", artPiece.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("product_request")
        .select("id")
        .eq("art_piece_id", artPiece.id);
      return data;
    },
    enabled: !!artPiece.id,
  });

  return (
    <Link
      href={href}
      className="block group hover:-translate-y-1 rounded-xl border border-border bg-card overflow-hidden transition-all"
      onClick={() => {
        if (typeof window === "undefined" || !listRestore) return;
        sessionStorage.setItem(
          artListReturnStorageKey(listRestore.namespace),
          JSON.stringify({
            page: listRestore.page,
            scrollY: window.scrollY,
            tab: listRestore.tab,
          }),
        );
      }}
    >
      <div className="relative aspect-3/4 bg-muted">
        {publicUrl ? (
          <Image
            src={publicUrl}
            alt={artPiece.title}
            fill
            className="object-cover transition-transform duration-300"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-4xl font-light text-muted-foreground/50">
              {artPiece.title.charAt(0)}
            </span>
          </div>
        )}
      </div>
      <div className="p-3 flex flex-col items-start gap-1">
        <p className="font-medium group-hover:text-primary-foreground text-foreground truncate ">
          {artPiece.title}
        </p>
        <div className="flex flex-col gap-1 items-start w-full">
          <ArtPieceStatusChip
            status={artPiece.status}
            className="mt-0.5"
          />
          {artPiece.status === "approved" && (
            <p className="text-xs text-muted-foreground">
              {!productRequests || productRequests?.length === 0
                ? "No product requests yet"
                : `${productRequests?.length} product request${
                    productRequests?.length === 1 ? "" : "s"
                  }`}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
