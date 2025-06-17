import Link from "next/link";
import { Card, CardContent, CardHeader } from "../../../components/ui/card";
import { pagesPath } from "../../../lib/$path";
import { urlObjectToString } from "../../../lib/path/urlObjectToString";
import { getAllMakers } from "../../../server/actions/makers";

export default async function MakersPage() {
  const makers = await getAllMakers(100); // 最大100作者を取得

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-8">
        {/* ページヘッダー */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">作者一覧</h1>
          <p className="text-lg text-gray-600">
            {makers.length}名の作者が登録されています
          </p>
        </div>

        {/* 作者一覧 */}
        {makers.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {makers.map((maker) => (
              <Link
                key={maker.id}
                href={urlObjectToString(
                  pagesPath.doujinshi.makers._makerId(maker.id).$url(),
                )}
                className="group"
              >
                <Card className="h-full transition-all duration-200 hover:shadow-lg hover:scale-105">
                  <CardHeader>
                    <h3 className="font-semibold text-lg group-hover:text-blue-600 line-clamp-2">
                      {maker.name}
                    </h3>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">作品数</span>
                        <span className="font-semibold text-lg text-blue-600">
                          {maker.workCount}作品
                        </span>
                      </div>

                      {/* 人気度インジケーター */}
                      {maker.workCount >= 10 && (
                        <div className="flex items-center space-x-1">
                          <span className="text-yellow-500">★</span>
                          <span className="text-xs text-gray-500">
                            人気作者
                          </span>
                        </div>
                      )}

                      {maker.workCount >= 5 && maker.workCount < 10 && (
                        <div className="flex items-center space-x-1">
                          <span className="text-blue-500">◆</span>
                          <span className="text-xs text-gray-500">
                            活発な作者
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-gray-500">作者が見つかりませんでした。</p>
            </CardContent>
          </Card>
        )}

        {/* 統計情報 */}
        {makers.length > 0 && (
          <Card className="bg-gray-50">
            <CardHeader>
              <h2 className="text-xl font-semibold">統計情報</h2>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">
                    {makers.length}
                  </p>
                  <p className="text-sm text-gray-500">総作者数</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">
                    {makers.reduce((sum, maker) => sum + maker.workCount, 0)}
                  </p>
                  <p className="text-sm text-gray-500">総作品数</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">
                    {Math.round(
                      (makers.reduce((sum, maker) => sum + maker.workCount, 0) /
                        makers.length) *
                        10,
                    ) / 10}
                  </p>
                  <p className="text-sm text-gray-500">平均作品数</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export async function generateMetadata() {
  const makers = await getAllMakers(5); // メタデータ用に少数取得

  return {
    title: "作者一覧 - 同人誌アフィリエイトサイト",
    description: `${makers.length}名以上の作者の作品を掲載。人気作者から新人作者まで、幅広いジャンルの同人誌をご紹介。`,
  };
}
