import { ART_PIECE_STATUS_OPTIONS, type ArtPieceStatusType } from "@/@types";
import { Archive, CheckCircle, Loader2 } from "lucide-react";

type BannerStatus = "pending-approval" | "sold" | "archived";

function isBannerStatus(
  status: ArtPieceStatusType | null | undefined,
): status is BannerStatus {
  return (
    status === "pending-approval" || status === "sold" || status === "archived"
  );
}

export type ArtPieceStatusBannerProps = {
  status: ArtPieceStatusType | null | undefined;
};

export default function ArtPieceStatusBanner({
  status,
}: ArtPieceStatusBannerProps) {
  if (!isBannerStatus(status)) return null;

  if (status === "pending-approval") {
    return (
      <div
        role="status"
        className="rounded-lg border border-amber-500/35 bg-amber-500/10 px-4 py-3 text-sm text-foreground dark:border-amber-500/25 dark:bg-amber-500/10"
      >
        <div className="flex items-center gap-2">
          <Loader2
            className="size-5 shrink-0 text-amber-700 dark:text-amber-400"
            aria-hidden
          />
          <p className="font-medium text-amber-800 dark:text-amber-100">
            This piece is{" "}
            {ART_PIECE_STATUS_OPTIONS["pending-approval"].toLowerCase()}.
          </p>
        </div>
        <p className="mt-1 body1 text-amber-900/90 dark:text-amber-200/90">
          It won&apos;t appear in the public gallery until it has been reviewed
          and approved.
        </p>
      </div>
    );
  }

  if (status === "sold") {
    return (
      <div
        role="status"
        className="rounded-lg border border-success/25 bg-success/10 px-4 py-3 text-sm text-green-600 dark:border-success/30 dark:bg-success/10"
      >
        <div className="flex items-center gap-2">
          <CheckCircle className="size-5 shrink-0 text-green-600" aria-hidden />
          <p className="font-medium text-green-600">
            This piece has been {ART_PIECE_STATUS_OPTIONS.sold.toLowerCase()}.
          </p>
        </div>
        <p className="mt-1 body1 text-green-600">
          It remains on your dashboard for your records but is not shown in the
          public gallery.
        </p>
      </div>
    );
  }

  return (
    <div
      role="status"
      className="rounded-lg border border-border bg-muted/80 px-4 py-3 text-sm text-foreground"
    >
      <div className="flex items-center gap-2">
        <Archive className="size-5 shrink-0" aria-hidden />
        <p className="font-medium text-foreground">
          This piece is {ART_PIECE_STATUS_OPTIONS.archived.toLowerCase()}.
        </p>
      </div>
      <p className="mt-1 body1 text-muted-foreground">
        It remains on your dashboard for your records but is not shown in the
        public gallery.
      </p>
    </div>
  );
}
