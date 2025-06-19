"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";
import type { WorkItem } from "../../../../components/works/WorksList";
import { WorksList } from "../../../../components/works/WorksList";
import type { PaginationInfo } from "../../../../types/pagination";

interface MakerPageClientProps {
  works: WorkItem[];
  pagination: PaginationInfo;
  makerId: number;
  makerName: string;
}

export function MakerPageClient({
  works,
  pagination,
  makerId,
  makerName,
}: MakerPageClientProps) {
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
      return `/doujinshi/makers/${makerId}${queryString ? `?${queryString}` : ""}`;
    };
  }, [searchParams, makerId]);

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
      emptyMessage={`${makerName}の作品はまだありません。`}
      showPagination={true}
      pagination={pagination}
      onPageChange={handlePageChange}
      onItemsPerPageChange={handleItemsPerPageChange}
    />
  );
}
