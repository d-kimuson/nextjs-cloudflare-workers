import { Sidebar } from "@/components/layout/Sidebar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Award,
  Clock,
  ExternalLink,
  Heart,
  Star,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { pagesPath } from "../lib/$path";
import { getDmmDailyRanking } from "../server/fetchers/dmm";
import { getAllGenresWithCounts } from "../server/fetchers/genres";

export default async function Home() {
  const [genres, dailyRanking] = await Promise.all([
    getAllGenresWithCounts(6, 0),
    getDmmDailyRanking(),
  ]);
  // サンプルデータ
  const featuredWorks = [
    {
      id: "RJ01192179",
      title:
        "童貞陰キャのフリしたヤリチン転校生と学校一モテモテな超巨乳の高飛車女子",
      maker: "なのはなジャム",
      price: "154円",
      thumbnail: "/placeholder-thumbnail.jpg",
      description:
        "俺の名前は斗真。先日、〇校を退学になった。理由は、「校内の女とヤリすぎた」から…..",
      tags: ["おっぱい", "制服", "快楽堕ち", "中出し", "巨乳"],
      releaseDate: "2024/06/15",
      rating: 4.8,
    },
    {
      id: "RJ01234567",
      title: "清楚系JKと放課後の秘密の関係",
      maker: "サークル名",
      price: "220円",
      thumbnail: "/placeholder-thumbnail.jpg",
      description: "普段は真面目で清楚な委員長だけど、実は...",
      tags: ["制服", "学園", "清楚", "秘密"],
      releaseDate: "2024/12/18",
      rating: 4.6,
    },
    {
      id: "RJ01345678",
      title: "隣の人妻お姉さんとの危険な関係",
      maker: "別のサークル",
      price: "330円",
      thumbnail: "/placeholder-thumbnail.jpg",
      description: "新婚なのに旦那とうまくいかない隣の奥さんと...",
      tags: ["人妻", "お姉さん", "不倫", "背徳"],
      releaseDate: "2024/12/10",
      rating: 4.9,
    },
  ];

  const latestNews = [
    {
      date: "2024/12/20",
      title: "サイトリニューアルのお知らせ",
      content: "より使いやすいデザインに生まれ変わりました！",
    },
    {
      date: "2024/12/19",
      title: "新機能「デイリーランキング」追加",
      content: "24時間以内の人気作品をリアルタイムで表示",
    },
    {
      date: "2024/12/18",
      title: "作者ページ機能を改善",
      content: "お気に入りの作者の新作をより見つけやすくなりました",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* メインコンテンツ */}
          <div className="flex-1 space-y-8">
            {/* ヒーローセクション */}
            <section className="text-center space-y-4 py-12 bg-gradient-to-b from-primary/10 to-background rounded-lg">
              <h1 className="text-4xl font-bold text-foreground">おかずNavi</h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                新作アダルト作品の発見体験を提供するナビゲーションサイト
              </p>
              <div className="flex justify-center gap-4 mt-6 flex-wrap">
                <Link href={pagesPath.doujinshi.daily_ranking.$url()}>
                  <Button size="lg" className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5" />
                    <span>今日のランキング</span>
                  </Button>
                </Link>
                <Link href="/doujinshi/new-releases">
                  <Button
                    variant="outline"
                    size="lg"
                    className="flex items-center space-x-2"
                  >
                    <Award className="h-5 w-5" />
                    <span>高評価作者の新作</span>
                  </Button>
                </Link>
                <Link href={pagesPath.doujinshi.makers.$url()}>
                  <Button variant="outline" size="lg">
                    人気作者を見る
                  </Button>
                </Link>
              </div>
            </section>

            {/* おすすめ作品 */}
            <section className="space-y-6">
              <div className="flex items-center space-x-2">
                <Star className="h-6 w-6 text-yellow-500" />
                <h2 className="text-2xl font-bold">おすすめ作品</h2>
              </div>

              <div className="grid gap-6">
                {featuredWorks.map((work) => (
                  <Card key={work.id} className="overflow-hidden">
                    <CardContent className="p-6">
                      <div className="flex gap-4">
                        {/* サムネイル */}
                        <div className="w-32 h-24 bg-muted rounded-lg flex items-center justify-center shrink-0">
                          <span className="text-muted-foreground text-sm">
                            サムネイル
                          </span>
                        </div>

                        {/* 作品情報 */}
                        <div className="flex-1 space-y-3">
                          <div className="space-y-2">
                            <h3 className="font-semibold text-lg leading-tight line-clamp-2">
                              <Link
                                href={`/doujinshi/works/${work.id}`}
                                className="hover:text-primary transition-colors"
                              >
                                {work.title}
                              </Link>
                            </h3>
                            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                              <span>{work.maker}</span>
                              <span>{work.releaseDate}</span>
                              <div className="flex items-center space-x-1">
                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                <span>{work.rating}</span>
                              </div>
                            </div>
                          </div>

                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {work.description}
                          </p>

                          <div className="flex items-center justify-between">
                            <div className="flex flex-wrap gap-1">
                              {work.tags.slice(0, 4).map((tag) => (
                                <Badge
                                  key={tag}
                                  variant="secondary"
                                  className="text-xs"
                                >
                                  {tag}
                                </Badge>
                              ))}
                            </div>

                            <div className="flex items-center space-x-3">
                              <Badge
                                variant="outline"
                                className="font-semibold"
                              >
                                {work.price}
                              </Badge>
                              <Button
                                size="sm"
                                className="flex items-center space-x-1"
                              >
                                <ExternalLink className="h-4 w-4" />
                                <span>購入</span>
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          </div>

          {/* サイドバー */}
          <Sidebar genres={genres} dailyRanking={dailyRanking} />
        </div>
      </div>
    </div>
  );
}
