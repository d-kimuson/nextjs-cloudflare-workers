import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Star,
  Download,
  Eye,
  Calendar,
  Hash,
  ExternalLink,
} from "lucide-react";
import { Badge } from "../../../../components/ui/badge";
import { Button } from "../../../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../../components/ui/card";
import { Separator } from "../../../../components/ui/separator";
import { Alert, AlertDescription } from "../../../../components/ui/alert";
import { pagesPath } from "../../../../lib/$path";
import { urlObjectToString } from "../../../../lib/path/urlObjectToString";
import { getWorkById } from "../../../../server/actions/works";

type WorkPageProps = {
  params: Promise<{
    workId: string;
  }>;
};

export default async function WorkPage({ params }: WorkPageProps) {
  const { workId } = await params;

  const work = await getWorkById(workId);

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

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* ヘッダー部分 */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* 左側：画像とアクション */}
            <div className="lg:w-1/2">
              {/* 画像上の購入リンク */}
              <div className="mb-3">
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

              <div className="relative">
                <img
                  src={work.largeImageUrl}
                  alt={work.title}
                  className="w-full h-auto"
                />
                {discountRate > 0 && (
                  <div className="absolute top-4 left-4">
                    <Badge
                      variant="destructive"
                      className="bg-red-500 text-white font-bold text-lg px-3 py-1"
                    >
                      {discountRate}% OFF
                    </Badge>
                  </div>
                )}
              </div>

              {/* 画像下の購入リンク */}
              <div className="mt-3">
                <Button
                  variant="outline"
                  asChild
                  className="w-full border-orange-300 text-orange-600 hover:bg-orange-50"
                >
                  <a
                    href={work.affiliateUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center space-x-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>FANZA で購入</span>
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
                    <CardTitle className="text-2xl font-bold leading-tight">
                      [{work.id}][
                      {work.makers.length > 0 ? work.makers[0]?.name || "" : ""}
                      ] {work.title}
                    </CardTitle>
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
                                    .$url()
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
                                  .$url()
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
                                  .$url()
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

                    <Separator />

                    {/* 価格・購入情報 */}
                    <div className="space-y-4">
                      {/* 価格表示 */}
                      <Card className="bg-blue-50 border-blue-200">
                        <CardContent className="p-4">
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600">FANZA価格:</span>
                              <span className="text-2xl font-bold text-blue-600">
                                {formatPrice(work.price)}
                              </span>
                            </div>
                            {discountRate > 0 && (
                              <div className="text-sm text-green-600">
                                定価{formatPrice(work.listPrice)}から
                                {discountRate}%OFF
                              </div>
                            )}
                            <div className="text-xs text-gray-500">
                              ※価格はキャンペーン等により変動します。
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* メイン購入ボタン */}
                      <Button
                        size="lg"
                        asChild
                        className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold text-lg py-6"
                      >
                        <a
                          href={work.affiliateUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center space-x-2"
                        >
                          <Download className="w-6 h-6" />
                          <span>FANZA で今すぐ購入</span>
                          <ExternalLink className="w-5 h-5" />
                        </a>
                      </Button>

                      {/* サブ購入ボタン */}
                      <Button
                        variant="outline"
                        size="lg"
                        asChild
                        className="w-full border-red-300 text-red-600 hover:bg-red-50"
                      >
                        <a
                          href={work.affiliateUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center space-x-2"
                        >
                          <span>正規版を {formatPrice(work.price)} で購入</span>
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </Button>
                    </div>
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
                    <div key={`${work.id}-${image.order}`} className="w-full">
                      <img
                        src={image.imageUrl}
                        alt={`${work.title} サンプル ${index + 1}`}
                        className="w-full h-auto rounded-lg border shadow-sm"
                      />
                    </div>
                  ))}
              </div>

              {/* 試し読み後の購入誘導 */}
              <div className="mt-8">
                <Card className="bg-gradient-to-r from-red-50 to-pink-50 border-red-200">
                  <CardContent className="p-6 text-center">
                    <h3 className="text-xl font-bold text-red-700 mb-3">
                      続きが気になる？今すぐ正規版をダウンロード！
                    </h3>
                    <p className="text-gray-600 mb-4">
                      安全・確実なFANZA公式サイトでご購入いただけます
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                      <Button
                        asChild
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold"
                      >
                        <a
                          href={work.affiliateUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center space-x-2"
                        >
                          <Download className="w-5 h-5" />
                          <span>{formatPrice(work.price)}で今すぐ購入</span>
                        </a>
                      </Button>
                    </div>
                    {discountRate > 0 && (
                      <p className="text-sm text-green-600 mt-2 font-semibold">
                        🎉 今なら{discountRate}%OFF！
                      </p>
                    )}
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

        {/* 関連作品セクション */}
        <div className="mb-12">
          <Card>
            <CardHeader>
              <CardTitle>関連作品</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <p className="text-gray-500">関連作品機能は準備中です</p>
                <p className="text-sm text-gray-400 mt-2">
                  同じ制作者の作品やシリーズ作品を表示予定です
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 違法ダウンロード警告 */}
        <div className="mt-12 space-y-4">
          <Alert className="border-red-300 bg-red-50">
            <AlertDescription className="text-center">
              <h3 className="font-bold text-red-700 text-lg mb-2">
                Torrentや違法サイトでの作品ダウンロードは犯罪です
              </h3>
              <p className="text-red-600 mb-3">
                これらの作品を購入せずTorrentや違法ダウンロードなどの手段で入手することは明確な犯罪行為です。
                作品を不正に入手した場合、販売者または権利者から著作権法違反で損害賠償請求を受ける場合があります。
              </p>
              <Button
                asChild
                className="bg-red-600 hover:bg-red-700 text-white font-bold"
              >
                <a
                  href={work.affiliateUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center space-x-2"
                >
                  <span>正規版を安全に購入</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              </Button>
            </AlertDescription>
          </Alert>

          <Alert className="border-gray-200 bg-gray-50">
            <AlertDescription className="text-center text-xs text-gray-500">
              <p className="mb-2">
                この作品の海賊版を正規ルート以外の方法で入手、所持した場合、作品の販売者または権利者より損害賠償請求が行われる場合があります。
                <br />
                販売元や行政機関より情報開示を求められた場合、プライバシーポリシーに定める範囲内でアクセス情報等を提供いたします。
              </p>
              <p className="mb-2">
                当サイトは主に違法ダウンロードを行うユーザーや違法であることを知らないユーザーに対し、正規の方法での購入を促すことを目的としたサイトです。
              </p>
              <p>
                ※当サイト掲載の画像やテキストは全て販売元の許可を得て引用・掲載しており、違法コンテンツや違法ダウンロードサイトへの誘導等はございません。
              </p>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    </div>
  );
}

