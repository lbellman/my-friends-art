"use client";

import {
  ART_PIECE_STATUS_OPTIONS,
  type ArtPieceStatusType,
} from "@/@types";
import { cn } from "@/lib/utils";
import { Archive, Check, CheckCircle, Circle, X } from "lucide-react";

export type ArtPieceStatusChipProps = {
  status: ArtPieceStatusType | null | undefined;
  className?: string;
  /** chip: pill + icon (default). plain: text label only. */
  variant?: "chip" | "plain";
};

function chipClasses(status: ArtPieceStatusType): string {
  switch (status) {
    case "approved":
      return "bg-success/30 text-success-foreground";
    case "pending-approval":
      return "bg-muted/80 text-muted-foreground";
    case "not-approved":
      return "bg-destructive/30 text-destructive-foreground";
    case "sold":
      return "bg-success/35 text-success-foreground";
    case "archived":
      return "bg-muted/80 text-muted-foreground";
    default: {
      const _exhaustive: never = status;
      return _exhaustive;
    }
  }
}

function StatusIcon({ status }: { status: ArtPieceStatusType }) {
  const iconClass = "size-3 shrink-0";
  switch (status) {
    case "approved":
      return <Check className={iconClass} />;
    case "pending-approval":
      return <Circle className={iconClass} />;
    case "not-approved":
      return <X className={iconClass} />;
    case "sold":
      return <CheckCircle className={iconClass} />;
    case "archived":
      return <Archive className={iconClass} />;
    default: {
      const _exhaustive: never = status;
      return _exhaustive;
    }
  }
}

export default function ArtPieceStatusChip({
  status,
  className,
  variant = "chip",
}: ArtPieceStatusChipProps) {
  const label = status
    ? (ART_PIECE_STATUS_OPTIONS[status] ?? String(status))
    : "—";

  if (variant === "plain") {
    return (
      <span className={cn("font-medium text-foreground", className)}>
        {label}
      </span>
    );
  }

  if (!status) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs bg-muted/50 text-muted-foreground",
          className,
        )}
      >
        —
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs",
        chipClasses(status),
        className,
      )}
    >
      <StatusIcon status={status} />
      {label}
    </span>
  );
}
