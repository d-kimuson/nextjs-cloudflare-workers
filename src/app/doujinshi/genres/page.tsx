import { Sidebar } from "@/components/layout/Sidebar";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { pagesPath } from "@/lib/$path";
import { urlObjectToString } from "@/lib/path/urlObjectToString";
import { generateGenresListBreadcrumbs } from "@/lib/utils/breadcrumb";
import { ArrowLeft, Hash, Tag, TrendingUp } from "lucide-react";
import Link from "next/link";
import { honoClient } from "../../../lib/api/client";

export default async function GenresPage() {
  const [genres, genresForSidebar, dailyRanking] = await Promise.all([
    honoClient.api.genres
      .$get()
      .then(async (res) =>
        res.ok ? await res.json().then((body) => body.genres) : [],
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

  // 作品数によるレベル分けとカラー設定
  const getGenreLevelInfo = (workCount: number) => {
    if (workCount >= 1000) {
      return {
        level: "超人気",
        color: "text-red-600 bg-red-50 border-red-200",
        icon: <TrendingUp className="h-5 w-5 text-red-500" />,
      };
    }
    if (workCount >= 500) {
      return {
        level: "人気",
        color: "text-orange-600 bg-orange-50 border-orange-200",
        icon: <TrendingUp className="h-5 w-5 text-orange-500" />,
      };
    }
    if (workCount >= 100) {
      return {
        level: "注目",
        color: "text-blue-600 bg-blue-50 border-blue-200",
        icon: <Tag className="h-5 w-5 text-blue-500" />,
      };
    }
    return {
      level: "新興",
      color: "text-slate-600 bg-slate-50 border-slate-200",
      icon: <Hash className="h-5 w-5 text-slate-500" />,
    };
  };

  const breadcrumbItems = generateGenresListBreadcrumbs();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* メインコンテンツ */}
          <div className="flex-1 space-y-8">
            {/* パンくずナビゲーション */}
            <Breadcrumb items={breadcrumbItems} className="mb-6" />

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
                  <Tag className="h-6 w-6 text-blue-500" />
                  <h1 className="text-3xl font-bold">ジャンル一覧</h1>
                </div>
                <p className="text-muted-foreground">
                  全{genres.length}ジャンルの作品数ランキング
                </p>
              </div>
            </div>

            {/* ジャンル一覧 */}
            {genres.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1">
                {genres.map((genre, index) => {
                  const levelInfo = getGenreLevelInfo(genre.workCount);
                  const rank = index + 1;

                  return (
                    <Link
                      key={genre.id}
                      href={urlObjectToString(
                        pagesPath.doujinshi.genres._genreId(genre.id).$url(),
                      )}
                    >
                      <Card
                        className={`transition-all duration-200 hover:shadow-lg hover:scale-[1.02] group border-2 ${levelInfo.color}`}
                      >
                        <CardContent className="p-6">
                          <div className="flex items-center space-x-4">
                            {/* ランキング順位 */}
                            <div className="flex items-center space-x-2 min-w-[60px]">
                              <span className="text-2xl font-bold text-muted-foreground">
                                #{rank}
                              </span>
                            </div>

                            {/* ジャンル情報 */}
                            <div className="flex-1">
                              <h3 className="font-semibold text-2xl group-hover:text-primary mb-2">
                                {genre.name}
                              </h3>

                              <div className="flex items-center space-x-4 text-base">
                                <div className="flex items-center space-x-2">
                                  {levelInfo.icon}
                                  <span className="font-semibold text-lg">
                                    {genre.workCount.toLocaleString()}作品
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* レベルバッジ */}
                            <div className="flex flex-col space-y-2">
                              <Badge
                                className={`text-sm px-3 py-1 ${
                                  levelInfo.level === "超人気"
                                    ? "bg-red-500 text-white"
                                    : levelInfo.level === "人気"
                                      ? "bg-orange-500 text-white"
                                      : levelInfo.level === "注目"
                                        ? "bg-blue-500 text-white"
                                        : "bg-slate-500 text-white"
                                }`}
                              >
                                {levelInfo.level}
                              </Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground">
                    ジャンルデータが見つかりませんでした。
                  </p>
                </CardContent>
              </Card>
            )}

            {/* ジャンル統計情報 */}
            {genres.length > 0 && (
              <Card>
                <CardHeader>
                  <h2 className="text-xl font-semibold flex items-center space-x-2">
                    <Tag className="h-5 w-5 text-blue-500" />
                    <span>ジャンル統計</span>
                  </h2>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 md:grid-cols-4">
                    <div className="text-center space-y-2">
                      <p className="text-4xl font-bold text-blue-600">
                        {genres.length}
                      </p>
                      <p className="text-base text-muted-foreground">
                        総ジャンル数
                      </p>
                    </div>
                    <div className="text-center space-y-2">
                      <p className="text-4xl font-bold text-green-600">
                        {genres
                          .reduce((sum, genre) => sum + genre.workCount, 0)
                          .toLocaleString()}
                      </p>
                      <p className="text-base text-muted-foreground">
                        総作品数
                      </p>
                    </div>
                    <div className="text-center space-y-2">
                      <p className="text-4xl font-bold text-purple-600">
                        {genres.length > 0
                          ? (genres[0]?.workCount.toLocaleString() ?? "N/A")
                          : "N/A"}
                      </p>
                      <p className="text-base text-muted-foreground">
                        最多作品数
                      </p>
                    </div>
                    <div className="text-center space-y-2">
                      <p className="text-4xl font-bold text-orange-600">
                        {Math.round(
                          genres.reduce(
                            (sum, genre) => sum + genre.workCount,
                            0,
                          ) / genres.length,
                        ).toLocaleString()}
                      </p>
                      <p className="text-base text-muted-foreground">
                        平均作品数
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* サイドバー */}
          <Sidebar genres={genresForSidebar} dailyRanking={dailyRanking} />
        </div>
      </div>
    </div>
  );
}

export const metadata = {
  title: "ジャンル一覧 - 同人誌・エロ漫画のカテゴリ",
  description:
    "同人誌・エロ漫画の全ジャンルを作品数順でランキング表示。人気ジャンルから新興ジャンルまで、お好みのカテゴリで作品を探せます。豊富なジャンルから理想の作品を発見。",
  keywords: [
    "ジャンル一覧",
    "同人誌ジャンル",
    "エロ漫画カテゴリ",
    "人気ジャンル",
    "作品分類",
    "タグ",
    "カテゴリ検索",
    "ジャンル検索",
  ],
  openGraph: {
    title: "ジャンル一覧 | おかずNavi",
    description: "同人誌・エロ漫画の全ジャンルを作品数順でランキング表示",
    url: "https://okazu-navi.com/doujinshi/genres",
    images: [
      {
        url: "/og-genres.jpg",
        width: 1200,
        height: 630,
        alt: "ジャンル一覧 - 同人誌・エロ漫画のカテゴリ",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ジャンル一覧 | おかずNavi",
    description: "同人誌・エロ漫画の全ジャンルを作品数順でランキング表示",
    images: ["/og-genres.jpg"],
  },
  alternates: {
    canonical: "https://okazu-navi.com/doujinshi/genres",
  },
};
