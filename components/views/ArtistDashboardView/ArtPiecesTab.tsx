import { useEffect, useMemo } from "react";

import { ArtPiece } from "@/@types";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import {
  ART_PIECES_PAGE_SIZE,
  PaginatedArtPieces,
} from "@/components/organisms/paginated-art-pieces/PaginatedArtPieces";
import Button from "@/components/atoms/button/Button";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { Plus } from "lucide-react";
import DashboardArtCard from "@/components/molecules/dashboard-art-card/DashboardArtCard";
import { DashboardArtPieceRow } from "@/components/views/ArtistDashboardView/ArtistDashboardView";

export default function ArtPiecesTab({
  artPieces,
  isLoading,
}: {
  artPieces: DashboardArtPieceRow[];
  isLoading: boolean;
}) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const rawPage = searchParams.get("page");
  const page = Math.max(1, parseInt(rawPage ?? "1", 10) || 1);

  type ArtFilter = "all" | "approved" | "pending-approval" | "not-approved";
  const [artFilter, setArtFilter] = useState<ArtFilter>("all");

  const pickArtFilter = (f: ArtFilter) => {
    setArtFilter(f);
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", "1");
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };
  const filteredArtPieces = useMemo(
    () =>
      artPieces.filter((p) => {
        if (artFilter === "all") return true;
        return p.status === artFilter;
      }),
    [artPieces, artFilter],
  );

  const approvedCount = useMemo(
    () => artPieces.filter((p) => p.status === "approved").length,
    [artPieces],
  );
  const pendingCount = useMemo(
    () => artPieces.filter((p) => p.status === "pending-approval").length,
    [artPieces],
  );

  const totalCount = useMemo(() => artPieces.length, [artPieces]);

  const filteredTotalCount = filteredArtPieces.length;
  const filteredTotalPages =
    filteredTotalCount > 0
      ? Math.max(1, Math.ceil(filteredTotalCount / ART_PIECES_PAGE_SIZE))
      : 0;

  const pagedDashboardPieces = useMemo(() => {
    const from = (page - 1) * ART_PIECES_PAGE_SIZE;
    return filteredArtPieces.slice(from, from + ART_PIECES_PAGE_SIZE);
  }, [filteredArtPieces, page]);

  useEffect(() => {
    if (filteredTotalCount === 0 || filteredTotalPages === 0) return;
    if (page > filteredTotalPages) {
      const params = new URLSearchParams(searchParams.toString());
      params.set("page", String(filteredTotalPages));
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }
  }, [
    filteredTotalCount,
    filteredTotalPages,
    page,
    router,
    pathname,
    searchParams,
  ]);
  return (
    <section className="space-y-6 ">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h6 className="text-foreground font-display tracking-wide">
          Your art pieces
        </h6>
        {!isLoading && artPieces.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              variant={artFilter === "all" ? "primary" : "secondary"}
              label={`All (${totalCount})`}
              onClick={() => pickArtFilter("all")}
            />
            <Button
              type="button"
              size="sm"
              variant={artFilter === "approved" ? "primary" : "secondary"}
              label={`Approved (${approvedCount})`}
              onClick={() => pickArtFilter("approved")}
            />
            <Button
              type="button"
              size="sm"
              variant={
                artFilter === "pending-approval" ? "primary" : "secondary"
              }
              label={`Pending Approval (${pendingCount})`}
              onClick={() => pickArtFilter("pending-approval")}
            />
          </div>
        )}
      </div>

      {isLoading ? (
        <ul className="grid grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <li key={i} className="rounded-xl overflow-hidden">
              <Skeleton className="aspect-3/4 w-full rounded-none" />
              <div className="p-3 space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-24 rounded-full" />
              </div>
            </li>
          ))}
        </ul>
      ) : artPieces.length === 0 ? (
        <div className="bg-card border border-border rounded-lg p-8 text-center">
          <p className="text-muted-foreground mb-4">
            You haven’t submitted any pieces yet.
          </p>
          <Link href="/submit-art-piece">
            <Button
              icon={<Plus className="size-4" />}
              label="Submit your first piece"
            />
          </Link>
        </div>
      ) : filteredArtPieces.length === 0 ? (
        <div className="bg-card border border-border rounded-lg p-8 text-center">
          <p className="text-muted-foreground body1">
            {artFilter === "all" && "No art pieces match your current filters."}
            {artFilter === "approved" &&
              "You don’t have any approved pieces yet."}
            {artFilter === "pending-approval" &&
              "You don’t have any pieces pending approval right now."}
            {artFilter === "not-approved" &&
              "You don’t have any not approved pieces right now."}
          </p>
          <p className="body2 text-muted-foreground">
            Try selecting a different filter or submit a new piece.
          </p>
        </div>
      ) : (
        <PaginatedArtPieces
          items={pagedDashboardPieces}
          totalCount={filteredTotalCount}
          page={page}
          pageSize={ART_PIECES_PAGE_SIZE}
          isLoading={false}
          emptyContent={null}
          onPageChange={(next) => {
            const params = new URLSearchParams(searchParams.toString());
            params.set("page", String(next));
            router.push(`${pathname}?${params.toString()}`, { scroll: false });
          }}
          renderArtPiece={(piece) => (
            <DashboardArtCard
              artPiece={piece as DashboardArtPieceRow}
              listRestore={{
                namespace: "dashboard",
                page,
                tab: "art-pieces",
              }}
            />
          )}
          gridClassName="grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 w-full"
        />
      )}
    </section>
  );
}
