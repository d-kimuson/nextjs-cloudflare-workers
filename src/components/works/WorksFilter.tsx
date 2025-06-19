"use client";

import { Filter, Search, X } from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
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

export interface WorksFilterState {
  title?: string;
  minPrice?: number;
  maxPrice?: number;
  startDate?: string;
  endDate?: string;
  minRating?: number;
  sortBy?:
    | "newest"
    | "oldest"
    | "rating-high"
    | "rating-low"
    | "price-high"
    | "price-low";
}

interface WorksFilterProps {
  onFilterChange: (filters: WorksFilterState) => void;
  initialFilters?: WorksFilterState;
  className?: string;
}

export function WorksFilter({
  onFilterChange,
  initialFilters = {},
  className,
}: WorksFilterProps) {
  const [filters, setFilters] = useState<WorksFilterState>(initialFilters);
  const [isExpanded, setIsExpanded] = useState(false);

  const priceRanges: Array<{
    label: string;
    min: number | undefined;
    max: number | undefined;
  }> = [
    { label: "すべて", min: undefined, max: undefined },
    { label: "500円以下", min: undefined, max: 500 },
    { label: "500円〜1,000円", min: 500, max: 1000 },
    { label: "1,000円〜2,000円", min: 1000, max: 2000 },
    { label: "2,000円以上", min: 2000, max: undefined },
  ];

  const dateRanges: Array<{
    label: string;
    start: string | undefined;
    end: string | undefined;
  }> = [
    { label: "すべて", start: undefined, end: undefined },
    { label: "1週間以内", start: getDateString(-7), end: undefined },
    { label: "1ヶ月以内", start: getDateString(-30), end: undefined },
    { label: "3ヶ月以内", start: getDateString(-90), end: undefined },
    { label: "6ヶ月以内", start: getDateString(-180), end: undefined },
  ];

  const ratingOptions: Array<{ label: string; value: number | undefined }> = [
    { label: "すべて", value: undefined },
    { label: "4.0以上", value: 4.0 },
    { label: "3.5以上", value: 3.5 },
    { label: "3.0以上", value: 3.0 },
    { label: "2.5以上", value: 2.5 },
  ];

  const sortOptions = [
    { value: "newest", label: "新着順" },
    { value: "oldest", label: "古い順" },
    { value: "rating-high", label: "評価の高い順" },
    { value: "rating-low", label: "評価の低い順" },
    { value: "price-high", label: "価格の高い順" },
    { value: "price-low", label: "価格の安い順" },
  ] as const;

  function getDateString(daysAgo: number): string {
    const date = new Date();
    date.setDate(date.getDate() + daysAgo);
    return date.toISOString().split("T")[0] as string;
  }

  const handleFilterChange = (newFilters: Partial<WorksFilterState>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    onFilterChange(updatedFilters);
  };

  const handlePriceRangeChange = (value: string) => {
    const range = priceRanges.find((r) => r.label === value);
    if (range) {
      handleFilterChange({
        minPrice: range.min,
        maxPrice: range.max,
      });
    }
  };

  const handleDateRangeChange = (value: string) => {
    const range = dateRanges.find((r) => r.label === value);
    if (range) {
      handleFilterChange({
        startDate: range.start,
        endDate: range.end,
      });
    }
  };

  const handleRatingChange = (value: string) => {
    const rating = ratingOptions.find((r) => r.label === value);
    if (rating) {
      handleFilterChange({ minRating: rating.value });
    }
  };

  const clearFilters = () => {
    const clearedFilters = { sortBy: filters.sortBy || "newest" };
    setFilters(clearedFilters);
    onFilterChange(clearedFilters);
  };

  const hasActiveFilters = () => {
    return !!(
      filters.title ||
      filters.minPrice !== undefined ||
      filters.maxPrice !== undefined ||
      filters.startDate ||
      filters.endDate ||
      filters.minRating !== undefined
    );
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            検索・フィルター
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? "閉じる" : "展開"}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* タイトル検索 */}
        <div className="space-y-2">
          <Label htmlFor="title-search">タイトル検索</Label>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="title-search"
              placeholder="作品タイトルで検索..."
              value={filters.title || ""}
              onChange={(e) => handleFilterChange({ title: e.target.value })}
              className="pl-10"
            />
          </div>
        </div>

        {/* ソート */}
        <div className="space-y-2">
          <Label>並び順</Label>
          <Select
            value={filters.sortBy || "newest"}
            onValueChange={(value) =>
              handleFilterChange({
                sortBy: value as WorksFilterState["sortBy"],
              })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="並び順を選択" />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {isExpanded && (
          <>
            <Separator />

            {/* 価格帯 */}
            <div className="space-y-2">
              <Label>価格帯</Label>
              <Select
                value={
                  priceRanges.find(
                    (r) =>
                      r.min === filters.minPrice && r.max === filters.maxPrice,
                  )?.label || "すべて"
                }
                onValueChange={handlePriceRangeChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="価格帯を選択" />
                </SelectTrigger>
                <SelectContent>
                  {priceRanges.map((range) => (
                    <SelectItem key={range.label} value={range.label}>
                      {range.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 発売日 */}
            <div className="space-y-2">
              <Label>発売日</Label>
              <Select
                value={
                  dateRanges.find(
                    (r) =>
                      r.start === filters.startDate &&
                      r.end === filters.endDate,
                  )?.label || "すべて"
                }
                onValueChange={handleDateRangeChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="発売日を選択" />
                </SelectTrigger>
                <SelectContent>
                  {dateRanges.map((range) => (
                    <SelectItem key={range.label} value={range.label}>
                      {range.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 評価 */}
            <div className="space-y-2">
              <Label>評価</Label>
              <Select
                value={
                  ratingOptions.find((r) => r.value === filters.minRating)
                    ?.label || "すべて"
                }
                onValueChange={handleRatingChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="評価を選択" />
                </SelectTrigger>
                <SelectContent>
                  {ratingOptions.map((option) => (
                    <SelectItem key={option.label} value={option.label}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* フィルタークリア */}
            {hasActiveFilters() && (
              <div className="pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearFilters}
                  className="flex items-center gap-2"
                >
                  <X className="h-4 w-4" />
                  フィルターをクリア
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
