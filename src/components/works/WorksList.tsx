import { Calendar, ExternalLink, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { pagesPath } from "../../lib/$path";
import { urlObjectToString } from "../../lib/path/urlObjectToString";
import type { PaginationInfo } from "../../types/pagination";
import { FavoriteButton } from "../favorite-button";
import { Alert, AlertDescription } from "../ui/alert";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Pagination } from "../ui/pagination";

// 作品の型定義（クリーンなインターフェース）
export interface WorkItem {
  id: string;
  title: string;
  price: number;
  listPrice: number;
  listImageUrl: string;
  largeImageUrl: string;
  affiliateUrl: string;
  releaseDate: string;
  volume?: number | null;
  reviewCount?: number | null;
  reviewAverageScore?: number | null;
  genres: Array<{
    id: string;
    name: string;
  }>;
  makers: Array<{
    id: string;
    name: string;
  }>;
  series: Array<{
    id: string;
    name: string;
  }>;
  sampleLargeImages?: Array<{
    imageUrl: string;
    order: number;
  }>;
}

interface WorksListProps {
  works: WorkItem[];
  layout?: "grid" | "list";
  emptyMessage?: string;
  showPagination?: boolean;
  currentGenreId?: number; // ジャンルページで現在のジャンルを除外するため
  pagination?: PaginationInfo;
  onPageChange?: (page: number) => void;
  onItemsPerPageChange?: (itemsPerPage: number) => void;
}

