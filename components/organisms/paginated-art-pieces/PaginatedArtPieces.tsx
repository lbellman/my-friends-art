import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export const ART_PIECES_PAGE_SIZE = 15;

export { artListReturnStorageKey } from "@/lib/art-list-restore";

const MAX_PAGE_LINKS = 3;

/** Sliding window of up to 3 consecutive pages; ellipses when more pages exist outside. */
function getPagePaginationItems(totalPages: number, currentPage: number) {
  if (totalPages <= MAX_PAGE_LINKS) {
    return {
      showLeftEllipsis: false,
      showRightEllipsis: false,
      pages: Array.from({ length: totalPages }, (_, i) => i + 1),
    };
  }

  const start = Math.min(
    Math.max(currentPage - 1, 1),
    totalPages - (MAX_PAGE_LINKS - 1),
  );
  const pages = [start, start + 1, start + 2];
  return {
    showLeftEllipsis: start > 1,
    showRightEllipsis: start + MAX_PAGE_LINKS - 1 < totalPages,
    pages,
  };
}

export interface PaginatedArtPiecesProps<T extends { id: string }> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize?: number;
  isLoading: boolean;
  emptyContent: React.ReactNode;
  onPageChange: (page: number) => void;
  renderArtPiece: (piece: T) => ReactNode;
  className?: string;
  gridClassName?: string;
}

export function PaginatedArtPieces<T extends { id: string }>({
  items,
  totalCount,
  page,
  pageSize = ART_PIECES_PAGE_SIZE,
  isLoading,
  emptyContent,
  onPageChange,
  renderArtPiece,
  className,
  gridClassName,
}: PaginatedArtPiecesProps<T>) {
  const totalPages =
    totalCount > 0 ? Math.max(1, Math.ceil(totalCount / pageSize)) : 0;

  const pageNav =
    totalPages > 1
      ? getPagePaginationItems(totalPages, Math.min(page, totalPages))
      : null;

  if (isLoading) {
    return (
      <div className={cn("flex flex-col gap-6", className)}>
        <ul
          className={cn(
            "list-none p-0 m-0 grid grid-cols-3 md:grid-cols-4 gap-4 md:gap-8",
            gridClassName,
          )}
        >
          {Array.from({ length: pageSize }).map((_, index) => (
            <li key={index} className="min-w-0 w-full">
              <Skeleton className="w-full aspect-3/4 rounded-xl" />
            </li>
          ))}
        </ul>
      </div>
    );
  }

  if (totalCount === 0) {
    return <div className={className}>{emptyContent}</div>;
  }

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      <ul
        className={cn(
          "list-none p-0 m-0 grid grid-cols-3 md:grid-cols-4 gap-4 md:gap-8",
          gridClassName,
        )}
      >
        {items.map((piece) => (
          <li key={piece.id} className="min-w-0 w-full">
            {renderArtPiece(piece)}
          </li>
        ))}
      </ul>

      {pageNav && (
        <Pagination>
          <PaginationContent className="flex-wrap gap-1 sm:gap-2">
            <PaginationItem>
              <PaginationPrevious
                href="#"
                className={cn(page <= 1 && "pointer-events-none opacity-50")}
                aria-disabled={page <= 1}
                onClick={(e) => {
                  e.preventDefault();
                  if (page > 1) onPageChange(page - 1);
                }}
              />
            </PaginationItem>
            {pageNav.showLeftEllipsis && (
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
            )}
            {pageNav.pages.map((pageNum) => (
              <PaginationItem key={pageNum}>
                <PaginationLink
                  href="#"
                  size="icon"
                  isActive={pageNum === Math.min(page, totalPages)}
                  className={cn(
                    pageNum >= 10 && "min-w-10 px-1",
                    pageNum >= 100 && "min-w-11",
                  )}
                  aria-label={`Page ${pageNum}`}
                  onClick={(e) => {
                    e.preventDefault();
                    onPageChange(pageNum);
                  }}
                >
                  {pageNum}
                </PaginationLink>
              </PaginationItem>
            ))}
            {pageNav.showRightEllipsis && (
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
            )}
            <PaginationItem>
              <PaginationNext
                href="#"
                className={cn(
                  page >= totalPages && "pointer-events-none opacity-50",
                )}
                aria-disabled={page >= totalPages}
                onClick={(e) => {
                  e.preventDefault();
                  if (page < totalPages) onPageChange(page + 1);
                }}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}
