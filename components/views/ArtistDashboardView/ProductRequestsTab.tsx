import {
  ArtistType,
  ArtPiece,
  PRODUCT_REQUEST_STATUS_OPTIONS,
  ProductRequestRow,
  ProductRequestStatusType,
} from "@/@types";
import Button from "@/components/atoms/button/Button";
import ProductRequestCard from "@/components/molecules/product-request-card/ProductRequestCard";
import { Skeleton } from "@/components/ui/skeleton";
import supabase from "@/lib/supabase/server";
import { useMemo, useState } from "react";

type RequestFilter = "all" | ProductRequestStatusType;

export default function ProductRequestsTab({
  artist,
  artPieces,
  allProductRequests,
  isLoadingProductRequests,
  refetchProductRequests,
}: {
  artist: ArtistType;
  artPieces: ArtPiece[];
  allProductRequests: ProductRequestRow[];
  refetchProductRequests: () => void;
  isLoadingProductRequests: boolean;
}) {
  const [requestFilter, setRequestFilter] = useState<RequestFilter>("all");
  const [showAllRequests, setShowAllRequests] = useState(false);

  const pickRequestFilter = (f: RequestFilter) => {
    setRequestFilter(f);
    setShowAllRequests(false);
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
  const cancelledCount = useMemo(
    () => allProductRequests.filter((r) => r.status === "cancelled").length,
    [allProductRequests],
  );

  const totalCount = allProductRequests.length;
  const filteredTotalCount = filteredProductRequests.length;

  const displayProductRequests = showAllRequests
    ? filteredProductRequests
    : filteredProductRequests.slice(0, 6);
  const hasMoreRequests = filteredProductRequests.length > 6;

  const handleUpdateProductRequestStatus = async (
    id: string,
    status: ProductRequestStatusType,
  ) => {
    await supabase.from("product_request").update({ status }).eq("id", id);
    void refetchProductRequests();
  };

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
            <Button
              type="button"
              size="sm"
              variant={requestFilter === "cancelled" ? "primary" : "secondary"}
              label={`${PRODUCT_REQUEST_STATUS_OPTIONS.cancelled} (${cancelledCount})`}
              onClick={() => pickRequestFilter("cancelled")}
            />
          </div>
        )}
      </div>

      {isLoadingProductRequests ? (
        <div className="space-y-3">
          <Skeleton className="h-32 w-full rounded-lg" />
          <Skeleton className="h-32 w-full rounded-lg" />
        </div>
      ) : allProductRequests.length === 0 ? (
        <div className="bg-card border border-border rounded-lg p-6 text-center">
          <p className="text-muted-foreground text-sm">
            No product requests yet. Requests will appear here when someone
            requests to purchase your art.
          </p>
        </div>
      ) : filteredTotalCount === 0 ? (
        <div className="bg-card border border-border rounded-lg p-8 text-center">
          <p className="text-base text-muted-foreground">
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
        <>
          <ul className="space-y-4">
            {displayProductRequests.map((request) => {
              const piece = artPieces.find(
                (p) => p.id === request.art_piece_id,
              );
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
                <li key={request.id}>
                  <ProductRequestCard
                    request={request}
                    artPiece={artPieceForCard}
                    onChangeStatus={handleUpdateProductRequestStatus}
                    showImage
                    artist={artist as ArtistType}
                  />
                </li>
              );
            })}
          </ul>
          {hasMoreRequests && (
            <div className="flex justify-center pt-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                label={
                  showAllRequests
                    ? "Show less"
                    : `See all (${filteredProductRequests.length})`
                }
                onClick={() => setShowAllRequests((prev) => !prev)}
              />
            </div>
          )}
        </>
      )}
    </section>
  );
}
