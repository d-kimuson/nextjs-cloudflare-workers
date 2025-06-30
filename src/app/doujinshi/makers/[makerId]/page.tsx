import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  StructuredData,
  generateMakerDetailSchemas,
} from "../../../../components/StructuredData";
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
import { honoClient } from "../../../../lib/api/client";
import { SITE_CONFIG } from "../../../../lib/constants/site";
import { urlObjectToString } from "../../../../lib/path/urlObjectToString";
import { generateMakerMetadata } from "../../../../lib/seo/metadata";
import { generateMakerBreadcrumbs } from "../../../../lib/utils/breadcrumb";
import { MakerPageClient } from "./MakerPageClient";

type MakerPageProps = {
  params: Promise<{
    makerId: string;
  }>;
  searchParams: Promise<{
    page?: string;
    limit?: string;
  }>;
};

export async function generateMetadata({
  params,
  searchParams,
}: MakerPageProps): Promise<Metadata> {
  const { makerId } = await params;
  const { page: pageParam } = await searchParams;

  const makerIdNumber = Number.parseInt(makerId, 10);
  const page = Number(pageParam) || 1;

  if (Number.isNaN(makerIdNumber)) {
    return {
      title: "作者が見つかりません | おかずNavi",
      description: "指定された作者は見つかりませんでした。",
    };
  }

  try {
    const [maker, worksResponse] = await Promise.all([
      honoClient.api.makers[":makerId"]
        .$get({
          param: { makerId: makerIdNumber.toString() },
        })
        .then(async (res) =>
          res.ok ? await res.json().then((body) => body.maker) : null,
        ),
      honoClient.api.makers[":makerId"].works
        .$get({
          param: { makerId: makerIdNumber.toString() },
          query: {},
        })
        .then(async (res) =>
          res.ok ? await res.json().then((body) => body) : null,
        ),
    ]);

    if (!maker || !worksResponse) {
      return {
        title: "作者が見つかりません | おかずNavi",
        description: "指定された作者は見つかりませんでした。",
      };
    }

    const totalWorks = worksResponse.pagination.totalItems;
    const hasNextPage = worksResponse.pagination.hasNextPage;

    return generateMakerMetadata(
      { ...maker, id: maker.id.toString() },
      totalWorks,
      page,
      hasNextPage,
    );
  } catch {
    return {
      title: "作者が見つかりません | おかずNavi",
      description: "指定された作者は見つかりませんでした。",
    };
  }
}

export default async function MakerPage({
  params,
  searchParams,
}: MakerPageProps) {
  const { makerId } = await params;
  const { page: pageParam, limit: limitParam } = await searchParams;

  const makerIdNumber = Number.parseInt(makerId, 10);
  const page = Number(pageParam) || 1;
  const limit = Number(limitParam) || 20;

  if (Number.isNaN(makerIdNumber)) {
    notFound();
  }

  // Validate pagination parameters
  if (page < 1 || limit < 1 || limit > 100) {
    const params = new URLSearchParams();
    if (limit >= 1 && limit <= 100) params.set("limit", limit.toString());
    const queryString = params.toString();
    redirect(
      `/doujinshi/makers/${makerId}${queryString ? `?${queryString}` : ""}`,
    );
  }

  const [maker, worksResponse] = await Promise.all([
    honoClient.api.makers[":makerId"]
      .$get({
        param: { makerId: makerIdNumber.toString() },
      })
      .then(async (res) =>
        res.ok ? await res.json().then((body) => body.maker) : null,
      ),
    honoClient.api.makers[":makerId"].works
      .$get({
        param: { makerId: makerIdNumber.toString() },
        query: { page: page.toString(), limit: limit.toString() },
      })
      .then(async (res) =>
        res.ok ? await res.json().then((body) => body) : null,
      ),
  ]);

  if (!maker || !worksResponse) {
    notFound();
  }

  const works = worksResponse.works;
  const pagination = worksResponse.pagination;

  // この作者の人気作品（上位3作品）を取得
  const popularWorks = await honoClient.api.makers[":makerId"].works
    .$get({
      param: { makerId: makerIdNumber.toString() },
      query: { limit: "3" },
    })
    .then(async (res) =>
      res.ok ? await res.json().then((body) => body.works ?? []) : [],
    );

  // この作者の作品から関連ジャンルを抽出（上位5ジャンル）
  const allGenres = works.flatMap((work) => work.genres);
  const genreCount = allGenres.reduce(
    (acc, genre) => {
      acc[genre.id] = (acc[genre.id] || 0) + 1;
      return acc;
    },
    {} as Record<number, number>,
  );

  const popularGenres = Object.entries(genreCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([genreId]) => {
      const genre = allGenres.find((g) => g.id === Number(genreId));
      return genre ? { ...genre, count: genreCount[Number(genreId)] } : null;
    })
    .filter((genre): genre is NonNullable<typeof genre> => genre !== null);

  // パンくずナビゲーション用のアイテム
  const breadcrumbItems = generateMakerBreadcrumbs(maker.name);

  // 構造化データの生成
  const pageUrl = `${SITE_CONFIG.url}/doujinshi/makers/${maker.id}`;
  const structuredDataSchemas = generateMakerDetailSchemas(
    maker,
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

        <div className="space-y-8">
          {/* 作者情報ヘッダー */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-3">
                <h1 className="text-3xl font-bold">{maker.name}</h1>
                <Badge variant="secondary" className="text-sm">
                  {pagination.totalItems}作品
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-gray-600">
                  {maker.name}さんの作品を{pagination.totalItems}
                  件掲載中です。人気作品から新着作品まで幅広くご紹介しています。
                </p>

                {/* 人気ジャンル */}
                {popularGenres.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-2">
                      この作者の得意ジャンル
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {popularGenres.map((genre) => (
                        <Link
                          key={genre.id}
                          href={urlObjectToString(
                            pagesPath.doujinshi.genres
                              ._genreId(genre.id)
                              .$url(),
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
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 人気作品セクション */}
          {popularWorks.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <span>{maker.name}さんの人気作品</span>
                  <Badge variant="outline" className="text-xs">
                    おすすめ
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <WorksList
                    works={popularWorks}
                    layout="grid"
                    emptyMessage="人気作品はありません"
                  />
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-4">
                      {maker.name}さんの他の作品もチェックしてみましょう
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Separator />

          {/* 作品一覧 */}
          <div>
            <h2 className="text-2xl font-semibold mb-6">全作品一覧</h2>
            <MakerPageClient
              works={works}
              pagination={{
                ...pagination,
              }}
              makerId={makerIdNumber}
              makerName={maker.name}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
