"use client";

import { PRINT_OPTION_LABELS, type PrintOptionType } from "@/@types";
import type { Database } from "@/supabase";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Check, Undo, X } from "lucide-react";

type ProductRequestRow = Database["public"]["Tables"]["product_request"]["Row"];
type ProductRequestStatus =
  Database["public"]["Enums"]["product_request_statuses"];

interface ProductRequestCardProps {
  request: ProductRequestRow;
  onChangeStatus: (id: string, status: ProductRequestStatus) => Promise<void>;
}

export default function ProductRequestCard({
  request,
  onChangeStatus,
}: ProductRequestCardProps) {
  const [status, setStatus] = useState<ProductRequestStatus>(request.status);
  const [isSaving, setIsSaving] = useState(false);

  const createdAt = new Date(request.created_at).toLocaleString();

  const printLabel = request.print_option
    ? PRINT_OPTION_LABELS[request.print_option as PrintOptionType]
    : null;

  const handleStatusChange = async (nextStatus: ProductRequestStatus) => {
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
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 space-y-3">
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
              onClick={() => handleStatusChange("cancelled")}
            >
              <X className="size-4" />
              Mark as cancelled
            </Button>
            <Button
              type="button"
              size="sm"
              variant="success"
              disabled={isSaving}
              onClick={() => handleStatusChange("fulfilled")}
            >
              <Check className="size-4" />
              Mark as fulfilled
            </Button>
          </>
        ) : status === "fulfilled" ? (
          <p
            className="body2 text-success-foreground"
            onClick={() => handleStatusChange("pending")}
          >
            This request has been fulfilled.
          </p>
        ) : status === "cancelled" ? (
          <p
            className="body2 text-destructive-foreground"
            onClick={() => handleStatusChange("pending")}
          >
            This request has been cancelled.
          </p>
        ) : null}
      </div>
    </div>
  );
}
