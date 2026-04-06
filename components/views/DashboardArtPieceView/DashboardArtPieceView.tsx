"use client";

import {
  ArtistType,
  ArtPiece,
  getPublicUrl,
  ProductRequestRow,
  ProductRequestStatusType,
} from "@/@types";
import ArtPieceStatusChip from "@/components/atoms/art-piece-status-chip/ArtPieceStatusChip";
import Button from "@/components/atoms/button/Button";
import MultiImageDisplay from "@/components/molecules/multi-image-display/MultiImageDisplay";
import ProductRequestCard from "@/components/molecules/product-request-card/ProductRequestCard";
import InternalLayout from "@/components/organisms/InternalLayout";
import { Skeleton } from "@/components/ui/skeleton";
import ArtPieceActionsCard from "@/components/views/DashboardArtPieceView/ArtPieceActionsCard";
import DetailsCard from "@/components/views/DashboardArtPieceView/DetailsCard";
import { resolveDownloadImageType } from "@/lib/sniff-image-type";
import supabase from "@/lib/supabase/server";
import { useQuery } from "@tanstack/react-query";
import { Download } from "lucide-react";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";

type ProductRequestFilter = "all" | "pending" | "fulfilled" | "cancelled";

export default function DashboardArtPieceView() {
  const { artPieceId } = useParams<{ artPieceId: string }>();
  const {
    data: artPiece,
    isLoading: isLoadingArtPiece,
    error,
  } = useQuery({
    queryKey: ["dashboard-art-piece", artPieceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("art_piece")
        .select(
          "*, product_dimensions_id, product_dimensions:product_dimensions_id(width_in, height_in, depth_in), art_piece_display_image(path, idx), artist:artist_id(id, name, email_address)",
        )
        .eq("id", artPieceId)
        .single();

      if (error) {
        throw error;
      }

      return data;
    },
    enabled: !!artPieceId,
  });

  const {
    data: productRequests = [],
    isLoading: isLoadingRequests,
    refetch: refetchProductRequests,
  } = useQuery({
    queryKey: ["product-requests", artPieceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("product_request")
        .select("*")
        .eq("art_piece_id", artPieceId)
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      return (data ?? []) as ProductRequestRow[];
    },
    enabled: !!artPieceId,
  });

  const [requestFilter, setRequestFilter] =
    useState<ProductRequestFilter>("pending");

  const [isDownloadingOriginal, setIsDownloadingOriginal] = useState(false);

  const galleryUrls = useMemo(() => {
    if (!artPiece) return [];
    const rows = [...(artPiece.art_piece_display_image ?? [])].sort(
      (a, b) => a.idx - b.idx,
    );
    if (rows.length > 0) {
      return rows.map((r) => getPublicUrl(r.path)).filter(Boolean);
    }
    const fallback = getPublicUrl(
      artPiece.display_path ?? artPiece.thumbnail_path ?? "",
    );
    return fallback ? [fallback] : [];
  }, [artPiece]);

  const formattedCreatedAt = artPiece?.created_at
    ? new Date(artPiece.created_at).toLocaleString()
    : "—";

  const handleUpdateProductRequestStatus = async (
    id: string,
    status: ProductRequestStatusType,
  ) => {
    await supabase.from("product_request").update({ status }).eq("id", id);
    void refetchProductRequests();
  };

  const filteredProductRequests = productRequests.filter((request) => {
    if (requestFilter === "all") return true;
    return request.status === requestFilter;
  });

  const handleDownloadPrintQualityImage = async () => {
    if (!artPiece?.original_path) return;
    setIsDownloadingOriginal(true);
    try {
      const { data: blob, error } = await supabase.storage
        .from("originals")
        .download(artPiece.original_path);
      if (error || !blob) {
        toast.error("Could not download file.");
        return;
      }
      const buffer = await blob.arrayBuffer();
      const { mime, ext } = resolveDownloadImageType(blob, buffer);
      const typedBlob = new Blob([buffer], { type: mime });
      const safeTitle = (artPiece.title || "art-piece")
        .replace(/[^a-z0-9-_]+/gi, "-")
        .replace(/^-|-$/g, "")
        .slice(0, 80);
      const filename = `${safeTitle || "art-piece"}-print-quality.${ext}`;
      const url = URL.createObjectURL(typedBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Download started.");
    } catch {
      toast.error("Download failed.");
    } finally {
      setIsDownloadingOriginal(false);
    }
  };

  return (
    <InternalLayout
      title={"art piece details"}
      back={{ href: "/dashboard", label: "Back to dashboard" }}
    >
      <div className="max-w-5xl mx-auto flex flex-col gap-8">
        {isLoadingArtPiece ? (
          <div className="grid gap-6 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] items-start">
            <Skeleton className="w-full aspect-3/4 rounded-xl" />
            <div className="space-y-4">
              <Skeleton className="h-7 w-2/3" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-20 w-full" />
            </div>
          </div>
        ) : error ? (
          <p className="text-destructive">
            There was a problem loading this art piece.
          </p>
        ) : !artPiece ? (
          <p className="text-muted-foreground">Art piece not found.</p>
        ) : (
          <>
            {/* Header: image + details */}
            <div className="grid gap-6 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] items-start">
              <div className="relative w-full aspect-3/4 rounded-xl overflow-hidden bg-muted border border-border">
                <MultiImageDisplay
                  imageSrcs={galleryUrls}
                  alt={artPiece.title ?? "Your art piece"}
                  fallbackTitle={artPiece.title ?? ""}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 40vw"
                />
              </div>
              <DetailsCard artPiece={artPiece as ArtPiece} />
            </div>

            {/* Metadata */}
            {artPiece.product_type === "print" && (
              <section className="bg-card border border-border rounded-xl p-6 space-y-4">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <h3 className="text-base text-foreground">metadata</h3>

                  {/* Download print quality image */}
                  <div className="">
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      label={
                        isDownloadingOriginal
                          ? "Preparing download…"
                          : "Download Print Quality Image"
                      }
                      icon={<Download className="size-4" />}
                      disabled={
                        !artPiece.original_path || isDownloadingOriginal
                      }
                      loading={isDownloadingOriginal}
                      onClick={() => void handleDownloadPrintQualityImage()}
                    />
                    {!artPiece.original_path && (
                      <p className="text-xs text-muted-foreground mt-2">
                        No print-quality original is stored for this piece.
                      </p>
                    )}
                  </div>
                </div>
                <dl className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-4 text-sm">
                  <div>
                    <dt className="text-muted-foreground">Pixel height</dt>
                    <dd className="font-medium text-foreground">
                      {artPiece.px_height ?? "—"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Pixel width</dt>
                    <dd className="font-medium text-foreground">
                      {artPiece.px_width ?? "—"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Created at</dt>
                    <dd className="font-medium text-foreground">
                      {formattedCreatedAt}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Status</dt>
                    <dd className="mt-1">
                      <ArtPieceStatusChip status={artPiece.status} />
                    </dd>
                  </div>
                </dl>
              </section>
            )}

            {/* Product requests */}
            <section className="flex flex-col gap-4 mb-8">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <h5 className="font-display text-foreground">
                  Product requests
                </h5>
                {/* Filters for product requests */}
                {!isLoadingRequests && productRequests.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant={
                        requestFilter === "all" ? "primary" : "secondary"
                      }
                      label="All"
                      onClick={() => setRequestFilter("all")}
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant={
                        requestFilter === "pending" ? "primary" : "secondary"
                      }
                      label="Pending"
                      onClick={() => setRequestFilter("pending")}
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant={
                        requestFilter === "fulfilled" ? "primary" : "secondary"
                      }
                      label="Fulfilled"
                      onClick={() => setRequestFilter("fulfilled")}
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant={
                        requestFilter === "cancelled" ? "primary" : "secondary"
                      }
                      label="Cancelled"
                      onClick={() => setRequestFilter("cancelled")}
                    />
                  </div>
                )}
              </div>

              {isLoadingRequests ? (
                <div className="space-y-3">
                  <Skeleton className="h-24 w-full rounded-lg" />
                  <Skeleton className="h-24 w-full rounded-lg" />
                </div>
              ) : filteredProductRequests.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  {requestFilter === "all"
                    ? "There are no product requests for this piece yet."
                    : `There are no ${requestFilter} requests for this piece.`}
                </p>
              ) : (
                <div className="space-y-3">
                  {filteredProductRequests.map((request) => (
                    <ProductRequestCard
                      key={request.id}
                      request={request}
                      artPiece={artPiece as ArtPiece}
                      onChangeStatus={handleUpdateProductRequestStatus}
                      artist={artPiece.artist as ArtistType}
                    />
                  ))}
                </div>
              )}
            </section>
            <ArtPieceActionsCard artPiece={artPiece as ArtPiece} />
          </>
        )}
      </div>
    </InternalLayout>
  );
}
