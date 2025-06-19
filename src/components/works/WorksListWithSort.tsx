"use client";

import { ArrowUpDown, Filter } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Separator } from "../ui/separator";
import type { WorkItem } from "./WorksList";
import { WorksList } from "./WorksList";

interface WorksListWithSortProps {
  works: WorkItem[];
  layout?: "grid" | "list";
  emptyMessage?: string;
  showPagination?: boolean;
  currentGenreId?: number;
  showFilters?: boolean;
}

type SortOption =
  | "newest"
  | "oldest"
  | "rating-high"
  | "rating-low"
  | "price-high"
  | "price-low";

interface FilterState {
  title: string;
  minPrice: string;
  maxPrice: string;
  minRating: string;
}

export function WorksListWithSort({
  works,
  layout = "grid",
  emptyMessage = "作品が見つかりません",
  showPagination = false,
  currentGenreId,
  showFilters = false,
}: WorksListWithSortProps) {
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [showFilterCard, setShowFilterCard] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    title: "",
    minPrice: "",
    maxPrice: "",
    minRating: "",
  });

  const sortOptions = [
    { value: "newest", label: "新着順" },
    { value: "oldest", label: "古い順" },
    { value: "rating-high", label: "評価の高い順" },
    { value: "rating-low", label: "評価の低い順" },
    { value: "price-high", label: "価格の高い順" },
    { value: "price-low", label: "価格の安い順" },
  ] as const;

  // フィルタリングとソート処理
  const filteredAndSortedWorks = useMemo(() => {
    let filtered = [...works];

    // フィルタリング
    if (filters.title) {
      const searchTerm = filters.title.toLowerCase();
      filtered = filtered.filter((work) =>
        work.title.toLowerCase().includes(searchTerm),
      );
    }

    if (filters.minPrice) {
      const minPrice = Number(filters.minPrice);
      filtered = filtered.filter((work) => work.price >= minPrice);
    }

    if (filters.maxPrice) {
      const maxPrice = Number(filters.maxPrice);
      filtered = filtered.filter((work) => work.price <= maxPrice);
    }

    if (filters.minRating) {
      const minRating = Number(filters.minRating);
      filtered = filtered.filter(
        (work) =>
          work.reviewAverageScore && work.reviewAverageScore >= minRating,
      );
    }

    // ソート
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return (
            new Date(b.releaseDate).getTime() -
            new Date(a.releaseDate).getTime()
          );
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
          return 0;
      }
    });

    return filtered;
  }, [works, filters, sortBy]);

  const handleFilterChange = useCallback(
    (field: keyof FilterState, value: string) => {
      setFilters((prev) => ({ ...prev, [field]: value }));
    },
    [],
  );

  const currentSortLabel =
    sortOptions.find((option) => option.value === sortBy)?.label || "新着順";

  return (
    <div className="space-y-6">
      {/* フィルター機能 */}
      {showFilters && (
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                検索フィルター
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFilterCard(!showFilterCard)}
              >
                {showFilterCard ? "閉じる" : "展開"}
              </Button>
            </div>
          </CardHeader>

          {showFilterCard && (
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {/* タイトル検索 */}
                <div className="space-y-2">
                  <Label htmlFor="title-filter">タイトル検索</Label>
                  <Input
                    id="title-filter"
                    placeholder="作品タイトル..."
                    value={filters.title}
                    onChange={(e) =>
                      handleFilterChange("title", e.target.value)
                    }
                  />
                </div>

                {/* 最低価格 */}
                <div className="space-y-2">
                  <Label htmlFor="min-price">最低価格（円）</Label>
                  <Input
                    id="min-price"
                    type="number"
                    placeholder="例: 500"
                    value={filters.minPrice}
                    onChange={(e) =>
                      handleFilterChange("minPrice", e.target.value)
                    }
                  />
                </div>

                {/* 最高価格 */}
                <div className="space-y-2">
                  <Label htmlFor="max-price">最高価格（円）</Label>
                  <Input
                    id="max-price"
                    type="number"
                    placeholder="例: 2000"
                    value={filters.maxPrice}
                    onChange={(e) =>
                      handleFilterChange("maxPrice", e.target.value)
                    }
                  />
                </div>

                {/* 最低評価 */}
                <div className="space-y-2">
                  <Label htmlFor="min-rating">最低評価</Label>
                  <Select
                    value={filters.minRating}
                    onValueChange={(value) =>
                      handleFilterChange("minRating", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="評価を選択" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">すべて</SelectItem>
                      <SelectItem value="4.0">4.0以上</SelectItem>
                      <SelectItem value="3.5">3.5以上</SelectItem>
                      <SelectItem value="3.0">3.0以上</SelectItem>
                      <SelectItem value="2.5">2.5以上</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* フィルタークリア */}
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setFilters({
                    title: "",
                    minPrice: "",
                    maxPrice: "",
                    minRating: "",
                  })
                }
              >
                フィルターをクリア
              </Button>
            </CardContent>
          )}
        </Card>
      )}

      {/* ソート機能と結果数 */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          {filteredAndSortedWorks.length}件の作品が見つかりました
          {works.length !== filteredAndSortedWorks.length && (
            <span className="ml-2 text-xs">（全{works.length}件中）</span>
          )}
        </p>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <ArrowUpDown className="h-4 w-4" />
              {currentSortLabel}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {sortOptions.map((option) => (
              <DropdownMenuItem
                key={option.value}
                onClick={() => setSortBy(option.value)}
                className={sortBy === option.value ? "bg-gray-100" : ""}
              >
                {option.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* 作品一覧 */}
      <WorksList
        works={filteredAndSortedWorks}
        layout={layout}
        emptyMessage={emptyMessage}
        showPagination={showPagination}
        currentGenreId={currentGenreId}
      />
    </div>
  );
}
