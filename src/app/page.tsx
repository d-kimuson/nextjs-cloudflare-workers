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
import { FanzaWorksList } from "@/components/works/FanzaWorksList";
import { WorksList } from "@/components/works/WorksList";
import {
  Award,
  Calendar,
  ChevronRight,
  Clock,
  DollarSign,
  ExternalLink,
  Filter,
  Heart,
  Search,
  Star,
  TrendingUp,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { pagesPath } from "../lib/$path";
import { urlObjectToString } from "../lib/path/urlObjectToString";
import { getDmmDailyRanking } from "../server/fetchers/dmm";
import { getAllGenresWithCounts } from "../server/fetchers/genres";
import {
  getRecentWorksByTopMakers,
  getWorksByPriceRange,
  getWorksByRatingOrder,
} from "../server/fetchers/works";

export default async function Home() {
  const [
    genres,
    dailyRanking,
    recentWorksByTopMakers,
    budgetWorks,
    highRatedWorks,
  ] = await Promise.all([
    getAllGenresWithCounts(6, 0),
    getDmmDailyRanking(),
    getRecentWorksByTopMakers({ limit: 6, daysAgo: 14 }),
    getWorksByPriceRange(undefined, 1000, { limit: 6 }),
    getWorksByRatingOrder(4.0, { limit: 6 }),
  ]);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-none">
        <div className="flex flex-col lg:flex-row gap-8 min-w-0">
          {/* メインコンテンツ */}
          <div className="flex-1 space-y-8 min-w-0 overflow-hidden">
            {/* ヒーローセクション */}
            <section className="text-center space-y-4 py-12 bg-gradient-to-b from-primary/10 to-background rounded-lg">
              <h1 className="text-2xl sm:text-4xl font-bold text-foreground">おかずNavi</h1>
              <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
                新作アダルト作品の発見体験を提供するナビゲーションサイト
              </p>
              <div className="flex justify-center gap-2 sm:gap-4 mt-6 flex-wrap px-4">
                <Link href={pagesPath.doujinshi.daily_ranking.$url()}>
                  <Button size="sm" className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm">
                    <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span>今日のランキング</span>
                  </Button>
                </Link>
                <Link href={pagesPath.doujinshi.new_releases.$url()}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm"
                  >
                    <Zap className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span>人気作者の新作</span>
                  </Button>
                </Link>
                <Link href={pagesPath.doujinshi.makers.$url()}>
                  <Button variant="outline" size="sm" className="text-xs sm:text-sm">
                    人気作者を見る
                  </Button>
                </Link>
              </div>
            </section>

            {/* 今日のランキング */}
            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-6 w-6 text-red-500" />
                  <h2 className="text-2xl font-bold">今日のランキング</h2>
                </div>
                <Link href={pagesPath.doujinshi.daily_ranking.$url()}>
                  <Button
                    variant="ghost"
                    className="flex items-center space-x-1"
                  >
                    <span>もっと見る</span>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>

              <FanzaWorksList
                works={dailyRanking.slice(0, 6)}
                layout="grid"
                emptyMessage="今日のランキングデータを読み込み中..."
                showRanking={true}
              />
            </section>

            {/* 人気作者の新作一覧 */}
            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Award className="h-6 w-6 text-yellow-500" />
                  <h2 className="text-2xl font-bold">人気作者の新作</h2>
                </div>
                <Link href={pagesPath.doujinshi.new_releases.$url()}>
                  <Button
                    variant="ghost"
                    className="flex items-center space-x-1"
                  >
                    <span>もっと見る</span>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>

              <WorksList
                works={recentWorksByTopMakers}
                layout="grid"
                emptyMessage="現在、人気作者の新作はありません"
              />
            </section>

            {/* 多角的なコンテンツ発見セクション */}
            <section className="space-y-8">
              <div className="flex items-center space-x-2">
                <Search className="h-6 w-6 text-blue-500" />
                <h2 className="text-2xl font-bold">いろんな方法で作品を発見</h2>
              </div>

              <div className="space-y-6">
                {/* お手頃価格の作品 */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <DollarSign className="h-5 w-5 text-green-500" />
                        <CardTitle className="text-lg">
                          お手頃価格で楽しむ
                        </CardTitle>
                      </div>
                      <Link href="/doujinshi/search?maxPrice=1000">
                        <Button variant="ghost" size="sm">
                          <span>もっと見る</span>
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                    <CardDescription>
                      1,000円以下のコスパ抜群作品
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <WorksList
                      works={budgetWorks.data.slice(0, 3)}
                      layout="list"
                      emptyMessage="お手頃価格の作品がありません"
                    />
                  </CardContent>
                </Card>

                {/* 高評価作品 */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Star className="h-5 w-5 text-orange-500" />
                        <CardTitle className="text-lg">高評価の名作</CardTitle>
                      </div>
                      <Link href="/doujinshi/search?minRating=4.0">
                        <Button variant="ghost" size="sm">
                          <span>もっと見る</span>
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                    <CardDescription>評価4.0以上の厳選作品</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <WorksList
                      works={highRatedWorks.data.slice(0, 3)}
                      layout="list"
                      emptyMessage="高評価の作品がありません"
                    />
                  </CardContent>
                </Card>
              </div>

              {/* 検索オプション */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Filter className="h-5 w-5 text-purple-500" />
                    <span>詳細検索で理想の作品を見つける</span>
                  </CardTitle>
                  <CardDescription>
                    価格帯・発売日・評価など、様々な条件で検索できます
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <Link href={urlObjectToString(pagesPath.doujinshi.search.$url())}>
                      <Button size="lg" className="flex items-center space-x-2">
                        <Search className="h-5 w-5" />
                        <span>詳細検索を始める</span>
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </Link>
                    <p className="text-sm text-muted-foreground mt-3">
                      価格帯・発売日・評価・タイトルなど多彩な条件で絞り込み検索
                    </p>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* サイト案内 */}
            <section className="space-y-6">
              <div className="flex items-center space-x-2">
                <Heart className="h-6 w-6 text-pink-500" />
                <h2 className="text-2xl font-bold">おかずNaviとは</h2>
              </div>

              <Card>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <p className="text-muted-foreground leading-relaxed">
                      おかずNaviは、アダルト同人作品の新作情報や人気作者の最新情報をお届けするナビゲーションサイトです。
                      高評価の作者による新作作品を中心に、質の高い同人作品の発見をサポートします。
                    </p>
                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="text-center space-y-2">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                          <Award className="h-6 w-6 text-primary" />
                        </div>
                        <h3 className="font-semibold">厳選された作者</h3>
                        <p className="text-sm text-muted-foreground">
                          高評価を獲得している作者の作品を優先的に表示
                        </p>
                      </div>
                      <div className="text-center space-y-2">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                          <Clock className="h-6 w-6 text-primary" />
                        </div>
                        <h3 className="font-semibold">リアルタイム更新</h3>
                        <p className="text-sm text-muted-foreground">
                          最新の作品情報とランキングを定期的に更新
                        </p>
                      </div>
                      <div className="text-center space-y-2">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                          <TrendingUp className="h-6 w-6 text-primary" />
                        </div>
                        <h3 className="font-semibold">トレンド分析</h3>
                        <p className="text-sm text-muted-foreground">
                          人気の傾向やジャンル別の動向を把握可能
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>
          </div>

          {/* サイドバー */}
          <Sidebar genres={genres} dailyRanking={dailyRanking} />
        </div>
      </div>
    </div>
  );
}
