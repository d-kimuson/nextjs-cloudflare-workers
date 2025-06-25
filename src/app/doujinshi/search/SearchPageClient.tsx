"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import type { WorksFilterState } from "@/components/works/WorksFilter";
import type { WorkItem } from "@/components/works/WorksList";
import { WorksListWithFilter } from "@/components/works/WorksListWithFilter";
import { AlertCircle } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { honoClient } from "../../../lib/api/client";

interface SearchPageClientProps {
  initialParams: {
    title?: string;
    minPrice?: string;
    maxPrice?: string;
    startDate?: string;
    endDate?: string;
    minRating?: string;
    sortBy?:
      | "newest"
      | "oldest"
      | "rating-high"
      | "rating-low"
      | "price-high"
      | "price-low";
    page?: string;
  };
}

export default function SearchPageClient({
  initialParams,
}: SearchPageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [works, setWorks] = useState<WorkItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  // URLパラメータからフィルター状態を構築
  const getFiltersFromParams = useCallback(
    (params: typeof initialParams): WorksFilterState => {
      return {
        title: params.title,
        minPrice: params.minPrice ? Number(params.minPrice) : undefined,
        maxPrice: params.maxPrice ? Number(params.maxPrice) : undefined,
        startDate: params.startDate,
        endDate: params.endDate,
        minRating: params.minRating ? Number(params.minRating) : undefined,
        sortBy: params.sortBy || "newest",
      };
    },
    [],
  );

  // フィルター状態からURLパラメータを構築
  const buildUrlParams = useCallback(
    (filters: WorksFilterState): URLSearchParams => {
      const params = new URLSearchParams();

      if (filters.title) params.set("title", filters.title);
      if (filters.minPrice !== undefined)
        params.set("minPrice", filters.minPrice.toString());
      if (filters.maxPrice !== undefined)
        params.set("maxPrice", filters.maxPrice.toString());
      if (filters.startDate) params.set("startDate", filters.startDate);
      if (filters.endDate) params.set("endDate", filters.endDate);
      if (filters.minRating !== undefined)
        params.set("minRating", filters.minRating.toString());
      if (filters.sortBy) params.set("sortBy", filters.sortBy);

      return params;
    },
    [],
  );

  // 作品を検索する関数
  const searchWorks = useCallback(async (filters: WorksFilterState) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await honoClient.api.works
        .$get({
          query: {
            ...filters,
            minPrice: filters.minPrice?.toString(),
            maxPrice: filters.maxPrice?.toString(),
            minRating: filters.minRating?.toString(),
            sortBy: filters.sortBy,
          },
        })
        .then(async (res) =>
          res.ok ? await res.json().then((body) => body) : null,
        );

      if (result) {
        setWorks(result.works);
        setTotalCount(result.pagination.totalItems);
      } else {
        setError("検索中にエラーが発生しました");
        setWorks([]);
        setTotalCount(0);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "検索中にエラーが発生しました",
      );
      setWorks([]);
      setTotalCount(0);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // フィルター変更時の処理
  const handleFilterChange = useCallback(
    (filters: WorksFilterState) => {
      const params = buildUrlParams(filters);
      router.push(`/doujinshi/search?${params.toString()}`, { scroll: false });
      searchWorks(filters);
    },
    [router, buildUrlParams, searchWorks],
  );

  // 初期表示とURLパラメータ変更時の処理
  useEffect(() => {
    const currentParams = {
      title: searchParams.get("title") || undefined,
      minPrice: searchParams.get("minPrice") || undefined,
      maxPrice: searchParams.get("maxPrice") || undefined,
      startDate: searchParams.get("startDate") || undefined,
      endDate: searchParams.get("endDate") || undefined,
      minRating: searchParams.get("minRating") || undefined,
      sortBy:
        (searchParams.get("sortBy") as WorksFilterState["sortBy"]) || "newest",
    };

    const filters = getFiltersFromParams(currentParams);
    searchWorks(filters);
  }, [searchParams, getFiltersFromParams, searchWorks]);

  const initialFilters = getFiltersFromParams(initialParams);

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {!isLoading && (
        <div className="text-sm text-muted-foreground">
          {totalCount}件の作品が見つかりました
        </div>
      )}

      <WorksListWithFilter
        works={works}
        layout="grid"
        emptyMessage={
          isLoading ? "検索中..." : "条件に一致する作品が見つかりませんでした"
        }
        initialFilters={initialFilters}
        onFilterChange={handleFilterChange}
      />
    </div>
  );
}
