import { Tag, Users } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  StructuredData,
  generateGenreDetailSchemas,
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
import { generateGenreMetadata } from "../../../../lib/seo/metadata";
import { generateGenreBreadcrumbs } from "../../../../lib/utils/breadcrumb";
import { GenrePageClient } from "./GenrePageClient";

type GenrePageProps = {
  params: Promise<{
    genreId: string;
  }>;
  searchParams: Promise<{
    page?: string;
    limit?: string;
  }>;
};

export async function generateMetadata({
  params,
  searchParams,
}: GenrePageProps): Promise<Metadata> {
  const { genreId } = await params;
  const { page: pageParam } = await searchParams;

  const genreIdNumber = Number.parseInt(genreId, 10);
  const page = Number(pageParam) || 1;

  if (Number.isNaN(genreIdNumber)) {
    return {
      title: "ジャンルが見つかりません | おかずNavi",
      description: "指定されたジャンルは見つかりませんでした。",
    };
  }

  try {
    const [genre, worksResponse] = await Promise.all([
      honoClient.api.genres[":genreId"]
        .$get({
          param: { genreId: genreIdNumber.toString() },
        })
        .then(async (res) =>
          res.ok ? await res.json().then((body) => body.genre) : null,
        ),
      honoClient.api.genres[":genreId"].works
        .$get({
          param: { genreId: genreIdNumber.toString() },
          query: {},
        })
        .then(async (res) =>
          res.ok ? await res.json().then((body) => body) : null,
        ),
    ]);

    if (!genre || !worksResponse) {
      return {
        title: "ジャンルが見つかりません | おかずNavi",
        description: "指定されたジャンルは見つかりませんでした。",
      };
    }

    const totalWorks = worksResponse.pagination.totalItems;
    const hasNextPage = worksResponse.pagination.hasNextPage;

    return generateGenreMetadata(
      { ...genre, id: genre.id.toString() },
      totalWorks,
      page,
      hasNextPage,
    );
  } catch {
    return {
      title: "ジャンルが見つかりません | おかずNavi",
      description: "指定されたジャンルは見つかりませんでした。",
    };
  }
}

export default async function GenrePage({
  params,
  searchParams,
}: GenrePageProps) {
  const { genreId } = await params;
  const { page: pageParam, limit: limitParam } = await searchParams;

  const genreIdNumber = Number.parseInt(genreId, 10);
  const page = Number(pageParam) || 1;
  const limit = Number(limitParam) || 20;

  if (Number.isNaN(genreIdNumber)) {
    notFound();
  }

  // Validate pagination parameters
  if (page < 1 || limit < 1 || limit > 100) {
    const params = new URLSearchParams();
    if (limit >= 1 && limit <= 100) params.set("limit", limit.toString());
    const queryString = params.toString();
    redirect(
      `/doujinshi/genres/${genreId}${queryString ? `?${queryString}` : ""}`,
    );
  }

  const [genre, worksResponse] = await Promise.all([
    honoClient.api.genres[":genreId"]
      .$get({
        param: { genreId: genreIdNumber.toString() },
      })
      .then(async (res) =>
        res.ok ? await res.json().then((body) => body.genre) : null,
      ),
    honoClient.api.genres[":genreId"].works
      .$get({
        param: { genreId: genreIdNumber.toString() },
        query: {},
      })
      .then(async (res) =>
        res.ok ? await res.json().then((body) => body) : null,
      ),
  ]);

  if (!genre) {
    notFound();
  }

  const works = worksResponse?.works ?? [];
  const pagination = worksResponse?.pagination ?? {
    page: 1,
    limit: 20,
    totalItems: 0,
    totalPages: 0,
  };

  // このジャンルの人気作者を抽出（上位5作者）
  const makerCount = works.reduce(
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

  const topMakers = Object.values(makerCount)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // 関連ジャンルを取得（現在のジャンルと一緒に出現するジャンル）
  const relatedGenres = works
    .flatMap((work) => work.genres)
    .filter((g) => g.id !== genreIdNumber)
    .reduce(
      (acc, relatedGenre) => {
        acc[relatedGenre.id] = {
          ...relatedGenre,
          count: (acc[relatedGenre.id]?.count || 0) + 1,
        };
        return acc;
      },
      {} as Record<number, { id: number; name: string; count: number }>,
    );

  const popularRelatedGenres = Object.values(relatedGenres)
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  // パンくずナビゲーション用のアイテム
  const breadcrumbItems = generateGenreBreadcrumbs(genre.name);

  // 構造化データの生成
  const pageUrl = `${SITE_CONFIG.url}/doujinshi/genres/${genre.id}`;
  const structuredDataSchemas = generateGenreDetailSchemas(
    genre,
    pagination.totalItems,
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
            <Tag className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">{genre.name}</h1>
            <Badge variant="secondary" className="text-sm">
              {pagination.totalItems}件の作品
            </Badge>
          </div>
          <p className="text-muted-foreground">
            「{genre.name}」ジャンルの作品一覧です。
          </p>
        </div>

        <Separator className="mb-8" />

        {/* 人気作者セクション */}
        {topMakers.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-6 w-6 text-primary" />
                <span>「{genre.name}」ジャンルの人気作者</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {topMakers.map((maker) => (
                    <div
                      key={maker.id}
                      className="p-4 border rounded-lg hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
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
                            {maker.count}作品
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="text-center pt-4">
                  <p className="text-sm text-gray-600 mb-2">
                    これらの作者の他の作品もチェックしてみましょう
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 関連ジャンルセクション */}
        {popularRelatedGenres.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Tag className="h-5 w-5 text-primary" />
                <span>「{genre.name}」と一緒に楽しまれるジャンル</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {popularRelatedGenres.map((relatedGenre) => (
                    <Link
                      key={relatedGenre.id}
                      href={urlObjectToString(
                        pagesPath.doujinshi.genres
                          ._genreId(relatedGenre.id)
                          .$url(),
                      )}
                    >
                      <Badge
                        variant="outline"
                        className="cursor-pointer hover:bg-gray-100 text-sm py-2 px-3"
                      >
                        {relatedGenre.name} ({relatedGenre.count}作品)
                      </Badge>
                    </Link>
                  ))}
                </div>
                <div className="text-center pt-2">
                  <p className="text-sm text-gray-600">
                    これらのジャンルもおすすめです
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Separator className="mb-8" />

        {/* 作品一覧 */}
        <div>
          <h2 className="text-2xl font-semibold mb-6">
            「{genre.name}」の作品一覧
          </h2>
          <GenrePageClient
            works={works}
            genreId={genreIdNumber}
            genreName={genre.name}
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
