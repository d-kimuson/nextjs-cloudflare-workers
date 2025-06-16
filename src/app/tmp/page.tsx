import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { dmmApiClient } from "@/lib/api/client";
import type { ItemItem } from "@/lib/api/dmmApi.generated";
import Link from "next/link";

export default async function Home() {
  const apiClient = dmmApiClient();
  let doujinList: ItemItem[] = [];
  let error: string | null = null;

  try {
    doujinList = await apiClient.getRankingDoujinList();
  } catch (err) {
    error = err instanceof Error ? err.message : "Unknown error occurred";
    console.error("Error fetching doujin ranking:", err);
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Link href="/">
              <Button variant="outline" size="sm">
                ← ホームに戻る
              </Button>
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            同人ランキング
          </h1>
          <p className="text-muted-foreground">
            人気同人作品のランキングをご紹介
          </p>
        </header>

        {error ? (
          <Card className="border-destructive">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-destructive font-medium">
                  データの取得に失敗しました
                </p>
                <p className="text-sm text-muted-foreground mt-2">{error}</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {doujinList.map((item, index) => (
              <Card
                key={item.content_id}
                className="overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="relative">
                  <Badge
                    className="absolute top-2 left-2 z-10"
                    variant="default"
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

                <CardContent className="p-4">
                  <CardTitle className="text-sm mb-3 line-clamp-2 leading-tight">
                    {item.title}
                  </CardTitle>

                  <div className="space-y-2 text-xs text-muted-foreground mb-4">
                    {item.prices?.price && (
                      <div className="flex justify-between items-center">
                        <span>価格:</span>
                        <span className="font-bold text-red-600">
                          ¥{item.prices.price}
                        </span>
                      </div>
                    )}

                    {item.date && (
                      <div className="flex justify-between items-center">
                        <span>発売日:</span>
                        <span>
                          {new Date(item.date).toLocaleDateString("ja-JP")}
                        </span>
                      </div>
                    )}

                    {item.review?.average && (
                      <div className="flex justify-between items-center">
                        <span>評価:</span>
                        <span className="flex items-center">
                          <span className="text-yellow-500">★</span>
                          <span className="ml-1">{item.review.average}</span>
                          <span className="text-muted-foreground ml-1">
                            ({item.review.count})
                          </span>
                        </span>
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
        )}

        {doujinList.length === 0 && !error && (
          <div className="text-center py-12">
            <div className="space-y-4">
              <p className="text-muted-foreground mb-6">
                データを読み込み中...
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array.from({ length: 8 }, (_, i) => (
                  <Card
                    key={`skeleton-card-${Date.now()}-${i}`}
                    className="overflow-hidden"
                  >
                    <Skeleton className="h-64 w-full" />
                    <CardContent className="p-4">
                      <Skeleton className="h-4 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-1/2 mb-4" />
                      <Skeleton className="h-8 w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
