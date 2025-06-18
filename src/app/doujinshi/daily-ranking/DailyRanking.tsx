"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { SiteBreadcrumb } from "@/components/layout/Breadcrumb";
import { TrendingUp, ArrowLeft } from "lucide-react";
import type { ItemItem } from "@/lib/api/dmmApi.generated";
import Link from "next/link";
import { pagesPath } from "../../../lib/$path";

type Props = {
  doujinList: ItemItem[];
};

export const DailyRanking: React.FC<Props> = ({ doujinList }) => {
  const breadcrumbItems = [
    { label: "同人誌", href: "/doujinshi" },
    { label: "デイリーランキング" },
  ];

  return (
    <div className="flex-1">
      {/* パンくずリスト */}
      <div className="mb-6">
        <SiteBreadcrumb items={breadcrumbItems} />
      </div>

      <header className="mb-8">
        <div className="flex items-center space-x-4 mb-6">
          <Link href={pagesPath.$url()}>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center space-x-1"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>ホームに戻る</span>
            </Button>
          </Link>
        </div>

        <div className="flex items-center space-x-2 mb-4">
          <TrendingUp className="h-6 w-6 text-orange-500" />
          <h1 className="text-3xl font-bold text-foreground">
            デイリーランキング
          </h1>
        </div>
        <p className="text-muted-foreground">
          24時間以内の人気同人作品をランキング形式でご紹介
        </p>
      </header>

      {doujinList.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {doujinList.map((item, index) => (
            <Card
              key={item.content_id}
              className="overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="relative">
                <Badge
                  className="absolute top-2 left-2 z-10"
                  variant={index < 3 ? "default" : "secondary"}
                >
                  #{index + 1}
                </Badge>
                {item.imageURL?.large && (
                  <img
                    src={item.imageURL.large}
                    alt={item.title}
                    width={300}
                    height={400}
                    className="w-full h-64 object-cover"
                  />
                )}
              </div>

              <CardContent className="p-4 space-y-3">
                <CardTitle className="text-sm line-clamp-2 leading-tight">
                  {item.title}
                </CardTitle>

                <div className="space-y-2 text-xs">
                  {item.prices?.price && (
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">価格:</span>
                      <Badge variant="outline" className="font-bold">
                        ¥{item.prices.price}
                      </Badge>
                    </div>
                  )}

                  {item.date && (
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">発売日:</span>
                      <span className="text-sm">
                        {new Date(item.date).toLocaleDateString("ja-JP")}
                      </span>
                    </div>
                  )}

                  {item.review?.average && (
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">評価:</span>
                      <div className="flex items-center space-x-1">
                        <span className="text-yellow-500">★</span>
                        <span className="text-sm">{item.review.average}</span>
                        <span className="text-muted-foreground text-xs">
                          ({item.review.count})
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <Button asChild className="w-full" size="sm">
                  <a
                    href={item.affiliateURL}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    詳細を見る
                  </a>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          <p className="text-center text-muted-foreground">
            データを読み込み中...
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {Array.from({ length: 9 }, (_, i) => (
              <Card
                key={`skeleton-card-${Date.now()}-${i}`}
                className="overflow-hidden"
              >
                <Skeleton className="h-64 w-full" />
                <CardContent className="p-4 space-y-3">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-8 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
