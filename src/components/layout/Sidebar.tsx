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

export async function Sidebar() {
  // リアルデータを取得
  const genres = await getAllGenresWithCounts(6); // 上位6ジャンルを取得

  const popularWorks = [
    {
      title:
        "童貞陰キャのフリしたヤリチン転校生と学校一モテモテな超巨乳の高飛車女子",
      price: "154円",
      maker: "なのはなジャム",
    },
    {
      title: "清楚系JKと放課後の秘密の関係",
      price: "220円",
      maker: "サークル名",
    },
    {
      title: "隣の人妻お姉さんとの危険な関係",
      price: "330円",
      maker: "別のサークル",
    },
  ];

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
          <div className="space-y-4">
            {popularWorks.map((work, index) => (
              <div key={work.title} className="space-y-2">
                <h4 className="font-medium text-sm leading-5 line-clamp-2">
                  <Link
                    href={`/works/${index + 1}`}
                    className="hover:text-primary transition-colors"
                  >
                    {work.title}
                  </Link>
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
        </CardContent>
      </Card>

      {/* 新着情報 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5" />
            <span>新着情報</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="space-y-1">
              <p className="text-muted-foreground text-xs">2024/12/20</p>
              <p>サイトリニューアルしました</p>
            </div>
            <Separator />
            <div className="space-y-1">
              <p className="text-muted-foreground text-xs">2024/12/19</p>
              <p>新しいランキング機能を追加</p>
            </div>
            <Separator />
            <div className="space-y-1">
              <p className="text-muted-foreground text-xs">2024/12/18</p>
              <p>作者ページ機能を改善</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 注意事項 */}
      <Card className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-900/20">
        <CardHeader>
          <CardTitle className="text-sm text-orange-800 dark:text-orange-200">
            ⚠️ 重要なお知らせ
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-xs text-orange-700 dark:text-orange-300 space-y-2">
            <p>違法ダウンロードは犯罪です。</p>
            <p>作品は必ず正規のサイトから購入してください。</p>
          </div>
        </CardContent>
      </Card>
    </aside>
  );
}
