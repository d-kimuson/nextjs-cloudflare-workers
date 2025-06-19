"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";
import type { WorkItem } from "../../../../components/works/WorksList";
import { WorksList } from "../../../../components/works/WorksList";
import type { PaginationInfo } from "../../../../types/pagination";

interface SeriesPageClientProps {
  works: WorkItem[];
  pagination: PaginationInfo;
  seriesId: number;
  seriesName: string;
}

export function SeriesPageClient({
  works,
  pagination,
  seriesId,
  seriesName,
}: SeriesPageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const createUrl = useMemo(() => {
    return (newPage: number, newLimit?: number) => {
      const params = new URLSearchParams(searchParams);

      if (newPage > 1) {
        params.set("page", newPage.toString());
      } else {
        params.delete("page");
      }

      if (newLimit && newLimit !== 20) {
        params.set("limit", newLimit.toString());
      } else if (newLimit) {
        params.delete("limit");
      }

      const queryString = params.toString();
      return `/doujinshi/series/${seriesId}${queryString ? `?${queryString}` : ""}`;
    };
  }, [searchParams, seriesId]);

  const handlePageChange = (page: number) => {
    const url = createUrl(page);
    router.push(url);
  };

  const handleItemsPerPageChange = (itemsPerPage: number) => {
    const url = createUrl(1, itemsPerPage);
    router.push(url);
  };

  return (
    <WorksList
      works={works}
      layout="grid"
      emptyMessage={`「${seriesName}」シリーズの作品はまだ登録されていません。`}
      showPagination={true}
      pagination={pagination}
      onPageChange={handlePageChange}
      onItemsPerPageChange={handleItemsPerPageChange}
    />
  );
}
