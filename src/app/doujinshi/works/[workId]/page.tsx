import { honoClient } from "@/lib/api/client";
import {
  Calendar,
  Download,
  ExternalLink,
  Eye,
  Hash,
  Star,
} from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  StructuredData,
  type WorkData,
  generateWorkDetailSchemas,
} from "../../../../components/StructuredData";
import { FavoriteButton } from "../../../../components/favorite-button";
import { Badge } from "../../../../components/ui/badge";
import { Breadcrumb } from "../../../../components/ui/breadcrumb";
import { Button } from "../../../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../../components/ui/card";
import { Separator } from "../../../../components/ui/separator";
import { WorksList } from "../../../../components/works/WorksList";
import { pagesPath } from "../../../../lib/$path";
import { SITE_CONFIG } from "../../../../lib/constants/site";
import { urlObjectToString } from "../../../../lib/path/urlObjectToString";
import { generateWorkMetadata } from "../../../../lib/seo/metadata";
import { generateWorkBreadcrumbs } from "../../../../lib/utils/breadcrumb";

// Enable ISR for work detail pages - revalidate every hour
// export const revalidate = 3600;

type WorkPageProps = {
  params: Promise<{
    workId: string;
  }>;
};

export async function generateMetadata({
  params,
}: WorkPageProps): Promise<Metadata> {
  const { workId } = await params;

  const work = await honoClient.api.works[":workId"]
    .$get({
      param: { workId },
    })
    .then(async (res) =>
      res.ok ? await res.json().then((body) => body.work) : null,
    );

  if (!work) {
    return {
      title: "作品が見つかりません | おかずNavi",
      description: "指定された作品は見つかりませんでした。",
    };
  }

  return generateWorkMetadata({
    ...work,
    reviewCount: work.reviewCount ?? undefined,
    reviewAverageScore: work.reviewAverageScore ?? undefined,
  });
}

