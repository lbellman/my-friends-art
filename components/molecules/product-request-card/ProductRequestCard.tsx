"use client";

import {
  ArtPiece,
  getPublicUrl,
  PRINT_OPTION_LABELS,
  ProductRequestRow,
  ProductRequestStatusType,
  type PrintOptionType,
} from "@/@types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Check, Undo, X } from "lucide-react";
import Image from "next/image";
import ConfirmDialog from "@/components/organisms/confirm-dialog/ConfirmDialog";
import useEmailJS from "@/app/hooks/useEmailJS";
import { toast } from "sonner";

interface ProductRequestCardProps {
  request: ProductRequestRow;
  artPiece: ArtPiece;
  onChangeStatus: (
    id: string,
    status: ProductRequestStatusType,
  ) => Promise<void>;
  showImage?: boolean;
}

export default function ProductRequestCard({
  request,
  onChangeStatus,
  artPiece,
  showImage = false,
}: ProductRequestCardProps) {
  const { sendEmail } = useEmailJS();
  const [status, setStatus] = useState<ProductRequestStatusType>(
    request.status,
  );
  const [isSaving, setIsSaving] = useState(false);

  const [confirmFulfillDialogOpen, setConfirmFulfillDialogOpen] =
    useState(false);
  const [confirmCancelDialogOpen, setConfirmCancelDialogOpen] = useState(false);

  const createdAt = new Date(request.created_at).toLocaleString();

  const printLabel = request.print_option
    ? PRINT_OPTION_LABELS[request.print_option as PrintOptionType]
    : null;

  const statusUpdateMessage = (nextStatus: ProductRequestStatusType) => {
    const message = [
      `Your print request for ${artPiece.title} has been ${nextStatus}.`,
      nextStatus === "fulfilled" ? "Enjoy your new art piece!" : null,
      nextStatus === "cancelled"
        ? "If you think there has been an error, please contact the artist directly, or bellmanlindsey@gmail.com for support."
        : null,
      ,
      "Thank you!",
    ]
      .filter(Boolean)
      .join("\n");

    return message;
  };

  const handleStatusChange = async (nextStatus: ProductRequestStatusType) => {
    if (nextStatus === status) return;

    setStatus(nextStatus);
    setIsSaving(true);
    try {
      await onChangeStatus(request.id, nextStatus);
    } catch {
      // Revert on error
      setStatus(request.status);
    } finally {
      setIsSaving(false);

      // Send an email to the customer to notify them of the status change
      sendEmail({
        name: "My Friend's Art",
        fromEmail: "bellmanlindsey@gmail.com",
        toEmail: request.from_email,
        subject: `My Friend's Art - Print Request Status Update for ${artPiece.title}`,
        message: statusUpdateMessage(nextStatus),
        onSuccess: () => {
          toast.success("Status has been updated.", {
            description:
              "An email has been sent to your customer to notify them of the status change.",
          });
        },
        onError: () => {},
        setIsSubmitting: () => {},
      });
    }
  };

  const imagePath = artPiece.display_path ?? artPiece.thumbnail_path ?? null;
  const imageUrl = imagePath ? getPublicUrl(imagePath) : null;

  const content = (
    <>
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        {artPiece.title}
      </p>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <p className="font-medium text-foreground">
            {request.name}{" "}
            <span className="text-xs text-muted-foreground">
              ({request.from_email})
            </span>
          </p>
          <p className="text-xs text-muted-foreground">
            Requested on: {createdAt}
          </p>
        </div>
        <div className="flex flex-col items-start sm:items-end gap-1">
          <span className="text-xs text-muted-foreground">Current status</span>
          <span className="text-xs font-medium text-foreground capitalize">
            {status.replace("-", " ")}
          </span>
        </div>
      </div>

      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
        <div>
          <dt className=" uppercase-overline">Dimensions</dt>
          <dd className="font-medium">
            {request.dimensions ? `${request.dimensions}"` : "—"}
          </dd>
        </div>
        <div>
          <dt className="uppercase-overline">Print option</dt>
          <dd className="font-medium">{printLabel ?? "—"}</dd>
        </div>
      </dl>

      {request.message && (
        <div className="">
          <p className="uppercase-overline">Message</p>
          <p className={cn("text-sm text-foreground whitespace-pre-line")}>
            {request.message ?? "—"}
          </p>
        </div>
      )}

      <div className="pt-3 border-t border-border/60 flex flex-wrap gap-2 justify-end">
        {status === "pending" ? (
          <>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={isSaving}
              onClick={() => setConfirmCancelDialogOpen(true)}
            >
              <X className="size-4" />
              Mark as cancelled
            </Button>
            <Button
              type="button"
              size="sm"
              variant="success"
              disabled={isSaving}
              onClick={() => setConfirmFulfillDialogOpen(true)}
            >
              <Check className="size-4" />
              Mark as fulfilled
            </Button>
          </>
        ) : status === "fulfilled" ? (
          <p className="body2 text-success-foreground">
            This request has been fulfilled.
          </p>
        ) : status === "cancelled" ? (
          <p className="body2 text-destructive-foreground">
            This request has been cancelled.
          </p>
        ) : null}
      </div>
    </>
  );

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden shadow-sm">
      {showImage && imageUrl ? (
        <div className="flex flex-col sm:flex-row gap-0 w-full">
          <div className="relative w-full sm:w-48 h-48 sm:h-auto sm:min-h-[200px] shrink-0 bg-muted">
            <Image
              src={imageUrl}
              alt={artPiece.title}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, 192px"
            />
          </div>
          <div className="flex-1 min-w-0 p-6 space-y-3">{content}</div>
        </div>
      ) : (
        <div className="p-6 space-y-3">{content}</div>
      )}
      {confirmFulfillDialogOpen && (
        <ConfirmDialog
          open={confirmFulfillDialogOpen}
          onOpenChange={setConfirmFulfillDialogOpen}
          title="Fulfill Print Request"
          description="Marking this request as fulfilled means you have submitted an order with a print shop and the customer has received their print. The customer will receive an email notifying them of this change."
          confirmVariant="success"
          confirmLabel="Yes, this request has been fulfilled"
          onConfirm={() => handleStatusChange("fulfilled")}
        />
      )}
      {confirmCancelDialogOpen && (
        <ConfirmDialog
          open={confirmCancelDialogOpen}
          onOpenChange={setConfirmCancelDialogOpen}
          title="Cancel Print Request"
          description="Cancelling this request means you will not be fulfilling it now or in the future. The customer will receive an email notifying them of this change."
          confirmVariant="destructive"
          confirmLabel="Yes, cancel this request"
          onConfirm={() => handleStatusChange("cancelled")}
        />
      )}
    </div>
  );
}
