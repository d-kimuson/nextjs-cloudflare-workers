"use client";

import { useCallback, useMemo, useState } from "react";
import { WorksFilter, type WorksFilterState } from "./WorksFilter";
import { WorksList } from "./WorksList";
import type { WorkItem } from "./WorksList";

interface WorksListWithFilterProps {
  works: WorkItem[];
  layout?: "grid" | "list";
  emptyMessage?: string;
  showPagination?: boolean;
  currentGenreId?: number;
  initialFilters?: WorksFilterState;
  onFilterChange?: (filters: WorksFilterState) => void;
}

export function WorksListWithFilter({
  works,
  layout = "grid",
  emptyMessage = "作品が見つかりません",
  showPagination = false,
  currentGenreId,
  initialFilters = {},
  onFilterChange,
}: WorksListWithFilterProps) {
  const [filters, setFilters] = useState<WorksFilterState>(initialFilters);

  const handleFilterChange = useCallback(
    (newFilters: WorksFilterState) => {
      setFilters(newFilters);
      onFilterChange?.(newFilters);
    },
    [onFilterChange],
  );

  // フィルタリングされた作品一覧
  const filteredWorks = useMemo(() => {
    let filtered = [...works];

    // タイトル検索
    if (filters.title) {
      const searchTerm = filters.title.toLowerCase();
      filtered = filtered.filter((work) =>
        work.title.toLowerCase().includes(searchTerm),
      );
    }

    // 価格帯フィルター
    if (filters.minPrice !== undefined) {
      const minPrice = filters.minPrice;
      filtered = filtered.filter((work) => work.price >= minPrice);
    }
    if (filters.maxPrice !== undefined) {
      const maxPrice = filters.maxPrice;
      filtered = filtered.filter((work) => work.price <= maxPrice);
    }

    // 発売日フィルター
    if (filters.startDate) {
      const startDate = filters.startDate;
      filtered = filtered.filter((work) => work.releaseDate >= startDate);
    }
    if (filters.endDate) {
      const endDate = filters.endDate;
      filtered = filtered.filter((work) => work.releaseDate <= endDate);
    }

    // 評価フィルター
    if (filters.minRating !== undefined) {
      const minRating = filters.minRating;
      filtered = filtered.filter(
        (work) =>
          work.reviewAverageScore && work.reviewAverageScore >= minRating,
      );
    }

    // ソート
    const sortBy = filters.sortBy || "newest";
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "oldest":
          return (
            new Date(a.releaseDate).getTime() -
            new Date(b.releaseDate).getTime()
          );
        case "rating-high": {
          const ratingA = a.reviewAverageScore || 0;
          const ratingB = b.reviewAverageScore || 0;
          return ratingB - ratingA;
        }
        case "rating-low": {
          const ratingA2 = a.reviewAverageScore || 0;
          const ratingB2 = b.reviewAverageScore || 0;
          return ratingA2 - ratingB2;
        }
        case "price-high":
          return b.price - a.price;
        case "price-low":
          return a.price - b.price;
        default:
          return (
            new Date(b.releaseDate).getTime() -
            new Date(a.releaseDate).getTime()
          );
      }
    });

    return filtered;
  }, [works, filters]);

  return (
    <div className="space-y-6">
      {/* フィルター */}
      <WorksFilter
        onFilterChange={handleFilterChange}
        initialFilters={filters}
      />

      {/* 検索結果サマリー */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {filteredWorks.length}件の作品が見つかりました
          {works.length !== filteredWorks.length && (
            <span className="ml-2 text-xs">（全{works.length}件中）</span>
          )}
        </p>
      </div>

      {/* 作品一覧 */}
      <WorksList
        works={filteredWorks}
        layout={layout}
        emptyMessage={emptyMessage}
        showPagination={showPagination}
        currentGenreId={currentGenreId}
      />
    </div>
  );
}
