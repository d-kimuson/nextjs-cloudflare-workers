"use client";

import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import * as React from "react";
import { cn } from "../../lib/utils";
import { Button } from "./button";

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange?: (itemsPerPage: number) => void;
  showItemsPerPage?: boolean;
  showItemsInfo?: boolean;
  className?: string;
  disabled?: boolean;
}

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  showItemsPerPage = true,
  showItemsInfo = true,
  className,
  disabled = false,
}: PaginationProps) {
  const itemsPerPageOptions = [10, 20, 50, 100];

  // Calculate start and end item numbers for display
  const startItem = Math.max(0, (currentPage - 1) * itemsPerPage) + 1;
  const endItem = Math.min(totalItems, currentPage * itemsPerPage);

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | "ellipsis")[] = [];
    const maxVisiblePages = 7;

    if (totalPages <= maxVisiblePages) {
      // Show all pages if total pages is less than max visible
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (currentPage <= 4) {
        // Show pages 2-5 and ellipsis
        for (let i = 2; i <= 5; i++) {
          pages.push(i);
        }
        pages.push("ellipsis");
      } else if (currentPage >= totalPages - 3) {
        // Show ellipsis and last 4 pages
        pages.push("ellipsis");
        for (let i = totalPages - 4; i <= totalPages - 1; i++) {
          pages.push(i);
        }
      } else {
        // Show ellipsis, current page area, and ellipsis
        pages.push("ellipsis");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push("ellipsis");
      }

      // Always show last page
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {/* Items info and per page selector */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-sm text-muted-foreground">
        {showItemsInfo && (
          <div className="flex items-center gap-2">
            <span>
              {totalItems > 0 ? `${startItem}-${endItem}` : "0"} / {totalItems}
              件
            </span>
          </div>
        )}

        {showItemsPerPage && onItemsPerPageChange && (
          <div className="flex items-center gap-2">
            <span>表示件数:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
              disabled={disabled}
              className="rounded border border-input bg-background px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {itemsPerPageOptions.map((option) => (
                <option key={option} value={option}>
                  {option}件
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1">
          {/* Previous button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1 || disabled}
            className="flex items-center gap-1"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline">前へ</span>
          </Button>

          {/* Page numbers */}
          <div className="flex items-center gap-1">
            {pageNumbers.map((page) => {
              if (page === "ellipsis") {
                return (
                  <div
                    key={`ellipsis-${page}`}
                    className="flex h-8 w-8 items-center justify-center"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </div>
                );
              }

              const isCurrentPage = page === currentPage;

              return (
                <Button
                  key={page}
                  variant={isCurrentPage ? "default" : "outline"}
                  size="sm"
                  onClick={() => onPageChange(page)}
                  disabled={disabled}
                  className={cn(
                    "h-8 w-8 p-0",
                    isCurrentPage && "bg-primary text-primary-foreground",
                  )}
                >
                  {page}
                </Button>
              );
            })}
          </div>

          {/* Next button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages || disabled}
            className="flex items-center gap-1"
          >
            <span className="hidden sm:inline">次へ</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

// Re-export the calculatePaginationData function for client-side usage
export {
  calculatePaginationData,
  type PaginationData,
} from "../../lib/pagination";

// Hook for URL-based pagination state management
export function usePagination(searchParams: URLSearchParams) {
  const page = Number(searchParams.get("page")) || 1;
  const limit = Number(searchParams.get("limit")) || 20;

  const createPageUrl = React.useCallback(
    (newPage: number, newLimit?: number) => {
      const params = new URLSearchParams(searchParams);
      if (newPage > 1) {
        params.set("page", newPage.toString());
      } else {
        params.delete("page");
      }
      if (newLimit && newLimit !== 20) {
        params.set("limit", newLimit.toString());
      } else {
        params.delete("limit");
      }
      return params.toString();
    },
    [searchParams],
  );

  return {
    currentPage: page,
    itemsPerPage: limit,
    createPageUrl,
  };
}
