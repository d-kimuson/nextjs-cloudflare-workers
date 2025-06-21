import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Skeleton } from "@/components/ui/skeleton";
import { Search } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { pagesPath } from "../../../lib/$path";
import SearchPageClient from "./SearchPageClient";

interface SearchPageProps {
  searchParams: Promise<{
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
  }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* パンくずナビ */}
      <Breadcrumb
        className="mb-6"
        items={[
          { label: "同人誌", href: "/doujinshi" },
          { label: "作品検索", current: true },
        ]}
      />

      {/* ページヘッダー */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <Search className="h-8 w-8 text-blue-500" />
          <h1 className="text-3xl font-bold">作品検索</h1>
        </div>
        <p className="text-muted-foreground">
          価格帯、発売日、評価など様々な条件で作品を検索できます
        </p>
      </div>

      {/* 検索結果 */}
      <Suspense fallback={<SearchPageSkeleton />}>
        <SearchPageClient initialParams={params} />
      </Suspense>
    </div>
  );
}

function SearchPageSkeleton() {
  return (
    <div className="space-y-6">
      {/* フィルター部分のスケルトン */}
      <div className="w-full">
        <Skeleton className="h-64 w-full" />
      </div>

      {/* 結果数表示のスケルトン */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-32" />
      </div>

      {/* 作品一覧のスケルトン */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <div key={`skeleton-${Date.now()}-${i}`} className="space-y-3">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ))}
      </div>
    </div>
  );
}
