import { Sidebar } from "@/components/layout/Sidebar";
import { WorksList } from "@/components/works/WorksList";
import { FanzaWorksList } from "@/components/works/FanzaWorksList";
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
  ChevronRight,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { pagesPath } from "../lib/$path";
import { urlObjectToString } from "../lib/path/urlObjectToString";
import { getDmmDailyRanking } from "../server/fetchers/dmm";
import { getAllGenresWithCounts } from "../server/fetchers/genres";
import { getRecentWorksByTopMakers } from "../server/fetchers/works";

export default async function Home() {
  const [genres, dailyRanking, recentWorksByTopMakers] = await Promise.all([
    getAllGenresWithCounts(6, 0),
    getDmmDailyRanking(),
    getRecentWorksByTopMakers({ limit: 6, daysAgo: 14 }),
  ]);

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
                <Link href={pagesPath.doujinshi.new_releases.$url()}>
                  <Button
                    variant="outline"
                    size="lg"
                    className="flex items-center space-x-2"
                  >
                    <Zap className="h-5 w-5" />
                    <span>人気作者の新作</span>
                  </Button>
                </Link>
                <Link href={pagesPath.doujinshi.makers.$url()}>
                  <Button variant="outline" size="lg">
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
