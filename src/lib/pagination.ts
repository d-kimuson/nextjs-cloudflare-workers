// Server-side pagination utility functions
// This file contains utilities that can be used on both server and client side

export interface PaginationData {
  totalPages: number;
  currentPage: number;
  itemsPerPage: number;
  offset: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  totalItems: number;
}

/**
 * Calculate pagination metadata
 * This function is server-side compatible and can be used in server actions
 */
export function calculatePaginationData(
  totalItems: number,
  currentPage: number,
  itemsPerPage: number,
): PaginationData {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const validCurrentPage = Math.max(1, Math.min(currentPage, totalPages));
  const offset = (validCurrentPage - 1) * itemsPerPage;
  const hasNextPage = validCurrentPage < totalPages;
  const hasPreviousPage = validCurrentPage > 1;

  return {
    totalPages,
    currentPage: validCurrentPage,
    itemsPerPage,
    offset,
    hasNextPage,
    hasPreviousPage,
    totalItems,
  };
}

/**
 * Validate pagination parameters
 */
export function validatePaginationParams(page?: number, limit?: number) {
  const validPage = Math.max(1, page || 1);
  const validLimit = Math.min(Math.max(1, limit || 20), 100); // Max 100 items per page

  return {
    page: validPage,
    limit: validLimit,
  };
}
