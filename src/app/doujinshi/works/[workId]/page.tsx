import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "../../../../components/ui/badge";
import { Button } from "../../../../components/ui/button";
import { Card, CardContent, CardHeader } from "../../../../components/ui/card";
import { pagesPath } from "../../../../lib/$path";
import { getDb } from "../../../../server/db/client";
import { worksRepository } from "../../../../server/repositories/works.repository";

type WorkPageProps = {
  params: Promise<{
    workId: string;
  }>;
};

export default async function WorkPage({ params }: WorkPageProps) {
  const { workId } = await params;
  const db = getDb();
  const workRepo = worksRepository(db);

  const work = await workRepo.findById(workId);

  if (!work) {
    notFound();
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("ja-JP", {
      style: "currency",
      currency: "JPY",
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ja-JP");
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid gap-8 lg:grid-cols-3">
        {/* メイン画像エリア */}
        <div className="lg:col-span-2">
          <div className="space-y-6">
            {/* 作品画像 */}
            <div className="flex flex-col items-center space-y-4">
              <img
                src={work.largeImageUrl}
                alt={work.title}
                className="max-w-full h-auto rounded-lg shadow-lg"
              />

              {/* アフィリエイトボタン */}
              <div className="flex flex-col items-center space-y-2">
                <Button size="lg" asChild className="w-full max-w-sm">
                  <a
                    href={work.affiliateUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg text-lg"
                  >
                    {formatPrice(work.price)}で購入する
                  </a>
                </Button>
                {work.listPrice !== work.price && (
                  <p className="text-sm text-gray-500 line-through">
                    定価: {formatPrice(work.listPrice)}
                  </p>
                )}
              </div>
            </div>

            {/* 試し読み画像 */}
            {work.sampleLargeImages.length > 0 && (
              <Card>
                <CardHeader>
                  <h2 className="text-2xl font-semibold">試し読み</h2>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    {work.sampleLargeImages
                      .sort((a, b) => a.order - b.order)
                      .map((image, index) => (
                        <img
                          key={`${image.workId}-${image.order}`}
                          src={image.imageUrl}
                          alt={`${work.title} サンプル ${index + 1}`}
                          className="w-full rounded border"
                        />
                      ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* サイドバー情報 */}
        <div className="space-y-6">
          {/* 作品情報 */}
          <Card>
            <CardHeader>
              <h1 className="text-2xl font-bold">{work.title}</h1>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 基本情報 */}
              <div className="space-y-2">
                <p>
                  <span className="font-semibold">価格:</span>{" "}
                  {formatPrice(work.price)}
                </p>
                <p>
                  <span className="font-semibold">発売日:</span>{" "}
                  {formatDate(work.releaseDate)}
                </p>
                {work.volume && (
                  <p>
                    <span className="font-semibold">ページ数:</span>{" "}
                    {work.volume}ページ
                  </p>
                )}
                {work.reviewCount && work.reviewAverageScore && (
                  <p>
                    <span className="font-semibold">評価:</span>★
                    {work.reviewAverageScore.toFixed(1)} ({work.reviewCount}件)
                  </p>
                )}
              </div>

              {/* ジャンル */}
              {work.genres.length > 0 && (
                <div>
                  <p className="font-semibold mb-2">ジャンル:</p>
                  <div className="flex flex-wrap gap-1">
                    {work.genres
                      .filter((genre) => genre.genre)
                      .map((genre) => (
                        <Badge key={genre.genreId} variant="secondary">
                          {genre.genre?.name}
                        </Badge>
                      ))}
                  </div>
                </div>
              )}

              {/* 制作者 */}
              {work.makers.length > 0 && (
                <div>
                  <p className="font-semibold mb-2">制作者:</p>
                  <div className="space-y-1">
                    {work.makers
                      .map(({ maker }) => maker)
                      .filter((maker) => maker !== null)
                      .map((maker) => (
                        <div key={maker.id}>
                          <Link
                            href={pagesPath.doujinshi.makers
                              ._makerId(maker.id)
                              .$url()}
                            className="text-blue-600 hover:text-blue-800 hover:underline"
                          >
                            {maker.name}
                          </Link>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* シリーズ */}
              {work.series.length > 0 && (
                <div>
                  <p className="font-semibold mb-2">シリーズ:</p>
                  <div className="space-y-1">
                    {work.series
                      .map(({ series }) => series)
                      .filter((series) => series !== null)
                      .map((series) => (
                        <div key={series.id}>
                          <Link
                            href={pagesPath.doujinshi.series
                              ._seriesId(series.id)
                              .$url()}
                          >
                            <Badge
                              variant="outline"
                              className="cursor-pointer hover:bg-gray-100"
                            >
                              {series.name}
                            </Badge>
                          </Link>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 購入ボタン（モバイル用） */}
          <Card className="lg:hidden">
            <CardContent className="pt-6">
              <Button size="lg" asChild className="w-full">
                <a
                  href={work.affiliateUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-red-600 hover:bg-red-700"
                >
                  {formatPrice(work.price)}で購入する
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export async function generateMetadata({ params }: WorkPageProps) {
  const { workId } = await params;
  const db = getDb();
  const workRepo = worksRepository(db);
  const work = await workRepo.findById(workId);

  if (!work) {
    return {
      title: "作品が見つかりません",
    };
  }

  return {
    title: `(同人誌) ${work.title}`,
    description: `${work.title}の詳細ページ。価格${new Intl.NumberFormat(
      "ja-JP",
      { style: "currency", currency: "JPY" },
    ).format(work.price)}。試し読み・購入はこちらから。`,
  };
}