export function WorksList({
  works,
  layout = "grid",
  emptyMessage = "作品が見つかりません",
  showPagination = false,
  currentGenreId,
  pagination,
  onPageChange,
  onItemsPerPageChange,
}: WorksListProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("ja-JP", {
      style: "currency",
      currency: "JPY",
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (works.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <p className="text-gray-500">{emptyMessage}</p>
        </CardContent>
      </Card>
    );
  }

  if (layout === "grid") {
    return (
      <>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {works.map((work) => {
            const discountRate =
              work.listPrice !== work.price
                ? Math.round(
                    ((work.listPrice - work.price) / work.listPrice) * 100,
                  )
                : 0;

            return (
              <Link
                key={work.id}
                href={urlObjectToString(
                  pagesPath.doujinshi.works._workId(work.id).$url(),
                )}
                className="group"
              >
                <Card className="transition-all duration-200 hover:shadow-lg hover:scale-105">
                  <div className="overflow-hidden rounded-t-lg relative">
                    <img
                      src={work.largeImageUrl}
                      alt={work.title}
                      className="w-full h-auto object-cover"
                    />
                    {discountRate > 0 && (
                      <div className="absolute top-2 left-2">
                        <Badge
                          variant="destructive"
                          className="bg-red-500 text-white font-bold"
                        >
                          {discountRate}% OFF
                        </Badge>
                      </div>
                    )}
                    <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-full shadow-sm">
                      <FavoriteButton itemId={work.id} />
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-blue-600">
                      {work.title}
                    </h3>
                    <div className="space-y-2">
                      <p className="text-xl font-bold text-red-600">
                        {formatPrice(work.price)}
                      </p>
                      {work.listPrice !== work.price && (
                        <p className="text-sm text-gray-500 line-through">
                          定価: {formatPrice(work.listPrice)}
                        </p>
                      )}
                      <p className="text-sm text-gray-500">
                        発売日: {formatDate(work.releaseDate)}
                      </p>
                      {work.volume && (
                        <p className="text-sm text-gray-500">
                          {work.volume}ページ
                        </p>
                      )}
                      {work.reviewCount && work.reviewAverageScore && (
                        <div className="flex items-center space-x-1">
                          <span className="text-yellow-500">★</span>
                          <span className="text-sm">
                            {work.reviewAverageScore.toFixed(1)} (
                            {work.reviewCount})
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        {showPagination && pagination && onPageChange && (
          <div className="mt-12">
            <Pagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              totalItems={pagination.totalItems}
              itemsPerPage={pagination.itemsPerPage}
              onPageChange={onPageChange}
              onItemsPerPageChange={onItemsPerPageChange}
              showItemsPerPage={!!onItemsPerPageChange}
            />
          </div>
        )}
      </>
    );
  }

  // List layout
  return (
    <>
      <div className="space-y-6">
        {works.map((work) => {
          const discountRate =
            work.listPrice !== work.price
              ? Math.round(
                  ((work.listPrice - work.price) / work.listPrice) * 100,
                )
              : 0;

          return (
            <Card
              key={work.id}
              className="overflow-hidden hover:shadow-lg transition-shadow"
            >
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                  {/* サムネイル */}
                  <div className="w-full sm:w-48 h-48 sm:h-36 shrink-0 relative">
                    <img
                      src={work.largeImageUrl}
                      alt={work.title}
                      className="w-full h-full object-cover rounded-lg"
                    />
                    {discountRate > 0 && (
                      <div className="absolute top-2 left-2">
                        <Badge
                          variant="destructive"
                          className="bg-red-500 text-white font-bold"
                        >
                          {discountRate}% OFF
                        </Badge>
                      </div>
                    )}
                    <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-full shadow-sm">
                      <FavoriteButton itemId={work.id} />
                    </div>
                  </div>

                  {/* 作品情報 */}
                  <div className="flex-1 space-y-3 sm:space-y-4 min-w-0">
                    <div className="space-y-2 sm:space-y-3">
                      <h3 className="font-semibold text-lg sm:text-xl leading-tight">
                        <Link
                          href={urlObjectToString(
                            pagesPath.doujinshi.works._workId(work.id).$url(),
                          )}
                          className="hover:text-primary transition-colors"
                        >
                          {work.title}
                        </Link>
                      </h3>

                      {/* 基本情報 */}
                      <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(work.releaseDate)}</span>
                        </div>
                        {work.reviewCount && work.reviewAverageScore && (
                          <div className="flex items-center space-x-1">
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                            <span>{work.reviewAverageScore.toFixed(1)}</span>
                            <span>({work.reviewCount}件)</span>
                          </div>
                        )}
                        {work.volume && <span>{work.volume}ページ</span>}
                      </div>

                      {/* 制作者 */}
                      {work.makers && work.makers.length > 0 && (
                        <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-2">
                          <span className="text-sm text-muted-foreground shrink-0">
                            制作者:
                          </span>
                          <div className="flex flex-wrap gap-1 sm:gap-2 min-w-0">
                            {work.makers.map((maker) => (
                              <Link
                                key={maker.id}
                                href={urlObjectToString(
                                  pagesPath.doujinshi.makers
                                    ._makerId(maker.id)
                                    .$url(),
                                )}
                              >
                                <Badge
                                  variant="outline"
                                  className="cursor-pointer hover:bg-gray-100 text-xs"
                                >
                                  {maker.name}
                                </Badge>
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* ジャンル */}
                      {work.genres && work.genres.length > 0 && (
                        <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-2">
                          <span className="text-sm text-muted-foreground shrink-0">
                            タグ:
                          </span>
                          <div className="flex flex-wrap gap-1 min-w-0">
                            {work.genres
                              .filter(
                                (genre) =>
                                  !currentGenreId ||
                                  Number(genre.id) !== currentGenreId,
                              )
                              .slice(0, 5)
                              .map((genre) => (
                                <Link
                                  key={genre.id}
                                  href={urlObjectToString(
                                    pagesPath.doujinshi.genres
                                      ._genreId(genre.id)
                                      .$url(),
                                  )}
                                >
                                  <Badge
                                    variant="secondary"
                                    className="text-xs cursor-pointer hover:bg-gray-300"
                                  >
                                    {genre.name}
                                  </Badge>
                                </Link>
                              ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* 価格と購入ボタン */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-4 border-t">
                      <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-3">
                        <div className="text-xl sm:text-2xl font-bold text-primary">
                          {formatPrice(work.price)}
                        </div>
                        {discountRate > 0 && (
                          <div className="text-sm text-muted-foreground line-through">
                            {formatPrice(work.listPrice)}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center space-x-2 shrink-0">
                        <Link
                          href={urlObjectToString(
                            pagesPath.doujinshi.works._workId(work.id).$url(),
                          )}
                        >
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs sm:text-sm"
                          >
                            詳細を見る
                          </Button>
                        </Link>
                        <Button
                          size="sm"
                          asChild
                          className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
                        >
                          <a
                            href={work.affiliateUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center space-x-1 text-xs sm:text-sm"
                          >
                            <span>購入する</span>
                            <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4" />
                          </a>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {showPagination && pagination && onPageChange && (
        <div className="mt-12">
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            totalItems={pagination.totalItems}
            itemsPerPage={pagination.itemsPerPage}
            onPageChange={onPageChange}
            onItemsPerPageChange={onItemsPerPageChange}
            showItemsPerPage={!!onItemsPerPageChange}
          />
        </div>
      )}
    </>
  );
}
