"use client";

import type { ArtPiece, ProductRequestRow } from "@/@types";
import Button from "@/components/atoms/button/Button";
import { cn } from "@/lib/utils";
import supabase from "@/lib/supabase/server";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Archive,
  ArchiveRestore,
  CheckCircle,
  RotateCcw,
  Trash,
} from "lucide-react";
import { useCallback, useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";
import useArtPiece from "@/app/hooks/useArtPiece";
import { useRouter } from "next/navigation";
import ConfirmDialog from "@/components/organisms/confirm-dialog/ConfirmDialog";
import DeleteRestrictedDialog from "@/components/organisms/delete-restricted-dialog/DeleteRestrictedDialog";

type ArtPieceActionsCardProps = {
  artPiece: ArtPiece;
};

export default function ArtPieceActionsCard({
  artPiece,
}: ArtPieceActionsCardProps) {
  const queryClient = useQueryClient();
  const { deleteArtPiece } = useArtPiece();
  const router = useRouter();
  const {
    data: productRequests = [],
    isLoading: isLoadingRequests,
    refetch: refetchProductRequests,
  } = useQuery({
    queryKey: ["product-requests", artPiece?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("product_request")
        .select(
          "id, name, from_email, message, dimensions, print_option, created_at, status, type",
        )
        .eq("art_piece_id", artPiece?.id)
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      return (data ?? []) as ProductRequestRow[];
    },
    enabled: !!artPiece?.id,
  });

  const [pendingState, setPendingState] = useState<
    "sold" | "archived" | "approved" | null
  >(null);
  const [confirmDeleteDialogOpen, setConfirmDeleteDialogOpen] = useState(false);
  const [deleteRestrictedDialogOpen, setDeleteRestrictedDialogOpen] =
    useState(false);

  const handleUpdateArtPieceState = useCallback(
    async (
      nextStatus: "sold" | "archived" | "approved",
      meta?: { unarchive?: boolean },
    ) => {
      setPendingState(nextStatus);
      try {
        const { error } = await supabase
          .from("art_piece")
          .update({ status: nextStatus })
          .eq("id", artPiece.id);
        if (error) {
          toast.error(
            nextStatus === "sold"
              ? "Could not mark as sold."
              : nextStatus === "approved"
                ? meta?.unarchive
                  ? "Could not unarchive this art piece."
                  : "Could not mark as available."
                : "Could not archive this art piece.",
          );
          return;
        }
        await queryClient.invalidateQueries({
          queryKey: ["dashboard-art-piece", artPiece.id],
        });
        toast.success(
          nextStatus === "sold"
            ? "Marked as sold."
            : nextStatus === "approved"
              ? meta?.unarchive
                ? "Art piece unarchived."
                : "Marked as available."
              : "Art piece archived.",
        );
      } catch {
        toast.error("Something went wrong.");
      } finally {
        setPendingState(null);
      }
    },
    [artPiece.id, queryClient],
  );

  const actions = useMemo(() => {
    const rows: {
      description: string;
      button: ReactNode;
      tone?: "destructive";
    }[] = [];

    if (
      artPiece.product_type === "original" &&
      artPiece.status === "approved"
    ) {
      rows.push({
        description:
          "When the original has been purchased, mark it as sold so buyers know it is no longer available.",
        button: (
          <Button
            label="Mark as Sold"
            variant="success"
            loading={pendingState === "sold"}
            disabled={pendingState !== null && pendingState !== "sold"}
            onClick={() => void handleUpdateArtPieceState("sold")}
            icon={<CheckCircle className="size-4 text-success-foreground" />}
          />
        ),
      });
    }

    if (artPiece.product_type === "original" && artPiece.status === "sold") {
      rows.push({
        description:
          "If the sale did not complete or you want to list the original for sale again, mark it as available.",
        button: (
          <Button
            label="Mark as Available"
            variant="secondary"
            loading={pendingState === "approved"}
            disabled={pendingState !== null && pendingState !== "approved"}
            onClick={() => void handleUpdateArtPieceState("approved")}
            icon={<RotateCcw className="size-4 text-success-foreground" />}
          />
        ),
      });
    }

    const canArchive =
      artPiece.status !== "archived" && artPiece.status !== "sold" && artPiece.status !== "pending-approval";

    if (canArchive) {
      rows.push({
        description:
          "Hide this piece from your public profile without deleting it. You can unarchive it later.",
        button: (
          <Button
            label="Archive Art Piece"
            variant="secondary"
            loading={pendingState === "archived"}
            disabled={pendingState !== null && pendingState !== "archived"}
            onClick={() => void handleUpdateArtPieceState("archived")}
            icon={<Archive className="size-4 text-secondary-foreground" />}
          />
        ),
      });
    }

    if (artPiece.status === "archived") {
      rows.push({
        description:
          "Restore this piece to your public profile. If it was approved before archiving, it will be visible to buyers again.",
        button: (
          <Button
            label="Unarchive Art Piece"
            variant="secondary"
            loading={pendingState === "approved"}
            disabled={pendingState !== null && pendingState !== "approved"}
            onClick={() =>
              void handleUpdateArtPieceState("approved", { unarchive: true })
            }
            icon={
              <ArchiveRestore className="size-4 text-secondary-foreground" />
            }
          />
        ),
      });
    }

    rows.push({
      tone: "destructive",
      description:
        "Permanently remove this art piece and its images. All fulfilled and cancelled product requests will be deleted. This action is restricted if there are any pending product requests.",
      button: (
        <Button
          label="Delete Art Piece"
          variant="destructive"
          icon={<Trash className="size-4 text-white" />}
          disabled={pendingState !== null}
          onClick={() => {
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
      ),
    });

    return rows;
  }, [
    artPiece.product_type,
    artPiece.status,
    pendingState,
    handleUpdateArtPieceState,
  ]);

  return (
    <>
      <section className="space-y-4">
        <h5 className="text-foreground font-display">actions</h5>
        <div className="overflow-x-auto rounded-lg shadow-sm border">
          <table className="w-full text-sm ">
            <thead>
              <tr className="bg-muted/50">
                <th
                  scope="col"
                  className=" px-4 py-3 text-left font-medium text-foreground"
                >
                  Description
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-right border-l font-medium text-foreground w-[1%] whitespace-nowrap"
                >
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-card">
              {actions.map((action, index) => (
                <tr
                  key={index}
                  className={cn(
                    action.tone === "destructive" && "bg-destructive/10 ",
                  )}
                >
                  <td
                    className={cn(
                      "border-b border-t px-4 py-3 align-middle",
                      action.tone === "destructive"
                        ? "text-destructive-foreground "
                        : "text-muted-foreground",
                    )}
                  >
                    {action.description}
                  </td>
                  <td className="border-b border-t border-l px-4 py-3 align-middle text-right">
                    <span className="inline-flex justify-end">
                      {action.button}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      {confirmDeleteDialogOpen && (
        <ConfirmDialog
          open={confirmDeleteDialogOpen}
          onOpenChange={setConfirmDeleteDialogOpen}
          title="Delete Art Piece"
          description="Are you sure you want to delete this art piece? This will permanently remove the art piece and all associated images and product requests. This action cannot be undone."
          confirmVariant="destructive"
          confirmLabel="Yes, delete this art piece"
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
  );
}
