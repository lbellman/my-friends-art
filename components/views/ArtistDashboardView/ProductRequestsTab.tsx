import {
  ArtistType,
  ArtPiece,
  PRODUCT_REQUEST_STATUS_OPTIONS,
  ProductRequestRow,
  ProductRequestStatusType,
} from "@/@types";
import Button from "@/components/atoms/button/Button";
import ProductRequestCard from "@/components/molecules/product-request-card/ProductRequestCard";
import {
  PaginatedProductRequests,
  PRODUCT_REQUESTS_PAGE_SIZE,
} from "@/components/organisms/paginated-product-requests/PaginatedProductRequests";
import { DashboardArtPieceRow } from "@/components/views/ArtistDashboardView/ArtistDashboardView";
import supabase from "@/lib/supabase/server";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type RequestFilter = "all" | ProductRequestStatusType;

export default function ProductRequestsTab({
  artist,
  artPieces,
  allProductRequests,
  isLoadingProductRequests,
  refetchProductRequests,
}: {
  artist: ArtistType;
  artPieces: DashboardArtPieceRow[];
  allProductRequests: ProductRequestRow[];
  refetchProductRequests: () => void;
  isLoadingProductRequests: boolean;
}) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const rawPreqPage = searchParams.get("preqPage");
  const preqPage = Math.max(1, parseInt(rawPreqPage ?? "1", 10) || 1);

  const [requestFilter, setRequestFilter] = useState<RequestFilter>("pending");

  const pickRequestFilter = (f: RequestFilter) => {
    setRequestFilter(f);
    const params = new URLSearchParams(searchParams.toString());
    params.set("preqPage", "1");
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const filteredProductRequests = useMemo(() => {
    if (requestFilter === "all") return allProductRequests;
    return allProductRequests.filter((r) => r.status === requestFilter);
  }, [allProductRequests, requestFilter]);

  const pendingCount = useMemo(
    () => allProductRequests.filter((r) => r.status === "pending").length,
    [allProductRequests],
  );
  const fulfilledCount = useMemo(
    () => allProductRequests.filter((r) => r.status === "fulfilled").length,
    [allProductRequests],
  );

  const totalCount = allProductRequests.length;
  const filteredTotalCount = filteredProductRequests.length;

  const filteredTotalPages =
    filteredTotalCount > 0
      ? Math.max(1, Math.ceil(filteredTotalCount / PRODUCT_REQUESTS_PAGE_SIZE))
      : 0;

  const pagedProductRequests = useMemo(() => {
    const from = (preqPage - 1) * PRODUCT_REQUESTS_PAGE_SIZE;
    return filteredProductRequests.slice(
      from,
      from + PRODUCT_REQUESTS_PAGE_SIZE,
    );
  }, [filteredProductRequests, preqPage]);

  useEffect(() => {
    if (filteredTotalCount === 0 || filteredTotalPages === 0) return;
    if (preqPage > filteredTotalPages) {
      const params = new URLSearchParams(searchParams.toString());
      params.set("preqPage", String(filteredTotalPages));
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }
  }, [
    filteredTotalCount,
    filteredTotalPages,
    preqPage,
    router,
    pathname,
    searchParams,
  ]);

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h6 className="text-foreground font-display tracking-wide">
          Product Requests
        </h6>
        {!isLoadingProductRequests && allProductRequests.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              variant={requestFilter === "all" ? "primary" : "secondary"}
              label={`All (${totalCount})`}
              onClick={() => pickRequestFilter("all")}
            />
            <Button
              type="button"
              size="sm"
              variant={requestFilter === "pending" ? "primary" : "secondary"}
              label={`${PRODUCT_REQUEST_STATUS_OPTIONS.pending} (${pendingCount})`}
              onClick={() => pickRequestFilter("pending")}
            />
            <Button
              type="button"
              size="sm"
              variant={requestFilter === "fulfilled" ? "primary" : "secondary"}
              label={`${PRODUCT_REQUEST_STATUS_OPTIONS.fulfilled} (${fulfilledCount})`}
              onClick={() => pickRequestFilter("fulfilled")}
            />
          </div>
        )}
      </div>

      {allProductRequests.length === 0 && !isLoadingProductRequests ? (
        <div className="bg-card border border-border rounded-lg p-6 text-center">
          <p className="text-muted-foreground text-sm">
            No product requests yet. Requests will appear here when someone
            requests to purchase your art.
          </p>
        </div>
      ) : filteredTotalCount === 0 &&
        !isLoadingProductRequests &&
        allProductRequests.length > 0 ? (
        <div className="bg-card border border-border rounded-lg p-8 text-center">
          <p className="text-base text-muted-foreground">
            {requestFilter === "all" &&
              "No product requests match your current filters."}
            {requestFilter === "pending" &&
              "You don’t have any pending requests."}
            {requestFilter === "fulfilled" &&
              "You don’t have any fulfilled requests yet."}
            {requestFilter === "cancelled" &&
              "You don’t have any cancelled requests."}
            {requestFilter === "email-failed" &&
              "No requests with a failed email delivery."}
          </p>
          <p className="text-sm text-muted-foreground">
            Try a different status filter to see other requests.
          </p>
        </div>
      ) : (
        <PaginatedProductRequests
          items={pagedProductRequests}
          totalCount={filteredTotalCount}
          page={preqPage}
          pageSize={PRODUCT_REQUESTS_PAGE_SIZE}
          isLoading={isLoadingProductRequests}
          emptyContent={null}
          onPageChange={(next) => {
            const params = new URLSearchParams(searchParams.toString());
            params.set("preqPage", String(next));
            router.push(`${pathname}?${params.toString()}`, { scroll: false });
          }}
          renderRequest={(request) => {
            const piece = artPieces.find((p) => p.id === request.art_piece_id);
            const artPieceForCard: ArtPiece | null =
              piece && artist
                ? ({
                    ...piece,
                    artist: {
                      id: artist.id,
                      name: artist.name ?? "",
                      email_address: "",
                    },
                  } as ArtPiece)
                : null;
            if (!artPieceForCard) return null;
            return (
              <ProductRequestCard
                request={request}
                artPiece={artPieceForCard}
                onStatusChangeSuccess={() => void refetchProductRequests()}
                showImage
                artist={artist as ArtistType}
              />
            );
          }}
        />
      )}
    </section>
  );
}