export async function generateMetadata({ params }: WorkPageProps) {
  const { workId } = await params;

  const work = await getWorkById(workId);

  if (!work) {
    return {
      title: "作品が見つかりません",
    };
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("ja-JP", {
      style: "currency",
      currency: "JPY",
    }).format(price);
  };

  // RJ番号とサークル名を取得
  const rjCode = work.id; // work.idがRJ番号
  const makerName = work.makers.length > 0 ? work.makers[0]?.name || "" : "";

  // 違法サイト風のタイトル形式
  const title = `[${rjCode}][${makerName}] ${work.title}`;

  return {
    title: title,
    description: `${work.title}のダウンロード情報。価格${formatPrice(
      work.price
    )}${
      work.listPrice !== work.price
        ? `（定価${formatPrice(work.listPrice)}から${Math.round(
            ((work.listPrice - work.price) / work.listPrice) * 100
          )}%OFF）`
        : ""
    }。正規ダウンロード・安全な購入はこちらから。${
      work.reviewCount && work.reviewAverageScore
        ? `評価★${work.reviewAverageScore.toFixed(1)}（${work.reviewCount}件）`
        : ""
    }`,
    openGraph: {
      title: title,
      description: `${formatPrice(
        work.price
      )}で販売中。正規ダウンロード・購入はこちらから。`,
      images: [work.largeImageUrl],
    },
  };
}
