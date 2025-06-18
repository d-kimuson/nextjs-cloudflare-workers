"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Award, Star, TrendingUp, User } from "lucide-react";
import type { WorkItemWithMaker } from "../../../types/work";

type Props = {
  works: WorkItemWithMaker[];
  loading: boolean;
};

export const NewReleases: React.FC<Props> = ({ works, loading }) => {
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

  return (
    <div className="flex-1">
      <header className="mb-8">
        <div className="flex items-center space-x-2 mb-4">
          <Award className="h-6 w-6 text-purple-500" />
          <h1 className="text-3xl font-bold text-foreground">
            高評価作者の新作
          </h1>
        </div>
        <p className="text-muted-foreground">
          スコアの高い作者の最新作品（1週間以内）をご紹介
        </p>
      </header>

      {!loading && works.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {works.map((work, index) => (
            <Card
              key={work.id}
              className="overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="relative">
                <Badge
                  className="absolute top-2 left-2 z-10 bg-purple-500 hover:bg-purple-600"
                  variant="default"
                >
                  <TrendingUp className="h-3 w-3 mr-1" />
                  スコア {work.maker.totalScore.toFixed(1)}
                </Badge>
                {work.largeImageUrl && (
                  <img
                    src={work.largeImageUrl}
                    alt={work.title}
                    width={300}
                    height={400}
                    className="w-full h-64 object-cover"
                  />
                )}
              </div>

              <CardContent className="p-4 space-y-3">
                <CardTitle className="text-sm line-clamp-2 leading-tight">
                  {work.title}
                </CardTitle>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">作者:</span>
                    <div className="flex items-center space-x-1">
                      <User className="h-3 w-3" />
                      <span className="text-sm font-medium">
                        {work.maker.name}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">価格:</span>
                    <Badge variant="outline" className="font-bold">
                      {formatPrice(work.price)}
                    </Badge>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">発売日:</span>
                    <span className="text-sm">
                      {formatDate(work.releaseDate)}
                    </span>
                  </div>

                  {work.reviewAverageScore && (
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">評価:</span>
                      <div className="flex items-center space-x-1">
                        <Star className="h-3 w-3 text-yellow-500 fill-current" />
                        <span className="text-sm">
                          {work.reviewAverageScore.toFixed(1)}
                        </span>
                        {work.reviewCount && (
                          <span className="text-muted-foreground text-xs">
                            ({work.reviewCount})
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">作者作品数:</span>
                    <span className="text-sm">{work.maker.worksCount}作品</span>
                  </div>
                </div>

                <Button asChild className="w-full" size="sm">
                  <a
                    href={work.affiliateUrl}
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
      ) : loading ? (
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
      ) : (
        <div className="text-center space-y-4 py-12">
          <Award className="h-16 w-16 text-muted-foreground mx-auto" />
          <h3 className="text-xl font-semibold">新作がありません</h3>
          <p className="text-muted-foreground">
            現在、高評価作者の新作（1週間以内）はありません。
          </p>
        </div>
      )}
    </div>
  );
};
