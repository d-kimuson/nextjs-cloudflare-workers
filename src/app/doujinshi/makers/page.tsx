import { Sidebar } from "@/components/layout/Sidebar";
import {
  ArrowLeft,
  Award,
  Crown,
  Medal,
  Star,
  TrendingUp,
  Trophy,
  User,
} from "lucide-react";
import Link from "next/link";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardHeader } from "../../../components/ui/card";
import { pagesPath } from "../../../lib/$path";
import { urlObjectToString } from "../../../lib/path/urlObjectToString";
import { honoClient } from "../../../lib/api/client";

export default async function MakersPage() {
  const [rankings, genres, dailyRanking] = await Promise.all([
    honoClient.api["makers-ranking"]
      .$get()
      .then(async (res) =>
        res.ok ? await res.json().then((body) => body.ranking) : [],
      ),
    honoClient.api.genres
      .$get()
      .then(async (res) =>
        res.ok ? await res.json().then((body) => body.genres) : [],
      ),
    honoClient.api.dmm["daily-ranking"]
      .$get()
      .then(async (res) =>
        res.ok ? await res.json().then((body) => body.dailyRanking) : [],
      ),
  ]);

  // ランキングアイコンを取得
  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="h-5 w-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />;
    if (rank === 3) return <Medal className="h-5 w-5 text-amber-600" />;
    return <TrendingUp className="h-5 w-5 text-blue-500" />;
  };

  // ランクカラーを取得
  const getRankColor = (rank: number) => {
    if (rank === 1) return "text-yellow-600 bg-yellow-50 border-yellow-200";
    if (rank === 2) return "text-gray-600 bg-gray-50 border-gray-200";
    if (rank === 3) return "text-amber-600 bg-amber-50 border-amber-200";
    if (rank <= 10) return "text-blue-600 bg-blue-50 border-blue-200";
    return "text-slate-600 bg-slate-50 border-slate-200";
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* メインコンテンツ */}
          <div className="flex-1 space-y-8">
            {/* ページヘッダー */}
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
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

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Trophy className="h-6 w-6 text-yellow-500" />
                  <h1 className="text-3xl font-bold">作者ランキング</h1>
                </div>
                <p className="text-muted-foreground">
                  総合スコアによる上位{rankings.length}名の作者ランキング
                </p>
              </div>
            </div>

            {/* 作者ランキング */}
            {rankings.length > 0 ? (
              <div className="space-y-4">
                {rankings.map((ranking, index) => (
                  <Link
                    key={ranking.id}
                    href={urlObjectToString(
                      pagesPath.doujinshi.makers._makerId(ranking.id).$url(),
                    )}
                  >
                    <Card
                      className={`transition-all duration-200 hover:shadow-lg hover:scale-[1.02] group border-2 ${getRankColor(
                        ranking.rank,
                      )}`}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-center space-x-4">
                          {/* ランキング順位 */}
                          <div className="flex items-center space-x-2 min-w-[80px]">
                            {getRankIcon(ranking.rank)}
                            <span className="text-2xl font-bold">
                              {ranking.rank}
                            </span>
                          </div>

                          {/* 作者情報 */}
                          <div className="flex-1">
                            <h3 className="font-semibold text-2xl group-hover:text-primary mb-3">
                              {ranking.name}
                            </h3>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-base">
                              <div className="space-y-1">
                                <span className="text-muted-foreground text-sm">
                                  総合スコア
                                </span>
                                <div className="font-bold text-xl text-primary">
                                  {ranking.totalScore.toFixed(1)}
                                </div>
                              </div>

                              <div className="space-y-1">
                                <span className="text-muted-foreground text-sm">
                                  作品数
                                </span>
                                <div className="font-semibold text-lg">
                                  {ranking.workCount}作品
                                </div>
                              </div>

                              <div className="space-y-1">
                                <span className="text-muted-foreground text-sm">
                                  平均評価
                                </span>
                                <div className="font-semibold text-lg flex items-center space-x-1">
                                  <Star className="h-4 w-4 text-yellow-500" />
                                  <span>
                                    {ranking.avgReviewScore
                                      ? ranking.avgReviewScore.toFixed(1)
                                      : "N/A"}
                                  </span>
                                </div>
                              </div>

                              <div className="space-y-1">
                                <span className="text-muted-foreground text-sm">
                                  平均レビュー数
                                </span>
                                <div className="font-semibold text-lg">
                                  {ranking.avgReviewCount
                                    ? Math.round(ranking.avgReviewCount)
                                    : "N/A"}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* 特別バッジ */}
                          <div className="flex flex-col space-y-2">
                            {ranking.rank === 1 && (
                              <Badge className="bg-yellow-500 text-white text-sm px-3 py-1">
                                <Crown className="h-4 w-4 mr-1" />
                                チャンピオン
                              </Badge>
                            )}
                            {ranking.rank <= 3 && ranking.rank > 1 && (
                              <Badge
                                variant="secondary"
                                className="text-sm px-3 py-1"
                              >
                                <Medal className="h-4 w-4 mr-1" />
                                トップ3
                              </Badge>
                            )}
                            {ranking.rank <= 10 && ranking.rank > 3 && (
                              <Badge
                                variant="outline"
                                className="text-sm px-3 py-1"
                              >
                                <TrendingUp className="h-4 w-4 mr-1" />
                                トップ10
                              </Badge>
                            )}
                            {ranking.workCount >= 20 && (
                              <Badge
                                variant="default"
                                className="bg-purple-500 text-sm px-3 py-1"
                              >
                                <Award className="h-4 w-4 mr-1" />
                                ベテラン
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground">
                    ランキングデータが見つかりませんでした。
                  </p>
                </CardContent>
              </Card>
            )}

            {/* ランキング統計情報 */}
            {rankings.length > 0 && (
              <Card>
                <CardHeader>
                  <h2 className="text-xl font-semibold flex items-center space-x-2">
                    <Trophy className="h-5 w-5 text-yellow-500" />
                    <span>ランキング統計</span>
                  </h2>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 md:grid-cols-4">
                    <div className="text-center space-y-2">
                      <p className="text-4xl font-bold text-blue-600">
                        {rankings.length}
                      </p>
                      <p className="text-base text-muted-foreground">
                        ランクイン作者数
                      </p>
                    </div>
                    <div className="text-center space-y-2">
                      <p className="text-4xl font-bold text-green-600">
                        {rankings.reduce(
                          (sum, ranking) => sum + ranking.workCount,
                          0,
                        )}
                      </p>
                      <p className="text-base text-muted-foreground">
                        総作品数
                      </p>
                    </div>
                    <div className="text-center space-y-2">
                      <p className="text-4xl font-bold text-purple-600">
                        {rankings.length > 0
                          ? (rankings[0]?.totalScore.toFixed(1) ?? "N/A")
                          : "N/A"}
                      </p>
                      <p className="text-base text-muted-foreground">
                        最高スコア
                      </p>
                    </div>
                    <div className="text-center space-y-2">
                      <p className="text-4xl font-bold text-orange-600">
                        {Math.round(
                          (rankings.reduce(
                            (sum, ranking) => sum + ranking.totalScore,
                            0,
                          ) /
                            rankings.length) *
                            10,
                        ) / 10}
                      </p>
                      <p className="text-base text-muted-foreground">
                        平均スコア
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* サイドバー */}
          <Sidebar genres={genres} dailyRanking={dailyRanking} />
        </div>
      </div>
    </div>
  );
}

export const metadata = {
  title: "作者ランキング - 人気同人誌作者一覧",
  description:
    "総合スコアによる人気作者ランキング。高評価・多作品を持つ優秀な同人誌・エロ漫画作者をランキング形式でご紹介。信頼できる作者の作品を安全に購入できます。",
  keywords: [
    "作者ランキング",
    "人気作者",
    "同人誌作者",
    "サークル",
    "制作者",
    "優秀作者",
    "高評価",
    "信頼",
    "ベテラン",
  ],
  openGraph: {
    title: "作者ランキング | おかずNavi",
    description:
      "総合スコアによる人気作者ランキング。信頼できる作者の作品を安全に購入",
    url: "https://okazu-navi.com/doujinshi/makers",
    images: [
      {
        url: "/og-makers.jpg",
        width: 1200,
        height: 630,
        alt: "作者ランキング - 人気同人誌作者一覧",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "作者ランキング | おかずNavi",
    description: "人気作者ランキング。信頼できる作者の作品を発見",
    images: ["/og-makers.jpg"],
  },
  alternates: {
    canonical: "https://okazu-navi.com/doujinshi/makers",
  },
};
