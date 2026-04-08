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

export const PRODUCT_REQUESTS_PAGE_SIZE = 6;

const MAX_PAGE_LINKS = 3;

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

export interface PaginatedProductRequestsProps<T extends { id: string }> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize?: number;
  isLoading: boolean;
  emptyContent: React.ReactNode;
  onPageChange: (page: number) => void;
  /** Return `null` to skip rendering a row (e.g. missing related data). */
  renderRequest: (request: T) => ReactNode;
  className?: string;
  listClassName?: string;
}

export function PaginatedProductRequests<T extends { id: string }>({
  items,
  totalCount,
  page,
  pageSize = PRODUCT_REQUESTS_PAGE_SIZE,
  isLoading,
  emptyContent,
  onPageChange,
  renderRequest,
  className,
  listClassName,
}: PaginatedProductRequestsProps<T>) {
  const totalPages =
    totalCount > 0 ? Math.max(1, Math.ceil(totalCount / pageSize)) : 0;

  const pageNav =
    totalPages > 1
      ? getPagePaginationItems(totalPages, Math.min(page, totalPages))
      : null;

  if (isLoading) {
    return (
      <div className={cn("flex flex-col gap-4", className)}>
        <div className="space-y-3">
          {Array.from({ length: Math.min(pageSize, 3) }).map((_, index) => (
            <Skeleton key={index} className="h-32 w-full rounded-lg" />
          ))}
        </div>
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
          "list-none space-y-4 p-0 m-0",
          listClassName,
        )}
      >
        {items.map((request) => {
          const node = renderRequest(request);
          if (node == null) return null;
          return (
            <li key={request.id} className="min-w-0">
              {node}
            </li>
          );
        })}
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
