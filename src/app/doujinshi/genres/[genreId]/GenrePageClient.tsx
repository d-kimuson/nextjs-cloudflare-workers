"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";
import type { WorkItem } from "../../../../components/works/WorksList";
import { WorksListWithSort } from "../../../../components/works/WorksListWithSort";
import type { PaginationInfo } from "../../../../types/pagination";

interface GenrePageClientProps {
  works: WorkItem[];
  genreId: number;
  genreName: string;
}

export function GenrePageClient({
  works,
  genreId,
  genreName,
}: GenrePageClientProps) {
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
      return `/doujinshi/genres/${genreId}${
        queryString ? `?${queryString}` : ""
      }`;
    };
  }, [searchParams, genreId]);

  const handlePageChange = (page: number) => {
    const url = createUrl(page);
    router.push(url);
  };

  const handleItemsPerPageChange = (itemsPerPage: number) => {
    const url = createUrl(1, itemsPerPage);
    router.push(url);
  };

  return (
    <WorksListWithSort
      works={works}
      layout="grid"
      emptyMessage={`「${genreName}」ジャンルの作品はまだ登録されていません。`}
      showPagination={true}
      currentGenreId={genreId}
      showFilters={true}
    />
  );
}