export default async function WorkPage({ params }: WorkPageProps) {
  const { workId } = await params;

  const work = await honoClient.api.works[":workId"]
    .$get({
      param: { workId },
    })
    .then(async (res) =>
      res.ok ? await res.json().then((body) => body.work) : null,
    );

  if (!work) {
    notFound();
  }

  const relatedWorks = await Promise.all(
    work.series.map((s) =>
      honoClient.api.series[":seriesId"]
        .$get({
          param: { seriesId: s.id.toString() },
        })
        .then(async (res) =>
          res.ok
            ? await res.json().then((body) => body.series?.works ?? [])
            : [],
        ),
    ),
  ).then((works) => works.flat());

  const sameAuthorWorks = await Promise.all(
    work.makers.map((m) =>
      honoClient.api.makers[":makerId"].works
        .$get({
          param: { makerId: m.id.toString() },
          query: {},
        })
        .then(async (res) =>
          res.ok ? await res.json().then((body) => body.works ?? []) : [],
        ),
    ),
  ).then((works) => works.flat().filter((w) => w.id !== work.id));

  // 同じジャンルの作品を取得（上位3ジャンルから各5作品まで）
  const sameGenreWorks = await Promise.all(
    work.genres.slice(0, 3).map((g) =>
      honoClient.api.genres[":genreId"].works
        .$get({
          param: { genreId: g.id.toString() },
          query: { limit: "5" },
        })
        .then(async (res) =>
          res.ok ? await res.json().then((body) => body.works ?? []) : [],
        ),
    ),
  ).then(
    (works) =>
      works
        .flat()
        .filter((w) => w.id !== work.id) // 現在の作品を除外
        .filter(
          (w, index, self) =>
            index === self.findIndex((work) => work.id === w.id),
        ) // 重複を除去
        .slice(0, 6), // 最大6作品
  );

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("ja-JP", {
      style: "currency",
      currency: "JPY",
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const discountRate =
    work.listPrice !== work.price
      ? Math.round(((work.listPrice - work.price) / work.listPrice) * 100)
      : 0;

  const ratingStars = work.reviewAverageScore
    ? Math.round(work.reviewAverageScore)
    : 0;

  // パンくずナビゲーション用のアイテム
  const breadcrumbItems = generateWorkBreadcrumbs(work.title);

  // 構造化データの生成
  const workData: WorkData = {
    id: work.id,
    title: work.title,
    largeImageUrl: work.largeImageUrl,
    affiliateUrl: work.affiliateUrl,
    price: work.price,
    listPrice: work.listPrice,
    releaseDate: work.releaseDate,
    volume: work.volume || undefined,
    reviewCount: work.reviewCount || undefined,
    reviewAverageScore: work.reviewAverageScore || undefined,
    makers: work.makers,
    genres: work.genres,
    series: work.series,
  };

  const pageUrl = `${SITE_CONFIG.url}/doujinshi/works/${work.id}`;
  const structuredDataSchemas = generateWorkDetailSchemas(
    workData,
    pageUrl,
    breadcrumbItems,
  );

  return (
    <div className="min-h-screen bg-background">
      {/* 構造化データ */}
      <StructuredData data={structuredDataSchemas} />

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Breadcrumb items={breadcrumbItems} className="mb-6" />

        {/* ヘッダー部分 */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* 左側：画像とアクション */}
            <div className="lg:w-1/2">
              <div className="relative aspect-[3/4]">
                <img
                  src={work.largeImageUrl}
                  alt={work.title}
                  className="w-full h-full object-cover rounded-lg"
                />
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full shadow-lg">
                  <FavoriteButton itemId={work.id} size="lg" />
                </div>
              </div>

              {/* 画像下の購入リンク */}
              <div className="mt-3">
                <Button
                  asChild
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold"
                >
                  <a
                    href={work.affiliateUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center space-x-2"
                  >
                    <span>この作品を今すぐ入手</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </Button>
              </div>
            </div>

            {/* 右側：作品情報 */}
            <div className="lg:w-1/2">
              <div className="space-y-6">
                {/* タイトルと評価 */}
                <Card>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <CardTitle className="text-2xl font-bold leading-tight flex-1">
                        [{work.id}][
                        {work.makers.length > 0
                          ? work.makers[0]?.name || ""
                          : ""}
                        ] {work.title}
                      </CardTitle>
                      <div className="shrink-0">
                        <FavoriteButton itemId={work.id} size="lg" />
                      </div>
                    </div>
                    {work.reviewCount && work.reviewAverageScore && (
                      <div className="flex items-center space-x-2 text-sm">
                        <div className="flex space-x-1">
                          <Star
                            className={`w-4 h-4 ${
                              ratingStars >= 1
                                ? "text-yellow-400 fill-current"
                                : "text-gray-300"
                            }`}
                          />
                          <Star
                            className={`w-4 h-4 ${
                              ratingStars >= 2
                                ? "text-yellow-400 fill-current"
                                : "text-gray-300"
                            }`}
                          />
                          <Star
                            className={`w-4 h-4 ${
                              ratingStars >= 3
                                ? "text-yellow-400 fill-current"
                                : "text-gray-300"
                            }`}
                          />
                          <Star
                            className={`w-4 h-4 ${
                              ratingStars >= 4
                                ? "text-yellow-400 fill-current"
                                : "text-gray-300"
                            }`}
                          />
                          <Star
                            className={`w-4 h-4 ${
                              ratingStars >= 5
                                ? "text-yellow-400 fill-current"
                                : "text-gray-300"
                            }`}
                          />
                        </div>
                        <span className="font-semibold">
                          {work.reviewAverageScore.toFixed(1)}
                        </span>
                        <span className="text-gray-500">
                          ({work.reviewCount}件のレビュー)
                        </span>
                      </div>
                    )}
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* 基本情報 */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-600">発売日:</span>
                        <span className="font-medium">
                          {formatDate(work.releaseDate)}
                        </span>
                      </div>

                      {work.volume && (
                        <div className="flex items-center space-x-2">
                          <Hash className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-600">ページ数:</span>
                          <span className="font-medium">
                            {work.volume}ページ
                          </span>
                        </div>
                      )}
                    </div>

                    <Separator />

                    {/* 制作者情報 */}
                    {work.makers.length > 0 && (
                      <div>
                        <h3 className="font-semibold text-gray-700 mb-2">
                          制作者
                        </h3>
                        <div className="space-y-2">
                          {work.makers.map((maker) => (
                            <div
                              key={maker.id}
                              className="flex items-center space-x-2"
                            >
                              <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                                {maker.name.charAt(0)}
                              </div>
                              <Link
                                href={urlObjectToString(
                                  pagesPath.doujinshi.makers
                                    ._makerId(maker.id)
                                    .$url(),
                                )}
                                className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                              >
                                {maker.name}
                              </Link>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <Separator />

                    {/* レビュー情報 */}
                    {work.reviewCount && work.reviewAverageScore && (
                      <div>
                        <h3 className="font-semibold text-gray-700 mb-2">
                          レビュー情報
                        </h3>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-600">レビュー数:</span>
                            <span>{work.reviewCount}件</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">平均評価:</span>
                            <span className="flex items-center space-x-1">
                              <Star className="w-4 h-4 text-yellow-400 fill-current" />
                              <span>{work.reviewAverageScore.toFixed(1)}</span>
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    <Separator />

                    {/* ジャンル */}
                    {work.genres.length > 0 && (
                      <div>
                        <h3 className="font-semibold text-gray-700 mb-2">
                          ジャンル・タグ
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {work.genres.map((genre) => (
                            <Link
                              key={genre.id}
                              href={urlObjectToString(
                                pagesPath.doujinshi.genres
                                  ._genreId(genre.id)
                                  .$url(),
                              )}
                            >
                              <Badge
                                variant="secondary"
                                className="hover:bg-gray-300 cursor-pointer transition-colors"
                              >
                                {genre.name}
                              </Badge>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* シリーズ */}
                    {work.series.length > 0 && (
                      <div>
                        <h3 className="font-semibold text-gray-700 mb-2">
                          シリーズ
                        </h3>
                        <div className="space-y-2">
                          {work.series.map((series) => (
                            <Link
                              key={series.id}
                              href={urlObjectToString(
                                pagesPath.doujinshi.series
                                  ._seriesId(series.id)
                                  .$url(),
                              )}
                            >
                              <Badge
                                variant="outline"
                                className="cursor-pointer hover:bg-gray-100 border-blue-300 text-blue-700"
                              >
                                📚 {series.name}
                              </Badge>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>

        {/* 試し読みセクション */}
        <div className="mb-12">
          {work.sampleLargeImages && work.sampleLargeImages.length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center space-x-2 mb-6">
                <Eye className="w-5 h-5" />
                <span className="text-lg font-semibold">
                  無料サンプル ({work.sampleLargeImages.length}枚)
                </span>
              </div>

              <div className="space-y-2">
                {work.sampleLargeImages
                  .sort((a, b) => a.order - b.order)
                  .map((image, index) => (
                    <div
                      key={`${work.id}-${image.order}`}
                      className="w-full relative"
                    >
                      <img
                        src={image.imageUrl}
                        alt={`${work.title} サンプル ${index + 1}`}
                        width={800}
                        height={600}
                        className="w-full h-auto rounded-lg border shadow-sm"
                        loading="lazy"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 800px"
                      />
                    </div>
                  ))}
              </div>

              {/* 試し読み後の購入誘導 */}
              <div className="mt-8">
                <Card className="bg-gradient-to-r from-red-50 to-pink-50 border-red-200">
                  <CardContent className="p-8 text-center">
                    <h3 className="text-3xl font-bold text-red-700 mb-4">
                      続きが気になる？今すぐ正規版をダウンロード！
                    </h3>

                    {/* キャンペーン情報を先に表示 */}
                    {discountRate > 0 && (
                      <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-lg mb-6 max-w-lg mx-auto">
                        <div className="flex items-center justify-center space-x-2 mb-2">
                          <span className="text-2xl">🎉</span>
                          <span className="text-xl font-bold">
                            限定キャンペーン開催中！
                          </span>
                        </div>
                        <div className="text-lg font-semibold">
                          定価{formatPrice(work.listPrice)}から{discountRate}
                          %OFF
                        </div>
                      </div>
                    )}

                    {/* 価格表示 */}
                    <Card className="bg-white border-red-200 mb-6 max-w-lg mx-auto shadow-lg">
                      <CardContent className="p-6">
                        <div className="space-y-3">
                          <div className="text-center">
                            <div className="text-2xl text-gray-600 font-medium mb-3">
                              FANZA価格
                            </div>
                            {discountRate > 0 ? (
                              <div className="space-y-2">
                                <div className="text-xl text-gray-400 line-through">
                                  {formatPrice(work.listPrice)}
                                </div>
                                <div className="text-4xl font-bold text-red-600">
                                  {formatPrice(work.price)}
                                </div>
                                <div className="text-lg text-green-600 font-semibold">
                                  {discountRate}%OFF
                                </div>
                              </div>
                            ) : (
                              <div className="text-4xl font-bold text-red-600">
                                {formatPrice(work.price)}
                              </div>
                            )}
                          </div>
                          <div className="text-sm text-gray-500 text-center">
                            ※価格はキャンペーン等により変動します。
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <div className="max-w-lg mx-auto">
                      <Button
                        size="lg"
                        asChild
                        className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold text-xl py-8"
                      >
                        <a
                          href={work.affiliateUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center space-x-3"
                        >
                          <Download className="w-7 h-7" />
                          <span>FANZA で今すぐ購入</span>
                          <ExternalLink className="w-6 h-6" />
                        </a>
                      </Button>

                      {/* 違法ダウンロード警告 */}
                      <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-700 text-center font-medium">
                          ⚠️ 違法サイト利用は危険です
                        </p>
                        <p className="text-xs text-red-600 text-center mt-1">
                          Torrent・割れサイトでの入手は著作権法違反で損害賠償請求のリスクがあります。正規サイトで購入しましょう！
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Eye className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">試し読み画像はありません</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* 同じ作者の作品セクション */}
        {sameAuthorWorks.length > 0 && (
          <div className="mb-12">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <span>同じ作者の作品</span>
                  <Badge variant="outline" className="text-xs">
                    {work.makers.length > 0 ? work.makers[0]?.name : ""}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <WorksList
                    works={sameAuthorWorks}
                    layout="grid"
                    emptyMessage="同じ作者の作品はありません"
                  />
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-4">
                      この作者の他の作品もチェックしてみましょう
                    </p>
                    <div className="flex flex-wrap justify-center gap-2">
                      {work.makers.map((maker) => (
                        <Link
                          key={maker.id}
                          href={urlObjectToString(
                            pagesPath.doujinshi.makers
                              ._makerId(maker.id)
                              .$url(),
                          )}
                          title={`${maker.name}の同人誌・エロ漫画作品一覧`}
                        >
                          <Button variant="outline" size="sm">
                            👤 {maker.name}の他の作品を見る
                          </Button>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* 関連作品セクション（シリーズがある場合のみ表示） */}
        {work.series.length > 0 && (
          <div className="mb-12">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <span>関連作品</span>
                  <Badge variant="outline" className="text-xs">
                    シリーズ作品
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {relatedWorks.length > 0 ? (
                  <div className="space-y-6">
                    <WorksList
                      works={relatedWorks}
                      layout="grid"
                      emptyMessage="関連作品はありません"
                    />
                    <div className="text-center">
                      <p className="text-sm text-gray-600 mb-4">
                        このシリーズの他の作品も見つけてみましょう
                      </p>
                      <div className="flex flex-wrap justify-center gap-2">
                        {work.series.map((series) => (
                          <Link
                            key={series.id}
                            href={urlObjectToString(
                              pagesPath.doujinshi.series
                                ._seriesId(series.id)
                                .$url(),
                            )}
                            title={`${series.name}シリーズの同人誌・エロ漫画作品一覧`}
                          >
                            <Button variant="outline" size="sm">
                              📚 {series.name}シリーズの他の作品
                            </Button>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-500 mb-4">
                      このシリーズの他の作品は現在登録されていません
                    </p>
                    <div className="flex flex-wrap justify-center gap-2">
                      {work.series.map((series) => (
                        <Link
                          key={series.id}
                          href={urlObjectToString(
                            pagesPath.doujinshi.series
                              ._seriesId(series.id)
                              .$url(),
                          )}
                        >
                          <Button variant="outline" size="sm">
                            📚 {series.name} シリーズページへ
                          </Button>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* 同じジャンルの作品セクション */}
        {sameGenreWorks.length > 0 && (
          <div className="mb-12">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <span>同じジャンルのおすすめ作品</span>
                  <Badge variant="outline" className="text-xs">
                    {work.genres
                      .slice(0, 2)
                      .map((g) => g.name)
                      .join("・")}{" "}
                    など
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <WorksList
                    works={sameGenreWorks}
                    layout="grid"
                    emptyMessage="同じジャンルの作品はありません"
                  />
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-4">
                      同じジャンルの他の作品もチェックしてみましょう
                    </p>
                    <div className="flex flex-wrap justify-center gap-2">
                      {work.genres.slice(0, 3).map((genre) => (
                        <Link
                          key={genre.id}
                          href={urlObjectToString(
                            pagesPath.doujinshi.genres
                              ._genreId(genre.id)
                              .$url(),
                          )}
                        >
                          <Button variant="outline" size="sm">
                            🏷️ {genre.name} ジャンルを見る
                          </Button>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
