import Link from "next/link";
import { Card, CardContent, CardHeader } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { Sidebar } from "@/components/layout/Sidebar";
import { SiteBreadcrumb } from "@/components/layout/Breadcrumb";
import { Users, ArrowLeft, Star, User, Award } from "lucide-react";
import { pagesPath } from "../../../lib/$path";
import { urlObjectToString } from "../../../lib/path/urlObjectToString";
import { getAllMakers } from "../../../server/actions/makers";

export default async function MakersPage() {
  const makers = await getAllMakers(100); // 最大100作者を取得

  const breadcrumbItems = [
    { label: "同人誌", href: "/doujinshi" },
    { label: "作者一覧" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* メインコンテンツ */}
          <div className="flex-1 space-y-8">
            {/* パンくずリスト */}
            <div>
              <SiteBreadcrumb items={breadcrumbItems} />
            </div>

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
                  <Users className="h-6 w-6 text-blue-500" />
                  <h1 className="text-3xl font-bold">作者一覧</h1>
                </div>
                <p className="text-muted-foreground">
                  {makers.length}名の作者が登録されています
                </p>
              </div>
            </div>

            {/* 作者一覧 */}
            {makers.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {makers.map((maker) => (
                  <Link
                    key={maker.id}
                    href={urlObjectToString(
                      pagesPath.doujinshi.makers._makerId(maker.id).$url()
                    )}
                  >
                    <Card className="h-full transition-all duration-200 hover:shadow-lg hover:scale-105 group">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <h3 className="font-semibold text-lg group-hover:text-primary line-clamp-2 flex-1">
                            {maker.name}
                          </h3>
                          {maker.workCount >= 10 && (
                            <Badge variant="default" className="ml-2">
                              <Star className="h-3 w-3 mr-1" />
                              人気
                            </Badge>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">
                              作品数
                            </span>
                            <Badge variant="outline" className="font-semibold">
                              {maker.workCount}作品
                            </Badge>
                          </div>

                          {/* 作者レベル表示 */}
                          <div className="flex items-center space-x-2">
                            {maker.workCount >= 20 && (
                              <>
                                <Award className="h-4 w-4 text-yellow-500" />
                                <span className="text-xs text-muted-foreground">
                                  ベテラン作者
                                </span>
                              </>
                            )}
                            {maker.workCount >= 10 && maker.workCount < 20 && (
                              <>
                                <Star className="h-4 w-4 text-blue-500" />
                                <span className="text-xs text-muted-foreground">
                                  人気作者
                                </span>
                              </>
                            )}
                            {maker.workCount >= 5 && maker.workCount < 10 && (
                              <>
                                <User className="h-4 w-4 text-green-500" />
                                <span className="text-xs text-muted-foreground">
                                  活発な作者
                                </span>
                              </>
                            )}
                            {maker.workCount < 5 && (
                              <>
                                <User className="h-4 w-4 text-gray-400" />
                                <span className="text-xs text-muted-foreground">
                                  新人作者
                                </span>
                              </>
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
                    作者が見つかりませんでした。
                  </p>
                </CardContent>
              </Card>
            )}

            {/* 統計情報 */}
            {makers.length > 0 && (
              <Card>
                <CardHeader>
                  <h2 className="text-xl font-semibold">統計情報</h2>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 md:grid-cols-3">
                    <div className="text-center space-y-2">
                      <p className="text-3xl font-bold text-blue-600">
                        {makers.length}
                      </p>
                      <p className="text-sm text-muted-foreground">総作者数</p>
                    </div>
                    <div className="text-center space-y-2">
                      <p className="text-3xl font-bold text-green-600">
                        {makers.reduce(
                          (sum, maker) => sum + maker.workCount,
                          0
                        )}
                      </p>
                      <p className="text-sm text-muted-foreground">総作品数</p>
                    </div>
                    <div className="text-center space-y-2">
                      <p className="text-3xl font-bold text-purple-600">
                        {Math.round(
                          (makers.reduce(
                            (sum, maker) => sum + maker.workCount,
                            0
                          ) /
                            makers.length) *
                            10
                        ) / 10}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        平均作品数
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* サイドバー */}
          <Sidebar />
        </div>
      </div>
    </div>
  );
}

export async function generateMetadata() {
  const makers = await getAllMakers(5); // メタデータ用に少数取得

  return {
    title: "作者一覧 - DoujinShare",
    description: `${makers.length}名以上の作者の作品を掲載。人気作者から新人作者まで、幅広いジャンルの同人誌をご紹介。`,
  };
}
