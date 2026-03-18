import { ART_PIECE_STATUS_OPTIONS, getPublicUrl } from "@/@types";
import Link from "next/link";
import Image from "next/image";
import { Check, Circle, X } from "lucide-react";
import { DashboardArtPieceRow } from "@/app/dashboard/page";
import { useQuery } from "@tanstack/react-query";
import supabase from "@/lib/supabase/server";

interface DashboardArtCardProps {
  artPiece: DashboardArtPieceRow;
}

const approvedClass = "bg-success/30 text-success-foreground";
const pendingClass = "bg-muted/80 text-muted-foreground";
const notApprovedClass = "bg-destructive/30 text-destructive-foreground";

export default function DashboardArtCard({ artPiece }: DashboardArtCardProps) {
  const thumbPath = artPiece.thumbnail_path ?? artPiece.display_path;
  const publicUrl = getPublicUrl(thumbPath ?? "");
  const href = `/dashboard/${artPiece.id}`;

  const statusClass =
    artPiece.status === "approved"
      ? approvedClass
      : artPiece.status === "pending-approval"
        ? pendingClass
        : notApprovedClass;

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
          <div
            className={`text-xs mt-0.5 inline-flex items-center gap-2 rounded-full px-3 py-1 ${statusClass}`}
          >
            {artPiece.status === "approved" ? (
              <Check className="size-3" />
            ) : artPiece.status === "not-approved" ? (
              <X className="size-3" />
            ) : (
              <Circle className="size-3" />
            )}
            {artPiece.status
              ? (ART_PIECE_STATUS_OPTIONS[artPiece.status] ?? artPiece.status)
              : "—"}
          </div>
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
