import { BookOpen, Tag, Users } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  StructuredData,
  generateSeriesDetailSchemas,
} from "../../../../components/StructuredData";
import { Alert, AlertDescription } from "../../../../components/ui/alert";
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
import { pagesPath } from "../../../../lib/$path";
import { honoClient } from "../../../../lib/api/client";
import { SITE_CONFIG } from "../../../../lib/constants/site";
import { urlObjectToString } from "../../../../lib/path/urlObjectToString";
import { generateSeriesMetadata } from "../../../../lib/seo/metadata";
import { generateSeriesBreadcrumbs } from "../../../../lib/utils/breadcrumb";
import { SeriesPageClient } from "./SeriesPageClient";

type SeriesPageProps = {
  params: Promise<{
    seriesId: string;
  }>;
  searchParams: Promise<{
    page?: string;
    limit?: string;
  }>;
};

export async function generateMetadata({
  params,
  searchParams,
}: SeriesPageProps): Promise<Metadata> {
  const { seriesId } = await params;
  const { page: pageParam } = await searchParams;

  const seriesIdNumber = Number.parseInt(seriesId, 10);
  const page = Number(pageParam) || 1;

  if (Number.isNaN(seriesIdNumber)) {
    return {
      title: "シリーズが見つかりません | おかずNavi",
      description: "指定されたシリーズは見つかりませんでした。",
    };
  }

  try {
    const [series, works] = await Promise.all([
      honoClient.api.series[":seriesId"]
        .$get({
          param: { seriesId: seriesIdNumber.toString() },
        })
        .then(async (res) =>
          res.ok ? await res.json().then((body) => body.series) : null,
        ),
      honoClient.api.series[":seriesId"].works
        .$get({
          param: { seriesId: seriesIdNumber.toString() },
        })
        .then(async (res) =>
          res.ok ? await res.json().then((body) => body.works) : [],
        ),
    ]);

    if (!series) {
      return {
        title: "シリーズが見つかりません | おかずNavi",
        description: "指定されたシリーズは見つかりませんでした。",
      };
    }

    const totalWorks = works?.length ?? 0;

    return generateSeriesMetadata(
      { ...series, id: series.id.toString() },
      totalWorks,
      page,
      false, // Series pages are not paginated based on the current implementation
    );
  } catch {
    return {
      title: "シリーズが見つかりません | おかずNavi",
      description: "指定されたシリーズは見つかりませんでした。",
    };
  }
}

export default async function SeriesPage({
  params,
  searchParams,
}: SeriesPageProps) {
  const { seriesId } = await params;
  const { page: pageParam, limit: limitParam } = await searchParams;

  const seriesIdNumber = Number.parseInt(seriesId, 10);
  const page = Number(pageParam) || 1;
  const limit = Number(limitParam) || 20;

  if (Number.isNaN(seriesIdNumber)) {
    notFound();
  }

  // Validate pagination parameters
  if (page < 1 || limit < 1 || limit > 100) {
    const params = new URLSearchParams();
    if (limit >= 1 && limit <= 100) params.set("limit", limit.toString());
    const queryString = params.toString();
    redirect(
      `/doujinshi/series/${seriesId}${queryString ? `?${queryString}` : ""}`,
    );
  }

  const [series, works] = await Promise.all([
    honoClient.api.series[":seriesId"]
      .$get({
        param: { seriesId: seriesIdNumber.toString() },
      })
      .then(async (res) =>
        res.ok ? await res.json().then((body) => body.series) : null,
      ),
    honoClient.api.series[":seriesId"].works
      .$get({
        param: { seriesId: seriesIdNumber.toString() },
      })
      .then(async (res) =>
        res.ok ? await res.json().then((body) => body.works) : [],
      ),
  ]);

  if (!series) {
    notFound();
  }

  // このシリーズの作者情報を抽出
  const makerCount = (works || []).reduce(
    (acc, work) => {
      for (const maker of work.makers) {
        acc[maker.id] = {
          ...maker,
          count: (acc[maker.id]?.count || 0) + 1,
        };
      }
      return acc;
    },
    {} as Record<number, { id: number; name: string; count: number }>,
  );

  const seriesMakers = Object.values(makerCount).sort(
    (a, b) => b.count - a.count,
  );

  // このシリーズの人気ジャンルを抽出
  const genreCount = (works || []).reduce(
    (acc, work) => {
      for (const genre of work.genres) {
        acc[genre.id] = {
          ...genre,
          count: (acc[genre.id]?.count || 0) + 1,
        };
      }
      return acc;
    },
    {} as Record<number, { id: number; name: string; count: number }>,
  );

  const popularGenres = Object.values(genreCount)
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  // パンくずナビゲーション用のアイテム
  const breadcrumbItems = generateSeriesBreadcrumbs(series.name);

  // 構造化データの生成
  const pageUrl = `${SITE_CONFIG.url}/doujinshi/series/${series.id}`;
  const structuredDataSchemas = generateSeriesDetailSchemas(
    series,
    works?.length ?? 0,
    breadcrumbItems,
    pageUrl,
  );

  return (
    <div className="min-h-screen bg-background">
      {/* 構造化データ */}
      <StructuredData data={structuredDataSchemas} />

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Breadcrumb items={breadcrumbItems} className="mb-6" />

        {/* ヘッダー部分 */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <BookOpen className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">{series.name}</h1>
            <Badge variant="secondary" className="text-sm">
              {works?.length ?? 0}作品
            </Badge>
          </div>
          <p className="text-muted-foreground">
            「{series.name}」シリーズの作品一覧です。
          </p>
        </div>

        <Separator className="mb-8" />

        {/* シリーズ情報 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* 作者情報 */}
          {seriesMakers.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-primary" />
                  <span>シリーズ作者</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {seriesMakers.map((maker) => (
                    <div key={maker.id} className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                        {maker.name.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <Link
                          href={urlObjectToString(
                            pagesPath.doujinshi.makers
                              ._makerId(maker.id)
                              .$url(),
                          )}
                          className="font-medium text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          {maker.name}
                        </Link>
                        <p className="text-sm text-gray-500">
                          このシリーズで{maker.count}作品
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* ジャンル情報 */}
          {popularGenres.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Tag className="h-5 w-5 text-primary" />
                  <span>シリーズのジャンル</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {popularGenres.map((genre) => (
                    <Link
                      key={genre.id}
                      href={urlObjectToString(
                        pagesPath.doujinshi.genres._genreId(genre.id).$url(),
                      )}
                    >
                      <Badge
                        variant="outline"
                        className="cursor-pointer hover:bg-gray-100 text-sm"
                      >
                        {genre.name} ({genre.count}作品)
                      </Badge>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <Separator className="mb-8" />

        {/* 作品一覧 */}
        <div>
          <h2 className="text-2xl font-semibold mb-6">
            「{series.name}」シリーズの作品一覧
          </h2>
          <SeriesPageClient
            works={works}
            pagination={{
              currentPage: page,
              itemsPerPage: limit,
              hasNextPage: false,
              hasPreviousPage: false,
              totalItems: works?.length ?? 0,
              totalPages: 1,
            }}
            seriesId={seriesIdNumber}
            seriesName={series.name}
          />
        </div>

        {/* フッター注意書き */}
        <div className="mt-12 text-center">
          <Alert className="border-gray-200 bg-gray-50">
            <AlertDescription>
              ⚠️
              この作品の著作権は制作者に帰属します。正規の販売サイトからのみご購入ください。
            </AlertDescription>
          </Alert>
        </div>
      </div>
    </div>
  );
}
