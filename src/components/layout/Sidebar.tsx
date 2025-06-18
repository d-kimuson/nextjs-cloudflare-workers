import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { TrendingUp, Clock, Star, Users, Tag } from "lucide-react";
import Link from "next/link";
import { getAllGenresWithCounts } from "@/server/actions/genres";
import { pagesPath } from "@/lib/$path";
import { urlObjectToString } from "@/lib/path/urlObjectToString";
import { dmmApiClient } from "@/lib/dmmApi/client";

export async function Sidebar() {
  // リアルデータを取得
  const genres = await getAllGenresWithCounts(6); // 上位6ジャンルを取得

  // デイリーランキングから人気作品を取得
  const dailyRankingResult = await dmmApiClient.getDailyRankingDoujinList();
  const popularWorks = dailyRankingResult.isOk()
    ? dailyRankingResult.value.slice(0, 5).map((item) => ({
        id: item.content_id,
        title: item.title,
        price: item.prices?.price ? `¥${item.prices.price}` : "価格未定",
        maker: item.iteminfo?.maker?.[0]?.name || "不明",
        affiliateURL: item.affiliateURL,
      }))
    : [];

  return (
    <aside className="w-80 space-y-6 hidden lg:block">
      {/* カテゴリー */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Tag className="h-5 w-5" />
            <span>人気ジャンル</span>
          </CardTitle>
          <CardDescription>よく投稿されるジャンル</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {genres.map((genre) => (
              <div key={genre.id} className="flex items-center justify-between">
                <Link
                  href={urlObjectToString(
                    pagesPath.doujinshi.genres._genreId(String(genre.id)).$url()
                  )}
                  className="text-sm text-gray-700 hover:text-primary transition-colors cursor-pointer"
                >
                  {genre.name}
                </Link>
                <Badge variant="secondary" className="text-xs">
                  {genre.workCount.toLocaleString()}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 人気作品 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>人気作品</span>
          </CardTitle>
          <CardDescription>今注目の同人作品</CardDescription>
        </CardHeader>
        <CardContent>
          {popularWorks.length > 0 ? (
            <div className="space-y-4">
              {popularWorks.map((work, index) => (
                <div key={work.id} className="space-y-2">
                  <h4 className="font-medium text-sm leading-5 line-clamp-2">
                    <a
                      href={work.affiliateURL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-primary transition-colors"
                    >
                      {work.title}
                    </a>
                  </h4>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{work.maker}</span>
                    <Badge variant="outline" className="text-xs">
                      {work.price}
                    </Badge>
                  </div>
                  {index < popularWorks.length - 1 && <Separator />}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center">
              データを読み込み中...
            </p>
          )}
        </CardContent>
      </Card>

      {/* 注意事項 */}
      <Card className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-900/20">
        <CardHeader>
          <CardTitle className="text-sm text-orange-800 dark:text-orange-200">
            ⚠️ 違法ダウンロードは犯罪です。
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-xs text-orange-700 dark:text-orange-300">
            <p>作品は必ず正規のサイトから購入しましょう！</p>
          </div>
        </CardContent>
      </Card>
    </aside>
  );
}
