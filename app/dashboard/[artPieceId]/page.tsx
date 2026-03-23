"use client";

import {
  ART_PIECE_STATUS_OPTIONS,
  ArtPiece,
  getPublicUrl,
  type ArtPieceStatusType,
} from "@/@types";
import useArtPiece from "@/app/hooks/useArtPiece";
import Button from "@/components/atoms/button/Button";
import Input from "@/components/atoms/input/Input";
import TextArea from "@/components/atoms/text-area/TextArea";
import ProductRequestCard from "@/components/molecules/product-request-card/ProductRequestCard";
import ConfirmDialog from "@/components/organisms/confirm-dialog/ConfirmDialog";
import DeleteRestrictedDialog from "@/components/organisms/delete-restricted-dialog/DeleteRestrictedDialog";
import InternalLayout from "@/components/organisms/InternalLayout";
import { Skeleton } from "@/components/ui/skeleton";
import supabase from "@/lib/supabase/server";
import type { Database } from "@/supabase";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function DashboardArtPieceDetailPage() {
  const { artPieceId } = useParams<{ artPieceId: string }>();
  const { deleteArtPiece } = useArtPiece();
  const router = useRouter();

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
          "id, title, description, display_path, original_path, thumbnail_path, px_width, px_height, dpi, aspect_ratio, created_at, status, product_type",
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

  type ProductRequestRow =
    Database["public"]["Tables"]["product_request"]["Row"];
  type ProductRequestStatus =
    Database["public"]["Enums"]["product_request_statuses"];

  type ProductRequestFilter = "all" | "pending" | "fulfilled" | "cancelled";

  const {
    data: productRequests = [],
    isLoading: isLoadingRequests,
    refetch: refetchProductRequests,
  } = useQuery({
    queryKey: ["product-requests", artPieceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("product_request")
        .select(
          "id, name, from_email, message, dimensions, print_option, created_at, status, type",
        )
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
  const [confirmDeleteDialogOpen, setConfirmDeleteDialogOpen] = useState(false);
  const [deleteRestrictedDialogOpen, setDeleteRestrictedDialogOpen] =
    useState(false);

  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [isSavingDetails, setIsSavingDetails] = useState(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);
  const [detailsSuccess, setDetailsSuccess] = useState(false);

  const imagePath = artPiece?.display_path ?? artPiece?.thumbnail_path ?? "";
  const imageUrl = imagePath ? getPublicUrl(imagePath) : "";

  const formattedCreatedAt = artPiece?.created_at
    ? new Date(artPiece.created_at).toLocaleString()
    : "—";

  const statusLabel = artPiece?.status
    ? (ART_PIECE_STATUS_OPTIONS[artPiece.status as ArtPieceStatusType] ??
      artPiece.status)
    : "—";

  const handleUpdateProductRequestStatus = async (
    id: string,
    status: ProductRequestStatus,
  ) => {
    await supabase.from("product_request").update({ status }).eq("id", id);
    void refetchProductRequests();
  };

  const filteredProductRequests = productRequests.filter((request) => {
    if (requestFilter === "all") return true;
    return request.status === requestFilter;
  });

  useEffect(() => {
    if (!artPiece) return;
    setEditTitle(artPiece.title ?? "");
    setEditDescription(artPiece.description ?? "");
    setDetailsError(null);
    setDetailsSuccess(false);
  }, [artPiece]);

  const handleSaveDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!artPiece) return;
    const trimmedTitle = editTitle.trim();
    if (!trimmedTitle) {
      setDetailsError("Title is required.");
      setDetailsSuccess(false);
      return;
    }

    setIsSavingDetails(true);
    setDetailsError(null);
    setDetailsSuccess(false);
    try {
      const { error } = await supabase
        .from("art_piece")
        .update({
          title: trimmedTitle,
          description: editDescription.trim() || null,
        })
        .eq("id", artPiece.id);

      if (error) {
        setDetailsError("Failed to update details. Please try again.");
      } else {
        setDetailsSuccess(true);
      }
    } catch (err) {
      setDetailsError("Failed to update details. Please try again.");
    } finally {
      setIsSavingDetails(false);
    }
  };

  return (
    <InternalLayout
      title={"art piece details"}
      back={{ href: "/dashboard", label: "Back to dashboard" }}
    >
      <div className="max-w-5xl mx-auto space-y-8">
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
            {/* Header: image + edit details card */}
            <div className="grid gap-6 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] items-start">
              <div className="relative w-full aspect-3/4 rounded-xl overflow-hidden bg-muted border border-border">
                {imageUrl ? (
                  <Image
                    src={imageUrl}
                    alt={artPiece.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 40vw"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-4xl font-light text-muted-foreground/50">
                      {artPiece.title.charAt(0)}
                    </span>
                  </div>
                )}
              </div>
              <section className="bg-card border border-border rounded-xl p-6 space-y-4">
                <h3 className="text-base text-foreground">details</h3>
                <form onSubmit={handleSaveDetails} className="space-y-4">
                  <Input
                    label="Title"
                    id="edit-title"
                    value={editTitle}
                    onChange={(value) => setEditTitle(value as string)}
                    required
                    disabled={artPiece.status !== "approved"}
                    placeholder="Title of your art piece"
                  />
                  <TextArea
                    label="Description"
                    id="edit-description"
                    value={editDescription}
                    onChange={(value) => setEditDescription(value as string)}
                    disabled={artPiece.status !== "approved"}
                    placeholder="Describe your art piece (optional)"
                  />
                  {detailsError && (
                    <p className="text-sm text-destructive">{detailsError}</p>
                  )}
                  {detailsSuccess && (
                    <p className="text-sm text-green-600">
                      Details updated. You may need to refresh to see changes
                      elsewhere.
                    </p>
                  )}
                  <Button
                    type="submit"
                    label={isSavingDetails ? "Saving…" : "Save details"}
                    disabled={isSavingDetails || artPiece.status !== "approved"}
                    loading={isSavingDetails}
                  />
                </form>
              </section>
            </div>

            {/* Metadata */}
            <section className="bg-card border border-border rounded-xl p-6 space-y-4">
              <h3 className="text-base text-foreground">metadata</h3>
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
                  <dt className="text-muted-foreground">DPI</dt>
                  <dd className="font-medium text-foreground">
                    {artPiece.dpi ?? "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Aspect ratio</dt>
                  <dd className="font-medium text-foreground">
                    {artPiece.aspect_ratio ?? "—"}
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
                  <dd className="font-medium text-foreground">{statusLabel}</dd>
                </div>
              </dl>
            </section>

            {/* Product requests */}
            <section className="space-y-4">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <h5 className="font-display text-foreground">Print requests</h5>
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
                    ? "There are no print requests for this piece yet."
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
                    />
                  ))}
                </div>
              )}
            </section>
            {/* Actions */}
            <section className="bg-card border border-border rounded-xl p-6 space-y-3">
              <h3 className="text-base text-foreground">actions</h3>
              <p className="text-sm text-muted-foreground">
                Ensure there are no pending print requests for this art piece
                before deleting.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button
                  variant="destructive"
                  label="Delete Art Piece"
                  type="button"
                  onClick={() => {
                    // Check if there are any pending print requests for this art piece
                    const pendingRequests = productRequests.filter(
                      (request) => request.status === "pending",
                    );
                    if (pendingRequests.length > 0) {
                      setDeleteRestrictedDialogOpen(true);
                    } else {
                      setConfirmDeleteDialogOpen(true);
                    }
                  }}
                />
              </div>
            </section>
            {confirmDeleteDialogOpen && (
              <ConfirmDialog
                open={confirmDeleteDialogOpen}
                onOpenChange={setConfirmDeleteDialogOpen}
                title="Delete Art Piece"
                description="Are you sure you want to delete this art piece? This action cannot be undone."
                confirmVariant="destructive"
                confirmLabel="Delete"
                onConfirm={async () => {
                  //  Delete the art piece
                  deleteArtPiece({
                    artPieceId: artPiece.id,
                    thumbnailPath: artPiece.thumbnail_path ?? "",
                    originalPath: artPiece.original_path ?? "",
                    displayPath: artPiece.display_path ?? "",
                    onSuccess: () => {
                      toast.success("Art piece deleted successfully");
                      setConfirmDeleteDialogOpen(false);
                      router.replace("/dashboard");
                    },
                    onError: (error) => {
                      toast.error("Failed to delete art piece");
                    },
                  });
                }}
              />
            )}

            {deleteRestrictedDialogOpen && (
              <DeleteRestrictedDialog
                open={deleteRestrictedDialogOpen}
                onOpenChange={setDeleteRestrictedDialogOpen}
              />
            )}
          </>
        )}
      </div>
    </InternalLayout>
  );
}
