"use client";

import { ArrowUpDown, Calendar, Star } from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import type { WorkItem } from "./WorksList";
import { WorksList } from "./WorksList";

interface SortableWorksListProps {
  works: WorkItem[];
  layout?: "grid" | "list";
  emptyMessage?: string;
}

type SortOption =
  | "latest"
  | "oldest"
  | "rating-high"
  | "rating-low"
  | "price-high"
  | "price-low";

const sortOptions: Array<{
  value: SortOption;
  label: string;
  icon?: React.ReactNode;
}> = [
  {
    value: "latest",
    label: "発売日が新しい順",
    icon: <Calendar className="w-4 h-4" />,
  },
  {
    value: "oldest",
    label: "発売日が古い順",
    icon: <Calendar className="w-4 h-4" />,
  },
  {
    value: "rating-high",
    label: "評価が高い順",
    icon: <Star className="w-4 h-4" />,
  },
  {
    value: "rating-low",
    label: "評価が低い順",
    icon: <Star className="w-4 h-4" />,
  },
  { value: "price-high", label: "価格が高い順" },
  { value: "price-low", label: "価格が安い順" },
];

export function SortableWorksList({
  works,
  layout = "grid",
  emptyMessage,
}: SortableWorksListProps) {
  const [sortBy, setSortBy] = useState<SortOption>("latest");

  const sortedWorks = [...works].sort((a, b) => {
    switch (sortBy) {
      case "latest":
        return (
          new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime()
        );
      case "oldest":
        return (
          new Date(a.releaseDate).getTime() - new Date(b.releaseDate).getTime()
        );
      case "rating-high":
        return (b.reviewAverageScore || 0) - (a.reviewAverageScore || 0);
      case "rating-low":
        return (a.reviewAverageScore || 0) - (b.reviewAverageScore || 0);
      case "price-high":
        return b.price - a.price;
      case "price-low":
        return a.price - b.price;
      default:
        return 0;
    }
  });

  const currentSortOption = sortOptions.find(
    (option) => option.value === sortBy,
  );

  return (
    <div className="space-y-6">
      {/* ソート機能 */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{works.length}件の作品</p>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <ArrowUpDown className="w-4 h-4" />
              {currentSortOption?.icon}
              {currentSortOption?.label || "並び替え"}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {sortOptions.map((option) => (
              <DropdownMenuItem
                key={option.value}
                onClick={() => setSortBy(option.value)}
                className="gap-2"
              >
                {option.icon}
                {option.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* 作品一覧 */}
      <WorksList
        works={sortedWorks}
        layout={layout}
        emptyMessage={emptyMessage}
      />
    </div>
  );
}
