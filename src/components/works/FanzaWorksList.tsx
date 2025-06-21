import { Calendar, ExternalLink, Star } from "lucide-react";
import Image from "next/image";
import type { ItemItem } from "../../server/lib/dmmApi/dmmApi.generated";
import type { PaginationInfo } from "../../types/pagination";
import { FavoriteButton } from "../favorite-button";
import { Alert, AlertDescription } from "../ui/alert";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Pagination } from "../ui/pagination";

interface FanzaWorksListProps {
  works: ItemItem[];
  layout?: "grid" | "list";
  emptyMessage?: string;
  showPagination?: boolean;
  showRanking?: boolean;
  pagination?: PaginationInfo;
  onPageChange?: (page: number) => void;
  onItemsPerPageChange?: (itemsPerPage: number) => void;
}

export function FanzaWorksList({
  works,
  layout = "grid",
  emptyMessage = "作品が見つかりません",
  showPagination = false,
  showRanking = false,
  pagination,
  onPageChange,
  onItemsPerPageChange,
}: FanzaWorksListProps) {
  const formatPrice = (price: string | number) => {
    const numPrice = typeof price === "string" ? Number(price) : price;
    return new Intl.NumberFormat("ja-JP", {
      style: "currency",
      currency: "JPY",
    }).format(numPrice);
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
          {works.map((work, index) => {
            const price = work.prices?.price ? Number(work.prices.price) : 0;
            const listPrice = work.prices?.list_price
              ? Number(work.prices.list_price)
              : price;
            const discountRate =
              listPrice !== price && listPrice > 0
                ? Math.round(((listPrice - price) / listPrice) * 100)
                : 0;

            return (
              <a
                key={work.content_id}
                href={work.affiliateURL}
                target="_blank"
                rel="noopener noreferrer"
                className="group block"
              >
                <Card className="transition-all duration-200 hover:shadow-lg hover:scale-105">
                  <div className="overflow-hidden rounded-t-lg relative">
                    <img
                      src={work.imageURL?.large || work.imageURL?.list || ""}
                      alt={work.title}
                      className="w-full h-auto object-cover"
                    />
                    {showRanking && (
                      <div className="absolute top-2 left-2">
                        <Badge className="bg-gradient-to-r from-red-500 to-orange-500 text-white font-bold">
                          #{index + 1}
                        </Badge>
                      </div>
                    )}
                    {discountRate > 0 && (
                      <div
                        className={`absolute top-2 ${
                          showRanking ? "left-14" : "left-2"
                        }`}
                      >
                        <Badge
                          variant="destructive"
                          className="bg-red-500 text-white font-bold"
                        >
                          {discountRate}% OFF
                        </Badge>
                      </div>
                    )}
                    <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-full shadow-sm">
                      <FavoriteButton itemId={work.content_id} />
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-blue-600">
                      {work.title}
                    </h3>
                    <div className="space-y-2">
                      {work.prices?.price && (
                        <p className="text-xl font-bold text-red-600">
                          {formatPrice(work.prices.price)}
                        </p>
                      )}
                      {discountRate > 0 && work.prices?.list_price && (
                        <p className="text-sm text-gray-500 line-through">
                          定価: {formatPrice(work.prices.list_price)}
                        </p>
                      )}
                      <p className="text-sm text-gray-500">
                        発売日: {formatDate(work.date)}
                      </p>
                      {work.volume && (
                        <p className="text-sm text-gray-500">{work.volume}</p>
                      )}
                      {work.review?.count && work.review?.average && (
                        <div className="flex items-center space-x-1">
                          <span className="text-yellow-500">★</span>
                          <span className="text-sm">
                            {Number(work.review.average).toFixed(1)} (
                            {work.review.count})
                          </span>
                        </div>
                      )}
                      {/* 制作者情報 */}
                      {work.iteminfo?.maker &&
                        work.iteminfo.maker.length > 0 && (
                          <p className="text-sm text-gray-600 truncate">
                            {work.iteminfo.maker[0]?.name || "不明"}
                          </p>
                        )}
                    </div>
                  </CardContent>
                </Card>
              </a>
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
        {works.map((work, index) => {
          const price = work.prices?.price ? Number(work.prices.price) : 0;
          const listPrice = work.prices?.list_price
            ? Number(work.prices.list_price)
            : price;
          const discountRate =
            listPrice !== price && listPrice > 0
              ? Math.round(((listPrice - price) / listPrice) * 100)
              : 0;

          return (
            <Card
              key={work.content_id}
              className="overflow-hidden hover:shadow-lg transition-shadow"
            >
              <CardContent className="p-6">
                <div className="flex gap-6">
                  {/* サムネイル */}
                  <div className="w-48 h-36 shrink-0 relative">
                    <img
                      src={work.imageURL?.list || work.imageURL?.large || ""}
                      alt={work.title}
                      className="w-full h-full object-cover rounded-lg"
                    />
                    {showRanking && (
                      <div className="absolute top-2 left-2">
                        <Badge className="bg-gradient-to-r from-red-500 to-orange-500 text-white font-bold">
                          #{index + 1}
                        </Badge>
                      </div>
                    )}
                    {discountRate > 0 && (
                      <div
                        className={`absolute top-2 ${
                          showRanking ? "left-14" : "left-2"
                        }`}
                      >
                        <Badge
                          variant="destructive"
                          className="bg-red-500 text-white font-bold"
                        >
                          {discountRate}% OFF
                        </Badge>
                      </div>
                    )}
                    <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-full shadow-sm">
                      <FavoriteButton itemId={work.content_id} />
                    </div>
                  </div>

                  {/* 作品情報 */}
                  <div className="flex-1 space-y-4">
                    <div className="space-y-3">
                      <h3 className="font-semibold text-xl leading-tight">
                        <a
                          href={work.affiliateURL}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-primary transition-colors"
                        >
                          {work.title}
                        </a>
                      </h3>

                      {/* 基本情報 */}
                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(work.date)}</span>
                        </div>
                        {work.review?.count && work.review?.average && (
                          <div className="flex items-center space-x-1">
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                            <span>
                              {Number(work.review.average).toFixed(1)}
                            </span>
                            <span>({work.review.count}件)</span>
                          </div>
                        )}
                        {work.volume && <span>{work.volume}</span>}
                      </div>

                      {/* 制作者 */}
                      {work.iteminfo?.maker &&
                        work.iteminfo.maker.length > 0 && (
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-muted-foreground">
                              制作者:
                            </span>
                            <div className="flex flex-wrap gap-2">
                              {work.iteminfo.maker.slice(0, 3).map((maker) => (
                                <Badge
                                  key={maker.id}
                                  variant="outline"
                                  className="cursor-pointer hover:bg-gray-100"
                                >
                                  {maker.name}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                      {/* ジャンル */}
                      {work.iteminfo?.genre &&
                        work.iteminfo.genre.length > 0 && (
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-muted-foreground">
                              タグ:
                            </span>
                            <div className="flex flex-wrap gap-1">
                              {work.iteminfo.genre.slice(0, 5).map((genre) => (
                                <Badge
                                  key={genre.id}
                                  variant="secondary"
                                  className="text-xs cursor-pointer hover:bg-gray-300"
                                >
                                  {genre.name}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                    </div>

                    {/* 価格と購入ボタン */}
                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="flex items-center space-x-3">
                        {work.prices?.price && (
                          <div className="text-2xl font-bold text-primary">
                            {formatPrice(work.prices.price)}
                          </div>
                        )}
                        {discountRate > 0 && work.prices?.list_price && (
                          <div className="text-sm text-muted-foreground line-through">
                            {formatPrice(work.prices.list_price)}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          asChild
                          className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
                        >
                          <a
                            href={work.affiliateURL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center space-x-1"
                          >
                            <span>購入する</span>
                            <ExternalLink className="w-4 h-4" />
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
