"use client";

import { ArtPiece, getPublicUrl, type ArtPieceStatusType } from "@/@types";
import Button from "@/components/atoms/button/Button";
import { Button as ShadButton } from "@/components/ui/button";
import Image from "next/image";
import NextLink from "next/link";
import { useMemo, useState } from "react";
import supabase from "@/lib/supabase/server";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import ConfirmDialog from "@/components/organisms/confirm-dialog/ConfirmDialog";
import useArtPiece from "@/app/hooks/useArtPiece";
import useEmailJS from "@/app/hooks/useEmailJS";

type AdminArtPieceCardProps = {
  artPiece: ArtPiece;
  /**
   * Query keys to invalidate after approving/rejecting/deleting.
   * Defaults to the admin page query key.
   */
  invalidateQueryKeys?: unknown[][];
};

export default function AdminArtPieceCard({
  artPiece,
  invalidateQueryKeys = [["artPieces"]],
}: AdminArtPieceCardProps) {
  const queryClient = useQueryClient();
  const { sendEmail } = useEmailJS();
  const [isUpdating, setIsUpdating] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { deleteArtPiece } = useArtPiece();

  const imagePath = artPiece.display_path ?? artPiece.thumbnail_path ?? "";
  const imageUrl = useMemo(() => {
    const url = imagePath ? getPublicUrl(imagePath) : "";
    return url;
  }, [imagePath]);

  const formattedCreatedAt = useMemo(() => {
    return artPiece.created_at
      ? new Date(artPiece.created_at).toLocaleString()
      : "—";
  }, [artPiece.created_at]);

  const currentStatus = artPiece.status ?? null;
  console.log(artPiece);

  const handleUpdateStatus = async (nextStatus: ArtPieceStatusType) => {
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from("art_piece")
        .update({ status: nextStatus })
        .eq("id", artPiece.id);

      if (error) {
        toast.error("Failed to update submission status.");
        return;
      }

      toast.success(
        nextStatus === "approved"
          ? "Submission approved."
          : "Submission rejected.",
      );

      for (const key of invalidateQueryKeys) {
        void queryClient.invalidateQueries({ queryKey: key });
      }
    } catch {
      toast.error("Something went wrong while updating the submission.");
    } finally {
      setIsUpdating(false);

      const message = (nextStatus: ArtPieceStatusType) => {
        return [
          `Your art piece with the title "${artPiece.title}" has ${nextStatus === "approved" ? "been approved" : "not been approved."}.`,
          nextStatus === "approved"
            ? `Your art piece is now live on My Friend's Art at https://myfriendsart.ca/${artPiece.id}`
            : null,
          nextStatus === "approved"
            ? "Thank you for sharing your art with our community! "
            : null,
          nextStatus === "not-approved"
            ? `Please contact Lindsey Bellman at bellmanlindsey@gmail.com for more information.`
            : null,
          "Thank you!",
        ]
          .filter(Boolean)
          .join("\n");
      };

      // Send an email to the artist to notify them of the status change
      sendEmail({
        name: "Lindsey Bellman",
        fromEmail: "bellmanlindsey@gmail.com",
        toEmail: artPiece.artist.email_address,
        subject: `My Friend's Art - Your art piece has ${nextStatus === "approved" ? "been approved" : "not been approved."}.`,
        message: message(nextStatus),
        onSuccess: () => {
          toast.success("Email sent to artist.");
        },
        onError: () => {
          toast.error("Failed to send email to artist.");
        },
        setIsSubmitting: () => {},
      });

      // Delete the art piece that has not been approved
      if (nextStatus === "not-approved") {
        void handleDelete();
      }
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    deleteArtPiece({
      artPieceId: artPiece.id,
      thumbnailPath: artPiece.thumbnail_path ?? "",
      originalPath: artPiece.original_path ?? "",
      displayPath: artPiece.display_path ?? "",
      onSuccess: () => {
        toast.success("Art piece deleted.");
        setIsDeleting(false);
        setDeleteDialogOpen(false);
      },
      onError: () => {
        toast.error("Failed to delete art piece.");
        setIsDeleting(false);
        setDeleteDialogOpen(false);
      },
    });
    for (const key of invalidateQueryKeys) {
      void queryClient.invalidateQueries({ queryKey: key });
    }
  };

  return (
    <article className="flex flex-col sm:flex-row gap-0 overflow-hidden rounded-xl bg-card text-card-foreground shadow-sm border border-border w-full">
      <div className="relative w-full sm:w-80 h-64 sm:h-auto sm:min-h-[280px] shrink-0 bg-muted">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={artPiece.title}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, 256px"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-4xl font-light text-muted-foreground/50">
              {artPiece.title?.charAt(0) ?? "—"}
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3 p-4 sm:p-8 flex-1 min-w-0">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1 min-w-0 w-full">
            <div className="flex items-center gap-2 justify-between">
              <p className="text-foreground truncate">{artPiece.title}</p>
              <p className="text-sm text-muted-foreground">
                Submitted by {artPiece.artist?.name ?? "—"}
              </p>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-3">
              {artPiece.description ?? "—"}
            </p>
          </div>
        </div>

        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 text-xs">
          <div>
            <dt className="text-muted-foreground">Medium</dt>
            <dd className="font-medium text-foreground">{artPiece.medium}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Product type</dt>
            <dd className="font-medium text-foreground">
              {artPiece.product_type ?? "—"}
            </dd>
          </div>
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
          <div className="sm:col-span-2">
            <dt className="text-muted-foreground">Created at</dt>
            <dd className="font-medium text-foreground">
              {formattedCreatedAt}
            </dd>
          </div>
        </dl>

        <div className="flex flex-wrap gap-2 mt-auto justify-end">
          <ShadButton variant="outline" size="default" asChild>
            <NextLink href={`/admin/art-piece-submissions/${artPiece.id}`}>
              View details
            </NextLink>
          </ShadButton>
          {currentStatus === "pending-approval" && (
            <Button
              variant="primary"
              size="default"
              label="Approve"
              disabled={isUpdating}
              loading={isUpdating}
              onClick={() => {
                void handleUpdateStatus("approved");
              }}
            />
          )}
          {currentStatus === "pending-approval" && (
            <Button
              variant="secondary"
              size="default"
              label="Reject"
              disabled={isUpdating}
              loading={isUpdating}
              onClick={() => {
                setRejectDialogOpen(true);
              }}
            />
          )}
          <Button
            variant="destructive"
            size="default"
            label="Delete"
            disabled={isUpdating || isDeleting}
            loading={isDeleting}
            onClick={() => setDeleteDialogOpen(true)}
          />
        </div>
        {deleteDialogOpen && (
          <ConfirmDialog
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
            title="Delete Art Piece"
            description="Are you sure you want to delete this art piece? This action cannot be undone."
            confirmVariant="destructive"
            confirmLabel="Delete"
            onConfirm={() => {
              void handleDelete();
            }}
          />
        )}
        {rejectDialogOpen && (
          <ConfirmDialog
            open={rejectDialogOpen}
            onOpenChange={setRejectDialogOpen}
            title="Reject Art Piece"
            description="Are you sure you want to reject this art piece? This action cannot be undone, and the art piece will be deleted."
            confirmVariant="destructive"
            confirmLabel="Yes, reject this art piece"
            onConfirm={() => {
              void handleUpdateStatus("not-approved");
            }}
          />
        )}
      </div>
    </article>
  );
}
